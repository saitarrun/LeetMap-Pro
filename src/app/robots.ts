import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/_next/static/', '/__clerk/npm/'],
        disallow: ['/api/', '/__clerk/v1/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/_next/static/', '/__clerk/npm/'],
        disallow: ['/api/', '/__clerk/v1/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/_next/static/', '/__clerk/npm/'],
        disallow: ['/api/', '/__clerk/v1/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/_next/static/', '/__clerk/npm/'],
        disallow: ['/api/', '/__clerk/v1/'],
      },
      {
        userAgent: 'bingbot',
        allow: ['/', '/_next/static/', '/__clerk/npm/'],
        disallow: ['/api/', '/__clerk/v1/'],
      },
      {
        userAgent: 'msnbot',
        allow: ['/', '/_next/static/', '/__clerk/npm/'],
        disallow: ['/api/', '/__clerk/v1/'],
      },
      {
        userAgent: 'Applebot',
        allow: ['/', '/_next/static/', '/__clerk/npm/'],
        disallow: ['/api/', '/__clerk/v1/'],
      },
    ],
    sitemap: 'https://leetmap-pro.vercel.app/sitemap.xml',
    host: 'leetmap-pro.vercel.app',
  };
}

