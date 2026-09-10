'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  GitBranch,
  Trophy,
  ArrowUpDown,
  BookOpen,
  X,
} from 'lucide-react';
import { PatternSummary, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { PatternCard } from '@/components/PatternCard';
import { getSolvedProblems } from '@/utils/progress';

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
        <section className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 opacity-80" />
            <span>22 Core Coding Interview Blueprints</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)]">
            Browse by Pattern
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal">
            Stop grinding random questions. Master the recurring algorithmic blueprints top tech companies test in coding interviews.
          </p>

          {/* Metric Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3.5 py-1.5 rounded-full shadow-xs">
              <GitBranch className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span><strong>{totalPatterns}</strong> core patterns</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3.5 py-1.5 rounded-full shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span><strong>{totalQuestionsMapped.toLocaleString()}</strong> pattern problems</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-3.5 py-1.5 rounded-full shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span><strong>{solvedSet.size}</strong> solved</span>
            </div>
          </div>
        </section>

        {/* Search & Category Filter Controls */}
        <section className="max-w-2xl mx-auto space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 22 patterns... (Two Pointers, Sliding Window, Monotonic Stack)"
              className="w-full pl-11 pr-12 py-3 rounded-2xl text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-light)] shadow-xs focus:outline-none focus:border-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--border)]/40 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="apple-press absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--text-light)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
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

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] gap-1">
              {[
                { key: 'ALL', label: `All Patterns (${patterns.length})` },
                { key: 'Fundamentals', label: 'Fundamentals' },
                { key: 'Data Structures', label: 'Data Structures' },
                { key: 'Trees & Graphs', label: 'Trees & Graphs' },
                { key: 'Advanced & DP', label: 'Advanced & DP' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCategoryFilter(tab.key as any)}
                  className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                    categoryFilter === tab.key
                      ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {tab.key === 'ALL' && <GitBranch className="w-3.5 h-3.5 opacity-70" />}
                  <span>{tab.label}</span>
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
                  <option value="total">Most Questions</option>
                  <option value="name">Pattern Name</option>
                  <option value="hard">Most Hard Questions</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Pattern Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
