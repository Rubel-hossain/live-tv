import { promises as fs } from "fs";
import path from "path";
import type { Channel } from "./types";
import { cleanName, hash } from "./channel-utils";
import { inferCountry, inferGroup, inferQuality } from "./channel-inference";
import { config } from "./config";
import { logger } from "./logger";
import { isValidStreamUrl } from "./security";
import { cache, CACHE_KEYS } from "./cache";

type PlaylistCacheEntry = {
  modifiedAtMs: number;
  channels: Channel[];
};

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

export async function getPlaylist(): Promise<Channel[]> {
  try {
    const playlistPath = path.join(process.cwd(), config.playlistFile);
    const playlistStats = await fs.stat(playlistPath);
    const cachedPlaylist = cache.get<PlaylistCacheEntry>(CACHE_KEYS.CHANNELS);

    if (cachedPlaylist && cachedPlaylist.modifiedAtMs === playlistStats.mtimeMs) {
      logger.info("Returning cached channels", { count: cachedPlaylist.channels.length });
      return cachedPlaylist.channels;
    }

    const playlist = await fs.readFile(playlistPath, "utf8");
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

      // Validate URL security
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
      
      // Parse URL (already validated above)
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

    // Cache the parsed result until the playlist file changes.
    cache.set(
      CACHE_KEYS.CHANNELS,
      {
        modifiedAtMs: playlistStats.mtimeMs,
        channels
      },
      10 * 60 * 1000
    );
    logger.info("Parsed and cached channels", { count: channels.length });
    
    return channels;
  } catch (error) {
    logger.error("Failed to parse playlist", error);
    throw new Error(
      `Could not load playlist file "${config.playlistFile}". Please ensure it exists in the project root.`
    );
  }
}
