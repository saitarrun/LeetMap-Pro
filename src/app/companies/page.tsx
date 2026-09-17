import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CompanySummary, SyncStatus } from '@/types';
import { COMPANY_ALIASES } from '@/utils/aliases';
import { Building2, Database, Search, ArrowRight, ExternalLink } from 'lucide-react';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'All Tech Companies LeetCode Questions Directory (A–Z) | LeetMap Pro',
  description: 'Complete A-Z directory of 660+ tech companies with company-wise LeetCode and SQL questions ranked by real interview frequency and recency. Free practice for Google, Meta, Amazon, Apple, and more.',
  alternates: {
    canonical: 'https://www.leetmap-pro.com/companies',
  },
  openGraph: {
    title: 'All Tech Companies LeetCode Questions Directory (A–Z) | LeetMap Pro',
    description: 'Browse 660+ tech companies with verified LeetCode interview questions, difficulty breakdowns, and recency rankings. 100% free alternative to LeetCode Premium.',
    url: 'https://www.leetmap-pro.com/companies',
    type: 'website',
    siteName: 'LeetMap Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Tech Companies LeetCode Questions Directory (A–Z) | LeetMap Pro',
    description: 'Browse 660+ tech companies with verified LeetCode interview questions, difficulty breakdowns, and recency rankings.',
  },
};

function getCanonicalCompanies(): CompanySummary[] {
  const filePath = path.join(process.cwd(), 'public', 'data', 'companies.json');
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw: CompanySummary[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const seen = new Set<string>();
    const filtered: CompanySummary[] = [];
    for (const c of raw) {
      const canonical = COMPANY_ALIASES[c.slug] || c.slug;
      if (!seen.has(canonical) && !COMPANY_ALIASES[c.slug]) {
        seen.add(canonical);
        filtered.push(c);
      }
    }
    return filtered.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  } catch {
    return [];
  }
}

export default function CompaniesDirectoryPage() {
  const companies = getCanonicalCompanies();
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');
  let syncStatus: SyncStatus | null = null;
  if (fs.existsSync(statusPath)) {
    try {
      syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    } catch {
      syncStatus = null;
    }
  }

  // Group companies by initial letter / character
  const alphabetMap: Record<string, CompanySummary[]> = {};
  for (const c of companies) {
    const firstChar = (c.name.trim()[0] || '#').toUpperCase();
    const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
    if (!alphabetMap[key]) {
      alphabetMap[key] = [];
    }
    alphabetMap[key].push(c);
  }

  const sortedLetters = Object.keys(alphabetMap).sort((a, b) => {
    if (a === '#') return -1;
    if (b === '#') return 1;
    return a.localeCompare(b);
  });

  const totalQuestions = companies.reduce((acc, c) => acc + c.total, 0);

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
        name: 'Companies Directory',
        item: 'https://www.leetmap-pro.com/companies',
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Tech Companies LeetCode Questions',
    numberOfItems: Math.min(companies.length, 50),
    itemListElement: companies.slice(0, 50).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${c.name} LeetCode Questions`,
      url: `https://www.leetmap-pro.com/company/${c.slug}`,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd]) }}
      />
      <Header syncStatus={syncStatus} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Complete Directory · {companies.length} Companies Tracked</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
            All Tech Companies Directory
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Practice company-wise coding interview problems asked in real hiring rounds. Every company includes recency filtering (30D, 3M, 6M), difficulty breakdowns, and pattern tags.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-main)]">{companies.length} Companies</span>
            <span>·</span>
            <span>{totalQuestions.toLocaleString()}+ Problem Associations</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Free Access</span>
          </div>
        </section>

        {/* Alphabet Jump Bar */}
        <nav
          aria-label="Alphabetical jump navigation"
          className="sticky top-16 z-20 py-2.5 px-3 rounded-2xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs font-mono font-semibold"
        >
          {sortedLetters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter === '#' ? 'num' : letter}`}
              className="apple-press w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              {letter}
            </a>
          ))}
        </nav>

        {/* Directory Sections */}
        <div className="space-y-12">
          {sortedLetters.map((letter) => {
            const letterCompanies = alphabetMap[letter] || [];
            return (
              <section
                key={letter}
                id={`letter-${letter === '#' ? 'num' : letter}`}
                className="space-y-4 scroll-mt-28"
              >
                <div className="flex items-center gap-3 border-b border-[var(--border)] pb-2">
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {letter}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    ({letterCompanies.length} {letterCompanies.length === 1 ? 'company' : 'companies'})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {letterCompanies.map((comp) => (
                    <Link
                      key={comp.slug}
                      href={`/company/${comp.slug}`}
                      className="apple-press group flex flex-col justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-emerald-500/40 hover:bg-[var(--bg-subtle)]/60 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {comp.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span className="font-medium text-[var(--text-main)]">
                          {comp.total} {comp.total === 1 ? 'question' : 'questions'}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          {comp.easy > 0 && <span className="text-emerald-600 dark:text-emerald-400">{comp.easy}E</span>}
                          {comp.medium > 0 && <span className="text-amber-600 dark:text-amber-400">{comp.medium}M</span>}
                          {comp.hard > 0 && <span className="text-rose-600 dark:text-rose-400">{comp.hard}H</span>}
                          {comp.sqlTotal ? (
                            <span className="px-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-sans">
                              SQL
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
