import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Film, Tv, Sparkles, Filter, X, Flame } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { searchMedia } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { DetailsModal } from '../components/DetailsModal';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<MediaItem | null>(null);

  // Sync with URL search param
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMedia(searchTerm);
        setResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const filteredResults = results.filter((item) => {
    if (typeFilter === 'all') return true;
    const itemType = item.media_type || (item.title ? 'movie' : 'tv');
    return itemType === typeFilter;
  });

  const popularSuggestions = [
    'Dune',
    'Stranger Things',
    'Deadpool',
    'The Last of Us',
    'Oppenheimer',
    'House of the Dragon',
    'Spider-Man',
    'Arcane',
    'Breaking Bad',
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Bar Header */}
        <div className="max-w-2xl mx-auto text-center space-y-4 pt-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Search Movies & TV Series
          </h1>
          <p className="text-xs sm:text-sm text-white/50">
            Find by title, franchise, character, or keywords across global TMDB database.
          </p>

          <div className="relative">
            <input
              id="search-page-input"
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Type movie or TV show title..."
              className="w-full bg-white/[0.05] backdrop-blur-xl border border-white/15 rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-2xl transition-all"
              autoFocus
            />
            <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchParams({});
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            <span className="text-xs text-white/40 font-medium mr-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-indigo-400" /> Popular:
            </span>
            {popularSuggestions.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchTerm(term);
                  setSearchParams({ q: term });
                }}
                className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 text-[11px] text-white/70 hover:text-white transition-all backdrop-blur-sm"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Controls & Filters */}
        {searchTerm.trim() && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="text-xs text-white/50">
              Found{' '}
              <strong className="text-white font-bold">{filteredResults.length}</strong>{' '}
              results for "<span className="text-indigo-400 font-semibold">{searchTerm}</span>"
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  typeFilter === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('movie')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  typeFilter === 'movie'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Film className="w-3 h-3" /> Movies
              </button>
              <button
                onClick={() => setTypeFilter('tv')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  typeFilter === 'tv'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Tv className="w-3 h-3" /> TV Shows
              </button>
            </div>
          </div>
        )}

        {/* Search Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-2xl bg-white/5 animate-pulse border border-white/10"
              />
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredResults.map((item) => (
              <MovieCard
                key={`${item.media_type || (item.title ? 'movie' : 'tv')}-${item.id}`}
                item={item}
                onOpenDetails={(media) => setSelectedDetailsItem(media)}
              />
            ))}
          </div>
        ) : searchTerm.trim() ? (
          <div className="text-center py-20 text-white/50 space-y-3 bg-white/[0.02] border border-white/10 rounded-2xl">
            <p className="text-base font-semibold text-white">No media found matching "{searchTerm}"</p>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              Try searching with a different spelling, checking our popular suggestions above, or explore by genres.
            </p>
          </div>
        ) : null}
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
