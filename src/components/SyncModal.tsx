'use client';

import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle, Clock, Database, GitCommit, AlertCircle, Layers, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { SyncStatus } from '@/types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus | null;
  onSyncComplete: (newStatus: SyncStatus) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  onSyncComplete,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncLogs(null);
    setSyncError(null);

    const syncPromise = fetch('/api/sync', { method: 'POST' }).then(async (res) => {
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Sync failed');
      return data;
    });

    toast.promise(syncPromise, {
      loading: 'Aggregating from 6 upstream sources in-memory...',
      success: (data) => {
        if (data.status) {
          onSyncComplete(data.status);
        }
        return `Synced ${data.status?.companiesCount?.toLocaleString() || 'updated'} companies and ${data.status?.uniqueProblemsCount?.toLocaleString() || 'updated'} problems across 6 sources.`;
      },
      error: (err) => err.message || 'Sync failed',
    });

    try {
      const data = await syncPromise;
      setSyncLogs(data.stdout || 'Multi-source sync completed successfully.');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Network error occurred during sync.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formattedDate = syncStatus?.lastSynced
    ? new Date(syncStatus.lastSynced).toLocaleString()
    : 'Unknown';
  const sources = syncStatus?.sources || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md apple-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative apple-modal-surface max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Close Pill */}
        <button
          onClick={onClose}
          className="apple-press absolute top-5 right-5 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-main)] tracking-tight">
              Realtime Multi-Source Sync
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Real-time aggregation across 6 active upstream sources with daily cron
            </p>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="mb-4 p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
            <div className="font-semibold text-[var(--text-main)] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Active Upstream Sources ({sources.length || 6})</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
              Daily Cron (04:00 UTC)
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] text-[var(--text-muted)] pt-0.5">
            {sources.length > 0 ? sources.map((source, index) => {
              let metricText = '';
              if (source.companies !== undefined) {
                metricText = `${source.companies} companies`;
              } else if (source.tagsCount !== undefined) {
                metricText = `${source.tagsCount} tags`;
              } else if (source.dailyProblem) {
                metricText = source.dailyProblem;
              } else if (source.problemsCount !== undefined) {
                metricText = `${source.problemsCount} problems`;
              }

              return (
                <div key={source.name} className="flex items-start justify-between gap-2.5 py-1 border-b border-[var(--border)]/40 last:border-b-0">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <strong className="text-[var(--text-main)] truncate text-[11px]">{source.name}</strong>
                    </div>
                    {source.description && (
                      <p className="text-[10px] text-[var(--text-muted)] pl-3 truncate">{source.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono font-medium text-emerald-600 dark:text-emerald-400 text-right text-[11px]">
                    {metricText}
                  </span>
                </div>
              );
            }) : (
              <span>Source details will appear after the first successful sync.</span>
            )}
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>Companies</span>
            </div>
            <div className="text-sm font-semibold text-[var(--text-main)]">
              {syncStatus?.companiesCount?.toLocaleString() || '—'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>DSA Problems</span>
            </div>
            <div className="text-sm font-semibold text-[var(--text-main)]">
              {syncStatus?.uniqueProblemsCount?.toLocaleString() || '—'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>SQL Problems</span>
            </div>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {syncStatus?.sqlProblemsCount?.toLocaleString() || '—'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <GitCommit className="w-3.5 h-3.5" />
              <span>Commits</span>
            </div>
            <div className="font-mono text-[11px] font-medium text-[var(--text-main)] truncate" title={syncStatus?.commitSha}>
              {syncStatus?.commitSha || 'latest'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Last Sync</span>
            </div>
            <div className="text-xs font-medium text-[var(--text-main)] truncate" title={formattedDate}>
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Logs */}
        {syncError && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{syncError}</div>
          </div>
        )}

        {syncLogs && (
          <div className="mb-4 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] text-[11px] font-mono text-[var(--text-muted)] max-h-24 overflow-y-auto whitespace-pre-wrap">
            {syncLogs}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            onClick={onClose}
            className="apple-press px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="apple-press flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Multi-Sources Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
