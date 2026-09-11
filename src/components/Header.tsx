'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RefreshCw, Sun, Moon, Database, GitBranch, Building2 } from 'lucide-react';
import { SignInButton, SignUpButton, Show } from '@clerk/nextjs';
import { SyncStatus } from '@/types';
import { UserProfileMenu } from '@/components/UserProfileMenu';
import { LeetMapLogo } from '@/components/LeetMapLogo';

interface HeaderProps {
  onOpenSync?: () => void;
  syncStatus?: SyncStatus | null;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSync, syncStatus }) => {
  const pathname = usePathname() || '/';
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('leetmap-theme-change', onStoreChange);
      return () => window.removeEventListener('leetmap-theme-change', onStoreChange);
    },
    () => document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
    () => 'dark'
  );

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';

    // Temporarily suppress transitions across the entire DOM during the theme swap
    // to prevent muddy color blending, dark-on-dark contrast inversion, and flashing effects
    const css = document.createElement('style');
    css.appendChild(
      document.createTextNode(
        '*, *::before, *::after { -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; -ms-transition: none !important; transition: none !important; }'
      )
    );
    document.head.appendChild(css);

    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('leetmap-theme-change'));

    // Force browser reflow to apply new CSS variables instantaneously
    window.getComputedStyle(document.body);

    // Re-enable interactions on next paint cycle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.head.removeChild(css);
      });
    });
  };

  return (
    <header className="sticky top-0 z-[110] border-b border-[var(--border)] bg-[var(--bg-page)]/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand & Track Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-5">
          <Link
            href="/"
            className="apple-press group flex items-center gap-2 select-none shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500"
            aria-label="LeetMap home"
          >
            <LeetMapLogo size={24} />
            <span className="text-[17px] font-bold tracking-[-0.035em] text-[var(--text-main)]">
              leet<span className="text-emerald-500 dark:text-emerald-400">map</span>
            </span>
          </Link>

          {/* Primary Minimal Navigation */}
          <nav className="flex items-center gap-0.5 text-xs">
            <Link
              href="/"
              className={`apple-press px-3 py-1.5 rounded-xl transition-colors ${
                pathname === '/' || pathname.startsWith('/company')
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium'
              }`}
            >
              Companies
            </Link>

            <Link
              href="/patterns"
              className={`apple-press px-3 py-1.5 rounded-xl transition-colors ${
                pathname.startsWith('/patterns')
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium'
              }`}
            >
              Patterns
            </Link>

            <Link
              href="/strategy"
              className={`apple-press px-3 py-1.5 rounded-xl transition-colors ${
                pathname.startsWith('/strategy')
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium'
              }`}
            >
              Strategy
            </Link>

            <Link
              href="/sql"
              className={`apple-press px-3 py-1.5 rounded-xl transition-colors ${
                pathname.startsWith('/sql')
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium'
              }`}
            >
              SQL
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Realtime Sync Badge Button */}
          <button
            onClick={onOpenSync}
            className="apple-press flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            title="Multi-source verified dataset"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium">Live</span>
          </button>

          {/* User Github Profile */}
          <a
            href="https://github.com/saitarrun"
            target="_blank"
            rel="noopener noreferrer"
            className="apple-press h-8 w-8 inline-flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
            title="GitHub Profile (@saitarrun)"
            aria-label="GitHub Profile"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>

          {/* Clerk Auth Controls */}
          <Show when="signed-out">
            <div className="flex items-center gap-1.5 shrink-0">
              <SignInButton mode="modal">
                <button className="apple-press h-8 inline-flex items-center text-xs font-semibold px-3 rounded-full bg-[var(--text-main)] text-[var(--bg-page)] hover:opacity-90 transition-opacity cursor-pointer shadow-2xs shrink-0">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="apple-press h-8 inline-flex items-center text-xs font-medium px-3 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer hidden sm:inline-flex shrink-0">
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </Show>

          <div className="inline-flex items-center">
              <UserProfileMenu />
            </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="apple-press h-8 w-8 inline-flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer overflow-hidden shrink-0"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            <span key={theme} className="apple-theme-icon block">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
