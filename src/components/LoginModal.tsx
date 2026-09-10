'use client';

import React, { useState } from 'react';
import { X, ArrowRight, UserCheck, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const LoginModal: React.FC = () => {
  const { isModalOpen, closeLoginModal, loginWithUsername, oauthConfigured } = useAuth();
  const [username, setUsername] = useState('saitarrun');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsSubmitting(true);
    await loginWithUsername(username.trim());
    setIsSubmitting(false);
  };

  const handleOAuthLogin = () => {
    window.location.href = '/api/auth/github';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md apple-modal-backdrop"
      onClick={closeLoginModal}
    >
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl max-w-md w-full p-6 shadow-2xl relative apple-modal-surface space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="apple-press absolute top-5 right-5 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] shrink-0 shadow-xs">
            <GithubIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-main)] tracking-tight">
              Sign In with GitHub
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Isolate your solved problems and interview progress
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Separate progress per profile</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>GitHub avatar & verified stats</span>
          </div>
        </div>

        {/* Real OAuth Option (if configured) */}
        {oauthConfigured ? (
          <div className="space-y-3">
            <button
              onClick={handleOAuthLogin}
              className="apple-press w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-[var(--text-main)] text-[var(--bg-page)] font-semibold text-xs shadow-sm cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Continue with GitHub OAuth</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-light)]">
              <span className="flex-1 h-px bg-[var(--border)]" />
              <span>or instant profile sign-in</span>
              <span className="flex-1 h-px bg-[var(--border)]" />
            </div>
          </div>
        ) : null}

        {/* Instant GitHub Username Sign-in */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              GitHub Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-light)]">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="saitarrun"
                className="w-full pl-8 pr-4 py-2.5 rounded-2xl text-xs bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none focus:border-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--border)]/40 transition-[box-shadow,border-color] duration-150 font-mono"
                required
              />
            </div>
            <p className="text-[11px] text-[var(--text-light)] mt-1.5 flex items-center gap-1.5">
              <span>Quick pick:</span>
              <button
                type="button"
                onClick={() => setUsername('saitarrun')}
                className="font-mono text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                @saitarrun
              </button>
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !username.trim()}
            className="apple-press w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[var(--text-main)] text-[var(--bg-page)] font-semibold text-xs shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Verifying GitHub profile...</span>
            ) : (
              <>
                <GithubIcon className="w-3.5 h-3.5" />
                <span>Sign in as @{username.replace(/^@/, '') || 'user'}</span>
              </>
            )}
          </button>
        </form>

        {/* Note */}
        <div className="pt-2 border-t border-[var(--border)] flex items-start gap-2 text-[10px] text-[var(--text-muted)] leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>
            Signing in automatically loads and isolates your solved problems, tracking your DSA & SQL readiness separately.
          </span>
        </div>
      </div>
    </div>
  );
};
