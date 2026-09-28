import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { BookOpen, Database, ExternalLink, GitBranch, RefreshCw, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'About, Data Sources & Methodology',
  description: 'Learn how LeetMap Pro sources, deduplicates, updates, and ranks company-wise LeetCode and SQL interview question data.',
  alternates: {
    canonical: 'https://www.leetmap-pro.com/about',
  },
  openGraph: {
    title: 'About, Data Sources & Methodology | LeetMap Pro',
    description: 'Transparent data provenance, update methodology, ranking principles, and correction policy for LeetMap Pro.',
    url: 'https://www.leetmap-pro.com/about',
    type: 'website',
  },
};

type SyncStatus = {
  lastSyncedISO?: string;
  companiesCount?: number;
  uniqueProblemsCount?: number;
  sqlProblemsCount?: number;
};

function getSyncStatus(): SyncStatus {
  try {
    const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');
    return JSON.parse(fs.readFileSync(statusPath, 'utf8')) as SyncStatus;
  } catch {
    return {};
  }
}

export default function AboutPage() {
  const status = getSyncStatus();
  const modified = status.lastSyncedISO || '2026-09-27T00:00:00Z';
  const modifiedLabel = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(modified));

  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': 'https://www.leetmap-pro.com/about#dataset',
    name: 'LeetMap Pro Company-Wise Interview Questions Dataset',
    description: 'A normalized catalog of company-wise DSA and SQL interview questions with frequency and recency windows.',
    dateModified: modified,
    creator: {
      '@type': 'Organization',
      '@id': 'https://www.leetmap-pro.com/#organization',
      name: 'LeetMap Pro',
      url: 'https://www.leetmap-pro.com',
    },
    isBasedOn: [
      'https://github.com/liquidslr/leetcode-company-wise-problems',
      'https://github.com/snehasishroy/leetcode-companywise-interview-questions',
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://www.leetmap-pro.com/api/companies',
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://www.leetmap-pro.com/api/sql',
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://www.leetmap-pro.com/api/status',
      },
    ],
  };

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About LeetMap Pro, Data Sources & Methodology',
    url: 'https://www.leetmap-pro.com/about',
    dateModified: modified,
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://www.leetmap-pro.com/#website',
      name: 'LeetMap Pro',
      url: 'https://www.leetmap-pro.com',
    },
    about: { '@id': 'https://www.leetmap-pro.com/about#dataset' },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([aboutJsonLd, datasetJsonLd]) }}
      />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Transparent and open source
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">About LeetMap Pro</h1>
          <p className="max-w-3xl text-base sm:text-lg leading-relaxed text-[var(--text-muted)]">
            LeetMap Pro is a free interview-preparation index that organizes company-wise DSA and SQL questions by frequency and recency. The project publishes its source code, data pipeline, update status, and correction channel so readers and automated agents can evaluate where the information comes from.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Dataset last published <time dateTime={modified}>{modifiedLabel}</time> · {status.uniqueProblemsCount?.toLocaleString() || '3,400+'} unique problems · {status.sqlProblemsCount?.toLocaleString() || '190+'} SQL problems
          </p>
        </section>

        <section className="grid sm:grid-cols-2 gap-4" aria-label="Methodology summary">
          {[
            {
              icon: Database,
              title: 'Multi-source aggregation',
              text: 'Company and recency records are compiled from maintained community datasets, then enriched with official LeetCode problem identifiers and public metadata.',
            },
            {
              icon: GitBranch,
              title: 'Normalization and deduplication',
              text: 'The build pipeline reconciles company aliases, normalizes problem slugs and IDs, merges overlapping reports, and removes duplicate records before publication.',
            },
            {
              icon: RefreshCw,
              title: 'Repeatable updates',
              text: 'An automated synchronization workflow regenerates the public JSON indexes and records source commit identifiers and publication time in the status feed.',
            },
            {
              icon: BookOpen,
              title: 'Editorial organization',
              text: 'Pattern guides, SQL hubs, and the strategy roadmap add explanatory context while preserving direct links to the original practice environment.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 space-y-3">
              <Icon className="h-5 w-5 text-emerald-500" />
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{text}</p>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Sources and ranking methodology</h2>
          <div className="space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
            <p>
              The primary community sources are the public{' '}
              <a className="text-[var(--text-main)] underline underline-offset-4" href="https://github.com/liquidslr/leetcode-company-wise-problems" target="_blank" rel="noopener noreferrer">liquidslr</a>{' '}
              and{' '}
              <a className="text-[var(--text-main)] underline underline-offset-4" href="https://github.com/snehasishroy/leetcode-companywise-interview-questions" target="_blank" rel="noopener noreferrer">snehasishroy</a>{' '}
              company-wise repositories. Public LeetCode endpoints provide canonical problem metadata and the daily challenge when available.
            </p>
            <p>
              Frequency percentages are comparative preparation signals derived from the available reports; they are not hiring probabilities or official statements from employers. Recency windows prioritize recently reported questions, while all-time views preserve the broader historical catalog.
            </p>
            <p>
              Very small company pages are kept accessible for users but excluded from the XML sitemap and marked not to be indexed until they contain enough useful material. This focuses search crawling on stronger, differentiated resources.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Corrections, limitations, and independence</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5 text-sm leading-relaxed text-[var(--text-muted)] space-y-3">
            <p>
              Interview reports can be incomplete, delayed, or inconsistent across sources. LeetMap Pro does not claim that every listed question will appear in a future interview. Use the frequency and recency fields to prioritize practice, not as guarantees.
            </p>
            <p>
              Data corrections and reproducible issues can be submitted through the public GitHub issue tracker. The repository history provides an auditable record of data and code changes.
            </p>
            <p>
              LeetCode is a registered trademark of LeetCode LLC. LeetMap Pro is an independent educational project and is not affiliated with or endorsed by LeetCode LLC or the employers represented in the catalog.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="https://github.com/saitarrun/LeetMap-Pro" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[var(--text-main)] px-4 py-2 text-sm font-semibold text-[var(--bg-page)]">
              View source code <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a href="https://github.com/saitarrun/LeetMap-Pro/issues" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium">
              Report a correction <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link href="/api/status" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium">
              Dataset status
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
