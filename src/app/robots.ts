import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    // One broad rule avoids conflicting user-agent groups. Specific bots now
    // inherit the same crawl permissions as Googlebot and other crawlers.
    rules: {
      userAgent: '*',
      allow: ['/', '/llms.txt', '/api/companies', '/api/daily-challenge', '/api/sql', '/api/status'],
      // Authentication and account pages expose noindex metadata, so crawlers
      // can read that directive instead of being blocked from seeing it.
      disallow: ['/api/', '/out/'],
    },
    sitemap: 'https://www.leetmap-pro.com/sitemap.xml',
  };
}
