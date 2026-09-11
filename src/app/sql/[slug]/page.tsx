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
  const title = `${company.name} LeetCode SQL Questions (${sqlCount} Asked)`;
  const description = `Practice ${sqlCount} LeetCode SQL and database interview questions asked in ${company.name} data science and software engineering interviews, ranked by frequency and recency.`;

  return {
    title,
    description,
    keywords: [
      `${company.name} SQL interview questions`,
      `${company.name} leetcode sql`,
      `${company.name} database questions`,
      'SQL interview practice',
      'leetcode sql frequency',
    ],
    alternates: {
      canonical: `/sql/${safeSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `/sql/${safeSlug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header syncStatus={syncStatus} />
      <main className="flex-1 pb-16">
        <SqlCompanyDetailView company={company} />
      </main>
    </div>
  );
}
