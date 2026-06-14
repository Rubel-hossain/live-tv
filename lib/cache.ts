import { logger } from "./logger";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.defaultTTL = defaultTTL;
    
    // Clean up expired entries periodically without keeping Node processes open.
    const cleanupTimer = setInterval(() => this.cleanup(), 60 * 1000);
    cleanupTimer.unref?.();
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL
    };
    
    this.cache.set(key, entry);
    logger.debug("Cache set", { key, ttl: entry.ttl });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > entry.ttl) {
      this.cache.delete(key);
      logger.debug("Cache expired", { key, age });
      return null;
    }
    
    logger.debug("Cache hit", { key, age });
    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
    logger.debug("Cache deleted", { key });
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.debug("Cache cleared", { size });
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug("Cache cleanup", { cleaned, remaining: this.cache.size });
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const cache = new MemoryCache();

// Cache keys
export const CACHE_KEYS = {
  PLAYLIST: "playlist",
  CHANNELS: "channels",
  FAVORITES: "favorites",
  RECENTS: "recents"
} as const;
