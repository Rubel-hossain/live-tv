/**
 * Generate initials from channel name.
 */
export function channelInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "TV";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/**
 * Generate a consistent accent index based on string hash.
 */
export function accentIndex(value: string): number {
  let sum = 0;
  for (const char of value) {
    sum += char.charCodeAt(0);
  }
  return (sum % 6) + 1;
}

/**
 * Format current time as a label.
 */
export function nowLabel(): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());
}

/**
 * Generate a simple hash from a string.
 */
export function hash(value: string): string {
  let current = 0;

  for (let index = 0; index < value.length; index += 1) {
    current = (current << 5) - current + value.charCodeAt(index);
    current |= 0;
  }

  return Math.abs(current).toString(36);
}

/**
 * Clean channel name by removing common playlist badges and spacing artifacts.
 */
export function cleanName(value: string): string {
  return value
    .replace(
      /^(?:[\u2713\u2714]\uFE0F?|\u00e2\u0153[\u201c\u201d]\u00ef\u00b8\u008f)\s*/iu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}
