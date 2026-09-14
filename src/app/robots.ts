import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/llms.txt',
          '/api/companies',
          '/api/daily-challenge',
        ],
        disallow: [
          '/api/',
          '/account',
          '/settings',
          '/sign-in',
          '/sign-up',
        ],
      },
      {
        userAgent: [
          'ChatGPT-User',
          'GPTBot',
          'OAI-SearchBot',
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'anthropic-ai',
          'PerplexityBot',
          'Perplexity-User',
          'Googlebot',
          'Google-Extended',
          'Applebot',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'FacebookBot',
          'Amazonbot',
          'cohere-ai',
          'Bytespider',
          'CCBot',
        ],
        allow: [
          '/',
          '/llms.txt',
          '/company/',
          '/patterns/',
          '/sql/',
          '/strategy',
        ],
        disallow: [
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


