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
  patternProblems?: Record<string, string[]>;
  syncStatus: SyncStatus | null;
}

export const StrategyClient: React.FC<StrategyClientProps> = ({
  patterns,
  patternProblems = {},
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
            <span>17 Core Topics</span>
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
          <PatternDependencyGraph patterns={patterns} patternProblems={patternProblems} solvedSet={solvedSet} />
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

        {/* Semantic Editorial Guide & Strategy Architecture */}
        <section className="max-w-5xl mx-auto w-full pt-8 border-t border-[var(--border)] space-y-8">
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
              Mastering DSA Patterns in Prerequisite Sequence
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Coding interview problems often feel overwhelming when approached randomly. The key to scalable retention is understanding that almost every complex LeetCode problem is an extension of foundational algorithmic patterns. By mastering these patterns in strict topological dependency order, you cultivate pattern-matching reflexes rather than memorizing individual solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                <span>Phase 1</span>
                <span>·</span>
                <span>Linear Fundamentals</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                Pointers, Windows &amp; Search
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Build intuition on contiguous subsets and monotonic structures. Focus on <Link href="/patterns/two-pointers" className="text-[var(--accent)] hover:underline">Two Pointers</Link>, <Link href="/patterns/sliding-window" className="text-[var(--accent)] hover:underline">Sliding Window</Link>, and <Link href="/patterns/prefix-sum" className="text-[var(--accent)] hover:underline">Prefix Sum</Link> to reduce O(N²) brute-force solutions to optimal O(N) linear time.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <span>Phase 2</span>
                <span>·</span>
                <span>Hierarchies &amp; Graphs</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                Trees, Heaps &amp; Traversal
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Transition to non-linear structures. Learn tier-by-tier exploration with <Link href="/patterns/tree-bfs" className="text-[var(--accent)] hover:underline">Tree BFS</Link>, recursive path analysis with <Link href="/patterns/tree-dfs" className="text-[var(--accent)] hover:underline">Tree DFS</Link>, and cycle detection with <Link href="/patterns/graph-traversal" className="text-[var(--accent)] hover:underline">Graph Traversal</Link> and <Link href="/patterns/topological-sort" className="text-[var(--accent)] hover:underline">Topological Sort</Link>.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs uppercase tracking-wider">
                <span>Phase 3</span>
                <span>·</span>
                <span>Dynamic Optimization</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                Backtracking &amp; Dynamic Programming
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Tackle optimization and state transitions. Master recursive exhaustive search with <Link href="/patterns/backtracking" className="text-[var(--accent)] hover:underline">Backtracking</Link>, memoization, and optimal substructure in <Link href="/patterns/dynamic-programming-1d" className="text-[var(--accent)] hover:underline">1D DP</Link> and <Link href="/patterns/dynamic-programming-2d" className="text-[var(--accent)] hover:underline">2D Dynamic Programming</Link>.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-main)]">
              Frequently Asked Strategy Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-semibold text-[var(--text-main)]">
                  How many problems should I solve per pattern?
                </h4>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  We recommend solving 3 to 5 curated problems per pattern: 1 Easy for template mastery, 2-3 Mediums for real-world interview application, and 1 Hard problem once comfortable.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-[var(--text-main)]">
                  How do I track what I have solved?
                </h4>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  LeetMap Pro automatically saves your solved checkpoints locally in your browser and syncs them across company lists, SQL tracks, and this strategy roadmap in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
