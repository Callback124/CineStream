import React, { useState, useEffect } from 'react';
import { MOVIE_GENRES, TV_GENRES, getByGenre } from '../services/tmdb';
import { MediaItem, MediaType, Genre } from '../types';
import { MovieCard } from '../components/MovieCard';
import { DetailsModal } from '../components/DetailsModal';
import { Film, Tv, Sparkles, Flame } from 'lucide-react';

const GENRE_GRADIENTS = [
  'from-red-600 to-rose-900',
  'from-amber-600 to-orange-900',
  'from-blue-600 to-indigo-900',
  'from-emerald-600 to-teal-900',
  'from-purple-600 to-violet-900',
  'from-pink-600 to-fuchsia-900',
  'from-cyan-600 to-blue-900',
  'from-yellow-600 to-amber-900',
];

export const GenresPage: React.FC = () => {
  const [activeType, setActiveType] = useState<MediaType>('movie');
  const [selectedGenre, setSelectedGenre] = useState<Genre>(MOVIE_GENRES[0]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<MediaItem | null>(null);

  const genresList = activeType === 'movie' ? MOVIE_GENRES : TV_GENRES;

  useEffect(() => {
    setSelectedGenre(genresList[0]);
  }, [activeType]);

  useEffect(() => {
    if (!selectedGenre) return;

    let isMounted = true;
    setLoading(true);

    getByGenre(activeType, selectedGenre.id)
      .then((data) => {
        if (isMounted) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load genre media', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedGenre, activeType]);

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Categories & Genres
            </h1>
            <p className="text-sm text-white/50">
              Browse cinematic collections sorted by your favorite genre themes.
            </p>
          </div>

          {/* Type Switcher */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
            <button
              onClick={() => setActiveType('movie')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeType === 'movie'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" /> Movie Genres
            </button>
            <button
              onClick={() => setActiveType('tv')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeType === 'tv'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" /> Series Genres
            </button>
          </div>
        </div>

        {/* Genre Visual Cards Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {genresList.map((g, idx) => {
            const isSelected = selectedGenre?.id === g.id;
            const gradient = GENRE_GRADIENTS[idx % GENRE_GRADIENTS.length];
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g)}
                className={`relative p-4 rounded-2xl text-left overflow-hidden transition-all duration-300 group border backdrop-blur-md ${
                  isSelected
                    ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-[1.03] shadow-xl shadow-indigo-950/50'
                    : 'border-white/10 hover:border-white/20'
                } bg-gradient-to-br ${gradient} bg-opacity-30`}
              >
                <div className="relative z-10 flex flex-col justify-between h-14">
                  <span className="text-xs font-mono uppercase text-white/70">
                    #{idx + 1}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-white group-hover:translate-x-1 transition-transform">
                    {g.name}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Selected Genre Media Feed */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Top {selectedGenre?.name} {activeType === 'movie' ? 'Movies' : 'TV Shows'}</span>
            </h2>
            <span className="text-xs text-white/50">{items.length} titles</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-[2/3] rounded-2xl bg-white/5 animate-pulse border border-white/10"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {items.map((item) => (
                <MovieCard
                  key={item.id}
                  item={{ ...item, media_type: activeType }}
                  onOpenDetails={(media) => setSelectedDetailsItem(media)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedDetailsItem && (
        <DetailsModal
          item={selectedDetailsItem}
          onClose={() => setSelectedDetailsItem(null)}
        />
      )}
    </div>
  );
};
