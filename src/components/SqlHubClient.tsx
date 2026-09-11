'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Database,
  Building2,
  Trophy,
  ArrowUpDown,
  LayoutGrid,
  ListFilter,
  X,
  Pin,
} from 'lucide-react';
import { SqlCompanySummary, SqlCatalog, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { SqlCompanyCard } from '@/components/SqlCompanyCard';
import { SqlExplorerView } from '@/components/SqlExplorerView';
import { useSolvedProblems } from '@/utils/useSolvedProblems';
import { usePinnedCompanies } from '@/utils/usePinnedCompanies';

interface SqlHubClientProps {
  companies: SqlCompanySummary[];
  catalog: SqlCatalog;
  syncStatus: SyncStatus | null;
}

const FAANG_SLUGS = new Set([
  'google', 'amazon', 'meta', 'apple', 'microsoft', 'netflix', 'uber', 'airbnb', 'stripe', 'linkedin'
]);

const FINTECH_SLUGS = new Set([
  'citadel', 'jane-street', 'two-sigma', 'goldman-sachs', 'j-p-morgan', 'bloomberg',
  'stripe', 'squarepoint-capital', 'paypal', 'coinbase', 'visa', 'point72', 'revolut', 'robinhood'
]);

export const SqlHubClient: React.FC<SqlHubClientProps> = ({
  companies,
  catalog,
  syncStatus,
}) => {
  const [activeView, setActiveView] = useState<'companies' | 'problems'>('companies');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PINNED' | 'FAANG' | 'FINTECH' | 'POPULAR_20' | 'POPULAR_50'>('ALL');
  const [sortBy, setSortBy] = useState<'sqlTotal' | 'name' | 'sqlHard'>('sqlTotal');
  const solvedSet = useSolvedProblems();
  const { pinnedSet } = usePinnedCompanies();

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isSearchShortcut = e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k');
      if (isSearchShortcut && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && (document.activeElement === searchInputRef.current || searchQuery)) {
        e.preventDefault();
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery]);

  // Filtered SQL Companies
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = c.name.toLowerCase().includes(q);
          const matchSlug = c.slug.toLowerCase().includes(q);
          const matchDomain = c.domain && c.domain.toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchDomain) return false;
        }

        if (categoryFilter === 'PINNED') return pinnedSet.has(c.slug);
        if (categoryFilter === 'FAANG') return FAANG_SLUGS.has(c.slug);
        if (categoryFilter === 'FINTECH') return FINTECH_SLUGS.has(c.slug);
        if (categoryFilter === 'POPULAR_20') return c.sqlTotal >= 20;
        if (categoryFilter === 'POPULAR_50') return c.sqlTotal >= 50;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'sqlHard') return b.sqlHard - a.sqlHard;
        return b.sqlTotal - a.sqlTotal;
      });
  }, [companies, searchQuery, categoryFilter, sortBy, pinnedSet]);

  const solvedSqlCount = useMemo(() => {
    let count = 0;
    for (const p of catalog.problems) {
      if (solvedSet.has(p.slug)) count++;
    }
    return count;
  }, [catalog.problems, solvedSet]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header syncStatus={syncStatus} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">

        {/* Minimal Hero */}
        <section className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)]">
            Company-wise LeetCode SQL
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal max-w-xl mx-auto">
            Database questions asked in interviews across top tech companies, ranked by frequency and recency.
          </p>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[var(--text-muted)] font-normal">
            <span>{companies.length} companies</span>
            <span className="opacity-30">·</span>
            <span>{catalog.totalSqlProblems} questions</span>
            {solvedSqlCount > 0 && (
              <>
                <span className="opacity-30">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{solvedSqlCount} solved</span>
              </>
            )}
          </div>

          {/* Minimal View Switcher */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex p-0.5 rounded-xl bg-[var(--bg-subtle)] text-xs">
              <button
                onClick={() => setActiveView('companies')}
                className={`apple-press px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeView === 'companies'
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Companies ({companies.length})
              </button>
              <button
                onClick={() => setActiveView('problems')}
                className={`apple-press px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeView === 'problems'
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                All Problems ({catalog.totalSqlProblems})
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Body: Company Cards Grid OR Full Explorer Table */}
        {activeView === 'companies' ? (
          <div className="space-y-6">
            {/* Minimalist Spotlight Search & Filter Controls */}
            <section className="max-w-2xl mx-auto space-y-3">
              <div className="relative group flex items-center h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]/30 focus-within:border-[var(--text-main)]/35 shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-200">
                <Search className="absolute left-4.5 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search SQL companies..."
                  className="w-full h-full pl-12 pr-14 text-sm bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none focus-visible:outline-none border-none outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="apple-press absolute right-3.5 p-1 rounded-full text-[var(--text-light)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                    title="Clear search (Esc)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="absolute right-3.5 flex items-center pointer-events-none">
                    <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono text-[var(--text-light)] bg-[var(--bg-subtle)] border border-[var(--border)] group-focus-within:opacity-40 transition-opacity">
                      ⌘K
                    </kbd>
                  </div>
                )}
              </div>

              {/* Minimal Category Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs pt-1">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { key: 'ALL', label: 'All' },
                    {
                      key: 'PINNED',
                      label: `Pinned${pinnedSet.size > 0 ? ` (${pinnedSet.size})` : ''}`,
                      isPinnedTab: true,
                    },
                    { key: 'FAANG', label: 'FAANG & Big Tech' },
                    { key: 'FINTECH', label: 'FinTech & Quant' },
                    { key: 'POPULAR_20', label: '20+ SQL' },
                    { key: 'POPULAR_50', label: '50+ SQL' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setCategoryFilter(tab.key as typeof categoryFilter)}
                      className={`apple-press shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        categoryFilter === tab.key
                          ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {tab.isPinnedTab && (
                        <Pin
                          className={`w-3 h-3 ${
                            categoryFilter === 'PINNED' || pinnedSet.size > 0
                              ? 'fill-amber-500 text-amber-500 rotate-45'
                              : 'text-current'
                          }`}
                        />
                      )}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 text-xs">
                  <span className="text-[var(--text-muted)] text-[11px]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-transparent text-[var(--text-main)] text-xs focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="sqlTotal">Most SQL</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="sqlHard">Most Hard</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Company Cards Grid */}
            <section className="apple-enter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredCompanies.length === 0 ? (
                <div className="col-span-full py-20 text-center rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 max-w-md mx-auto space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                    <Search className="w-5 h-5 opacity-70" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-[var(--text-main)]">No SQL companies found</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {searchQuery
                        ? `No company matching "${searchQuery}" found asking SQL questions.`
                        : 'No companies match the selected category filter.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('ALL');
                    }}
                    className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)] transition-colors cursor-pointer"
                  >
                    <span>Reset all filters</span>
                  </button>
                </div>
              ) : (
                filteredCompanies.map((c) => (
                  <SqlCompanyCard key={c.slug} company={c} />
                ))
              )}
            </section>
          </div>
        ) : (
          <SqlExplorerView catalog={catalog} />
        )}
      </main>
    </div>
  );
};
