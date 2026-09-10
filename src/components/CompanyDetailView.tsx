'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Shuffle,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { CompanyDetail, Problem } from '@/types';
import { getSolvedProblems, toggleProblemSolved } from '@/utils/progress';

interface CompanyDetailViewProps {
  company: CompanyDetail;
}

export const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({ company }) => {
  // Tab index: 0=30_days, 1=3_months, 2=6_months, 3=more_than_6_months, 4=all
  // Default to 4 ("All Time") or 0 ("Last 30 Days") if populated
  const [activeTab, setActiveTab] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [hideTopics, setHideTopics] = useState(false);
  const [hideSolved, setHideSolved] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [solvedSet, setSolvedSet] = useState<Set<string>>(new Set());

  // Sort state: default by frequency descending
  const [sortBy, setSortBy] = useState<'frequency' | 'difficulty' | 'title' | 'acceptance'>('frequency');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Load solved problems from localStorage
  useEffect(() => {
    setSolvedSet(getSolvedProblems());

    const handleSolvedChange = () => {
      setSolvedSet(getSolvedProblems());
    };
    window.addEventListener('grindmap-solved-updated', handleSolvedChange);
    return () => window.removeEventListener('grindmap-solved-updated', handleSolvedChange);
  }, []);

  const handleToggleSolved = (slug: string) => {
    toggleProblemSolved(slug);
    setSolvedSet(getSolvedProblems());
  };

  const currentWindow = company.windows[activeTab] || company.windows[0];
  const allProblems = currentWindow?.problems || [];

  // Extract all distinct topics with their counts for the current window
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allProblems) {
      for (const t of p.topics) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allProblems]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return allProblems.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesTopic = p.topics.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesTopic) return false;
      }
      // Difficulty
      if (difficultyFilter !== 'ALL' && p.difficulty !== difficultyFilter) {
        return false;
      }
      // Topic
      if (selectedTopic && !p.topics.includes(selectedTopic)) {
        return false;
      }
      // Hide Solved
      if (hideSolved && solvedSet.has(p.slug)) {
        return false;
      }
      return true;
    });
  }, [allProblems, searchQuery, difficultyFilter, selectedTopic, hideSolved, solvedSet]);

  // Sorted problems
  const sortedProblems = useMemo(() => {
    return [...filteredProblems].sort((a, b) => {
      let result = 0;
      if (sortBy === 'frequency') {
        result = a.frequency - b.frequency;
      } else if (sortBy === 'acceptance') {
        result = a.acceptance - b.acceptance;
      } else if (sortBy === 'difficulty') {
        const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
        result = (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
      } else if (sortBy === 'title') {
        result = a.title.localeCompare(b.title);
      }
      return sortDir === 'desc' ? -result : result;
    });
  }, [filteredProblems, sortBy, sortDir]);

  const handleSort = (column: 'frequency' | 'difficulty' | 'title' | 'acceptance') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir(column === 'title' ? 'asc' : 'desc');
    }
  };

  const handleRandomProblem = () => {
    if (sortedProblems.length === 0) return;
    const unsolved = sortedProblems.filter((p) => !solvedSet.has(p.slug));
    const pool = unsolved.length > 0 ? unsolved : sortedProblems;
    const random = pool[Math.floor(Math.random() * pool.length)];
    window.open(random.link, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Difficulty', 'Frequency', 'Acceptance %', 'Solved', 'Link', 'Topics'];
    const rows = sortedProblems.map((p) => [
      `"${p.title.replace(/"/g, '""')}"`,
      p.difficulty,
      p.frequency,
      (p.acceptance * 100).toFixed(1) + '%',
      solvedSet.has(p.slug) ? 'YES' : 'NO',
      p.link,
      `"${p.topics.join(', ')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${company.slug}-questions-${currentWindow.key}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Company solved stats
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
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--text-main)] flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All companies</span>
        </Link>
        <span>/</span>
        <span className="text-[var(--text-main)] font-medium">{company.name}</span>
      </nav>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            {faviconUrl ? (
              <img src={faviconUrl} alt="" width={36} height={36} className="w-9 h-9 object-contain" />
            ) : (
              <span className="text-base font-bold text-stone-700">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
              {company.name} LeetCode Questions
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-main)]">{company.total}</span> questions all-time
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{company.easy} Easy</span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">{company.medium} Medium</span>
              <span>•</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">{company.hard} Hard</span>
            </div>
          </div>
        </div>

        {/* Solved Progress Counter */}
        <div className="flex items-center gap-3 bg-[var(--bg-subtle)] border border-[var(--border)] px-4 py-2.5 rounded-xl self-start md:self-auto">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div>
            <div className="text-xs font-semibold text-[var(--text-main)]">
              {companySolvedCount} / {company.total} solved
            </div>
            <div className="w-28 h-1.5 bg-[var(--border)] rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${company.total ? Math.min(100, (companySolvedCount / company.total) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Time Window Tabs */}
      <div className="border-b border-[var(--border)] flex gap-2 overflow-x-auto pb-px scrollbar-none">
        {company.windows.map((win, idx) => (
          <button
            key={win.key}
            onClick={() => {
              setActiveTab(idx);
              setSelectedTopic(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === idx
                ? 'border-[var(--text-main)] text-[var(--text-main)] font-semibold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <span>{win.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === idx
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold'
                  : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {win.count}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter problems or topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Group */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs">
            {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  difficultyFilter === diff
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {diff === 'ALL' ? 'All' : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Random Problem */}
          <button
            onClick={handleRandomProblem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-main)] transition-colors cursor-pointer"
            title="Open a random problem in LeetCode"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-500" />
            <span>Random</span>
          </button>

          {/* Hide Topics Toggle */}
          <button
            onClick={() => setHideTopics(!hideTopics)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              hideTopics
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)]'
            }`}
            title="Hide topic tags for blind interview prep"
          >
            {hideTopics ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Hide topics</span>
          </button>

          {/* Hide Solved Toggle */}
          <button
            onClick={() => setHideSolved(!hideSolved)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              hideSolved
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)]'
            }`}
            title="Hide problems you already solved"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hide solved</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Export filtered list to CSV"
            aria-label="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Topic Chips */}
      {topicCounts.length > 0 && !hideTopics && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {(showAllTopics ? topicCounts : topicCounts.slice(0, 12)).map(([topic, count]) => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(isSelected ? null : topic)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <span>{topic}</span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-[var(--text-light)]'}`}>
                  {count}
                </span>
              </button>
            );
          })}

          {topicCounts.length > 12 && (
            <button
              onClick={() => setShowAllTopics(!showAllTopics)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              <span>{showAllTopics ? 'Show less' : `+${topicCounts.length - 12} more`}</span>
              {showAllTopics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {selectedTopic && (
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-xs text-blue-500 hover:underline ml-2 cursor-pointer"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Problems Table */}
      <div className="border border-[var(--border)] rounded-2xl bg-[var(--bg-card)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)] font-medium">
                <th className="py-3 px-4 w-12 text-center" aria-label="Solved">✓</th>
                <th className="py-3 px-3 w-12 text-center">#</th>
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
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-main)] select-none w-28"
                >
                  <div className="flex items-center gap-1">
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
                  <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                    No problems match the current filter criteria.
                  </td>
                </tr>
              ) : (
                sortedProblems.map((prob, idx) => {
                  const isSolved = solvedSet.has(prob.slug);
                  const accPercent = prob.acceptance > 0 ? (prob.acceptance * 100).toFixed(1) + '%' : '-';
                  const freq = Math.min(100, Math.max(0, prob.frequency));

                  let diffColorClass = 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400';
                  if (prob.difficulty === 'MEDIUM') {
                    diffColorClass = 'text-amber-600 bg-amber-500/10 dark:text-amber-400';
                  } else if (prob.difficulty === 'HARD') {
                    diffColorClass = 'text-rose-600 bg-rose-500/10 dark:text-rose-400';
                  }

                  return (
                    <tr
                      key={prob.slug || prob.title}
                      className={`hover:bg-[var(--bg-hover)] transition-colors group ${
                        isSolved ? 'opacity-70 bg-emerald-500/[0.02]' : ''
                      }`}
                    >
                      {/* Solved Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSolved(prob.slug)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                            isSolved
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-[var(--border)] hover:border-emerald-500'
                          }`}
                          aria-label={`Mark ${prob.title} as ${isSolved ? 'unsolved' : 'solved'}`}
                        >
                          {isSolved && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Index */}
                      <td className="py-3 px-3 text-center text-[var(--text-light)] text-[11px] font-mono">
                        {idx + 1}
                      </td>

                      {/* Title & Topics */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <a
                            href={prob.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 font-medium hover:text-blue-500 transition-colors ${
                              isSolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'
                            }`}
                          >
                            <span>{prob.title}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </a>

                          {!hideTopics && prob.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {prob.topics.map((t) => (
                                <button
                                  key={t}
                                  onClick={() => setSelectedTopic(t)}
                                  className="text-[10px] text-[var(--text-light)] hover:text-[var(--text-muted)] hover:underline"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${diffColorClass}`}>
                          {prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Frequency */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${freq}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-[var(--text-muted)]">
                            {freq.toFixed(0)}
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

        {/* Footer Info */}
        <div className="py-3 px-4 border-t border-[var(--border)] bg-[var(--bg-subtle)]/50 text-xs text-[var(--text-muted)] flex items-center justify-between">
          <span>Showing {sortedProblems.length} of {allProblems.length} questions</span>
          <span>Window: {currentWindow.name}</span>
        </div>
      </div>
    </div>
  );
};
