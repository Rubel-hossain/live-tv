import { logger } from "./logger";

function isBlockedProductionHostname(hostname: string): boolean {
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return true;
  }

  const blockedPatterns = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\.0\.0\.0$/,
    /^::1$/i,
    /^::ffff:(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|0\.0\.0\.0$)/i,
    /^(fc|fd)[0-9a-f:]*$/i,
    /^fe[89ab][0-9a-f:]*$/i
  ];

  return blockedPatterns.some((pattern) => pattern.test(hostname));
}

/**
 * Validate if a URL is safe for streaming
 */
export function isValidStreamUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      logger.warn("Invalid URL protocol", { url, protocol: parsed.protocol });
      return false;
    }
    
    // Block localhost and private IPs in production
    if (process.env.NODE_ENV === "production") {
      const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

      if (isBlockedProductionHostname(hostname)) {
        logger.warn("Blocked private or loopback URL in production", { hostname });
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logger.error("URL validation failed", error, { url });
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .trim();
}

/**
 * Validate channel name
 */
export function isValidChannelName(name: string): boolean {
  if (!name || name.length > 200) {
    return false;
  }
  
  // Check for potentially dangerous characters
  const dangerousChars = /[<>\"'{}]/;
  if (dangerousChars.test(name)) {
    return false;
  }
  
  return true;
}

/**
 * Rate limiting tracker (simple in-memory implementation)
 * In production, use Redis or similar
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;
  
  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Clean up old entries periodically without keeping Node processes open.
    const cleanupTimer = setInterval(() => this.cleanup(), this.windowMs);
    cleanupTimer.unref?.();
  }
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    
    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (validTimestamps.length >= this.maxRequests) {
      logger.warn("Rate limit exceeded", { identifier, count: validTimestamps.length });
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);
    return true;
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();
