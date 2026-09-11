'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Flame,
  Zap,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  Code2,
  Calendar,
  Building2,
  Layers,
  Award,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { PublicUserProfileData } from '@/utils/server-user';
import { useAuth } from '@/context/AuthContext';
import { getUserActivityStats } from '@/utils/progress';
import { useSolvedProblems } from '@/utils/useSolvedProblems';

interface PublicProfileViewProps {
  initialData: PublicUserProfileData;
}

interface CalendarDay {
  date: string;
  count: number;
  isToday: boolean;
  isFuture: boolean;
  isCurrentYear: boolean;
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCellColor(count: number, isFuture: boolean, isCurrentYear: boolean): string {
  if (!isCurrentYear) return 'bg-transparent border border-transparent opacity-0 pointer-events-none';
  if (isFuture) {
    return 'bg-[var(--bg-subtle)]/40 border border-[var(--border)]/20 opacity-30 cursor-default';
  }
  if (count === 0) {
    return 'bg-[var(--bg-subtle)] border border-[var(--border)] hover:border-[var(--text-muted)]/40';
  }
  if (count === 1) {
    return 'bg-emerald-950/60 dark:bg-emerald-950 border border-emerald-700/50 hover:opacity-90';
  }
  if (count <= 3) {
    return 'bg-emerald-700/80 dark:bg-emerald-700 border border-emerald-500/60 hover:opacity-90';
  }
  if (count <= 6) {
    return 'bg-emerald-500 border border-emerald-400 hover:opacity-90';
  }
  return 'bg-emerald-400 dark:bg-emerald-300 border border-emerald-200 hover:opacity-90';
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ initialData }) => {
  const { user: currentUser } = useAuth();
  useSolvedProblems(); // Listen for realtime solve changes

  const isOwner = currentUser?.id === initialData.user.id || currentUser?.username?.toLowerCase() === initialData.user.username.toLowerCase();

  // If the owner is looking at their own profile, blend with any fresh client-side solves
  const clientStats = useMemo(() => {
    if (isOwner && currentUser?.id) {
      return getUserActivityStats(currentUser.id);
    }
    return null;
  }, [isOwner, currentUser]);

  const stats = useMemo(() => {
    if (clientStats && isOwner) {
      return {
        totalSolved: Math.max(clientStats.totalSolved, initialData.stats.totalSolved),
        easyCount: initialData.stats.easyCount,
        mediumCount: initialData.stats.mediumCount,
        hardCount: initialData.stats.hardCount,
        currentStreak: Math.max(clientStats.currentStreak, initialData.stats.currentStreak),
        longestStreak: Math.max(clientStats.maxStreak, initialData.stats.longestStreak),
        dailyHistory: {
          ...initialData.stats.dailyHistory,
          ...clientStats.dailyHistory,
        },
      };
    }
    return initialData.stats;
  }, [clientStats, isOwner, initialData.stats]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeHoverDay, setActiveHoverDay] = useState<{ date: string; count: number } | null>(null);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/u/${initialData.user.username}`
    : `https://leetmap-pro.vercel.app/u/${initialData.user.username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied!', {
        description: profileUrl,
      });
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyBadge = async () => {
    const badgeMarkdown = `[![LeetMap Streak](https://img.shields.io/badge/LeetMap_Streak-${stats.currentStreak}_Days-10b981?style=flat&logo=leetcode&logoColor=white)](${profileUrl})`;
    try {
      await navigator.clipboard.writeText(badgeMarkdown);
      toast.success('GitHub README badge copied!', {
        description: 'Paste it into your personal README.md',
      });
    } catch {
      toast.error('Failed to copy badge');
    }
  };

  // Readiness tier calculation
  const readinessTier = useMemo(() => {
    const total = stats.totalSolved;
    if (total >= 150) return { title: 'FAANG Interview Ready', color: 'text-emerald-500 dark:text-emerald-400', badge: 'Tier 1' };
    if (total >= 75) return { title: 'Advanced Contender', color: 'text-blue-500 dark:text-blue-400', badge: 'Tier 2' };
    if (total >= 30) return { title: 'Active Grinder', color: 'text-amber-500 dark:text-amber-400', badge: 'Tier 3' };
    return { title: 'Rising Contender', color: 'text-[var(--text-muted)]', badge: 'Active' };
  }, [stats.totalSolved]);

  // Calendar weeks computation
  const calendarWeeks = useMemo(() => {
    const jan1 = new Date(selectedYear, 0, 1, 12, 0, 0);
    const dec31 = new Date(selectedYear, 11, 31, 12, 0, 0);
    const actualToday = new Date();
    actualToday.setHours(12, 0, 0, 0);

    const startDate = new Date(jan1);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(dec31);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const weeks: CalendarDay[][] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const week: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const dateString = toLocalDateString(current);
        const isCurrentYear = current.getFullYear() === selectedYear;
        const isFuture = current > actualToday;
        const count = isCurrentYear ? (stats.dailyHistory[dateString] || 0) : 0;
        const isToday = toLocalDateString(actualToday) === dateString;

        week.push({
          date: dateString,
          count,
          isToday,
          isFuture,
          isCurrentYear,
        });

        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  }, [selectedYear, stats.dailyHistory]);

  const yearTotalSolved = useMemo(() => {
    let sum = 0;
    Object.entries(stats.dailyHistory).forEach(([dateStr, count]) => {
      if (dateStr.startsWith(`${selectedYear}-`)) {
        sum += count;
      }
    });
    return sum;
  }, [stats.dailyHistory, selectedYear]);

  // Difficulty percentages
  const diffTotal = stats.easyCount + stats.mediumCount + stats.hardCount || 1;
  const easyPct = Math.round((stats.easyCount / diffTotal) * 100);
  const medPct = Math.round((stats.mediumCount / diffTotal) * 100);
  const hardPct = 100 - easyPct - medPct;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="apple-press inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore Companies &amp; Patterns</span>
        </Link>

        {isOwner && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Your Public Profile (Viewing as Owner)
          </span>
        )}
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Identity */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-[var(--border)] overflow-hidden bg-[var(--bg-subtle)] shadow-md ring-4 ring-emerald-500/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={initialData.user.avatarUrl}
                  alt={initialData.user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-xs"
                title="Verified LeetMap Candidate"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
                  {initialData.user.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-muted)]">
                  @{initialData.user.username}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <span>{readinessTier.title}</span>
                <span>•</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {stats.totalSolved} problems solved
                </span>
              </p>
            </div>
          </div>

          {/* Social Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleCopyLink}
              className="apple-press flex-1 md:flex-initial inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full text-xs font-semibold bg-[var(--text-main)] text-[var(--bg-page)] hover:opacity-90 shadow-xs transition-opacity cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Profile</span>
            </button>

            <button
              onClick={handleCopyBadge}
              className="apple-press flex-1 md:flex-initial inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full text-xs font-medium border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              title="Copy Markdown badge for GitHub profile README"
            >
              <Code2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>README Badge</span>
            </button>
          </div>
        </div>

        {/* 4 Key Stat Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[var(--border)]">
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Current Streak</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-[var(--text-main)] tracking-tight">
              {stats.currentStreak} <span className="text-xs font-normal text-[var(--text-muted)]">days</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Longest Streak</span>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-[var(--text-main)] tracking-tight">
              {stats.longestStreak} <span className="text-xs font-normal text-[var(--text-muted)]">days</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Total Solved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-[var(--text-main)] tracking-tight">
              {stats.totalSolved}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Readiness</span>
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-base font-bold text-[var(--text-main)] truncate mt-1">
              {readinessTier.title}
            </p>
          </div>
        </div>
      </div>

      {/* GitHub-Style Study Heatmap Card */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Solve Activity &amp; Consistency</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {yearTotalSolved} problems solved in {selectedYear}
            </p>
          </div>

          {/* Year selector tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] self-start sm:self-auto">
            {[2026, 2025, 2024].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`apple-press text-xs font-mono px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedYear === year
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] font-semibold shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex flex-col gap-1 min-w-[720px]">
            <div className="grid grid-flow-col grid-rows-7 gap-1">
              {calendarWeeks.map((week, wIdx) =>
                week.map((day, dIdx) => (
                  <div
                    key={`${wIdx}-${dIdx}`}
                    onMouseEnter={() => setActiveHoverDay({ date: day.date, count: day.count })}
                    onMouseLeave={() => setActiveHoverDay(null)}
                    className={`w-3.5 h-3.5 rounded-xs transition-transform duration-150 hover:scale-125 ${getCellColor(
                      day.count,
                      day.isFuture,
                      day.isCurrentYear
                    )}`}
                    title={`${day.date}: ${day.count} solved`}
                  />
                ))
              )}
            </div>

            {/* Hover Tooltip display */}
            <div className="h-6 flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]/40">
              <div className="font-mono text-[11px]">
                {activeHoverDay ? (
                  <span>
                    <strong className="text-[var(--text-main)]">{activeHoverDay.count} problems</strong> on{' '}
                    {activeHoverDay.date}
                  </span>
                ) : (
                  <span>Hover over any day to inspect solves</span>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-2xs bg-[var(--bg-subtle)] border border-[var(--border)]" />
                <span className="w-2.5 h-2.5 rounded-2xs bg-emerald-950/60 dark:bg-emerald-950" />
                <span className="w-2.5 h-2.5 rounded-2xs bg-emerald-700" />
                <span className="w-2.5 h-2.5 rounded-2xs bg-emerald-500" />
                <span className="w-2.5 h-2.5 rounded-2xs bg-emerald-300" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Difficulty & Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Breakdown */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-xl p-6 space-y-5">
          <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Difficulty Split</span>
          </h2>

          {/* Segmented Progress Bar */}
          <div className="h-3 w-full rounded-full overflow-hidden bg-[var(--bg-subtle)] flex gap-0.5">
            <div
              style={{ width: `${easyPct}%` }}
              className="h-full bg-emerald-500 transition-all duration-500"
              title={`Easy: ${stats.easyCount} (${easyPct}%)`}
            />
            <div
              style={{ width: `${medPct}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
              title={`Medium: ${stats.mediumCount} (${medPct}%)`}
            />
            <div
              style={{ width: `${hardPct}%` }}
              className="h-full bg-rose-500 transition-all duration-500"
              title={`Hard: ${stats.hardCount} (${hardPct}%)`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">Easy</span>
              <span className="text-xl font-bold font-mono text-[var(--text-main)] mt-0.5 block">{stats.easyCount}</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">Medium</span>
              <span className="text-xl font-bold font-mono text-[var(--text-main)] mt-0.5 block">{stats.mediumCount}</span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">Hard</span>
              <span className="text-xl font-bold font-mono text-[var(--text-main)] mt-0.5 block">{stats.hardCount}</span>
            </div>
          </div>
        </div>

        {/* Top Targeted Companies */}
        <div className="lg:col-span-2 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>Target Company Coverage</span>
            </h2>
            <Link
              href="/"
              className="apple-press text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1"
            >
              <span>View all 680+</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {initialData.topCompaniesBreakdown.map((company) => (
              <Link
                key={company.slug}
                href={`/company/${company.slug}`}
                className="apple-press group p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 hover:bg-[var(--bg-hover)] transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-main)] group-hover:text-emerald-500 transition-colors">
                    {company.name}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    {company.solved} solved
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((company.solved / Math.max(1, company.total)) * 100))}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Mastery Breakdown */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Core Coding Pattern Mastery</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Track progress across foundational interview patterns
            </p>
          </div>

          <Link
            href="/patterns"
            className="apple-press text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1"
          >
            <span>Pattern Roadmap</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {initialData.patternsBreakdown.slice(0, 12).map((pattern) => {
            const pct = Math.min(100, Math.round((pattern.solved / Math.max(1, pattern.total)) * 100));
            return (
              <Link
                key={pattern.slug}
                href={`/patterns/${pattern.slug}`}
                className="apple-press group p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 hover:bg-[var(--bg-hover)] transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-main)] group-hover:text-emerald-500 transition-colors truncate">
                    {pattern.name}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)] shrink-0 ml-2">
                    {pattern.solved}/{pattern.total}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Feed */}
      {initialData.recentActivity.length > 0 && (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-xl p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-[var(--text-main)]">
            Recent Problem Solves
          </h2>

          <div className="divide-y divide-[var(--border)]">
            {initialData.recentActivity.map((prob) => (
              <div
                key={`${prob.slug}-${prob.solvedAt}`}
                className="py-3 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <a
                    href={`https://leetcode.com/problems/${prob.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--text-main)] hover:underline truncate"
                  >
                    {prob.title || prob.slug.replace(/-/g, ' ')}
                  </a>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {prob.difficulty && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        prob.difficulty === 'EASY'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : prob.difficulty === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {prob.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
