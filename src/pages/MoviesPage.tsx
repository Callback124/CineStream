import React, { useState, useEffect } from 'react';
import { Film, Filter, Star, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';
import { getPopular, getTopRated, getByGenre, MOVIE_GENRES } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { DetailsModal } from '../components/DetailsModal';

export const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'top_rated'>('popular');
  const [loading, setLoading] = useState(true);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        let result: MediaItem[] = [];
        if (selectedGenre) {
          result = await getByGenre('movie', selectedGenre);
        } else if (sortBy === 'top_rated') {
          result = await getTopRated('movie');
        } else {
          result = await getPopular('movie');
        }

        if (isMounted) {
          setMovies(result);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load movies', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedGenre, sortBy]);

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Film className="w-4 h-4" />
              <span>Cinema Library</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore Movies
            </h1>
            <p className="text-sm text-white/50">
              Browse blockbusters, classics, and newly released films in HD and 4K quality.
            </p>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
            <button
              onClick={() => {
                setSelectedGenre(null);
                setSortBy('popular');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !selectedGenre && sortBy === 'popular'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => {
                setSelectedGenre(null);
                setSortBy('top_rated');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                !selectedGenre && sortBy === 'top_rated'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-300" /> Top Rated
            </button>
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              selectedGenre === null
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            All Genres
          </button>
          {MOVIE_GENRES.map((genre) => {
            const isSelected = selectedGenre === genre.id;
            return (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-2xl bg-white/5 animate-pulse border border-white/10"
              />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                item={{ ...movie, media_type: 'movie' }}
                onOpenDetails={(item) => setSelectedDetailsItem(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-neutral-400 space-y-3">
            <p className="text-base font-semibold">No movies found for this filter.</p>
            <button
              onClick={() => setSelectedGenre(null)}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
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
