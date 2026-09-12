import React from 'react';
import fs from 'fs';
import path from 'path';
import { SyncStatus, DailyChallenge } from '@/types';
import { HomeClient } from '@/components/HomeClient';

export const metadata = {
  title: 'LeetMap Pro | Company Wise Leetcode and SQL Questions',
  description: 'Browse coding interview problems asked by 680+ tech companies, ranked by frequency and recency. Free interactive strategy roadmap and SQL interview hub.',
  alternates: {
    canonical: 'https://leetmap-pro.vercel.app',
  },
  openGraph: {
    title: 'LeetMap Pro | Company Wise Leetcode and SQL Questions',
    description: 'Browse coding interview problems asked by 680+ tech companies, ranked by frequency and recency. Free interactive strategy roadmap and SQL interview hub.',
    url: 'https://leetmap-pro.vercel.app',
    type: 'website',
  },
};

const homeFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How to practice company-wise LeetCode questions for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LeetMap Pro organizes thousands of verified coding interview problems asked by 680+ tech companies (including Google, Meta, Amazon, Apple, Microsoft, Citadel, Bloomberg), ranked by real frequency and recency over 30 days, 3 months, and 6 months.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is LeetMap Pro completely free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, LeetMap Pro is 100% free and open-source. All company interview problem lists, coding patterns, SQL interview hub, and roadmap tracking are available with zero subscription or paywall.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the most popular coding patterns for FAANG interviews?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The top interview patterns include Two Pointers, Sliding Window, Monotonic Stack, Binary Search, Tree Traversal, Graph Traversal, and 1-D / 2-D Dynamic Programming. LeetMap Pro provides interactive visual roadmaps for 22 DSA patterns.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does LeetMap Pro support SQL and database interview questions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, LeetMap Pro features a dedicated SQL interview practice hub containing company-wise SQL questions asked by 70+ tech companies with difficulty breakdowns and solution links.',
      },
    },
  ],
};

export default function HomePage() {
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');
  const dailyPath = path.join(process.cwd(), 'public', 'data', 'daily-challenge.json');
  const companiesPath = path.join(process.cwd(), 'public', 'data', 'companies.json');

  let syncStatus: SyncStatus | null = null;
  if (fs.existsSync(statusPath)) {
    try {
      syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    } catch {
      syncStatus = null;
    }
  }

  let dailyChallenge: DailyChallenge | null = null;
  if (fs.existsSync(dailyPath)) {
    try {
      dailyChallenge = JSON.parse(fs.readFileSync(dailyPath, 'utf8'));
    } catch {
      dailyChallenge = null;
    }
  }

  let companies = [];
  if (fs.existsSync(companiesPath)) {
    try {
      companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
    } catch {
      companies = [];
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />
      <HomeClient
        initialCompanies={companies}
        initialSyncStatus={syncStatus}
        initialDailyChallenge={dailyChallenge}
      />
    </>
  );
}
