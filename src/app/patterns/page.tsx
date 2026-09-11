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
    canonical: 'https://leetmap-pro.vercel.app/patterns',
  },
  openGraph: {
    title: 'Browse by Pattern for LeetCode DSA — LeetMap Pro',
    description: 'Master 22 core LeetCode coding interview patterns asked by top tech firms.',
    url: 'https://leetmap-pro.vercel.app/patterns',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse by Pattern for LeetCode DSA — LeetMap Pro',
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

  return (
    <Suspense fallback={null}>
      <PatternsHubClient patterns={patterns} patternProblems={patternProblems} syncStatus={syncStatus} />
    </Suspense>
  );
}
