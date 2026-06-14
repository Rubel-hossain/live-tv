import { accentIndex, channelInitials, cleanName, hash, nowLabel } from "../channel-utils";

describe("channel-utils", () => {
  describe("channelInitials", () => {
    it("should return first two letters for single word", () => {
      expect(channelInitials("ESPN")).toBe("ES");
    });

    it("should return first letters of first two words", () => {
      expect(channelInitials("Fox Sports")).toBe("FS");
    });

    it("should return TV for empty string", () => {
      expect(channelInitials("")).toBe("TV");
    });

    it("should handle special characters", () => {
      expect(channelInitials("BBC-1")).toBe("BB");
    });
  });

  describe("accentIndex", () => {
    it("should return a number between 1 and 6", () => {
      const result = accentIndex("test");
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });

    it("should return consistent results for same input", () => {
      const result1 = accentIndex("test");
      const result2 = accentIndex("test");
      expect(result1).toBe(result2);
    });
  });

  describe("hash", () => {
    it("should generate a hash for a string", () => {
      const result = hash("test");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for different strings", () => {
      const hash1 = hash("test1");
      const hash2 = hash("test2");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("cleanName", () => {
    it("should remove checkmark badges", () => {
      expect(cleanName("\u2714\uFE0F ESPN")).toBe("ESPN");
      expect(cleanName("\u00e2\u0153\u201d\u00ef\u00b8\u008f ESPN")).toBe("ESPN");
    });

    it("should trim whitespace", () => {
      expect(cleanName("  ESPN  ")).toBe("ESPN");
    });

    it("should collapse multiple spaces", () => {
      expect(cleanName("ESPN  HD")).toBe("ESPN HD");
    });
  });

  describe("nowLabel", () => {
    it("should return a time string", () => {
      const result = nowLabel();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
