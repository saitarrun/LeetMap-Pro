'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RefreshCw, Sun, Moon, Database, GitBranch, Building2 } from 'lucide-react';
import { SyncStatus } from '@/types';

interface HeaderProps {
  onOpenSync?: () => void;
  syncStatus?: SyncStatus | null;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSync, syncStatus }) => {
  const pathname = usePathname() || '/';
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-page)]/80 backdrop-blur-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand & Track Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-5">
          <Link
            href="/"
            className="apple-press flex items-center gap-2 text-[var(--text-main)] select-none shrink-0"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="absolute w-4 h-4 rounded-full bg-emerald-500/30 animate-ping" />
            </div>
            <span className="font-bold text-base tracking-tight">grindmap</span>
          </Link>

          {/* Apple Primary Segmented Navigation */}
          <nav className="flex items-center p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs font-semibold shadow-2xs">
            <Link
              href="/"
              className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                pathname === '/' || pathname.startsWith('/company')
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 opacity-80" />
              <span>Companies</span>
              <span className="font-mono text-[10px] text-[var(--text-light)]">683</span>
            </Link>

            <Link
              href="/patterns"
              className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                pathname.startsWith('/patterns')
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 opacity-80" />
              <span>Patterns</span>
              <span className="font-mono text-[10px] text-[var(--text-light)]">22</span>
            </Link>

            <Link
              href="/sql"
              className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                pathname.startsWith('/sql')
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Database className="w-3.5 h-3.5 opacity-80" />
              <span>SQL</span>
              <span className="font-mono text-[10px] text-[var(--text-light)]">73</span>
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Realtime Sync Badge Button */}
          <button
            onClick={onOpenSync}
            className="apple-press flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-sm text-[var(--text-main)] shadow-xs hover:border-[var(--text-muted)]/30 cursor-pointer"
            title="View Realtime Multi-Source Sync Status"
          >
            <RefreshCw className="w-3 h-3 text-emerald-500 animate-[spin_12s_linear_infinite]" />
            <span className="hidden md:inline font-normal text-[var(--text-muted)]">Live:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              {syncStatus?.companiesCount ? `${syncStatus.companiesCount} cos` : '683 cos'}
            </span>
          </button>

          {/* Upstream Github */}
          <a
            href="https://github.com/liquidslr/leetcode-company-wise-problems"
            target="_blank"
            rel="noopener noreferrer"
            className="apple-press p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
            title="Upstream Repositories"
            aria-label="GitHub Repository"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="apple-press p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
