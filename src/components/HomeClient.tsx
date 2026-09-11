'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Trophy, Database, Building2, Code2, X, Pin } from 'lucide-react';
import { CompanySummary, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { SyncModal } from '@/components/SyncModal';
import { CompanyCard } from '@/components/CompanyCard';
import { useSolvedProblems } from '@/utils/useSolvedProblems';
import { usePinnedCompanies } from '@/utils/usePinnedCompanies';

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
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PINNED' | 'FAANG' | 'FINTECH' | 'POPULAR' | 'SQL'>('ALL');
  const [sortBy, setSortBy] = useState<'total' | 'name' | 'hard'>('total');
  const userSolvedCount = useSolvedProblems().size;
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

  const pinnedCompanies = useMemo(() => {
    if (pinnedSet.size === 0) return [];
    return companies.filter((c) => pinnedSet.has(c.slug));
  }, [companies, pinnedSet]);

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
        if (categoryFilter === 'POPULAR') return c.total >= 100;
        if (categoryFilter === 'SQL') return (c.sqlTotal ?? 0) > 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'hard') return b.hard - a.hard;
        return b.total - a.total;
      });
  }, [companies, searchQuery, categoryFilter, sortBy, pinnedSet]);

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
        {/* Minimal Hero */}
        <section className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)]">
            Company-wise LeetCode DSA
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal max-w-xl mx-auto">
            Interview problems top tech & quant firms actually ask, ranked by frequency and recency.
          </p>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[var(--text-muted)] font-normal">
            <span>{companies.length} companies</span>
            <span className="opacity-30">·</span>
            <span>{syncStatus?.uniqueProblemsCount?.toLocaleString() || '3,400+'} questions</span>
            {userSolvedCount > 0 && (
              <>
                <span className="opacity-30">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{userSolvedCount} solved</span>
              </>
            )}
          </div>
        </section>

        {/* Minimalist Spotlight Search & Controls */}
        <section className="max-w-2xl mx-auto space-y-3">
          <div className="relative group flex items-center h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]/30 focus-within:border-[var(--text-main)]/30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-[border-color,box-shadow] duration-150">
            <Search className="absolute left-4 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies by name, tag, or domain..."
              className="w-full h-full pl-11 pr-16 text-sm bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none"
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
              <div className="absolute right-3.5 flex items-center gap-1 pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono text-[var(--text-light)] bg-[var(--bg-subtle)] border border-[var(--border)]">
                  ⌘K
                </kbd>
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono text-[var(--text-light)] bg-[var(--bg-subtle)] border border-[var(--border)]">
                  /
                </kbd>
              </div>
            )}
          </div>

          {/* Minimal Category Tabs */}
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
                { key: 'POPULAR', label: '100+ Questions' },
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
                <option value="total">Most Questions</option>
                <option value="name">Name (A-Z)</option>
                <option value="hard">Most Hard</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results Counter (only shown when filtered or searching) */}
        {(searchQuery || categoryFilter !== 'ALL') && (
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-0.5">
            <span>Showing <strong>{filteredCompanies.length}</strong> {filteredCompanies.length === 1 ? 'company' : 'companies'}</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
              }}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] underline cursor-pointer transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Pinned Companies Quick Access Shelf */}
        {pinnedCompanies.length > 0 && categoryFilter === 'ALL' && !searchQuery.trim() && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
                <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500 rotate-45" />
                <span>Pinned Companies</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-medium">
                  {pinnedCompanies.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCategoryFilter('PINNED')}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                View pinned only →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinnedCompanies.map((company) => (
                <CompanyCard key={`pinned-${company.slug}`} company={company} isPinned={true} />
              ))}
            </div>
            <div className="pt-2 border-b border-[var(--border)]" />
          </section>
        )}

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 max-w-md mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              {categoryFilter === 'PINNED' ? (
                <Pin className="w-5 h-5 text-amber-500 rotate-45" />
              ) : (
                <Search className="w-5 h-5 opacity-70" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[var(--text-main)]">
                {categoryFilter === 'PINNED' ? 'No pinned companies yet' : 'No companies found'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {categoryFilter === 'PINNED'
                  ? 'Click the pin icon on any company card (e.g. Google, Meta, or NeetCode 150) to pin your target interview lists.'
                  : searchQuery
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
              <span>Browse all companies</span>
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
