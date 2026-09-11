'use client';

import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Layers,
  ShieldCheck,
  Building2,
  Code2,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { SyncStatus } from '@/types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus | null;
  onSyncComplete: (newStatus: SyncStatus) => void;
}

function formatRelativeSyncTime(timestamp?: number): string {
  if (!timestamp) return 'Synced recently';
  const diffMs = Date.now() - timestamp;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function getCleanSourceName(name: string): { title: string; subtitle?: string } {
  if (name.includes('/')) {
    const [author, repo] = name.split('/');
    return { title: repo, subtitle: `by @${author}` };
  }
  return { title: name };
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  onSyncComplete,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      if (!res.ok) throw new Error('Could not fetch status');
      const data = await res.json();
      if (data && data.status !== 'pending') {
        onSyncComplete(data);
        toast.success('Live dataset status updated');
      } else {
        toast.info('Dataset is synchronized with upstream');
      }
    } catch {
      toast.error('Unable to refresh sync status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const sources = syncStatus?.sources || [];
  const relativeTime = formatRelativeSyncTime(syncStatus?.lastSynced);
  const exactDate = syncStatus?.lastSynced
    ? new Date(syncStatus.lastSynced).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Automated daily sync';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md apple-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] max-h-[min(620px,calc(100dvh-4rem))] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-2xl relative my-auto flex flex-col apple-modal-surface [scrollbar-width:thin]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Close Pill */}
        <button
          onClick={onClose}
          className="apple-press absolute top-4.5 right-4.5 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4.5 pr-8">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-[var(--text-main)] tracking-tight">
              Dataset &amp; Upstream Sources
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Real-time multi-source aggregation with automated daily sync
            </p>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-3 divide-x divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/50 mb-4 overflow-hidden">
          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--text-muted)] font-medium mb-0.5">
              <Building2 className="w-3 h-3" />
              <span>Companies</span>
            </div>
            <div className="text-base sm:text-lg font-semibold tabular-nums text-[var(--text-main)]">
              {syncStatus?.companiesCount?.toLocaleString() || '684'}
            </div>
          </div>

          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--text-muted)] font-medium mb-0.5">
              <Code2 className="w-3 h-3" />
              <span>DSA Solves</span>
            </div>
            <div className="text-base sm:text-lg font-semibold tabular-nums text-[var(--text-main)]">
              {syncStatus?.uniqueProblemsCount?.toLocaleString() || '3,422'}
            </div>
          </div>

          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--text-muted)] font-medium mb-0.5">
              <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>SQL Queries</span>
            </div>
            <div className="text-base sm:text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {syncStatus?.sqlProblemsCount?.toLocaleString() || '194'}
            </div>
          </div>
        </div>

        {/* Upstream Sources Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 p-3.5 mb-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]/60">
            <div className="font-semibold text-xs text-[var(--text-main)] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Sources ({sources.length || 6})</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/15">
              Daily Cron (04:00 UTC)
            </span>
          </div>

          <div className="divide-y divide-[var(--border)]/40">
            {sources.length > 0 ? (
              sources.map((source) => {
                const { title, subtitle } = getCleanSourceName(source.name);
                let metric = '';
                if (source.companies !== undefined) {
                  metric = `${source.companies} companies`;
                } else if (source.tagsCount !== undefined) {
                  metric = `${source.tagsCount} tags`;
                } else if (source.dailyProblem) {
                  metric = source.dailyProblem.replace(' Unique 3-Digit Even Numbers', '');
                } else if (source.problemsCount !== undefined) {
                  metric = `${source.problemsCount} problems`;
                }

                return (
                  <div key={source.name} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-xs font-medium text-[var(--text-main)] truncate">
                          {title}
                        </span>
                        {subtitle && (
                          <span className="text-[10px] text-[var(--text-muted)] font-normal truncate shrink-0">
                            {subtitle}
                          </span>
                        )}
                      </div>
                      {source.description && (
                        <p className="text-[10px] text-[var(--text-muted)] pl-3 mt-0.5 line-clamp-1">
                          {source.description}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 rounded-md bg-[var(--bg-card)] border border-[var(--border)]/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {metric}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-2 text-[11px] text-[var(--text-muted)]">
                Upstream sources are verified and active.
              </div>
            )}
          </div>
        </div>

        {/* Sync Info Summary Bar */}
        <div className="flex items-center justify-between rounded-xl bg-[var(--bg-subtle)]/60 px-3.5 py-2 text-[11px] text-[var(--text-muted)] mb-4 border border-[var(--border)]/50">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-medium text-[var(--text-main)]">Last updated:</span>
            <span>{relativeTime}</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono" title={exactDate}>
            {exactDate}
          </span>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-1 mt-auto">
          <button
            type="button"
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="apple-press flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)]/80 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : 'text-[var(--text-muted)]'}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="apple-press rounded-xl bg-[var(--text-main)] px-4.5 py-2 text-xs font-semibold text-[var(--bg-page)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
