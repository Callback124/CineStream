export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order?: number;
}

export interface VideoTrailer {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TVEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  vote_average: number;
  runtime?: number;
}

export interface TVSeason {
  id: number;
  season_number: number;
  name: string;
  overview?: string;
  poster_path: string | null;
  episode_count: number;
  air_date?: string;
  episodes?: TVEpisode[];
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: MediaType;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  popularity?: number;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TVSeason[];
  tagline?: string;
  status?: string;
  credits?: {
    cast: CastMember[];
  };
  videos?: {
    results: VideoTrailer[];
  };
  recommendations?: {
    results: MediaItem[];
  };
  similar?: {
    results: MediaItem[];
  };
}

export interface StreamSource {
  id: string;
  name: string;
  badge?: string;
  quality?: string;
  getUrl: (id: string | number, type: MediaType, season?: number, episode?: number) => string;
}

export interface WatchHistoryItem {
  id: number;
  type: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  season?: number;
  episode?: number;
  episodeName?: string;
  timestamp: number;
}

export interface WatchlistItem {
  id: number;
  type: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  addedAt: number;
}
