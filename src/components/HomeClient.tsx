'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Pin, Sparkles, ExternalLink, CheckCircle2, SlidersHorizontal, ArrowUpDown, ChevronDown, Building2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { CompanySummary, SyncStatus, DailyChallenge } from '@/types';
import { Header } from '@/components/Header';
import { CompanyCard } from '@/components/CompanyCard';
import { useSolvedProblems } from '@/utils/useSolvedProblems';
import { usePinnedCompanies } from '@/utils/usePinnedCompanies';
import { toggleProblemSolved } from '@/utils/progress';
import { SearchResult } from '@/app/api/search/route';

interface HomeClientProps {
  initialCompanies?: CompanySummary[];
  totalCompaniesCount?: number;
  initialSyncStatus: SyncStatus | null;
  initialDailyChallenge?: DailyChallenge | null;
}

const FAANG_SLUGS = new Set([
  'google', 'amazon', 'meta', 'apple', 'microsoft', 'netflix', 'uber', 'airbnb', 'stripe'
]);

const FINTECH_SLUGS = new Set([
  'citadel', 'jane-street', 'two-sigma', 'goldman-sachs', 'j-p-morgan', 'bloomberg',
  'stripe', 'squarepoint-capital', 'hudson-river-trading', 'paypal', 'coinbase', 'visa', 'mastercard'
]);

function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMillisecondsUntilLocalMidnight(now: Date = new Date()): number {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(1_000, nextMidnight.getTime() - now.getTime() + 250);
}

