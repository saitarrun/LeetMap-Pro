'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Sparkles, Trophy, Database, Building2, Code2, X } from 'lucide-react';
import { CompanySummary, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { SyncModal } from '@/components/SyncModal';
import { CompanyCard } from '@/components/CompanyCard';
import { getSolvedCount } from '@/utils/progress';

interface HomeClientProps {
  initialCompanies: CompanySummary[];
  initialSyncStatus: SyncStatus | null;
}

const FAANG_SLUGS = new Set([
  'google', 'amazon', 'meta', 'apple', 'microsoft', 'netflix', 'uber', 'airbnb', 'stripe'
]);

const FINTECH_SLUGS = new Set([
  'citadel', 'jane-street', 'two-sigma', 'goldman-sachs', 'j-p-morgan', 'bloomberg',
  'stripe', 'squarepoint-capital', 'hudson-river-trading', 'paypal', 'coinbase', 'visa', 'mastercard'
]);

export const HomeClient: React.FC<HomeClientProps> = ({
  initialCompanies,
  initialSyncStatus,
}) => {
  const [companies, setCompanies] = useState<CompanySummary[]>(initialCompanies);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(initialSyncStatus);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'FAANG' | 'FINTECH' | 'POPULAR' | 'SQL'>('ALL');
  const [sortBy, setSortBy] = useState<'total' | 'name' | 'hard'>('total');
  const [userSolvedCount, setUserSolvedCount] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserSolvedCount(getSolvedCount());

    const handleUpdate = () => {
      setUserSolvedCount(getSolvedCount());
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
        if (categoryFilter === 'POPULAR') return c.total >= 100;
        if (categoryFilter === 'SQL') return (c.sqlTotal ?? 0) > 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'hard') return b.hard - a.hard;
        return b.total - a.total;
      });
  }, [companies, searchQuery, categoryFilter, sortBy]);

  const handleSyncComplete = (newStatus: SyncStatus) => {
    setSyncStatus(newStatus);
    fetch('/api/companies')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCompanies(data);
      })
      .catch(console.error);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenSync={() => setIsSyncModalOpen(true)} syncStatus={syncStatus} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        {/* Apple Centered Hero */}
        <section className="text-center max-w-2xl mx-auto space-y-3.5 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)] shadow-2xs">
            <Code2 className="w-3.5 h-3.5 opacity-80" />
            <span>DSA & Algorithmic Interview Track</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)]">
            Company-wise LeetCode DSA
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal">
            Coding interview problems top tech & finance companies actually ask, ranked by frequency and recency.
          </p>

          {/* Apple Pill Metrics */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3.5 py-1.5 rounded-full shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span><strong>{companies.length}</strong> companies</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3.5 py-1.5 rounded-full shadow-xs">
              <Database className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>
                <strong>{syncStatus?.uniqueProblemsCount ? syncStatus.uniqueProblemsCount.toLocaleString() : '3,422'}</strong> problems
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3.5 py-1.5 rounded-full shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span><strong>{userSolvedCount}</strong> solved</span>
            </div>
          </div>
        </section>

        {/* Apple Spotlight Search & Controls */}
        <section className="max-w-2xl mx-auto space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 683 companies... (Google, Citadel, Jane Street, Stripe)"
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
                { key: 'ALL', label: 'All Companies' },
                { key: 'FAANG', label: 'FAANG & Big Tech' },
                { key: 'FINTECH', label: 'FinTech & Quant' },
                { key: 'POPULAR', label: '100+ Questions' },
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

            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)] text-[11px]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="apple-press bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] px-3 py-1.5 rounded-xl text-xs focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="total">Most Questions</option>
                <option value="name">Name (A-Z)</option>
                <option value="hard">Most Hard Questions</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
          <span>Showing <strong>{filteredCompanies.length}</strong> companies</span>
          {(searchQuery || categoryFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
              }}
              className="text-[var(--text-main)] underline hover:text-[var(--text-muted)] cursor-pointer transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 max-w-md mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <Search className="w-5 h-5 opacity-70" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[var(--text-main)]">No companies found</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {searchQuery
                  ? `No company matching "${searchQuery}" in this category.`
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
          <section className="apple-enter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.slug} company={company} />
            ))}
          </section>
        )}
      </main>

      {/* Sync Status / Pipeline Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncStatus={syncStatus}
        onSyncComplete={handleSyncComplete}
      />
    </div>
  );
};
