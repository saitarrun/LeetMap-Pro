'use client';

import React, { useMemo, useState } from 'react';
import { UserActivityStats } from '@/types';
import { Flame, Zap, CheckCircle2, Calendar, Trophy, ExternalLink } from 'lucide-react';

interface ActivityTrackerProps {
  stats: UserActivityStats;
  username: string;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({ stats, username }) => {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  // Generate grid for the past 16 weeks (112 days up to today)
  const heatmapData = useMemo(() => {
    const days: Array<{ date: string; count: number; dayOfWeek: number; monthName: string }> = [];
    const today = new Date();
    
    // 16 weeks = 112 days
    const totalDays = 112;

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const count = stats.dailyHistory[dateStr] || 0;
      const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ...
      const monthName = d.toLocaleString('default', { month: 'short' });

      days.push({
        date: dateStr,
        count,
        dayOfWeek,
        monthName,
      });
    }

    return days;
  }, [stats.dailyHistory]);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-[var(--bg-subtle)] border border-[var(--border)]';
    if (count === 1) return 'bg-emerald-500/35 border border-emerald-500/40';
    if (count <= 3) return 'bg-emerald-500/70 border border-emerald-500/80';
    return 'bg-emerald-500 border border-emerald-400 shadow-2xs';
  };

  return (
    <div className="space-y-4">
      {/* Streak Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Current Streak */}
        <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
            <Flame className={`w-3.5 h-3.5 ${stats.currentStreak > 0 ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-[var(--text-light)]'}`} />
            <span>Streak</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-[var(--text-main)]">
              {stats.currentStreak}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">days</span>
          </div>
        </div>

        {/* Best Streak */}
        <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
            <Zap className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
            <span>Best</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-[var(--text-main)]">
              {stats.maxStreak}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">days</span>
          </div>
        </div>

        {/* Today's Solved */}
        <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Today</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats.todaySolved}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">solved</span>
          </div>
        </div>

        {/* Total Solved */}
        <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Total</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-[var(--text-main)]">
              {stats.totalSolved}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">problems</span>
          </div>
        </div>
      </div>

      {/* GitHub-Style Activity Heatmap */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-[var(--text-main)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Everyday Activity (Past 16 Weeks)</span>
          </div>
          {hoveredDay ? (
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              {hoveredDay.count} {hoveredDay.count === 1 ? 'problem' : 'problems'} on {hoveredDay.date}
            </span>
          ) : (
            <span className="text-[11px] text-[var(--text-muted)]">
              Hover square for details
            </span>
          )}
        </div>

        {/* Calendar Grid Container */}
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 p-1 min-w-[500px]">
            {heatmapData.map((day) => (
              <div
                key={day.date}
                onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                onMouseLeave={() => setHoveredDay(null)}
                className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${getColorClass(
                  day.count
                )}`}
                title={`${day.count} problems on ${day.date}`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)]">
          <span>{stats.todaySolved > 0 ? '🔥 Great job solving today!' : '⚡ Solve 1 problem today to keep your streak!'}</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-[var(--bg-subtle)] border border-[var(--border)]" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/35 border border-emerald-500/40" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/70 border border-emerald-500/80" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 border border-emerald-400" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Recent Solved History */}
      {stats.recentSolved.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] space-y-2">
          <h4 className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Recently Solved by @{username}</span>
          </h4>
          <div className="divide-y divide-[var(--border)] text-xs">
            {stats.recentSolved.slice(0, 5).map((rec) => (
              <div key={rec.slug} className="py-2 flex items-center justify-between gap-3">
                <a
                  href={`https://leetcode.com/problems/${rec.slug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--text-main)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline flex items-center gap-1.5 truncate"
                >
                  <span className="truncate">{rec.title || rec.slug.replace(/-/g, ' ')}</span>
                  <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                </a>
                <span className="font-mono text-[10px] text-[var(--text-light)] shrink-0">
                  {rec.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
