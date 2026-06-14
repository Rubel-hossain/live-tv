import { playbackUrl, proxiedStreamUrl, shouldProxyStream } from "../stream-url";

describe("stream-url", () => {
  it("creates a proxy URL with an encoded target", () => {
    expect(proxiedStreamUrl("http://example.com/live/index.m3u8")).toBe(
      "/api/stream?url=http%3A%2F%2Fexample.com%2Flive%2Findex.m3u8"
    );
  });

  it("proxies insecure streams on HTTPS pages in auto mode", () => {
    expect(shouldProxyStream("http://example.com/live.m3u8", "https:")).toBe(true);
    expect(playbackUrl("http://example.com/live.m3u8", "https:")).toContain("/api/stream");
  });

  it("does not proxy secure streams in auto mode", () => {
    expect(shouldProxyStream("https://example.com/live.m3u8", "https:")).toBe(false);
  });
});
