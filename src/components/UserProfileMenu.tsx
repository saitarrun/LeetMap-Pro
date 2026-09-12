'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useClerk } from '@clerk/nextjs';
import { Flame, LogOut, Settings, ShieldCheck, UserCheck, X, User, ExternalLink, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ActivityTracker } from '@/components/ActivityTracker';
import { useAuth } from '@/context/AuthContext';
import { getUserActivityStats, resetUserProgress } from '@/utils/progress';
import { useSolvedProblems } from '@/utils/useSolvedProblems';

export const UserProfileMenu: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const clerk = useClerk();
  useSolvedProblems();
  const [isOpen, setIsOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activityStats = getUserActivityStats(user?.id);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsActivityOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDown);
    }
    if (isOpen || isActivityOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isActivityOpen]);

  useEffect(() => {
    if (isActivityOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isActivityOpen]);

  if (!user) return null;

  const openAccountSettings = () => {
    try {
      if (typeof clerk?.openUserProfile === 'function') {
        clerk.openUserProfile();
      } else {
        router.push('/account');
      }
    } catch {
      router.push('/account');
    }
  };

  const activityModal = isActivityOpen
    ? createPortal(
        <div
          className="apple-modal-backdrop fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsActivityOpen(false);
          }}
          onTouchStart={(e) => {
            if (e.target === e.currentTarget) setIsActivityOpen(false);
          }}
          role="presentation"
        >
          <div
            className="apple-modal-surface relative my-auto flex max-h-[min(720px,calc(100dvh-2rem))] w-full max-w-[890px] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="LeetCode solve activity"
          >
            <button
              onClick={() => setIsActivityOpen(false)}
              className="apple-press absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
              aria-label="Close activity tracker"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Centered Apple-style Identity Header */}
            <header className="flex flex-col items-center border-b border-[var(--border)] px-6 pt-6 pb-4 text-center">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] shadow-sm ring-2 ring-[var(--border)]/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              </div>
              <h2 className="mt-2.5 text-base font-bold tracking-tight text-[var(--text-main)]">{user.name}</h2>
              <p className="text-xs text-[var(--text-muted)] font-medium">{user.email || user.username}</p>
              
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-1 text-[11px] font-medium text-[var(--text-muted)] shadow-2xs">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-[var(--text-main)] tabular-nums">{activityStats.currentStreak}d streak</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="tabular-nums font-medium text-[var(--text-main)]">{activityStats.totalSolved} solved</span>
              </div>
            </header>

            <div className="apple-modal-scroll min-h-0 flex-1 overflow-y-auto p-4 sm:p-5.5">
              <ActivityTracker stats={activityStats} />
            </div>

            <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] px-5 py-3.5 sm:px-7 sm:py-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Streak &amp; progress synced to your account.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsActivityOpen(false);
                    router.push(`/u/${user.username}`);
                  }}
                  className="apple-press text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  <span>Public profile</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsActivityOpen(false);
                    openAccountSettings();
                  }}
                  className="apple-press flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-main)] shadow-2xs transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span>Manage account</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsActivityOpen(false);
                    void logout();
                  }}
                  className="apple-press flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </footer>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative flex h-8 shrink-0 items-center gap-1.5 sm:gap-2" ref={menuRef}>
      <button
        onClick={() => setIsActivityOpen(true)}
        className="apple-press flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
        title="View LeetCode streak and solve activity"
        aria-label="View LeetCode solve activity"
      >
        <Flame className="h-3.5 w-3.5 text-amber-500" />
        <span className="font-mono text-[11px] font-semibold text-[var(--text-main)]">{activityStats.currentStreak}d</span>
      </button>

      <button
        onClick={() => setIsOpen((open) => !open)}
        className="apple-press relative block h-7 w-7 shrink-0 overflow-hidden rounded-full border border-[var(--border)] transition-opacity hover:opacity-90 focus:outline-none cursor-pointer"
        aria-label="User account menu"
        aria-expanded={isOpen}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover select-none" />
      </button>

      {isOpen && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="apple-dropdown-in absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[var(--border)]/70 bg-[var(--bg-card)] p-1.5 text-left shadow-2xl backdrop-blur-xl"
        >
          {/* User identity card in dropdown */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              router.push(`/u/${user.username}`);
            }}
            className="flex w-full items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-subtle)] active:bg-[var(--bg-hover)] transition-colors text-left cursor-pointer"
            title="View your public profile"
          >
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[var(--border)]/70 bg-[var(--bg-subtle)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xs font-semibold text-[var(--text-main)]">{user.name}</h3>
              <p className="truncate text-[11px] text-[var(--text-muted)] font-normal">{user.email || user.username}</p>
            </div>
            <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]/50">
              @{user.username}
            </span>
          </button>

          <div className="my-1 h-px bg-[var(--border)]/50" />

          {/* Action 1: Public profile */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              router.push(`/u/${user.username}`);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)] active:bg-[var(--bg-hover)] transition-colors cursor-pointer rounded-xl"
          >
            <User className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="flex-1">Public profile</span>
            <ExternalLink className="h-3 w-3 text-[var(--text-muted)] shrink-0 opacity-60" />
          </button>

          {/* Action 2: Activity & streak */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsActivityOpen(true);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)] active:bg-[var(--bg-hover)] transition-colors cursor-pointer rounded-xl"
          >
            <Flame className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="flex-1">Activity &amp; streak</span>
            <span className="text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400 shrink-0">
              {activityStats.currentStreak}d
            </span>
          </button>

          {/* Action 3: Account settings */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openAccountSettings();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)] active:bg-[var(--bg-hover)] transition-colors cursor-pointer rounded-xl"
          >
            <Settings className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <span className="flex-1">Account settings</span>
          </button>

          {/* Action 4: Reset progress (GDPR / CCPA Right to Erasure) */}
          <button
            type="button"
            onClick={async () => {
              setIsOpen(false);
              const confirmed = window.confirm(
                'Are you sure you want to reset all your solved problems and streak records? This will permanently erase your progress history.'
              );
              if (confirmed) {
                const success = await resetUserProgress(user.id);
                if (success) {
                  toast.success('Your progress and streak records have been permanently erased.');
                } else {
                  toast.error('Failed to reset progress. Please try again.');
                }
              }
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 transition-colors cursor-pointer rounded-xl"
          >
            <RotateCcw className="h-4 w-4 shrink-0 opacity-70" />
            <span className="flex-1">Reset progress</span>
          </button>

          <div className="my-1 h-px bg-[var(--border)]/50" />

          {/* Action 5: Sign out */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              void logout();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 transition-colors cursor-pointer rounded-xl"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="flex-1">Sign out</span>
          </button>
        </div>
      )}

      {activityModal}
    </div>
  );
};

