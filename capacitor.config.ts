import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cinestream.app',
  appName: 'CineStream',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      '*',
      '*.tmdb.org',
      '*.themoviedb.org',
      '*.ythd.org',
      '*.vixsrc.to',
      '*.videasy.to',
      '*.multiembed.mov',
      '*.autoembed.cc',
      '*.vidbinge.dev',
      '*.2embed.cc',
      '*.smashystream.com',
      '*.rive.stream',
      '*.embed.su',
      '*.player4u.xyz',
      '*.moviee.tv',
      '*.superembed.stream',
      '*.vidsrc.pm'
    ]
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#050507'
  }
};

export default config;
