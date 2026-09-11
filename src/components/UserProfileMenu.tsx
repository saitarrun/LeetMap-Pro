'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useClerk } from '@clerk/nextjs';
import { Flame, LogOut, Settings, ShieldCheck, UserCheck, X, User, ExternalLink } from 'lucide-react';
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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsActivityOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    if (isOpen || isActivityOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  const openAccountSettings = () => clerk.openUserProfile();
  const activityModal = isActivityOpen
    ? createPortal(
        <div
          className="apple-modal-backdrop fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-md sm:p-6"
          onClick={() => setIsActivityOpen(false)}
          role="presentation"
        >
          <div
            className="apple-modal-surface relative my-auto flex max-h-[min(720px,calc(100dvh-3rem))] w-full max-w-[890px] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="LeetCode solve activity"
          >
            <button
              onClick={() => setIsActivityOpen(false)}
              className="apple-press absolute right-4 top-4 z-10 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
              aria-label="Close activity tracker"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Centered Apple-style Identity Header */}
            <header className="flex flex-col items-center border-b border-[var(--border)] px-6 pt-6 pb-4 text-center">
              <div className="relative h-13 w-13 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] shadow-sm ring-2 ring-[var(--border)]/30">
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

            <div className="apple-modal-scroll min-h-0 flex-1 overflow-y-auto p-4.5 sm:p-5.5">
              <ActivityTracker stats={activityStats} />
            </div>

            <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] px-6 py-4 sm:px-7">
              <div className="mb-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Streak &amp; progress synced to your account.</span>
                </div>
                <Link
                  href={`/u/${user.username}`}
                  onClick={() => setIsActivityOpen(false)}
                  className="apple-press text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Public profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  onClick={openAccountSettings}
                  className="apple-press flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-main)] shadow-2xs transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span>Manage account</span>
                </button>
                <button
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
        <div className="apple-dropdown-in absolute right-0 top-full z-50 mt-2 w-68 overflow-hidden rounded-2xl border border-[var(--border)]/60 bg-[var(--bg-card)] text-left shadow-2xl">
          <div className="flex items-center gap-3 p-3.5">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[var(--border)]/50 bg-[var(--bg-subtle)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xs font-semibold text-[var(--text-main)]">{user.name}</h3>
              <p className="truncate text-[11px] text-[var(--text-muted)] font-normal">{user.email || user.username}</p>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]/40" />
          <Link
            href={`/u/${user.username}`}
            onClick={() => setIsOpen(false)}
            className="apple-press flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            <User className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span>Public profile</span>
          </Link>
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
