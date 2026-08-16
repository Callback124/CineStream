import { StreamSource } from '../types';
import { getImdbId } from './tmdb';

export const STREAM_SOURCES: StreamSource[] = [
  {
    id: 'max',
    name: 'Max',
    badge: 'Fast HD',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://ythd.org/embed/${id}` : `https://ythd.org/embed/${id}/${season}-${episode}`,
  },
  {
    id: 'vidpro',
    name: 'VidPro',
    badge: 'Multi-Sub',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://vixsrc.to/movie/${id}` : `https://vixsrc.to/tv/${id}/${season}/${episode}`,
  },
  {
    id: '4k',
    name: '4K',
    badge: 'Ultra HD',
    quality: '4K',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://player.videasy.to/movie/${id}` : `https://player.videasy.to/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidfast',
    name: 'VidFast',
    badge: 'Auto-Play',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://vidfast.vc/movie/${id}?autoplay=true` : `https://vidfast.vc/tv/${id}/${season}/${episode}?autoplay=true`,
  },
  {
    id: 'vidcore',
    name: 'VidCore',
    badge: 'Eng Sub',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://vidcore.net/movie/${id}?autoPlay=true&sub=en` : `https://vidcore.net/tv/${id}/${season}/${episode}?autoPlay=true&sub=en`,
  },
  {
    id: 'vidrock',
    name: 'VidRock',
    badge: 'Fast Stream',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://vidrock.net/embed/movie/${id}?autoplay=true` : `https://vidrock.net/embed/tv/${id}/${season}/${episode}?autoplay=true&nextbutton=false&1selector=false`,
  },
  {
    id: '2embed',
    name: '2Embed',
    badge: 'Stable',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://2embed.stream/embed/movie/${id}` : `https://www.2embed.stream/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'cinemaos',
    name: 'CinemaOS',
    badge: 'Ultra Smooth',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://cinemaos.tech/player/${id}` : `https://cinemaos.tech/player/${id}/${season}/${episode}`,
  },
  {
    id: 'vidnest',
    name: 'VidNest',
    badge: 'HD Server',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://vidnest.fun/movie/${id}` : `https://vidnest.fun/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'tongo',
    name: 'Tongo',
    badge: 'Fast HD',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://www.NontonGo.win/embed/movie/${id}` : `https://www.NontonGo.win/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'echo',
    name: 'Echo',
    badge: 'VidLink Clean',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie'
        ? `https://vidlink.pro/movie/${id}?primaryColor=white&secondaryColor=white&iconColor=white&title=false&poster=true&autoplay=true`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}?style&primaryColor=white&secondaryColor=white&iconColor=white&title=false&poster=true&autoplay=true`,
  },
  {
    id: 'mplay',
    name: 'MPlay',
    badge: 'ModiPlay',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://rozgarlelo.modiplay.xyz/embed/tmdb/movie?id=${id}` : `https://rozgarlelo.modiplay.xyz/embed/tmdb/tv?id=${id}&s=${season}&e=${episode}`,
  },
  {
    id: 'vidking',
    name: 'VidKing',
    badge: 'Auto Select',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://www.vidking.net/embed/movie/${id}?autoplay=true` : `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?autoplay=true&episodeSelector=true`,
  },
  {
    id: '111',
    name: '111 Movies',
    badge: 'Speed',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://111movies.net/movie/${id}` : `https://111movies.net/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'jade',
    name: 'Jade',
    badge: 'SuperFlix',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://superflixapi.lifestyle/filme/${id}` : `https://superflixapi.lifestyle/serie/${id}/${season}/${episode}`,
  },
  {
    id: 'hindi',
    name: 'Hindi Audio',
    badge: 'Hindi Dub',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://nxsha.space/embed/movie/${id}?lang=hindi&autoplay=true` : `https://nxsha.space/embed/tv/${id}/${season}/${episode}?lang=hindi&autoplay=true`,
  },
  {
    id: 'rivestream',
    name: 'RiveStream',
    badge: 'Rive HD',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://www.rivestream.app/embed?type=movie&id=${id}` : `https://www.rivestream.app/embed?type=tv&id=${id}&${season}=${season}&${episode}=${episode}`,
  },
  {
    id: 'flicky',
    name: 'Flicky',
    badge: 'Host Direct',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://flicky.host/embed/movie/?id=${id}` : `https://flicky.host/embed/tv/?id=${id}/${season}/${episode}`,
  },
  {
    id: 'peachify',
    name: 'Peachify',
    badge: 'Eng Sub',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://peachify.top/embed/movie/${id}?autoplay=true&sub=English` : `https://peachify.top/embed/tv/${id}/${season}/${episode}?autoplay=true&sub=English`,
  },
  {
    id: 'screenscape',
    name: 'ScreenScape',
    badge: 'Full Stream',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie' ? `https://screenscape.me/embed?tmdb=${id}&type=movie` : `https://screenscape.me/embed?tmdb=${id}&type=tv&s=${season}&e=${episode}`,
  },
  {
    id: 'full-hindi',
    name: 'Full Hindi',
    badge: 'Hindi + IMDb',
    quality: 'HD Premium',
    getUrl: async (id, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        const imdbId = await getImdbId(id, type);
        if (imdbId) {
          return `https://streams.iqsmartgames.com/embed/movie/${imdbId}?key=e11a7debaaa4f5d25b671706ffe4d2acb56efbd4`;
        }
        return `https://streams.iqsmartgames.com/embed/movie/tt${id}?key=e11a7debaaa4f5d25b671706ffe4d2acb56efbd4`;
      } else if (type === 'tv') {
        return `https://streams.iqsmartgames.com/embed/tv/${id}/${season}/${episode}?key=e11a7debaaa4f5d25b671706ffe4d2acb56efbd4`;
      }
      return `https://streams.iqsmartgames.com/embed/movie/tt${id}?key=e11a7debaaa4f5d25b671706ffe4d2acb56efbd4`;
    },
  },
];
