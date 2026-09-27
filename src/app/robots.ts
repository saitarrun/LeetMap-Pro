import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    // One broad rule avoids conflicting user-agent groups. Specific bots now
    // inherit the same crawl permissions as Googlebot and other crawlers.
    rules: {
      userAgent: '*',
      allow: ['/', '/llms.txt', '/api/companies', '/api/daily-challenge'],
      disallow: ['/api/', '/out/', '/account', '/settings', '/sign-in', '/sign-up'],
    },
    sitemap: 'https://www.leetmap-pro.com/sitemap.xml',
  };
}

