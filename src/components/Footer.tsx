'use client';

import React from 'react';
import Link from 'next/link';
import { LeetMapLogo } from './LeetMapLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--bg-subtle)]/40 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <LeetMapLogo size={24} />
              <span className="font-medium text-sm tracking-tight text-[var(--text-main)] group-hover:opacity-80 transition-opacity">
                LeetMap Pro
              </span>
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">
              Interview problems top tech firms actually ask, ranked by frequency and recency. Free and open source.
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
                  DSA
                </Link>
              </li>
              <li>
                <Link href="/strategy" className="hover:text-[var(--text-main)] transition-colors">
                  Strategy Roadmap
                </Link>
              </li>
              <li>
                <Link href="/patterns" className="hover:text-[var(--text-main)] transition-colors">
                  Coding Patterns
                </Link>
              </li>
              <li>
                <Link href="/sql" className="hover:text-[var(--text-main)] transition-colors">
                  SQL Interview Hub
                </Link>
              </li>
              <li>
                <Link href="/patterns/time-complexity" className="hover:text-[var(--text-main)] transition-colors">
                  Big-O Guide
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
                  Google
                </Link>
              </li>
              <li>
                <Link href="/company/meta" className="hover:text-[var(--text-main)] transition-colors">
                  Meta
                </Link>
              </li>
              <li>
                <Link href="/company/amazon" className="hover:text-[var(--text-main)] transition-colors">
                  Amazon
                </Link>
              </li>
              <li>
                <Link href="/company/apple" className="hover:text-[var(--text-main)] transition-colors">
                  Apple
                </Link>
              </li>
              <li>
                <Link href="/company/netflix" className="hover:text-[var(--text-main)] transition-colors">
                  Netflix
                </Link>
              </li>
              <li>
                <Link href="/company/microsoft" className="hover:text-[var(--text-main)] transition-colors">
                  Microsoft
                </Link>
              </li>
              <li>
                <Link href="/company/bloomberg" className="hover:text-[var(--text-main)] transition-colors">
                  Bloomberg
                </Link>
              </li>
              <li>
                <Link href="/company/citadel" className="hover:text-[var(--text-main)] transition-colors">
                  Citadel
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Links Column */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">
              Legal
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
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
                  GitHub
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
