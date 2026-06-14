"use client";

import {
  ArrowDownAZ,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Expand,
  Heart,
  History,
  ListVideo,
  Radio,
  RefreshCw,
  Search,
  Signal,
  SlidersHorizontal,
  Star,
  Tv,
  Volume2,
  VolumeX,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Channel, ViewMode } from "@/lib/types";
import { CLOCK_UPDATE_INTERVAL, STORAGE_KEYS } from "@/lib/constants";
import { config } from "@/lib/config";
import { useFavorites, useRecents } from "@/lib/hooks";
import { accentIndex, nowLabel } from "@/lib/channel-utils";
import { readList } from "@/lib/storage";
import { VideoPlayer } from "./video-player";
import { ChannelCard } from "./channel-card";
import { NowPlayingPanel } from "./now-playing-panel";

type TvExperienceProps = {
  channels: Channel[];
};

type SortMode = "playlist" | "name" | "group" | "quality";

const QUALITY_RANK: Record<string, number> = {
  "4K": 0,
  "1080P": 1,
  "720P": 2,
  HD: 3,
  "480P": 4,
  SD: 5,
  MPEGTS: 6,
  LIVE: 7
};

function sortChannels(channels: Channel[], sortMode: SortMode): Channel[] {
  const next = [...channels];

  if (sortMode === "playlist") {
    return next;
  }

  if (sortMode === "name") {
    return next.sort((first, second) => first.name.localeCompare(second.name));
  }

  if (sortMode === "group") {
    return next.sort(
      (first, second) =>
        first.group.localeCompare(second.group) || first.name.localeCompare(second.name)
    );
  }

  return next.sort((first, second) => {
    const firstRank = QUALITY_RANK[first.quality ?? "LIVE"] ?? 99;
    const secondRank = QUALITY_RANK[second.quality ?? "LIVE"] ?? 99;
    return firstRank - secondRank || first.name.localeCompare(second.name);
  });
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

export function TvExperience({ channels }: TvExperienceProps) {
  const [activeChannelId, setActiveChannelId] = useState(channels[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const [view, setView] = useState<ViewMode>("browse");
  const [sortMode, setSortMode] = useState<SortMode>("playlist");
  const [isMuted, setIsMuted] = useState(true);
  const [playError, setPlayError] = useState("");
  const [clock, setClock] = useState(nowLabel);
  const [showPlayerChrome, setShowPlayerChrome] = useState(true);
  const chromeTimerRef = useRef<number | undefined>(undefined);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const restoredLastChannelRef = useRef(false);

  const favoriteEnabled = config.enableFavorites;
  const recentsEnabled = config.enableRecents;
  const { favorites, loadFavorites, toggleFavorite, isFavorite } = useFavorites();
  const { recents, loadRecents, addRecent, clearRecents } = useRecents(config.maxRecentChannels);

  const activeChannel = useMemo(
    () => channels.find((channel) => channel.id === activeChannelId) ?? channels[0],
    [activeChannelId, channels]
  );

  const favoriteCount = useMemo(
    () => favorites.filter((id) => channels.some((channel) => channel.id === id)).length,
    [channels, favorites]
  );

  const groups = useMemo(() => {
    const counts = channels.reduce<Record<string, number>>((result, channel) => {
      result[channel.group] = (result[channel.group] ?? 0) + 1;
      return result;
    }, {});

    const favoriteGroup: Array<readonly [string, number]> = favoriteEnabled
      ? [["Favorites", favoriteCount] as const]
      : [];

    return [
      ["All", channels.length] as const,
      ...favoriteGroup,
      ...Object.entries(counts).sort((first, second) => second[1] - first[1])
    ];
  }, [channels, favoriteCount, favoriteEnabled]);

  const recentChannels = useMemo(
    () =>
      recents
        .map((id) => channels.find((channel) => channel.id === id))
        .filter((channel): channel is Channel => Boolean(channel)),
    [channels, recents]
  );

  const displayedChannels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sourceChannels = view === "recent" ? recentChannels : channels;
    const filteredChannels = sourceChannels.filter((channel) => {
      const matchesGroup =
        activeGroup === "All" ||
        (favoriteEnabled && activeGroup === "Favorites" && favorites.includes(channel.id)) ||
        channel.group === activeGroup;
      const matchesQuery =
        !normalizedQuery ||
        [channel.name, channel.group, channel.country, channel.host]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));

      return matchesGroup && matchesQuery;
    });

    return sortChannels(filteredChannels, sortMode);
  }, [
    activeGroup,
    channels,
    favoriteEnabled,
    favorites,
    query,
    recentChannels,
    sortMode,
    view
  ]);

  const accentClass = activeChannel ? `accent-${accentIndex(activeChannel.name)}` : "accent-1";
  const qualitySummary = useMemo(() => {
    const qualities = Array.from(new Set(channels.map((channel) => channel.quality).filter(Boolean)));
    return qualities.slice(0, 3).join(" / ") || "Live";
  }, [channels]);

  const revealPlayerChrome = useCallback(() => {
    setShowPlayerChrome(true);

    if (chromeTimerRef.current) {
      window.clearTimeout(chromeTimerRef.current);
    }

    chromeTimerRef.current = window.setTimeout(() => {
      setShowPlayerChrome(false);
    }, config.playerChromeHideDelay);
  }, []);

  const selectChannel = useCallback(
    (channel: Channel) => {
      setActiveChannelId(channel.id);
      setPlayError("");
      revealPlayerChrome();
    },
    [revealPlayerChrome]
  );

  const handleChannelChange = useCallback(() => {
    if (recentsEnabled && activeChannel) {
      addRecent(activeChannel.id);
    }
  }, [activeChannel, addRecent, recentsEnabled]);

  const handleVideoError = useCallback((error: string) => {
    setPlayError(error);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((current) => !current);
    revealPlayerChrome();
  }, [revealPlayerChrome]);

  const toggleFullscreen = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void player.requestFullscreen?.();
  }, []);

  const moveChannel = useCallback(
    (direction: -1 | 1) => {
      const pool = displayedChannels.length > 0 ? displayedChannels : channels;
      if (pool.length === 0) return;

      const currentIndex = Math.max(
        0,
        pool.findIndex((channel) => channel.id === activeChannelId)
      );
      const nextIndex = (currentIndex + direction + pool.length) % pool.length;
      selectChannel(pool[nextIndex]);
    },
    [activeChannelId, channels, displayedChannels, selectChannel]
  );

  useEffect(() => {
    loadFavorites();
    loadRecents();
  }, [loadFavorites, loadRecents]);

  useEffect(() => {
    if (restoredLastChannelRef.current || channels.length === 0) {
      return;
    }

    restoredLastChannelRef.current = true;
    const lastChannelId = readList(STORAGE_KEYS.RECENTS)[0];
    const lastChannel = channels.find((channel) => channel.id === lastChannelId);
    if (lastChannel) {
      setActiveChannelId(lastChannel.id);
    }
  }, [channels]);

  useEffect(() => {
    if (activeGroup === "Favorites" && !favoriteEnabled) {
      setActiveGroup("All");
    }
  }, [activeGroup, favoriteEnabled]);

  useEffect(() => {
    if (!activeChannel && channels[0]) {
      setActiveChannelId(channels[0].id);
    }
  }, [activeChannel, channels]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(nowLabel()), CLOCK_UPDATE_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    revealPlayerChrome();
  }, [activeChannelId, revealPlayerChrome]);

  useEffect(() => {
    return () => {
      if (chromeTimerRef.current) {
        window.clearTimeout(chromeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveChannel(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveChannel(1);
      }

      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleMute();
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [moveChannel, toggleFullscreen, toggleMute]);

  if (!activeChannel) {
    return (
      <main className="empty-state">
        <Tv aria-hidden="true" />
        <h1>No channels found</h1>
        <p>Keep your M3U file in the project root and restart the app.</p>
      </main>
    );
  }

  const emptyMessage =
    view === "recent" && recentChannels.length === 0
      ? "No recent channels yet"
      : "No channels match your criteria";

  return (
    <main className="app-shell">
      <section className="watch-stage" aria-label="Live player">
        <div className="topbar">
          <div className="brand">
            <span className={`brand-mark ${accentClass}`}>
              <Tv size={22} aria-hidden="true" />
            </span>
            <span>LiveTV</span>
          </div>
          <div className="topbar-meta">
            <span>
              <Clock3 size={15} aria-hidden="true" />
              {clock}
            </span>
            <span>
              <ListVideo size={15} aria-hidden="true" />
              {channels.length} channels
            </span>
            <span>
              <Signal size={15} aria-hidden="true" />
              {qualitySummary}
            </span>
          </div>
        </div>

        <div className="player-grid">
          <div
            ref={playerRef}
            className={
              showPlayerChrome || playError ? "player-shell is-chrome-visible" : "player-shell"
            }
            onClick={revealPlayerChrome}
            onFocusCapture={revealPlayerChrome}
            onMouseMove={revealPlayerChrome}
            onTouchStart={revealPlayerChrome}
          >
            <VideoPlayer
              channel={activeChannel}
              muted={isMuted}
              onError={handleVideoError}
              onChannelChange={handleChannelChange}
            />
            {playError ? (
              <div className="player-error">
                <Signal size={30} aria-hidden="true" />
                <span>{playError}</span>
              </div>
            ) : null}
            <div className="player-overlay">
              <div>
                <span className="eyebrow">
                  <Radio size={14} aria-hidden="true" />
                  Live now
                </span>
                <h1>{activeChannel.name}</h1>
                <p>
                  Channel {activeChannel.number.toString().padStart(3, "0")} /{" "}
                  {activeChannel.group} / {activeChannel.quality}
                </p>
              </div>
              <div className="player-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => moveChannel(-1)}
                  aria-label="Previous channel"
                  title="Previous"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => moveChannel(1)}
                  aria-label="Next channel"
                  title="Next"
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
                {favoriteEnabled ? (
                  <button
                    type="button"
                    className={isFavorite(activeChannel.id) ? "icon-button is-active" : "icon-button"}
                    onClick={() => toggleFavorite(activeChannel.id)}
                    aria-label="Toggle favorite"
                    aria-pressed={isFavorite(activeChannel.id)}
                    title="Favorite"
                  >
                    <Heart
                      size={19}
                      fill={isFavorite(activeChannel.id) ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
                <button
                  type="button"
                  className={isMuted ? "icon-button is-active" : "icon-button"}
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX size={19} aria-hidden="true" />
                  ) : (
                    <Volume2 size={19} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={toggleFullscreen}
                  aria-label="Fullscreen"
                  title="Fullscreen"
                >
                  <Expand size={19} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <NowPlayingPanel channel={activeChannel} />
        </div>
      </section>

      <section className="control-surface" aria-label="Channel browser">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search channels, regions, hosts"
              aria-label="Search channels"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" title="Clear">
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="toolbar-actions">
            <label className="select-control">
              <SlidersHorizontal size={16} aria-hidden="true" />
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                aria-label="Sort channels"
              >
                <option value="playlist">Playlist order</option>
                <option value="name">Name</option>
                <option value="group">Group</option>
                <option value="quality">Quality</option>
              </select>
            </label>

            <div className="segmented" aria-label="View mode">
              <button
                type="button"
                className={view === "browse" ? "selected" : ""}
                onClick={() => setView("browse")}
              >
                <ListVideo size={16} aria-hidden="true" />
                Browse
              </button>
              {recentsEnabled ? (
                <button
                  type="button"
                  className={view === "recent" ? "selected" : ""}
                  onClick={() => setView("recent")}
                >
                  <History size={16} aria-hidden="true" />
                  Recent
                </button>
              ) : null}
            </div>

            {view === "recent" && recentChannels.length > 0 ? (
              <button
                type="button"
                className="icon-button"
                onClick={clearRecents}
                aria-label="Clear recent channels"
                title="Clear recent"
              >
                <X size={18} aria-hidden="true" />
              </button>
            ) : null}

            <button
              type="button"
              className="icon-button"
              onClick={() => window.location.reload()}
              aria-label="Reload playlist"
              title="Reload"
            >
              <RefreshCw size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="stat-strip" aria-label="Library summary">
          <span>
            <Compass size={15} aria-hidden="true" />
            {displayedChannels.length} showing
          </span>
          <span>
            <Star size={15} aria-hidden="true" />
            {favoriteCount} favorites
          </span>
          <span>
            <History size={15} aria-hidden="true" />
            {recentChannels.length} recent
          </span>
          <span>
            <ArrowDownAZ size={15} aria-hidden="true" />
            {sortMode}
          </span>
        </div>

        <div className="group-tabs" aria-label="Channel groups">
          {groups.map(([name, count]) => (
            <button
              key={name}
              type="button"
              className={activeGroup === name ? "active" : ""}
              onClick={() => setActiveGroup(name)}
            >
              {name}
              <span className="count">{count}</span>
            </button>
          ))}
        </div>

        <div className="channel-grid">
          {displayedChannels.length === 0 ? (
            <div className="empty-results">
              <Compass size={32} aria-hidden="true" />
              <p>{emptyMessage}</p>
            </div>
          ) : (
            displayedChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isActive={channel.id === activeChannelId}
                isFavorite={favoriteEnabled && isFavorite(channel.id)}
                favoriteEnabled={favoriteEnabled}
                onSelect={() => selectChannel(channel)}
                onToggleFavorite={() => toggleFavorite(channel.id)}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
