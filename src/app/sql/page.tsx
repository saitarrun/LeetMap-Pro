import React from 'react';
import fs from 'fs';
import path from 'path';
import { SqlCatalog, SqlCompanySummary, SyncStatus } from '@/types';
import { SqlHubClient } from '@/components/SqlHubClient';

export const metadata = {
  title: 'Company-wise LeetCode SQL Questions — GrindMap Pro',
  description: 'Browse coding interview SQL questions asked by 73+ tech firms (Amazon, Google, Meta, Bloomberg, Microsoft, etc.), ranked by interview frequency and recency.',
};

export default async function SqlPage() {
  const sqlPath = path.join(process.cwd(), 'public', 'data', 'sql-problems.json');
  const companiesPath = path.join(process.cwd(), 'public', 'data', 'sql-companies.json');
  const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');

  let catalog: SqlCatalog = {
    totalSqlProblems: 0,
    lastUpdated: Date.now(),
    problems: [],
  };

  if (fs.existsSync(sqlPath)) {
    try {
      catalog = JSON.parse(fs.readFileSync(sqlPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse sql-problems.json', err);
    }
  }

  let companies: SqlCompanySummary[] = [];
  if (fs.existsSync(companiesPath)) {
    try {
      companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse sql-companies.json', err);
    }
  }

  let syncStatus: SyncStatus | null = null;
  if (fs.existsSync(statusPath)) {
    try {
      syncStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse sync-status.json', err);
    }
  }

  return (
    <SqlHubClient
      companies={companies}
      catalog={catalog}
      syncStatus={syncStatus}
    />
  );
}
