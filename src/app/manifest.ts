import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LeetMap Pro',
    short_name: 'LeetMap Pro',
    description: 'Browse coding interview problems asked by 680+ tech companies, ranked by frequency and recency. Free interactive strategy roadmap and SQL interview hub.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    categories: ['education', 'developer tools', 'productivity'],
    orientation: 'any',
    shortcuts: [
      {
        name: 'Companies',
        short_name: 'Companies',
        description: 'Browse 680+ company-wise question lists',
        url: '/',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Patterns',
        short_name: 'Patterns',
        description: 'Master 22 LeetCode coding patterns',
        url: '/patterns',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Strategy Roadmap',
        short_name: 'Roadmap',
        description: 'Interview prerequisite and strategy graph',
        url: '/strategy',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'SQL Hub',
        short_name: 'SQL',
        description: 'Company-wise SQL database questions',
        url: '/sql',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
