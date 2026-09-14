'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Pin,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  Building2,
  BookOpen,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { SqlCompanySummary, SqlCatalog, SyncStatus, SqlProblem } from '@/types';
import { Header } from '@/components/Header';
import { SqlCompanyCard } from '@/components/SqlCompanyCard';
import { SqlExplorerView } from '@/components/SqlExplorerView';
import { useSolvedProblems } from '@/utils/useSolvedProblems';
import { usePinnedCompanies } from '@/utils/usePinnedCompanies';
import { toggleProblemSolved } from '@/utils/progress';
import { getProblemOutboundUrl } from '@/utils/urls';

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
  const [activeSearchTab, setActiveSearchTab] = useState<'companies' | 'problems'>('companies');
  const [visibleProblemsCount, setVisibleProblemsCount] = useState<number>(24);
  const userSelectedTabRef = useRef<boolean>(false);
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
        setActiveSearchTab('companies');
        userSelectedTabRef.current = false;
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

  const matchingProblems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const cleanNum = q.replace(/^#/, '');
    const isNum = /^\d+$/.test(cleanNum);

    return catalog.problems.filter((p) => {
      if (isNum && p.id === cleanNum) return true;
      if (p.id && p.id.startsWith(cleanNum) && cleanNum.length >= 2) return true;
      const matchesTitle = p.title.toLowerCase().includes(q);
      const matchesSlug = p.slug.toLowerCase().includes(q);
      const matchesTopic = p.topics.some((t) => t.toLowerCase().includes(q));
      const matchesCompany = p.companies.some((c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
      );
      return matchesTitle || matchesSlug || matchesTopic || matchesCompany;
    }).sort((a, b) => {
      if (isNum) {
        if (a.id === cleanNum && b.id !== cleanNum) return -1;
        if (b.id === cleanNum && a.id !== cleanNum) return 1;
      }
      return b.companiesCount - a.companiesCount;
    });
  }, [catalog.problems, searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setActiveSearchTab('companies');
      userSelectedTabRef.current = false;
      return;
    }
    if (!userSelectedTabRef.current) {
      if (filteredCompanies.length === 0 && matchingProblems.length > 0) {
        setActiveSearchTab('problems');
      } else if (filteredCompanies.length > 0 && matchingProblems.length === 0) {
        setActiveSearchTab('companies');
      }
    }
  }, [searchQuery, filteredCompanies.length, matchingProblems.length]);

  const handleToggleSolvedProblem = (prob: SqlProblem) => {
    const solved = toggleProblemSolved(prob.slug, {
      id: prob.id,
      title: prob.title,
      difficulty: prob.difficulty,
    });
    if (solved) {
      toast.success(`Solved: ${prob.title}`, {
        description: `${prob.id ? `#${prob.id} · ` : ''}${prob.difficulty} SQL`,
        action: {
          label: 'Undo',
          onClick: () => {
            toggleProblemSolved(prob.slug);
          },
        },
      });
    } else {
      toast('Unmarked SQL problem', { description: prob.title });
    }
  };

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
            Interview problems top firms actually ask, ranked by frequency and recency.
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
                  placeholder="Search SQL companies, or problems by name or # (e.g. #176, Second Highest)..."
                  className="w-full h-full pl-12 pr-14 text-sm bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none focus-visible:outline-none border-none outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveSearchTab('companies');
                      userSelectedTabRef.current = false;
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

              {/* Segmented Search Tabs: Companies vs SQL Problems */}
              {searchQuery.trim() && (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="inline-flex p-1 rounded-xl bg-[var(--bg-subtle)] text-xs border border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => {
                        userSelectedTabRef.current = true;
                        setActiveSearchTab('companies');
                      }}
                      className={`apple-press px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeSearchTab === 'companies'
                          ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 opacity-70" />
                      <span>Companies ({filteredCompanies.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        userSelectedTabRef.current = true;
                        setActiveSearchTab('problems');
                      }}
                      className={`apple-press px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeSearchTab === 'problems'
                          ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 opacity-70" />
                      <span>SQL Problems ({matchingProblems.length})</span>
                    </button>
                  </div>

                  <div className="text-xs text-[var(--text-muted)] hidden sm:block">
                    {activeSearchTab === 'companies' ? (
                      <span>Showing {filteredCompanies.length} companies</span>
                    ) : (
                      <span>Showing {Math.min(visibleProblemsCount, matchingProblems.length)} of {matchingProblems.length} problems</span>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile Filter & Sort Controls (Single Clean Row) */}
              {(!searchQuery.trim() || activeSearchTab === 'companies') && (
                <div className="flex sm:hidden items-center justify-between gap-2 text-xs pt-1">
                  <div
                    className={`relative flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                      categoryFilter !== 'ALL'
                        ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)] font-medium'
                        : 'bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-main)]'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                      className="w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none pr-4 text-inherit"
                      aria-label="Filter SQL companies by category"
                    >
                      <option value="ALL" className="bg-[var(--bg-card)] text-[var(--text-main)]">All Categories</option>
                      <option value="PINNED" className="bg-[var(--bg-card)] text-[var(--text-main)]">
                        Pinned {pinnedSet.size > 0 ? `(${pinnedSet.size})` : ''}
                      </option>
                      <option value="FAANG" className="bg-[var(--bg-card)] text-[var(--text-main)]">FAANG & Big Tech</option>
                      <option value="FINTECH" className="bg-[var(--bg-card)] text-[var(--text-main)]">FinTech & Quant</option>
                      <option value="POPULAR_20" className="bg-[var(--bg-card)] text-[var(--text-main)]">20+ SQL</option>
                      <option value="POPULAR_50" className="bg-[var(--bg-card)] text-[var(--text-main)]">50+ SQL</option>
                    </select>
                    <ChevronDown className="w-3 h-3 opacity-60 absolute right-2.5 pointer-events-none" />
                  </div>

                  <div className="relative flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-main)]">
                    <ArrowUpDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none pr-4 text-[var(--text-main)]"
                      aria-label="Sort SQL companies"
                    >
                      <option value="sqlTotal" className="bg-[var(--bg-card)] text-[var(--text-main)]">Most SQL</option>
                      <option value="name" className="bg-[var(--bg-card)] text-[var(--text-main)]">Name (A-Z)</option>
                      <option value="sqlHard" className="bg-[var(--bg-card)] text-[var(--text-main)]">Most Hard</option>
                    </select>
                    <ChevronDown className="w-3 h-3 opacity-60 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Desktop Category Filter Tabs */}
              {(!searchQuery.trim() || activeSearchTab === 'companies') && (
                <div className="hidden sm:flex sm:items-center justify-between gap-2.5 text-xs pt-1">
                  <div className="flex items-center gap-1 overflow-x-auto pb-0 scrollbar-none">
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

                  <div className="flex items-center gap-1.5 shrink-0 text-xs">
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
              )}
            </section>

            {/* Main Content: SQL Problems Grid OR Company Cards Grid */}
            {searchQuery.trim() && activeSearchTab === 'problems' ? (
              matchingProblems.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 max-w-md mx-auto space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                    <BookOpen className="w-5 h-5 opacity-70" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-[var(--text-main)]">No SQL problems found</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      No SQL problems matching &ldquo;{searchQuery}&rdquo;. Try searching by problem number (e.g. 176, 185) or name (Second Highest Salary).
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {filteredCompanies.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          userSelectedTabRef.current = true;
                          setActiveSearchTab('companies');
                        }}
                        className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)] transition-colors cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>View {filteredCompanies.length} matching {filteredCompanies.length === 1 ? 'company' : 'companies'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveSearchTab('companies');
                        userSelectedTabRef.current = false;
                      }}
                      className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    >
                      <span>Clear search</span>
                    </button>
                  </div>
                </div>
              ) : (
                <section className="space-y-6">
                  <div className="apple-enter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {matchingProblems.slice(0, visibleProblemsCount).map((prob) => {
                      const isSolved = solvedSet.has(prob.slug);
                      const diff = prob.difficulty;
                      return (
                        <div
                          key={prob.slug || prob.id}
                          className="group relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 hover:border-[var(--text-muted)]/35 hover:shadow-sm transition-all flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <a
                                href={getProblemOutboundUrl(prob.slug)}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                className="group/title flex items-center gap-1.5 min-w-0 flex-1"
                              >
                                <span className={`text-xs sm:text-sm font-semibold hover:underline line-clamp-1 leading-snug ${
                                  isSolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'
                                }`}>
                                  {prob.id ? `#${prob.id} ` : ''}{prob.title}
                                </span>
                                <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover/title:text-[var(--text-main)] shrink-0 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                              </a>

                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide shrink-0 uppercase border ${
                                diff === 'EASY'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : diff === 'MEDIUM'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              }`}>
                                {diff}
                              </span>
                            </div>

                            {/* Companies count & list */}
                            {prob.companiesCount > 0 && (
                              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] flex-wrap">
                                <Building2 className="w-3.5 h-3.5 text-[var(--text-light)] shrink-0" />
                                <span className="text-[11px]">
                                  Asked by{' '}
                                  <span className="font-medium text-[var(--text-main)]">
                                    {prob.companies.slice(0, 3).map((c) => c.name).join(', ')}
                                  </span>
                                  {prob.companiesCount > 3 && (
                                    <span> +{prob.companiesCount - 3} more</span>
                                  )}
                                </span>
                              </div>
                            )}

                            {/* Topics */}
                            {prob.topics && prob.topics.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                {prob.topics.slice(0, 3).map((topic) => (
                                  <span
                                    key={topic}
                                    className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)] font-normal"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Bottom actions */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]/60 text-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleSolvedProblem(prob)}
                              className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                                isSolved
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)]'
                              }`}
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isSolved ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`} />
                              <span className="text-[11px]">{isSolved ? 'Solved' : 'Mark Solved'}</span>
                            </button>

                            <a
                              href={getProblemOutboundUrl(prob.slug)}
                              target="_blank"
                              rel="nofollow noopener noreferrer"
                              className="apple-press inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-medium bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)] transition-colors"
                            >
                              <span>Solve</span>
                              <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {visibleProblemsCount < matchingProblems.length && (
                    <div className="flex flex-col items-center justify-center pt-4 pb-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVisibleProblemsCount((prev) => Math.min(prev + 24, matchingProblems.length))}
                        className="apple-press inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-main)] shadow-xs transition-all cursor-pointer"
                      >
                        <span>Show More SQL Problems</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      </button>
                      <p className="text-[11px] text-[var(--text-muted)] font-normal">
                        Showing {Math.min(visibleProblemsCount, matchingProblems.length)} of {matchingProblems.length} SQL problems
                      </p>
                    </div>
                  )}
                </section>
              )
            ) : (
              /* Company Cards Grid */
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
                    <div className="flex items-center justify-center gap-2 pt-1">
                      {matchingProblems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            userSelectedTabRef.current = true;
                            setActiveSearchTab('problems');
                          }}
                          className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)] transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>View {matchingProblems.length} matching SQL {matchingProblems.length === 1 ? 'problem' : 'problems'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setActiveSearchTab('companies');
                          userSelectedTabRef.current = false;
                          setCategoryFilter('ALL');
                        }}
                        className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)] transition-colors cursor-pointer"
                      >
                        <span>Reset all filters</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredCompanies.map((c) => (
                    <SqlCompanyCard key={c.slug} company={c} />
                  ))
                )}
              </section>
            )}
          </div>
        ) : (
          <SqlExplorerView catalog={catalog} />
        )}
      </main>
    </div>
  );
};
