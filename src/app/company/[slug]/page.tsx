import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { notFound, permanentRedirect } from 'next/navigation';
import { CompanyDetail, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { CompanyDetailView } from '@/components/CompanyDetailView';
import { COMPANY_ALIASES } from '@/utils/aliases';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const filePath = path.join(process.cwd(), 'public', 'data', 'companies', `${safeSlug}.json`);

  if (!fs.existsSync(filePath)) {
    return { title: 'Company Not Found' };
  }

  const company: CompanyDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let title = `${company.name} LeetCode Questions`;
  let description = `Explore ${company.total} ${company.name} LeetCode interview questions ranked by frequency and recency, with difficulty filters and free progress tracking.`;
  let keywords = [
    `free ${company.name} leetcode questions`,
    `${company.name} LeetCode questions 2026`,
    `${company.name} LeetCode 2026`,
    `free leetcode premium ${company.name}`,
    `${company.name} leetcode tagged questions free`,
    `company wise leetcode questions ${company.name}`,
    `${company.name} leetcode frequency`,
    `${company.name} most asked leetcode 30 days`,
    `${company.name} coding interview questions`,
    `${company.name} software engineer interview`,
    `leetcode ${company.slug}`,
    `${company.name} interview questions`,
    `${company.name} technical interview`,
    `company wise leetcode questions`,
    `leetcode company wise`,
  ];

  if (safeSlug === 'blind-75') {
    title = 'Blind 75 LeetCode Questions (2026) – Curated Interview Problems';
    description = 'Practice and master the complete Blind 75 LeetCode study list with an interactive progress tracker, difficulty filters (Easy: 19, Med: 49, Hard: 7), and pattern categorization. 100% free with no paywall.';
    keywords = [
      'blind 75',
      'blind 75 leetcode',
      'blind 75 list',
      'blind 75 questions',
      'blind 75 sheet',
      'blind 75 practice',
      'blind 75 tracker',
      'blind 75 study plan',
      'blind 75 leetcode questions',
      'blind 75 curated problems',
      'neetcode blind 75',
      'coding interview preparation',
      'leetcode patterns',
    ];
  } else if (safeSlug === 'neetcode-150') {
    title = 'NeetCode 150 LeetCode Questions (2026) – Complete Practice Roadmap';
    description = 'Practice all 150 NeetCode coding interview questions with real-time progress tracking, Blind mode, and pattern-based categorization (Easy: 28, Med: 101, Hard: 21). 100% free alternative.';
    keywords = [
      'neetcode 150',
      'neetcode 150 list',
      'neetcode 150 practice',
      'neetcode 150 questions',
      'neetcode sheet',
      'neetcode roadmap',
      'neetcode 150 leetcode',
      'neetcode practice',
      'neetcode questions',
      'blind 75',
      'coding interview roadmap',
    ];
  }

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://www.leetmap-pro.com/company/${COMPANY_ALIASES[safeSlug] || safeSlug}`,
    },
    openGraph: {
      title: `${company.name} LeetCode Questions | LeetMap Pro`,
      description,
      url: `https://www.leetmap-pro.com/company/${COMPANY_ALIASES[safeSlug] || safeSlug}`,
      type: 'article',
      siteName: 'LeetMap Pro',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} LeetCode Questions | LeetMap Pro`,
      description,
    },
    robots: company.total <= 5
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  try {
    const companiesPath = path.join(process.cwd(), 'public', 'data', 'companies.json');
    if (fs.existsSync(companiesPath)) {
      const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
      return companies.map((c: { slug: string }) => ({
        slug: c.slug,
      }));
    }
  } catch (error) {
    console.error('Failed to generate static params for companies', error);
  }
  return [];
}

let cachedCompanies: { name: string; slug: string }[] | null = null;
function getCanonicalCompanies(): { name: string; slug: string }[] {
  if (cachedCompanies) return cachedCompanies;
  const companiesPath = path.join(process.cwd(), 'public', 'data', 'companies.json');
  if (fs.existsSync(companiesPath)) {
    try {
      const raw: { name: string; slug: string }[] = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
      const seen = new Set<string>();
      const filtered: { name: string; slug: string }[] = [];
      for (const c of raw) {
        const canonical = COMPANY_ALIASES[c.slug] || c.slug;
        if (!seen.has(canonical)) {
          seen.add(canonical);
          filtered.push({ name: c.name, slug: canonical });
        }
      }
      cachedCompanies = filtered;
    } catch {
      cachedCompanies = [];
    }
  }
  return cachedCompanies || [];
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');

  if (COMPANY_ALIASES[safeSlug]) {
    permanentRedirect(`/company/${COMPANY_ALIASES[safeSlug]}`);
  }

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

  const allCompanies = getCanonicalCompanies();
  const currentIndex = allCompanies.findIndex((c) => c.slug === safeSlug);

  // Mesh neighbors (4 before and 4 after in circular ring)
  const peerCompanies: { name: string; slug: string }[] = [];
  if (allCompanies.length > 1 && currentIndex !== -1) {
    const offsets = [-4, -3, -2, -1, 1, 2, 3, 4];
    for (const offset of offsets) {
      const idx = (currentIndex + offset + allCompanies.length) % allCompanies.length;
      if (idx !== currentIndex && !peerCompanies.some((p) => p.slug === allCompanies[idx].slug)) {
        peerCompanies.push(allCompanies[idx]);
      }
    }
  }

  // Anchor flagships (top tier tech firms for authority transfer)
  const topAnchorSlugs = ['google', 'meta', 'amazon', 'microsoft', 'apple', 'bloomberg', 'uber', 'netflix'];
  const anchorCompanies = allCompanies
    .filter((c) => topAnchorSlugs.includes(c.slug) && c.slug !== safeSlug && !peerCompanies.some((p) => p.slug === c.slug))
    .slice(0, 4);

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
        name: `${company.name} LeetCode Questions`,
        item: `https://www.leetmap-pro.com/company/${safeSlug}`,
      },
    ],
  };

  const topProblems = (company.windows?.find((w) => w.key === 'all')?.problems || []).slice(0, 20);
  const topThreeProblems = topProblems.slice(0, 3).map((p) => p.title).join(', ') || 'Two Sum, Add Two Numbers, LRU Cache';
  const allTimeProblems = company.windows?.find((w) => w.key === 'all')?.problems || [];
  const recentProblems = company.windows?.find((w) => w.key === '30_days')?.problems || [];
  const topicCounts = new Map<string, number>();
  for (const problem of allTimeProblems) {
    for (const topic of problem.topics || []) topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  }
  const topTopics = [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const difficultyCounts: Array<[string, number]> = [
    ['Easy', company.easy],
    ['Medium', company.medium],
    ['Hard', company.hard],
  ];
  const [dominantDifficulty, dominantCount] = difficultyCounts.sort((a, b) => b[1] - a[1])[0];
  const updatedLabel = syncStatus?.lastSyncedISO
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(syncStatus.lastSyncedISO))
    : 'the latest available dataset';

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${company.name} Interview Questions`,
    numberOfItems: topProblems.length,
    itemListElement: topProblems.map((prob, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: prob.title,
      url: `https://leetcode.com/problems/${prob.slug}/`,
    })),
  };

  const faqItems = [
    {
      question: `What are the most frequent LeetCode questions for ${company.name}?`,
      answer: `The leading problems in the available ${company.name} interview reports include ${topThreeProblems}. This page tracks ${company.total} reported problems across Easy (${company.easy}), Medium (${company.medium}), and Hard (${company.hard}) difficulty levels.`,
    },
    {
      question: `Where can I practice company-wise LeetCode questions for ${company.name}?`,
      answer: `You can review all ${company.total} ${company.name} questions on this page, filter them by 30-day, 3-month, 6-month, and all-time windows, and save practice progress for free.`,
    },
    {
      question: `How does LeetMap Pro organize ${company.name} interview problem recency?`,
      answer: `LeetMap Pro groups community-reported occurrences into 30-day, 3-month, 6-month, and older windows. These are preparation signals from the available sources, not guarantees that a problem will appear in a future interview.`,
    },
    {
      question: `What is the difficulty distribution for ${company.name} coding questions?`,
      answer: `${dominantDifficulty} is the largest tracked difficulty group for ${company.name}, with ${dominantCount} problems. The full distribution is ${company.easy} Easy, ${company.medium} Medium, and ${company.hard} Hard.`,
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `https://www.leetmap-pro.com/company/${safeSlug}#page`,
    name: `${company.name} LeetCode Interview Questions`,
    url: `https://www.leetmap-pro.com/company/${safeSlug}`,
    description: `A frequency- and recency-organized collection of ${company.total} community-reported ${company.name} coding interview questions.`,
    dateModified: syncStatus?.lastSyncedISO,
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://www.leetmap-pro.com/#website',
      name: 'LeetMap Pro',
      url: 'https://www.leetmap-pro.com',
    },
    about: {
      '@type': 'Organization',
      name: company.name,
    },
    mainEntity: {
      '@type': 'ItemList',
      name: `${company.name} Interview Questions`,
      numberOfItems: topProblems.length,
      itemListElement: topProblems.map((prob, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: prob.title,
        url: `https://leetcode.com/problems/${prob.slug}/`,
      })),
    },
  };

  const isLarge = (company.windows?.some((w) => w.problems.length > 50)) ?? false;
  const initialCompany: CompanyDetail = isLarge
    ? {
        ...company,
        isTruncated: true,
        windows: company.windows.map((w) => ({
          ...w,
          problems: w.problems.slice(0, 50),
        })),
      }
    : company;

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, collectionPageJsonLd, faqJsonLd, itemListJsonLd]) }}
      />
      <Header syncStatus={syncStatus} />
      <main className="flex-1 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--text-main)] transition-colors">Home</Link>
            <span className="opacity-40">/</span>
            <Link href="/?tab=directory" className="hover:text-[var(--text-main)] transition-colors">Directory</Link>
            <span className="opacity-40">/</span>
            <span className="text-[var(--text-main)] font-medium truncate">{company.name}</span>
          </nav>
        </div>

        <CompanyDetailView company={initialCompany} />

        {/* SEO Semantic Content & FAQ Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-10 border-t border-[var(--border)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                  {company.name} Technical Interview Overview & Company-Wise Questions
                </h2>
                <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
                  This page organizes {company.total} community-reported {company.name} LeetCode problems by difficulty, frequency, and recency so you can build a focused preparation queue. Reports are aggregated from public datasets and should be treated as preparation signals rather than predictions.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-[var(--text-main)]">How to prioritize {company.name} preparation</h3>
                <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                  Start with the {recentProblems.length} questions reported in the last 30 days, then work through the highest-frequency topics{topTopics.length ? ` (${topTopics.map(([topic]) => topic).join(', ')})` : ''}. This page tracks {company.total} community-reported questions across {company.easy} Easy, {company.medium} Medium, and {company.hard} Hard problems. Data refreshed {updatedLabel}.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Link href="/patterns" className="rounded-full border border-[var(--border)] px-3 py-1.5 font-medium text-[var(--text-main)] hover:bg-[var(--bg-hover)]">Browse DSA patterns</Link>
                  <Link href="/strategy" className="rounded-full border border-[var(--border)] px-3 py-1.5 font-medium text-[var(--text-main)] hover:bg-[var(--bg-hover)]">Follow the strategy roadmap</Link>
                  <Link href="/about" className="rounded-full border border-[var(--border)] px-3 py-1.5 font-medium text-[var(--text-main)] hover:bg-[var(--bg-hover)]">Sources &amp; methodology</Link>
                  <Link href="/api/status" className="rounded-full border border-[var(--border)] px-3 py-1.5 font-medium text-[var(--text-main)] hover:bg-[var(--bg-hover)]">Dataset status</Link>
                  {company.sqlTotal ? <Link href={`/sql/${safeSlug}`} className="rounded-full border border-[var(--border)] px-3 py-1.5 font-medium text-[var(--text-main)] hover:bg-[var(--bg-hover)]">Practice {company.name} SQL</Link> : null}
                </div>
              </div>

              {company.total <= 5 && (
                <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    <span>💡 Recommended Interview Strategy for {company.name}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Because {company.name} currently has {company.total} direct interview {company.total === 1 ? 'problem' : 'problems'} logged in community reports, technical interview loops at {company.name} typically evaluate candidates on standard data structure patterns. For optimal preparation, master these problems first, then practice the comprehensive <Link href="/company/blind-75" className="text-emerald-600 dark:text-emerald-400 font-medium underline">Blind 75</Link> and <Link href="/company/neetcode-150" className="text-emerald-600 dark:text-emerald-400 font-medium underline">NeetCode 150</Link> roadmaps.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {faqItems.map(({ question, answer }) => (
                    <div key={question} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]/40">
                      <h4 className="text-xs font-semibold text-[var(--text-main)]">{question}</h4>
                      <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">{answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Related Companies / Internal Linking for SEO */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider">
                More Tech Companies
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...peerCompanies, ...anchorCompanies].map((peer) => (
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
                Recommended Coding Patterns
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/patterns/sliding-window"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Sliding Window
                </Link>
                <Link
                  href="/patterns/two-pointers"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Two Pointers
                </Link>
                <Link
                  href="/patterns/fast-slow-pointers"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Fast & Slow Pointers
                </Link>
                <Link
                  href="/patterns/monotonic-stack"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Monotonic Stack
                </Link>
                <Link
                  href="/patterns/binary-search-tree"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Binary Search Tree
                </Link>
                <Link
                  href="/patterns/tree-bfs"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Tree BFS
                </Link>
                <Link
                  href="/patterns/matrix-traversal"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Matrix Traversal
                </Link>
                <Link
                  href="/patterns/union-find"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Union-Find
                </Link>
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
                  href="/strategy"
                  className="apple-press text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Roadmap Graph
                </Link>
              </div>

              {Boolean(company.sqlTotal && company.sqlTotal > 0) && (
                <div className="pt-3">
                  <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-2">
                    Database & SQL Questions
                  </h3>
                  <Link
                    href={`/sql/${safeSlug}`}
                    className="apple-press inline-flex items-center gap-2 text-xs px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                  >
                    <span>Practice {company.name} SQL Questions ({company.sqlTotal})</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-normal">Ranked by frequency</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
