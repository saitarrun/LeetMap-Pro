'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Search,
  Shuffle,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Download,
  ShieldCheck,
  Database,
  Code2,
  X,
  Pin,
} from 'lucide-react';
import { toast } from 'sonner';
import { CompanyDetail, Problem } from '@/types';
import { toggleProblemSolved } from '@/utils/progress';
import { useSolvedProblems } from '@/utils/useSolvedProblems';
import { usePinnedCompanies } from '@/utils/usePinnedCompanies';
import { getLeetCodeProblemUrl } from '@/utils/urls';
import { downloadCsv } from '@/utils/csv';

interface CompanyDetailViewProps {
  company: CompanyDetail;
}

export const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({ company }) => {
  const [activeTab, setActiveTab] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ALGO' | 'SQL'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [hideTopics, setHideTopics] = useState(false);
  const [hideSolved, setHideSolved] = useState(false);
  const solvedSet = useSolvedProblems();
  const { isPinned: checkPinned, togglePin } = usePinnedCompanies();
  const isPinned = checkPinned(company.slug);

  const [sortBy, setSortBy] = useState<'frequency' | 'difficulty' | 'title' | 'acceptance' | 'id'>('frequency');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleToggleSolved = (prob: Problem) => {
    const solved = toggleProblemSolved(prob.slug, { title: prob.title, difficulty: prob.difficulty });

    if (solved) {
      toast.success(`Solved: ${prob.title}`, {
        description: `${prob.id ? `#${prob.id} · ` : ''}${prob.difficulty} · Frequency ${prob.frequency.toFixed(0)}%`,
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

  const currentWindow = company.windows[activeTab] || company.windows[0];
  const allProblems = useMemo(() => currentWindow?.problems || [], [currentWindow]);

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allProblems) {
      for (const t of p.topics) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allProblems]);

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
      if (typeFilter === 'SQL' && !p.isSql && !p.topics.includes('Database')) {
        return false;
      }
      if (typeFilter === 'ALGO' && (p.isSql || p.topics.includes('Database'))) {
        return false;
      }
      if (selectedTopic && !p.topics.includes(selectedTopic)) {
        return false;
      }
      if (hideSolved && solvedSet.has(p.slug)) {
        return false;
      }
      return true;
    });
  }, [allProblems, searchQuery, difficultyFilter, typeFilter, selectedTopic, hideSolved, solvedSet]);

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
    
    toast.info(`Random problem selected`, {
      description: `${random.id ? `#${random.id} · ` : ''}${random.title}`,
    });
    window.open(getLeetCodeProblemUrl(random.slug), '_blank', 'noopener,noreferrer');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Difficulty', 'Frequency %', 'Acceptance %', 'Solved', 'Link', 'Topics', 'Sources'];
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
        p.topics.join(', '),
        (p.verifiedSources || []).join(', '),
      ];
    });
    downloadCsv(`${company.slug}-questions-${currentWindow.key}.csv`, headers, rows);

    toast.success('Downloaded CSV', {
      description: `Exported ${sortedProblems.length} questions for ${company.name}`,
    });
  };

  const companySolvedCount = useMemo(() => {
    const allUniqueSlugs = new Set<string>();
    for (const w of company.windows) {
      for (const p of w.problems) {
        allUniqueSlugs.add(p.slug);
      }
    }
    let count = 0;
    for (const s of allUniqueSlugs) {
      if (solvedSet.has(s)) count++;
    }
    return count;
  }, [company, solvedSet]);

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
      {/* Apple Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-normal flex-wrap">
        <Link href="/" className="apple-press hover:text-[var(--text-main)] flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All companies</span>
        </Link>
        <span>/</span>
        <span className="text-[var(--text-main)] font-medium">{company.name}</span>
      </nav>

      {/* Header Info Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-black/5 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            {faviconUrl ? (
              <Image src={faviconUrl} alt="" width={36} height={36} className="w-9 h-9 object-contain" />
            ) : (
              <span className="text-base font-bold text-stone-700">{initials}</span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
                {company.name} LeetCode Questions
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title="Cross-referenced across multiple community datasets">
                <ShieldCheck className="w-3 h-3" />
                <span>Multi-Source Verified</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-main)]">{company.total}</span> questions all-time
              <span>•</span>
              <span className="font-semibold text-[var(--diff-easy-text)]">{company.easy} Easy</span>
              <span>•</span>
              <span className="font-semibold text-[var(--diff-medium-text)]">{company.medium} Medium</span>
              <span>•</span>
              <span className="font-semibold text-[var(--diff-hard-text)]">{company.hard} Hard</span>
            </div>

            {Boolean(company.sqlTotal && company.sqlTotal > 0) && (
              <div className="flex items-center p-0.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs font-semibold mt-2.5 self-start w-fit">
                <span className="px-3 py-1 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 opacity-80" />
                  <span>DSA Coding</span>
                </span>
                <Link
                  href={`/sql/${company.slug}`}
                  className="apple-press px-3 py-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Database className="w-3.5 h-3.5 opacity-70" />
                  <span>SQL ({company.sqlTotal})</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Actions & Progress */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Pin Button */}
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
            className={`apple-press flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              isPinned
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
            }`}
            title={isPinned ? `Unpin ${company.name}` : `Pin ${company.name} for quick access`}
          >
            <Pin className={`w-3.5 h-3.5 transition-transform ${isPinned ? 'fill-amber-500 text-amber-500 rotate-45' : ''}`} />
            <span>{isPinned ? 'Pinned' : 'Pin Company'}</span>
          </button>

          {/* Progress Card */}
          <div className="flex items-center gap-3 bg-[var(--bg-subtle)] border border-[var(--border)] px-4 py-2 rounded-2xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[var(--text-main)]">
                {companySolvedCount} / {company.total} solved
              </div>
              <div className="w-28 h-1.5 bg-[var(--border)] rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${company.total ? Math.min(100, (companySolvedCount / company.total) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recency Tabs: Apple Segmented Capsule */}
      <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
        <div className="inline-flex p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] gap-1 shadow-2xs">
          {company.windows.map((win, idx) => (
            <button
              key={win.key}
              onClick={() => {
                setActiveTab(idx);
                setSelectedTopic(null);
              }}
              className={`apple-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === idx
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <span>{win.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === idx
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                    : 'text-[var(--text-light)]'
                }`}
              >
                {win.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter problems (#1, Two Sum, dynamic programming...)"
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-light)] shadow-xs focus:outline-none focus:border-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--border)]/40 transition-[box-shadow,border-color] duration-150"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="apple-press apple-pop-in absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[var(--text-light)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono text-[var(--text-light)] border border-[var(--border)] bg-[var(--bg-subtle)]">
              /
            </kbd>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Filter */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs font-medium shadow-2xs">
            {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`apple-press px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  difficultyFilter === diff
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {diff === 'ALL' ? 'All' : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Type Filter (Algorithms vs SQL) */}
          {Boolean(company.sqlTotal && company.sqlTotal > 0) && (
            <div className="inline-flex items-center p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs font-medium shadow-2xs">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'ALGO', label: 'DSA' },
                { key: 'SQL', label: `SQL (${company.sqlTotal})` },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTypeFilter(t.key as typeof typeFilter)}
                  className={`apple-press px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    typeFilter === t.key
                      ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Random */}
          <button
            onClick={handleRandomProblem}
            className="apple-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-main)] shadow-2xs cursor-pointer"
            title="Open a random problem in LeetCode"
          >
            <Shuffle className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Random</span>
          </button>

          {/* Toggles Group: Hide Topics & Hide Solved */}
          <div className="inline-flex items-center p-0.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xs">
            <button
              onClick={() => setHideTopics(!hideTopics)}
              className={`apple-press flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
              className={`apple-press flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="apple-press p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-2xs cursor-pointer"
            title="Export filtered list to CSV"
            aria-label="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Topic Chips: Sleek Horizontal Scroll Strip */}
      {topicCounts.length > 0 && !hideTopics && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`apple-press shrink-0 inline-flex items-center px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
              selectedTopic === null
                ? 'bg-[var(--text-main)] text-[var(--bg-page)] font-semibold shadow-xs'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] shadow-2xs'
            }`}
          >
            All Topics
          </button>
          {topicCounts.map(([topic, count]) => {
            const isSelected = selectedTopic === topic;
            const displayCount = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(isSelected ? null : topic)}
                className={`apple-press shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[var(--text-main)] text-[var(--bg-page)] font-semibold shadow-xs'
                    : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] shadow-2xs'
                }`}
              >
                <span>{topic}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'opacity-90' : 'text-[var(--text-light)]'}`}>
                  {displayCount}
                </span>
              </button>
            );
          })}
          {selectedTopic && (
            <button
              onClick={() => setSelectedTopic(null)}
              className="shrink-0 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline pl-1 cursor-pointer transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Apple Squircle Table */}
      <div className="apple-enter border border-[var(--border)] rounded-3xl bg-[var(--bg-card)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)]/60 text-[var(--text-muted)] text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center" aria-label="Solved">
                  <CheckCircle2 className="w-3.5 h-3.5 mx-auto opacity-50" />
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
                      <p className="text-sm font-semibold text-[var(--text-main)]">No matching problems</p>
                      <p className="text-xs text-[var(--text-muted)]">Try adjusting your difficulty or search filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setDifficultyFilter('ALL');
                          setSelectedTopic(null);
                        }}
                        className="apple-press mt-2 inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] border border-[var(--border)] cursor-pointer"
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

                  let diffColorClass = 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  if (prob.difficulty === 'MEDIUM') {
                    diffColorClass = 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
                  } else if (prob.difficulty === 'HARD') {
                    diffColorClass = 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
                  }

                  return (
                    <tr
                      key={prob.slug || prob.title}
                      className={`hover:bg-[var(--bg-subtle)]/50 transition-colors group ${
                        isSolved ? 'opacity-60 bg-emerald-500/[0.02]' : ''
                      }`}
                    >
                      {/* Solved Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSolved(prob)}
                          className={`apple-press w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all cursor-pointer mx-auto ${
                            isSolved
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
                              : 'border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg-card)]'
                          }`}
                          aria-label={`Mark ${prob.title} as ${isSolved ? 'unsolved' : 'solved'}`}
                        >
                          {isSolved && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5] apple-check-pop" />}
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
                                className="text-[9px] px-1.5 py-0.2 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] font-mono border border-[var(--border)]"
                                title={`Verified across: ${prob.verifiedSources.join(', ')}`}
                              >
                                {prob.verifiedSources.length} sources
                              </span>
                            )}

                            {Boolean(prob.isSql || prob.topics.includes('Database')) && (
                              <span
                                className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] font-medium border border-[var(--border)]"
                                title="SQL & Database Problem"
                              >
                                <Database className="w-2.5 h-2.5 opacity-80" />
                                SQL
                              </span>
                            )}
                          </div>

                          {!hideTopics && prob.topics.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              {prob.topics.map((t, tIdx) => (
                                <button
                                  key={t}
                                  onClick={() => setSelectedTopic(t)}
                                  className="text-[10px] text-[var(--text-light)] hover:text-[var(--text-muted)] hover:underline cursor-pointer"
                                >
                                  {t}{tIdx < prob.topics.length - 1 ? ' ·' : ''}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border inline-flex items-center justify-center min-w-[62px] ${diffColorClass}`}>
                          {prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Frequency */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500/80 to-emerald-500 rounded-full"
                              style={{ width: `${freq}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-[var(--text-muted)] font-semibold tabular-nums">
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
          <span>Showing {sortedProblems.length} of {allProblems.length} questions</span>
          <span>Window: {currentWindow.name}</span>
        </div>
      </div>
    </div>
  );
};
