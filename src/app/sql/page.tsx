import React from 'react';
import fs from 'fs';
import path from 'path';
import { SqlCatalog, SyncStatus } from '@/types';
import { Header } from '@/components/Header';
import { SqlExplorerView } from '@/components/SqlExplorerView';

export const metadata = {
  title: 'Top Company SQL Questions — GrindMap Pro',
  description: 'Practice 190+ LeetCode SQL and Database interview questions asked by top tech firms (Google, Amazon, Meta, Microsoft, Uber, etc.), ranked by interview frequency.',
};

export default async function SqlPage() {
  const sqlPath = path.join(process.cwd(), 'public', 'data', 'sql-problems.json');
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
        <SqlExplorerView catalog={catalog} />
      </main>
    </div>
  );
}
