import { promises as fs } from "fs";
import { cache } from "../cache";
import { getPlaylist } from "../playlist";

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    stat: jest.fn()
  }
}));

const mockedFs = fs as jest.Mocked<typeof fs>;

describe("playlist", () => {
  beforeEach(() => {
    cache.clear();
    jest.clearAllMocks();
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
});
