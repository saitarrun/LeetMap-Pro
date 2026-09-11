'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Database,
  Search,
  Shuffle,
  CheckCircle2,
  ExternalLink,
  Download,
  Building2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { SqlProblem, SqlCatalog } from '@/types';
import { toggleProblemSolved } from '@/utils/progress';
import { useSolvedProblems } from '@/utils/useSolvedProblems';
import { getLeetCodeProblemUrl } from '@/utils/urls';
import { downloadCsv } from '@/utils/csv';

interface SqlExplorerViewProps {
  catalog: SqlCatalog;
}

export const SqlExplorerView: React.FC<SqlExplorerViewProps> = ({ catalog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [hideSolved, setHideSolved] = useState(false);
  const solvedSet = useSolvedProblems();

  const [sortBy, setSortBy] = useState<'companiesCount' | 'difficulty' | 'title' | 'acceptance' | 'id'>('companiesCount');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleToggleSolved = (prob: SqlProblem) => {
    const solved = toggleProblemSolved(prob.slug, { title: prob.title, difficulty: prob.difficulty });

    if (solved) {
      toast.success(`Solved: ${prob.title}`, {
        description: `${prob.id ? `#${prob.id} · ` : ''}${prob.difficulty} SQL`,
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

  // Distinct companies present in SQL catalog with problem counts
  const companyOptions = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    for (const p of catalog.problems) {
      for (const c of p.companies) {
        if (!map[c.slug]) {
          map[c.slug] = { name: c.name, count: 0 };
        }
        map[c.slug].count++;
      }
    }
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [catalog.problems]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return catalog.problems.filter((p) => {
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
      if (selectedCompany !== 'ALL' && !p.companies.some((c) => c.slug === selectedCompany)) {
        return false;
      }
      if (hideSolved && solvedSet.has(p.slug)) {
        return false;
      }
      return true;
    });
  }, [catalog.problems, searchQuery, difficultyFilter, selectedCompany, hideSolved, solvedSet]);

  const sortedProblems = useMemo(() => {
    return [...filteredProblems].sort((a, b) => {
      let result = 0;
      if (sortBy === 'companiesCount') {
        result = a.companiesCount - b.companiesCount;
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

  const handleSort = (column: 'companiesCount' | 'difficulty' | 'title' | 'acceptance' | 'id') => {
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
    window.open(getLeetCodeProblemUrl(random.slug), '_blank', 'noopener,noreferrer');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Difficulty', 'Companies Count', 'Companies Asking', 'Acceptance %', 'Solved', 'Link'];
    const rows = sortedProblems.map((p) => {
      const accStr = p.acceptance > 0
        ? (p.acceptance <= 1 ? (p.acceptance * 100).toFixed(1) : p.acceptance.toFixed(1)) + '%'
        : '-';
      return [
        p.id || '',
        p.title,
        p.difficulty,
        p.companiesCount,
        p.companies.map((c) => c.name).join(', '),
        accStr,
        solvedSet.has(p.slug) ? 'YES' : 'NO',
        getLeetCodeProblemUrl(p.slug),
      ];
    });
    downloadCsv('company-sql-questions.csv', headers, rows);

    toast.success('Downloaded SQL CSV', {
      description: `Exported ${sortedProblems.length} SQL interview questions`,
    });
  };

  const sqlSolvedCount = useMemo(() => {
    let count = 0;
    for (const p of catalog.problems) {
      if (solvedSet.has(p.slug)) count++;
    }
    return count;
  }, [catalog.problems, solvedSet]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-normal">
        <Link href="/" className="apple-press hover:text-[var(--text-main)] flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All companies</span>
        </Link>
        <span>/</span>
        <span className="text-[var(--text-main)] font-medium">SQL & Database Questions</span>
      </nav>

      {/* Header Info Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden text-[var(--text-main)] shadow-xs">
            <Database className="w-7 h-7 opacity-80" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
                Top Company SQL Questions
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
                <span>{catalog.totalSqlProblems} SQL Problems</span>
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-xl">
              LeetCode SQL & Database questions frequently asked in Data Engineering, Data Analyst, Business Intelligence, and Software Engineering interviews across top firms.
            </p>
          </div>
        </div>

        {/* Progress Counter */}
        <div className="flex items-center gap-3 bg-[var(--bg-subtle)] border border-[var(--border)] px-4 py-2.5 rounded-2xl self-start md:self-auto">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-[var(--text-main)]">
              {sqlSolvedCount} / {catalog.totalSqlProblems} solved
            </div>
            <div className="w-28 h-1.5 bg-[var(--border)] rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${catalog.totalSqlProblems ? Math.min(100, (sqlSolvedCount / catalog.totalSqlProblems) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter SQL problems (#176, Second Highest Salary, JOIN...)"
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none focus:border-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--border)]/40 transition-[box-shadow,border-color] duration-150"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="apple-press apple-pop-in absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[var(--text-light)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-2xl text-xs shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="bg-transparent text-[var(--text-main)] focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Companies</option>
              {companyOptions.map(([slug, { name, count }]) => (
                <option key={slug} value={slug}>
                  {name} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Group */}
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

          {/* Random */}
          <button
            onClick={handleRandomProblem}
            className="apple-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-main)] shadow-2xs cursor-pointer"
            title="Open a random SQL problem"
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

          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="apple-press p-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-2xs cursor-pointer"
            title="Export filtered SQL list to CSV"
            aria-label="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SQL Table */}
      <div className="apple-enter border border-[var(--border)] rounded-3xl bg-[var(--bg-card)] overflow-hidden shadow-xs">
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
                  onClick={() => handleSort('companiesCount')}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-main)] select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Asked in Interviews</span>
                    {sortBy === 'companiesCount' && (sortDir === 'asc' ? '↑' : '↓')}
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
                    No SQL problems match your criteria.
                  </td>
                </tr>
              ) : (
                sortedProblems.map((prob) => {
                  const isSolved = solvedSet.has(prob.slug);
                  const accPercent = prob.acceptance > 0
                    ? (prob.acceptance <= 1 ? (prob.acceptance * 100).toFixed(1) : prob.acceptance.toFixed(1)) + '%'
                    : '-';

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
                          {isSolved && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3] apple-check-pop" />}
                        </button>
                      </td>

                      {/* Problem ID */}
                      <td className="py-3 px-3 text-center text-[var(--text-light)] text-[11px] font-mono">
                        {prob.id ? `#${prob.id}` : '-'}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4">
                        <a
                          href={getLeetCodeProblemUrl(prob.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 font-medium hover:text-[var(--text-main)] hover:underline transition-colors ${
                            isSolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'
                          }`}
                        >
                          <span>{prob.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </a>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${diffColorClass}`}>
                          {prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Companies asking */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-[var(--text-main)] mr-1">
                            {prob.companiesCount} {prob.companiesCount === 1 ? 'company' : 'companies'}:
                          </span>
                          {Array.from(new Map(prob.companies.map((c) => [c.slug, c])).values())
                            .slice(0, 4)
                            .map((c, cIdx) => (
                              <Link
                                key={`${prob.slug || prob.id}-${c.slug}-${cIdx}`}
                                href={`/company/${c.slug}`}
                                className="apple-press inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] border border-[var(--border)]"
                              >
                                <span>{c.name}</span>
                              </Link>
                            ))}
                          {prob.companies.length > 4 && (
                            <span className="text-[10px] text-[var(--text-light)]">
                              +{prob.companies.length - 4} more
                            </span>
                          )}
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
          <span>Showing <strong>{sortedProblems.length}</strong> of {catalog.totalSqlProblems} SQL questions</span>
          <span>Filtered: {selectedCompany === 'ALL' ? 'All Companies' : selectedCompany}</span>
        </div>
      </div>
    </div>
  );
};
