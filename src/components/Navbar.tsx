import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Tv, Search, Bookmark, Sparkles, X, Menu, Settings, Play, Check, Compass } from 'lucide-react';
import { useWatch } from '../context/WatchContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const { watchlist, customApiKey, setCustomApiKey } = useWatch();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'TV Series', path: '/tv' },
    { name: 'Genres', path: '/genres' },
    { name: 'Search', path: '/search', icon: Search },
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
            ? 'bg-[#050507]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50 py-3'
            : 'bg-[#050507]/60 backdrop-blur-md border-b border-white/5 py-4'
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
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-indigo-600/30 border border-indigo-500/50 shadow-md shadow-indigo-950/50'
                        : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{link.name}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] font-bold rounded-full border border-indigo-400/40">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2.5">
            {/* Direct Quick Search Button (Desktop) */}
            <Link
              to="/search"
              title="Search Movies & Shows"
              className={`p-2.5 rounded-xl border transition-all duration-200 hidden sm:flex items-center gap-2 text-xs font-semibold ${
                location.pathname === '/search'
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Search Catalog</span>
            </Link>

            {/* Settings / API Key Button */}
            <button
              id="api-key-settings-btn"
              onClick={() => {
                setTempApiKey(customApiKey);
                setShowSettingsModal(true);
              }}
              title="TMDB API Configuration"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white backdrop-blur-md"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0c0c16]/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-5 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 font-bold'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4 text-indigo-400" />}
                    <span>{link.name}</span>
                  </div>
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
