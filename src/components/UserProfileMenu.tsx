'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSolvedCount } from '@/utils/progress';
import {
  ExternalLink,
  LogOut,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export const UserProfileMenu: React.FC = () => {
  const { user, logout, openLoginModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSolvedCount(getSolvedCount(user?.username));

    const handleSolvedUpdated = () => {
      setSolvedCount(getSolvedCount(user?.username));
    };

    window.addEventListener('grindmap-solved-updated', handleSolvedUpdated);
    return () => window.removeEventListener('grindmap-solved-updated', handleSolvedUpdated);
  }, [user]);

  // Click outside listener
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
        className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--text-main)] text-[var(--bg-page)] shadow-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        title="Sign in with GitHub to isolate your progress"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* Profile Trigger Capsule */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="apple-press flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)]/80 hover:bg-[var(--bg-hover)] text-[var(--text-main)] shadow-2xs cursor-pointer transition-colors"
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)] shrink-0">
          <img
            src={user.avatarUrl}
            alt={user.name}
            width={24}
            height={24}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
        </div>
        <span className="text-xs font-semibold max-w-[80px] sm:max-w-[110px] truncate">
          @{user.username}
        </span>
        <ChevronDown className="w-3 h-3 text-[var(--text-light)] shrink-0" />
      </button>

      {/* Apple Profile Popover */}
      {isOpen && (
        <div className="apple-pop-in absolute right-0 mt-2 w-72 p-4 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl z-50 space-y-3.5">
          {/* User Info Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[var(--border)] shrink-0 shadow-xs">
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[var(--text-main)] truncate leading-snug">
                {user.name}
              </h3>
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 transition-colors"
              >
                <span>@{user.username}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>

          {/* Solved Progress Pill */}
          <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[var(--text-main)] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Solved Progress</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                {solvedCount} solved
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">
              Progress saved exclusively to your @{user.username} profile.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-[var(--border)] space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                openLoginModal();
              }}
              className="apple-press w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Switch GitHub Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="apple-press w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
