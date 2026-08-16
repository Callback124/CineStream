import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Plus,
  Check,
  Star,
  Calendar,
  Clock,
  Tv,
  Film,
  Share2,
  Users,
  Sparkles,
  ChevronRight,
  Info,
  Layers,
  Sparkle
} from 'lucide-react';
import { MediaItem, MediaType, TVSeason, TVEpisode } from '../types';
import { getMediaDetails, getTVSeasonDetails, getImageUrl, getBackdropUrl } from '../services/tmdb';
import { MediaRow } from '../components/MediaRow';
import { useWatch } from '../context/WatchContext';

export const DetailPage: React.FC = () => {
  const { type: rawType, id } = useParams<{ type?: string; id: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist, history } = useWatch();

  const mediaType: MediaType = rawType === 'tv' ? 'tv' : 'movie';
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);

  // TV Seasons & Episodes state
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonData, setSeasonData] = useState<TVSeason | null>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Find last watched episode from history if any
  const lastHistoryItem = history.find((h) => h.id === Number(id) && h.type === mediaType);
  const resumeSeason = lastHistoryItem?.season || 1;
  const resumeEpisode = lastHistoryItem?.episode || 1;

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    getMediaDetails(mediaType, id)
      .then((data) => {
        if (isMounted) {
          setMedia(data);
          setLoading(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      })
      .catch((err) => {
        console.error('Failed to load media details', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, mediaType]);

  // Load season episodes when selectedSeason changes for TV shows
  useEffect(() => {
    if (mediaType !== 'tv' || !id) return;
    let isMounted = true;
    setLoadingEpisodes(true);

    getTVSeasonDetails(id, selectedSeason)
      .then((data) => {
        if (isMounted) {
          setSeasonData(data);
          setLoadingEpisodes(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load season details', err);
        if (isMounted) setLoadingEpisodes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, selectedSeason, mediaType]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] pt-24 pb-20 px-4 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-white/50 animate-pulse">Loading movie details...</p>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-[#050507] pt-28 px-4 flex flex-col items-center justify-center text-white space-y-4">
        <h2 className="text-xl font-bold text-indigo-400">Media Not Found</h2>
        <p className="text-sm text-white/50">Could not retrieve information for this title.</p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
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
  const cast = media.credits?.cast?.slice(0, 12) || [];
  const recommendations = media.recommendations?.results || media.similar?.results || [];

  const totalSeasons = Math.max(
    media.number_of_seasons || 1,
    media.seasons?.filter((s) => s.season_number > 0).length || 1
  );

  const episodesList: TVEpisode[] = seasonData?.episodes || [];

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-24 selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl shadow-indigo-900/50 flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" /> Link copied to clipboard!
        </div>
      )}

      {/* Hero Backdrop Header Container */}
      <div className="relative w-full h-[55vh] sm:h-[65vh] lg:h-[70vh] min-h-[400px] overflow-hidden">
        {/* Backdrop Image */}
        <img
          src={getBackdropUrl(media.backdrop_path || media.poster_path, 'original')}
          alt={title}
          className="w-full h-full object-cover object-center"
        />

        {/* Gradient Overlays for Cinematic Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/70 via-transparent to-[#050507]" />

        {/* Top Floating Action Bar */}
        <div className="absolute top-4 sm:top-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-xl border border-white/10 text-xs font-semibold transition-all active:scale-95 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist(media)}
              className={`p-2.5 rounded-xl backdrop-blur-xl border transition-all active:scale-95 shadow-lg ${
                inList
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/30'
                  : 'bg-black/60 hover:bg-black/80 text-white/80 border-white/10'
              }`}
              title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-xl border border-white/10 transition-all active:scale-95 shadow-lg"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Bottom Banner Content on Large Displays */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-10 flex flex-col md:flex-row items-start md:items-end gap-6 z-20">
          {/* Main Poster on Desktop / Tablet */}
          <div className="hidden sm:block flex-shrink-0 w-44 md:w-52 lg:w-60 rounded-2xl overflow-hidden shadow-2xl shadow-black border-2 border-white/15 aspect-[2/3] bg-neutral-900 transform -mb-12 z-30">
            <img
              src={getImageUrl(media.poster_path, 'w500')}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Quick Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/30 border border-white/20">
                {mediaType === 'movie' ? 'Movie' : 'TV Series'}
              </span>

              {media.vote_average > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {media.vote_average.toFixed(1)} IMDb
                </span>
              )}

              {year && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 text-xs font-semibold backdrop-blur-md">
                  {year}
                </span>
              )}

              {media.runtime && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 text-xs font-semibold backdrop-blur-md">
                  {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                </span>
              )}

              {mediaType === 'tv' && media.number_of_seasons && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold backdrop-blur-md">
                  {media.number_of_seasons} Season{media.number_of_seasons > 1 ? 's' : ''}
                </span>
              )}

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold backdrop-blur-md">
                HD / 4K Ultra
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              {title}
            </h1>

            {media.tagline && (
              <p className="text-xs sm:text-sm font-medium italic text-indigo-300">
                "{media.tagline}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Container Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-14 space-y-10">
        {/* Mobile Poster & Action Buttons Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
          {/* Mobile Top Row: Poster thumbnail + Primary Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="sm:hidden w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg bg-neutral-900">
                <img
                  src={getImageUrl(media.poster_path, 'w300')}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:hidden space-y-1">
                <h2 className="text-base font-bold text-white line-clamp-1">{title}</h2>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  {year && <span>{year}</span>}
                  <span>•</span>
                  <span className="capitalize">{mediaType}</span>
                  {media.vote_average > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">★ {media.vote_average.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Prominent Play Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {mediaType === 'movie' ? (
                <Link
                  id="play-movie-btn"
                  to={`/player/movie/${media.id}`}
                  className="flex-1 sm:flex-initial px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/40 border border-white/20 active:scale-95 transition-all"
                >
                  <Play className="w-6 h-6 fill-white" />
                  <span>Play Movie Now</span>
                </Link>
              ) : (
                <Link
                  id="play-series-btn"
                  to={`/player/tv/${media.id}/${resumeSeason}/${resumeEpisode}`}
                  className="flex-1 sm:flex-initial px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/40 border border-white/20 active:scale-95 transition-all"
                >
                  <Play className="w-6 h-6 fill-white" />
                  <span>
                    {lastHistoryItem ? `Resume S${resumeSeason} E${resumeEpisode}` : 'Watch Episode 1'}
                  </span>
                </Link>
              )}

              <button
                onClick={() => toggleWatchlist(media)}
                className={`px-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                  inList
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                }`}
              >
                {inList ? (
                  <>
                    <Check className="w-5 h-5 text-indigo-400" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Genres Pills */}
          {media.genres && media.genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              <span className="text-xs text-white/40 font-medium mr-1">Genres:</span>
              {media.genres.map((g) => (
                <Link
                  key={g.id}
                  to={`/genres?genre=${g.id}&type=${mediaType}`}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-colors"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          )}

          {/* Story Overview */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">Story Overview</h3>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              {media.overview || 'No detailed synopsis available for this title.'}
            </p>
          </div>

          {/* Cast Members */}
          {cast.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Users className="w-4 h-4" /> Top Cast
              </h3>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {cast.map((actor) => (
                  <div
                    key={actor.id}
                    className="flex-shrink-0 w-24 sm:w-28 text-center space-y-1.5 p-2 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden bg-white/10 border border-white/10 shadow-md">
                      <img
                        src={getImageUrl(actor.profile_path, 'w300')}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                    <p className="text-[10px] text-white/50 truncate">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TV SERIES: SEASONS & EPISODES SECTION WITH THUMBNAILS */}
        {mediaType === 'tv' && (
          <div id="series-episodes-section" className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Tv className="w-6 h-6 text-indigo-400" />
                  <span>Seasons & Episodes</span>
                </h2>
                <p className="text-xs text-white/50">
                  Select a season and episode to start instant playback
                </p>
              </div>

              {/* Season Selection Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((sNum) => (
                  <button
                    key={sNum}
                    onClick={() => setSelectedSeason(sNum)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                      selectedSeason === sNum
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-white/20'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                    }`}
                  >
                    Season {sNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Episodes List with Thumbnails */}
            {loadingEpisodes ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-white/50">Loading Season {selectedSeason} episodes...</p>
              </div>
            ) : episodesList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {episodesList.map((ep) => {
                  const stillUrl = ep.still_path
                    ? getImageUrl(ep.still_path, 'w500')
                    : getBackdropUrl(media.backdrop_path, 'w780');

                  return (
                    <div
                      key={ep.id || ep.episode_number}
                      onClick={() => navigate(`/player/tv/${media.id}/${selectedSeason}/${ep.episode_number}`)}
                      className="group relative flex flex-col sm:flex-row gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-indigo-500/50 transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.99]"
                    >
                      {/* Episode Thumbnail Container */}
                      <div className="relative aspect-video sm:w-44 md:w-48 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0">
                        <img
                          src={stillUrl}
                          alt={ep.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                        {/* Play Overlay Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-600/90 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Episode Number Badge */}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                          EP {ep.episode_number}
                        </div>

                        {ep.runtime && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-medium text-white/80">
                            {ep.runtime}m
                          </div>
                        )}
                      </div>

                      {/* Episode Information */}
                      <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {ep.episode_number}. {ep.name || `Episode ${ep.episode_number}`}
                          </h4>
                          {ep.vote_average > 0 && (
                            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5 flex-shrink-0">
                              ★ {ep.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                          {ep.overview || 'No episode description available.'}
                        </p>

                        {ep.air_date && (
                          <div className="text-[10px] text-white/40 pt-1">
                            Aired: {ep.air_date}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-white/50">
                No episodes found for this season.
              </div>
            )}
          </div>
        )}

        {/* Recommendations / Similar Titles */}
        {recommendations.length > 0 && (
          <div className="pt-4">
            <MediaRow
              title="You May Also Like"
              items={recommendations}
              mediaType={mediaType}
            />
          </div>
        )}
      </div>
    </div>
  );
};
