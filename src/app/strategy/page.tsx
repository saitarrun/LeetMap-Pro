import React from 'react';
import fs from 'fs';
import path from 'path';
import { PatternSummary, SyncStatus } from '@/types';
import { StrategyClient } from '@/components/StrategyClient';

export const metadata = {
  title: 'Interview Strategy & Dependency Roadmap',
  description: 'Master the 18 core LeetCode coding interview patterns in optimal prerequisite order. Interactive Apple-designed roadmap from Arrays & Hashing to Advanced Dynamic Programming.',
  keywords: [
    'LeetCode Roadmap',
    'Coding Interview Strategy',
    'LeetCode Pattern Dependency Graph',
    'Algorithm Prerequisites',
    'NeetCode alternative',
    'Technical Interview Roadmap',
  ],
  alternates: {
    canonical: 'https://leetmap-pro.vercel.app/strategy',
  },
  openGraph: {
    title: 'Interview Strategy & Dependency Roadmap — LeetMap Pro',
    description: 'Master the 18 core LeetCode coding interview patterns in optimal prerequisite order with an interactive visual dependency graph.',
    url: 'https://leetmap-pro.vercel.app/strategy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interview Strategy & Dependency Roadmap — LeetMap Pro',
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
        item: 'https://leetmap-pro.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Strategy Roadmap',
        item: 'https://leetmap-pro.vercel.app/strategy',
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
    url: 'https://leetmap-pro.vercel.app/strategy',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, articleJsonLd]) }}
      />
      <StrategyClient patterns={patterns} patternProblems={patternProblems} syncStatus={syncStatus} />
    </>
  );
}
