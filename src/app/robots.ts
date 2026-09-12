import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account',
          '/settings',
          '/sign-in',
          '/sign-up',
        ],
      },
    ],
    sitemap: 'https://leetmap-pro.vercel.app/sitemap.xml',
  };
}


