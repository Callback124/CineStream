import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { MediaItem } from '../types';
import { MovieCard } from './MovieCard';

interface MediaRowProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  icon?: React.ReactNode;
  exploreLink?: string;
  onOpenDetails?: (item: MediaItem) => void;
  isLoading?: boolean;
}

export const MediaRow: React.FC<MediaRowProps> = ({
  title,
  subtitle,
  items,
  icon,
  exploreLink,
  onOpenDetails,
  isLoading = false,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!isLoading && (!items || items.length === 0)) {
    return null;
  }

  return (
    <section className="relative py-4 sm:py-6 space-y-3 group/row">
      {/* Row Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-between">
        <div className="flex items-center gap-2.5">
          {icon && <div className="text-indigo-400">{icon}</div>}
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-white/50 font-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {exploreLink && (
          <Link
            to={exploreLink}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Row Carousel Area with Left & Right Arrows */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-indigo-600 text-white backdrop-blur-xl border border-white/15 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-xl hover:scale-110 disabled:opacity-0"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Horizontal Scrolling Cards Container */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth px-4 sm:px-6 lg:px-8 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-40 sm:w-48 md:w-52 lg:w-56 aspect-[2/3] rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))
            : items.map((item) => (
                <MovieCard
                  key={`${item.media_type || (item.title ? 'movie' : 'tv')}-${item.id}`}
                  item={item}
                  onOpenDetails={onOpenDetails}
                />
              ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-indigo-600 text-white backdrop-blur-xl border border-white/15 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-xl hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
};
