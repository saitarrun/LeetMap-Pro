import { Metadata } from 'next';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { LeetMapLogo } from '@/components/LeetMapLogo';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign Up',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 relative selection:bg-[var(--text-main)]/10">
      {/* Floating Apple-style Top Bar with Back and Close affordances */}
      <header className="fixed top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-30 pointer-events-none">
        <Link
          href="/"
          className="apple-press pointer-events-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--bg-card)]/85 hover:bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] text-xs font-medium text-[var(--text-main)] shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to LeetMap Pro</span>
        </Link>
        <Link
          href="/"
          aria-label="Close and return to home"
          className="apple-press pointer-events-auto w-9 h-9 rounded-full bg-[var(--bg-card)]/85 hover:bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-sm transition-all"
        >
          <X className="w-4 h-4" />
        </Link>
      </header>

      {/* Apple-style minimalist brand anchor */}
      <Link
        href="/"
        aria-label="Back to LeetMap Pro"
        className="apple-press inline-flex items-center gap-2.5 mb-6 hover:opacity-80 transition-opacity pt-12 sm:pt-0"
      >
        <LeetMapLogo size={32} />
        <span className="text-sm font-semibold tracking-tight text-[var(--text-main)]">LeetMap Pro</span>
      </Link>

      {/* Clerk Card with Apple Design System */}
      <div className="w-full max-w-[390px] apple-enter">
        <SignUp
          signInUrl="/sign-in"
          appearance={{
            variables: {
              colorPrimary: '#10b981',
              borderRadius: '0.875rem',
            },
            elements: {
              rootBox: 'mx-auto w-full max-w-[390px]',
              cardBox: 'w-full shadow-none',
              card: 'rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] p-7 sm:p-8',
              headerTitle: 'text-xl font-semibold tracking-tight text-[var(--text-main)]',
              headerSubtitle: 'text-xs text-[var(--text-muted)] mt-1 font-normal',
              socialButtonsBlockButton: 'apple-press rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] text-xs font-medium transition-all duration-150 h-11 w-full',
              socialButtonsBlockButtonText: 'text-xs font-medium text-[var(--text-main)]',
              formButtonPrimary: 'apple-press rounded-xl bg-[var(--text-main)] text-[var(--bg-page)] text-xs font-semibold h-11 hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-xs w-full cursor-pointer',
              formFieldInput: 'rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-150 h-11 px-3.5 w-full outline-none',
              formFieldLabel: 'text-xs font-medium text-[var(--text-main)] mb-1',
              footerActionLink: 'text-emerald-600 dark:text-emerald-400 font-medium hover:underline text-xs',
              footerActionText: 'text-xs text-[var(--text-muted)]',
              identityPreview: 'rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3',
              identityPreviewText: 'text-xs font-medium text-[var(--text-main)]',
              identityPreviewEditButton: 'text-xs text-emerald-600 dark:text-emerald-400 hover:underline',
              formFieldAction: 'text-xs text-emerald-600 dark:text-emerald-400 hover:underline',
              dividerRow: 'my-5',
              dividerLine: 'bg-[var(--border)]',
              dividerText: 'text-[11px] text-[var(--text-muted)] font-normal uppercase tracking-wider',
              footer: 'mt-6 pt-4 border-t border-[var(--border)]/60',
              formFieldErrorText: 'text-xs text-rose-500 mt-1',
              alert: 'rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs p-3',
            },
          }}
        />
      </div>

      {/* Continue as guest escape hatch */}
      <div className="mt-5 text-center">
        <Link
          href="/"
          className="apple-press text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1.5 font-medium py-1.5 px-3 rounded-full hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border)]"
        >
          <span>Continue browsing as guest</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Apple-style minimalist legal footer */}
      <div className="mt-6 flex items-center gap-3 text-[11px] text-[var(--text-muted)]/70 font-normal">
        <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
        <span>·</span>
        <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
      </div>
    </div>
  );
}
