import { Metadata } from 'next';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { LeetMapLogo } from '@/components/LeetMapLogo';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
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
          <div className="text-center space-y-1.5 pt-2">
            <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs mb-1">
              <LeetMapLogo size={30} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Welcome to LeetMap Pro
            </h1>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-normal leading-relaxed">
              Sign in to sync your solved problems, track daily streaks, and customize your company roadmap.
            </p>
          </div>

          {/* Clerk SignIn with Apple aesthetic */}
          <div className="apple-enter">
            <SignIn
              appearance={{
                variables: {
                  colorPrimary: '#10b981',
                },
                elements: {
                  rootBox: 'mx-auto w-full',
                  cardBox: 'w-full shadow-none',
                  card: 'rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl p-6 sm:p-7',
                  headerTitle: 'text-base font-bold tracking-tight text-[var(--text-main)]',
                  headerSubtitle: 'text-xs text-[var(--text-muted)]',
                  socialButtonsBlockButton: 'apple-press rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] text-xs font-medium transition-colors py-2.5',
                  formButtonPrimary: 'apple-press rounded-xl bg-[var(--text-main)] text-[var(--bg-page)] text-xs font-semibold py-2.5 hover:opacity-90 transition-opacity shadow-xs',
                  formFieldInput: 'rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] text-sm focus:border-emerald-500 transition-colors',
                  footerActionLink: 'text-emerald-600 dark:text-emerald-400 font-medium hover:underline text-xs',
                  identityPreview: 'rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]',
                  formFieldLabel: 'text-xs font-medium text-[var(--text-main)]',
                  dividerLine: 'bg-[var(--border)]',
                  dividerText: 'text-xs text-[var(--text-muted)]',
                },
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
