import React from 'react';
import path from 'path';
import fs from 'fs';
import { SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Scale,
  ShieldAlert,
  Award,
  Share2,
  HelpCircle,
  Flame,
} from 'lucide-react';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service and legal disclosures for using LeetMap Pro, an open-source technical interview preparation and frequency explorer.',
  alternates: {
    canonical: 'https://www.leetmap-pro.com/terms',
  },
  openGraph: {
    title: 'Terms of Service | LeetMap Pro',
    description: 'Terms of Service and legal disclosures for using LeetMap Pro, an open-source technical interview preparation and frequency explorer.',
    url: 'https://www.leetmap-pro.com/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | LeetMap Pro',
    description: 'Terms of Service and legal disclosures for using LeetMap Pro.',
  },
};

const termsBreadcrumbJsonLd = {
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
      name: 'Terms of Service',
      item: 'https://www.leetmap-pro.com/terms',
    },
  ],
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

  const lastUpdated = 'September 12, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-main)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsBreadcrumbJsonLd) }}
      />
      <Header syncStatus={syncStatus} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Disclosures & User Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Last updated: {lastUpdated} · Effective immediately upon access
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-[var(--text-muted)]">
          {/* Section 1 */}
          <section className="space-y-3 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>1. Agreement to Terms</h2>
            </div>
            <p>
              By accessing, browsing, or utilizing LeetMap Pro (<code className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-xs font-mono">www.leetmap-pro.com</code>, its subdomains, or affiliated software services), you enter into a binding agreement with the operators and maintainers of LeetMap Pro (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) and agree to comply with these Terms of Service. If you disagree with any portion of these terms, your sole remedy is to cease using the platform immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Scale className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>2. Purpose & Educational Disclaimer</h2>
            </div>
            <p>
              LeetMap Pro is an independent, open-source educational platform engineered to help software engineers study data structures, algorithms (DSA), and SQL interview patterns.
            </p>
            <p>
              All problem frequencies, recency indices, topic classifications, and company associations are aggregated from community reports, candidate submissions, and publicly available historical repositories. <strong>We do not guarantee that any specific question, pattern, or problem will appear in any current or upcoming technical interview.</strong> Technical hiring processes change frequently at each individual firm&apos;s discretion.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Award className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>3. Third-Party Trademarks & Nominative Fair Use</h2>
            </div>
            <p>
              We operate with strict respect for the intellectual property rights of third parties:
            </p>
            <ul className="list-disc pl-5 space-y-2.5">
              <li>
                <strong className="text-[var(--text-main)]">LeetCode:</strong> LeetCode is a registered trademark of LeetCode LLC. LeetMap Pro is an independent community study interface and is not affiliated with, authorized by, maintained, sponsored, or endorsed by LeetCode LLC or any of its affiliates. All links to problem statements route users directly to the original, official problem pages on leetcode.com.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Company Trademarks & Brand Assets:</strong> All company names, firm logos, brand icons, and registered marks (e.g., Google, Meta, Amazon, Apple, Microsoft, Bloomberg, Citadel, Jane Street, Stripe, Uber, and others) displayed on this website are the property of their respective trademark holders.
              </li>
              <li>
                <strong className="text-[var(--text-main)]">Nominative Fair Use:</strong> Company names and visual brand identifiers are utilized solely under the doctrine of nominative fair use to accurately identify and describe the historical focus of community-reported interview technical evaluations. Use of these names and marks does not imply any sponsorship, affiliation, partnership, or endorsement by the trademark holders.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <Share2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>4. Public Profiles & User-Generated Sharing</h2>
            </div>
            <p>
              LeetMap Pro offers optional authenticated features allowing users to track solved problems, streaks, and prep levels, and to generate public profile pages (<code className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-xs font-mono">/u/[username]</code>) and Markdown README badges:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                By sharing your public profile URL or embedding a profile badge, you acknowledge that your chosen display name, username, prep level, solved counts, and study activity heatmap are made publicly viewable to anyone with the link.
              </li>
              <li>
                Prep levels (e.g., &ldquo;Foundation,&rdquo; &ldquo;Competitor,&rdquo; &ldquo;Onsite Ready,&rdquo; &ldquo;Staff Bar&rdquo;) are motivational gamification milestones based on personal solved counts and do not constitute professional certifications, job guarantees, or verified endorsements of candidate competence.
              </li>
              <li>
                You may revoke or reset your activity at any time by clearing your progress or deleting your account.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <ShieldAlert className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>5. Acceptable Conduct & System Integrity</h2>
            </div>
            <p>Users agree not to engage in any of the following prohibited actions:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Engage in abusive web scraping, automated rapid querying, or denial-of-service attempts that degrade edge availability for other learners.</li>
              <li>Attempt to bypass, compromise, or probe our authentication, access control, or rate-limiting layers.</li>
              <li>Use the platform or its public profiles to transmit spam, fraudulent misrepresentations, or malicious code.</li>
              <li>Misrepresent your identity or impersonate any person or entity in your profile username or account credentials.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>6. Disclaimer of Warranties & Limitation of Liability</h2>
            </div>
            <p className="uppercase text-xs font-semibold tracking-wider text-[var(--text-main)]">
              PLEASE READ THIS SECTION CAREFULLY AS IT LIMITS OUR LIABILITY:
            </p>
            <p>
              LEETMAP PRO AND ALL ASSOCIATED SERVICES, CODE, CONTENT, AND DATA ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, TITLE, OR NON-INFRINGEMENT.
            </p>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL LEETMAP PRO, ITS CREATORS, MAINTAINERS, CONTRIBUTORS, OR AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF EMPLOYMENT OPPORTUNITIES, INTERVIEW REJECTIONS, DATA LOSS, INTERRUPTION OF BUSINESS, OR FINANCIAL LOSSES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE. OUR TOTAL AGGREGATE LIABILITY UNDER ANY LEGAL THEORY SHALL NOT EXCEED ONE HUNDRED U.S. DOLLARS ($100.00 USD).
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[var(--text-main)] font-semibold text-base">
              <HelpCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2>7. DMCA & Intellectual Property Takedown Policy</h2>
            </div>
            <p>
              We expeditiously address notifications of claimed copyright or trademark infringement in accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512). If you believe that any material on LeetMap Pro infringes your rights, please submit a formal takedown request containing:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>Identification of the copyrighted work or trademark claimed to have been infringed.</li>
              <li>Identification of the specific material to be removed, including direct URLs.</li>
              <li>Your contact information (name, address, telephone number, and email address).</li>
              <li>A statement of good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement made under penalty of perjury that the information provided in the notice is accurate.</li>
            </ul>
            <p className="text-xs">
              Takedown notices may be submitted via GitHub issues or directly to our repository maintainer at{' '}
              <a
                href="https://github.com/saitarrun/LeetMap-Pro/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-medium underline hover:opacity-80"
              >
                github.com/saitarrun/LeetMap-Pro/issues
              </a>.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 pt-6 border-t border-[var(--border)]">
            <h2 className="text-[var(--text-main)] font-semibold text-base">8. Open Source License & Modifications</h2>
            <p>
              LeetMap Pro is open-source software distributed under the MIT license. We reserve the right to revise, update, or modify these Terms of Service at any time. Continued use of the platform following the posting of updated terms constitutes your binding acceptance of the changes.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
