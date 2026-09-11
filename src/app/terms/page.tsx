import React from 'react';
import path from 'path';
import fs from 'fs';
import { SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { FileText, CheckCircle2, AlertCircle, Scale, ShieldAlert, Award } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service',
  description: 'Review the terms and conditions for using LeetMap Pro, an open-source technical interview preparation and frequency explorer.',
  alternates: {
    canonical: 'https://leetmap-pro.vercel.app/terms',
  },
};

export default function TermsPage() {
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
            <FileText className="w-3.5 h-3.5" />
            <span>Legal & Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Last updated: {lastUpdated} · Effective immediately
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-[var(--text-muted)]">
          {/* Section 1 */}
          <section className="space-y-3 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2>1. Agreement to Terms</h2>
            </div>
            <p>
              By accessing or using LeetMap Pro (<code className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-xs font-mono">leetmap-pro.vercel.app</code> or affiliated domains), you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue using the service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Scale className="w-5 h-5 text-emerald-500" />
              <h2>2. Purpose & Educational Use</h2>
            </div>
            <p>
              LeetMap Pro is an educational study platform created to assist software developers in identifying core data structures, algorithms, and SQL patterns commonly encountered during technical evaluations.
            </p>
            <p>
              All problem rankings, frequency metrics, and time-window aggregations are derived from community reports and historical data. We do not guarantee that any specific question will appear in any forthcoming interview.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Award className="w-5 h-5 text-emerald-500" />
              <h2>3. Third-Party Trademarks & Attribution</h2>
            </div>
            <p>
              We deeply respect the intellectual property of others:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-main)]">LeetCode:</strong> LeetCode is a registered trademark of LeetCode LLC. LeetMap Pro is an independent open-source project and is not affiliated with, sponsored by, or endorsed by LeetCode LLC. All problem links direct users to official LeetCode problem statements.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Company Trademarks:</strong> Trademarks, logos, company names (such as Google, Meta, Amazon, Apple, Microsoft, Bloomberg, Citadel, etc.) referenced on this website are the property of their respective owners. Their mention constitutes nominative fair use to describe the historical focus of technical interviews.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <ShieldAlert className="w-5 h-5 text-emerald-500" />
              <h2>4. Acceptable Conduct</h2>
            </div>
            <p>When utilizing our service, you agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Deploy automated spiders or bots to overburden our edge infrastructure or conduct denial-of-service attacks.</li>
              <li>Attempt to probe, reverse engineer, or breach authentication mechanisms managed by Clerk.</li>
              <li>Resell, commercialize, or re-package our curated datasets without appropriate open-source attribution.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <AlertCircle className="w-5 h-5 text-emerald-500" />
              <h2>5. Disclaimer of Warranties</h2>
            </div>
            <p>
              The platform and its contents are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied. We do not warrant that the service will be uninterrupted, error-free, or entirely up-to-date at all times.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border)]">
            <h2 className="text-[var(--text-main)] font-semibold text-base">6. Open Source & Contributions</h2>
            <p>
              LeetMap Pro is open-source software. Community contributions, bug fixes, and feature requests are welcome via our{' '}
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
