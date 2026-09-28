import React from 'react';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { CompanyDetail, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { SqlCompanyDetailView } from '@/components/SqlCompanyDetailView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const filePath = path.join(process.cwd(), 'public', 'data', 'companies', `${safeSlug}.json`);

  if (!fs.existsSync(filePath)) {
    return { title: 'Company SQL Questions Not Found' };
  }

  const company: CompanyDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const sqlCount = company.sqlTotal || 0;
  const title = `${company.name} SQL Questions`;
  const description = `Practice ${sqlCount} free company-wise ${company.name} LeetCode SQL and database interview questions asked in 2026 technical interviews, ranked by frequency and recency on LeetMap Pro.`;

  return {
    title,
    description,
    keywords: [
      `free ${company.name} sql questions`,
      `${company.name} SQL interview questions 2026`,
      `${company.name} leetcode sql`,
      `company wise sql questions by frequency`,
      `${company.name} database questions`,
      `company wise sql questions`,
      `company wise leetcode sql ${company.name}`,
      'SQL interview practice',
      'leetcode sql frequency 2026',
      'SQL leetcode company wise',
      `${company.name} data engineer sql`,
      `${company.name} data analyst sql`,
    ],
    alternates: {
      canonical: `https://www.leetmap-pro.com/sql/${safeSlug}`,
    },
    openGraph: {
      title: `${company.name} SQL Questions | LeetMap Pro`,
      description,
      url: `https://www.leetmap-pro.com/sql/${safeSlug}`,
      type: 'article',
      siteName: 'LeetMap Pro',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} SQL Questions | LeetMap Pro`,
      description,
    },
    robots: sqlCount <= 5
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  try {
    const sqlCompaniesPath = path.join(process.cwd(), 'public', 'data', 'sql-companies.json');
    if (fs.existsSync(sqlCompaniesPath)) {
      const companies = JSON.parse(fs.readFileSync(sqlCompaniesPath, 'utf8'));
      return companies.map((c: { slug: string }) => ({
        slug: c.slug,
      }));
    }
  } catch (error) {
    console.error('Failed to generate static params for SQL companies', error);
  }
  return [];
}

export default async function SqlCompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const filePath = path.join(process.cwd(), 'public', 'data', 'companies', `${safeSlug}.json`);
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const company: CompanyDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const sqlFilteredCompany: CompanyDetail = {
    ...company,
    windows: (company.windows || []).map((w) => ({
      ...w,
      problems: w.problems.filter((p) => p.isSql || p.topics?.includes('Database')),
    })),
  };

  let syncStatus: SyncStatus | null = null;
  if (fs.existsSync(statusPath)) {
    try {
      syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse sync-status.json', err);
    }
  }

  const breadcrumbJsonLd = {
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
        name: 'SQL Interview Hub',
        item: 'https://www.leetmap-pro.com/sql',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${company.name} SQL Questions`,
        item: `https://www.leetmap-pro.com/sql/${safeSlug}`,
      },
    ],
  };

  const faqItems = [
    {
      question: `What SQL questions are asked in ${company.name} interviews?`,
      answer: `Technical interviews at ${company.name} cover curated SQL and relational database queries, including joins, window functions, aggregations, and subqueries.`,
    },
    {
      question: `Are SQL questions common for software engineers and data analysts at ${company.name}?`,
      answer: `Data engineers, backend engineers, business intelligence analysts, and data scientists at ${company.name} may be tested on practical database query problems relevant to the role.`,
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
  };

  let allSqlCompanies: { slug: string; name: string; sqlTotal: number }[] = [];
  const sqlCompaniesPath = path.join(process.cwd(), 'public', 'data', 'sql-companies.json');
  if (fs.existsSync(sqlCompaniesPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(sqlCompaniesPath, 'utf8'));
      allSqlCompanies = raw.map((c: { slug: string; name: string; sqlTotal?: number }) => ({
        slug: c.slug,
        name: c.name,
        sqlTotal: c.sqlTotal || 0,
      }));
    } catch (err) {
      console.error('Failed to parse sql-companies.json', err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, faqJsonLd]) }}
      />
      <Header syncStatus={syncStatus} />
      <main className="flex-1 pb-16">
        <SqlCompanyDetailView company={sqlFilteredCompany} allSqlCompanies={allSqlCompanies} />
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-12 pt-10 border-t border-[var(--border)]" aria-labelledby="sql-faq-title">
          <h2 id="sql-faq-title" className="text-xl font-bold tracking-tight text-[var(--text-main)]">
            {company.name} SQL interview questions FAQ
          </h2>
          <div className="mt-5 grid gap-3">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/40 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-[var(--text-main)]">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
