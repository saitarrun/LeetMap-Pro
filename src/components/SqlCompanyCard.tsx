'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, CheckCircle2, Database, Clock } from 'lucide-react';
import { SqlCompanySummary } from '@/types';

interface SqlCompanyCardProps {
  company: SqlCompanySummary;
  solvedCount?: number;
}

export const SqlCompanyCard: React.FC<SqlCompanyCardProps> = ({ company, solvedCount = 0 }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const initials = company.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const faviconUrl = company.domain
    ? `https://www.google.com/s2/favicons?sz=64&domain=${company.domain}`
    : null;

  const recentCount =
    company.sqlWindowsCount?.['3_months'] ||
    company.sqlWindowsCount?.['30_days'] ||
    company.sqlWindowsCount?.['6_months'] ||
    0;

  return (
    <Link
      href={`/sql/${company.slug}`}
      className="apple-card group relative flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-cyan-500/30 transition-all select-none"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Apple Squircle Logo Container */}
        <div className="w-11 h-11 rounded-xl bg-white border border-black/5 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
          {faviconUrl && !imgFailed ? (
            <img
              src={faviconUrl}
              alt=""
              width={26}
              height={26}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-6 h-6 object-contain"
            />
          ) : (
            <span className="text-xs font-semibold text-stone-800 tracking-tight">{initials || 'CO'}</span>
          )}
        </div>

        {/* Company Meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-main)] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
              {company.name}
            </h3>
            {solvedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--diff-easy-text)] bg-[var(--diff-easy-bg)] px-1.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                {solvedCount}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-md">
              <Database className="w-2.5 h-2.5" />
              {company.sqlTotal} SQL
            </span>
          </div>

          {/* Difficulty breakdown for SQL questions */}
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--diff-easy-text)]">
              {company.sqlEasy}E
            </span>
            <span className="font-semibold text-[var(--diff-medium-text)]">
              {company.sqlMedium}M
            </span>
            <span className="font-semibold text-[var(--diff-hard-text)]">
              {company.sqlHard}H
            </span>
            {recentCount > 0 && (
              <>
                <span className="text-[var(--border)]">•</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-500/90 font-medium">
                  <Clock className="w-2.5 h-2.5" />
                  {recentCount} in 3mo
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-[var(--text-light)] group-hover:text-[var(--text-main)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
    </Link>
  );
};
