'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Shuffle,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Download,
  Building2,
  X,
  Lightbulb,
  Sparkles,
  BookOpen,
  ArrowLeftRight,
  SlidersHorizontal,
  Binary,
  Sigma,
  IterationCcw,
  Link2,
  Layers,
  Crown,
  FolderTree,
  Network,
  CalendarRange,
  GitBranch,
  Rows3,
  Split,
  Share2,
  ArrowDownUp,
  Grid,
  RotateCcw,
  TrendingUp,
  Boxes,
  Flame,
  Cpu,
  LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { PatternDetail, PatternProblem } from '@/types';
import { toggleProblemSolved } from '@/utils/progress';
import { useSolvedProblems } from '@/utils/useSolvedProblems';
import { getLeetCodeProblemUrl } from '@/utils/urls';
import { downloadCsv } from '@/utils/csv';
import { PATTERN_GUIDES } from '@/data/pattern-guides';

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowLeftRight,
  SlidersHorizontal,
  Binary,
  Sigma,
  IterationCcw,
  Link2,
  Layers,
  Crown,
  FolderTree,
  Network,
  CalendarRange,
  GitBranch,
  Rows3,
  Split,
  Share2,
  ArrowDownUp,
  Grid,
  RotateCcw,
  TrendingUp,
  Boxes,
  Flame,
  Cpu,
};

interface PatternDetailViewProps {
  pattern: PatternDetail;
}

