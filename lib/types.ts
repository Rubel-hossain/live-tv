export type Channel = {
  id: string;
  number: number;
  name: string;
  url: string;
  group: string;
  country?: string;
  quality?: string;
  logo?: string;
  host: string;
};

export type StorageKey = "livetv:favorites" | "livetv:recents";

export type ViewMode = "browse" | "recent";

export type GroupInfo = readonly [string, number];
