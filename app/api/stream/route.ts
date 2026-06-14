import { NextRequest, NextResponse } from "next/server";
import { proxiedStreamUrl } from "@/lib/stream-url";
import { isValidStreamUrl } from "@/lib/security";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function inferContentType(url: string): string {
  if (/\.m3u8(?:[?#]|$)/i.test(url)) return "application/vnd.apple.mpegurl";
  if (/\.ts(?:[?#]|$)/i.test(url)) return "video/mp2t";
  if (/\.m4s(?:[?#]|$)/i.test(url)) return "video/iso.segment";
  if (/\.mp4(?:[?#]|$)/i.test(url)) return "video/mp4";
  if (/\.aac(?:[?#]|$)/i.test(url)) return "audio/aac";
  return "application/octet-stream";
}

function isPlaylistResponse(url: string, contentType: string): boolean {
  return (
    /\.m3u8(?:[?#]|$)/i.test(url) ||
    contentType.includes("mpegurl") ||
    contentType.includes("application/vnd.apple.mpegurl")
  );
}

function rewriteUri(uri: string, baseUrl: string): string {
  try {
    return proxiedStreamUrl(new URL(uri, baseUrl).toString());
  } catch {
    return uri;
  }
}

function rewriteManifest(manifest: string, baseUrl: string): string {
  return manifest
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return line;
      }

      if (trimmed.startsWith("#")) {
        return line.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
          return `URI="${rewriteUri(uri, baseUrl)}"`;
        });
      }

      return rewriteUri(trimmed, baseUrl);
    })
    .join("\n");
}

function copyResponseHeaders(upstream: Response, fallbackContentType: string): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
    "Content-Type": upstream.headers.get("content-type") ?? fallbackContentType
  });

  for (const key of ["accept-ranges", "content-length", "content-range"]) {
    const value = upstream.headers.get(key);
    if (value) {
      headers.set(key, value);
    }
  }

  return headers;
}

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url");

  if (!targetUrl || !isValidStreamUrl(targetUrl)) {
    return NextResponse.json({ error: "Invalid stream URL" }, { status: 400 });
  }

  const requestHeaders = new Headers({
    Accept: request.headers.get("accept") ?? "*/*",
    "User-Agent": request.headers.get("user-agent") ?? "LiveTV/1.0"
  });
  const range = request.headers.get("range");

  if (range) {
    requestHeaders.set("Range", range);
  }

  try {
    const upstream = await fetch(targetUrl, {
      cache: "no-store",
      headers: requestHeaders,
      redirect: "follow"
    });
    const fallbackContentType = inferContentType(targetUrl);
    const contentType = upstream.headers.get("content-type") ?? fallbackContentType;

    if (!upstream.ok && upstream.status !== 206) {
      logger.warn("Stream proxy upstream failed", {
        status: upstream.status,
        targetUrl
      });
      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: copyResponseHeaders(upstream, fallbackContentType)
      });
    }

    if (isPlaylistResponse(targetUrl, contentType)) {
      const manifest = await upstream.text();
      return new NextResponse(rewriteManifest(manifest, targetUrl), {
        status: upstream.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
          "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8"
        }
      });
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: copyResponseHeaders(upstream, fallbackContentType)
    });
  } catch (error) {
    logger.error("Stream proxy request failed", error, { targetUrl });
    return NextResponse.json({ error: "Stream proxy request failed" }, { status: 502 });
  }
}
