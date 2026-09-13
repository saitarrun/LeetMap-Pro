import React from 'react';
import path from 'path';
import fs from 'fs';
import { SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  Cookie,
  UserX,
  Share2,
  Globe2,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how LeetMap Pro handles your data with privacy-first engineering, transparent local storage, and zero third-party ads.',
  alternates: {
    canonical: 'https://www.leetmap-pro.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | LeetMap Pro',
    description: 'Learn how LeetMap Pro handles your data with privacy-first engineering, transparent local storage, and zero third-party ads.',
    url: 'https://www.leetmap-pro.com/privacy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | LeetMap Pro',
    description: 'Learn how LeetMap Pro handles your data with privacy-first engineering.',
  },
};

const privacyBreadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.leetmap-pro.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Privacy Policy',
      item: 'https://www.leetmap-pro.com/privacy',
    },
  ],
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

  const lastUpdated = 'September 12, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-main)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyBreadcrumbJsonLd) }}
      />
      <Header syncStatus={syncStatus} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy-First Architecture & GDPR/CCPA Compliance</span>
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
          <section className="space-y-3 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <EyeOff className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>1. Our Core Promise: Zero Data Monetization</h2>
            </div>
            <p>
              LeetMap Pro was engineered by developers for developers. We believe software study tools should be distraction-free, lightning-fast, and completely transparent regarding privacy.
            </p>
            <p className="font-semibold text-[var(--text-main)]">
              We never sell, rent, monetize, trade, or broker your personal information or study habits to third-party advertisers, data aggregators, recruiting agencies, or commercial brokers.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Lock className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>2. Information We Process</h2>
            </div>
            <p>We process only the minimum information necessary to provide study tracking and collaborative tools:</p>
            <ul className="list-disc pl-5 space-y-2.5">
              <li>
                <strong className="text-[var(--text-main)]">Anonymous Local Progress (Default):</strong> You can use LeetMap Pro completely anonymously without creating an account. When signed out, your solved problem IDs, pinned companies, and active visual theme are saved strictly on your own device via <code className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-xs font-mono">localStorage</code>. This data never touches our servers.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Authentication Information (Optional):</strong> If you choose to sign in to synchronize your progress across multiple devices, authentication is powered securely by Clerk. We store your Clerk user identifier, username, display name, and avatar image. We never store, process, or have access to your passwords or sensitive authentication credentials.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Cloud Sync Progress:</strong> For signed-in users, solved problem slugs, timestamps, and pinned company lists are securely synchronized to our encrypted database to support multi-device continuation and streak tracking.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Transient Infrastructure Logs:</strong> When accessing our site, standard edge request metadata (such as IP address, browser user-agent, and requested route) is processed transiently by Vercel for routing, DDoS defense, and rate-limiting.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Share2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>3. Public Shareable Profiles & Social Dynamics</h2>
            </div>
            <p>
              Signed-in users may choose to generate and share a public profile URL (<code className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-xs font-mono">/u/[username]</code>) or embed an SVG/Markdown badge in their GitHub README or resume:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Public profiles display your public username, display name, avatar, prep level, total questions solved, current streak, and activity heatmap.
              </li>
              <li>
                Email addresses and private account credentials are <strong>never</strong> displayed on public profile pages or exposed in API endpoints.
              </li>
              <li>
                You control whether you distribute your public profile link. You can reset your progress or delete your account at any time.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Cookie className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>4. Cookies & Storage Policy</h2>
            </div>
            <p>
              LeetMap Pro utilizes strictly necessary, privacy-preserving storage mechanisms:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-main)]">Strictly Necessary Session Cookies:</strong> Managed by Clerk solely to keep you signed in securely across browser tabs.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Local Storage:</strong> Browser-side key-value pairs used to remember your theme preference (Dark/Light mode) and offline solved status.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">No Advertising or Behavioral Trackers:</strong> We do NOT employ third-party advertising cookies, cross-site trackers, Facebook Pixels, or invasive behavioral fingerprinting scripts.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Server className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>5. Subprocessors & Cloud Infrastructure</h2>
            </div>
            <p>
              We partner with industry-leading infrastructure providers that maintain strict SOC 2, ISO 27001, and GDPR compliance:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-main)]">Vercel Inc.:</strong> Global Edge Network hosting, compute execution, and DDoS mitigation.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Clerk Inc.:</strong> SOC 2 Type II certified user identity, encrypted authentication, and session security.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Globe2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>6. GDPR, CCPA/CPRA & Global Privacy Rights</h2>
            </div>
            <p>
              Depending on your jurisdiction (including the European Economic Area, the United Kingdom, and California), you possess statutory privacy rights:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-main)]">Right to Access & Portability:</strong> You may request a copy of the personal data associated with your account.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You have the absolute right to have all your data deleted from our systems.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Do Not Sell or Share My Information:</strong> Under the California Consumer Privacy Act (CCPA/CPRA), we confirm that we do not &ldquo;sell&rdquo; or &ldquo;share&rdquo; your personal information for cross-context behavioral advertising.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <UserX className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>7. How to Delete Your Data</h2>
            </div>
            <p>
              You maintain total autonomy over your data:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Anonymous Local Data:</strong> Clear your browser&apos;s site data or local storage for <code className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-xs font-mono">www.leetmap-pro.com</code> to immediately remove all stored data.
              </li>
              <li>
                <strong>Cloud Account & Progress:</strong> Click on your profile avatar in the header, select <strong>&ldquo;Manage Account&rdquo;</strong>, and choose <strong>&ldquo;Delete Account&rdquo;</strong>. This triggers immediate, permanent erasure of your user profile, solved history, and streak records across all databases.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Database className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>8. Children&apos;s Privacy (COPPA)</h2>
            </div>
            <p>
              LeetMap Pro is designed for software engineers, university students, and adult job seekers. We do not knowingly collect or solicit personal information from children under 13 years of age (or under 16 in certain jurisdictions). If we discover that personal data of a minor has been collected without parental consent, we will take immediate steps to delete the information.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 pt-6 border-t border-[var(--border)]">
            <h2 className="text-[var(--text-main)] font-semibold text-base">9. Contact & Inquiries</h2>
            <p>
              For any questions regarding this Privacy Policy, your data protection rights, or security reporting, please open an issue or pull request in our public{' '}
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
