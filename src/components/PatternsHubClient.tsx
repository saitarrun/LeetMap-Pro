'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  Clock,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { PatternSummary, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { PatternCard } from '@/components/PatternCard';
import { useSolvedProblems } from '@/utils/useSolvedProblems';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Arrays & Strings' | 'Linked Lists' | 'Trees & Tries' | 'Graphs' | 'Dynamic Programming' | 'Stacks & Queues' | 'Heaps & Intervals' | 'Advanced & Greedy'>('ALL');
  const [sortBy, setSortBy] = useState<'total' | 'name' | 'hard'>('total');
  const solvedSet = useSolvedProblems();

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
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'hard') return b.hard - a.hard;
        return b.total - a.total;
      });
  }, [patterns, searchQuery, categoryFilter, sortBy]);

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

        {/* Minimal Category Tabs & Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs max-w-4xl mx-auto w-full pt-1">
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
                onClick={() => setCategoryFilter(tab.key as typeof categoryFilter)}
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

          <div className="flex items-center gap-1.5 self-center sm:self-auto shrink-0 text-xs text-[var(--text-muted)]">
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
                  setCategoryFilter('ALL');
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
              return <PatternCard key={pattern.slug} pattern={pattern} solvedCount={count} />;
            })
          )}
        </section>
      </main>
    </div>
  );
};
