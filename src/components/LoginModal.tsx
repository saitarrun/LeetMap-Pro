'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const ClerkIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
  </svg>
);

export const LoginModal: React.FC = () => {
  const { isModalOpen, closeLoginModal, loginWithUsername, oauthConfigured } = useAuth();
  const [emailOrUser, setEmailOrUser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUser.trim()) return;
    setIsSubmitting(true);
    await loginWithUsername(emailOrUser.trim());
    setIsSubmitting(false);
  };

  const handleGitHubClick = async () => {
    if (oauthConfigured) {
      window.location.href = '/api/auth/github';
    } else {
      setIsSubmitting(true);
      const target = emailOrUser.trim() || 'saitarrun';
      await loginWithUsername(target);
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setIsSubmitting(true);
    try {
      const email = emailOrUser.trim() || 'user@gmail.com';
      await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, provider: 'google' }),
      });
      window.location.reload();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs apple-modal-backdrop"
      onClick={closeLoginModal}
    >
      <div
        className="bg-white dark:bg-[#18181b] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl max-w-[420px] w-full pt-8 pb-0 px-8 shadow-2xl relative overflow-hidden text-neutral-900 dark:text-neutral-100 apple-modal-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-1 rounded-full cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {isSignUp ? 'Sign up for leetmap' : 'Sign in to leetmap'}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 font-normal">
            {isSignUp
              ? 'Create an account to track your problems'
              : 'Welcome back! Please sign in to continue'}
          </p>
        </div>

        {/* Social Buttons: GitHub & Google */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={handleGitHubClick}
            disabled={isSubmitting}
            className="apple-press flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-50 dark:hover:bg-neutral-800 bg-white dark:bg-neutral-900 text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <GithubIcon className="w-4 h-4 text-neutral-900 dark:text-white" />
            <span>GitHub</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isSubmitting}
            className="apple-press flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-50 dark:hover:bg-neutral-800 bg-white dark:bg-neutral-900 text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Google</span>
          </button>
        </div>

        {/* Divider: or */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-[#18181b] px-3 text-neutral-400 font-medium">or</span>
          </div>
        </div>

        {/* Email Address Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Email address
            </label>
            <input
              type="text"
              value={emailOrUser}
              onChange={(e) => setEmailOrUser(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400/20 focus:border-neutral-400 dark:focus:border-neutral-500 transition-all font-normal"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !emailOrUser.trim()}
            className="apple-press w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#2e3138] hover:bg-[#23262c] text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Continuing...</span>
            ) : (
              <>
                <span>Continue</span>
                <span className="text-[9px] ml-0.5">▶</span>
              </>
            )}
          </button>
        </form>

        {/* Footer: Sign up switch */}
        <div className="pt-6 pb-4 text-center text-xs text-neutral-500 dark:text-neutral-400 mt-2">
          <span>{isSignUp ? 'Already have an account? ' : "Don't have an account? "}</span>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-neutral-900 dark:text-white hover:underline cursor-pointer"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>

        {/* Footer: Secured by Clerk */}
        <div className="py-3 px-8 -mx-8 bg-neutral-50/70 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <span>Secured by</span>
          <div className="inline-flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
            <ClerkIcon className="w-3.5 h-3.5" />
            <span>clerk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

