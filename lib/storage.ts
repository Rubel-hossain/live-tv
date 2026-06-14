import type { StorageKey } from "./types";

/**
 * Safely read a list from localStorage
 */
export function readList(key: StorageKey): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch (error) {
    console.error(`Failed to read from localStorage key "${key}":`, error);
    return [];
  }
}

/**
 * Safely write a list to localStorage
 */
export function writeList(key: StorageKey, value: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const uniqueValues = Array.from(new Set(value.filter((item) => typeof item === "string")));
    window.localStorage.setItem(key, JSON.stringify(uniqueValues));
  } catch (error) {
    console.error(`Failed to write to localStorage key "${key}":`, error);
  }
}

/**
 * Clear a specific key from localStorage
 */
export function clearList(key: StorageKey): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear localStorage key "${key}":`, error);
  }
}
