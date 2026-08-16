import React, { useEffect, useState } from 'react';
import { Sparkles, Flame, Star, Film, Tv, Compass, History, Trophy, Rocket, Laugh, Skull } from 'lucide-react';
import { MediaItem } from '../types';
import { getTrending, getPopular, getTopRated, getByGenre, getBackdropUrl } from '../services/tmdb';
import { HeroBanner } from '../components/HeroBanner';
import { MediaRow } from '../components/MediaRow';
import { DetailsModal } from '../components/DetailsModal';
import { useWatch } from '../context/WatchContext';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredItems, setFeaturedItems] = useState<MediaItem[]>([]);
  const [trendingAll, setTrendingAll] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [actionMovies, setActionMovies] = useState<MediaItem[]>([]);
  const [scifiMedia, setScifiMedia] = useState<MediaItem[]>([]);
  const [comedyMedia, setComedyMedia] = useState<MediaItem[]>([]);
  const [horrorMedia, setHorrorMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<MediaItem | null>(null);

  const { history } = useWatch();

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        setLoading(true);
        const [
          trending,
          popMovies,
          popTv,
          topMovies,
          action,
          scifi,
          comedy,
          horror,
        ] = await Promise.all([
          getTrending('all', 'day'),
          getPopular('movie'),
          getPopular('tv'),
          getTopRated('movie'),
          getByGenre('movie', 28), // Action
          getByGenre('movie', 878), // Sci-Fi
          getByGenre('movie', 35), // Comedy
          getByGenre('movie', 27), // Horror
        ]);

        if (isMounted) {
          setTrendingAll(trending);
          setFeaturedItems(trending.slice(0, 6));
          setPopularMovies(popMovies);
          setPopularTV(popTv);
          setTopRatedMovies(topMovies);
          setActionMovies(action);
          setScifiMedia(scifi);
          setComedyMedia(comedy);
          setHorrorMedia(horror);
        }
      } catch (err) {
        console.error('Failed to load catalog', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* Hero Banner with Featured Media */}
      <HeroBanner
        items={featuredItems}
        onOpenDetails={(item) => setSelectedDetailsItem(item)}
      />

      <div className="max-w-7xl mx-auto space-y-6 pt-4 pb-12">
        {/* Continue Watching Section if User has History */}
        {history.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Continue Watching
              </h2>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none">
              {history.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={
                    item.type === 'tv' && item.season && item.episode
                      ? `/player/tv/${item.id}/${item.season}/${item.episode}`
                      : `/player/${item.type}/${item.id}`
                  }
                  className="flex-shrink-0 w-64 sm:w-72 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group hover:border-indigo-500/50 transition-all hover:scale-[1.02] shadow-xl"
                >
                  <div className="relative aspect-video w-full bg-[#0c0c14]">
                    <img
                      src={getBackdropUrl(item.backdrop_path || item.poster_path, 'w780')}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/20 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white/[0.02]">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      {item.type === 'tv' && item.season
                        ? `Season ${item.season} • Episode ${item.episode || 1} ${item.episodeName ? `(${item.episodeName})` : ''}`
                        : 'Resume Movie'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Media Rows */}
        <MediaRow
          title="Trending Today"
          subtitle="The most popular movies & series right now"
          icon={<Flame className="w-5 h-5 text-indigo-400" />}
          items={trendingAll}
          exploreLink="/movies"
          onOpenDetails={(item) => setSelectedDetailsItem(item)}
          isLoading={loading}
        />

        <MediaRow
          title="Popular Movies"
          subtitle="Top box-office hits and fan favorites"
          icon={<Film className="w-5 h-5 text-indigo-400" />}
          items={popularMovies}
          exploreLink="/movies"
          onOpenDetails={(item) => setSelectedDetailsItem(item)}
          isLoading={loading}
        />

        <MediaRow
          title="Binge-Worthy TV Series"
          subtitle="Critically acclaimed shows and ongoing sagas"
          icon={<Tv className="w-5 h-5 text-purple-400" />}
          items={popularTV}
          exploreLink="/tv"
          onOpenDetails={(item) => setSelectedDetailsItem(item)}
          isLoading={loading}
        />

        <MediaRow
          title="Top Rated Classics & Masterpieces"
          subtitle="Highest rated titles of all time"
          icon={<Trophy className="w-5 h-5 text-amber-300" />}
          items={topRatedMovies}
          exploreLink="/movies"
          onOpenDetails={(item) => setSelectedDetailsItem(item)}
          isLoading={loading}
        />

        <MediaRow
          title="Action & Adrenaline"
          subtitle="High-octane blockbusters, martial arts, and thrillers"
          icon={<Rocket className="w-5 h-5 text-indigo-400" />}
          items={actionMovies}
          onOpenDetails={(item) => setSelectedDetailsItem(item)}
          isLoading={loading}
        />

        <MediaRow
          title="Sci-Fi & Cosmic Adventures"
          subtitle="Space exploration, dystopias, and mind-bending futures"
          icon={<Sparkles className="w-5 h-5 text-purple-400" />}
          items={scifiMedia}
          onOpenDetails={(item) => setSelectedDetailsItem(item)}
          isLoading={loading}
        />

        <MediaRow
          title="Comedy & Laughs"
          subtitle="Feel-good favorites, parodies, and stand-ups"
          icon={<Laugh className="w-5 h-5 text-amber-400" />}
          items={comedyMedia}
          onOpenDetails={(item) => setSelectedDetailsItem(item)}
          isLoading={loading}
        />

        <MediaRow
          title="Horror & Midnight Thrillers"
          subtitle="Spooky nights, slashers, and supernatural chills"
          icon={<Skull className="w-5 h-5 text-rose-400" />}
          items={horrorMedia}
          onOpenDetails={(item) => setSelectedDetailsItem(item)}
          isLoading={loading}
        />
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
