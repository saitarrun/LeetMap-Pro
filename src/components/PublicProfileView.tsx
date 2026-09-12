'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  X,
  ChevronRight,
  Info,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { PublicUserProfileData } from '@/utils/server-user';
import { useAuth } from '@/context/AuthContext';
import { getUserActivityStats } from '@/utils/progress';
import { useSolvedProblems } from '@/utils/useSolvedProblems';

export interface PrepLevel {
  level: number;
  badge: string;
  name: string;
  minSolved: number;
  maxSolved: number;
  subtitle: string;
  description: string;
  focusPatterns: string[];
  targetRounds: string;
  badgeBg: string;
  badgeColor: string;
  progressBarColor: string;
  accentBorder: string;
}

export const PREP_LEVELS: PrepLevel[] = [
  {
    level: 1,
    badge: 'Lv. 1',
    name: 'Foundation',
    minSolved: 0,
    maxSolved: 9,
    subtitle: 'Syntax Fluency & Warmup',
    description: 'Master language syntax, array indexing, and baseline loops without friction.',
    focusPatterns: ['Arrays & Hashing', 'Two Pointers', 'Basic Strings'],
    targetRounds: 'Screening Pre-tests & Baseline Coding Assessments',
    badgeBg: 'bg-zinc-500/10 border-zinc-500/20',
    badgeColor: 'text-zinc-400',
    progressBarColor: 'bg-emerald-500',
    accentBorder: 'border-zinc-500/30',
  },
  {
    level: 2,
    badge: 'Lv. 2',
    name: 'Apprentice',
    minSolved: 10,
    maxSolved: 29,
    subtitle: 'Core Problem Patterns',
    description: 'Recognize foundational patterns and solve Medium problems with clean time & space complexity.',
    focusPatterns: ['Sliding Window', 'Prefix Sum', 'Stack', 'Fast & Slow Pointers'],
    targetRounds: 'Online Assessments (OA) & 1st Round Phone Screens',
    badgeBg: 'bg-teal-500/10 border-teal-500/20',
    badgeColor: 'text-teal-400',
    progressBarColor: 'bg-emerald-500',
    accentBorder: 'border-teal-500/40',
  },
  {
    level: 3,
    badge: 'Lv. 3',
    name: 'Competitor',
    minSolved: 30,
    maxSolved: 74,
    subtitle: 'Blind 75 Baseline',
    description: 'Solid algorithmic intuition across all primary data structures. Confident under timed constraints.',
    focusPatterns: ['Binary Search', 'Trees & BST', 'BFS / DFS Graphs', 'Heaps & Priority Queues'],
    targetRounds: 'Full Phone Screens & Mid-Tier Tech Onsites',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
    badgeColor: 'text-emerald-400',
    progressBarColor: 'bg-emerald-500',
    accentBorder: 'border-emerald-500/40',
  },
  {
    level: 4,
    badge: 'Lv. 4',
    name: 'Onsite Ready',
    minSolved: 75,
    maxSolved: 149,
    subtitle: 'NeetCode 150 Baseline',
    description: 'Equipped to clear multi-round Big Tech onsite loops, including dynamic programming and graphs.',
    focusPatterns: ['1-D & 2-D Dynamic Programming', 'Backtracking', 'Topological Sort', 'Monotonic Stack'],
    targetRounds: 'FAANG / Big Tech Onsite Loops (Google, Meta, Amazon, Apple)',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/20',
    badgeColor: 'text-cyan-400',
    progressBarColor: 'bg-emerald-500',
    accentBorder: 'border-cyan-500/40',
  },
  {
    level: 5,
    badge: 'Lv. 5',
    name: 'FAANG Master',
    minSolved: 150,
    maxSolved: Infinity,
    subtitle: 'Elite Problem Solver',
    description: 'Top 1% problem-solving mastery. Effortlessly breaks down Hard problems and evaluates deep trade-offs.',
    focusPatterns: ['Hard DP', 'Tries & Segment Trees', 'Bitmask DP', 'Advanced Graphs'],
    targetRounds: 'Staff / Principal Loops & Top Quant/HFT (Citadel, Jane Street, HRT)',
    badgeBg: 'bg-amber-500/10 border-amber-500/20',
    badgeColor: 'text-amber-400',
    progressBarColor: 'bg-emerald-500',
    accentBorder: 'border-amber-500/40',
  },
];

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
  const [showLevelModal, setShowLevelModal] = useState<boolean>(false);
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);
  const [badgeStyle, setBadgeStyle] = useState<'card' | 'compact'>('card');
  const [badgeTarget, setBadgeTarget] = useState<string>('auto');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('leetmap_badge_target');
      if (saved) setBadgeTarget(saved);
    } catch {}
  }, []);

  // Close modals on Escape
  useEffect(() => {
    if (!showLevelModal && !showBadgeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLevelModal(false);
        setShowBadgeModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLevelModal, showBadgeModal]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (showLevelModal || showBadgeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLevelModal, showBadgeModal]);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/u/${initialData.user.username}`
    : `https://leetmap-pro.vercel.app/u/${initialData.user.username}`;

  const badgeBaseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/badge/${initialData.user.username}`
    : `https://leetmap-pro.vercel.app/api/badge/${initialData.user.username}`;

  const currentBadgeSrc = useMemo(() => {
    const params = new URLSearchParams();
    if (badgeStyle === 'compact') {
      params.set('style', 'compact');
    }
    if (badgeTarget && badgeTarget !== 'auto') {
      params.set('target', badgeTarget);
    }
    const qs = params.toString();
    return qs ? `${badgeBaseUrl}?${qs}` : badgeBaseUrl;
  }, [badgeBaseUrl, badgeStyle, badgeTarget]);

  const badgeMarkdown = `[![LeetMap Pro Stats](${currentBadgeSrc})](${profileUrl})`;
  const badgeHtml = `<a href="${profileUrl}"><img src="${currentBadgeSrc}" alt="LeetMap Pro Stats for ${initialData.user.name}" /></a>`;

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

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(badgeMarkdown);
      toast.success('GitHub README Markdown copied!', {
        description: 'Paste it directly into your personal README.md',
      });
    } catch {
      toast.error('Failed to copy Markdown badge');
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(badgeHtml);
      toast.success('HTML Badge snippet copied!', {
        description: 'Embed into websites or blogs',
      });
    } catch {
      toast.error('Failed to copy HTML badge');
    }
  };

  // Prep level & interview milestones
  const levelInfo = useMemo(() => {
    const total = stats.totalSolved;
    let currentLevel = PREP_LEVELS[0];
    let nextLevel: PrepLevel | null = PREP_LEVELS[1];

    for (let i = 0; i < PREP_LEVELS.length; i++) {
      const lvl = PREP_LEVELS[i];
      if (total >= lvl.minSolved) {
        currentLevel = lvl;
        nextLevel = PREP_LEVELS[i + 1] || null;
      }
    }

    if (!nextLevel) {
      return {
        currentLevel,
        nextLevel: null,
        progressPct: 100,
        questionsLeft: 0,
        helperText: 'Max Level Achieved 🏆',
      };
    }

    const levelMin = currentLevel.minSolved;
    const levelTarget = nextLevel.minSolved;
    const solvedInLevel = Math.max(0, total - levelMin);
    const neededInLevel = levelTarget - levelMin;
    const progressPct = Math.min(100, Math.max(0, Math.round((solvedInLevel / neededInLevel) * 100)));
    const questionsLeft = Math.max(0, levelTarget - total);

    return {
      currentLevel,
      nextLevel,
      progressPct,
      questionsLeft,
      helperText: `${questionsLeft} more to ${nextLevel.name}`,
    };
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
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowLevelModal(true)}
                  className="apple-press inline-flex items-center gap-1.5 font-medium hover:opacity-80 transition-opacity cursor-pointer"
                  title="Click to view Prep Level details"
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${levelInfo.currentLevel.badgeBg} ${levelInfo.currentLevel.badgeColor}`}>
                    {levelInfo.currentLevel.badge}
                  </span>
                  <span className="text-[var(--text-main)] font-semibold">
                    {levelInfo.currentLevel.name}
                  </span>
                  <Info className="w-3 h-3 text-[var(--text-muted)]" />
                </button>
                <span>•</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {stats.totalSolved} problems solved
                </span>
              </div>
            </div>
          </div>

          {/* Social Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleCopyLink}
              className="apple-press inline-flex items-center justify-center gap-1.5 h-7.5 px-3 rounded-full text-[11px] font-medium bg-[var(--text-main)] text-[var(--bg-page)] hover:opacity-90 shadow-xs transition-opacity cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>Share Profile</span>
            </button>

            <button
              onClick={() => setShowBadgeModal(true)}
              className="apple-press inline-flex items-center justify-center gap-1.5 h-7.5 px-3 rounded-full text-[11px] font-medium border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              title="Copy dynamic badge for GitHub profile README"
            >
              <Code2 className="w-3 h-3 text-emerald-500" />
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

          <button
            type="button"
            onClick={() => setShowLevelModal(true)}
            className="apple-press group text-left p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 hover:bg-[var(--bg-subtle)] hover:border-emerald-500/40 transition-all cursor-pointer space-y-1.5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] w-full">
              <span className="flex items-center gap-1 font-medium">
                <span>Prep Level</span>
                <Info className="w-3 h-3 text-[var(--text-muted)]/60 group-hover:text-emerald-400 transition-colors" />
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${levelInfo.currentLevel.badgeBg} ${levelInfo.currentLevel.badgeColor}`}>
                {levelInfo.currentLevel.badge}
              </span>
            </div>
            <div className="w-full space-y-1.5">
              <p className="text-base font-bold text-[var(--text-main)] group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                <span className="truncate">{levelInfo.currentLevel.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span className="truncate pr-1">{levelInfo.helperText}</span>
                  <span className="shrink-0">{levelInfo.progressPct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${levelInfo.currentLevel.progressBarColor}`}
                    style={{ width: `${levelInfo.progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </button>
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
                <div className="flex items-center gap-3 min-w-0 flex-1">
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

      {/* Level Progression Explainer Modal */}
      {mounted && showLevelModal && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowLevelModal(false)}
          className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col"
          >
            {/* Modal Header (Pinned) */}
            <div className="p-6 sm:p-7 pb-4 border-b border-[var(--border)]/60 bg-[var(--bg-card)] shrink-0 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Interview Readiness Framework</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
                  Prep Levels &amp; Milestones
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Benchmarked against Blind 75, NeetCode 150, and Big Tech interview standards.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLevelModal(false)}
                className="apple-press p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
              {/* Candidate Current Status Banner */}
              <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[var(--text-muted)] font-medium">Candidate Standing:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {levelInfo.currentLevel.badge} · {levelInfo.currentLevel.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base sm:text-lg font-bold font-mono text-[var(--text-main)]">
                      {stats.totalSolved}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] ml-1">solved</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] font-medium">{levelInfo.helperText}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{levelInfo.progressPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      style={{ width: `${levelInfo.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Levels List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  The 5 Prep Milestones
                </h4>

                <div className="space-y-3">
                  {PREP_LEVELS.map((lvl) => {
                    const isCurrent = lvl.level === levelInfo.currentLevel.level;
                    const isCompleted = lvl.level < levelInfo.currentLevel.level;

                    return (
                      <div
                        key={lvl.level}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'border-emerald-500/60 bg-emerald-500/[0.06] ring-1 ring-emerald-500/30'
                            : isCompleted
                            ? 'border-[var(--border)] bg-[var(--bg-subtle)]/30 opacity-90'
                            : 'border-[var(--border)] bg-[var(--bg-subtle)]/15 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${lvl.badgeBg} ${lvl.badgeColor}`}>
                              {lvl.badge}
                            </span>
                            <span className="text-sm font-bold text-[var(--text-main)]">
                              {lvl.name}
                            </span>
                            <span className="text-xs text-[var(--text-muted)] font-mono">
                              · {lvl.maxSolved === Infinity ? '150+ solved' : `${lvl.minSolved}–${lvl.maxSolved} solved`}
                            </span>
                          </div>

                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Current Level
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Achieved
                            </span>
                          ) : (
                            <span className="text-[11px] text-[var(--text-muted)] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)]">
                              Locked
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                          {lvl.description}
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-[var(--border)]/50 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[var(--text-muted)] shrink-0 font-medium">🎯 Target Rounds:</span>
                            <span className="text-[var(--text-main)] font-medium">{lvl.targetRounds}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[var(--text-muted)] shrink-0 text-[11px] font-medium mr-1">Core Focus:</span>
                            {lvl.focusPatterns.map((pat) => (
                              <span
                                key={pat}
                                className="px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-main)]"
                              >
                                {pat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer (Pinned) */}
            <div className="p-4 sm:p-5 border-t border-[var(--border)]/60 bg-[var(--bg-card)] shrink-0 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowLevelModal(false)}
                className="apple-press w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-[var(--text-main)] text-[var(--bg-page)] hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close &amp; Continue
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* GitHub README Badge Modal */}
      {mounted && showBadgeModal && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowBadgeModal(false)}
          className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-[var(--border)]/60 bg-[var(--bg-card)] shrink-0 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>GitHub Profile Integration</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
                  Live README Stats Badge
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Embed real-time LeetCode progress, streak, and target company prep into your GitHub profile.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBadgeModal(false)}
                className="apple-press p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Style Selector */}
              <div className="flex items-center justify-between gap-2 p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setBadgeStyle('card')}
                  className={`apple-press flex-1 py-1.5 px-3 rounded-lg font-medium text-center transition-colors cursor-pointer ${
                    badgeStyle === 'card'
                      ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Rich Editorial Card
                </button>
                <button
                  type="button"
                  onClick={() => setBadgeStyle('compact')}
                  className={`apple-press flex-1 py-1.5 px-3 rounded-lg font-medium text-center transition-colors cursor-pointer ${
                    badgeStyle === 'compact'
                      ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Compact Shield Pill
                </button>
              </div>

              {/* Target Company Selector (for Rich Editorial Card) */}
              {badgeStyle === 'card' && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-[var(--bg-subtle)]/40 border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>Target Company Focus</span>
                    </label>
                    {badgeTarget !== 'auto' && (
                      <button
                        type="button"
                        onClick={() => {
                          setBadgeTarget('auto');
                          try {
                            localStorage.setItem('leetmap_badge_target', 'auto');
                          } catch {}
                        }}
                        className="apple-press text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                      >
                        Reset to Auto
                      </button>
                    )}
                  </div>
                  <select
                    value={badgeTarget}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBadgeTarget(val);
                      try {
                        localStorage.setItem('leetmap_badge_target', val);
                      } catch {}
                    }}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="auto">⚡ Auto (Most Practiced / General FAANG)</option>
                    <option value="none">🚫 None (Remove Target from Badge)</option>
                    <optgroup label="Select Target Company">
                      <option value="google">Google</option>
                      <option value="meta">Meta</option>
                      <option value="amazon">Amazon</option>
                      <option value="apple">Apple</option>
                      <option value="microsoft">Microsoft</option>
                      <option value="netflix">Netflix</option>
                      <option value="uber">Uber</option>
                      <option value="bloomberg">Bloomberg</option>
                      <option value="citadel">Citadel</option>
                      <option value="stripe">Stripe</option>
                      <option value="tiktok">TikTok</option>
                      <option value="nvidia">NVIDIA</option>
                      <option value="goldman-sachs">Goldman Sachs</option>
                      <option value="salesforce">Salesforce</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="palantir">Palantir</option>
                      <option value="databricks">Databricks</option>
                      <option value="snowflake">Snowflake</option>
                      <option value="doordash">DoorDash</option>
                    </optgroup>
                  </select>
                </div>
              )}

              {/* Live Preview Box */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Live Preview (Auto-Updates)
                </span>
                <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-subtle)]/50 border border-[var(--border)]/60 flex items-center justify-center overflow-x-auto min-h-[160px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentBadgeSrc}
                    alt={`LeetMap Pro stats badge for ${initialData.user.name}`}
                    className="max-w-full h-auto rounded-xl drop-shadow-md"
                  />
                </div>
              </div>

              {/* Markdown Code Block */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Markdown (for GitHub README.md)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    className="apple-press inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Markdown</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-main)] break-all select-all">
                  {badgeMarkdown}
                </div>
              </div>

              {/* HTML Code Block */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    HTML Snippet (for Blogs &amp; Portfolios)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHtml}
                    className="apple-press inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy HTML</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-main)] break-all select-all">
                  {badgeHtml}
                </div>
              </div>

              {/* Information Note */}
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] leading-relaxed">
                <p className="font-semibold mb-0.5">💡 SEO &amp; Recruiter Impact</p>
                <p>
                  Adding this badge to your GitHub profile links your LeetMap Pro roadmap so recruiters and engineers can verify your solved problems and topic readiness. It automatically updates whenever you log new solves.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[var(--border)]/60 bg-[var(--bg-card)] shrink-0 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="apple-press px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Markdown Badge</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBadgeModal(false)}
                className="apple-press px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
