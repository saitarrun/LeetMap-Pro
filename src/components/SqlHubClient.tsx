'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Database,
  Building2,
  Trophy,
  Sparkles,
  ArrowUpDown,
  LayoutGrid,
  ListFilter,
  X,
} from 'lucide-react';
import { SqlCompanySummary, SqlCatalog, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { SqlCompanyCard } from '@/components/SqlCompanyCard';
import { SqlExplorerView } from '@/components/SqlExplorerView';
import { getSolvedCount, getSolvedProblems } from '@/utils/progress';

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
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'FAANG' | 'FINTECH' | 'POPULAR_20' | 'POPULAR_50'>('ALL');
  const [sortBy, setSortBy] = useState<'sqlTotal' | 'name' | 'sqlHard'>('sqlTotal');
  const [solvedSet, setSolvedSet] = useState<Set<string>>(new Set());

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSolvedSet(getSolvedProblems());

    const handleUpdate = () => {
      setSolvedSet(getSolvedProblems());
    };
    window.addEventListener('grindmap-solved-updated', handleUpdate);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
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
      window.removeEventListener('grindmap-solved-updated', handleUpdate);
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
  }, [companies, searchQuery, categoryFilter, sortBy]);

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

        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)] shadow-2xs">
            <Database className="w-3.5 h-3.5 opacity-80" />
            <span>SQL & Database Interview Track</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)]">
            Company-wise LeetCode SQL
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal">
            LeetCode database queries asked in interviews across {companies.length} top tech firms, organized company by company with recency and frequency.
          </p>

          {/* Metric Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3.5 py-1.5 rounded-full shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span><strong>{companies.length}</strong> companies asking SQL</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3.5 py-1.5 rounded-full shadow-xs">
              <Database className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span><strong>{catalog.totalSqlProblems}</strong> unique SQL queries</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3.5 py-1.5 rounded-full shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span><strong>{solvedSqlCount}</strong> / {catalog.totalSqlProblems} solved</span>
            </div>
          </div>

          {/* Primary View Switcher: Browse by Company vs All Problems */}
          <div className="pt-3 flex justify-center">
            <div className="inline-flex p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-xs">
              <button
                onClick={() => setActiveView('companies')}
                className={`apple-press flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'companies'
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Browse by Company ({companies.length})</span>
              </button>
              <button
                onClick={() => setActiveView('problems')}
                className={`apple-press flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'problems'
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>All {catalog.totalSqlProblems} SQL Problems</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Body: Company Cards Grid OR Full Explorer Table */}
        {activeView === 'companies' ? (
          <div className="space-y-6">
            {/* Search & Category Filter Controls */}
            <section className="max-w-2xl mx-auto space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${companies.length} companies asking SQL... (Amazon, Google, Meta, Bloomberg)`}
                  className="w-full pl-11 pr-12 py-3 rounded-2xl text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-light)] shadow-xs focus:outline-none focus:border-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--border)]/40 transition-[box-shadow,border-color] duration-150"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="apple-press apple-pop-in absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--text-light)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                    title="Clear search (Esc)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg text-[10px] font-mono text-[var(--text-light)] border border-[var(--border)] bg-[var(--bg-subtle)]">
                    /
                  </kbd>
                )}
              </div>

              {/* Segmented Category Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] gap-1">
                  {[
                    { key: 'ALL', label: `All (${companies.length})` },
                    { key: 'FAANG', label: 'FAANG & Big Tech' },
                    { key: 'FINTECH', label: 'FinTech & Quant' },
                    { key: 'POPULAR_20', label: '20+ SQL' },
                    { key: 'POPULAR_50', label: '50+ SQL' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setCategoryFilter(tab.key as any)}
                      className={`apple-press px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                        categoryFilter === tab.key
                          ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 ml-auto">
                  <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-[var(--text-muted)] font-normal">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-[var(--text-main)] font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="sqlTotal">Most SQL Questions</option>
                      <option value="name">Company Name</option>
                      <option value="sqlHard">Most Hard SQL</option>
                    </select>
                  </div>
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
