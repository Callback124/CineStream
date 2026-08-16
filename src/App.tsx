import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { WatchProvider } from './context/WatchContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { TVSeriesPage } from './pages/TVSeriesPage';
import { SearchPage } from './pages/SearchPage';
import { GenresPage } from './pages/GenresPage';
import { DetailPage } from './pages/DetailPage';
import { PlayerPage } from './pages/PlayerPage';
import { WatchlistPage } from './pages/WatchlistPage';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Redirect helpers for `/movie/:id` and `/tv/:id` routes to detail page
function MovieRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/detail/movie/${id}`} replace />;
}

function TVRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/detail/tv/${id}`} replace />;
}

// Main Layout Wrapper that hides Navbar/Footer on PlayerPage
function AppLayout() {
  const location = useLocation();
  const isPlayer = location.pathname.startsWith('/player') || location.pathname.startsWith('/watch');

  return (
    <div className="min-h-screen bg-[#050507] text-[#f0f0f0] flex flex-col font-sans selection:bg-indigo-600 selection:text-white relative overflow-x-hidden">
      {/* Ambient Glowing Atmospheric Orbs for Frosted Glass Depth */}
      {!isPlayer && (
        <>
          <div className="pointer-events-none fixed top-[-120px] right-[-100px] w-[500px] h-[500px] bg-[#3a1d5a] rounded-full blur-[140px] opacity-30 z-0" />
          <div className="pointer-events-none fixed bottom-[-80px] left-[-80px] w-[450px] h-[450px] bg-[#1d3a5a] rounded-full blur-[130px] opacity-25 z-0" />
          <div className="pointer-events-none fixed top-[40%] left-[30%] w-[350px] h-[350px] bg-[#2a1b4e] rounded-full blur-[160px] opacity-15 z-0" />
          <Navbar />
        </>
      )}

      <main className={`flex-1 relative z-10 ${isPlayer ? 'p-0 m-0' : 'pb-16 md:pb-0'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TVSeriesPage />} />
          <Route path="/genres" element={<GenresPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />

          {/* Detail Page Routes */}
          <Route path="/detail/:type/:id" element={<DetailPage />} />

          {/* Player Page Routes */}
          <Route path="/player/:type/:id" element={<PlayerPage />} />
          <Route path="/player/:type/:id/:season/:episode" element={<PlayerPage />} />

          {/* Watch backwards-compatible aliases mapping to PlayerPage */}
          <Route path="/watch/:type/:id" element={<PlayerPage />} />
          <Route path="/watch/:type/:id/:season/:episode" element={<PlayerPage />} />

          {/* Convenience short routes redirecting to detail page */}
          <Route path="/movie/:id" element={<MovieRedirect />} />
          <Route path="/tv/:id" element={<TVRedirect />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isPlayer && (
        <>
          <Footer />
          <MobileBottomNav />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WatchProvider>
        <ScrollToTop />
        <AppLayout />
      </WatchProvider>
    </BrowserRouter>
  );
}
