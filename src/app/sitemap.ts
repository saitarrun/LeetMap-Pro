import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { COMPANY_ALIASES } from '@/utils/aliases';

const BASE_URL = 'https://www.leetmap-pro.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // 1. Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/strategy`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/patterns`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sql`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/patterns/time-complexity`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Pattern detail pages
  const patternPages: MetadataRoute.Sitemap = [];
  try {
    const patternsPath = path.join(process.cwd(), 'public', 'data', 'patterns.json');
    if (fs.existsSync(patternsPath)) {
      const patterns: { slug: string }[] = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
      for (const pat of patterns) {
        if (pat.slug) {
          patternPages.push({
            url: `${BASE_URL}/patterns/${pat.slug}`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
          });
        }
      }
    }
  } catch (err) {
    console.error('Failed to load patterns for sitemap:', err);
  }

  // 3. Company detail pages (680+)
  const companyPages: MetadataRoute.Sitemap = [];
  try {
    const companiesPath = path.join(process.cwd(), 'public', 'data', 'companies.json');
    if (fs.existsSync(companiesPath)) {
      const companies: { slug: string; total: number }[] = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
      for (const comp of companies) {
        if (comp.slug && !COMPANY_ALIASES[comp.slug]) {
          companyPages.push({
            url: `${BASE_URL}/company/${comp.slug}`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: comp.total > 20 ? 0.9 : 0.8,
          });
        }
      }
    }
  } catch (err) {
    console.error('Failed to load companies for sitemap:', err);
  }

  // 4. SQL Company pages
  const sqlPages: MetadataRoute.Sitemap = [];
  try {
    const sqlPath = path.join(process.cwd(), 'public', 'data', 'sql-companies.json');
    if (fs.existsSync(sqlPath)) {
      const sqlCompanies: { slug: string }[] = JSON.parse(fs.readFileSync(sqlPath, 'utf8'));
      for (const comp of sqlCompanies) {
        if (comp.slug) {
          sqlPages.push({
            url: `${BASE_URL}/sql/${comp.slug}`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }
    }
  } catch (err) {
    console.error('Failed to load SQL companies for sitemap:', err);
  }

  return [...staticPages, ...patternPages, ...companyPages, ...sqlPages];
}
