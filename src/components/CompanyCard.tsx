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
      className="apple-card group relative flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]/20 transition-all select-none"
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
            <h3 className="text-sm font-semibold text-[var(--text-main)] group-hover:text-blue-500 transition-colors truncate">
              {company.name}
            </h3>
            {solvedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--diff-easy-text)] bg-[var(--diff-easy-bg)] px-1.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                {solvedCount}
              </span>
            )}
          </div>

          {/* Difficulty breakdown with Apple system colors */}
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-main)]">{company.total}</span>
            <span className="text-[11px]">questions</span>
            <span className="text-[var(--border)]">•</span>
            <span className="font-semibold text-[var(--diff-easy-text)]">
              {company.easy}E
            </span>
            <span className="font-semibold text-[var(--diff-medium-text)]">
              {company.medium}M
            </span>
            <span className="font-semibold text-[var(--diff-hard-text)]">
              {company.hard}H
            </span>
          </div>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-[var(--text-light)] group-hover:text-[var(--text-main)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
    </Link>
  );
};
