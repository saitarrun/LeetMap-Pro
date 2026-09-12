'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, CheckCircle2, Pin } from 'lucide-react';
import { CompanySummary } from '@/types';
import { usePinnedCompanies } from '@/utils/usePinnedCompanies';
import { toast } from 'sonner';

interface CompanyCardProps {
  company: CompanySummary;
  solvedCount?: number;
  isPinned?: boolean;
  onTogglePin?: (slug: string) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  solvedCount = 0,
  isPinned: explicitPinned,
  onTogglePin,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const { isPinned: checkPinned, togglePin } = usePinnedCompanies();
  const pinned = explicitPinned !== undefined ? explicitPinned : checkPinned(company.slug);

  const handlePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTogglePin) {
      onTogglePin(company.slug);
    } else {
      const nowPinned = togglePin(company.slug);
      if (nowPinned) {
        toast.success(`Pinned ${company.name} for quick access`);
      } else {
        toast.info(`Unpinned ${company.name}`);
      }
    }
  };

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
      className="apple-card group relative flex items-center justify-between p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]/30 select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Minimal Logo Container */}
        <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 overflow-hidden">
          {faviconUrl && !imgFailed ? (
            <Image
              src={faviconUrl}
              alt={`${company.name} logo`}
              width={22}
              height={22}
              onError={() => setImgFailed(true)}
              className="w-5 h-5 object-contain"
            />
          ) : (
            <span className="text-[11px] font-semibold text-[var(--text-muted)] tracking-tight">{initials || 'CO'}</span>
          )}
        </div>

        {/* Company Meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-[-0.015em] text-[var(--text-main)] truncate">
              {company.name}
            </h3>
            {solvedCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {solvedCount}
              </span>
            )}
            {Boolean(company.sqlTotal && company.sqlTotal > 0) && (
              <span className="text-[10px] text-[var(--text-light)] font-mono">
                {company.sqlTotal} SQL
              </span>
            )}
          </div>

          {/* Minimal question count & difficulty */}
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--text-muted)] font-normal">
            <span>{company.total.toLocaleString()} questions</span>
            <span className="opacity-30">·</span>
            <span className="text-[11px] font-mono text-[var(--text-light)]">
              <span className="text-emerald-600/90 dark:text-emerald-400/90">{company.easy}</span>E{' '}
              <span className="text-amber-600/90 dark:text-amber-400/90">{company.medium}</span>M{' '}
              <span className="text-rose-600/90 dark:text-rose-400/90">{company.hard}</span>H
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          type="button"
          onClick={handlePin}
          className={`apple-press p-1.5 rounded-lg transition-colors cursor-pointer ${
            pinned
              ? 'text-amber-500'
              : 'text-[var(--text-light)] opacity-0 group-hover:opacity-100 hover:text-[var(--text-main)]'
          }`}
          title={pinned ? `Unpin ${company.name}` : `Pin ${company.name} for quick access`}
          aria-label={pinned ? `Unpin ${company.name}` : `Pin ${company.name}`}
        >
          <Pin className={`w-3.5 h-3.5 ${pinned ? 'fill-amber-500 rotate-45' : ''}`} />
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-light)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150" />
      </div>
    </Link>
  );
};
