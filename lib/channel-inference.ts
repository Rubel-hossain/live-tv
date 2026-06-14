import { COUNTRY_PATTERNS, GROUP_PATTERNS } from "./constants";

/**
 * Infer country from channel name
 */
export function inferCountry(name: string): string | undefined {
  const match = COUNTRY_PATTERNS.find(([pattern]) => pattern.test(name));
  return match?.[1];
}

/**
 * Infer group from channel name and group title
 */
export function inferGroup(name: string, groupTitle?: string): string {
  if (groupTitle?.trim()) {
    return groupTitle.trim();
  }

  const match = GROUP_PATTERNS.find(([pattern]) => pattern.test(name));
  return match?.[1] ?? "Live Sports";
}

/**
 * Infer quality from channel name and URL
 */
export function inferQuality(name: string, url: string): string {
  const qualityMatch = name.match(/\b(4K|1080p|720p|480p|HD|SD)\b/i);
  if (qualityMatch) {
    return qualityMatch[1].toUpperCase();
  }

  if (/1080/i.test(url)) return "1080P";
  if (/720/i.test(url)) return "720P";
  if (/mpegts/i.test(url)) return "MPEGTS";

  return "LIVE";
}
