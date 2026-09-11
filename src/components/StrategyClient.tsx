'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Code2, ChevronRight, Compass } from 'lucide-react';
import { PatternSummary, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { PatternDependencyGraph } from '@/components/PatternDependencyGraph';
import { useSolvedProblems } from '@/utils/useSolvedProblems';

interface StrategyClientProps {
  patterns: PatternSummary[];
  syncStatus: SyncStatus | null;
}

export const StrategyClient: React.FC<StrategyClientProps> = ({
  patterns,
  syncStatus,
}) => {
  const solvedSet = useSolvedProblems();

  return (
    <div className="min-h-screen flex flex-col">
      <Header syncStatus={syncStatus} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Minimalist Hero */}
        <section className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Optimal Progression Sequence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)]">
            Interview Strategy Roadmap
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal max-w-xl mx-auto">
            Master the core algorithmic patterns in optimal sequence. Follow the prerequisite pathways from fundamentals to advanced dynamic programming.
          </p>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[var(--text-muted)] font-normal">
            <span>18 Core Topics</span>
            <span className="opacity-30">·</span>
            <span>22 Study Blueprints</span>
            {solvedSet.size > 0 && (
              <>
                <span className="opacity-30">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{solvedSet.size} solved</span>
              </>
            )}
          </div>
        </section>

        {/* Strategy Roadmap Visualization */}
        <section className="apple-enter">
          <PatternDependencyGraph patterns={patterns} solvedSet={solvedSet} />
        </section>

        {/* Interview Preparation Guides */}
        <section className="max-w-5xl mx-auto w-full pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/patterns/time-complexity#time-complexity"
              className="apple-card group flex items-center justify-between gap-3.5 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]/30 transition-all select-none shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 text-[var(--text-main)]">
                  <Clock className="w-4.5 h-4.5 opacity-80" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[var(--text-main)]">Time &amp; Space Complexity</span>
                    <span className="text-[10px] font-mono text-[var(--text-light)]">Big O</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">Loops, recursion, space &amp; complexity trade-offs</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-light)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            <Link
              href="/patterns/time-complexity#python-essentials"
              className="apple-card group flex items-center justify-between gap-3.5 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]/30 transition-all select-none shadow-xs cursor-pointer"
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
                  <p className="text-[11px] text-[var(--text-muted)] truncate">Battle-tested templates, heaps, bisect &amp; traps</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-light)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
