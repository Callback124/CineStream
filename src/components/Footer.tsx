import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Shield, Zap, Sparkles, Heart, Server, Globe } from 'lucide-react';
import { STREAM_SOURCES } from '../services/sources';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-[#050507]/80 backdrop-blur-xl border-t border-white/10 text-white/50 text-xs relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30 border border-white/20">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">CineStream</span>
            </div>
            <p className="text-white/60 leading-relaxed max-w-sm text-xs">
              Discover and stream the world's most popular movies and TV series in stunning HD and 4K quality. Powered by the TMDB metadata API and multi-source video distribution.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-server failover system with ad-block sandboxing enabled.</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Explore</h4>
            <ul className="space-y-1.5 text-white/60">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">
                  Trending Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-indigo-400 transition-colors">
                  Popular Movies
                </Link>
              </li>
              <li>
                <Link to="/tv" className="hover:text-indigo-400 transition-colors">
                  TV Series & Shows
                </Link>
              </li>
              <li>
                <Link to="/genres" className="hover:text-indigo-400 transition-colors">
                  Browse by Genres
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-indigo-400 transition-colors">
                  My Saved Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Active Servers */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" /> Stream Servers
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {STREAM_SOURCES.map((source) => (
                <span
                  key={source.id}
                  className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-white/80 flex items-center gap-1.5 backdrop-blur-md"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {source.name}
                  {source.badge && (
                    <span className="text-[9px] text-white/40">({source.badge})</span>
                  )}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-white/40 pt-1">
              Servers stream from external providers. If one server is slow or buffering, switch instantly to another.
            </p>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-[11px]">
          <p>
            Disclaimer: This service uses the TMDB API for metadata. Video content is embedded from third-party sources. No video files are hosted on this server.
          </p>
          <div className="flex items-center gap-1 text-white/50">
            <span>Built with React & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
