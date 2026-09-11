'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { UserActivityStats } from '@/types';

interface ActivityTrackerProps {
  stats: UserActivityStats;
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

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getGitHubCellColor(count: number, isFuture: boolean, isCurrentYear: boolean): string {
  if (!isCurrentYear) return 'bg-transparent border border-transparent opacity-0 pointer-events-none';
  if (isFuture) {
    return 'bg-[#161b22] dark:bg-[#161b22] bg-[#ebedf0] border border-black/[0.04] dark:border-white/[0.05] opacity-50 cursor-default';
  }
  if (count === 0) {
    return 'bg-[#ebedf0] dark:bg-[#161b22] border border-black/[0.04] dark:border-white/[0.05] hover:opacity-80';
  }
  if (count === 1) {
    return 'bg-[#9be9a8] dark:bg-[#0e4429] border border-black/[0.04] dark:border-white/[0.05] hover:opacity-80';
  }
  if (count <= 3) {
    return 'bg-[#40c463] dark:bg-[#006d32] border border-black/[0.04] dark:border-white/[0.05] hover:opacity-80';
  }
  if (count <= 6) {
    return 'bg-[#30a14e] dark:bg-[#26a641] border border-black/[0.04] dark:border-white/[0.05] hover:opacity-80';
  }
  return 'bg-[#216e39] dark:bg-[#39d353] border border-black/[0.04] dark:border-white/[0.05] hover:opacity-80';
}

const DISPLAY_YEARS = [2026, 2025, 2024, 2023, 2022];

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({ stats }) => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const todayStr = useMemo(() => toLocalDateString(new Date()), []);
  const [activeDay, setActiveDay] = useState<{ date: string; count: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const yearSolvedCount = useMemo(() => {
    let total = 0;
    Object.entries(stats.dailyHistory).forEach(([dateStr, count]) => {
      if (dateStr.startsWith(`${selectedYear}-`)) {
        total += count;
      }
    });
    return total;
  }, [stats.dailyHistory, selectedYear]);

  const calendar = useMemo(() => {
    const jan1 = new Date(selectedYear, 0, 1, 12, 0, 0);
    const dec31 = new Date(selectedYear, 11, 31, 12, 0, 0);
    const actualToday = new Date();
    actualToday.setHours(12, 0, 0, 0);

    const startDate = new Date(jan1);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(dec31);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const weeks: CalendarDay[][] = [];
    const monthMarkers: { name: string; colIndex: number }[] = [];

    const current = new Date(startDate);
    let weekIndex = 0;
    let lastMonth = -1;

    while (current <= endDate) {
      const week: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const dateString = toLocalDateString(current);
        const isCurrentYear = current.getFullYear() === selectedYear;
        const isFuture = current > actualToday;
        const count = isCurrentYear ? (stats.dailyHistory[dateString] || 0) : 0;

        if (isCurrentYear && current.getMonth() !== lastMonth && (d <= 3 || lastMonth === -1)) {
          monthMarkers.push({
            name: current.toLocaleString('en-US', { month: 'short' }),
            colIndex: lastMonth === -1 ? 0 : weekIndex,
          });
          lastMonth = current.getMonth();
        }

        week.push({
          date: dateString,
          count,
          isToday: dateString === todayStr,
          isFuture,
          isCurrentYear,
        });

        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
      weekIndex++;
    }

    return { weeks, monthMarkers };
  }, [selectedYear, stats.dailyHistory, todayStr]);

  // Ensure scroll is visible on smaller screens
  useEffect(() => {
    if (selectedYear === currentYear && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const targetScroll = Math.max(0, container.scrollWidth * 0.4 - container.clientWidth / 2);
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [selectedYear, currentYear]);

  return (
    <div className="w-full">
      {/* Top Header Line */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--text-main)]">
          {yearSolvedCount.toLocaleString()} contributions in {selectedYear}
        </h2>
      </div>

      {/* Main Section: Card + Vertical Year Selector */}
      <div className="flex flex-col lg:flex-row items-start gap-4">
        {/* Boxed Contribution Card */}
        <div className="flex-1 min-w-0 w-full rounded-2xl border border-[var(--border)] bg-white dark:bg-[#0d1117] p-4 sm:p-5 shadow-xs">
          <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-1 [scrollbar-width:thin]">
            <div className="w-[722px] select-none">
              {/* Month Labels mathematically aligned to 53 week columns */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 shrink-0" />
                <div className="relative w-[686px] h-3.5 text-[11px] text-[#7d8590] dark:text-[#8b949e] font-normal leading-none">
                  {calendar.monthMarkers.map(({ name, colIndex }) => (
                    <span
                      key={name}
                      className="absolute leading-none font-normal"
                      style={{ left: `${colIndex * 13}px` }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Day Labels + Heatmap Grid */}
              <div className="flex items-start gap-2">
                {/* Day Labels Mon, Wed, Fri strictly matched to rows 2, 4, 6 */}
                <div className="grid grid-rows-7 gap-[3px] h-[88px] w-7 shrink-0 text-[10px] text-[#7d8590] dark:text-[#8b949e] font-normal leading-none">
                  <span className="row-start-2 flex items-center">Mon</span>
                  <span className="row-start-4 flex items-center">Wed</span>
                  <span className="row-start-6 flex items-center">Fri</span>
                </div>

                {/* 53 Columns x 7 Rows Grid */}
                <div className="grid grid-flow-col grid-rows-7 gap-[3px] h-[88px] w-[686px]">
                  {calendar.weeks.map((week, wIndex) =>
                    week.map((day, dIndex) => {
                      const tooltipText = day.count > 0
                        ? `${day.count} ${day.count === 1 ? 'contribution' : 'contributions'} on ${formatDayLabel(day.date)}`
                        : `No contributions on ${formatDayLabel(day.date)}`;

                      return (
                        <button
                          key={`${wIndex}-${dIndex}`}
                          type="button"
                          disabled={!day.isCurrentYear || day.isFuture}
                          onMouseEnter={() => day.isCurrentYear && !day.isFuture && setActiveDay({ date: day.date, count: day.count })}
                          onMouseLeave={() => setActiveDay(null)}
                          onClick={() => day.isCurrentYear && !day.isFuture && setActiveDay({ date: day.date, count: day.count })}
                          className={`w-[10px] h-[10px] rounded-[2.5px] transition-transform ${
                            !day.isCurrentYear || day.isFuture ? '' : 'cursor-pointer hover:scale-125 hover:z-20'
                          } ${
                            day.isToday ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-[#0d1117] z-10' : ''
                          } ${getGitHubCellColor(day.count, day.isFuture, day.isCurrentYear)}`}
                          title={!day.isCurrentYear ? undefined : day.isFuture ? `${formatDayLabel(day.date)} (Upcoming)` : tooltipText}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar inside Card */}
          <div className="mt-3 flex items-center justify-between text-xs text-[#7d8590] dark:text-[#8b949e] pt-2">
            <div className="text-[11px]">
              {activeDay ? (
                <span className="text-[var(--text-main)] font-medium">
                  {activeDay.count} {activeDay.count === 1 ? 'contribution' : 'contributions'} on {formatDayLabel(activeDay.date)}
                </span>
              ) : (
                <span className="hover:text-blue-500 cursor-pointer transition-colors">
                  Learn how we count contributions
                </span>
              )}
            </div>

            {/* Less / More Legend */}
            <div className="flex items-center gap-1.5 text-[11px] select-none">
              <span>Less</span>
              <span className="w-[10px] h-[10px] rounded-[2.5px] bg-[#ebedf0] dark:bg-[#161b22] border border-black/[0.04] dark:border-white/[0.05]" />
              <span className="w-[10px] h-[10px] rounded-[2.5px] bg-[#9be9a8] dark:bg-[#0e4429]" />
              <span className="w-[10px] h-[10px] rounded-[2.5px] bg-[#40c463] dark:bg-[#006d32]" />
              <span className="w-[10px] h-[10px] rounded-[2.5px] bg-[#30a14e] dark:bg-[#26a641]" />
              <span className="w-[10px] h-[10px] rounded-[2.5px] bg-[#216e39] dark:bg-[#39d353]" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Right Column: Apple-styled Vertical Years List */}
        <div className="flex lg:flex-col items-center lg:items-stretch gap-1.5 w-full lg:w-20 shrink-0 overflow-x-auto lg:overflow-visible py-0.5">
          {DISPLAY_YEARS.map((yr) => {
            const isSelected = selectedYear === yr;
            return (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`apple-press px-3 py-1.5 rounded-xl text-xs font-medium text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0969da] dark:bg-[#1f6feb] text-white font-semibold shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {yr}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
