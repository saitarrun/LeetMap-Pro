import { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Sign Up',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4">
      <SignUp
        signInUrl="/sign-in"
        appearance={{
          variables: {
            colorPrimary: '#10b981',
          },
          elements: {
            rootBox: 'mx-auto w-full max-w-[420px]',
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
  );
}
