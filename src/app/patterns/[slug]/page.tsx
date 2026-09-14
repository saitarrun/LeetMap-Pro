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
  const title = `${pattern.name} Pattern Guide`;
  const description = `${pattern.tagline}. Master ${pattern.total} LeetCode interview problems in the ${pattern.name} pattern asked by ${pattern.topCompanies.slice(0, 4).join(', ')}. Strategy guide, code templates, and difficulty breakdown.`;

  return {
    title,
    description,
    keywords: [
      `${pattern.name} leetcode`,
      `${pattern.name} pattern interview questions`,
      `${pattern.name} coding problems`,
      `${pattern.name} dsa pattern`,
      `dsa questions ${pattern.name}`,
      `${pattern.category} interview prep`,
      'company wise dsa',
      'leetcode patterns roadmap',
      'dsa coding interview',
    ],
    alternates: {
      canonical: `https://www.leetmap-pro.com/patterns/${safeSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.leetmap-pro.com/patterns/${safeSlug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  try {
    const patternsPath = path.join(process.cwd(), 'public', 'data', 'patterns.json');
    if (fs.existsSync(patternsPath)) {
      const patterns = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
      return patterns.map((p: { slug: string }) => ({
        slug: p.slug,
      }));
    }
  } catch (error) {
    console.error('Failed to generate static params for patterns', error);
  }
  return [];
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
        name: 'Patterns',
        item: 'https://www.leetmap-pro.com/patterns',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${pattern.name} Pattern`,
        item: `https://www.leetmap-pro.com/patterns/${safeSlug}`,
      },
    ],
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: `${pattern.name} LeetCode Pattern Guide`,
    description: pattern.tagline,
    author: {
      '@type': 'Organization',
      name: 'LeetMap Pro',
    },
    url: `https://www.leetmap-pro.com/patterns/${safeSlug}`,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the ${pattern.name} pattern in coding interviews?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${pattern.tagline} It is categorized under ${pattern.category} and features ${pattern.total} curated interview problems across Easy (${pattern.easy}), Medium (${pattern.medium}), and Hard (${pattern.hard}) difficulties.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which tech companies frequently test ${pattern.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Companies frequently asking ${pattern.name} questions include ${(pattern.topCompanies || []).slice(0, 6).join(', ') || 'Google, Meta, Amazon, and Microsoft'}.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I master the ${pattern.name} pattern?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Start by studying the algorithmic strategy and template code, then practice Easy and Medium problems before attempting Hard problems under timed conditions.`,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, articleJsonLd, faqJsonLd]) }}
      />
      <Header syncStatus={syncStatus} />
      <main className="flex-1 pb-16">
        <PatternDetailView pattern={pattern} />
      </main>
    </div>
  );
}
