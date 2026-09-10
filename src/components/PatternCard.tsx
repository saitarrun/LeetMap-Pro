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
  const categoryStyle = CATEGORY_COLORS[pattern.category] || CATEGORY_COLORS.Fundamentals;

  const percentSolved = pattern.total > 0 ? Math.min(100, Math.round((solvedCount / pattern.total) * 100)) : 0;

  return (
    <Link
      href={`/patterns/${pattern.slug}`}
      className="apple-card group relative flex flex-col justify-between p-5 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]/30 select-none shadow-xs"
    >
      <div className="space-y-3.5">
        {/* Header row: Icon + Category Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--text-main)] shadow-xs group-hover:scale-105 transition-transform">
            <IconComponent className="w-6 h-6 opacity-80" />
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
            >
              {pattern.category}
            </span>
            {solvedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--diff-easy-text)] bg-[var(--diff-easy-bg)] px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                {solvedCount}
              </span>
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)] transition-colors">
            {pattern.name}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed font-normal">
            {pattern.tagline}
          </p>
        </div>

        {/* Difficulty breakdown */}
        <div className="flex items-center gap-2 pt-1 text-xs text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-main)]">{pattern.total}</span>
          <span className="text-[11px]">questions</span>
          <span className="text-[var(--border)]">•</span>
          <span className="font-semibold text-[var(--diff-easy-text)]">{pattern.easy}E</span>
          <span className="font-semibold text-[var(--diff-medium-text)]">{pattern.medium}M</span>
          <span className="font-semibold text-[var(--diff-hard-text)]">{pattern.hard}H</span>
        </div>

        {/* Top Companies preview */}
        {pattern.topCompanies && pattern.topCompanies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-[var(--text-light)]">Top asked:</span>
            {pattern.topCompanies.slice(0, 4).map((c) => (
              <span
                key={c}
                className="text-[10px] px-1.5 py-0.2 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Solved progress bar + Arrow */}
      <div className="pt-4 mt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
            <span>Progress</span>
            <span>{percentSolved}%</span>
          </div>
          <div className="w-full h-1 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${percentSolved}%` }}
            />
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-page)] transition-colors text-[var(--text-light)]">
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
