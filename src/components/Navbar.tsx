import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Tv, Search, Bookmark, Sparkles, X, Menu, Settings, Play, Check } from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { searchMedia, getImageUrl } from '../services/tmdb';
import { MediaItem } from '../types';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const { watchlist, customApiKey, setCustomApiKey } = useWatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchMedia(searchQuery);
        setSearchResults(results.slice(0, 6));
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'TV Series', path: '/tv' },
    { name: 'Genres', path: '/genres' },
    { name: 'Watchlist', path: '/watchlist', badge: watchlist.length },
  ];

  const handleSaveApiKey = () => {
    setCustomApiKey(tempApiKey);
    setShowSettingsModal(false);
  };

  return (
    <>
      <header
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/[0.06] backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50 py-3'
            : 'bg-white/[0.03] backdrop-blur-md border-b border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/20 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white group-hover:text-indigo-400 transition-colors">
                  CINE<span className="text-indigo-500">STREAM</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400/80 -mt-1">
                  Ultra HD Stream
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 relative ${
                      isActive
                        ? 'text-white bg-white/15 border border-white/15 shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {link.name}
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] font-bold rounded-full border border-indigo-400/40">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Search & Actions */}
          <div className="flex items-center gap-3 flex-1 justify-end max-w-md">
            {/* Search Input Container */}
            <div ref={searchContainerRef} className="relative w-full max-w-xs sm:max-w-sm">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  id="navbar-search-input"
                  type="text"
                  placeholder="Search movies, series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                  className="w-full bg-white/10 text-xs sm:text-sm text-white placeholder-white/40 pl-9 pr-8 py-2 rounded-full border border-white/10 backdrop-blur-md focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-inner"
                />
                <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Search Instant Results Dropdown */}
              {showSearchDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[#0c0c16]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-white/60 flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      Searching TMDB catalog...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((item) => {
                        const title = item.title || item.name || 'Untitled';
                        const year = (item.release_date || item.first_air_date || '').substring(0, 4);
                        return (
                          <Link
                            key={`${item.media_type}-${item.id}`}
                            to={`/watch/${item.media_type}/${item.id}`}
                            onClick={() => setShowSearchDropdown(false)}
                            className="flex items-center gap-3 p-2.5 hover:bg-white/10 transition-colors group"
                          >
                            <img
                              src={getImageUrl(item.poster_path, 'w300')}
                              alt={title}
                              className="w-10 h-14 object-cover rounded-lg border border-white/10 shadow-md flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-white/90 group-hover:text-indigo-400 truncate">
                                {title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-white/50 mt-0.5">
                                <span className="uppercase px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-bold text-white/80 border border-white/5">
                                  {item.media_type}
                                </span>
                                {year && <span>{year}</span>}
                                {item.vote_average > 0 && (
                                  <span className="text-amber-400 font-medium">
                                    ★ {item.vote_average.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        View all results for "{searchQuery}" →
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center text-xs text-white/60">
                      No movies or TV shows found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings / API Key Button */}
            <button
              id="api-key-settings-btn"
              onClick={() => {
                setTempApiKey(customApiKey);
                setShowSettingsModal(true);
              }}
              title="TMDB API Configuration"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white backdrop-blur-md"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0c0c16]/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'text-white bg-indigo-600/30 text-indigo-400 border border-indigo-500/40'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* TMDB API Key Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0c0c16]/90 border border-white/10 backdrop-blur-2xl rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">TMDB API Configuration</h3>
                  <p className="text-xs text-white/50">Manage data source credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-white/80">
              <p className="text-white/60 leading-relaxed">
                CineStream automatically uses our pre-configured TMDB client & live fallback catalog. If you have your own personal TMDB v3 API Key, you can insert it below for unrestricted personalized live queries.
              </p>
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
                  TMDB API Key (v3 auth)
                </label>
                <input
                  type="text"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="e.g. 4e44d9029b1270a757cddc766a1bcb63"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 font-mono text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <p className="text-[11px] text-white/40">
                You can get a free API key at{' '}
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 underline hover:text-indigo-300"
                >
                  themoviedb.org
                </a>
                .
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setTempApiKey('');
                  setCustomApiKey('');
                  setShowSettingsModal(false);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