export const MobileUserMenuSection: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const clerk = useClerk();
  const router = useRouter();

  if (!user) return null;
  const activityStats = getUserActivityStats(user.id);

  return (
    <div className="pt-2 border-t border-[var(--border)]/60 space-y-2">
      <button
        type="button"
        onClick={() => {
          onClose();
          router.push(`/u/${user.username}`);
        }}
        className="flex w-full items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]/60 text-left cursor-pointer active:bg-[var(--bg-hover)] transition-colors"
      >
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[var(--border)]/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h3 className="truncate text-xs font-semibold text-[var(--text-main)]">{user.name}</h3>
            <span className="text-[11px] font-mono font-semibold text-amber-500 shrink-0">
              {activityStats.currentStreak}d streak
            </span>
          </div>
          <p className="truncate text-[11px] text-[var(--text-muted)]">{user.email || user.username}</p>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push(`/u/${user.username}`);
          }}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-main)] active:bg-[var(--bg-hover)] cursor-pointer"
        >
          <User className="h-3.5 w-3.5 text-emerald-500" />
          <span>Public profile</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            try {
              if (typeof clerk?.openUserProfile === 'function') {
                clerk.openUserProfile();
              } else {
                router.push('/account');
              }
            } catch {
              router.push('/account');
            }
          }}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-main)] active:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span>Settings</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          onClose();
          void logout();
        }}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 active:bg-rose-500/20 transition-colors cursor-pointer"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span>Sign out</span>
      </button>
    </div>
  );
};
