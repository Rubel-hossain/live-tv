type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

function currentLogLevel(): LogLevel {
  const value = process.env.NEXT_PUBLIC_LOG_LEVEL;
  return value === "debug" || value === "info" || value === "warn" || value === "error"
    ? value
    : "info";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel()];
}

function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `${prefix} ${message}${contextStr}`;
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog("debug")) {
      console.log(formatMessage("debug", message, context));
    }
  },
  
  info: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog("info")) {
      console.info(formatMessage("info", message, context));
    }
  },
  
  warn: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", message, context));
    }
  },
  
  error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
    if (shouldLog("error")) {
      console.error(formatMessage("error", message, context), error);
    }
  }
};

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace?.(this, this.constructor);
  }
}
