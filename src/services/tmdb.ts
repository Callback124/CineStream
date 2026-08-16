import { MediaItem, TVSeason, TVEpisode, Genre, MediaType } from '../types';
import { FALLBACK_MOVIES, FALLBACK_TV_SHOWS, MOVIE_GENRES, TV_GENRES, generateFallbackSeasons } from './fallbackData';

export { MOVIE_GENRES, TV_GENRES };

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// TMDB API key provided by user (with failover keys)
const DEFAULT_KEYS = [
  '05902896074695709d7763505bb88b4d',
  '4e44d9029b1270a757cddc766a1bcb63',
  'b8b5155f9ef6a8b7dd534e3a479ff73d',
  'e366d978c72e811841b6abede5cd7152',
];

export function getTmdbApiKey(): string {
  const customKey = localStorage.getItem('tmdb_custom_api_key');
  if (customKey && customKey.trim()) return customKey.trim();

  const envKey = (import.meta as unknown as { env?: { VITE_TMDB_API_KEY?: string } }).env?.VITE_TMDB_API_KEY;
  if (envKey && envKey !== 'your_tmdb_api_key_here' && envKey.trim()) {
    return envKey.trim();
  }

  return DEFAULT_KEYS[0];
}

export function setCustomTmdbApiKey(key: string) {
  if (key.trim()) {
    localStorage.setItem('tmdb_custom_api_key', key.trim());
  } else {
    localStorage.removeItem('tmdb_custom_api_key');
  }
}

export function getImageUrl(path: string | null | undefined, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
  }
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function getBackdropUrl(path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1600&q=80';
  }
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T | null> {
  const apiKey = getTmdbApiKey();
  const searchParams = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}${searchParams.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`TMDB fetch failed for ${endpoint}: HTTP ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn(`TMDB fetch network error for ${endpoint}:`, err);
    return null;
  }
}

// 1. Trending
export async function getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<MediaItem[]> {
  const data = await tmdbFetch<{ results: MediaItem[] }>(`/trending/${mediaType}/${timeWindow}`);
  if (data?.results?.length) {
    return data.results.map((item) => ({
      ...item,
      media_type: item.media_type || (mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'tv' : item.title ? 'movie' : 'tv'),
    }));
  }

  // Fallback
  if (mediaType === 'movie') return FALLBACK_MOVIES;
  if (mediaType === 'tv') return FALLBACK_TV_SHOWS;
  return [...FALLBACK_MOVIES.slice(0, 5), ...FALLBACK_TV_SHOWS.slice(0, 5)];
}

// 2. Popular
export async function getPopular(type: MediaType, page = 1): Promise<MediaItem[]> {
  const data = await tmdbFetch<{ results: MediaItem[] }>(`/${type}/popular`, { page });
  if (data?.results?.length) {
    return data.results.map((item) => ({ ...item, media_type: type }));
  }
  return type === 'movie' ? FALLBACK_MOVIES : FALLBACK_TV_SHOWS;
}

// 3. Top Rated
export async function getTopRated(type: MediaType, page = 1): Promise<MediaItem[]> {
  const data = await tmdbFetch<{ results: MediaItem[] }>(`/${type}/top_rated`, { page });
  if (data?.results?.length) {
    return data.results.map((item) => ({ ...item, media_type: type }));
  }
  return type === 'movie' ? [...FALLBACK_MOVIES].reverse() : [...FALLBACK_TV_SHOWS].reverse();
}

// 4. By Genre
export async function getByGenre(type: MediaType, genreId: number, page = 1): Promise<MediaItem[]> {
  const data = await tmdbFetch<{ results: MediaItem[] }>(`/discover/${type}`, {
    with_genres: genreId,
    sort_by: 'popularity.desc',
    page,
  });
  if (data?.results?.length) {
    return data.results.map((item) => ({ ...item, media_type: type }));
  }
  const source = type === 'movie' ? FALLBACK_MOVIES : FALLBACK_TV_SHOWS;
  const filtered = source.filter((m) => m.genre_ids?.includes(genreId));
  return filtered.length ? filtered : source;
}

// 5. Search
export async function searchMedia(query: string, page = 1): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch<{ results: MediaItem[] }>('/search/multi', {
    query: query.trim(),
    page,
    include_adult: 'false',
  });

  if (data?.results?.length) {
    return data.results
      .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item) => ({
        ...item,
        media_type: item.media_type || (item.title ? 'movie' : 'tv'),
      }));
  }

  // Fallback local search
  const q = query.toLowerCase();
  const allFallback = [...FALLBACK_MOVIES, ...FALLBACK_TV_SHOWS];
  return allFallback.filter(
    (item) =>
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.overview && item.overview.toLowerCase().includes(q))
  );
}

// 6. Media Details
export async function getMediaDetails(type: MediaType, id: string | number): Promise<MediaItem | null> {
  const data = await tmdbFetch<MediaItem>(`/${type}/${id}`, {
    append_to_response: 'credits,videos,recommendations,similar',
  });

  if (data) {
    return {
      ...data,
      media_type: type,
    };
  }

  // Fallback search in static list
  const numericId = Number(id);
  const pool = type === 'movie' ? FALLBACK_MOVIES : FALLBACK_TV_SHOWS;
  const match = pool.find((m) => m.id === numericId) || pool[0];

  if (match) {
    return {
      ...match,
      media_type: type,
      credits: {
        cast: [
          { id: 1, name: 'Lead Actor', character: 'Main Protagonist', profile_path: null },
          { id: 2, name: 'Co-Star', character: 'Key Ally', profile_path: null },
          { id: 3, name: 'Antagonist', character: 'Arch Rival', profile_path: null },
        ],
      },
      recommendations: {
        results: pool.filter((m) => m.id !== match.id).slice(0, 6),
      },
    };
  }

  return null;
}

// 7. TV Season Details
export async function getTVSeasonDetails(seriesId: string | number, seasonNumber: number): Promise<TVSeason | null> {
  const data = await tmdbFetch<TVSeason>(`/tv/${seriesId}/season/${seasonNumber}`);
  if (data && data.episodes && data.episodes.length > 0) {
    return data;
  }

  // Fallback generation
  const numericId = Number(seriesId);
  const show = FALLBACK_TV_SHOWS.find((s) => s.id === numericId) || {
    id: numericId,
    name: 'TV Series',
    first_air_date: '2023-01-01',
    media_type: 'tv',
    overview: '',
    vote_average: 8.5,
    vote_count: 100,
    poster_path: null,
    backdrop_path: null,
    number_of_seasons: 3,
  };

  const seasons = generateFallbackSeasons(show as MediaItem);
  const season = seasons.find((s) => s.season_number === seasonNumber) || seasons[0];
  return season || null;
}

// 8. Genres
export function getGenres(type: MediaType): Genre[] {
  return type === 'movie' ? MOVIE_GENRES : TV_GENRES;
}
