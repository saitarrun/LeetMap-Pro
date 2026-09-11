import React from 'react';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { CompanyDetail, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { CompanyDetailView } from '@/components/CompanyDetailView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const filePath = path.join(process.cwd(), 'public', 'data', 'companies', `${safeSlug}.json`);

  if (!fs.existsSync(filePath)) {
    return { title: 'Company Not Found' };
  }

  const company: CompanyDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const title = `${company.name} LeetCode Questions (${company.total} Most Frequent)`;
  const description = `Practice ${company.total} interview problems asked in ${company.name} technical interviews, ranked by real frequency: ${company.easy} Easy, ${company.medium} Medium, ${company.hard} Hard. Filter by 30 days, 3 months, 6 months recency.`;

  return {
    title,
    description,
    keywords: [
      `${company.name} LeetCode questions`,
      `${company.name} interview questions`,
      `${company.name} coding interview`,
      `${company.name} most asked leetcode`,
      `${company.name} software engineer interview`,
    ],
    alternates: {
      canonical: `/company/${safeSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `/company/${safeSlug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function CompanyPage({ params }: PageProps) {
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
    syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header syncStatus={syncStatus} />
      <main className="flex-1 pb-16">
        <CompanyDetailView company={company} />
      </main>
    </div>
  );
}
