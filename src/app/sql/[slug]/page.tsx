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
  const title = `${company.name} SQL Interview Questions (${sqlCount} LeetCode Problems)`;
  const description = `Practice ${sqlCount} company-wise ${company.name} LeetCode SQL and database interview questions asked in technical interviews, ranked by real frequency and recency free on LeetMap Pro.`;

  return {
    title,
    description,
    keywords: [
      `${company.name} SQL interview questions`,
      `${company.name} leetcode sql`,
      `${company.name} database questions`,
      `company wise sql questions`,
      `company wise leetcode sql ${company.name}`,
      'SQL interview practice',
      'leetcode sql frequency',
      'SQL leetcode company wise',
      `${company.name} data engineer sql`,
      `${company.name} data analyst sql`,
    ],
    alternates: {
      canonical: `https://www.leetmap-pro.com/sql/${safeSlug}`,
    },
    openGraph: {
      title: `${company.name} SQL Interview Questions (${sqlCount} Problems) | LeetMap Pro`,
      description,
      url: `https://www.leetmap-pro.com/sql/${safeSlug}`,
      type: 'article',
      siteName: 'LeetMap Pro',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} SQL Interview Questions (${sqlCount} Problems) | LeetMap Pro`,
      description,
    },
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

  const allProblems = company.windows?.find((w) => w.key === 'all')?.problems || [];
  const sqlProblems = allProblems.filter((p) => p.isSql).slice(0, 20);
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${company.name} SQL Interview Questions`,
    description: `Curated SQL database interview questions asked at ${company.name}`,
    numberOfItems: sqlProblems.length,
    itemListElement: sqlProblems.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.title,
      url: `https://leetcode.com/problems/${p.slug}`,
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What SQL questions are asked in ${company.name} interviews?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Technical interviews at ${company.name} cover ${sqlProblems.length} curated SQL and relational database queries, including joins, window functions, aggregations, and subqueries.`,
        },
      },
      {
        '@type': 'Question',
        name: `Are SQL questions common for software engineers and data analysts at ${company.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, data engineers, backend engineers, business intelligence analysts, and data scientists at ${company.name} are routinely tested on real-world database query problems.`,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd, faqJsonLd]) }}
      />
      <Header syncStatus={syncStatus} />
      <main className="flex-1 pb-16">
        <SqlCompanyDetailView company={company} />
      </main>
    </div>
  );
}
