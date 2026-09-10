'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  GitBranch,
  Trophy,
  ArrowLeft,
  ArrowUpDown,
  BookOpen,
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('grindmap-solved-updated', handleUpdate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-normal">
          <Link href="/" className="apple-press hover:text-[var(--text-main)] flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Companies</span>
          </Link>
          <span>/</span>
          <span className="text-[var(--text-main)] font-medium">Algorithmic Patterns</span>
        </nav>

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
            <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg text-[10px] font-mono text-[var(--text-light)] border border-[var(--border)] bg-[var(--bg-subtle)]">
              /
            </kbd>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] gap-1">
              {[
                { key: 'ALL', label: `All (${patterns.length})` },
                { key: 'Fundamentals', label: 'Fundamentals' },
                { key: 'Data Structures', label: 'Data Structures' },
                { key: 'Trees & Graphs', label: 'Trees & Graphs' },
                { key: 'Advanced & DP', label: 'Advanced & DP' },
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
            <div className="col-span-full py-16 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-3xl bg-[var(--bg-card)]/50">
              No patterns matching &quot;{searchQuery}&quot; found.
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
