import { Metadata } from 'next';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { LeetMapLogo } from '@/components/LeetMapLogo';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 relative selection:bg-[var(--text-main)]/10 overflow-x-hidden">
      {/* Ambient specular light glow for Apple glass refraction */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-indigo-500/15 rounded-full blur-[140px] opacity-75 dark:opacity-35" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-emerald-400/15 rounded-full blur-[120px] opacity-60 dark:opacity-20" />
      </div>

      {/* Floating Apple-style Top Bar */}
      <header className="fixed top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-30 pointer-events-none">
        <Link
          href="/"
          className="apple-press pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--border)] text-xs font-medium text-[var(--text-main)] shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to LeetMap Pro</span>
        </Link>
        <Link
          href="/"
          aria-label="Close and return to home"
          className="apple-press pointer-events-auto w-8 h-8 rounded-full bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--border)] inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-sm transition-all"
        >
          <X className="w-4 h-4" />
        </Link>
      </header>

      {/* Apple-style minimalist brand anchor */}
      <Link
        href="/"
        aria-label="Back to LeetMap Pro"
        className="apple-press inline-flex items-center gap-2.5 mb-6 hover:opacity-80 transition-opacity pt-12 sm:pt-0 z-10"
      >
        <div className="p-2 rounded-2xl bg-[var(--bg-card)]/60 border border-[var(--border)] backdrop-blur-xl shadow-xs">
          <LeetMapLogo size={28} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-[var(--text-main)]">LeetMap Pro</span>
      </Link>

      {/* Minimalist Glassmorphic Card Container */}
      <div className="w-full max-w-[390px] apple-auth-container apple-enter z-10">
        <div className="apple-glass-card">
          <SignIn
            signUpUrl="/sign-up"
            appearance={{
              variables: {
                colorPrimary: '#10b981',
                borderRadius: '0.875rem',
              },
            }}
          />
        </div>
      </div>

      {/* Continue as guest escape hatch */}
      <div className="mt-5 text-center z-10">
        <Link
          href="/"
          className="apple-press text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1.5 font-medium py-1.5 px-3.5 rounded-full bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)] border border-[var(--border)] backdrop-blur-md"
        >
          <span>Continue browsing as guest</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Apple-style minimalist legal footer */}
      <div className="mt-6 flex items-center gap-3 text-[11px] text-[var(--text-muted)]/70 font-normal z-10">
        <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
        <span>·</span>
        <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
      </div>
    </div>
  );
}
