import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, Info, Film, Tv } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { getImageUrl } from '../services/tmdb';
import { useWatch } from '../context/WatchContext';

interface MovieCardProps {
  item: MediaItem;
  onOpenDetails?: (item: MediaItem) => void;
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, onOpenDetails, priority = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatch();
  const navigate = useNavigate();

  const title = item.title || item.name || 'Untitled';
  const type: MediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const releaseDate = item.release_date || item.first_air_date || '';
  const year = releaseDate ? releaseDate.substring(0, 4) : '';
  const inList = isInWatchlist(item.id, type);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  const posterSrc = imageError
    ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'
    : getImageUrl(item.poster_path, 'w500');

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked inside action buttons, let them handle it
    if ((e.target as HTMLElement).closest('button')) return;
    navigate(`/watch/${type}/${item.id}`);
  };

  return (
    <div
      id={`movie-card-${type}-${item.id}`}
      onClick={handleCardClick}
      className="group relative flex-shrink-0 w-40 sm:w-48 md:w-52 lg:w-56 cursor-pointer select-none rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-950/50"
    >
      {/* Poster Aspect Ratio Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#0c0c14]">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
            {type === 'movie' ? (
              <Film className="w-8 h-8 text-white/20" />
            ) : (
              <Tv className="w-8 h-8 text-white/20" />
            )}
          </div>
        )}
        <img
          src={posterSrc}
          alt={title}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Gradient Overlay for card badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-md ${
              type === 'movie'
                ? 'bg-indigo-600/80 text-white'
                : 'bg-purple-600/80 text-white'
            }`}
          >
            {type === 'movie' ? 'Movie' : 'Series'}
          </span>

          {rating && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-white/10 shadow-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {rating}
            </span>
          )}
        </div>

        {/* Hover Action Buttons Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
          <Link
            to={`/watch/${type}/${item.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 hover:scale-110 transition-transform"
            title="Watch Now"
          >
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(item);
              }}
              className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                inList
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
              title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            {onOpenDetails && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(item);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all"
                title="View Details"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Info Bottom */}
      <div className="p-3 bg-white/[0.02] backdrop-blur-md flex flex-col justify-between">
        <h3 className="text-xs sm:text-sm font-semibold text-white/90 truncate group-hover:text-indigo-400 transition-colors" title={title}>
          {title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-white/50 mt-1">
          <span>{year || 'HD'}</span>
          <span className="text-[9px] text-white/40 uppercase tracking-wider font-mono">
            {type}
          </span>
        </div>
      </div>
    </div>
  );
};
