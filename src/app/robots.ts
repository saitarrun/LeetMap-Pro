import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/__clerk/'],
      },
    ],
    sitemap: 'https://leetmap-pro.vercel.app/sitemap.xml',
  };
}
