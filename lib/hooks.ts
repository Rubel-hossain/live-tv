import { useState, useCallback } from "react";
import { STORAGE_KEYS } from "./constants";
import { clearList, readList, writeList } from "./storage";

/**
 * Hook to manage favorite channels
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadFavorites = useCallback(() => {
    setFavorites(readList(STORAGE_KEYS.FAVORITES));
  }, []);

  const toggleFavorite = useCallback((channelId: string) => {
    setFavorites((current) => {
      const next = current.includes(channelId)
        ? current.filter((id) => id !== channelId)
        : [channelId, ...current];
      writeList(STORAGE_KEYS.FAVORITES, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (channelId: string) => favorites.includes(channelId),
    [favorites]
  );

  return { favorites, loadFavorites, toggleFavorite, isFavorite };
}

/**
 * Hook to manage recently watched channels
 */
export function useRecents(maxRecents: number = 12) {
  const [recents, setRecents] = useState<string[]>([]);

  const loadRecents = useCallback(() => {
    setRecents(readList(STORAGE_KEYS.RECENTS));
  }, []);

  const addRecent = useCallback(
    (channelId: string) => {
      setRecents((current) => {
        const next = [channelId, ...current.filter((id) => id !== channelId)].slice(
          0,
          maxRecents
        );
        writeList(STORAGE_KEYS.RECENTS, next);
        return next;
      });
    },
    [maxRecents]
  );

  const clearRecents = useCallback(() => {
    clearList(STORAGE_KEYS.RECENTS);
    setRecents([]);
  }, []);

  return { recents, loadRecents, addRecent, clearRecents };
}
