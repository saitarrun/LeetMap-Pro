'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  GitBranch,
  Trophy,
  ArrowUpDown,
  BookOpen,
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
  syncStatus: SyncStatus | null;
}

export const PatternsHubClient: React.FC<PatternsHubClientProps> = ({
  patterns,
  syncStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Fundamentals' | 'Data Structures' | 'Trees & Graphs' | 'Advanced & DP'>('ALL');
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

        {/* Minimalist Spotlight Search & Controls */}
        <section className="max-w-2xl mx-auto space-y-3">
          <div className="relative group flex items-center h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]/30 focus-within:border-[var(--text-main)]/30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-[border-color,box-shadow] duration-150">
            <Search className="absolute left-4 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patterns... (Two Pointers, Sliding Window, DP)"
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
                { key: 'Fundamentals', label: 'Fundamentals' },
                { key: 'Data Structures', label: 'Data Structures' },
                { key: 'Trees & Graphs', label: 'Trees & Graphs' },
                { key: 'Advanced & DP', label: 'Advanced & DP' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCategoryFilter(tab.key as typeof categoryFilter)}
                  className={`apple-press shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    categoryFilter === tab.key
                      ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
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

        {/* Interview Resources */}
        <section className="grid gap-3 md:grid-cols-2">
          <Link
            href="/patterns/time-complexity#time-complexity"
            className="apple-card group flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-amber-500/40 hover:bg-amber-500/5 transition-all shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-[var(--text-main)]">Time Complexity</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 uppercase tracking-wide">Big O</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-snug">Analyze loops, recursion, space, and hard patterns</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-amber-500 transition-colors shrink-0" />
          </Link>
          <Link
            href="/patterns/time-complexity#python-essentials"
            className="apple-card group flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-[var(--text-main)]">Python Essentials</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 uppercase tracking-wide">LeetCode</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-snug">Dicts, sets, heaps, matrices, graphs, trees, and templates</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors shrink-0" />
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
            filteredPatterns.map((pattern) => (
              <PatternCard key={pattern.slug} pattern={pattern} />
            ))
          )}
        </section>
      </main>
    </div>
  );
};
