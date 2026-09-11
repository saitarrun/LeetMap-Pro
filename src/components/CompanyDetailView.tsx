'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
        <span className="opacity-40">/</span>
        <span className="text-[var(--text-main)] font-medium">{company.name}</span>
      </nav>

      {/* Header Info Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden">
            {faviconUrl ? (
              <Image src={faviconUrl} alt="" width={26} height={26} className="w-6.5 h-6.5 object-contain" />
            ) : (
              <span className="text-xs font-semibold text-[var(--text-muted)]">{initials}</span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-main)] tracking-tight">
                {company.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-normal">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Verified</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-[var(--text-muted)]">
              <span>{company.total} questions</span>
              <span className="opacity-30">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{company.easy} Easy</span>
              <span className="opacity-30">·</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">{company.medium} Medium</span>
              <span className="opacity-30">·</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">{company.hard} Hard</span>
            </div>

            {Boolean(company.sqlTotal && company.sqlTotal > 0) && (
              <div className="flex items-center p-0.5 rounded-xl bg-[var(--bg-subtle)] text-xs mt-2.5 self-start w-fit">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-medium flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 opacity-70" />
                  <span>DSA</span>
                </span>
                <Link
                  href={`/sql/${company.slug}`}
                  className="apple-press px-2.5 py-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5 font-normal"
                >
                  <Database className="w-3 h-3 opacity-70" />
                  <span>SQL ({company.sqlTotal})</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Actions & Progress */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
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
            className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              isPinned
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-[var(--bg-subtle)] border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title={isPinned ? `Unpin ${company.name}` : `Pin ${company.name} for quick access`}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-500 rotate-45' : ''}`} />
            <span>{isPinned ? 'Pinned' : 'Pin'}</span>
          </button>

          {/* Progress Card */}
          <div className="flex items-center gap-2 bg-[var(--bg-subtle)] px-3 py-1.5 rounded-xl text-xs text-[var(--text-muted)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              <span className="font-semibold text-[var(--text-main)]">{companySolvedCount}</span>
              <span className="opacity-50"> / </span>
              <span>{company.total} solved</span>
            </span>
          </div>
        </div>
      </div>

      {/* Recency Tabs: Minimal Segmented Control */}
      <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
        <div className="inline-flex p-0.5 rounded-xl bg-[var(--bg-subtle)] gap-0.5">
          {company.windows.map((win, idx) => (
            <button
              key={win.key}
              onClick={() => {
                setActiveTab(idx);
                setSelectedTopic(null);
              }}
              className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === idx
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <span>{win.name}</span>
              <span className="text-[10px] font-mono text-[var(--text-light)]">
                {win.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Spotlight Search Bar */}
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter problems (#1, Two Sum, dynamic programming...)"
            className="w-full h-10 pl-10 pr-9 rounded-2xl text-xs bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-light)] shadow-xs focus:outline-none focus:border-[var(--text-muted)]/40 focus:ring-4 focus:ring-[var(--border)]/30 transition-all duration-150"
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

          {/* Type Filter (Algorithms vs SQL) */}
          {Boolean(company.sqlTotal && company.sqlTotal > 0) && (
            <div className="inline-flex items-center p-0.5 rounded-xl bg-[var(--bg-subtle)] text-xs font-medium">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'ALGO', label: 'DSA' },
                { key: 'SQL', label: `SQL (${company.sqlTotal})` },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTypeFilter(t.key as typeof typeFilter)}
                  className={`apple-press px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    typeFilter === t.key
                      ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-medium'
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
            className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Open a random problem in LeetCode"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random</span>
          </button>

          {/* Toggles Group: Hide Topics & Hide Solved */}
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

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="apple-press p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Export filtered list to CSV"
            aria-label="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Topic Chips: Minimal chiclets strip */}
      {topicCounts.length > 0 && !hideTopics && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`apple-press shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
              selectedTopic === null
                ? 'bg-[var(--text-main)] text-[var(--bg-page)] font-medium shadow-xs'
                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
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
                className={`apple-press shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[var(--text-main)] text-[var(--bg-page)] font-medium shadow-xs'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
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

                            {Boolean(prob.isSql || prob.topics.includes('Database')) && (
                              <span
                                className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] font-medium"
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
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium inline-flex items-center justify-center min-w-[56px] ${diffColorClass}`}>
                          {prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Frequency */}
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
          <span>Showing {sortedProblems.length} of {allProblems.length} questions</span>
          <span>Window: {currentWindow.name}</span>
        </div>
      </div>
    </div>
  );
};
