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
    sitemap: 'https://www.leetmap-pro.com/sitemap.xml',
  };
}


