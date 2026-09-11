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

    for (let weekIndex = 0; weekIndex < WEEK_COUNT; weekIndex++) {
      const week: CalendarDay[] = [];
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + weekIndex * DAYS_PER_WEEK);

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

    return { weeks };
  }, [stats.dailyHistory]);

  const monthMarkers = useMemo(() => {
    const markers: { name: string; colIndex: number }[] = [];
    let lastMonth = '';
    calendar.weeks.forEach((week, i) => {
      const d = new Date(week[0].date + 'T12:00:00');
      const m = d.toLocaleString('default', { month: 'short' });
      if (m !== lastMonth && i <= 22) {
        markers.push({ name: m, colIndex: i });
        lastMonth = m;
      }
    });
    return markers;
  }, [calendar.weeks]);

  const statCards = [
    { label: 'Current streak', value: stats.currentStreak, suffix: 'days', icon: Flame, color: 'text-amber-500' },
    { label: 'Best streak', value: stats.maxStreak, suffix: 'days', icon: Zap, color: 'text-blue-500' },
    { label: 'Solved today', value: stats.todaySolved, suffix: 'solved', icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Total solved', value: stats.totalSolved, suffix: 'total', icon: Trophy, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-3">
      {/* Stat Badges - Compact Apple Grouping */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {statCards.map(({ label, value, suffix, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-[var(--bg-subtle)]/50 hover:bg-[var(--bg-subtle)]/80 transition-colors p-2.5">
            <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)]">
              <Icon className={`h-3 w-3 shrink-0 ${color}`} />
              <span className="truncate">{label}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-xl font-bold tracking-tight text-[var(--text-main)]">{value}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap Activity Section */}
      <section className="rounded-2xl border border-[var(--border)]/50 bg-[var(--bg-subtle)]/30 p-3.5 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--bg-subtle)] flex items-center justify-center text-emerald-500 shrink-0">
              <CalendarDays className="h-3 w-3" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[var(--text-main)] leading-tight">Solve activity</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-normal">Past 26 weeks · each square is one day</p>
            </div>
          </div>
        </div>

        <div className="w-full">
          {/* Absolutely positioned, pixel-perfect month labels */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 shrink-0" />
            <div className="relative min-w-0 flex-1 h-3 text-[9px] font-medium text-[var(--text-muted)]">
              {monthMarkers.map(({ name, colIndex }) => (
                <span
                  key={name}
                  className="absolute leading-none"
                  style={{ left: `${(colIndex / WEEK_COUNT) * 100}%` }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Calendar grid with day labels */}
          <div className="flex items-center gap-2">
            <div className="grid w-5 shrink-0 grid-rows-7 gap-1 text-right text-[8px] font-medium text-[var(--text-muted)]/70">
              <span className="aspect-square flex items-center justify-end" />
              <span className="aspect-square flex items-center justify-end leading-none">Mon</span>
              <span className="aspect-square flex items-center justify-end" />
              <span className="aspect-square flex items-center justify-end leading-none">Wed</span>
              <span className="aspect-square flex items-center justify-end" />
              <span className="aspect-square flex items-center justify-end leading-none">Fri</span>
              <span className="aspect-square flex items-center justify-end" />
            </div>
            <div className="grid min-w-0 flex-1 grid-cols-[repeat(26,minmax(0,1fr))] gap-1">
              {calendar.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid min-w-0 grid-rows-7 gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`aspect-square w-full rounded-[2px] transition-transform ${getCellClass(day.count, day.isFuture)} ${day.isFuture ? '' : 'hover:scale-125'}`}
                      title={day.isFuture ? undefined : `${day.count} ${day.count === 1 ? 'problem' : 'problems'} solved on ${day.date}`}
                      aria-label={day.isFuture ? undefined : `${day.count} problems solved on ${day.date}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend / Status bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)]/30 pt-2.5 text-[10px] text-[var(--text-muted)]">
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
        <section className="rounded-xl border border-[var(--border)]/40 bg-[var(--bg-subtle)]/20 p-3">
          <h3 className="text-xs font-semibold text-[var(--text-main)]">Recently solved</h3>
          <div className="mt-1.5 divide-y divide-[var(--border)]/30">
            {stats.recentSolved.slice(0, 3).map((record) => (
              <a
                key={record.slug}
                href={getLeetCodeProblemUrl(record.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 py-1.5 text-xs hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
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
