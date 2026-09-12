'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  ChevronRight,
  Code2,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';
import { PatternSummary, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { PatternCard } from '@/components/PatternCard';
import { useSolvedProblems } from '@/utils/useSolvedProblems';

export type CategoryFilterType =
  | 'ALL'
  | 'Arrays & Strings'
  | 'Linked Lists'
  | 'Trees & Tries'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Stacks & Queues'
  | 'Heaps & Intervals'
  | 'Advanced & Greedy';

const VALID_CATEGORIES: CategoryFilterType[] = [
  'ALL',
  'Arrays & Strings',
  'Linked Lists',
  'Trees & Tries',
  'Graphs',
  'Dynamic Programming',
  'Stacks & Queues',
  'Heaps & Intervals',
  'Advanced & Greedy',
];

function normalizeCategory(param: string | null): CategoryFilterType {
  if (!param) return 'ALL';
  const clean = decodeURIComponent(param).trim().toLowerCase();
  if (clean === 'all') return 'ALL';
  if (clean.includes('array') || clean.includes('string') || clean.includes('pointer') || clean.includes('window') || clean.includes('hashing')) return 'Arrays & Strings';
  if (clean.includes('linked')) return 'Linked Lists';
  if (clean.includes('tree') || clean.includes('trie') || clean.includes('bst')) return 'Trees & Tries';
  if (clean.includes('graph') || clean.includes('topological') || clean.includes('matrix') || clean.includes('union')) return 'Graphs';
  if (clean.includes('dp') || clean.includes('dynamic')) return 'Dynamic Programming';
  if (clean.includes('stack') || clean.includes('queue')) return 'Stacks & Queues';
  if (clean.includes('heap') || clean.includes('interval') || clean.includes('priority')) return 'Heaps & Intervals';
  if (clean.includes('greedy') || clean.includes('backtracking') || clean.includes('bit')) return 'Advanced & Greedy';

  const exact = VALID_CATEGORIES.find((c) => c.toLowerCase() === clean);
  return exact || 'ALL';
}

interface PatternsHubClientProps {
  patterns: PatternSummary[];
  patternProblems?: Record<string, string[]>;
  syncStatus: SyncStatus | null;
}

export const PatternsHubClient: React.FC<PatternsHubClientProps> = ({
  patterns,
  patternProblems = {},
  syncStatus,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category') || searchParams?.get('group') || searchParams?.get('filter');
  const patternParam = searchParams?.get('pattern') || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [internalCategory, setInternalCategory] = useState<CategoryFilterType>('ALL');
  const [sortBy, setSortBy] = useState<'total' | 'name' | 'hard'>('total');
  const solvedSet = useSolvedProblems();

  // Derive categoryFilter directly from URL searchParams if present, or internal state
  const categoryFilter: CategoryFilterType = categoryParam
    ? normalizeCategory(categoryParam)
    : internalCategory;

  // Auto-scroll to target pattern card when navigating directly from roadmap
  useEffect(() => {
    if (patternParam) {
      const el = document.getElementById(`pattern-${patternParam}`);
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [patternParam, categoryFilter]);

  const handleCategoryChange = (newCat: CategoryFilterType) => {
    setInternalCategory(newCat);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newCat === 'ALL') {
      params.delete('category');
      params.delete('group');
      params.delete('filter');
    } else {
      params.set('category', newCat);
    }
    // Clear pattern target when manually switching categories
    params.delete('pattern');
    const query = params.toString();
    router.replace(`/patterns${query ? `?${query}` : ''}`, { scroll: false });
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
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery]);

  const filteredPatterns = useMemo(() => {
    return patterns
      .filter((p) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchTagline = p.tagline.toLowerCase().includes(q);
          if (!matchName && !matchTagline) return false;
        }

        if (categoryFilter !== 'ALL' && p.category !== categoryFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Elevate targeted pattern to the very top for direct roadmap clarity
        if (patternParam) {
          if (a.slug === patternParam) return -1;
          if (b.slug === patternParam) return 1;
        }
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'hard') return b.hard - a.hard;
        return b.total - a.total;
      });
  }, [patterns, searchQuery, categoryFilter, sortBy, patternParam]);

  const totalPatterns = patterns.length;
  const totalQuestionsMapped = useMemo(() => {
    return patterns.reduce((acc, p) => acc + p.total, 0);
  }, [patterns]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header syncStatus={syncStatus} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">

        {/* Hero Section */}
        {/* Minimal Hero */}
        <section className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)]">
            Browse by Pattern
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal max-w-xl mx-auto">
            Recurring algorithmic blueprints top tech companies test in coding interviews.
          </p>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[var(--text-muted)] font-normal">
            <span>{totalPatterns} patterns</span>
            <span className="opacity-30">·</span>
            <span>{totalQuestionsMapped.toLocaleString()} problems</span>
            {solvedSet.size > 0 && (
              <>
                <span className="opacity-30">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{solvedSet.size} solved</span>
              </>
            )}
          </div>
        </section>

        {/* Apple Spotlight Search Bar (Centered) */}
        <div className="max-w-2xl mx-auto">
          <div className="relative group flex items-center h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]/30 focus-within:border-[var(--text-main)]/35 shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-200">
            <Search className="absolute left-4.5 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patterns... (Two Pointers, Sliding Window, DP)"
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
        </div>

        {/* Mobile Filter & Sort Controls (Single Clean Row) */}
        <div className="flex sm:hidden items-center justify-between gap-2 text-xs max-w-4xl mx-auto w-full pt-1">
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
              onChange={(e) => handleCategoryChange(e.target.value as CategoryFilterType)}
              className="w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none pr-4 text-inherit"
              aria-label="Filter patterns by category"
            >
              <option value="ALL" className="bg-[var(--bg-card)] text-[var(--text-main)]">All Categories</option>
              <option value="Arrays & Strings" className="bg-[var(--bg-card)] text-[var(--text-main)]">Arrays & Strings</option>
              <option value="Linked Lists" className="bg-[var(--bg-card)] text-[var(--text-main)]">Linked Lists</option>
              <option value="Trees & Tries" className="bg-[var(--bg-card)] text-[var(--text-main)]">Trees & Tries</option>
              <option value="Graphs" className="bg-[var(--bg-card)] text-[var(--text-main)]">Graphs</option>
              <option value="Dynamic Programming" className="bg-[var(--bg-card)] text-[var(--text-main)]">Dynamic Programming</option>
              <option value="Stacks & Queues" className="bg-[var(--bg-card)] text-[var(--text-main)]">Stacks & Queues</option>
              <option value="Heaps & Intervals" className="bg-[var(--bg-card)] text-[var(--text-main)]">Heaps & Intervals</option>
              <option value="Advanced & Greedy" className="bg-[var(--bg-card)] text-[var(--text-main)]">Advanced & Greedy</option>
            </select>
            <ChevronDown className="w-3 h-3 opacity-60 absolute right-2.5 pointer-events-none" />
          </div>

          <div className="relative flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-main)]">
            <ArrowUpDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none pr-4 text-[var(--text-main)]"
              aria-label="Sort patterns"
            >
              <option value="total" className="bg-[var(--bg-card)] text-[var(--text-main)]">Most Questions</option>
              <option value="name" className="bg-[var(--bg-card)] text-[var(--text-main)]">Name (A-Z)</option>
              <option value="hard" className="bg-[var(--bg-card)] text-[var(--text-main)]">Most Hard</option>
            </select>
            <ChevronDown className="w-3 h-3 opacity-60 absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Desktop Category Tabs & Sort */}
        <div className="hidden sm:flex sm:flex-row items-center justify-between gap-2.5 text-xs max-w-4xl mx-auto w-full pt-1">
          <div className="flex flex-wrap items-center justify-center gap-1">
            {[
              { key: 'ALL', label: 'All' },
              { key: 'Arrays & Strings', label: 'Arrays & Strings' },
              { key: 'Linked Lists', label: 'Linked Lists' },
              { key: 'Trees & Tries', label: 'Trees & Tries' },
              { key: 'Graphs', label: 'Graphs' },
              { key: 'Dynamic Programming', label: 'Dynamic Programming' },
              { key: 'Stacks & Queues', label: 'Stacks & Queues' },
              { key: 'Heaps & Intervals', label: 'Heaps & Intervals' },
              { key: 'Advanced & Greedy', label: 'Advanced & Greedy' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleCategoryChange(tab.key as CategoryFilterType)}
                className={`apple-press shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  categoryFilter === tab.key
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]/50'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-xs text-[var(--text-muted)]">
            <span className="text-[11px] opacity-60">Sort:</span>
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

        {/* Interview Resources (Quiet, minimalist Apple card) */}
        <section className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/patterns/time-complexity#time-complexity"
            className="apple-card group flex items-center justify-between gap-3.5 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]/30 transition-all select-none shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 text-[var(--text-main)]">
                <Clock className="w-4.5 h-4.5 opacity-80" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[var(--text-main)]">Time Complexity</span>
                  <span className="text-[10px] font-mono text-[var(--text-light)]">Big O</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] truncate">Loops, recursion, space & complexity trade-offs</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-light)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <Link
            href="/patterns/time-complexity#python-essentials"
            className="apple-card group flex items-center justify-between gap-3.5 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]/30 transition-all select-none shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 text-[var(--text-main)]">
                <Code2 className="w-4.5 h-4.5 opacity-80" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[var(--text-main)]">Python Essentials</span>
                  <span className="text-[10px] font-mono text-[var(--text-light)]">Cheatsheet</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] truncate">Dicts, heaps, matrices, binary search & templates</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-light)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </section>

        {/* Pattern Cards Grid */}
        <section className="apple-enter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatterns.length === 0 ? (
            <div className="col-span-full py-20 text-center rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 max-w-md mx-auto space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                <Search className="w-5 h-5 opacity-70" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[var(--text-main)]">No patterns found</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {searchQuery
                    ? `No pattern matching "${searchQuery}" in this category.`
                    : 'No patterns match the selected category filter.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  handleCategoryChange('ALL');
                }}
                className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)] transition-colors cursor-pointer"
              >
                <span>Reset all filters</span>
              </button>
            </div>
          ) : (
            filteredPatterns.map((pattern) => {
              const slugs = patternProblems[pattern.slug];
              const count = slugs && solvedSet.size > 0 ? slugs.filter((id) => solvedSet.has(id)).length : 0;
              return (
                <PatternCard
                  key={pattern.slug}
                  id={`pattern-${pattern.slug}`}
                  pattern={pattern}
                  solvedCount={count}
                  isHighlighted={pattern.slug === patternParam}
                />
              );
            })
          )}
        </section>

        {/* Generative AI & Educational Overview Section */}
        <section className="pt-16 border-t border-[var(--border)] max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Why Learn LeetCode Coding Patterns?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-normal">
              Rather than memorizing hundreds of disconnected questions, learning patterns enables you to solve any unseen interview problem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider">
                Recognize Signals
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
                Identify key problem clues: sorted array points to Two Pointers or Binary Search; contiguous subarray points to Sliding Window; shortest path points to BFS.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider">
                Reusable Templates
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
                Apply standard algorithmic blueprints that handle complex loop conditions, off-by-one errors, and pointer boundaries reliably.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider">
                FAANG Relevance
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
                Over 85% of interview questions asked at Google, Meta, Amazon, Apple, and Microsoft map directly to these 22 foundational patterns.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
