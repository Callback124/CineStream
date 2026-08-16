import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Tv,
  Film,
  Plus,
  Check,
  Share2,
  Users,
  Sparkles,
  Play
} from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { getMediaDetails, getImageUrl } from '../services/tmdb';
import { WatchPlayer } from '../components/WatchPlayer';
import { MediaRow } from '../components/MediaRow';
import { DetailsModal } from '../components/DetailsModal';
import { useWatch } from '../context/WatchContext';

export const WatchPage: React.FC = () => {
  const { type: rawType, id, season, episode } = useParams<{
    type?: string;
    id: string;
    season?: string;
    episode?: string;
  }>();

  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatch();

  const mediaType: MediaType = rawType === 'tv' ? 'tv' : 'movie';
  const currentSeasonNum = season ? parseInt(season, 10) : 1;
  const currentEpisodeNum = episode ? parseInt(episode, 10) : 1;

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setLoading(true);

    getMediaDetails(mediaType, id)
      .then((data) => {
        if (isMounted) {
          setMedia(data);
          setLoading(false);
          // Scroll smoothly to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch((err) => {
        console.error('Failed to load media details for player', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, mediaType]);

  const handleEpisodeChange = (newSeason: number, newEpisode: number) => {
    navigate(`/watch/tv/${id}/${newSeason}/${newEpisode}`, { replace: true });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] pt-20 px-4 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-white/50">Loading stream media & servers...</p>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-[#050507] pt-28 px-4 flex flex-col items-center justify-center text-white space-y-4">
        <h2 className="text-xl font-bold text-indigo-400">Media Not Found</h2>
        <p className="text-sm text-white/50">Could not retrieve video data for ID: {id}</p>
        <Link
          to="/"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const title = media.title || media.name || 'Untitled';
  const inList = isInWatchlist(media.id, mediaType);
  const releaseDate = media.release_date || media.first_air_date || '';
  const year = releaseDate ? releaseDate.substring(0, 4) : '';
  const cast = media.credits?.cast?.slice(0, 10) || [];
  const recommendations = media.recommendations?.results || media.similar?.results || [];

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-16 sm:pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between text-xs text-white/50">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="capitalize">{mediaType}</span>
            <span>/</span>
            <span className="text-white/80 truncate max-w-xs">{title}</span>
            {mediaType === 'tv' && (
              <span className="text-indigo-400 font-bold">
                (S{currentSeasonNum} E{currentEpisodeNum})
              </span>
            )}
          </div>
        </div>

        {/* Video Player Component */}
        <WatchPlayer
          media={media}
          initialSeason={currentSeasonNum}
          initialEpisode={currentEpisodeNum}
          onEpisodeChange={handleEpisodeChange}
        />

        {/* Title, Badges & Actions */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold uppercase tracking-wide border border-white/20 shadow-md shadow-indigo-600/30">
                  {mediaType === 'movie' ? 'Movie' : 'TV Series'}
                </span>

                {media.vote_average > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {media.vote_average.toFixed(1)} IMDb
                  </span>
                )}

                {year && (
                  <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-white/80">
                    {year}
                  </span>
                )}

                {media.runtime ? (
                  <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-white/80 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" /> {media.runtime} min
                  </span>
                ) : media.number_of_seasons ? (
                  <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-white/80 flex items-center gap-1">
                    <Tv className="w-3 h-3 text-indigo-400" /> {media.number_of_seasons} Seasons
                  </span>
                ) : null}

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                  Full HD / 4K
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {title}
              </h1>

              {media.tagline && (
                <p className="text-sm font-medium italic text-indigo-300">
                  "{media.tagline}"
                </p>
              )}

              <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                {media.overview || 'No synopsis provided for this title.'}
              </p>

              {/* Genres list */}
              {media.genres && media.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {media.genres.map((g) => (
                    <span
                      key={g.id}
                      className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80 backdrop-blur-md"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => toggleWatchlist(media)}
                className={`w-full px-5 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-md ${
                  inList
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                }`}
              >
                {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{inList ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/70 hover:text-white flex items-center justify-center gap-2 transition-all backdrop-blur-md"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedToast ? 'Link Copied!' : 'Share Stream'}</span>
              </button>
            </div>
          </div>

          {/* Cast Members Strip */}
          {cast.length > 0 && (
            <div className="pt-6 border-t border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" /> Starring Cast
              </h3>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {cast.map((actor) => (
                  <div
                    key={actor.id}
                    className="flex-shrink-0 w-24 sm:w-28 text-center space-y-1 group"
                  >
                    <img
                      src={
                        actor.profile_path
                          ? getImageUrl(actor.profile_path, 'w300')
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={actor.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto object-cover border-2 border-white/10 group-hover:border-indigo-400 transition-colors shadow-md"
                    />
                    <p className="text-xs font-bold text-white/90 truncate group-hover:text-indigo-400">
                      {actor.name}
                    </p>
                    <p className="text-[10px] text-white/50 truncate">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommended & Similar Media Row */}
        {recommendations.length > 0 && (
          <MediaRow
            title="You May Also Like"
            subtitle="Similar recommendations based on this title"
            icon={<Sparkles className="w-5 h-5 text-amber-300" />}
            items={recommendations}
            onOpenDetails={(item) => setSelectedDetailsItem(item)}
          />
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
