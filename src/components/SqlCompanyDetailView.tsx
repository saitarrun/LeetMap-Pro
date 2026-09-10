'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Shuffle,
  CheckCircle2,
  ExternalLink,
  Download,
  ShieldCheck,
  Database,
  Code2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { CompanyDetail, Problem } from '@/types';
import { getSolvedProblems, toggleProblemSolved } from '@/utils/progress';

interface SqlCompanyDetailViewProps {
  company: CompanyDetail;
}

export const SqlCompanyDetailView: React.FC<SqlCompanyDetailViewProps> = ({ company }) => {
  const [activeTab, setActiveTab] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [hideSolved, setHideSolved] = useState(false);
  const [solvedSet, setSolvedSet] = useState<Set<string>>(new Set());

  const [sortBy, setSortBy] = useState<'frequency' | 'difficulty' | 'title' | 'acceptance' | 'id'>('frequency');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setSolvedSet(getSolvedProblems());

    const handleSolvedChange = () => {
      setSolvedSet(getSolvedProblems());
    };
    window.addEventListener('grindmap-solved-updated', handleSolvedChange);
    return () => window.removeEventListener('grindmap-solved-updated', handleSolvedChange);
  }, []);

  const handleToggleSolved = (prob: Problem) => {
    const solved = toggleProblemSolved(prob.slug);
    setSolvedSet(getSolvedProblems());

    if (solved) {
      toast.success(`Solved: ${prob.title}`, {
        description: `${prob.id ? `#${prob.id} · ` : ''}${prob.difficulty} SQL · Frequency ${prob.frequency.toFixed(0)}%`,
        action: {
          label: 'Undo',
          onClick: () => handleToggleSolved(prob),
        },
      });
    } else {
      toast('Unmarked SQL problem', {
        description: prob.title,
      });
    }
  };

  // Filter windows to only contain SQL problems
  const sqlWindows = useMemo(() => {
    return company.windows.map((w) => {
      const sqlProbs = w.problems.filter((p) => p.isSql || p.topics.includes('Database'));
      return {
        ...w,
        count: sqlProbs.length,
        problems: sqlProbs,
      };
    });
  }, [company.windows]);

  const currentWindow = sqlWindows[activeTab] || sqlWindows[sqlWindows.length - 1];
  const allProblems = currentWindow?.problems || [];

  const filteredProblems = useMemo(() => {
    return allProblems.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesId = p.id && p.id.includes(q);
        const matchesTopic = p.topics.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesId && !matchesTopic) return false;
      }
      if (difficultyFilter !== 'ALL' && p.difficulty !== difficultyFilter) {
        return false;
      }
      if (hideSolved && solvedSet.has(p.slug)) {
        return false;
      }
      return true;
    });
  }, [allProblems, searchQuery, difficultyFilter, hideSolved, solvedSet]);

  const sortedProblems = useMemo(() => {
    return [...filteredProblems].sort((a, b) => {
      let result = 0;
      if (sortBy === 'frequency') {
        result = a.frequency - b.frequency;
      } else if (sortBy === 'acceptance') {
        result = a.acceptance - b.acceptance;
      } else if (sortBy === 'id') {
        const idA = parseInt(a.id || '999999', 10);
        const idB = parseInt(b.id || '999999', 10);
        result = idA - idB;
      } else if (sortBy === 'difficulty') {
        const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
        result = (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
      } else if (sortBy === 'title') {
        result = a.title.localeCompare(b.title);
      }
      return sortDir === 'desc' ? -result : result;
    });
  }, [filteredProblems, sortBy, sortDir]);

  const handleSort = (column: 'frequency' | 'difficulty' | 'title' | 'acceptance' | 'id') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir(column === 'title' || column === 'id' ? 'asc' : 'desc');
    }
  };

  const handleRandomProblem = () => {
    if (sortedProblems.length === 0) return;
    const unsolved = sortedProblems.filter((p) => !solvedSet.has(p.slug));
    const pool = unsolved.length > 0 ? unsolved : sortedProblems;
    const random = pool[Math.floor(Math.random() * pool.length)];

    toast.info(`Random SQL problem selected`, {
      description: `${random.id ? `#${random.id} · ` : ''}${random.title}`,
    });
    window.open(random.link, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Difficulty', 'Frequency %', 'Acceptance %', 'Solved', 'Link'];
    const rows = sortedProblems.map((p) => {
      const accStr = p.acceptance > 0
        ? (p.acceptance <= 1 ? (p.acceptance * 100).toFixed(1) : p.acceptance.toFixed(1)) + '%'
        : '-';
      return [
        p.id || '',
        `"${p.title.replace(/"/g, '""')}"`,
        p.difficulty,
        p.frequency,
        accStr,
        solvedSet.has(p.slug) ? 'YES' : 'NO',
        p.link,
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${company.slug}-sql-questions-${currentWindow.key}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Downloaded SQL CSV', {
      description: `Exported ${sortedProblems.length} SQL questions for ${company.name}`,
    });
  };

  // Calculate total distinct SQL solved for this company
  const companySqlSolvedCount = useMemo(() => {
    const allSqlSlugs = new Set<string>();
    for (const w of sqlWindows) {
      for (const p of w.problems) {
        allSqlSlugs.add(p.slug);
      }
    }
    let count = 0;
    for (const s of allSqlSlugs) {
      if (solvedSet.has(s)) count++;
    }
    return count;
  }, [sqlWindows, solvedSet]);

  const totalSqlCount = company.sqlTotal || (sqlWindows[4]?.count ?? 0);
  const sqlEasy = company.sqlEasy ?? sqlWindows[4]?.problems.filter((p) => p.difficulty === 'EASY').length ?? 0;
  const sqlMed = company.sqlMedium ?? sqlWindows[4]?.problems.filter((p) => p.difficulty === 'MEDIUM').length ?? 0;
  const sqlHard = company.sqlHard ?? sqlWindows[4]?.problems.filter((p) => p.difficulty === 'HARD').length ?? 0;

  const initials = company.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const faviconUrl = company.domain
    ? `https://www.google.com/s2/favicons?sz=64&domain=${company.domain}`
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-normal flex-wrap">
        <Link href="/sql" className="apple-press hover:text-[var(--text-main)] flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All SQL Companies</span>
        </Link>
        <span>/</span>
        <span className="text-[var(--text-main)] font-medium">{company.name} SQL</span>
      </nav>

      {/* Header Info Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-black/5 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            {faviconUrl ? (
              <img src={faviconUrl} alt="" width={36} height={36} className="w-9 h-9 object-contain" />
            ) : (
              <span className="text-base font-bold text-stone-700">{initials}</span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
                {company.name} SQL Questions
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
                <Database className="w-3 h-3 opacity-70" />
                <span>{totalSqlCount} SQL Questions</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Multi-Source Verified</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--diff-easy-text)]">{sqlEasy} Easy</span>
              <span>•</span>
              <span className="font-semibold text-[var(--diff-medium-text)]">{sqlMed} Medium</span>
              <span>•</span>
              <span className="font-semibold text-[var(--diff-hard-text)]">{sqlHard} Hard</span>
            </div>

            {/* Track Switcher Pill */}
            <div className="flex items-center p-0.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs font-semibold mt-2.5 self-start w-fit">
              <Link
                href={`/company/${company.slug}`}
                className="apple-press px-3 py-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5 font-medium"
              >
                <Code2 className="w-3.5 h-3.5 opacity-70" />
                <span>DSA ({company.total - totalSqlCount})</span>
              </Link>
              <span className="px-3 py-1 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 opacity-80" />
                <span>SQL ({totalSqlCount})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="flex items-center gap-3 bg-[var(--bg-subtle)] border border-[var(--border)] px-4 py-2.5 rounded-2xl self-start md:self-auto">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-[var(--text-main)]">
              {companySqlSolvedCount} / {totalSqlCount} solved
            </div>
            <div className="w-28 h-1.5 bg-[var(--border)] rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${totalSqlCount ? Math.min(100, (companySqlSolvedCount / totalSqlCount) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recency Tabs for SQL */}
      <div className="border-b border-[var(--border)] flex gap-1.5 overflow-x-auto pb-px scrollbar-none">
        {sqlWindows.map((win, idx) => (
          <button
            key={win.key}
            onClick={() => setActiveTab(idx)}
            className={`apple-press flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === idx
                ? 'border-[var(--text-main)] text-[var(--text-main)] font-semibold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <span>{win.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === idx
                  ? 'bg-[var(--text-main)] text-[var(--bg-card)] font-semibold'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {win.count}
            </span>
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${company.name} SQL questions (#176, Second Highest...)`}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none focus:border-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--border)]/40 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Filter */}
          <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-xs">
            {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`apple-press px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                  difficultyFilter === diff
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] shadow-xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {diff === 'ALL' ? 'All' : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Random SQL */}
          <button
            onClick={handleRandomProblem}
            className="apple-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-main)] shadow-2xs cursor-pointer"
            title="Open a random SQL problem in LeetCode"
          >
            <Shuffle className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Random SQL</span>
          </button>

          {/* Hide Solved */}
          <button
            onClick={() => setHideSolved(!hideSolved)}
            className={`apple-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
              hideSolved
                ? 'border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold shadow-xs'
                : 'border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] shadow-2xs'
            }`}
            title="Hide problems you already solved"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hide solved</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="apple-press p-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-2xs cursor-pointer"
            title="Export SQL list to CSV"
            aria-label="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SQL Table */}
      <div className="border border-[var(--border)] rounded-3xl bg-[var(--bg-card)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)]/70 text-[var(--text-muted)] font-medium">
                <th className="py-3 px-4 w-12 text-center" aria-label="Solved">✓</th>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 w-16 text-center cursor-pointer hover:text-[var(--text-main)] select-none"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>#ID</span>
                    {sortBy === 'id' && (sortDir === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-main)] select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>SQL Problem</span>
                    {sortBy === 'title' && (sortDir === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('difficulty')}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-main)] select-none w-28"
                >
                  <div className="flex items-center gap-1">
                    <span>Difficulty</span>
                    {sortBy === 'difficulty' && (sortDir === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('frequency')}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-main)] select-none w-48"
                >
                  <div className="flex items-center gap-1">
                    <span>Frequency</span>
                    {sortBy === 'frequency' && (sortDir === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('acceptance')}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-main)] select-none w-24 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Acceptance</span>
                    {sortBy === 'acceptance' && (sortDir === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sortedProblems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                    No SQL problems match your criteria for this time window.
                  </td>
                </tr>
              ) : (
                sortedProblems.map((prob) => {
                  const isSolved = solvedSet.has(prob.slug);
                  const accPercent = prob.acceptance > 0
                    ? (prob.acceptance <= 1 ? (prob.acceptance * 100).toFixed(1) : prob.acceptance.toFixed(1)) + '%'
                    : '-';
                  const freq = Math.min(100, Math.max(0, prob.frequency));

                  let diffColorClass = 'text-[var(--diff-easy-text)] bg-[var(--diff-easy-bg)]';
                  if (prob.difficulty === 'MEDIUM') {
                    diffColorClass = 'text-[var(--diff-medium-text)] bg-[var(--diff-medium-bg)]';
                  } else if (prob.difficulty === 'HARD') {
                    diffColorClass = 'text-[var(--diff-hard-text)] bg-[var(--diff-hard-bg)]';
                  }

                  return (
                    <tr
                      key={prob.slug || prob.title}
                      className={`hover:bg-[var(--bg-hover)] transition-colors group ${
                        isSolved ? 'opacity-65 bg-emerald-500/[0.02]' : ''
                      }`}
                    >
                      {/* Solved Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSolved(prob)}
                          className={`apple-press w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                            isSolved
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-[var(--border)] hover:border-emerald-500'
                          }`}
                          aria-label={`Mark ${prob.title} as ${isSolved ? 'unsolved' : 'solved'}`}
                        >
                          {isSolved && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Problem ID */}
                      <td className="py-3 px-3 text-center text-[var(--text-light)] text-[11px] font-mono">
                        {prob.id ? `#${prob.id}` : '-'}
                      </td>

                      {/* Title & Topics */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <a
                              href={prob.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 font-medium hover:text-[var(--text-main)] hover:underline transition-colors ${
                                isSolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'
                              }`}
                            >
                              <span>{prob.title}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </a>

                            {prob.verifiedSources && prob.verifiedSources.length > 1 && (
                              <span
                                className="text-[9px] px-1.5 py-0.2 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] font-mono border border-[var(--border)]"
                                title={`Verified across: ${prob.verifiedSources.join(', ')}`}
                              >
                                {prob.verifiedSources.length} sources
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${diffColorClass}`}>
                          {prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Frequency Bar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--text-main)]/60 transition-all duration-300"
                              style={{ width: `${freq}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-[var(--text-muted)] w-10 text-right">
                            {freq.toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Acceptance */}
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                        {accPercent}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="py-3 px-5 border-t border-[var(--border)] bg-[var(--bg-subtle)]/40 text-xs text-[var(--text-muted)] flex items-center justify-between">
          <span>Showing <strong>{sortedProblems.length}</strong> of {allProblems.length} SQL questions in {currentWindow.name}</span>
          <span>Company Total: {totalSqlCount} SQL questions</span>
        </div>
      </div>
    </div>
  );
};
