'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Sun, Moon, CheckCircle2, AlertCircle } from 'lucide-react';
import { SyncStatus } from '@/types';

interface HeaderProps {
  onOpenSync?: () => void;
  syncStatus?: SyncStatus | null;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSync, syncStatus }) => {
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
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-page)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 text-[var(--text-main)] hover:opacity-90 transition-opacity">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="font-semibold text-lg tracking-tight">grindmap</span>
          <span className="hidden sm:inline-block text-xs text-[var(--text-muted)] border-l border-[var(--border)] pl-2.5 ml-0.5">
            company-wise LeetCode
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Realtime Sync Badge Button */}
          <button
            onClick={onOpenSync}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] transition-colors cursor-pointer"
            title="View Realtime Sync Status & Triggers"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-[spin_10s_linear_infinite]" />
            <span className="hidden md:inline">Synced</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {syncStatus?.commitSha ? syncStatus.commitSha : 'live'}
            </span>
          </button>

          {/* Upstream Github */}
          <a
            href="https://github.com/liquidslr/leetcode-company-wise-problems"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors"
            title="Upstream GitHub Repository"
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
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
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
