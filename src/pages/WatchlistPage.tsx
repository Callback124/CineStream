import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, History, Trash2, Play, Plus, Film, Tv, ArrowRight, Check } from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { getImageUrl, getBackdropUrl } from '../services/tmdb';

export const WatchlistPage: React.FC = () => {
  const { watchlist, removeFromWatchlist, history, removeFromHistory, clearHistory } = useWatch();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const filteredWatchlist = watchlist.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              My Library
            </h1>
            <p className="text-sm text-white/50">
              Manage your saved bookmarks and resume recently watched movies & TV series.
            </p>
          </div>

          {/* Primary View Switcher */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'watchlist'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Watchlist ({watchlist.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" /> History ({history.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Watchlist */}
        {activeTab === 'watchlist' && (
          <div className="space-y-6">
            {/* Filter controls */}
            {watchlist.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filterType === 'all' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('movie')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filterType === 'movie' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Movies Only
                  </button>
                  <button
                    onClick={() => setFilterType('tv')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filterType === 'tv' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    TV Shows Only
                  </button>
                </div>
              </div>
            )}

            {filteredWatchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {filteredWatchlist.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="group relative rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-xl"
                  >
                    <div className="relative aspect-[2/3] w-full bg-[#0c0c14]">
                      <img
                        src={getImageUrl(item.poster_path, 'w500')}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromWatchlist(item.id, item.type);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-rose-600 text-white/70 hover:text-white border border-white/10 transition-colors"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Detail Page Link & Play Button Overlay */}
                      <Link
                        to={`/detail/${item.type}/${item.id}`}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/20 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </Link>
                    </div>

                    <div className="p-3 space-y-1 bg-white/[0.02]">
                      <Link to={`/detail/${item.type}/${item.id}`}>
                        <h4 className="text-xs sm:text-sm font-bold text-white hover:text-indigo-400 truncate" title={item.title}>
                          {item.title}
                        </h4>
                      </Link>
                      <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span className="capitalize text-indigo-400 font-medium">{item.type}</span>
                        <span className="text-amber-300">★ {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 space-y-4 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 border border-white/10 text-indigo-400 flex items-center justify-center mx-auto">
                  <Bookmark className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
                <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
                  Explore trending movies and TV series, and click the "+" button to save titles here for easy access.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    to="/movies"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Browse Movies
                  </Link>
                  <Link
                    to="/tv"
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all"
                  >
                    Browse TV Shows
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: History */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {history.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">
                  Showing {history.length} recently streamed items
                </span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All History
                </button>
              </div>
            )}

            {history.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {history.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-xl"
                  >
                    <div className="relative aspect-video w-full bg-[#0c0c14]">
                      <img
                        src={getBackdropUrl(item.backdrop_path || item.poster_path, 'w780')}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />

                      <button
                        onClick={() => removeFromHistory(item.id, item.type)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-rose-600 text-white/70 hover:text-white border border-white/10 transition-colors"
                        title="Remove from History"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        to={
                          item.type === 'tv' && item.season && item.episode
                            ? `/player/tv/${item.id}/${item.season}/${item.episode}`
                            : `/player/${item.type}/${item.id}`
                        }
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/20 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </Link>
                    </div>

                    <div className="p-3.5 space-y-2 bg-white/[0.02]">
                      <div>
                        <Link to={`/detail/${item.type}/${item.id}`}>
                          <h4 className="text-sm font-bold text-white hover:text-indigo-400 truncate">{item.title}</h4>
                        </Link>
                        <p className="text-xs text-white/50 mt-0.5">
                          {item.type === 'tv' && item.season
                            ? `Season ${item.season} • Episode ${item.episode || 1} ${item.episodeName ? `(${item.episodeName})` : ''}`
                            : 'Full Movie'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={
                            item.type === 'tv' && item.season && item.episode
                              ? `/player/tv/${item.id}/${item.season}/${item.episode}`
                              : `/player/${item.type}/${item.id}`
                          }
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Resume</span>
                        </Link>
                        <Link
                          to={`/detail/${item.type}/${item.id}`}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs border border-white/10"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 space-y-4 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 flex items-center justify-center mx-auto">
                  <History className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">No Stream History</h3>
                <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
                  When you start watching any movie or episode, your progress and last played season/episode will automatically appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
