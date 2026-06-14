import { config } from "./config";

export function proxiedStreamUrl(url: string): string {
  return `/api/stream?url=${encodeURIComponent(url)}`;
}

export function shouldProxyStream(url: string, pageProtocol?: string): boolean {
  if (config.streamProxyMode === "always") {
    return true;
  }

  if (config.streamProxyMode === "never") {
    return false;
  }

  return pageProtocol === "https:" && url.startsWith("http:");
}

export function playbackUrl(url: string, pageProtocol?: string): string {
  return shouldProxyStream(url, pageProtocol) ? proxiedStreamUrl(url) : url;
}
