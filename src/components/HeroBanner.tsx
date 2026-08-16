import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check, Star, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { getBackdropUrl } from '../services/tmdb';
import { useWatch } from '../context/WatchContext';

interface HeroBannerProps {
  items: MediaItem[];
  onOpenDetails?: (item: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isInWatchlist, toggleWatchlist } = useWatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 6));
    }, 8000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <div className="w-full h-[65vh] min-h-[480px] bg-neutral-900 animate-pulse flex items-center justify-center">
        <div className="text-neutral-600 font-medium">Loading featured titles...</div>
      </div>
    );
  }

  const currentItem = items[currentIndex] || items[0];
  const title = currentItem.title || currentItem.name || 'Untitled';
  const type: MediaType = currentItem.media_type || (currentItem.title ? 'movie' : 'tv');
  const inList = isInWatchlist(currentItem.id, type);
  const releaseYear = (currentItem.release_date || currentItem.first_air_date || '').substring(0, 4);

  return (
    <div className="relative w-full h-[70vh] sm:h-[75vh] min-h-[480px] max-h-[750px] overflow-hidden select-none bg-[#050507]">
      {/* Background Backdrop Image with smooth transitions */}
      <div className="absolute inset-0">
        <img
          key={currentItem.id}
          src={getBackdropUrl(currentItem.backdrop_path, 'original')}
          alt={title}
          className="w-full h-full object-cover object-center transform scale-105 animate-in fade-in zoom-in-95 duration-1000"
        />
        {/* Layered Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/60 via-transparent to-[#050507]" />
      </div>

      {/* Featured Content Info */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 z-10">
        <div className="max-w-2xl space-y-3.5">
          {/* Top Tag & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-md text-[11px] font-bold tracking-wide text-white uppercase shadow-lg shadow-indigo-600/30 border border-white/20">
              <Sparkles className="w-3 h-3 text-amber-300" /> Featured {type === 'movie' ? 'Movie' : 'Series'}
            </span>

            {currentItem.vote_average > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-400 border border-white/15 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {currentItem.vote_average.toFixed(1)} IMDb
              </span>
            )}

            {releaseYear && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white/80 border border-white/10">
                {releaseYear}
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
              4K Ultra HD
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-2xl leading-tight">
            {title}
          </h1>

          {/* Tagline or Overview */}
          {currentItem.tagline && (
            <p className="text-xs sm:text-sm font-medium italic text-indigo-300 drop-shadow">
              "{currentItem.tagline}"
            </p>
          )}

          <p className="text-xs sm:text-sm text-white/70 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow max-w-xl">
            {currentItem.overview}
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/detail/${type}/${currentItem.id}`}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-indigo-600/40 border border-white/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Details & Play</span>
            </Link>

            <button
              onClick={() => toggleWatchlist(currentItem)}
              className={`p-3 rounded-2xl backdrop-blur-xl border transition-all hover:scale-105 active:scale-95 shadow-lg ${
                inList
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/30'
                  : 'bg-white/10 border-white/15 text-white/70 hover:text-white hover:bg-white/20'
              }`}
              title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="absolute right-4 sm:right-8 bottom-6 sm:bottom-12 z-20 flex items-center gap-2">
        <button
          onClick={() =>
            setCurrentIndex((prev) => (prev === 0 ? Math.min(items.length, 6) - 1 : prev - 1))
          }
          className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-colors"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 px-2">
          {items.slice(0, 6).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 6))}
          className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-colors"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
