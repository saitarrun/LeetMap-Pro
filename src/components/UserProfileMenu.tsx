'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSolvedProblems } from '@/utils/progress';
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

export const UserProfileMenu: React.FC = () => {
  const { user, logout, openLoginModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
  const [solvedStats, setSolvedStats] = useState({ total: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateStats = () => {
      const solved = getSolvedProblems(user?.username);
      setSolvedStats({ total: solved.size });
    };

    updateStats();
    window.addEventListener('grindmap-solved-updated', updateStats);
    return () => window.removeEventListener('grindmap-solved-updated', updateStats);
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

  if (!user) {
    return (
      <button
        onClick={openLoginModal}
        className="apple-press p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
        title="Sign in with GitHub"
        aria-label="Sign in"
      >
        <User className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* Circular Avatar Trigger Button matching GrindMap design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="apple-press relative w-8 h-8 rounded-full overflow-hidden border border-black/10 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-[var(--border)] transition-transform hover:scale-105 cursor-pointer block"
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

      {/* Popover Dropdown matching GrindMap / Clerk modal */}
      {isOpen && (
        <div className="apple-pop-in absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl z-50 overflow-hidden text-left">
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
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[var(--text-main)] truncate leading-tight">
                {user.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)] truncate font-normal mt-0.5">
                {user.username}
              </p>
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
              className="apple-press w-full flex items-center gap-3 px-4 py-3 text-xs text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left"
            >
              <Settings className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span className="font-normal">Manage account</span>
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
              className="apple-press w-full flex items-center gap-3 px-4 py-3 text-xs text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left"
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
      {isManageAccountOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md apple-modal-backdrop"
          onClick={() => setIsManageAccountOpen(false)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl max-w-md w-full p-6 shadow-2xl relative apple-modal-surface space-y-5"
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
            <div className="flex items-center gap-3.5">
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

            {/* Progress Card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-[var(--text-main)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Interview Readiness</span>
                </div>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {solvedStats.total} problems solved
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                All progress is saved in your private profile storage key (`grindmap_solved_{user.username}`).
              </p>
            </div>

            {/* Account Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsManageAccountOpen(false);
                  openLoginModal();
                }}
                className="apple-press w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-main)] shadow-2xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Switch to Another GitHub Profile</span>
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
      )}
    </div>
  );
};
