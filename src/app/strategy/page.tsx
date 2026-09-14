import React from 'react';
import fs from 'fs';
import path from 'path';
import { PatternSummary, SyncStatus } from '@/types';
import { StrategyClient } from '@/components/StrategyClient';

export const metadata = {
  title: 'Coding Interview Strategy & DSA Roadmap',
  description: 'Master the 18 core LeetCode coding interview patterns in optimal prerequisite order. Free interactive Apple-designed roadmap from Arrays & Hashing to Advanced Dynamic Programming.',
  keywords: [
    'free leetcode roadmap',
    'LeetCode Roadmap 2026',
    'Coding Interview Strategy 2026',
    'LeetCode Pattern Dependency Graph',
    'Algorithm Prerequisites',
    'NeetCode alternative',
    'Technical Interview Roadmap',
  ],
  alternates: {
    canonical: 'https://www.leetmap-pro.com/strategy',
  },
  openGraph: {
    title: 'Coding Interview Strategy & DSA Roadmap | LeetMap Pro',
    description: 'Master the 18 core LeetCode coding interview patterns in optimal prerequisite order with an interactive visual dependency graph.',
    url: 'https://www.leetmap-pro.com/strategy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coding Interview Strategy & DSA Roadmap | LeetMap Pro',
    description: 'Master the 18 core LeetCode coding interview patterns in optimal prerequisite order.',
  },
};

export default async function StrategyPage() {
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
        name: 'Strategy Roadmap',
        item: 'https://www.leetmap-pro.com/strategy',
      },
    ],
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'LeetCode Pattern Strategy & Dependency Roadmap',
    description: 'Master the 18 core LeetCode coding interview patterns in optimal prerequisite order with an interactive visual dependency graph.',
    author: {
      '@type': 'Organization',
      name: 'LeetMap Pro',
    },
    url: 'https://www.leetmap-pro.com/strategy',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'In what order should I study LeetCode patterns?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Start with Linear fundamentals (Arrays, Prefix Sum, Two Pointers, Sliding Window), then transition into Non-Linear structures (Tree BFS/DFS, Heaps, Graph Traversal), and conclude with Optimization techniques (Backtracking, 1D and 2D Dynamic Programming).',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the LeetMap Pro prerequisite graph work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The roadmap organizes patterns into topological dependency tiers. Mastering earlier tiers unlocks the intuition needed to solve complex composite problems in downstream tiers without brute-force memorization.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many patterns are needed to pass MAANG coding interviews?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mastering the 18 foundational patterns on LeetMap Pro covers over 90% of technical interview questions asked by top tech employers including Google, Meta, Amazon, and Apple.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, articleJsonLd, faqJsonLd]) }}
      />
      <StrategyClient patterns={patterns} patternProblems={patternProblems} syncStatus={syncStatus} />
    </>
  );
}
