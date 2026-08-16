import React, { useState, useEffect, useRef } from 'react';
import {
  Server,
  RefreshCw,
  Maximize,
  Minimize,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Tv,
  Film,
  Sparkles,
  Info,
  ShieldAlert,
  Play,
  CheckCircle2,
  ListOrdered,
  LayoutGrid
} from 'lucide-react';
import { MediaItem, MediaType, TVEpisode, TVSeason } from '../types';
import { STREAM_SOURCES } from '../services/sources';
import { getTVSeasonDetails, getImageUrl } from '../services/tmdb';
import { useWatch } from '../context/WatchContext';

interface WatchPlayerProps {
  media: MediaItem;
  initialSeason?: number;
  initialEpisode?: number;
  onEpisodeChange?: (season: number, episode: number) => void;
}

export const WatchPlayer: React.FC<WatchPlayerProps> = ({
  media,
  initialSeason = 1,
  initialEpisode = 1,
  onEpisodeChange,
}) => {
  const { preferredServer, setPreferredServer, saveToHistory, autoPlayNext, setAutoPlayNext } = useWatch();

  const type: MediaType = media.media_type || (media.title ? 'movie' : 'tv');
  const [activeSourceId, setActiveSourceId] = useState<string>(preferredServer || 'max');
  const [selectedSeason, setSelectedSeason] = useState<number>(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(initialEpisode);
  const [currentSeasonData, setCurrentSeasonData] = useState<TVSeason | null>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [showServerHelp, setShowServerHelp] = useState(false);
  const [episodeViewMode, setEpisodeViewMode] = useState<'grid' | 'list'>('grid');

  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Sync initial props
  useEffect(() => {
    setSelectedSeason(initialSeason);
    setSelectedEpisode(initialEpisode);
  }, [initialSeason, initialEpisode]);

  // Fetch season details when series or season changes
  useEffect(() => {
    if (type !== 'tv') return;

    let isMounted = true;
    setLoadingEpisodes(true);

    getTVSeasonDetails(media.id, selectedSeason)
      .then((data) => {
        if (isMounted) {
          setCurrentSeasonData(data);
          setLoadingEpisodes(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch season episodes', err);
        if (isMounted) setLoadingEpisodes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [media.id, selectedSeason, type]);

  // Get active source object
  const activeSource = STREAM_SOURCES.find((s) => s.id === activeSourceId) || STREAM_SOURCES[0];

  // Calculate current iframe URL
  const currentUrl = activeSource.getUrl(media.id, type, selectedSeason, selectedEpisode);

  // Save to history & continue watching
  useEffect(() => {
    const title = media.title || media.name || 'Untitled';
    const currentEpisodeObj = currentSeasonData?.episodes?.find(
      (ep) => ep.episode_number === selectedEpisode
    );

    saveToHistory({
      id: media.id,
      type,
      title,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      season: type === 'tv' ? selectedSeason : undefined,
      episode: type === 'tv' ? selectedEpisode : undefined,
      episodeName: currentEpisodeObj?.name,
    });
  }, [media.id, type, selectedSeason, selectedEpisode, currentSeasonData]);

  // Handle server switch
  const handleServerChange = (serverId: string) => {
    setActiveSourceId(serverId);
    setPreferredServer(serverId);
    setIframeKey((prev) => prev + 1); // Refresh iframe
  };

  // Reload current stream
  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  // Switch Season
  const handleSeasonSelect = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(1);
    onEpisodeChange?.(seasonNum, 1);
    setIframeKey((prev) => prev + 1);
  };

  // Switch Episode
  const handleEpisodeSelect = (epNum: number) => {
    setSelectedEpisode(epNum);
    onEpisodeChange?.(selectedSeason, epNum);
    setIframeKey((prev) => prev + 1);
  };

  // Total seasons available
  const totalSeasons = Math.max(
    media.number_of_seasons || 1,
    media.seasons?.filter((s) => s.season_number > 0).length || 1
  );

  // Available episodes for currently selected season
  const episodesList: TVEpisode[] = currentSeasonData?.episodes || [];
  const currentEp = episodesList.find((e) => e.episode_number === selectedEpisode);

  // Next / Previous Episode navigation
  const hasPrevEp = selectedEpisode > 1 || selectedSeason > 1;
  const totalEpsInCurrentSeason = episodesList.length || 8;
  const hasNextEp = selectedEpisode < totalEpsInCurrentSeason || selectedSeason < totalSeasons;

  const handlePrevEpisode = () => {
    if (selectedEpisode > 1) {
      handleEpisodeSelect(selectedEpisode - 1);
    } else if (selectedSeason > 1) {
      handleSeasonSelect(selectedSeason - 1);
    }
  };

  const handleNextEpisode = () => {
    if (selectedEpisode < totalEpsInCurrentSeason) {
      handleEpisodeSelect(selectedEpisode + 1);
    } else if (selectedSeason < totalSeasons) {
      handleSeasonSelect(selectedSeason + 1);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  return (
    <div
      ref={playerContainerRef}
      className={`space-y-6 transition-all duration-300 ${
        isCinemaMode ? 'fixed inset-0 z-50 bg-black p-4 sm:p-8 overflow-y-auto' : 'w-full'
      }`}
    >
      {/* Top Player Status Bar (When in Cinema mode) */}
      {isCinemaMode && (
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <span className="text-indigo-400 font-bold text-lg">CineStream Cinema Mode</span>
            <span className="text-white/60 text-sm">
              {media.title || media.name}{' '}
              {type === 'tv' && `— Season ${selectedSeason} Ep ${selectedEpisode}`}
            </span>
          </div>
          <button
            onClick={() => setIsCinemaMode(false)}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10"
          >
            Exit Theater Mode
          </button>
        </div>
      )}

      {/* Primary Video Player Container (16:9 Aspect Ratio) */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl group">
        <div className="relative aspect-video w-full">
          {/* Iframe with requested sandboxing and full capabilities */}
          <iframe
            key={iframeKey}
            src={currentUrl}
            title={media.title || media.name || 'Stream Player'}
            allowFullScreen
            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
            className="w-full h-full border-0 bg-black"
          />
        </div>

        {/* Player Overlay Controls Quick Bar */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity z-20 pointer-events-auto">
          <button
            onClick={handleReload}
            className="p-2 rounded-xl bg-black/60 hover:bg-white/20 text-white backdrop-blur-xl border border-white/15 text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors"
            title="Reload Video Stream"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <button
            onClick={() => setIsCinemaMode(!isCinemaMode)}
            className="p-2 rounded-xl bg-black/60 hover:bg-white/20 text-white backdrop-blur-xl border border-white/15 text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors"
            title={isCinemaMode ? 'Default View' : 'Cinema Theater Mode'}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">{isCinemaMode ? 'Standard' : 'Theater'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/60 hover:bg-white/20 text-white backdrop-blur-xl border border-white/15 text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors"
            title="Fullscreen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Server Switching Panel & Stream Info */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Server Selection Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Select Streaming Server</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online
                </span>
              </h3>
              <p className="text-xs text-white/50">
                If the stream buffers, shows an error, or is slow, choose another server below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowServerHelp(!showServerHelp)}
              className="text-xs text-white/70 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>Server Tips</span>
            </button>
          </div>
        </div>

        {/* Server Select Button Group */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {STREAM_SOURCES.map((source) => {
            const isActive = source.id === activeSourceId;
            return (
              <button
                key={source.id}
                id={`server-btn-${source.id}`}
                onClick={() => handleServerChange(source.id)}
                className={`relative px-3.5 py-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/50 shadow-xl shadow-indigo-600/30 scale-[1.02]'
                    : 'bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold truncate">{source.name}</span>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                  <span
                    className={`font-semibold px-1 py-0.2 rounded text-[9px] ${
                      isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {source.quality || '1080p'}
                  </span>
                  {source.badge && (
                    <span
                      className={`truncate ${
                        isActive ? 'text-indigo-100' : 'text-white/40 group-hover:text-white/60'
                      }`}
                    >
                      {source.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Helpful note for sandbox/ad blocking */}
        {showServerHelp && (
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white/80 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>Ad & Sandbox Protection Active</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Third-party video players often attempt pop-up redirects. CineStream automatically applies sandboxing (<code className="text-indigo-300">sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"</code>) to safeguard your browsing experience. If you encounter audio-only playback or black screens, simply switch to <strong>VidPro</strong> or <strong>4K</strong>.
            </p>
          </div>
        )}
      </div>

      {/* TV Series Season & Episode Dynamic Selector */}
      {type === 'tv' && (
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-5">
          {/* Season Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Seasons & Episodes</h3>
              <span className="text-xs text-white/50">
                (Season {selectedSeason} • Episode {selectedEpisode})
              </span>
            </div>

            {/* Quick Next/Prev Episode Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevEpisode}
                disabled={!hasPrevEp}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-xs font-semibold text-white/80 hover:text-white border border-white/10 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Ep</span>
              </button>

              <button
                onClick={handleNextEpisode}
                disabled={!hasNextEp}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-30 text-xs font-semibold text-white flex items-center gap-1 shadow-md shadow-indigo-600/30 border border-white/20 transition-colors"
              >
                <span>Next Ep</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* View Switcher: Grid vs List */}
              <div className="hidden sm:flex items-center border border-white/10 rounded-xl p-0.5 bg-black/40">
                <button
                  onClick={() => setEpisodeViewMode('grid')}
                  className={`p-1 rounded-lg ${
                    episodeViewMode === 'grid'
                      ? 'bg-white/15 text-white'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEpisodeViewMode('list')}
                  className={`p-1 rounded-lg ${
                    episodeViewMode === 'list'
                      ? 'bg-white/15 text-white'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                  title="List View"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Season Pills Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((sNum) => {
              const isSelected = sNum === selectedSeason;
              return (
                <button
                  key={sNum}
                  id={`season-pill-${sNum}`}
                  onClick={() => handleSeasonSelect(sNum)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40 scale-105'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Season {sNum}
                </button>
              );
            })}
          </div>

          {/* Episode List / Grid */}
          {loadingEpisodes ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 py-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-white/5 animate-pulse border border-white/10"
                />
              ))}
            </div>
          ) : episodeViewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {episodesList.map((ep) => {
                const isCurrent = ep.episode_number === selectedEpisode;
                return (
                  <button
                    key={ep.id || ep.episode_number}
                    id={`episode-btn-${ep.episode_number}`}
                    onClick={() => handleEpisodeSelect(ep.episode_number)}
                    className={`relative p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all group overflow-hidden ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border-indigo-400/50 shadow-xl shadow-indigo-600/40 scale-[1.02]'
                        : 'bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {/* Background Still Image preview */}
                    {ep.still_path && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 bg-black/50">
                        <img
                          src={getImageUrl(ep.still_path, 'w300')}
                          alt={ep.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-70 group-hover:opacity-100"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                            <Play className="w-5 h-5 fill-white text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold">
                        Ep {ep.episode_number}
                      </span>
                      {ep.runtime && (
                        <span
                          className={`text-[10px] ${
                            isCurrent ? 'text-indigo-100' : 'text-white/40'
                          }`}
                        >
                          {ep.runtime}m
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-[11px] truncate mt-0.5 font-medium ${
                        isCurrent ? 'text-white' : 'text-white/60 group-hover:text-white'
                      }`}
                      title={ep.name}
                    >
                      {ep.name || `Episode ${ep.episode_number}`}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {episodesList.map((ep) => {
                const isCurrent = ep.episode_number === selectedEpisode;
                return (
                  <button
                    key={ep.id || ep.episode_number}
                    onClick={() => handleEpisodeSelect(ep.episode_number)}
                    className={`w-full p-3 rounded-xl border flex items-center gap-4 text-left transition-all group ${
                      isCurrent
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg backdrop-blur-md'
                        : 'bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="relative w-24 sm:w-32 aspect-video rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                      <img
                        src={getImageUrl(ep.still_path || media.backdrop_path, 'w300')}
                        alt={ep.name}
                        className="w-full h-full object-cover"
                      />
                      {isCurrent ? (
                        <div className="absolute inset-0 bg-indigo-600/60 flex items-center justify-center">
                          <Play className="w-5 h-5 fill-white" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-4 h-4 fill-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400">
                          Episode {ep.episode_number}
                        </span>
                        {ep.air_date && (
                          <span className="text-[10px] text-white/40">{ep.air_date}</span>
                        )}
                        {ep.runtime && (
                          <span className="text-[10px] text-white/40">• {ep.runtime} min</span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-white truncate mt-0.5">
                        {ep.name}
                      </h4>
                      {ep.overview && (
                        <p className="text-xs text-white/60 line-clamp-2 mt-1">
                          {ep.overview}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