export const HomeClient: React.FC<HomeClientProps> = ({
  initialCompanies = [],
  totalCompaniesCount = 0,
  initialSyncStatus,
  initialDailyChallenge = null,
}) => {
  const [companies, setCompanies] = useState<CompanySummary[]>(initialCompanies);
  const [totalCount, setTotalCount] = useState<number>(totalCompaniesCount || initialCompanies.length);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(18);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(initialSyncStatus);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(initialDailyChallenge);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PINNED' | 'FAANG' | 'FINTECH' | 'POPULAR' | 'SQL'>('ALL');
  const [sortBy, setSortBy] = useState<'total' | 'name' | 'hard'>('total');
  const [problemResults, setProblemResults] = useState<SearchResult[]>([]);
  const [isSearchingProblems, setIsSearchingProblems] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState<'companies' | 'problems'>('companies');
  const [visibleProblemsCount, setVisibleProblemsCount] = useState<number>(24);
  const userSelectedTabRef = useRef<boolean>(false);
  const solvedSet = useSolvedProblems();
  const userSolvedCount = solvedSet.size;
  const { pinnedSet } = usePinnedCompanies();
  const isDailySolved = dailyChallenge ? solvedSet.has(dailyChallenge.slug) : false;

  useEffect(() => {
    setVisibleCount(18);
    setVisibleProblemsCount(24);
  }, [searchQuery, categoryFilter, sortBy]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCompanies = () => {
      fetch('/api/companies', { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error('Failed to load companies');
          return response.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setCompanies(data);
            setTotalCount(data.length);
          }
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name !== 'AbortError') {
            toast.error('Unable to load companies. Please refresh and try again.');
          }
        })
        .finally(() => setIsLoadingCompanies(false));
    };

    // Populate full dataset after initial lightweight SSR render
    loadCompanies();

    const handleLiveRefreshEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SyncStatus>;
      if (customEvent.detail) {
        setSyncStatus(customEvent.detail);
      }
      loadCompanies();
    };

    window.addEventListener('leetmap-live-refresh', handleLiveRefreshEvent);

    return () => {
      controller.abort();
      window.removeEventListener('leetmap-live-refresh', handleLiveRefreshEvent);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let midnightTimer: ReturnType<typeof setTimeout> | undefined;
    let refreshController: AbortController | undefined;
    let currentLocalDate = getLocalDateKey();

    const refreshDailyChallenge = async () => {
      refreshController?.abort();
      refreshController = new AbortController();
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

      try {
        const response = await fetch(
          `/api/daily-challenge?timeZone=${encodeURIComponent(timeZone)}`,
          {
            cache: 'no-store',
            signal: refreshController.signal,
          }
        );
        if (!response.ok) return;

        const challenge = (await response.json()) as DailyChallenge;
        if (!disposed && challenge?.slug && challenge?.date) {
          setDailyChallenge(challenge);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to refresh daily challenge:', error);
        }
      }
    };

    const scheduleMidnightRefresh = () => {
      if (midnightTimer) clearTimeout(midnightTimer);
      midnightTimer = setTimeout(() => {
        currentLocalDate = getLocalDateKey();
        void refreshDailyChallenge().finally(scheduleMidnightRefresh);
      }, getMillisecondsUntilLocalMidnight());
    };

    const refreshAfterDateChange = () => {
      const nextLocalDate = getLocalDateKey();
      if (nextLocalDate !== currentLocalDate) {
        currentLocalDate = nextLocalDate;
        void refreshDailyChallenge();
      }
      scheduleMidnightRefresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshAfterDateChange();
    };

    void refreshDailyChallenge();
    scheduleMidnightRefresh();
    window.addEventListener('focus', refreshAfterDateChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disposed = true;
      refreshController?.abort();
      if (midnightTimer) clearTimeout(midnightTimer);
      window.removeEventListener('focus', refreshAfterDateChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleToggleSolvedDaily = (prob: DailyChallenge) => {
    const solved = toggleProblemSolved(prob.slug, { title: prob.title, difficulty: prob.difficulty });
    if (solved) {
      toast.success(`Solved: ${prob.title}`, {
        description: `#${prob.id} · ${prob.difficulty} · Today's Challenge`,
        action: {
          label: 'Undo',
          onClick: () => handleToggleSolvedDaily(prob),
        },
      });
    } else {
      toast('Unmarked problem', { description: prob.title });
    }
  };

  const handleToggleSolvedProblem = (prob: SearchResult) => {
    if (!prob.slug) return;
    const title = prob.label.replace(/^#\d+\s*/, '');
    const solved = toggleProblemSolved(prob.slug, {
      id: prob.id,
      title,
      difficulty: (prob.difficulty as 'EASY' | 'MEDIUM' | 'HARD') || undefined,
    });
    if (solved) {
      toast.success(`Solved: ${title}`, {
        description: `${prob.id ? `#${prob.id} · ` : ''}${prob.difficulty || 'DSA'}`,
        action: {
          label: 'Undo',
          onClick: () => {
            if (prob.slug) toggleProblemSolved(prob.slug);
          },
        },
      });
    } else {
      toast('Unmarked problem', { description: title });
    }
  };

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
        setProblemResults([]);
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

  const displayedCompanies = useMemo(() => {
    return filteredCompanies.slice(0, visibleCount);
  }, [filteredCompanies, visibleCount]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setProblemResults([]);
      setIsSearchingProblems(false);
      setActiveSearchTab('companies');
      userSelectedTabRef.current = false;
      return;
    }

    setIsSearchingProblems(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&type=problem`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          const results: SearchResult[] = data.results || [];
          setProblemResults(results);

          // Auto-select tab if user hasn't explicitly clicked one
          if (!userSelectedTabRef.current) {
            if (filteredCompanies.length === 0 && results.length > 0) {
              setActiveSearchTab('problems');
            } else if (filteredCompanies.length > 0 && results.length === 0) {
              setActiveSearchTab('companies');
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to search problems:', error);
        }
      } finally {
        setIsSearchingProblems(false);
      }
    }, 160);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, filteredCompanies.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header syncStatus={syncStatus} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        {/* Minimal Hero */}
        <section className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)]">
            LeetMap Pro
          </h1>

          <p className="text-base sm:text-xl font-medium text-[var(--text-main)]/90 tracking-tight">
            Company Wise Leetcode and SQL Questions
          </p>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal max-w-xl mx-auto">
            Interview problems top firms actually ask, ranked by frequency and recency.
          </p>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[var(--text-muted)] font-normal">
            <span>{totalCount || companies.length} companies</span>
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

        {/* Apple Spotlight Search & Controls */}
        <section className="max-w-2xl mx-auto space-y-3">
          <div className="relative group flex items-center h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]/30 focus-within:border-[var(--text-main)]/35 shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-200">
            <Search className="absolute left-4.5 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies, or problems by name or # (e.g. Two Sum, #1, 42)..."
              className="w-full h-full pl-12 pr-14 text-sm bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none focus-visible:outline-none border-none outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setProblemResults([]);
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

          {/* Segmented Search Tabs: Companies vs Problems */}
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
                  <span>Problems ({problemResults.length})</span>
                  {isSearchingProblems && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
                  )}
                </button>
              </div>

              <div className="text-xs text-[var(--text-muted)] hidden sm:block">
                {activeSearchTab === 'companies' ? (
                  <span>Showing {Math.min(visibleCount, filteredCompanies.length)} of {filteredCompanies.length} companies</span>
                ) : (
                  <span>Showing {Math.min(visibleProblemsCount, problemResults.length)} of {problemResults.length} problems</span>
                )}
              </div>
            </div>
          )}

          {/* Mobile Filter & Sort Controls (Single Clean Row) - shown for companies */}
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
                  aria-label="Filter companies by category"
                >
                  <option value="ALL" className="bg-[var(--bg-card)] text-[var(--text-main)]">All Categories</option>
                  <option value="PINNED" className="bg-[var(--bg-card)] text-[var(--text-main)]">
                    Pinned {pinnedSet.size > 0 ? `(${pinnedSet.size})` : ''}
                  </option>
                  <option value="FAANG" className="bg-[var(--bg-card)] text-[var(--text-main)]">FAANG & Big Tech</option>
                  <option value="FINTECH" className="bg-[var(--bg-card)] text-[var(--text-main)]">FinTech & Quant</option>
                  <option value="POPULAR" className="bg-[var(--bg-card)] text-[var(--text-main)]">100+ Questions</option>
                  <option value="SQL" className="bg-[var(--bg-card)] text-[var(--text-main)]">Has SQL</option>
                </select>
                <ChevronDown className="w-3 h-3 opacity-60 absolute right-2.5 pointer-events-none" />
              </div>

              <div className="relative flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-main)]">
                <ArrowUpDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none pr-4 text-[var(--text-main)]"
                  aria-label="Sort companies"
                >
                  <option value="total" className="bg-[var(--bg-card)] text-[var(--text-main)]">Most Questions</option>
                  <option value="name" className="bg-[var(--bg-card)] text-[var(--text-main)]">Name (A-Z)</option>
                  <option value="hard" className="bg-[var(--bg-card)] text-[var(--text-main)]">Most Hard</option>
                </select>
                <ChevronDown className="w-3 h-3 opacity-60 absolute right-2.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Desktop Category Tabs & Sort - shown for companies */}
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
                  { key: 'POPULAR', label: '100+ Questions' },
                  { key: 'SQL', label: 'Has SQL' },
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
                  <option value="total">Most Questions</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="hard">Most Hard</option>
                </select>
              </div>
            </div>
          )}
        </section>

        {/* LeetCode Daily Challenge Banner */}
        {dailyChallenge && !searchQuery && categoryFilter === 'ALL' && (
          <section className="max-w-2xl mx-auto w-full">
            <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all overflow-hidden ${
              isDailySolved
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-[var(--bg-card)] border-[var(--border)] shadow-sm hover:border-[var(--text-muted)]/30'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                    isDailySolved
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {isDailySolved ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                        Today&apos;s LeetCode Challenge
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                        dailyChallenge.difficulty === 'EASY'
                          ? 'text-emerald-500 bg-emerald-500/10'
                          : dailyChallenge.difficulty === 'MEDIUM'
                          ? 'text-amber-500 bg-amber-500/10'
                          : 'text-rose-500 bg-rose-500/10'
                      }`}>
                        {dailyChallenge.difficulty}
                      </span>
                    </div>

                    <a
                      href={dailyChallenge.link}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="group flex items-center gap-1.5 mt-0.5 min-w-0 max-w-full"
                    >
                      <h3 className={`text-xs sm:text-sm font-semibold hover:underline break-words line-clamp-2 leading-snug ${
                        isDailySolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'
                      }`}>
                        #{dailyChallenge.id} {dailyChallenge.title}
                      </h3>
                      <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-main)] shrink-0 transition-colors" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]/50 justify-end sm:justify-start">
                  <button
                    onClick={() => handleToggleSolvedDaily(dailyChallenge)}
                    className={`apple-press text-xs px-3.5 py-1.5 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto ${
                      isDailySolved
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)]'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isDailySolved ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`} />
                    <span>{isDailySolved ? 'Solved Today' : 'Mark Solved'}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Results Counter (only shown when filtered or searching companies) */}
        {((searchQuery && activeSearchTab === 'companies') || (!searchQuery && categoryFilter !== 'ALL')) && (
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-0.5">
            <span>Showing <strong>{filteredCompanies.length}</strong> {filteredCompanies.length === 1 ? 'company' : 'companies'}</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setProblemResults([]);
                setActiveSearchTab('companies');
                userSelectedTabRef.current = false;
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

        {/* Main Content: Problems Search Grid OR Companies Grid */}
        {searchQuery.trim() && activeSearchTab === 'problems' ? (
          isSearchingProblems && problemResults.length === 0 ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-label="Loading problems">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]"
                />
              ))}
            </section>
          ) : problemResults.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 max-w-md mx-auto space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                <BookOpen className="w-5 h-5 opacity-70" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[var(--text-main)]">No problems found</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  No LeetCode problems matching &ldquo;{searchQuery}&rdquo;. Try searching by problem number (e.g. 1, 42), problem name (Two Sum), or company name (Google).
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
                    setProblemResults([]);
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
              <div className="apple-enter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {problemResults.slice(0, visibleProblemsCount).map((prob) => {
                  const isSolved = prob.slug ? solvedSet.has(prob.slug) : false;
                  const diff = prob.difficulty?.toUpperCase();
                  const cleanTitle = prob.label.replace(/^#\d+\s*/, '');
                  return (
                    <div
                      key={prob.slug || prob.id}
                      className="group relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 hover:border-[var(--text-muted)]/35 hover:shadow-sm transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <a
                            href={prob.href}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="group/title flex items-center gap-1.5 min-w-0 flex-1"
                          >
                            <span className={`text-xs sm:text-sm font-semibold hover:underline line-clamp-1 leading-snug ${
                              isSolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'
                            }`}>
                              {prob.id ? `#${prob.id} ` : ''}{cleanTitle}
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
                            {diff || 'DSA'}
                          </span>
                        </div>

                        {/* Top Companies that ask this question */}
                        {prob.companiesCount !== undefined && prob.companiesCount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] flex-wrap">
                            <Building2 className="w-3.5 h-3.5 text-[var(--text-light)] shrink-0" />
                            <span className="text-[11px]">
                              Asked by{' '}
                              <span className="font-medium text-[var(--text-main)]">
                                {prob.topCompanies?.slice(0, 3).join(', ')}
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
                          href={prob.href}
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

              {visibleProblemsCount < problemResults.length && (
                <div className="flex flex-col items-center justify-center pt-4 pb-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleProblemsCount((prev) => Math.min(prev + 24, problemResults.length))}
                    className="apple-press inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-main)] shadow-xs transition-all cursor-pointer"
                  >
                    <span>Show More Problems</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </button>
                  <p className="text-[11px] text-[var(--text-muted)] font-normal">
                    Showing {Math.min(visibleProblemsCount, problemResults.length)} of {problemResults.length} problems
                  </p>
                </div>
              )}
            </section>
          )
        ) : (
          /* Companies Grid */
          isLoadingCompanies ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-label="Loading companies">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-card)]"
                />
              ))}
            </section>
          ) : filteredCompanies.length === 0 ? (
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
              <div className="flex items-center justify-center gap-2 pt-1">
                {problemResults.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      userSelectedTabRef.current = true;
                      setActiveSearchTab('problems');
                    }}
                    className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)] transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View {problemResults.length} matching {problemResults.length === 1 ? 'problem' : 'problems'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setProblemResults([]);
                    setActiveSearchTab('companies');
                    userSelectedTabRef.current = false;
                    setCategoryFilter('ALL');
                  }}
                  className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)] transition-colors cursor-pointer"
                >
                  <span>Browse all companies</span>
                </button>
              </div>
            </div>
          ) : (
            <section className="space-y-6">
              <div className="apple-enter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedCompanies.map((company) => (
                  <CompanyCard key={company.slug} company={company} />
                ))}
              </div>

              {visibleCount < filteredCompanies.length && (
                <div className="flex flex-col items-center justify-center pt-4 pb-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 36, filteredCompanies.length))}
                    className="apple-press inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-main)] shadow-xs transition-all cursor-pointer"
                  >
                    <span>Show More Companies</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </button>
                  <p className="text-[11px] text-[var(--text-muted)] font-normal">
                    Showing {Math.min(visibleCount, filteredCompanies.length)} of {filteredCompanies.length} companies
                  </p>
                </div>
              )}
            </section>
          )
        )}

        {/* Generative AI & Search FAQ Section */}
        <section className="pt-16 border-t border-[var(--border)] max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-normal">
              Everything you need to know about company-wise coding interview prep on LeetMap Pro.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <h3 className="text-sm font-semibold text-[var(--text-main)]">
                How to practice company-wise LeetCode questions for free?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
                LeetMap Pro organizes thousands of verified coding interview problems asked by 680+ tech companies (including Google, Meta, Amazon, Apple, Microsoft, Citadel, Bloomberg), ranked by real frequency and recency over 30 days, 3 months, and 6 months with zero paywall.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <h3 className="text-sm font-semibold text-[var(--text-main)]">
                Is LeetMap Pro completely free to use?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
                Yes, LeetMap Pro is 100% free and open-source. All company interview problem lists, coding patterns, SQL interview hub, and roadmap tracking are available without any subscription.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <h3 className="text-sm font-semibold text-[var(--text-main)]">
                What are the most popular coding patterns for FAANG interviews?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
                The top interview patterns include Two Pointers, Sliding Window, Monotonic Stack, Binary Search, Tree Traversal, Graph Traversal, and 1-D / 2-D Dynamic Programming. LeetMap Pro provides interactive visual roadmaps for 22 DSA patterns.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <h3 className="text-sm font-semibold text-[var(--text-main)]">
                Does LeetMap Pro support SQL and database interview questions?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
                Yes, LeetMap Pro features a dedicated SQL interview practice hub containing company-wise SQL questions asked by 70+ tech companies with difficulty breakdowns and direct problem links.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
