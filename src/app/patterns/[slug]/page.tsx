import React from 'react';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { PatternDetail, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { PatternDetailView } from '@/components/PatternDetailView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const filePath = path.join(process.cwd(), 'public', 'data', 'patterns', `${safeSlug}.json`);

  if (!fs.existsSync(filePath)) {
    return { title: 'Pattern Not Found — GrindMap Pro' };
  }

  const pattern: PatternDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return {
    title: `${pattern.name} Pattern (${pattern.total} Interview Questions) — GrindMap Pro`,
    description: `${pattern.tagline}. Master ${pattern.total} LeetCode problems in the ${pattern.name} pattern asked by top tech firms.`,
  };
}

export default async function PatternDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const filePath = path.join(process.cwd(), 'public', 'data', 'patterns', `${safeSlug}.json`);
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const pattern: PatternDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));

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
        <PatternDetailView pattern={pattern} />
      </main>
    </div>
  );
}
