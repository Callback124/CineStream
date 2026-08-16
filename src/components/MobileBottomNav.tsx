import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Compass, Bookmark, Search } from 'lucide-react';
import { useWatch } from '../context/WatchContext';

export const MobileBottomNav: React.FC = () => {
  const { watchlist } = useWatch();
  const location = useLocation();

  // Hide bottom nav on full player screen
  if (location.pathname.startsWith('/player')) {
    return null;
  }

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Series', path: '/tv', icon: Tv },
    { name: 'Genres', path: '/genres', icon: Compass },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Watchlist', path: '/watchlist', icon: Bookmark, badge: watchlist.length },
  ];

  return (
    <div
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07070f]/90 backdrop-blur-2xl border-t border-white/10 px-2 py-2 shadow-2xl safe-area-pb"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-indigo-400 font-bold'
                  : 'text-white/50 hover:text-white/80 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-black flex items-center justify-center border border-black shadow">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">{item.name}</span>

              {isActive && (
                <div className="absolute -bottom-1 w-3 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
