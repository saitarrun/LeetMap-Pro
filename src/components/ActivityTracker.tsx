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
  if (isFuture) return 'border-transparent bg-transparent';
  if (count === 0) return 'border-[var(--border)] bg-[var(--bg-subtle)]';
  if (count === 1) return 'border-emerald-500/35 bg-emerald-500/30';
  if (count <= 3) return 'border-emerald-500/60 bg-emerald-500/65';
  return 'border-emerald-400 bg-emerald-500';
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {statCards.map(({ label, value, suffix, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)]">
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <span>{label}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-xl font-bold text-[var(--text-main)]">{value}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-2xs">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-500" />
            <div>
              <h3 className="text-xs font-semibold text-[var(--text-main)]">LeetCode solve activity</h3>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Past 26 weeks</p>
            </div>
          </div>
          <span className="hidden text-[10px] text-[var(--text-muted)] sm:block">Each square is one day</span>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="w-max min-w-full">
            <div className="ml-8 grid grid-cols-[repeat(26,14px)] gap-1.5">
              {calendar.monthLabels.map((label, index) => (
                <span key={`${label}-${index}`} className="h-4 text-[9px] text-[var(--text-muted)]">
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-1 flex gap-2">
              <div className="grid w-6 shrink-0 grid-rows-7 gap-1.5 text-right text-[9px] leading-3 text-[var(--text-muted)]">
                <span />
                <span>Mon</span>
                <span />
                <span>Wed</span>
                <span />
                <span>Fri</span>
                <span />
              </div>
              <div className="grid grid-cols-[repeat(26,14px)] gap-1.5">
                {calendar.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-1.5">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        className={`h-3.5 w-3.5 rounded-[3px] border transition-transform ${getCellClass(day.count, day.isFuture)} ${day.isFuture ? '' : 'hover:scale-125'}`}
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-[10px] text-[var(--text-muted)]">
          <span>{stats.todaySolved > 0 ? 'Great work—today is active.' : 'Solve one problem today to keep your streak moving.'}</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {[0, 1, 2, 4].map((count) => (
              <span key={count} className={`h-3 w-3 rounded-[3px] border ${getCellClass(count, false)}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </section>

      {stats.recentSolved.length > 0 && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3.5">
          <h3 className="text-xs font-semibold text-[var(--text-main)]">Recently solved by {displayName}</h3>
          <div className="mt-2 divide-y divide-[var(--border)]">
            {stats.recentSolved.slice(0, 5).map((record) => (
              <a
                key={record.slug}
                href={getLeetCodeProblemUrl(record.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 py-2 text-xs hover:text-emerald-600 dark:hover:text-emerald-400"
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
