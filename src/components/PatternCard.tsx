'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  CheckCircle2,
  ArrowLeftRight,
  SlidersHorizontal,
  Binary,
  Sigma,
  IterationCcw,
  Link2,
  Layers,
  Crown,
  FolderTree,
  Network,
  CalendarRange,
  GitBranch,
  Rows3,
  Split,
  Share2,
  ArrowDownUp,
  Grid,
  RotateCcw,
  TrendingUp,
  Boxes,
  Flame,
  Cpu,
  LucideIcon,
} from 'lucide-react';
import { PatternSummary } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowLeftRight,
  SlidersHorizontal,
  Binary,
  Sigma,
  IterationCcw,
  Link2,
  Layers,
  Crown,
  FolderTree,
  Network,
  CalendarRange,
  GitBranch,
  Rows3,
  Split,
  Share2,
  ArrowDownUp,
  Grid,
  RotateCcw,
  TrendingUp,
  Boxes,
  Flame,
  Cpu,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fundamentals: {
    bg: 'bg-[var(--bg-subtle)]',
    text: 'text-[var(--text-main)]',
    border: 'border-[var(--border)]',
  },
  'Data Structures': {
    bg: 'bg-[var(--bg-subtle)]',
    text: 'text-[var(--text-main)]',
    border: 'border-[var(--border)]',
  },
  'Trees & Graphs': {
    bg: 'bg-[var(--bg-subtle)]',
    text: 'text-[var(--text-main)]',
    border: 'border-[var(--border)]',
  },
  'Advanced & DP': {
    bg: 'bg-[var(--bg-subtle)]',
    text: 'text-[var(--text-main)]',
    border: 'border-[var(--border)]',
  },
};

interface PatternCardProps {
  pattern: PatternSummary;
  solvedCount?: number;
}

export const PatternCard: React.FC<PatternCardProps> = ({ pattern, solvedCount = 0 }) => {
  const IconComponent = ICON_MAP[pattern.icon] || GitBranch;
  const percentSolved = pattern.total > 0 ? Math.min(100, Math.round((solvedCount / pattern.total) * 100)) : 0;

  return (
    <Link
      href={`/patterns/${pattern.slug}`}
      className="apple-card group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]/30 select-none transition-all shadow-xs"
    >
      <div className="space-y-3">
        {/* Header row: Icon + Category Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 text-[var(--text-main)]">
            <IconComponent className="w-4.5 h-4.5 opacity-80" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)]">
              {pattern.category}
            </span>
            {solvedCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {solvedCount}
              </span>
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-main)] transition-colors">
            {pattern.name}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed font-normal">
            {pattern.tagline}
          </p>
        </div>

        {/* Difficulty breakdown */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-normal">
          <span>{pattern.total} questions</span>
          <span className="opacity-30">·</span>
          <span className="text-[11px] font-mono text-[var(--text-light)]">
            <span className="text-emerald-600/90 dark:text-emerald-400/90">{pattern.easy}</span>E{' '}
            <span className="text-amber-600/90 dark:text-amber-400/90">{pattern.medium}</span>M{' '}
            <span className="text-rose-600/90 dark:text-rose-400/90">{pattern.hard}</span>H
          </span>
        </div>
      </div>

      {/* Footer: Top Companies & Subtle Chevron */}
      <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs">
        {pattern.topCompanies && pattern.topCompanies.length > 0 ? (
          <div className="flex items-center gap-1 text-[11px] text-[var(--text-light)] truncate min-w-0">
            <span className="opacity-50">Top:</span>
            <span className="text-[var(--text-muted)] truncate">
              {pattern.topCompanies.slice(0, 4).join(', ')}
            </span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {percentSolved > 0 && (
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              {percentSolved}%
            </span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-light)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
};
