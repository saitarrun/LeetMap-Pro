'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClerk } from '@clerk/nextjs';
import { getUserActivityStats } from '@/utils/progress';
import { ActivityTracker } from '@/components/ActivityTracker';
import { UserActivityStats } from '@/types';
import {
  Settings,
  LogOut,
  User,
  ExternalLink,
  CheckCircle2,
  X,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export interface UserProfileMenuProps {
  variant?: 'full' | 'streak-badge';
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ variant = 'full' }) => {
  const { user, logout, openLoginModal } = useAuth();
  const clerk = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [activityStats, setActivityStats] = useState<UserActivityStats | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateStats = () => {
      const stats = getUserActivityStats(user?.username);
      setActivityStats(stats);
    };

    updateStats();
    window.addEventListener('leetmap-solved-updated', updateStats);
    return () => window.removeEventListener('leetmap-solved-updated', updateStats);
  }, [user]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user && variant === 'streak-badge') {
    return null;
  }

  if (!user) {
    return (
      <button
        onClick={openLoginModal}
        className="apple-press p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
        title="Sign in"
        aria-label="Sign in"
      >
        <User className="w-4 h-4" />
      </button>
    );
  }

  const renderManageAccountModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md apple-modal-backdrop"
      onClick={() => setIsManageAccountOpen(false)}
    >
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative apple-modal-surface space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsManageAccountOpen(false)}
          className="apple-press absolute top-5 right-5 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[var(--border)] shrink-0 shadow-xs">
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[var(--text-main)] tracking-tight">
              {user.name}
            </h2>
            <a
              href={user.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
            >
              <span>@{user.username}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {user.bio && (
              <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Activity Heatmap & Everyday Streak Tracker */}
        {activityStats && (
          <ActivityTracker stats={activityStats} username={user.username} />
        )}

        {/* Storage Info */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[var(--text-main)]">Private Profile: </span>
            Your problem solves, timestamps, and streak calculations are isolated under your profile key (<code className="font-mono text-[11px] text-[var(--text-main)]">leetmap_solved_{user.username.toLowerCase()}</code>).
          </div>
        </div>

        {/* Account Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              setIsManageAccountOpen(false);
              openLoginModal();
            }}
            className="apple-press w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-main)] shadow-2xs transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Switch Profile</span>
          </button>

          <button
            onClick={() => {
              setIsManageAccountOpen(false);
              logout();
            }}
            className="apple-press w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === 'streak-badge') {
    return (
      <div className="relative shrink-0">
        <button
          onClick={() => setIsManageAccountOpen(true)}
          className="apple-press flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 hover:border-amber-500/50 text-amber-600 dark:text-amber-400 font-mono text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
          title="Click to view full Activity Heatmap & Streaks"
          aria-label="View Activity"
        >
          <span>🔥 {activityStats?.currentStreak || 0}d</span>
          <span className="hidden sm:inline font-sans font-normal text-[11px] text-[var(--text-muted)]">
            • {activityStats?.totalSolved || 0} solved
          </span>
        </button>

        {isManageAccountOpen && renderManageAccountModal()}
      </div>
    );
  }

  return (
    <div className="relative h-8 shrink-0 flex items-center gap-1.5 sm:gap-2" ref={menuRef}>
      {/* Streak Badge Trigger */}
      <button
        onClick={() => setIsManageAccountOpen(true)}
        className="apple-press h-8 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-full bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-mono text-xs font-semibold cursor-pointer shadow-2xs transition-colors select-none"
        title="View Activity Heatmap & Streaks"
        aria-label="View Activity"
      >
        <span className="leading-none">🔥 {activityStats?.currentStreak || 0}d</span>
        <span className="hidden sm:inline font-sans font-normal text-[11px] text-[var(--text-muted)] leading-none">
          • {activityStats?.totalSolved || 0} solved
        </span>
      </button>

      {/* Circular Avatar Trigger Button matching LeetMap design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="apple-press relative w-8 h-8 rounded-full overflow-hidden border border-black/10 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-[var(--border)] transition-transform hover:scale-105 cursor-pointer block shrink-0"
        aria-label="User account menu"
        aria-expanded={isOpen}
      >
        <img
          src={user.avatarUrl}
          alt={user.name}
          width={32}
          height={32}
          className="w-full h-full object-cover select-none"
        />
      </button>

      {/* Popover Dropdown matching LeetMap / Clerk modal */}
      {isOpen && (
        <div className="apple-dropdown-in absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl z-50 overflow-hidden text-left">
          {/* Top Section: Avatar + Name + Username */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--border)] shrink-0 bg-[var(--bg-subtle)]">
              <img
                src={user.avatarUrl}
                alt={user.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[var(--text-main)] truncate leading-tight">
                {user.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)] truncate font-normal mt-0.5">
                {user.username}
              </p>
              {activityStats && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                    🔥 {activityStats.currentStreak}d streak
                  </span>
                  <span className="text-[var(--text-muted)] font-sans">•</span>
                  <span className="text-[var(--text-muted)]">
                    {activityStats.totalSolved} solved
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          {/* Middle Section 1: Manage account */}
          <div>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsManageAccountOpen(true);
              }}
              className="apple-press w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left"
            >
              <Settings className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span className="font-normal">Streaks & Problem Solves</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                if (clerk && typeof clerk.openUserProfile === 'function') {
                  clerk.openUserProfile();
                } else {
                  setIsManageAccountOpen(true);
                }
              }}
              className="apple-press w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left"
            >
              <UserCheck className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span className="font-normal">Account Security & Settings</span>
            </button>
          </div>

          <div className="h-px bg-[var(--border)]" />

          {/* Middle Section 2: Sign out */}
          <div>
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="apple-press w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span className="font-normal">Sign out</span>
            </button>
          </div>

          <div className="h-px bg-[var(--border)]" />

          {/* Bottom Footer: Secured by Clerk / GitHub */}
          <div className="px-4 py-2.5 bg-[var(--bg-subtle)]/50 flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <span>Secured by</span>
            <div className="inline-flex items-center gap-1 font-semibold text-[var(--text-main)]">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              <span>clerk</span>
            </div>
          </div>
        </div>
      )}

      {/* Manage Account Dialog / Modal */}
      {isManageAccountOpen && renderManageAccountModal()}
    </div>
  );
};
