import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Server,
  RefreshCw,
  Maximize,
  Minimize,
  Tv,
  Film,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  X,
  Check,
  ShieldAlert,
  ExternalLink,
  Info
} from 'lucide-react';
import { MediaItem, MediaType, TVEpisode, TVSeason, StreamSource } from '../types';
import { STREAM_SOURCES } from '../services/sources';
import { getMediaDetails, getTVSeasonDetails, getImageUrl } from '../services/tmdb';
import { useWatch } from '../context/WatchContext';

export const PlayerPage: React.FC = () => {
  const { type: rawType, id, season, episode } = useParams<{
    type?: string;
    id: string;
    season?: string;
    episode?: string;
  }>();

  const navigate = useNavigate();
  const { preferredServer, setPreferredServer, saveToHistory } = useWatch();

  const mediaType: MediaType = rawType === 'tv' ? 'tv' : 'movie';
  const currentSeasonNum = season ? parseInt(season, 10) : 1;
  const currentEpisodeNum = episode ? parseInt(episode, 10) : 1;

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(true);

  const [activeSourceId, setActiveSourceId] = useState<string>(preferredServer || 'max');
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [loadingUrl, setLoadingUrl] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // TV Seasons & Episodes
  const [seasonData, setSeasonData] = useState<TVSeason | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(currentSeasonNum);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(currentEpisodeNum);

  // UI Modals / Drawers
  const [showServerDrawer, setShowServerDrawer] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Media Info
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoadingMedia(true);

    getMediaDetails(mediaType, id)
      .then((data) => {
        if (isMounted) {
          setMedia(data);
          setLoadingMedia(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load player media info', err);
        if (isMounted) setLoadingMedia(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, mediaType]);

  // 2. Sync Season & Episode params
  useEffect(() => {
    setSelectedSeason(currentSeasonNum);
    setSelectedEpisode(currentEpisodeNum);
  }, [currentSeasonNum, currentEpisodeNum]);

  // 3. Fetch TV Season details for episodes list & names
  useEffect(() => {
    if (mediaType !== 'tv' || !id) return;
    let isMounted = true;

    getTVSeasonDetails(id, selectedSeason)
      .then((data) => {
        if (isMounted) {
          setSeasonData(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch season data in player', err);
      });

    return () => {
      isMounted = false;
    };
  }, [id, selectedSeason, mediaType]);

  // 4. Resolve Stream URL asynchronously (supports string or Promise<string> like Full Hindi IMDb)
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoadingUrl(true);

    const source = STREAM_SOURCES.find((s) => s.id === activeSourceId) || STREAM_SOURCES[0];
    const urlResult = source.getUrl(id, mediaType, selectedSeason, selectedEpisode);

    if (urlResult instanceof Promise) {
      urlResult
        .then((url) => {
          if (isMounted) {
            setResolvedUrl(url);
            setLoadingUrl(false);
          }
        })
        .catch((err) => {
          console.error('Error resolving async source URL', err);
          if (isMounted) {
            setResolvedUrl(`https://ythd.org/embed/${id}`);
            setLoadingUrl(false);
          }
        });
    } else {
      setResolvedUrl(urlResult);
      setLoadingUrl(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id, mediaType, selectedSeason, selectedEpisode, activeSourceId, iframeKey]);

  // 5. Save to Watch History
  useEffect(() => {
    if (!media) return;
    const title = media.title || media.name || 'Untitled';
    const currentEpObj = seasonData?.episodes?.find((e) => e.episode_number === selectedEpisode);

    saveToHistory({
      id: media.id,
      type: mediaType,
      title,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      season: mediaType === 'tv' ? selectedSeason : undefined,
      episode: mediaType === 'tv' ? selectedEpisode : undefined,
      episodeName: currentEpObj?.name,
    });
  }, [media, mediaType, selectedSeason, selectedEpisode, seasonData]);

  // Handle Server Switch
  const handleServerSelect = (sourceId: string) => {
    setActiveSourceId(sourceId);
    setPreferredServer(sourceId);
    setShowServerDrawer(false);
    setIframeKey((k) => k + 1);
  };

  // Handle Episode Navigation
  const handleEpisodeChange = (newSeason: number, newEp: number) => {
    setSelectedSeason(newSeason);
    setSelectedEpisode(newEp);
    setShowEpisodesDrawer(false);
    navigate(`/player/tv/${id}/${newSeason}/${newEp}`, { replace: true });
    setIframeKey((k) => k + 1);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.warn('Fullscreen error:', err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.warn('Exit fullscreen error:', err));
    }
  };

  // Auto-hide controls timer
  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showServerDrawer && !showEpisodesDrawer) {
        setShowControls(false);
      }
    }, 4500);
  };

  const activeSource = STREAM_SOURCES.find((s) => s.id === activeSourceId) || STREAM_SOURCES[0];
  const title = media?.title || media?.name || 'Loading player...';
  const totalSeasons = Math.max(media?.number_of_seasons || 1, 1);
  const episodesList: TVEpisode[] = seasonData?.episodes || [];
  const currentEpObj = episodesList.find((e) => e.episode_number === selectedEpisode);

  const hasPrevEpisode = selectedEpisode > 1 || selectedSeason > 1;
  const hasNextEpisode = selectedEpisode < (episodesList.length || 8) || selectedSeason < totalSeasons;

  const handlePrevEp = () => {
    if (selectedEpisode > 1) {
      handleEpisodeChange(selectedSeason, selectedEpisode - 1);
    } else if (selectedSeason > 1) {
      handleEpisodeChange(selectedSeason - 1, 1);
    }
  };

  const handleNextEp = () => {
    if (selectedEpisode < episodesList.length) {
      handleEpisodeChange(selectedSeason, selectedEpisode + 1);
    } else if (selectedSeason < totalSeasons) {
      handleEpisodeChange(selectedSeason + 1, 1);
    }
  };

  return (
    <div
      ref={playerContainerRef}
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      className="fixed inset-0 w-screen h-screen bg-black z-50 overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Top Floating Controls Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-3 sm:p-5 transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Back to Details Button */}
          <button
            onClick={() => navigate(`/detail/${mediaType}/${id}`)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/15 text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Details</span>
          </button>

          {/* Title & Episode Info */}
          <div className="flex-1 text-center min-w-0 px-2">
            <h1 className="text-xs sm:text-base font-extrabold text-white truncate drop-shadow">
              {title}
            </h1>
            {mediaType === 'tv' && (
              <p className="text-[11px] sm:text-xs text-indigo-300 font-semibold truncate">
                Season {selectedSeason} • Episode {selectedEpisode}
                {currentEpObj?.name ? `: ${currentEpObj.name}` : ''}
              </p>
            )}
          </div>

          {/* Right Action Controls: Server Switcher, Fullscreen, Reload */}
          <div className="flex items-center gap-2">
            {/* Server Change Button */}
            <button
              id="server-change-btn"
              onClick={() => {
                setShowServerDrawer(true);
                setShowControls(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-600/40 border border-white/20 active:scale-95 transition-all"
            >
              <Server className="w-4 h-4" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{activeSource.name}</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-white/20 text-[10px] font-bold">
                {activeSource.badge || 'HD'}
              </span>
            </button>

            {/* Reload Stream Button */}
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              title="Refresh Stream"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/15 active:scale-95 transition-all shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Native Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/15 active:scale-95 transition-all shadow-lg"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Player Container (Zero restrictive sandbox to prevent sandbox detection errors) */}
      <div className="relative w-full h-full flex-1 bg-black flex items-center justify-center">
        {loadingUrl || loadingMedia ? (
          <div className="flex flex-col items-center justify-center text-white space-y-3 z-10">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs sm:text-sm font-bold text-white/70 animate-pulse">
              Connecting to {activeSource.name}...
            </p>
          </div>
        ) : (
          <iframe
            key={`${activeSourceId}-${iframeKey}-${selectedSeason}-${selectedEpisode}`}
            src={resolvedUrl}
            className="w-full h-full border-0 bg-black"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope; clipboard-write; screen-wake-lock"
            allowFullScreen
            referrerPolicy="origin"
            title={`${title} Player`}
          />
        )}
      </div>

      {/* Bottom Floating Bar for TV Series (Previous / Next / Episodes List) */}
      {mediaType === 'tv' && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 sm:p-5 transition-opacity duration-300 ${
            showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3 bg-black/70 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl">
            <button
              onClick={handlePrevEp}
              disabled={!hasPrevEpisode}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                hasPrevEpisode
                  ? 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Ep</span>
            </button>

            {/* Episodes Drawer Button */}
            <button
              onClick={() => {
                setShowEpisodesDrawer(true);
                setShowControls(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
            >
              <ListOrdered className="w-4 h-4" />
              <span>Episodes List</span>
            </button>

            <button
              onClick={handleNextEp}
              disabled={!hasNextEpisode}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                hasNextEpisode
                  ? 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              <span>Next Ep</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 21 EMBED SERVERS SELECTION DRAWER / MODAL */}
      {showServerDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#0e0e18] border border-white/15 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Select Streaming Server</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                      21 Available
                    </span>
                  </h3>
                  <p className="text-xs text-white/50">
                    If current server buffers or fails, switch instantly to another server
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowServerDrawer(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Servers List Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STREAM_SOURCES.map((source, index) => {
                const isSelected = source.id === activeSourceId;
                return (
                  <button
                    key={source.id}
                    onClick={() => handleServerSelect(source.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 text-left active:scale-[0.98] ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-white/30 w-5">#{index + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-white truncate">{source.name}</p>
                        <p className="text-[11px] text-white/50">
                          {source.quality || '1080p'} • High Speed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {source.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                            source.badge.includes('Hindi')
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : source.badge.includes('4K')
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {source.badge}
                        </span>
                      )}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Server Drawer Footer */}
            <div className="p-3.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
              <span>All servers bypass sandbox limits & stream directly</span>
              <button
                onClick={() => window.open(resolvedUrl, '_blank')}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TV SHOW EPISODES QUICK DRAWER */}
      {showEpisodesDrawer && mediaType === 'tv' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#0e0e18] border border-white/15 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">Select Episode</h3>
                <p className="text-xs text-white/50">Season {selectedSeason}</p>
              </div>

              {/* Seasons Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/15 outline-none"
                >
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s} className="bg-[#0e0e18] text-white">
                      Season {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowEpisodesDrawer(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Episodes List */}
            <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh] space-y-2">
              {episodesList.map((ep) => {
                const isCurrent = ep.episode_number === selectedEpisode;
                return (
                  <button
                    key={ep.id || ep.episode_number}
                    onClick={() => handleEpisodeChange(selectedSeason, ep.episode_number)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all active:scale-[0.99] ${
                      isCurrent
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-white/80'
                    }`}
                  >
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 relative">
                      <img
                        src={
                          ep.still_path
                            ? getImageUrl(ep.still_path, 'w300')
                            : getImageUrl(media?.backdrop_path, 'w300')
                        }
                        alt={ep.name}
                        className="w-full h-full object-cover"
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-indigo-600/60 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        EP {ep.episode_number}: {ep.name || `Episode ${ep.episode_number}`}
                      </p>
                      <p className="text-[11px] text-white/50 truncate">
                        {ep.runtime ? `${ep.runtime}m` : ''} {ep.overview}
                      </p>
                    </div>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded bg-indigo-500 text-white text-[10px] font-bold">
                        Playing
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
