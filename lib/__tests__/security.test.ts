import { isValidChannelName, isValidStreamUrl, sanitizeInput } from "../security";

describe('security', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('isValidStreamUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      expect(isValidStreamUrl('https://example.com/stream.m3u8')).toBe(true);
    });

    it('should accept valid HTTP URLs', () => {
      expect(isValidStreamUrl('http://example.com/stream.m3u8')).toBe(true);
    });

    it('should reject non-HTTP/HTTPS protocols', () => {
      expect(isValidStreamUrl('ftp://example.com/stream.m3u8')).toBe(false);
      expect(isValidStreamUrl('javascript:alert(1)')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isValidStreamUrl('not-a-url')).toBe(false);
      expect(isValidStreamUrl('')).toBe(false);
    });

    it('should reject loopback and private hosts in production', () => {
      process.env.NODE_ENV = 'production';

      expect(isValidStreamUrl('http://localhost/stream.m3u8')).toBe(false);
      expect(isValidStreamUrl('http://127.0.0.1/stream.m3u8')).toBe(false);
      expect(isValidStreamUrl('http://0.0.0.0/stream.m3u8')).toBe(false);
      expect(isValidStreamUrl('http://169.254.10.20/stream.m3u8')).toBe(false);
      expect(isValidStreamUrl('http://[::1]/stream.m3u8')).toBe(false);
      expect(isValidStreamUrl('http://[fd00::1]/stream.m3u8')).toBe(false);
      expect(isValidStreamUrl('http://[fe80::1]/stream.m3u8')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should remove event handlers', () => {
      expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('should preserve safe input', () => {
      expect(sanitizeInput('ESPN HD')).toBe('ESPN HD');
    });
  });

  describe('isValidChannelName', () => {
    it('should accept valid channel names', () => {
      expect(isValidChannelName('ESPN')).toBe(true);
      expect(isValidChannelName('Fox Sports HD')).toBe(true);
    });

    it('should reject empty names', () => {
      expect(isValidChannelName('')).toBe(false);
    });

    it('should reject names that are too long', () => {
      expect(isValidChannelName('a'.repeat(201))).toBe(false);
    });

    it('should reject names with dangerous characters', () => {
      expect(isValidChannelName('ESPN<script>')).toBe(false);
      expect(isValidChannelName('ESPN"test"')).toBe(false);
    });
  });
});
