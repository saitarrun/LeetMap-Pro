'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Search,
  Shuffle,
  CheckCircle2,
  ExternalLink,
  Download,
  ShieldCheck,
  Code2,
  X,
  Pin,
  Clock,
  Zap,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { CompanyDetail, Problem } from '@/types';
import { toggleProblemSolved } from '@/utils/progress';
import { useSolvedProblems } from '@/utils/useSolvedProblems';
import { usePinnedCompanies } from '@/utils/usePinnedCompanies';
import { getLeetCodeProblemUrl } from '@/utils/urls';
import { downloadCsv } from '@/utils/csv';

interface SqlCompanyDetailViewProps {
  company: CompanyDetail;
}

export const SqlCompanyDetailView: React.FC<SqlCompanyDetailViewProps> = ({ company }) => {
  const [activeTab, setActiveTab] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [hideSolved, setHideSolved] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const solvedSet = useSolvedProblems();
  const { isPinned: checkPinned, togglePin } = usePinnedCompanies();
  const isPinned = checkPinned(company.slug);

  const [sortBy, setSortBy] = useState<'frequency' | 'difficulty' | 'title' | 'acceptance' | 'id'>('frequency');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSolved = (prob: Problem) => {
    const solved = toggleProblemSolved(prob.slug, { id: prob.id, title: prob.title, difficulty: prob.difficulty });

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
  const allProblems = useMemo(() => currentWindow?.problems || [], [currentWindow]);

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
    window.open(getLeetCodeProblemUrl(random.slug), '_blank', 'noopener,noreferrer');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Difficulty', 'Frequency %', 'Acceptance %', 'Solved', 'Link'];
    const rows = sortedProblems.map((p) => {
      const accStr = p.acceptance > 0
        ? (p.acceptance <= 1 ? (p.acceptance * 100).toFixed(1) : p.acceptance.toFixed(1)) + '%'
        : '-';
      return [
        p.id || '',
        p.title,
        p.difficulty,
        p.frequency,
        accStr,
        solvedSet.has(p.slug) ? 'YES' : 'NO',
        getLeetCodeProblemUrl(p.slug),
      ];
    });
    downloadCsv(`${company.slug}-sql-questions-${currentWindow.key}.csv`, headers, rows);

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
        <span className="opacity-40">/</span>
        <span className="text-[var(--text-main)] font-medium">{company.name} SQL</span>
      </nav>

      {/* Minimal Hero Header (Unboxed, matching Homepage) */}
      <section className="text-center max-w-2xl mx-auto space-y-3 pt-1">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden">
            {faviconUrl ? (
              <Image src={faviconUrl} alt="" width={26} height={26} className="w-6.5 h-6.5 object-contain" />
            ) : (
              <span className="text-xs font-semibold text-[var(--text-muted)]">{initials}</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
            {company.name} SQL
          </h1>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-normal">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified</span>
          </span>
        </div>

        {/* Breakdown Stats */}
        <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[var(--text-muted)] font-normal flex-wrap">
          <span>{totalSqlCount} SQL queries</span>
          <span className="opacity-30">·</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{sqlEasy} Easy</span>
          <span className="opacity-30">·</span>
          <span className="text-amber-600 dark:text-amber-400 font-medium">{sqlMed} Medium</span>
          <span className="opacity-30">·</span>
          <span className="text-rose-600 dark:text-rose-400 font-medium">{sqlHard} Hard</span>
          {companySqlSolvedCount > 0 && (
            <>
              <span className="opacity-30">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{companySqlSolvedCount} solved</span>
            </>
          )}
        </div>

        {/* Discreet Actions (Pin & DSA Track Switcher) */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              const nowPinned = togglePin(company.slug);
              if (nowPinned) {
                toast.success(`Pinned ${company.name}`, {
                  description: 'Added to your pinned companies for quick access',
                });
              } else {
                toast.info(`Unpinned ${company.name}`);
              }
            }}
            className={`apple-press inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              isPinned
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
            }`}
            title={isPinned ? `Unpin ${company.name}` : `Pin ${company.name}`}
          >
            <Pin className={`w-3 h-3 ${isPinned ? 'fill-amber-500 text-amber-500 rotate-45' : ''}`} />
            <span>{isPinned ? 'Pinned' : 'Pin'}</span>
          </button>

          <Link
            href={`/company/${company.slug}`}
            className="apple-press inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <Code2 className="w-3 h-3 opacity-70" />
            <span>DSA ({company.total - totalSqlCount})</span>
          </Link>
        </div>
      </section>

      {/* Apple Spotlight Search Bar (Centered) */}
      <div className="max-w-2xl mx-auto">
        <div className="relative group flex items-center h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]/30 focus-within:border-[var(--text-main)]/35 shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-200">
          <Search className="absolute left-4.5 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${company.name} SQL questions (#176, Second Highest...)...`}
            className="w-full h-full pl-12 pr-14 text-sm bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none focus-visible:outline-none border-none outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="apple-press absolute right-3.5 p-1 rounded-full text-[var(--text-light)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              title="Clear search (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-3.5 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono text-[var(--text-light)] bg-[var(--bg-subtle)] border border-[var(--border)] group-focus-within:opacity-40 transition-opacity">
                ⌘K
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* Filter Controls Bar (Full width, matching the table) */}
      <div className="space-y-2.5 pt-1">
        {/* Mobile Unified Controls (Single clean block, zero clutter) */}
        <div className="md:hidden space-y-2 pt-1">
          {/* Row 1: Time Window & Difficulty */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Time Window Select */}
            <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-main)]">
              <Clock className="w-3.5 h-3.5 opacity-70 shrink-0" />
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(Number(e.target.value))}
                className="w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none pr-4 text-inherit"
                aria-label="Select timeframe"
              >
                {sqlWindows.map((win, idx) => (
                  <option key={win.key} value={idx} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                    {win.name} ({win.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Difficulty Select */}
            <div
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                difficultyFilter !== 'ALL'
                  ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)] font-medium'
                  : 'bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-main)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 opacity-70 shrink-0" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as typeof difficultyFilter)}
                className="w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none pr-4 text-inherit"
                aria-label="Filter by difficulty"
              >
                <option value="ALL" className="bg-[var(--bg-card)] text-[var(--text-main)]">All Difficulties</option>
                <option value="EASY" className="bg-[var(--bg-card)] text-[var(--text-main)]">Easy</option>
                <option value="MEDIUM" className="bg-[var(--bg-card)] text-[var(--text-main)]">Medium</option>
                <option value="HARD" className="bg-[var(--bg-card)] text-[var(--text-main)]">Hard</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Sort & Quick Actions */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Sort */}
            <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-main)]">
              <ArrowUpDown className="w-3.5 h-3.5 opacity-70 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => {
                  handleSort(e.target.value as typeof sortBy);
                }}
                className="w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none pr-4 text-inherit"
                aria-label="Sort SQL problems"
              >
                <option value="frequency" className="bg-[var(--bg-card)] text-[var(--text-main)]">Frequency</option>
                <option value="difficulty" className="bg-[var(--bg-card)] text-[var(--text-main)]">Difficulty</option>
                <option value="title" className="bg-[var(--bg-card)] text-[var(--text-main)]">Problem Name</option>
                <option value="acceptance" className="bg-[var(--bg-card)] text-[var(--text-main)]">Acceptance %</option>
                <option value="id" className="bg-[var(--bg-card)] text-[var(--text-main)]">Problem #</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHideSolved(!hideSolved)}
                className={`apple-press flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer truncate ${
                  hideSolved
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="Toggle solved problems"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{hideSolved ? 'Unsolved' : 'Hide Solved'}</span>
              </button>

              <button
                type="button"
                onClick={handleRandomProblem}
                className="apple-press flex items-center justify-center p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shrink-0"
                title="Open random SQL problem"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="apple-press flex items-center justify-center p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shrink-0"
                title="Export to CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Filter Controls */}
        <div className="hidden md:block space-y-2.5">
          {/* Primary Filter Row: Recency & Inline Quick Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
            {/* Recency Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              {sqlWindows.map((win, idx) => (
                <button
                  key={win.key}
                  onClick={() => setActiveTab(idx)}
                  className={`apple-press shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === idx
                      ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]/50'
                  }`}
                >
                  <span>{win.name}</span>
                  <span className={`text-[10px] font-mono ${activeTab === idx ? 'opacity-80' : 'text-[var(--text-light)]'}`}>
                    {win.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-1 self-start md:self-auto shrink-0 text-xs">
              <button
                onClick={handleRandomProblem}
                className="apple-press px-2.5 py-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors flex items-center gap-1 cursor-pointer"
                title="Open random SQL problem"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Random</span>
              </button>
              <button
                onClick={() => setHideSolved(!hideSolved)}
                className={`apple-press px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  hideSolved
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
                }`}
                title="Toggle solved problems"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Solved</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="apple-press p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                title="Export to CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Secondary Filter Row: Difficulty */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--border)] text-xs">
            <div className="flex items-center gap-1">
              {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`apple-press px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    difficultyFilter === diff
                      ? 'bg-[var(--text-main)] text-[var(--bg-page)] font-medium shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {diff === 'ALL' ? 'All' : diff.charAt(0) + diff.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SQL Table & Mobile Cards */}
      <div className="apple-enter border border-[var(--border)] rounded-3xl bg-[var(--bg-card)] overflow-hidden shadow-xs">
        {/* Mobile Problems Card List (No horizontal table scrolling needed) */}
        <div className="md:hidden divide-y divide-[var(--border)]">
          {sortedProblems.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <p className="text-sm font-semibold text-[var(--text-main)]">No matching SQL problems</p>
              <p className="text-xs text-[var(--text-muted)]">Try adjusting your difficulty or search filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('ALL');
                }}
                className="apple-press mt-2 inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] border border-[var(--border)] cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            sortedProblems.map((prob) => {
              const isSolved = solvedSet.has(prob.slug);
              const accPercent = prob.acceptance > 0
                ? (prob.acceptance <= 1 ? (prob.acceptance * 100).toFixed(1) : prob.acceptance.toFixed(1)) + '%'
                : '-';
              const freq = Math.min(100, Math.max(0, prob.frequency));

              let diffColorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
              if (prob.difficulty === 'MEDIUM') {
                diffColorClass = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
              } else if (prob.difficulty === 'HARD') {
                diffColorClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
              }

              return (
                <div
                  key={prob.slug || prob.title}
                  className={`p-3.5 transition-colors flex items-start gap-3 ${
                    isSolved ? 'opacity-60 bg-[var(--bg-subtle)]/20' : ''
                  }`}
                >
                  {/* Solved Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleSolved(prob)}
                    className={`apple-press mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isSolved
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg-card)]'
                    }`}
                    aria-label={`Mark ${prob.title} as ${isSolved ? 'unsolved' : 'solved'}`}
                  >
                    {isSolved && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>

                  {/* Problem Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {prob.id && (
                        <span className="text-[11px] font-mono text-[var(--text-light)] font-medium shrink-0">
                          #{prob.id}
                        </span>
                      )}
                      <a
                        href={getLeetCodeProblemUrl(prob.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[var(--text-main)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1 break-words line-clamp-2"
                      >
                        <span>{prob.title}</span>
                        <ExternalLink className="w-3 h-3 opacity-40 shrink-0 inline" />
                      </a>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] flex-wrap pt-0.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${diffColorClass}`}>
                        {prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase()}
                      </span>
                      <span>·</span>
                      <span>Freq {freq.toFixed(0)}%</span>
                      <span>·</span>
                      <span>Acc {accPercent}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)]/40 text-[var(--text-muted)] text-[11px] font-medium tracking-normal">
                <th className="py-3 px-3 w-12 text-center" aria-label="Solved">
                  <CheckCircle2 className="w-3.5 h-3.5 mx-auto opacity-40" />
                </th>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 w-16 text-center cursor-pointer hover:text-[var(--text-main)] select-none"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>#</span>
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
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-main)] select-none w-28 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Difficulty</span>
                    {sortBy === 'difficulty' && (sortDir === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('frequency')}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-main)] select-none w-36"
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
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="text-sm font-semibold text-[var(--text-main)]">No matching SQL problems</p>
                      <p className="text-xs text-[var(--text-muted)]">Try adjusting your difficulty or search filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setDifficultyFilter('ALL');
                        }}
                        className="apple-press mt-2 inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] border border-[var(--border)] cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedProblems.map((prob) => {
                  const isSolved = solvedSet.has(prob.slug);
                  const accPercent = prob.acceptance > 0
                    ? (prob.acceptance <= 1 ? (prob.acceptance * 100).toFixed(1) : prob.acceptance.toFixed(1)) + '%'
                    : '-';
                  const freq = Math.min(100, Math.max(0, prob.frequency));

                  let diffColorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/8';
                  if (prob.difficulty === 'MEDIUM') {
                    diffColorClass = 'text-amber-600 dark:text-amber-400 bg-amber-500/8';
                  } else if (prob.difficulty === 'HARD') {
                    diffColorClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/8';
                  }

                  return (
                    <tr
                      key={prob.slug || prob.title}
                      className={`hover:bg-[var(--bg-subtle)]/40 transition-colors group ${
                        isSolved ? 'opacity-55' : ''
                      }`}
                    >
                      {/* Solved Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSolved(prob)}
                          className={`apple-press w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer mx-auto ${
                            isSolved
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg-card)]'
                          }`}
                          aria-label={`Mark ${prob.title} as ${isSolved ? 'unsolved' : 'solved'}`}
                        >
                          {isSolved && <CheckCircle2 className="w-3 h-3 stroke-[2.5] apple-check-pop" />}
                        </button>
                      </td>

                      {/* Problem ID */}
                      <td className="py-3 px-3 text-center text-[var(--text-light)] text-[11px] font-mono">
                        {prob.id ? `#${prob.id}` : '-'}
                      </td>

                      {/* Title & Topics */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
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

                            {prob.verifiedSources && prob.verifiedSources.length > 1 && (
                              <span
                                className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-light)] font-mono"
                                title={`Verified across: ${prob.verifiedSources.join(', ')}`}
                              >
                                {prob.verifiedSources.length} sources
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium inline-flex items-center justify-center min-w-[56px] ${diffColorClass}`}>
                          {prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Frequency Bar */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--text-main)]/50 rounded-full"
                              style={{ width: `${freq}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                            {freq.toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Acceptance */}
                      <td className="py-3 px-4 text-right font-mono text-[11px] tabular-nums text-[var(--text-muted)] whitespace-nowrap">
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
