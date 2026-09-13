import React, { Suspense } from 'react';
import fs from 'fs';
import path from 'path';
import { PatternSummary, SyncStatus } from '@/types';
import { PatternsHubClient } from '@/components/PatternsHubClient';

export const metadata = {
  title: 'Browse by Pattern for LeetCode DSA',
  description: 'Master 22 core LeetCode coding interview patterns (Two Pointers, Sliding Window, Monotonic Stack, 1-D/2-D DP, Trees, Graphs) asked by top tech firms.',
  keywords: [
    'LeetCode Patterns',
    'Coding Patterns',
    'Two Pointers LeetCode',
    'Sliding Window LeetCode',
    'Dynamic Programming Patterns',
    'Graph Traversal',
    'FAANG Patterns',
  ],
  alternates: {
    canonical: 'https://www.leetmap-pro.com/patterns',
  },
  openGraph: {
    title: 'Browse by Pattern for LeetCode DSA | LeetMap Pro',
    description: 'Master 22 core LeetCode coding interview patterns asked by top tech firms.',
    url: 'https://www.leetmap-pro.com/patterns',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse by Pattern for LeetCode DSA | LeetMap Pro',
    description: 'Master 22 core LeetCode coding interview patterns asked by top tech firms.',
  },
};

export default async function PatternsPage() {
  const patternsPath = path.join(process.cwd(), 'public', 'data', 'patterns.json');
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');
  const patternProblemsPath = path.join(process.cwd(), 'public', 'data', 'pattern-problem-slugs.json');

  let patterns: PatternSummary[] = [];
  if (fs.existsSync(patternsPath)) {
    try {
      patterns = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse patterns.json', err);
    }
  }

  let patternProblems: Record<string, string[]> = {};
  if (fs.existsSync(patternProblemsPath)) {
    try {
      patternProblems = JSON.parse(fs.readFileSync(patternProblemsPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse pattern-problem-slugs.json', err);
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
        name: 'Coding Patterns',
        item: 'https://www.leetmap-pro.com/patterns',
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '22 Core LeetCode Coding Patterns',
    description: 'Master 22 essential interview patterns for technical coding interviews.',
    numberOfItems: patterns.length,
    itemListElement: patterns.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.name,
      url: `https://www.leetmap-pro.com/patterns/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd]) }}
      />
      <Suspense fallback={null}>
        <PatternsHubClient patterns={patterns} patternProblems={patternProblems} syncStatus={syncStatus} />
      </Suspense>
    </>
  );
}
