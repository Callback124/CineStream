import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Play, Plus, Check, Star, Clock, Calendar, Film, Tv, Sparkles, Youtube, Users } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { getMediaDetails, getImageUrl, getBackdropUrl } from '../services/tmdb';
import { useWatch } from '../context/WatchContext';

interface DetailsModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({ item, onClose }) => {
  const [details, setDetails] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'trailer'>('overview');
  const { isInWatchlist, toggleWatchlist } = useWatch();

  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setLoading(true);
    setActiveTab('overview');

    const type: MediaType = item.media_type || (item.title ? 'movie' : 'tv');

    getMediaDetails(type, item.id).then((data) => {
      if (isMounted) {
        setDetails(data || item);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [item]);

  if (!item) return null;

  const currentData = details || item;
  const title = currentData.title || currentData.name || 'Untitled';
  const type: MediaType = currentData.media_type || (currentData.title ? 'movie' : 'tv');
  const inList = isInWatchlist(currentData.id, type);
  const releaseDate = currentData.release_date || currentData.first_air_date || '';
  const year = releaseDate ? releaseDate.substring(0, 4) : '';

  const trailer = currentData.videos?.results?.find(
    (v) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
  );

  const cast = currentData.credits?.cast?.slice(0, 10) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-white/20 text-white backdrop-blur-xl border border-white/15 transition-colors shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Hero Banner */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-[#0c0c14]">
          <img
            src={getBackdropUrl(currentData.backdrop_path, 'original')}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-[#0c0c14]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c14]/90 via-transparent to-transparent" />

          {/* Hero Content Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6">
            <img
              src={getImageUrl(currentData.poster_path, 'w500')}
              alt={title}
              className="hidden sm:block w-32 md:w-40 aspect-[2/3] object-cover rounded-2xl border-2 border-white/15 shadow-2xl flex-shrink-0"
            />
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold uppercase tracking-wider border border-white/20 shadow-md shadow-indigo-600/30">
                  {type === 'movie' ? 'Movie' : 'TV Series'}
                </span>
                {currentData.vote_average > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/15 text-xs font-bold text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {currentData.vote_average.toFixed(1)}
                  </span>
                )}
                {year && (
                  <span className="text-xs font-medium text-white/70 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {year}
                  </span>
                )}
                {currentData.runtime ? (
                  <span className="text-xs font-medium text-white/70 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> {currentData.runtime}m
                  </span>
                ) : currentData.number_of_seasons ? (
                  <span className="text-xs font-medium text-white/70 flex items-center gap-1">
                    <Tv className="w-3.5 h-3.5 text-indigo-400" /> {currentData.number_of_seasons} Season{currentData.number_of_seasons > 1 ? 's' : ''}
                  </span>
                ) : null}
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {title}
              </h2>

              {currentData.tagline && (
                <p className="text-xs sm:text-sm text-indigo-300 italic">
                  "{currentData.tagline}"
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  to={`/watch/${type}/${currentData.id}`}
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/40 border border-white/20 transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Streaming</span>
                </Link>

                <button
                  onClick={() => toggleWatchlist(currentData)}
                  className={`p-2.5 rounded-xl border font-semibold text-xs flex items-center gap-1.5 backdrop-blur-md transition-all ${
                    inList
                      ? 'bg-indigo-600/40 border-indigo-400 text-indigo-200'
                      : 'bg-white/10 border-white/15 text-white/80 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{inList ? 'In Watchlist' : 'Add to List'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body & Navigation Tabs */}
        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview & Details
            </button>
            <button
              onClick={() => setActiveTab('cast')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'cast'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Cast ({cast.length})
            </button>
            {trailer && (
              <button
                onClick={() => setActiveTab('trailer')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'trailer'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-400" /> Trailer
              </button>
            )}
          </div>

          {/* Tab Content: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-white/70 text-sm">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">
                  Storyline
                </h4>
                <p className="leading-relaxed text-white/85">
                  {currentData.overview || 'No overview available for this title.'}
                </p>
              </div>

              {/* Genres */}
              {currentData.genres && currentData.genres.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                    Genres
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentData.genres.map((g) => (
                      <span
                        key={g.id}
                        className="px-3 py-1 rounded-xl bg-white/5 text-xs font-medium text-white/80 border border-white/10 backdrop-blur-md"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* TV Specific Info */}
              {type === 'tv' && currentData.seasons && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                    Seasons Overview
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentData.seasons.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col backdrop-blur-md"
                      >
                        <span className="text-xs font-bold text-white">{s.name}</span>
                        <span className="text-[11px] text-white/50">
                          {s.episode_count} Episodes
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Cast */}
          {activeTab === 'cast' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {cast.length > 0 ? (
                cast.map((actor) => (
                  <div
                    key={actor.id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center flex flex-col items-center gap-2 backdrop-blur-md"
                  >
                    <img
                      src={
                        actor.profile_path
                          ? getImageUrl(actor.profile_path, 'w300')
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={actor.name}
                      className="w-16 h-16 rounded-full object-cover border border-white/15 shadow-md"
                    />
                    <div className="w-full">
                      <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                      <p className="text-[10px] text-white/50 truncate">{actor.character}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-white/50 text-xs">
                  Cast details unavailable.
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Trailer */}
          {activeTab === 'trailer' && trailer && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
