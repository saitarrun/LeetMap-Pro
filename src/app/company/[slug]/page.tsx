import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { CompanyDetail, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { CompanyDetailView } from '@/components/CompanyDetailView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const filePath = path.join(process.cwd(), 'public', 'data', 'companies', `${safeSlug}.json`);

  if (!fs.existsSync(filePath)) {
    return { title: 'Company Not Found' };
  }

  const company: CompanyDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const title = `${company.name} LeetCode Questions (${company.total} Most Frequent)`;
  const description = `Practice ${company.total} interview problems asked in ${company.name} technical interviews, ranked by real frequency: ${company.easy} Easy, ${company.medium} Medium, ${company.hard} Hard. Filter by 30 days, 3 months, 6 months recency.`;

  return {
    title,
    description,
    keywords: [
      `${company.name} LeetCode questions`,
      `${company.name} interview questions`,
      `${company.name} coding interview`,
      `${company.name} most asked leetcode`,
      `${company.name} software engineer interview`,
    ],
    alternates: {
      canonical: `https://leetmap-pro.vercel.app/company/${safeSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://leetmap-pro.vercel.app/company/${safeSlug}`,
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
    const companiesPath = path.join(process.cwd(), 'public', 'data', 'companies.json');
    if (fs.existsSync(companiesPath)) {
      const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
      return companies.slice(0, 50).map((c: { slug: string }) => ({
        slug: c.slug,
      }));
    }
  } catch (error) {
    console.error('Failed to generate static params for companies', error);
  }
  return [];
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const filePath = path.join(process.cwd(), 'public', 'data', 'companies', `${safeSlug}.json`);
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const company: CompanyDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let syncStatus: SyncStatus | null = null;
  if (fs.existsSync(statusPath)) {
    syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
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
        name: 'Companies',
        item: 'https://leetmap-pro.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${company.name} LeetCode Questions`,
        item: `https://leetmap-pro.vercel.app/company/${safeSlug}`,
      },
    ],
  };

  const topProblems = (company.windows?.find((w) => w.key === 'all')?.problems || []).slice(0, 20);
  const topThreeProblems = topProblems.slice(0, 3).map((p) => p.title).join(', ') || 'Two Sum, Add Two Numbers, LRU Cache';

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${company.name} Most Frequent Interview Questions`,
    description: `Curated coding interview questions asked at ${company.name}`,
    numberOfItems: topProblems.length,
    itemListElement: topProblems.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.title,
      url: `https://leetcode.com/problems/${p.slug}`,
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are the most frequent LeetCode questions for ${company.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The top problems asked in ${company.name} technical interviews include ${topThreeProblems}. In total, ${company.total} verified problems are tracked across Easy (${company.easy}), Medium (${company.medium}), and Hard (${company.hard}) tiers.`,
        },
      },
      {
        '@type': 'Question',
        name: `How does LeetMap track ${company.name} interview problem recency?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `LeetMap weights problem occurrences across 30-day, 3-month, and 6-month recency windows to ensure candidates focus on problems actively being asked in the current hiring cycle.`,
        },
      },
      {
        '@type': 'Question',
        name: `What difficulty distribution should I expect in ${company.name} coding rounds?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `For ${company.name}, Medium difficulty problems represent the largest share (${company.medium} problems), followed by Easy (${company.easy}) and Hard (${company.hard}). Mastering foundational patterns like Trees, Graphs, and Dynamic Programming is essential.`,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd, faqJsonLd]) }}
      />
      <Header syncStatus={syncStatus} />
      <main className="flex-1 pb-16">
        <CompanyDetailView company={company} />

        {/* SEO Semantic Content & FAQ Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-10 border-t border-[var(--border)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                  {company.name} Technical Interview Overview
                </h2>
                <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
                  Software engineering and technical interviews at {company.name} emphasize real-world problem solving, algorithmic efficiency, and scalable data structure design. The curated dataset above contains {company.total} verified LeetCode problems, categorized by frequency and filtered across recent interview seasons.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]/40">
                    <h4 className="text-xs font-semibold text-[var(--text-main)]">
                      What are the top LeetCode questions for {company.name}?
                    </h4>
                    <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                      Leading questions include {topThreeProblems}. Reviewing questions with higher recency (within the last 30 to 90 days) yields the highest return on preparation time.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]/40">
                    <h4 className="text-xs font-semibold text-[var(--text-main)]">
                      How should I prepare for {company.name} coding rounds?
                    </h4>
                    <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                      Begin by reviewing Medium-difficulty problems ({company.medium} tracked), which constitute the majority of technical rounds. Complement coding practice with foundational DSA patterns like Sliding Window, Two Pointers, and Graph Traversal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Companies / Internal Linking for SEO */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider">
                Explore Peer Tech Firms
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Google', slug: 'google' },
                  { name: 'Meta', slug: 'meta' },
                  { name: 'Amazon', slug: 'amazon' },
                  { name: 'Microsoft', slug: 'microsoft' },
                  { name: 'Apple', slug: 'apple' },
                  { name: 'Bloomberg', slug: 'bloomberg' },
                  { name: 'Citadel', slug: 'citadel' },
                  { name: 'Uber', slug: 'uber' },
                ]
                  .filter((item) => item.slug !== safeSlug)
                  .slice(0, 6)
                  .map((peer) => (
                    <Link
                      key={peer.slug}
                      href={`/company/${peer.slug}`}
                      className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      {peer.name} Questions
                    </Link>
                  ))}
              </div>

              <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider pt-4">
                Recommended Patterns
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/patterns/dynamic-programming-1d"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Dynamic Programming
                </Link>
                <Link
                  href="/patterns/graph-traversal"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Graph Traversal
                </Link>
                <Link
                  href="/patterns/two-pointers"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Two Pointers
                </Link>
                <Link
                  href="/strategy"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Roadmap Graph
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
