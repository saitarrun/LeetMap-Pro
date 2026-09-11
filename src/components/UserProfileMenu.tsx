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
          className="apple-modal-backdrop fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-md sm:items-center"
          onClick={() => setIsActivityOpen(false)}
          role="presentation"
        >
          <div
            className="apple-modal-scroll apple-modal-surface relative my-auto max-h-[calc(100dvh-3rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--border)]/60 bg-[var(--bg-card)] p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="LeetCode solve activity"
          >
            <button
              onClick={() => setIsActivityOpen(false)}
              className="apple-press absolute right-5 top-5 h-8 w-8 rounded-full bg-[var(--bg-subtle)]/60 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              aria-label="Close activity tracker"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3.5 pr-10">
              <div className="h-13 w-13 shrink-0 overflow-hidden rounded-full border border-[var(--border)]/60 bg-[var(--bg-subtle)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Your progress</p>
                <h2 className="truncate text-lg font-semibold tracking-tight text-[var(--text-main)]">{user.name}</h2>
                <p className="truncate text-xs text-[var(--text-muted)] font-normal">{user.email || user.username}</p>
              </div>
            </div>

            <div className="mt-5">
              <ActivityTracker stats={activityStats} displayName={user.name} />
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)] px-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong className="font-medium text-[var(--text-main)]">Private Clerk profile</strong> · Solves and streak are isolated under your account.
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                onClick={openAccountSettings}
                className="apple-press flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)]/60 bg-[var(--bg-subtle)]/60 hover:bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-main)] transition-colors cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Manage account</span>
              </button>
              <button
                onClick={() => {
                  setIsActivityOpen(false);
                  void logout();
                }}
                className="apple-press flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-medium text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
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
        <div className="apple-dropdown-in absolute right-0 top-full z-50 mt-2 w-68 overflow-hidden rounded-2xl border border-[var(--border)]/60 bg-[var(--bg-card)] text-left shadow-2xl">
          <div className="flex items-center gap-3 p-3.5">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[var(--border)]/50 bg-[var(--bg-subtle)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xs font-semibold text-[var(--text-main)]">{user.name}</h3>
              <p className="truncate text-[11px] text-[var(--text-muted)] font-normal">{user.email || user.username}</p>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)] font-mono">
                {activityStats.currentStreak}d streak · {activityStats.totalSolved} solved
              </p>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]/40" />
          <button
            onClick={() => {
              setIsOpen(false);
              setIsActivityOpen(true);
            }}
            className="apple-press flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            <Flame className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span>Activity &amp; streak</span>
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              openAccountSettings();
            }}
            className="apple-press flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
            <span>Account settings</span>
          </button>
          <div className="h-px bg-[var(--border)]/40" />
          <button
            onClick={() => {
              setIsOpen(false);
              void logout();
            }}
            className="apple-press flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      )}

      {activityModal}
    </div>
  );
};
