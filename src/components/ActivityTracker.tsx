'use client';

import React, { useMemo } from 'react';
import { CalendarDays, CheckCircle2, Flame, Trophy, Zap } from 'lucide-react';
import { UserActivityStats } from '@/types';
import { getLeetCodeProblemUrl } from '@/utils/urls';

interface ActivityTrackerProps {
  stats: UserActivityStats;
  displayName: string;
}

interface CalendarDay {
  date: string;
  count: number;
  isFuture: boolean;
}

const WEEK_COUNT = 26;
const DAYS_PER_WEEK = 7;

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCellClass(count: number, isFuture: boolean): string {
  if (isFuture) return 'bg-transparent';
  if (count === 0) return 'bg-[var(--bg-subtle)]/70 hover:bg-[var(--bg-subtle)]';
  if (count === 1) return 'bg-emerald-500/30';
  if (count <= 3) return 'bg-emerald-500/65';
  return 'bg-emerald-500';
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({ stats, displayName }) => {
  const calendar = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay() - (WEEK_COUNT - 1) * DAYS_PER_WEEK);

    const weeks: CalendarDay[][] = [];
    const monthLabels: string[] = [];

    for (let weekIndex = 0; weekIndex < WEEK_COUNT; weekIndex++) {
      const week: CalendarDay[] = [];
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + weekIndex * DAYS_PER_WEEK);

      const containsFirstOfMonth = Array.from({ length: DAYS_PER_WEEK }, (_, dayIndex) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayIndex);
        return date;
      }).find((date) => date.getDate() === 1);

      monthLabels.push(
        weekIndex === 0 || containsFirstOfMonth
          ? (containsFirstOfMonth || weekStart).toLocaleString('default', { month: 'short' })
          : ''
      );

      for (let dayIndex = 0; dayIndex < DAYS_PER_WEEK; dayIndex++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayIndex);
        const dateString = toLocalDateString(date);
        week.push({
          date: dateString,
          count: stats.dailyHistory[dateString] || 0,
          isFuture: date > today,
        });
      }

      weeks.push(week);
    }

    return { weeks, monthLabels };
  }, [stats.dailyHistory]);

  const statCards = [
    { label: 'Current streak', value: stats.currentStreak, suffix: 'days', icon: Flame, color: 'text-amber-500' },
    { label: 'Best streak', value: stats.maxStreak, suffix: 'days', icon: Zap, color: 'text-blue-500' },
    { label: 'Solved today', value: stats.todaySolved, suffix: 'problems', icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Total solved', value: stats.totalSolved, suffix: 'problems', icon: Trophy, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Badges - Minimalist Apple Grouping */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {statCards.map(({ label, value, suffix, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl bg-[var(--bg-subtle)]/50 hover:bg-[var(--bg-subtle)]/80 transition-colors p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <span>{label}</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold tracking-tight text-[var(--text-main)]">{value}</span>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">{suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap Activity Section */}
      <section className="rounded-2xl border border-[var(--border)]/50 bg-[var(--bg-subtle)]/30 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-emerald-500 shrink-0">
              <CalendarDays className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[var(--text-main)]">LeetCode solve activity</h3>
              <p className="text-[11px] text-[var(--text-muted)] font-normal">Past 26 weeks · each square is one day</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="min-w-[680px]">
            {/* Perfectly aligned month header */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 shrink-0" />
              <div className="grid min-w-0 flex-1 grid-cols-[repeat(26,minmax(0,1fr))] gap-1.5">
                {calendar.monthLabels.map((label, index) => (
                  <span key={`${label}-${index}`} className="h-3.5 text-[9px] font-medium text-[var(--text-muted)] truncate text-left">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Calendar grid with day labels */}
            <div className="flex items-center gap-2">
              <div className="grid w-6 shrink-0 grid-rows-7 gap-1.5 text-right text-[9px] font-mono text-[var(--text-muted)]/70">
                <span className="aspect-square flex items-center justify-end" />
                <span className="aspect-square flex items-center justify-end leading-none">Mon</span>
                <span className="aspect-square flex items-center justify-end" />
                <span className="aspect-square flex items-center justify-end leading-none">Wed</span>
                <span className="aspect-square flex items-center justify-end" />
                <span className="aspect-square flex items-center justify-end leading-none">Fri</span>
                <span className="aspect-square flex items-center justify-end" />
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-[repeat(26,minmax(0,1fr))] gap-1.5">
                {calendar.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid min-w-0 grid-rows-7 gap-1.5">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        className={`aspect-square w-full rounded-[3px] transition-transform ${getCellClass(day.count, day.isFuture)} ${day.isFuture ? '' : 'hover:scale-125'}`}
                        title={day.isFuture ? undefined : `${day.count} ${day.count === 1 ? 'problem' : 'problems'} solved on ${day.date}`}
                        aria-label={day.isFuture ? undefined : `${day.count} problems solved on ${day.date}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend / Status bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)]/40 pt-3 text-[11px] text-[var(--text-muted)]">
          <span>{stats.todaySolved > 0 ? 'Great work — today is active.' : 'Solve one problem today to keep your streak moving.'}</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>Less</span>
            {[0, 1, 2, 4].map((count) => (
              <span key={count} className={`h-2.5 w-2.5 rounded-[2px] ${getCellClass(count, false)}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </section>

      {stats.recentSolved.length > 0 && (
        <section className="rounded-2xl border border-[var(--border)]/50 bg-[var(--bg-subtle)]/30 p-4">
          <h3 className="text-xs font-semibold text-[var(--text-main)]">Recently solved by {displayName}</h3>
          <div className="mt-2 divide-y divide-[var(--border)]/40">
            {stats.recentSolved.slice(0, 5).map((record) => (
              <a
                key={record.slug}
                href={getLeetCodeProblemUrl(record.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 py-2 text-xs hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <span className="truncate font-medium">{record.title || record.slug.replace(/-/g, ' ')}</span>
                <span className="shrink-0 font-mono text-[10px] text-[var(--text-muted)]">{record.date}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
