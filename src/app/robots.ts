import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/_next/static/', '/data/'],
        disallow: ['/api/', '/__clerk/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/_next/static/', '/data/'],
        disallow: ['/api/', '/__clerk/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/', '/icon*.png', '/icon.svg', '/apple-touch-icon.png', '/data/'],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/_next/static/', '/data/'],
        disallow: ['/api/', '/__clerk/'],
      },
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: ['/api/', '/__clerk/'],
      },
    ],
    sitemap: 'https://leetmap-pro.vercel.app/sitemap.xml',
    host: 'https://leetmap-pro.vercel.app',
  };
}
