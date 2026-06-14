import * as fs from "node:fs/promises";
import { cache } from "../cache";
import { getPlaylist } from "../playlist";

jest.mock("node:fs/promises", () => ({
  readFile: jest.fn(),
  stat: jest.fn()
}));

const mockedFs = fs as jest.Mocked<typeof fs>;
const originalPlaylistUrl = process.env.PLAYLIST_URL;

describe("playlist", () => {
  beforeEach(() => {
    cache.clear();
    jest.clearAllMocks();
    delete process.env.PLAYLIST_URL;
    global.fetch = jest.fn();
  });

  afterAll(() => {
    if (originalPlaylistUrl === undefined) {
      delete process.env.PLAYLIST_URL;
      return;
    }

    process.env.PLAYLIST_URL = originalPlaylistUrl;
  });

  it("reuses cached channels while the playlist file is unchanged", async () => {
    mockedFs.stat.mockResolvedValue({ mtimeMs: 1000 } as Awaited<ReturnType<typeof fs.stat>>);
    mockedFs.readFile.mockResolvedValue(
      '#EXTM3U\n#EXTINF:-1 tvg-name="ESPN",ESPN\nhttps://example.com/live.m3u8\n'
    );

    const first = await getPlaylist();
    const second = await getPlaylist();

    expect(first).toEqual(second);
    expect(mockedFs.readFile).toHaveBeenCalledTimes(1);
  });

  it("re-parses the playlist when the file timestamp changes", async () => {
    mockedFs.stat
      .mockResolvedValueOnce({ mtimeMs: 1000 } as Awaited<ReturnType<typeof fs.stat>>)
      .mockResolvedValueOnce({ mtimeMs: 2000 } as Awaited<ReturnType<typeof fs.stat>>);
    mockedFs.readFile
      .mockResolvedValueOnce(
        '#EXTM3U\n#EXTINF:-1 tvg-name="ESPN",ESPN\nhttps://example.com/live.m3u8\n'
      )
      .mockResolvedValueOnce(
        '#EXTM3U\n#EXTINF:-1 tvg-name="Fox Sports",Fox Sports\nhttps://example.com/fox.m3u8\n'
      );

    const first = await getPlaylist();
    const second = await getPlaylist();

    expect(first[0]?.name).toBe("ESPN");
    expect(second[0]?.name).toBe("Fox Sports");
    expect(mockedFs.readFile).toHaveBeenCalledTimes(2);
  });

  it("loads the playlist from a remote URL when PLAYLIST_URL is configured", async () => {
    process.env.PLAYLIST_URL = "https://example.com/channels.m3u";
    const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        etag: '"playlist-v1"'
      }),
      text: async () =>
        '#EXTM3U\n#EXTINF:-1 tvg-name="ESPN",ESPN\nhttps://example.com/live.m3u8\n'
    } as Response);

    const channels = await getPlaylist();

    expect(channels[0]?.name).toBe("ESPN");
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/channels.m3u", {
      cache: "no-store",
      headers: {
        Accept: "application/x-mpegURL, application/vnd.apple.mpegurl, text/plain, */*"
      }
    });
    expect(mockedFs.readFile).not.toHaveBeenCalled();
  });
});
