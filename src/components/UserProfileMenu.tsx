'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useClerk } from '@clerk/nextjs';
import { Flame, LogOut, Settings, ShieldCheck, UserCheck, X } from 'lucide-react';
import { ActivityTracker } from '@/components/ActivityTracker';
import { useAuth } from '@/context/AuthContext';
import { getUserActivityStats } from '@/utils/progress';
import { useSolvedProblems } from '@/utils/useSolvedProblems';

export const UserProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const clerk = useClerk();
  useSolvedProblems();
  const [isOpen, setIsOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activityStats = getUserActivityStats(user?.id);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    }

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  const openAccountSettings = () => clerk.openUserProfile();
  const activityModal = isActivityOpen
    ? createPortal(
        <div
          className="apple-modal-backdrop fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-6 backdrop-blur-md sm:items-center"
          onClick={() => setIsActivityOpen(false)}
          role="presentation"
        >
          <div
            className="apple-modal-scroll apple-modal-surface relative my-auto max-h-[calc(100dvh-3rem)] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="LeetCode solve activity"
          >
            <button
              onClick={() => setIsActivityOpen(false)}
              className="apple-press absolute right-5 top-5 rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              aria-label="Close activity tracker"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4 pr-10">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[var(--bg-card)] bg-[var(--bg-subtle)] shadow-lg ring-1 ring-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">Your progress</p>
                <h2 className="truncate text-xl font-semibold tracking-tight text-[var(--text-main)]">{user.name}</h2>
                <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{user.email || user.username}</p>
              </div>
            </div>

            <div className="mt-7">
              <ActivityTracker stats={activityStats} displayName={user.name} />
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm leading-6 text-[var(--text-muted)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <div>
                <span className="font-semibold text-[var(--text-main)]">Private Clerk profile. </span>
                Your solve history and streak are isolated under your authenticated Clerk user ID.
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                onClick={openAccountSettings}
                className="apple-press flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--text-main)] py-3 text-sm font-semibold text-[var(--bg-page)] shadow-xs hover:opacity-90 cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Manage Clerk account</span>
              </button>
              <button
                onClick={() => {
                  setIsActivityOpen(false);
                  void logout();
                }}
                className="apple-press flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 py-3 text-sm font-semibold text-rose-700 dark:text-rose-300 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
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
        <div className="apple-dropdown-in absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-left shadow-2xl">
          <div className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--bg-subtle)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-[var(--text-main)]">{user.name}</h3>
              <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{user.email || user.username}</p>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                {activityStats.currentStreak}d streak · {activityStats.totalSolved} solved
              </p>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />
          <button
            onClick={() => {
              setIsOpen(false);
              setIsActivityOpen(true);
            }}
            className="apple-press flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-[var(--text-main)] hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            <Flame className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <span>Streaks and problem solves</span>
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              openAccountSettings();
            }}
            className="apple-press flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-[var(--text-main)] hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            <Settings className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <span>Clerk account settings</span>
          </button>
          <div className="h-px bg-[var(--border)]" />
          <button
            onClick={() => {
              setIsOpen(false);
              void logout();
            }}
            className="apple-press flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-[var(--text-main)] hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <span>Sign out</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 border-t border-[var(--border)] bg-[var(--bg-subtle)]/50 px-4 py-2.5 text-[11px] text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Secured by Clerk</span>
          </div>
        </div>
      )}

      {activityModal}
    </div>
  );
};
