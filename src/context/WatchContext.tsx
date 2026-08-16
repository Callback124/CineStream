import React, { createContext, useContext, useState, useEffect } from 'react';
import { MediaItem, MediaType, WatchHistoryItem, WatchlistItem } from '../types';

interface WatchContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: number, type: MediaType) => void;
  isInWatchlist: (id: number, type: MediaType) => boolean;
  toggleWatchlist: (item: MediaItem) => void;
  
  history: WatchHistoryItem[];
  saveToHistory: (item: {
    id: number;
    type: MediaType;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    season?: number;
    episode?: number;
    episodeName?: string;
  }) => void;
  removeFromHistory: (id: number, type: MediaType) => void;
  clearHistory: () => void;
  
  preferredServer: string;
  setPreferredServer: (serverId: string) => void;
  autoPlayNext: boolean;
  setAutoPlayNext: (val: boolean) => void;
  
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
}

const WatchContext = createContext<WatchContextType | undefined>(undefined);

export const WatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('cinestream_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('cinestream_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [preferredServer, setPreferredServerState] = useState<string>(() => {
    return localStorage.getItem('cinestream_preferred_server') || 'max';
  });

  const [autoPlayNext, setAutoPlayNextState] = useState<boolean>(() => {
    return localStorage.getItem('cinestream_autoplay_next') !== 'false';
  });

  const [customApiKey, setCustomApiKeyState] = useState<string>(() => {
    return localStorage.getItem('tmdb_custom_api_key') || '';
  });

  useEffect(() => {
    try {
      localStorage.setItem('cinestream_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Failed to save watchlist', e);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem('cinestream_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  }, [history]);

  const setPreferredServer = (serverId: string) => {
    setPreferredServerState(serverId);
    localStorage.setItem('cinestream_preferred_server', serverId);
  };

  const setAutoPlayNext = (val: boolean) => {
    setAutoPlayNextState(val);
    localStorage.setItem('cinestream_autoplay_next', String(val));
  };

  const setCustomApiKey = (key: string) => {
    setCustomApiKeyState(key);
    if (key.trim()) {
      localStorage.setItem('tmdb_custom_api_key', key.trim());
    } else {
      localStorage.removeItem('tmdb_custom_api_key');
    }
  };

  const addToWatchlist = (item: MediaItem) => {
    const title = item.title || item.name || 'Untitled';
    const type = item.media_type;
    setWatchlist((prev) => {
      if (prev.some((w) => w.id === item.id && w.type === type)) return prev;
      const newItem: WatchlistItem = {
        id: item.id,
        type,
        title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
        overview: item.overview,
        addedAt: Date.now(),
      };
      return [newItem, ...prev];
    });
  };

  const removeFromWatchlist = (id: number, type: MediaType) => {
    setWatchlist((prev) => prev.filter((w) => !(w.id === id && w.type === type)));
  };

  const isInWatchlist = (id: number, type: MediaType) => {
    return watchlist.some((w) => w.id === id && w.type === type);
  };

  const toggleWatchlist = (item: MediaItem) => {
    if (isInWatchlist(item.id, item.media_type)) {
      removeFromWatchlist(item.id, item.media_type);
    } else {
      addToWatchlist(item);
    }
  };

  const saveToHistory = (item: {
    id: number;
    type: MediaType;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    season?: number;
    episode?: number;
    episodeName?: string;
  }) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => !(h.id === item.id && h.type === item.type));
      const newEntry: WatchHistoryItem = {
        id: item.id,
        type: item.type,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        season: item.season,
        episode: item.episode,
        episodeName: item.episodeName,
        timestamp: Date.now(),
      };
      return [newEntry, ...filtered.slice(0, 19)]; // Keep latest 20
    });
  };

  const removeFromHistory = (id: number, type: MediaType) => {
    setHistory((prev) => prev.filter((h) => !(h.id === id && h.type === type)));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('cinestream_history');
  };

  return (
    <WatchContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        toggleWatchlist,
        history,
        saveToHistory,
        removeFromHistory,
        clearHistory,
        preferredServer,
        setPreferredServer,
        autoPlayNext,
        setAutoPlayNext,
        customApiKey,
        setCustomApiKey,
      }}
    >
      {children}
    </WatchContext.Provider>
  );
};

export const useWatch = () => {
  const context = useContext(WatchContext);
  if (!context) {
    throw new Error('useWatch must be used within a WatchProvider');
  }
  return context;
};
