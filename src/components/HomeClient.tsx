'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Sparkles, Trophy, Database, RefreshCw, Flame, Building2 } from 'lucide-react';
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
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'FAANG' | 'FINTECH' | 'POPULAR'>('ALL');
  const [sortBy, setSortBy] = useState<'total' | 'name' | 'hard'>('total');
  const [userSolvedCount, setUserSolvedCount] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Solved counter and keyboard shortcut
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('grindmap-solved-updated', handleUpdate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => {
        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = c.name.toLowerCase().includes(q);
          const matchSlug = c.slug.toLowerCase().includes(q);
          const matchDomain = c.domain && c.domain.toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchDomain) return false;
        }

        // Category filter
        if (categoryFilter === 'FAANG') {
          return FAANG_SLUGS.has(c.slug);
        }
        if (categoryFilter === 'FINTECH') {
          return FINTECH_SLUGS.has(c.slug);
        }
        if (categoryFilter === 'POPULAR') {
          return c.total >= 100;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'hard') {
          return b.hard - a.hard;
        }
        return b.total - a.total;
      });
  }, [companies, searchQuery, categoryFilter, sortBy]);

  const handleSyncComplete = (newStatus: SyncStatus) => {
    setSyncStatus(newStatus);
    // Re-fetch companies index
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
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Always up-to-date company interview frequency</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)]">
            Company-wise LeetCode Questions
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            The coding interview problems top tech & finance companies actually ask, ranked by recency
            and frequency. Filter by last 30 days, 3 months, 6 months, or all-time.
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-xl shadow-xs">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span><strong>{companies.length}</strong> companies</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-xl shadow-xs">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>
                <strong>
                  {syncStatus?.uniqueProblemsCount ? syncStatus.uniqueProblemsCount.toLocaleString() : '3,392+'}
                </strong> problem entries
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-xl shadow-xs">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span><strong>{userSolvedCount}</strong> solved by you</span>
            </div>
          </div>
        </section>

        {/* Search & Controls */}
        <section className="max-w-2xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 470 companies... (Google, Amazon, Citadel, Stripe)"
              className="w-full pl-11 pr-12 py-3 rounded-2xl text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-light)] shadow-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[11px] font-mono text-[var(--text-light)] border border-[var(--border)] bg-[var(--bg-subtle)]">
              /
            </kbd>
          </div>

          {/* Category Chips & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'ALL', label: 'All Companies' },
                { key: 'FAANG', label: 'Big Tech / FAANG' },
                { key: 'FINTECH', label: 'FinTech & Quant' },
                { key: 'POPULAR', label: '100+ Questions' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCategoryFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                    categoryFilter === tab.key
                      ? 'bg-[var(--text-main)] text-[var(--bg-page)]'
                      : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[var(--text-light)]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] px-2.5 py-1 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="total">Most Problems</option>
                <option value="name">Alphabetical (A-Z)</option>
                <option value="hard">Most Hard Problems</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
          <span>{filteredCompanies.length} companies found</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Reset search
            </button>
          )}
        </div>

        {/* Companies Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </section>
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
