import React from 'react';
import path from 'path';
import fs from 'fs';
import { SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { ShieldCheck, Lock, EyeOff, Server, Cookie, UserX } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how LeetMap Pro handles your data with privacy-first engineering, transparent local storage, and zero third-party ads.',
  alternates: {
    canonical: 'https://leetmap-pro.vercel.app/privacy',
  },
};

export default function PrivacyPage() {
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');
  let syncStatus: SyncStatus | null = null;
  if (fs.existsSync(statusPath)) {
    try {
      syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    } catch {
      syncStatus = null;
    }
  }

  const lastUpdated = 'September 11, 2025';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)]">
      <Header syncStatus={syncStatus} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy-First Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Last updated: {lastUpdated} · Effective immediately
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-[var(--text-muted)]">
          {/* Section 1 */}
          <section className="space-y-3 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <EyeOff className="w-5 h-5 text-emerald-500" />
              <h2>1. Our Privacy Philosophy: Zero Data Monetization</h2>
            </div>
            <p>
              LeetMap Pro was built by engineers, for engineers. We believe software interview preparation tools should be fast, uncluttered, and respect your privacy.
            </p>
            <p className="font-medium text-[var(--text-main)]">
              We do not sell, rent, monetize, or broker your personal data to advertisers, data brokers, or recruiters.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Lock className="w-5 h-5 text-emerald-500" />
              <h2>2. Information We Collect</h2>
            </div>
            <p>We collect only the minimum data required to deliver the core service:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-main)]">Authentication Data (Optional):</strong> If you choose to sign in to sync your progress across devices, we use Clerk for secure identity management. We receive your verified email address and account ID. We never have access to your passwords.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Solved Problems & Pinned Companies:</strong> Your problem checkmarks and pinned company preferences are saved locally in your browser (<code className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-xs font-mono">localStorage</code>). When signed in, this data is synchronized to our encrypted database so you can access it on other devices.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Technical Diagnostics:</strong> Standard HTTP request data (IP address, browser type, referring URL) processed transiently by Vercel for routing and DDoS mitigation.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Cookie className="w-5 h-5 text-emerald-500" />
              <h2>3. Cookies & Local Storage</h2>
            </div>
            <p>
              We use strictly necessary cookies and local storage tokens:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-main)]">Local Storage:</strong> Used to store your active theme (dark/light) and solved problem IDs locally.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Session Cookies:</strong> Provided by Clerk to maintain your authenticated session securely. We do not use third-party tracking cookies or advertising pixels.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Server className="w-5 h-5 text-emerald-500" />
              <h2>4. Infrastructure & Service Providers</h2>
            </div>
            <p>
              LeetMap Pro relies on vetted, enterprise-grade cloud providers that uphold rigorous data protection standards:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-[var(--text-main)]">Vercel:</strong> Global edge hosting, serverless functions, and static content delivery.</li>
              <li><strong className="text-[var(--text-main)]">Clerk:</strong> SOC 2 Type II certified user authentication and credential security.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <UserX className="w-5 h-5 text-emerald-500" />
              <h2>5. Your Rights & Data Deletion</h2>
            </div>
            <p>
              You maintain complete ownership of your learning progress:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You can reset your solved problems at any time by clearing your browser cache or clicking &ldquo;Reset Progress&rdquo; in your user profile.</li>
              <li>You can delete your Clerk account at any time, which permanently purges your user profile and stored progress records from our database.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border)]">
            <h2 className="text-[var(--text-main)] font-semibold text-base">6. Contact Us</h2>
            <p>
              If you have questions, feedback, or security inquiries regarding this policy, feel free to open an issue or pull request on our public{' '}
              <a
                href="https://github.com/saitarrun/LeetMap-Pro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-medium underline hover:opacity-80"
              >
                GitHub repository
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
