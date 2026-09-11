import React from 'react';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { PatternDetail, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { PatternDetailView } from '@/components/PatternDetailView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SLUG_ALIASES: Record<string, string> = {
  'arrays-hashing': 'prefix-sum',
  'array-hashing': 'prefix-sum',
  'stack': 'monotonic-stack',
  'linked-list': 'linked-list-manipulation',
  'trees': 'tree-dfs',
  'tree': 'tree-dfs',
  'heap': 'heaps-top-k',
  'heaps': 'heaps-top-k',
  'priority-queue': 'heaps-top-k',
  'tries': 'trie',
  'graphs': 'graph-traversal',
  'graph': 'graph-traversal',
  'advanced-graphs': 'topological-sort',
  'dp-1d': 'dynamic-programming-1d',
  '1d-dp': 'dynamic-programming-1d',
  '1-d-dynamic-programming': 'dynamic-programming-1d',
  'dp-2d': 'dynamic-programming-2d',
  '2d-dp': 'dynamic-programming-2d',
  '2-d-dynamic-programming': 'dynamic-programming-2d',
  'math-geometry': 'matrix-traversal',
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const resolvedSlug = SLUG_ALIASES[safeSlug] || safeSlug;
  const filePath = path.join(process.cwd(), 'public', 'data', 'patterns', `${resolvedSlug}.json`);

  if (!fs.existsSync(filePath)) {
    return { title: 'Pattern Not Found' };
  }

  const pattern: PatternDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const title = `${pattern.name} Pattern (${pattern.total} Curated Problems)`;
  const description = `${pattern.tagline}. Master ${pattern.total} LeetCode interview problems in the ${pattern.name} pattern asked by ${pattern.topCompanies.slice(0, 4).join(', ')}. Strategy guide, code templates, and difficulty breakdown.`;

  return {
    title,
    description,
    keywords: [
      `${pattern.name} leetcode`,
      `${pattern.name} pattern interview questions`,
      `${pattern.name} coding problems`,
      `${pattern.category} interview prep`,
      'leetcode patterns roadmap',
    ],
    alternates: {
      canonical: `/patterns/${safeSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `/patterns/${safeSlug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function PatternDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const resolvedSlug = SLUG_ALIASES[safeSlug] || safeSlug;
  const filePath = path.join(process.cwd(), 'public', 'data', 'patterns', `${resolvedSlug}.json`);
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const pattern: PatternDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let syncStatus: SyncStatus | null = null;
  if (fs.existsSync(statusPath)) {
    try {
      syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse sync-status.json', err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header syncStatus={syncStatus} />
      <main className="flex-1 pb-16">
        <PatternDetailView pattern={pattern} />
      </main>
    </div>
  );
}
