import React from 'react';
import fs from 'fs';
import path from 'path';
import { SqlCatalog, SqlCompanySummary, SyncStatus } from '@/types';
import { SqlHubClient } from '@/components/SqlHubClient';

export const metadata = {
  title: 'LeetCode SQL 50 & Company-Wise SQL Interview Questions (2026)',
  description: 'Practice verified LeetCode SQL 50 and company-wise SQL interview questions from 73+ top tech firms (Amazon, Google, Meta, Bloomberg, Microsoft), ranked by frequency and recency. 100% free alternative to LeetCode Premium.',
  keywords: [
    'leetcode sql',
    'sql leetcode',
    'leetcode sql 50',
    'sql 50 leetcode',
    'sql interview questions',
    'company wise sql questions',
    'free leetcode sql questions',
    'LeetCode SQL Questions 2026',
    'SQL Interview Questions by Company',
    'FAANG SQL Questions',
    'Data Engineer Interview SQL',
    'Data Analyst LeetCode SQL',
    'SQL Practice Questions',
    'SQL Frequency',
  ],
  alternates: {
    canonical: 'https://www.leetmap-pro.com/sql',
  },
  openGraph: {
    title: 'LeetCode SQL 50 & Company-Wise SQL Interview Questions (2026) | LeetMap Pro',
    description: 'Practice verified LeetCode SQL 50 and company-wise SQL interview questions from 73+ top tech firms, ranked by frequency and recency. 100% free.',
    url: 'https://www.leetmap-pro.com/sql',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeetCode SQL 50 & Company-Wise SQL Interview Questions (2026) | LeetMap Pro',
    description: 'Practice verified LeetCode SQL 50 and company-wise SQL interview questions from 73+ top tech firms, ranked by frequency and recency. 100% free.',
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

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is LeetCode SQL 50 and how do I prepare for SQL interviews?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LeetCode SQL 50 is a curated study plan covering core SQL concepts tested in technical interviews: Select, Basic Joins, Basic Aggregate Functions, Advanced Select and Joins, Subqueries, and Advanced String Functions/Regex/Clause. On LeetMap Pro, you can practice these alongside company-specific SQL problem sets completely free.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which top tech companies ask SQL questions during interviews?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Top tech employers including Amazon (105 questions), Google (90 questions), Meta (80 questions), Bloomberg (65 questions), and Microsoft (61 questions) actively test SQL queries for data engineers, data scientists, backend developers, and business intelligence roles.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does LeetMap Pro rank SQL interview questions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Questions are ranked dynamically based on real candidate interview reports filtered by recency (30 days, 3 months, 6 months, and all-time), so you prioritize high-probability queries actively appearing in current interview loops.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is LeetMap Pro free for company SQL practice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, LeetMap Pro is 100% free with no paywall or subscription. You can filter company question banks, track solved questions locally, and export custom Notion/Markdown checklists without an account.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd, faqJsonLd]) }}
      />
      <SqlHubClient
        companies={companies}
        catalog={catalog}
        syncStatus={syncStatus}
      />
    </>
  );
}
