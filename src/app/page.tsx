import React from 'react';
import fs from 'fs';
import path from 'path';
import { CompanySummary, SyncStatus, DailyChallenge } from '@/types';
import { HomeClient } from '@/components/HomeClient';

export const metadata = {
  title: 'LeetMap — Company Wise LeetCode Questions',
  description: 'Browse coding interview problems asked by 680+ tech companies, ranked by frequency and recency. Free, realtime sync.',
};

export default function HomePage() {
  const companiesPath = path.join(process.cwd(), 'public', 'data', 'companies.json');
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');
  const dailyPath = path.join(process.cwd(), 'public', 'data', 'daily-challenge.json');

  let companies: CompanySummary[] = [];
  if (fs.existsSync(companiesPath)) {
    companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
  }

  let syncStatus: SyncStatus | null = null;
  if (fs.existsSync(statusPath)) {
    syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  }

  let dailyChallenge: DailyChallenge | null = null;
  if (fs.existsSync(dailyPath)) {
    try {
      dailyChallenge = JSON.parse(fs.readFileSync(dailyPath, 'utf8'));
    } catch {
      dailyChallenge = null;
    }
  }

  return (
    <HomeClient
      initialCompanies={companies}
      initialSyncStatus={syncStatus}
      initialDailyChallenge={dailyChallenge}
    />
  );
}
