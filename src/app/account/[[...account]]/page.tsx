'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { ArrowLeft, Shield } from 'lucide-react';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="apple-press inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to LeetMap Pro</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted &amp; Privacy-First</span>
          </div>
        </div>

        {/* UserProfile Component */}
        <div className="flex justify-center pb-12">
          <SignedIn>
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
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn redirectUrl="/account" />
          </SignedOut>
        </div>
      </main>
    </div>
  );
}
