import { logger } from "./logger";

type Config = {
  playlistFile: string;
  appName: string;
  appVersion: string;
  logLevel: "debug" | "info" | "warn" | "error";
  maxRecentChannels: number;
  playerChromeHideDelay: number;
  enableFavorites: boolean;
  enableRecents: boolean;
  streamProxyMode: "auto" | "always" | "never";
};

function getEnvVar(key: string, defaultValue?: string): string {
  const value = typeof process === "undefined" ? undefined : process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = typeof process === "undefined" ? undefined : process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value === "true" || value === "1";
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = typeof process === "undefined" ? undefined : process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    logger.warn(`Invalid number value for ${key}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return num;
}

function getEnvChoice<T extends string>(key: string, choices: readonly T[], defaultValue: T): T {
  const value = typeof process === "undefined" ? undefined : process.env[key];
  if (choices.includes(value as T)) {
    return value as T;
  }
  return defaultValue;
}

export const config: Config = {
  playlistFile: getEnvVar("PLAYLIST_FILE", "Fifa world cup.m3u"),
  appName: getEnvVar("NEXT_PUBLIC_APP_NAME", "LiveTV"),
  appVersion: getEnvVar("NEXT_PUBLIC_APP_VERSION", "1.0.0"),
  logLevel: (getEnvVar("NEXT_PUBLIC_LOG_LEVEL", "info") as Config["logLevel"]),
  maxRecentChannels: getEnvNumber("NEXT_PUBLIC_MAX_RECENT_CHANNELS", 12),
  playerChromeHideDelay: getEnvNumber("NEXT_PUBLIC_PLAYER_CHROME_HIDE_DELAY", 2600),
  enableFavorites: getEnvBoolean("NEXT_PUBLIC_ENABLE_FAVORITES", true),
  enableRecents: getEnvBoolean("NEXT_PUBLIC_ENABLE_RECENTS", true),
  streamProxyMode: getEnvChoice("NEXT_PUBLIC_STREAM_PROXY_MODE", ["auto", "always", "never"], "auto")
};

// Validate configuration on startup
export function validateConfig(): void {
  try {
    if (config.maxRecentChannels < 1 || config.maxRecentChannels > 100) {
      throw new Error("MAX_RECENT_CHANNELS must be between 1 and 100");
    }
    
    if (config.playerChromeHideDelay < 1000 || config.playerChromeHideDelay > 10000) {
      throw new Error("PLAYER_CHROME_HIDE_DELAY must be between 1000 and 10000");
    }
    
    const validLogLevels = ["debug", "info", "warn", "error"];
    if (!validLogLevels.includes(config.logLevel)) {
      throw new Error(`LOG_LEVEL must be one of: ${validLogLevels.join(", ")}`);
    }
    
    logger.info("Configuration validated successfully", config);
  } catch (error) {
    logger.error("Configuration validation failed", error);
    throw error;
  }
}
