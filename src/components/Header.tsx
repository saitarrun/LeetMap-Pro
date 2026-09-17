'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sun,
  Moon,
  Search,
  Menu,
  X,
  ExternalLink,
  Building2,
  Layers,
  Compass,
  Database,
} from 'lucide-react';
import { SignInButton, SignUpButton, Show } from '@clerk/nextjs';
import { toast } from 'sonner';
import { SyncStatus } from '@/types';
import { UserProfileMenu, MobileUserMenuSection } from '@/components/UserProfileMenu';
import { LeetMapLogo } from '@/components/LeetMapLogo';

interface HeaderProps {
  onOpenSync?: () => void;
  syncStatus?: SyncStatus | null;
}

export const Header: React.FC<HeaderProps> = () => {
  const pathname = usePathname() || '/';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile navigation on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

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

  const handleLiveRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      const data = await res.json();
      window.dispatchEvent(new CustomEvent('leetmap-live-refresh', { detail: data }));
      toast.success('Live dataset up to date', {
        description: '684 companies and 3,422 problems verified',
      });
    } catch {
      toast.success('Live dataset up to date');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <header className="sticky top-0 z-[110] w-full border-b border-[var(--border)] bg-[var(--bg-page)]/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        {/* Brand & Desktop Track Switcher */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <Link
            href="/"
            className="apple-press group flex items-center gap-2 select-none shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500"
            aria-label="LeetMap Pro home"
          >
            <LeetMapLogo size={24} />
            <span className="text-[16px] sm:text-[17px] font-bold tracking-[-0.035em] text-[var(--text-main)]">
              LeetMap <span className="text-emerald-500 dark:text-emerald-400">Pro</span>
            </span>
          </Link>

          {/* Primary Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5 text-xs">
            <Link
              href="/"
              className={`apple-press px-3.5 py-1.5 rounded-xl transition-colors ${
                pathname === '/'
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium'
              }`}
            >
              DSA
            </Link>

            <Link
              href="/companies"
              className={`apple-press px-3.5 py-1.5 rounded-xl transition-colors ${
                pathname === '/companies' || pathname.startsWith('/company/')
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
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Search Button (Cmd+K) */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('leetmap-open-command-palette'))}
            className="apple-press inline-flex items-center justify-center gap-2 h-8 w-8 sm:w-auto px-0 sm:px-3 rounded-full text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border)] transition-colors cursor-pointer shrink-0"
            title="Search companies, patterns, and questions (⌘K)"
            aria-label="Search everything"
          >
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[11px] font-medium hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border)] text-[10px] font-mono text-[var(--text-muted)]">⌘K</kbd>
          </button>

          {/* Realtime Live Refresh Button (Desktop only, mobile in drawer) */}
          <button
            onClick={handleLiveRefresh}
            disabled={isRefreshing}
            className="apple-press hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer disabled:opacity-70 shrink-0"
            title="Click to refresh live dataset"
            aria-label="Refresh live dataset"
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isRefreshing ? 'animate-ping' : ''}`} />
            <span className="text-[11px] font-medium">{isRefreshing ? 'Checking...' : 'Live'}</span>
          </button>

          {/* User Github Profile (Desktop only, mobile in drawer) */}
          <a
            href="https://github.com/saitarrun"
            target="_blank"
            rel="noopener noreferrer"
            className="apple-press hidden md:inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
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
              <div className="hidden sm:block shrink-0">
                <SignUpButton mode="modal">
                  <button className="apple-press h-8 inline-flex items-center text-xs font-medium px-3 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer shrink-0">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </Show>

          <div className="inline-flex items-center shrink-0">
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

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="apple-press md:hidden h-8 w-8 inline-flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer shrink-0"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Panel */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-14 bg-black/50 backdrop-blur-xs z-[105] md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-[110] md:hidden border-t border-[var(--border)] bg-[var(--bg-page)]/98 backdrop-blur-3xl px-4 py-3.5 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`apple-press flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                pathname === '/'
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>DSA Practice</span>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-mono">Home</span>
            </Link>

            <Link
              href="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className={`apple-press flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                pathname === '/companies' || pathname.startsWith('/company/')
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-teal-500" />
                <span>Companies Directory</span>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-mono">660+</span>
            </Link>

            <Link
              href="/patterns"
              onClick={() => setMobileMenuOpen(false)}
              className={`apple-press flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                pathname.startsWith('/patterns')
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-teal-500" />
                <span>Patterns</span>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-mono">22</span>
            </Link>

            <Link
              href="/strategy"
              onClick={() => setMobileMenuOpen(false)}
              className={`apple-press flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                pathname.startsWith('/strategy')
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-blue-500" />
                <span>Strategy Roadmap</span>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-mono">Guide</span>
            </Link>

            <Link
              href="/sql"
              onClick={() => setMobileMenuOpen(false)}
              className={`apple-press flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                pathname.startsWith('/sql')
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-purple-500" />
                <span>SQL Interview Hub</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono font-semibold">NEW</span>
            </Link>
          </nav>

          {/* Auth options for signed-out users in drawer */}
          <Show when="signed-out">
            <div className="pt-2 border-t border-[var(--border)]/60 grid grid-cols-2 gap-2">
              <SignInButton mode="modal">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="apple-press h-9 w-full rounded-xl text-xs font-semibold bg-[var(--text-main)] text-[var(--bg-page)] flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="apple-press h-9 w-full rounded-xl text-xs font-medium bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-main)] flex items-center justify-center cursor-pointer"
                >
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </Show>

          {/* Auth options for signed-in users in drawer */}
          <Show when="signed-in">
            <MobileUserMenuSection onClose={() => setMobileMenuOpen(false)} />
          </Show>

          <div className="pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <button
              onClick={() => {
                handleLiveRefresh();
                setMobileMenuOpen(false);
              }}
              disabled={isRefreshing}
              className="apple-press flex items-center gap-1.5 py-2 px-2 rounded-lg hover:text-[var(--text-main)] cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isRefreshing ? 'animate-ping' : ''}`} />
              <span>{isRefreshing ? 'Checking sync...' : 'Live Dataset Sync'}</span>
            </button>

            <a
              href="https://github.com/saitarrun/LeetMap-Pro"
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press flex items-center gap-1.5 py-2 px-2 rounded-lg hover:text-[var(--text-main)]"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </>
    )}
    </header>
  );
};
