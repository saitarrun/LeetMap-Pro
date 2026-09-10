'use client';

import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle, Clock, Database, GitCommit, AlertCircle, Layers, ShieldCheck } from 'lucide-react';
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

    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setSyncLogs(data.stdout || 'Multi-source sync completed successfully.');
        if (data.status) {
          onSyncComplete(data.status);
        }
      } else {
        setSyncError(data.error || 'Sync failed.');
        if (data.stderr) {
          setSyncLogs(data.stderr);
        }
      }
    } catch (err: any) {
      setSyncError(err.message || 'Network error occurred during sync.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formattedDate = syncStatus?.lastSynced
    ? new Date(syncStatus.lastSynced).toLocaleString()
    : 'Unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-main)]">
              Multi-Source Realtime Sync
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Aggregating and cross-referencing multiple upstream datasets
            </p>
          </div>
        </div>

        {/* Multi-Source Badges */}
        <div className="mb-4 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs space-y-2">
          <div className="font-semibold text-[var(--text-main)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Active Independent Sources</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-[11px] text-[var(--text-muted)]">
            <div className="flex items-center justify-between">
              <span>1. <strong>liquidslr</strong> (topics & recency windows)</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">470 companies</span>
            </div>
            <div className="flex items-center justify-between">
              <span>2. <strong>snehasishroy</strong> (problem IDs & 2026 updates)</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">659 companies</span>
            </div>
            <div className="flex items-center justify-between">
              <span>3. <strong>Official LeetCode GraphQL</strong></span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">984 live tags</span>
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>Total Merged Companies</span>
            </div>
            <div className="text-sm font-semibold text-[var(--text-main)]">
              {syncStatus?.companiesCount || 683} companies
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Unique Problems</span>
            </div>
            <div className="text-sm font-semibold text-[var(--text-main)]">
              {syncStatus?.uniqueProblemsCount ? syncStatus.uniqueProblemsCount.toLocaleString() : '3,422+'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <GitCommit className="w-3.5 h-3.5" />
              <span>Source Commits</span>
            </div>
            <div className="font-mono text-[11px] font-medium text-[var(--text-main)] truncate" title={syncStatus?.commitSha}>
              {syncStatus?.commitSha || 'latest'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Last Synced</span>
            </div>
            <div className="text-xs font-medium text-[var(--text-main)] truncate" title={formattedDate}>
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Logs or Error view */}
        {syncError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{syncError}</div>
          </div>
        )}

        {syncLogs && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-[11px] font-mono text-[var(--text-muted)] max-h-28 overflow-y-auto whitespace-pre-wrap">
            {syncLogs}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Multi-Sources Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
