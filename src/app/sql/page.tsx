import React from 'react';
import fs from 'fs';
import path from 'path';
import { SqlCatalog, SqlCompanySummary, SyncStatus } from '@/types';
import { SqlHubClient } from '@/components/SqlHubClient';

export const metadata = {
  title: 'Free Company-Wise LeetCode SQL Questions (2026) by Frequency',
  description: 'Browse and practice company-wise LeetCode SQL questions asked by 73+ top tech firms (Amazon, Google, Meta, Bloomberg, Microsoft), ranked by interview frequency and recency. 100% free.',
  keywords: [
    'free leetcode sql questions',
    'LeetCode SQL Questions 2026',
    'SQL Interview Questions by Company',
    'company wise sql questions',
    'FAANG SQL Questions',
    'Data Engineer Interview SQL',
    'Data Analyst LeetCode SQL',
    'SQL Frequency',
  ],
  alternates: {
    canonical: 'https://www.leetmap-pro.com/sql',
  },
  openGraph: {
    title: 'Free Company-Wise LeetCode SQL Questions (2026) by Frequency | LeetMap Pro',
    description: 'Browse and practice company-wise LeetCode SQL questions asked by 73+ top tech firms, ranked by interview frequency and recency. 100% free.',
    url: 'https://www.leetmap-pro.com/sql',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Company-Wise LeetCode SQL Questions (2026) by Frequency | LeetMap Pro',
    description: 'Browse and practice company-wise LeetCode SQL questions asked by 73+ top tech firms, ranked by interview frequency and recency. 100% free.',
  },
};

export default async function SqlPage() {
  const sqlPath = path.join(process.cwd(), 'public', 'data', 'sql-problems.json');
  const companiesPath = path.join(process.cwd(), 'public', 'data', 'sql-companies.json');
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');

  let catalog: SqlCatalog = {
    totalSqlProblems: 0,
    lastUpdated: 0,
    problems: [],
  };

  if (fs.existsSync(sqlPath)) {
    try {
      catalog = JSON.parse(fs.readFileSync(sqlPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse sql-problems.json', err);
    }
  }

  let companies: SqlCompanySummary[] = [];
  if (fs.existsSync(companiesPath)) {
    try {
      companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse sql-companies.json', err);
    }
  }

  let syncStatus: SyncStatus | null = null;
  if (fs.existsSync(statusPath)) {
    try {
      syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse sync-status.json', err);
    }
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.leetmap-pro.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'SQL Interview Hub',
        item: 'https://www.leetmap-pro.com/sql',
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Company-Wise SQL Interview Practice',
    description: 'Browse coding interview SQL questions asked by top tech firms.',
    numberOfItems: companies.length,
    itemListElement: companies.slice(0, 30).map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `${c.name} SQL Questions`,
      url: `https://www.leetmap-pro.com/sql/${c.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd]) }}
      />
      <SqlHubClient
        companies={companies}
        catalog={catalog}
        syncStatus={syncStatus}
      />
    </>
  );
}
