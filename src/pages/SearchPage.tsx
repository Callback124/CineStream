import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Sparkles, Filter, X, Flame, ArrowLeft } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { searchMedia } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial query parameter once on mount
  const initialQuery = useRef(searchParams.get('q') || '');
  const [searchTerm, setSearchTerm] = useState(initialQuery.current);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // Debounced search that does NOT pollute browser history
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      // Clean URL silently using replace without creating new history stack entry
      setSearchParams({}, { replace: true });
      return;
    }

    // Update query param with replace: true so each keystroke does NOT create a history entry
    setSearchParams({ q: searchTerm.trim() }, { replace: true });

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMedia(searchTerm.trim());
        setResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchParams({}, { replace: true });
  };

  const handleBack = () => {
    // Single tap back directly to the previous page or home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
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
    <div className="min-h-screen bg-[#050507] text-white pt-20 pb-20 selection:bg-indigo-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header & Fast Back Action */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            id="search-back-btn"
            onClick={handleBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-bold transition-all active:scale-95 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-xs text-white/40 font-medium">
            Search CineStream Database
          </div>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-2xl mx-auto text-center space-y-4 pt-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Search Movies & TV Series
          </h1>
          <p className="text-xs sm:text-sm text-white/50">
            Find by title, actor, franchise, or keywords with instant live playback.
          </p>

          <div className="relative">
            <input
              id="search-page-input"
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Type movie or series title..."
              className="w-full bg-white/[0.05] backdrop-blur-xl border border-white/15 rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-2xl transition-all"
              autoFocus
            />
            <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-xs text-white/40 font-medium mr-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-indigo-400" /> Popular:
            </span>
            {popularSuggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchTerm(term)}
                className={`px-3 py-1 rounded-xl border text-[11px] font-medium transition-all backdrop-blur-sm active:scale-95 ${
                  searchTerm.toLowerCase() === term.toLowerCase()
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Controls & Filters */}
        {searchTerm.trim() && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 pt-2">
            <div className="text-xs text-white/50">
              Found{' '}
              <strong className="text-white font-bold">{filteredResults.length}</strong>{' '}
              results for "<span className="text-indigo-400 font-semibold">{searchTerm}</span>"
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
              <button
                type="button"
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
                type="button"
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
                type="button"
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
              />
            ))}
          </div>
        ) : searchTerm.trim() ? (
          <div className="text-center py-20 text-white/50 space-y-3 bg-white/[0.02] border border-white/10 rounded-2xl">
            <p className="text-base font-semibold text-white">No media found matching "{searchTerm}"</p>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              Try searching with a different spelling, check our popular suggestions above, or explore by genres.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
