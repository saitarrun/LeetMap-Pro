'use client';

import React from 'react';
import Link from 'next/link';
import { LeetMapLogo } from './LeetMapLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--bg-subtle)]/40 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-3 lg:col-span-1 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <LeetMapLogo size={24} />
              <span className="font-medium text-sm tracking-tight text-[var(--text-main)] group-hover:opacity-80 transition-opacity">
                LeetMap Pro
              </span>
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">
              Company-wise LeetCode & SQL interview questions ranked by real frequency and recency.
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">
              Product
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link href="/" className="hover:text-[var(--text-main)] transition-colors">
                  Company DSA
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-[var(--text-main)] transition-colors font-medium text-emerald-600 dark:text-emerald-400">
                  All 660+ Companies (A–Z)
                </Link>
              </li>
              <li>
                <Link href="/strategy" className="hover:text-[var(--text-main)] transition-colors">
                  Strategy Roadmap
                </Link>
              </li>
              <li>
                <Link href="/patterns" className="hover:text-[var(--text-main)] transition-colors">
                  22 Coding Patterns
                </Link>
              </li>
              <li>
                <Link href="/sql" className="hover:text-[var(--text-main)] transition-colors">
                  73 SQL Companies
                </Link>
              </li>
              <li>
                <Link href="/patterns/time-complexity" className="hover:text-[var(--text-main)] transition-colors">
                  Big-O Complexity Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Companies Column */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">
              Top Firms
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link href="/company/google" className="hover:text-[var(--text-main)] transition-colors">
                  Google LeetCode
                </Link>
              </li>
              <li>
                <Link href="/company/meta" className="hover:text-[var(--text-main)] transition-colors">
                  Meta LeetCode
                </Link>
              </li>
              <li>
                <Link href="/company/amazon" className="hover:text-[var(--text-main)] transition-colors">
                  Amazon LeetCode
                </Link>
              </li>
              <li>
                <Link href="/company/apple" className="hover:text-[var(--text-main)] transition-colors">
                  Apple LeetCode
                </Link>
              </li>
              <li>
                <Link href="/company/netflix" className="hover:text-[var(--text-main)] transition-colors">
                  Netflix LeetCode
                </Link>
              </li>
              <li>
                <Link href="/company/microsoft" className="hover:text-[var(--text-main)] transition-colors">
                  Microsoft LeetCode
                </Link>
              </li>
              <li>
                <Link href="/company/bloomberg" className="hover:text-[var(--text-main)] transition-colors">
                  Bloomberg LeetCode
                </Link>
              </li>
              <li>
                <Link href="/company/citadel" className="hover:text-[var(--text-main)] transition-colors">
                  Citadel LeetCode
                </Link>
              </li>
            </ul>
          </div>

          {/* Top SQL Interview Questions Column */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">
              SQL Questions
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link href="/sql/google" className="hover:text-[var(--text-main)] transition-colors">
                  Google SQL
                </Link>
              </li>
              <li>
                <Link href="/sql/amazon" className="hover:text-[var(--text-main)] transition-colors">
                  Amazon SQL
                </Link>
              </li>
              <li>
                <Link href="/sql/microsoft" className="hover:text-[var(--text-main)] transition-colors">
                  Microsoft SQL
                </Link>
              </li>
              <li>
                <Link href="/sql/meta" className="hover:text-[var(--text-main)] transition-colors">
                  Meta SQL
                </Link>
              </li>
              <li>
                <Link href="/sql/bloomberg" className="hover:text-[var(--text-main)] transition-colors">
                  Bloomberg SQL
                </Link>
              </li>
              <li>
                <Link href="/sql/spotify" className="hover:text-[var(--text-main)] transition-colors">
                  Spotify SQL
                </Link>
              </li>
              <li>
                <Link href="/sql/pinterest" className="hover:text-[var(--text-main)] transition-colors">
                  Pinterest SQL
                </Link>
              </li>
              <li>
                <Link href="/sql/robinhood" className="hover:text-[var(--text-main)] transition-colors">
                  Robinhood SQL
                </Link>
              </li>
            </ul>
          </div>

          {/* Core DSA Patterns Column */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">
              DSA Patterns
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link href="/patterns/sliding-window" className="hover:text-[var(--text-main)] transition-colors">
                  Sliding Window
                </Link>
              </li>
              <li>
                <Link href="/patterns/two-pointers" className="hover:text-[var(--text-main)] transition-colors">
                  Two Pointers
                </Link>
              </li>
              <li>
                <Link href="/patterns/fast-slow-pointers" className="hover:text-[var(--text-main)] transition-colors">
                  Fast & Slow Pointers
                </Link>
              </li>
              <li>
                <Link href="/patterns/monotonic-stack" className="hover:text-[var(--text-main)] transition-colors">
                  Monotonic Stack
                </Link>
              </li>
              <li>
                <Link href="/patterns/matrix-traversal" className="hover:text-[var(--text-main)] transition-colors">
                  Matrix Traversal
                </Link>
              </li>
              <li>
                <Link href="/patterns/binary-search-tree" className="hover:text-[var(--text-main)] transition-colors">
                  Binary Search Tree
                </Link>
              </li>
              <li>
                <Link href="/patterns/tree-bfs" className="hover:text-[var(--text-main)] transition-colors">
                  Tree BFS
                </Link>
              </li>
              <li>
                <Link href="/patterns/union-find" className="hover:text-[var(--text-main)] transition-colors">
                  Union-Find
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Links Column */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">
              About & Legal
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link href="/sql" className="hover:text-[var(--text-main)] transition-colors">
                  All 73 SQL Companies
                </Link>
              </li>
              <li>
                <Link href="/patterns" className="hover:text-[var(--text-main)] transition-colors">
                  All 22 DSA Patterns
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/saitarrun/LeetMap-Pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--text-main)] transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Minimal Bottom Line */}
        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
          <p>© {currentYear} LeetMap Pro. All rights reserved.</p>
          <p className="text-[11px] text-center sm:text-right">
            LeetCode is a registered trademark of LeetCode LLC. Not affiliated with or endorsed by LeetCode.
          </p>
        </div>
      </div>
    </footer>
  );
};
