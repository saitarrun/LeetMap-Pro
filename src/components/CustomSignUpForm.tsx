'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@clerk/nextjs/legacy';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import { 
  ArrowLeft, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2, 
  KeyRound 
} from 'lucide-react';
import { LeetMapLogo } from './LeetMapLogo';

export const CustomSignUpForm: React.FC = () => {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Status & errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);

    // Validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both entries.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
        router.push('/');
        return;
      }

      // If email code verification is required
      await signUp.prepareVerification({ strategy: 'email_code' });
      setPendingVerification(true);
      setSuccessMessage(`A 6-digit verification code was sent to ${email}`);
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.longMessage || err.errors[0]?.message || 'Sign up failed. Please try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during sign up.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);

    if (!code.trim() || code.trim().length < 6) {
      setError('Please enter the 6-digit code received in your email.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp.attemptVerification({
        strategy: 'email_code',
        code: code.trim(),
      });

      if (result.status === 'complete') {
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
        router.push('/');
        return;
      }

      if (result.status) {
        setError(`Sign up status: ${result.status}. Please complete any pending requirements.`);
      }
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.longMessage || err.errors[0]?.message || 'Invalid verification code.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Verification failed. Please check the code and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      await signUp.prepareVerification({ strategy: 'email_code' });
      setSuccessMessage('A fresh verification code has been sent to your email.');
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message || 'Unable to resend code.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleOAuthSignUp = async (strategy: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;
    setError(null);
    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message || 'OAuth sign up failed.');
      }
    }
  };

  return (
    <div className="w-full max-w-[440px] space-y-5">
      {/* Top back & security indicator */}
      <div className="flex items-center justify-between px-1 text-xs text-[var(--text-muted)]">
        <Link
          href="/"
          className="apple-press inline-flex items-center gap-1.5 hover:text-[var(--text-main)] transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to LeetMap Pro</span>
        </Link>
        <div className="inline-flex items-center gap-1">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span className="text-[11px]">Encrypted &amp; Privacy-First</span>
        </div>
      </div>

      {/* Centered Brand Presentation */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs mb-1">
          <LeetMapLogo size={32} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Free Account — 100% Open Access</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
          {pendingVerification ? 'Verify your email' : 'Create your account'}
        </h1>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-normal leading-relaxed">
          {pendingVerification
            ? `We sent a 6-digit confirmation code to ${email}. Enter it below to activate your account.`
            : 'Join thousands of engineers practicing interview problems asked by 680+ tech companies.'}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="apple-enter rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl p-6 sm:p-7 space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && !error && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {pendingVerification ? (
          /* Email Verification Step */
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="verificationCode" className="block text-xs font-medium text-[var(--text-main)]">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="verificationCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-9 pr-3 py-2.5 text-center tracking-widest text-lg font-mono rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.length < 6}
              className="apple-press w-full py-2.5 px-4 rounded-xl bg-[var(--text-main)] text-[var(--bg-page)] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Email &amp; Complete Sign Up</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-1 text-[var(--text-muted)]">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="hover:text-[var(--text-main)] transition-colors underline cursor-pointer disabled:opacity-50"
              >
                {isResending ? 'Resending code...' : 'Resend code'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingVerification(false);
                  setCode('');
                  setError(null);
                }}
                className="hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                Change email
              </button>
            </div>
          </form>
        ) : (
          /* Initial Registration Form */
          <>
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleOAuthSignUp('oauth_google')}
                className="apple-press flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] text-xs font-medium transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignUp('oauth_github')}
                className="apple-press flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] text-xs font-medium transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[var(--border)] w-full" />
              <span className="bg-[var(--bg-card)] px-2.5 text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                or email
              </span>
            </div>

            {/* Email + Password + Confirm Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-medium text-[var(--text-main)]">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-[var(--text-main)]">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-[var(--text-main)]">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-none transition-colors ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-[var(--border)] focus:border-emerald-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[11px] text-rose-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !email || !password || !confirmPassword}
                className="apple-press w-full py-2.5 px-4 rounded-xl bg-[var(--text-main)] text-[var(--bg-page)] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          </>
        )}

        {/* Footer: Sign in link */}
        <div className="text-center pt-2 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Perks Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
          <div className="text-[11px] font-semibold text-[var(--text-main)]">Cloud Sync</div>
          <div className="text-[10px] text-[var(--text-muted)]">Save progress</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
          <div className="text-[11px] font-semibold text-[var(--text-main)]">680+ Firms</div>
          <div className="text-[10px] text-[var(--text-muted)]">Real frequencies</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
          <div className="text-[11px] font-semibold text-[var(--text-main)]">100% Free</div>
          <div className="text-[10px] text-[var(--text-muted)]">No subscriptions</div>
        </div>
      </div>
    </div>
  );
};
