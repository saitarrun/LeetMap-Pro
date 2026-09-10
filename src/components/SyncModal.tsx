'use client';

import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle, Clock, Database, GitCommit, AlertCircle } from 'lucide-react';
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
        setSyncLogs(data.stdout || 'Sync completed successfully.');
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
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-main)]">
              Realtime Data Sync Pipeline
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Upstream problem sync engine & scheduler
            </p>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <GitCommit className="w-3.5 h-3.5" />
              <span>Upstream Commit</span>
            </div>
            <div className="font-mono text-sm font-medium text-[var(--text-main)]">
              {syncStatus?.commitSha || 'main'}
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

          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>Companies</span>
            </div>
            <div className="text-sm font-semibold text-[var(--text-main)]">
              {syncStatus?.companiesCount || 470} companies
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Unique Problems</span>
            </div>
            <div className="text-sm font-semibold text-[var(--text-main)]">
              {syncStatus?.uniqueProblemsCount ? syncStatus.uniqueProblemsCount.toLocaleString() : '3,392+'}
            </div>
          </div>
        </div>

        {/* Sync Info Description */}
        <div className="mb-5 text-xs text-[var(--text-muted)] space-y-1.5 border-t border-[var(--border)] pt-4">
          <p>
            • <strong>Automated Cron:</strong> Runs daily at 02:00 UTC via GitHub Actions.
          </p>
          <p>
            • <strong>Source Repos:</strong> <a href="https://github.com/liquidslr/leetcode-company-wise-problems" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">liquidslr/leetcode-company-wise-problems</a> & GrindMap index.
          </p>
          <p>
            • <strong>Speed:</strong> High-performance in-memory stream parser processes 2,350 CSVs in ~2s.
          </p>
        </div>

        {/* Logs or Error view */}
        {syncError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{syncError}</div>
          </div>
        )}

        {syncLogs && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-[11px] font-mono text-[var(--text-muted)] max-h-32 overflow-y-auto whitespace-pre-wrap">
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
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
