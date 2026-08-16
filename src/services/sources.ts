import { StreamSource } from '../types';

export const STREAM_SOURCES: StreamSource[] = [
  {
    id: 'max',
    name: 'Max',
    badge: 'Fast HD',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie'
        ? `https://ythd.org/embed/${id}`
        : `https://ythd.org/embed/${id}/${season}-${episode}`,
  },
  {
    id: 'vidpro',
    name: 'VidPro',
    badge: 'Multi-Sub',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie'
        ? `https://vixsrc.to/movie/${id}`
        : `https://vixsrc.to/tv/${id}/${season}/${episode}`,
  },
  {
    id: '4k',
    name: '4K',
    badge: 'Ultra HD',
    quality: '4K',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie'
        ? `https://player.videasy.to/movie/${id}`
        : `https://player.videasy.to/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidfast',
    name: 'VidFast',
    badge: 'Auto-Play',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie'
        ? `https://vidfast.vc/movie/${id}?autoplay=true`
        : `https://vidfast.vc/tv/${id}/${season}/${episode}?autoplay=true`,
  },
  {
    id: 'vidcore',
    name: 'VidCore',
    badge: 'Eng Sub',
    quality: '1080p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie'
        ? `https://vidcore.net/movie/${id}?autoPlay=true&sub=en`
        : `https://vidcore.net/tv/${id}/${season}/${episode}?autoPlay=true&sub=en`,
  },
  {
    id: 'vidrock',
    name: 'VidRock',
    badge: 'Backup',
    quality: '720p',
    getUrl: (id, type, season = 1, episode = 1) =>
      type === 'movie'
        ? `https://vidrock.net/embed/movie/${id}?autoplay=true`
        : `https://vidrock.net/embed/tv/${id}/${season}/${episode}?autoplay=true&nextbutton=false&1selector=false`,
  },
];
