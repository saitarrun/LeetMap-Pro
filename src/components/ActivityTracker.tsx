'use client';

import React, { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Flame, Trophy, Zap, Code2, Database } from 'lucide-react';
import { UserActivityStats } from '@/types';
import { getLeetCodeProblemUrl } from '@/utils/urls';
import { isSqlProblemSlug } from '@/utils/sqlCatalog';

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

  const [recentFilter, setRecentFilter] = useState<'ALL' | 'DSA' | 'SQL'>('ALL');

  const filteredRecent = useMemo(() => {
    return stats.recentSolved.filter((rec) => {
      const isSql = isSqlProblemSlug(rec.slug);
      if (recentFilter === 'DSA') return !isSql;
      if (recentFilter === 'SQL') return isSql;
      return true;
    });
  }, [stats.recentSolved, recentFilter]);

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

      {/* DSA vs SQL Solved Breakdown Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">DSA Solved</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-base sm:text-lg font-bold text-[var(--text-main)]">{stats.dsaSolved}</span>
                <span className="text-[10px] text-[var(--text-muted)]">problems</span>
              </div>
            </div>
          </div>
          {stats.totalSolved > 0 && (
            <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
              {Math.round((stats.dsaSolved / stats.totalSolved) * 100)}%
            </span>
          )}
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">SQL Solved</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-base sm:text-lg font-bold text-[var(--text-main)]">{stats.sqlSolved}</span>
                <span className="text-[10px] text-[var(--text-muted)]">queries</span>
              </div>
            </div>
          </div>
          {stats.totalSolved > 0 && (
            <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
              {Math.round((stats.sqlSolved / stats.totalSolved) * 100)}%
            </span>
          )}
        </div>
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

          <div className="flex items-center gap-2">
            {/* Day of Week Labels */}
            <div className="flex flex-col justify-between h-[86px] text-[9px] font-medium text-[var(--text-muted)] select-none shrink-0 w-5">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-[3px] flex-1">
              {calendar.weeks.map((week, wIndex) =>
                week.map((day, dIndex) => (
                  <div
                    key={`${wIndex}-${dIndex}`}
                    className={`h-[10px] w-full rounded-[2px] transition-colors ${getCellClass(day.count, day.isFuture)}`}
                    title={day.isFuture ? undefined : `${day.date}: ${day.count} solved`}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-muted)] font-normal border-t border-[var(--border)]/30 pt-2.5">
          <span>
            {stats.todaySolved > 0
              ? `Great work — today is active.`
              : `Solve a problem today to keep your streak.`}
          </span>
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
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-xs font-semibold text-[var(--text-main)]">Recently solved</h3>
            <div className="flex items-center gap-1 bg-[var(--bg-subtle)]/80 p-0.5 rounded-lg border border-[var(--border)]/40">
              {(['ALL', 'DSA', 'SQL'] as const).map((filter) => {
                const count = filter === 'ALL'
                  ? stats.totalSolved
                  : filter === 'DSA'
                  ? stats.dsaSolved
                  : stats.sqlSolved;
                return (
                  <button
                    key={filter}
                    onClick={() => setRecentFilter(filter)}
                    className={`apple-press px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      recentFilter === filter
                        ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <span>{filter}</span>
                    <span className="font-mono text-[9px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredRecent.length === 0 ? (
            <div className="py-3 text-center text-[11px] text-[var(--text-muted)]">
              No {recentFilter} problems solved yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]/30 max-h-48 overflow-y-auto pr-0.5">
              {filteredRecent.slice(0, 6).map((record) => (
                <a
                  key={record.slug}
                  href={getLeetCodeProblemUrl(record.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 py-1.5 text-xs hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold shrink-0 ${
                      isSqlProblemSlug(record.slug)
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                    }`}>
                      {isSqlProblemSlug(record.slug) ? 'SQL' : 'DSA'}
                    </span>
                    <span className="truncate font-medium">{record.id ? `#${record.id} ` : ''}{record.title || record.slug.replace(/-/g, ' ')}</span>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-[var(--text-muted)]">{record.date}</span>
                </a>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
