'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { CompanySummary } from '@/types';

interface CompanyCardProps {
  company: CompanySummary;
  solvedCount?: number;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, solvedCount = 0 }) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Generate nice 2-letter fallback abbreviation
  const initials = company.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const faviconUrl = company.domain
    ? `https://www.google.com/s2/favicons?sz=64&domain=${company.domain}`
    : null;

  return (
    <Link
      href={`/company/${company.slug}`}
      className="group relative flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-subtle)] transition-all duration-150 shadow-xs"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Company Logo / Avatar */}
        <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
          {faviconUrl && !imgFailed ? (
            <img
              src={faviconUrl}
              alt=""
              width={24}
              height={24}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-6 h-6 object-contain"
            />
          ) : (
            <span className="text-xs font-bold text-stone-700">{initials || 'CO'}</span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-main)] group-hover:text-blue-500 transition-colors truncate">
              {company.name}
            </h3>
            {solvedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                {solvedCount}
              </span>
            )}
          </div>

          {/* Difficulty breakdown */}
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-main)]">{company.total}</span>
            <span className="text-[11px]">problems</span>
            <span className="text-[var(--border)]">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {company.easy}E
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {company.medium}M
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              {company.hard}H
            </span>
          </div>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-[var(--text-light)] group-hover:text-[var(--text-main)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
    </Link>
  );
};
