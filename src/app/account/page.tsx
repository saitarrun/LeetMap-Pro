'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile, Show, RedirectToSignIn, ClerkLoading, ClerkLoaded } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { ArrowLeft, Shield, Sparkles } from 'lucide-react';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="apple-press inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to LeetMap Pro</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium">Encrypted &amp; Privacy-First</span>
          </div>
        </div>

        {/* Loading state skeleton */}
        <ClerkLoading>
          <div className="w-full max-w-3xl mx-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-sm animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-subtle)]" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-40 rounded bg-[var(--bg-subtle)]" />
                <div className="h-3 w-56 rounded bg-[var(--bg-subtle)]" />
              </div>
            </div>
            <div className="h-px bg-[var(--border)]" />
            <div className="space-y-4">
              <div className="h-4 w-32 rounded bg-[var(--bg-subtle)]" />
              <div className="h-10 w-full rounded-xl bg-[var(--bg-subtle)]" />
              <div className="h-10 w-full rounded-xl bg-[var(--bg-subtle)]" />
            </div>
          </div>
        </ClerkLoading>

        {/* UserProfile Component */}
        <ClerkLoaded>
          <div className="flex justify-center pb-12">
            <Show when="signed-in">
              <UserProfile
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: 'w-full max-w-3xl',
                    cardBox: 'w-full shadow-none border border-[var(--border)] rounded-2xl bg-[var(--bg-card)]',
                    navbar: 'border-r border-[var(--border)]',
                    navbarMobileMenuButton: 'text-[var(--text-main)]',
                    headerTitle: 'text-[var(--text-main)] font-bold',
                    headerSubtitle: 'text-[var(--text-muted)]',
                    profileSectionTitleText: 'text-[var(--text-main)] font-semibold',
                    userPreviewSecondaryIdentifier: 'text-[var(--text-muted)]',
                  },
                }}
              />
            </Show>
            <Show when="signed-out">
              <RedirectToSignIn redirectUrl="/account" />
            </Show>
          </div>
        </ClerkLoaded>
      </main>
    </div>
  );
}
