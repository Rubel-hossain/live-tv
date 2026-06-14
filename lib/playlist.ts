import type { Channel } from "./types";
import { cleanName, hash } from "./channel-utils";
import { inferCountry, inferGroup, inferQuality } from "./channel-inference";
import { config } from "./config";
import { logger } from "./logger";
import { isValidStreamUrl } from "./security";
import { cache, CACHE_KEYS } from "./cache";

type PlaylistCacheEntry = {
  sourceKey: string;
  fingerprint: string;
  channels: Channel[];
};

function getPlaylistUrl(): string | undefined {
  const value = process.env.PLAYLIST_URL?.trim();
  return value ? value : undefined;
}

function parseAttributes(value: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([\w-]+)="([^"]*)"/g;
  let match = pattern.exec(value);

  while (match) {
    attributes[match[1]] = match[2];
    match = pattern.exec(value);
  }

  return attributes;
}

function parsePlaylistContent(playlist: string): Channel[] {
  const lines = playlist
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const channels: Channel[] = [];
  let currentInfo: string | undefined;

  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      currentInfo = line;
      continue;
    }

    if (line.startsWith("#")) {
      continue;
    }

    if (!currentInfo || !/^https?:\/\//i.test(line)) {
      continue;
    }

    if (!isValidStreamUrl(line)) {
      logger.warn("Skipping invalid stream URL", { url: line });
      currentInfo = undefined;
      continue;
    }

    const metadata = currentInfo.replace(/^#EXTINF:-?\d+\s*/i, "");
    const attributes = parseAttributes(metadata);
    const [, fallbackName = "Untitled channel"] = metadata.match(/,(.*)$/) ?? [];
    const name = cleanName(attributes["tvg-name"] || fallbackName);
    const group = inferGroup(name, attributes["group-title"]);
    const url = line;
    const logo = attributes["tvg-logo"];
    const safeLogo = logo && isValidStreamUrl(logo) ? logo : undefined;
    const parsedUrl = new URL(url);

    channels.push({
      id: `${hash(`${name}-${url}`)}-${channels.length + 1}`,
      number: channels.length + 1,
      name,
      url,
      group,
      country: inferCountry(name),
      quality: inferQuality(name, url),
      logo: safeLogo,
      host: parsedUrl.hostname.replace(/^www\./, "")
    });

    currentInfo = undefined;
  }

  return channels;
}

function getCachedChannels(sourceKey: string, fingerprint: string): Channel[] | null {
  const cachedPlaylist = cache.get<PlaylistCacheEntry>(CACHE_KEYS.CHANNELS);
  if (!cachedPlaylist) {
    return null;
  }

  if (cachedPlaylist.sourceKey !== sourceKey || cachedPlaylist.fingerprint !== fingerprint) {
    return null;
  }

  logger.info("Returning cached channels", { count: cachedPlaylist.channels.length, sourceKey });
  return cachedPlaylist.channels;
}

function cacheChannels(sourceKey: string, fingerprint: string, channels: Channel[]): Channel[] {
  cache.set(
    CACHE_KEYS.CHANNELS,
    {
      sourceKey,
      fingerprint,
      channels
    },
    10 * 60 * 1000
  );

  logger.info("Parsed and cached channels", { count: channels.length, sourceKey });
  return channels;
}

async function getRemotePlaylist(): Promise<Channel[]> {
  const sourceUrl = getPlaylistUrl();
  if (!sourceUrl) {
    throw new Error("Remote playlist URL is not configured.");
  }

  const response = await fetch(sourceUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/x-mpegURL, application/vnd.apple.mpegurl, text/plain, */*"
    }
  });

  if (!response.ok) {
    throw new Error(`Remote playlist request failed with status ${response.status}.`);
  }

  const playlist = await response.text();
  const eTag = response.headers.get("etag");
  const lastModified = response.headers.get("last-modified");
  const fingerprint = eTag || lastModified || hash(playlist);
  const sourceKey = `url:${sourceUrl}`;
  const cachedChannels = getCachedChannels(sourceKey, fingerprint);

  if (cachedChannels) {
    return cachedChannels;
  }

  return cacheChannels(sourceKey, fingerprint, parsePlaylistContent(playlist));
}

async function getLocalPlaylist(): Promise<Channel[]> {
  const [{ readFile, stat }, pathModule] = await Promise.all([
    import("node:fs/promises"),
    import("node:path")
  ]);
  const playlistPath = pathModule.join(process.cwd(), config.playlistFile);
  const playlistStats = await stat(playlistPath);
  const fingerprint = playlistStats.mtimeMs.toString();
  const sourceKey = `file:${config.playlistFile}`;
  const cachedChannels = getCachedChannels(sourceKey, fingerprint);

  if (cachedChannels) {
    return cachedChannels;
  }

  const playlist = await readFile(playlistPath, "utf8");
  return cacheChannels(sourceKey, fingerprint, parsePlaylistContent(playlist));
}

export async function getPlaylist(): Promise<Channel[]> {
  const playlistUrl = getPlaylistUrl();

  try {
    return playlistUrl ? await getRemotePlaylist() : await getLocalPlaylist();
  } catch (error) {
    logger.error("Failed to parse playlist", error, {
      source: playlistUrl ? "url" : "file"
    });
    const sourceDescription = playlistUrl
      ? `playlist URL "${playlistUrl}"`
      : `playlist file "${config.playlistFile}"`;
    throw new Error(`Could not load ${sourceDescription}.`);
  }
}
