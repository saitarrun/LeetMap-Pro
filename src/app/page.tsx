import React from 'react';
import fs from 'fs';
import path from 'path';
import { CompanySummary, SyncStatus } from '@/types';
import { HomeClient } from '@/components/HomeClient';

export const metadata = {
  title: 'GrindMap Pro — Company Wise LeetCode Questions',
  description: 'Browse coding interview problems actually asked by 470+ tech companies, ranked by frequency and recency. Free, realtime sync.',
};

export default function HomePage() {
  const companiesPath = path.join(process.cwd(), 'public', 'data', 'companies.json');
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');

  let companies: CompanySummary[] = [];
  if (fs.existsSync(companiesPath)) {
    companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
  }

  let syncStatus: SyncStatus | null = null;
  if (fs.existsSync(statusPath)) {
    syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  }

  return <HomeClient initialCompanies={companies} initialSyncStatus={syncStatus} />;
}
