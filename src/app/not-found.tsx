import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Compass, Home, LayoutGrid, GitFork, Database, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The coding interview page, company list, or pattern you requested does not exist.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16 text-center bg-[var(--bg-main)] text-[var(--text-main)]">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center mb-6 text-[var(--text-muted)] shadow-sm">
        <Compass className="w-8 h-8 opacity-70 animate-pulse" />
      </div>

      <span className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)] mb-3">
        Page Not Found
      </h1>

      <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-md mx-auto mb-8 font-normal leading-relaxed">
        The problem list, company directory, or pattern guide you are looking for has been moved, renamed, or does not exist.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md text-left mb-8">
        <Link
          href="/"
          className="apple-press flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Home className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors" />
            <div>
              <div className="text-xs font-semibold text-[var(--text-main)]">Company Directory</div>
              <div className="text-[11px] text-[var(--text-muted)]">680+ Tech Firms</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/patterns"
          className="apple-press flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors" />
            <div>
              <div className="text-xs font-semibold text-[var(--text-main)]">Coding Patterns</div>
              <div className="text-[11px] text-[var(--text-muted)]">22 DSA Templates</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/strategy"
          className="apple-press flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <GitFork className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors" />
            <div>
              <div className="text-xs font-semibold text-[var(--text-main)]">Strategy Roadmap</div>
              <div className="text-[11px] text-[var(--text-muted)]">Prerequisite Graph</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/sql"
          className="apple-press flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors" />
            <div>
              <div className="text-xs font-semibold text-[var(--text-main)]">SQL Practice Hub</div>
              <div className="text-[11px] text-[var(--text-muted)]">70+ Companies</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <Link
        href="/"
        className="apple-press inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  );
}