export const PatternDetailView: React.FC<PatternDetailViewProps> = ({ pattern }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [hideTopics, setHideTopics] = useState(false);
  const [hideSolved, setHideSolved] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const solvedSet = useSolvedProblems();

  const [sortBy, setSortBy] = useState<'companiesCount' | 'difficulty' | 'title' | 'acceptance' | 'id' | 'frequency'>('companiesCount');
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

  const handleToggleSolved = (prob: PatternProblem) => {
    const solved = toggleProblemSolved(prob.slug, { title: prob.title, difficulty: prob.difficulty });

    if (solved) {
      toast.success(`Solved: ${prob.title}`, {
        description: `${prob.id ? `#${prob.id} · ` : ''}${prob.difficulty} · ${pattern.name}`,
        action: {
          label: 'Undo',
          onClick: () => handleToggleSolved(prob),
        },
      });
    } else {
      toast('Unmarked problem', {
        description: prob.title,
      });
    }
  };

  // Distinct companies present in this pattern with counts
  const companyOptions = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    for (const p of pattern.problems) {
      for (const c of p.companies) {
        if (!map[c.slug]) {
          map[c.slug] = { name: c.name, count: 0 };
        }
        map[c.slug].count++;
      }
    }
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [pattern.problems]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return pattern.problems.filter((p) => {
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
  }, [pattern.problems, searchQuery, difficultyFilter, selectedCompany, hideSolved, solvedSet]);

  const sortedProblems = useMemo(() => {
    return [...filteredProblems].sort((a, b) => {
      let result = 0;
      if (sortBy === 'companiesCount') {
        result = a.companiesCount - b.companiesCount;
      } else if (sortBy === 'frequency') {
        result = a.maxFrequency - b.maxFrequency;
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

  const handleSort = (column: 'companiesCount' | 'difficulty' | 'title' | 'acceptance' | 'id' | 'frequency') => {
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

    toast.info(`Random problem in ${pattern.name}`, {
      description: `${random.id ? `#${random.id} · ` : ''}${random.title}`,
    });
    window.open(getLeetCodeProblemUrl(random.slug), '_blank', 'noopener,noreferrer');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Difficulty', 'Companies Count', 'Top Companies', 'Max Frequency %', 'Acceptance %', 'Solved', 'Link'];
    const rows = sortedProblems.map((p) => {
      const accStr = p.acceptance > 0
        ? (p.acceptance <= 1 ? (p.acceptance * 100).toFixed(1) : p.acceptance.toFixed(1)) + '%'
        : '-';
      return [
        p.id || '',
        p.title,
        p.difficulty,
        p.companiesCount,
        p.companies.slice(0, 5).map((c) => c.name).join(', '),
        p.maxFrequency,
        accStr,
        solvedSet.has(p.slug) ? 'YES' : 'NO',
        getLeetCodeProblemUrl(p.slug),
      ];
    });
    downloadCsv(`${pattern.slug}-pattern-problems.csv`, headers, rows);

    toast.success('Downloaded Pattern CSV', {
      description: `Exported ${sortedProblems.length} problems for pattern: ${pattern.name}`,
    });
  };

  const patternSolvedCount = useMemo(() => {
    let count = 0;
    for (const p of pattern.problems) {
      if (solvedSet.has(p.slug)) count++;
    }
    return count;
  }, [pattern.problems, solvedSet]);

  const IconComponent = ICON_MAP[pattern.icon] || GitBranch;
  const guide = PATTERN_GUIDES[pattern.slug];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-normal flex-wrap">
        <Link href="/" className="apple-press hover:text-[var(--text-main)] flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Companies</span>
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/patterns" className="apple-press hover:text-[var(--text-main)] flex items-center gap-1 transition-colors">
          <GitBranch className="w-3.5 h-3.5 opacity-70" />
          <span>Patterns Hub</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--text-main)] font-medium">{pattern.name}</span>
      </nav>

      {/* Pattern Master Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--text-main)]">
              <IconComponent className="w-7 h-7 opacity-80" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-main)] tracking-tight">
                  {pattern.name}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                  {pattern.category}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                  {pattern.total} Problems
                </span>
              </div>

              <p className="text-sm text-[var(--text-muted)] font-normal max-w-2xl leading-relaxed">
                {pattern.tagline}
              </p>

              {/* Difficulty Breakdown */}
              <div className="flex items-center gap-2 pt-1 text-xs text-[var(--text-muted)]">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{pattern.easy} Easy</span>
                <span className="opacity-30">·</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">{pattern.medium} Medium</span>
                <span className="opacity-30">·</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">{pattern.hard} Hard</span>
              </div>
            </div>
          </div>

          {/* Solved Progress Counter */}
          <div className="flex items-center gap-2.5 bg-[var(--bg-subtle)] px-3.5 py-2 rounded-xl shrink-0 self-start md:self-auto text-xs text-[var(--text-muted)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <span className="font-semibold text-[var(--text-main)]">{patternSolvedCount}</span>
              <span className="opacity-50"> / </span>
              <span>{pattern.total} solved</span>
            </span>
          </div>
        </div>

        {/* Pattern Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 border-t border-[var(--border)] pt-5 gap-6 lg:gap-0">
          <section className="space-y-3 pb-5 lg:pb-0 lg:pr-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
              <Sparkles className="size-4 text-emerald-500" />
              <h2>Recognize it</h2>
            </div>
            <ul className="space-y-2">
              {pattern.clues.map((clue) => (
                <li key={clue} className="flex gap-2 text-xs leading-relaxed text-[var(--text-muted)]">
                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-emerald-500/70" />
                  <span>{clue}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--border)] py-5 lg:border-l lg:border-t-0 lg:px-6 lg:py-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
              <Lightbulb className="size-4 text-amber-500" />
              <h2>How to solve</h2>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">{pattern.strategy}</p>
            {guide && (
              <ol className="space-y-2">
                {guide.steps.map((step, index) => (
                  <li key={step} className="flex gap-2 text-xs leading-relaxed text-[var(--text-muted)]">
                    <span className="font-mono text-[10px] text-[var(--text-light)]">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="space-y-3 border-t border-[var(--border)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
              <BookOpen className="size-4 text-sky-500" />
              <h2>Cheat sheet</h2>
            </div>
            {guide && (
              <div className="space-y-3 text-xs">
                <code className="block overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2.5 text-[11px] leading-relaxed text-[var(--text-main)]">
                  {guide.template}
                </code>
                <dl className="space-y-2">
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-[var(--text-light)]">Cost</dt>
                    <dd className="text-[var(--text-muted)]">{guide.complexity}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-[var(--text-light)]">Watch for</dt>
                    <dd className="text-[var(--text-muted)]">{guide.pitfall}</dd>
                  </div>
                </dl>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Apple Spotlight Search */}
        <div className="relative flex-1 max-w-md group flex items-center h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]/30 focus-within:border-[var(--text-main)]/35 shadow-[0_1px_4px_rgba(0,0,0,0.02)] focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-200">
          <Search className="absolute left-3.5 w-3.5 h-3.5 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${pattern.name} problems (#15, 3Sum, DP...)`}
            className="w-full h-full pl-9 pr-12 text-xs bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="apple-press apple-pop-in absolute right-3 p-0.5 rounded-full text-[var(--text-light)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono text-[var(--text-light)] bg-[var(--bg-subtle)] border border-[var(--border)] group-focus-within:opacity-40 transition-opacity">
                ⌘K
              </kbd>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-1.5 rounded-xl text-xs">
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
          <div className="inline-flex items-center p-0.5 rounded-xl bg-[var(--bg-subtle)] text-xs font-medium">
            {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`apple-press px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  difficultyFilter === diff
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-medium'
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
            className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Open a random problem in this pattern"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random</span>
          </button>

          {/* Toggles Group */}
          <div className="inline-flex items-center p-0.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <button
              onClick={() => setHideTopics(!hideTopics)}
              className={`apple-press flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                hideTopics
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Hide topic tags for blind interview prep"
            >
              {hideTopics ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>Topics</span>
            </button>
            <span className="w-px h-3.5 bg-[var(--border)]" />
            <button
              onClick={() => setHideSolved(!hideSolved)}
              className={`apple-press flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                hideSolved
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Hide problems you already solved"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Solved</span>
            </button>
          </div>

          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="apple-press p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Export pattern problems to CSV"
            aria-label="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Problem Table */}
      <div className="apple-enter border border-[var(--border)] rounded-3xl bg-[var(--bg-card)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
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
                    <span>Problem</span>
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
                  onClick={() => handleSort('companiesCount')}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-main)] select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Top Companies</span>
                    {sortBy === 'companiesCount' && (sortDir === 'asc' ? '↑' : '↓')}
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
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="text-sm font-semibold text-[var(--text-main)]">No matching problems</p>
                      <p className="text-xs text-[var(--text-muted)]">Try adjusting your difficulty or company filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setDifficultyFilter('ALL');
                          setSelectedCompany('ALL');
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
                  const freq = Math.min(100, Math.max(0, prob.maxFrequency));

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

                          {!hideTopics && prob.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {prob.topics.map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] text-[var(--text-light)]"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium inline-flex items-center justify-center min-w-[56px] ${diffColorClass}`}>
                          {prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Companies asking */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {prob.companies.slice(0, 4).map((c) => (
                            <Link
                              key={c.slug}
                              href={`/company/${c.slug}`}
                              className="apple-press inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            >
                              <span>{c.name}</span>
                            </Link>
                          ))}
                          {prob.companies.length > 4 && (
                            <span className="text-[10px] text-[var(--text-light)] pl-0.5">
                              +{prob.companies.length - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Max Frequency */}
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
          <span>Showing <strong>{sortedProblems.length}</strong> of {pattern.total} problems in {pattern.name}</span>
          <span>Filtered: {selectedCompany === 'ALL' ? 'All Companies' : selectedCompany}</span>
        </div>
      </div>
    </div>
  );
};
