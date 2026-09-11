'use client';

import React from 'react';
import Link from 'next/link';
import { Command, ShieldCheck, FileText } from 'lucide-react';
import { LeetMapLogo } from './LeetMapLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--bg-subtle)]/60 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <LeetMapLogo size={28} />
              <span className="font-semibold text-base tracking-tight text-[var(--text-main)] group-hover:opacity-80 transition-opacity">
                LeetMap Pro
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
              Interview problems top firms actually ask, ranked by real-time frequency and recency. Free, open, and designed for focused software engineers.
            </p>

            {/* Live Operational Status Badge */}
            <div className="pt-1 flex items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">
              Product
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link href="/" className="hover:text-[var(--text-main)] transition-colors">
                  Company Directory (680+)
                </Link>
              </li>
              <li>
                <Link href="/strategy" className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1">
                  <span>Strategy Roadmap</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">Core</span>
                </Link>
              </li>
              <li>
                <Link href="/patterns" className="hover:text-[var(--text-main)] transition-colors">
                  22 Coding Patterns
                </Link>
              </li>
              <li>
                <Link href="/sql" className="hover:text-[var(--text-main)] transition-colors">
                  SQL Interview Hub
                </Link>
              </li>
              <li>
                <Link href="/patterns/time-complexity" className="hover:text-[var(--text-main)] transition-colors">
                  Big-O Cheatsheet
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Companies Column */}
          <div className="space-y-3">
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
                  Citadel Quant LeetCode
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">
              Trust & Legal
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/saitarrun/LeetMap-Pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-mono bg-[var(--bg-card)] border border-[var(--border)] px-2 py-1 rounded-lg">
                  <Command className="w-3 h-3" />
                  <span>Press <kbd className="font-semibold text-[var(--text-main)]">⌘K</kbd> to search</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer and Copyright */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© {currentYear} LeetMap Pro. Free and open software engineering interview prep.</p>
          <p className="text-[11px] text-center sm:text-right max-w-md">
            LeetCode is a registered trademark of LeetCode LLC. LeetMap Pro is an independent open-source learning resource and is not affiliated with, sponsored by, or endorsed by LeetCode LLC.
          </p>
        </div>
      </div>
    </footer>
  );
};
