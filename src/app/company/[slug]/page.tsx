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
      canonical: `https://leetmap-pro.vercel.app/company/${safeSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://leetmap-pro.vercel.app/company/${safeSlug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  try {
    const companiesPath = path.join(process.cwd(), 'public', 'data', 'companies.json');
    if (fs.existsSync(companiesPath)) {
      const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
      return companies.slice(0, 50).map((c: { slug: string }) => ({
        slug: c.slug,
      }));
    }
  } catch (error) {
    console.error('Failed to generate static params for companies', error);
  }
  return [];
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://leetmap-pro.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Companies',
        item: 'https://leetmap-pro.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${company.name} LeetCode Questions`,
        item: `https://leetmap-pro.vercel.app/company/${safeSlug}`,
      },
    ],
  };

  const topProblems = (company.windows?.find((w) => w.key === 'all')?.problems || []).slice(0, 20);
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${company.name} Most Frequent Interview Questions`,
    description: `Curated coding interview questions asked at ${company.name}`,
    numberOfItems: topProblems.length,
    itemListElement: topProblems.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.title,
      url: `https://leetcode.com/problems/${p.slug}`,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd]) }}
      />
      <Header syncStatus={syncStatus} />
      <main className="flex-1 pb-16">
        <CompanyDetailView company={company} />
      </main>
    </div>
  );
}
