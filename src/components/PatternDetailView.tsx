'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Shuffle,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Download,
  Building2,
  X,
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
  Copy,
  Check,
  Target,
  AlertTriangle,
  Code2,
  Zap,
  ArrowUpDown,
  ChevronDown,
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
  allPatterns?: { slug: string; name: string; category: string; total: number }[];
}

export const PatternDetailView: React.FC<PatternDetailViewProps> = ({ pattern, allPatterns = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [hideTopics, setHideTopics] = useState(false);
  const [hideSolved, setHideSolved] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const solvedSet = useSolvedProblems();

  const [sortBy, setSortBy] = useState<'companiesCount' | 'difficulty' | 'title' | 'acceptance' | 'id' | 'frequency'>('companiesCount');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

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
    const solved = toggleProblemSolved(prob.slug, { id: prob.id, title: prob.title, difficulty: prob.difficulty });

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
      const seen = new Set<string>();
      for (const c of p.companies) {
        if (seen.has(c.slug)) continue;
        seen.add(c.slug);
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

  const handleCopyTemplate = () => {
    if (!guide?.template) return;
    navigator.clipboard.writeText(guide.template);
    setCopiedTemplate(true);
    toast.success('Python template copied to clipboard');
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

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

      {/* Minimal Hero Header (Unboxed, matching Homepage) */}
      <section className="text-center max-w-2xl mx-auto space-y-3 pt-1">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--text-main)]">
            <IconComponent className="w-6 h-6 opacity-80" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
            {pattern.name}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
            {pattern.category}
          </span>
        </div>

        <p className="text-sm text-[var(--text-muted)] font-normal max-w-xl mx-auto leading-relaxed">
          {pattern.tagline}
        </p>

        {/* Breakdown Stats */}
        <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[var(--text-muted)] font-normal flex-wrap">
          <span>{pattern.total} problems</span>
          <span className="opacity-30">·</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{pattern.easy} Easy</span>
          <span className="opacity-30">·</span>
          <span className="text-amber-600 dark:text-amber-400 font-medium">{pattern.medium} Medium</span>
          <span className="opacity-30">·</span>
          <span className="text-rose-600 dark:text-rose-400 font-medium">{pattern.hard} Hard</span>
          {patternSolvedCount > 0 && (
            <>
              <span className="opacity-30">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{patternSolvedCount} solved</span>
            </>
          )}
        </div>
      </section>

      {/* Pattern Study Guide & Cheat Sheet (Sleek Collapsible) */}
      {guide && (
        <details className="group max-w-4xl mx-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-all text-xs">
          <summary className="apple-press flex items-center justify-between px-5 py-3 cursor-pointer select-none text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors bg-[var(--bg-subtle)]/30 font-medium">
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-[var(--text-main)]">
                Pattern Study Guide & Cheat Sheet
              </span>
              <span className="text-[11px] text-[var(--text-light)] font-normal hidden sm:inline">
                · {guide.complexity.time} · {guide.complexity.space}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] group-open:rotate-180 transition-transform">▼</span>
          </summary>

          <div className="border-t border-[var(--border)] p-5 space-y-5">
            {/* Intuition & Core Invariant */}
            <div className="space-y-1">
              <p className="text-xs text-[var(--text-main)] font-medium leading-relaxed">
                {guide.summary}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                <span className="text-[var(--text-light)]">Core Invariant: </span>
                {guide.mentalModel}
              </p>
            </div>

            {/* Clean 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3 border-t border-[var(--border)]">
              {/* Left Column: Recognition & Blueprint */}
              <div className="space-y-4">
                {/* Recognition Triggers */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Recognize it (Keywords & Signals)</span>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {guide.triggers.map((trigger, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-muted)] leading-relaxed">
                        <span className="mt-[7px] w-1 h-1 rounded-full bg-emerald-500/80 shrink-0" />
                        <span>{trigger}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* When NOT to use */}
                {guide.whenNotToUse && (
                  <div className="border-l-2 border-amber-500/40 pl-3 py-1 space-y-0.5">
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      When NOT to use
                    </span>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {guide.whenNotToUse}
                    </p>
                  </div>
                )}

                {/* Step-by-Step Blueprint */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
                    <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                    <span>How to solve (Step-by-step)</span>
                  </div>
                  <ol className="space-y-1.5 pl-1">
                    {guide.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--text-muted)]">
                        <span className="font-mono text-[10px] text-[var(--text-light)] shrink-0 mt-0.5">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Interview Traps */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Watch for (Interview Traps)</span>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {guide.pitfalls.map((pitfall, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-muted)] leading-relaxed">
                        <span className="mt-[7px] w-1 h-1 rounded-full bg-amber-500/70 shrink-0" />
                        <span>{pitfall}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Code Template & Canonical Problems */}
              <div className="space-y-4">
                {/* Python Template */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
                      <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{guide.templateName || 'Cheat sheet'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyTemplate}
                      className="apple-press inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)]/40 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                      title="Copy code template"
                    >
                      {copiedTemplate ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]/40">
                    <pre className="p-3 text-[11px] leading-relaxed text-[var(--text-main)] overflow-x-auto font-mono whitespace-pre">
                      <code>{guide.template}</code>
                    </pre>
                  </div>

                  <dl className="space-y-1 pt-0.5 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-14 shrink-0 text-[var(--text-light)]">Cost</dt>
                      <dd className="text-[var(--text-muted)]">
                        {guide.complexity.time} · {guide.complexity.space}
                        {guide.complexity.note && <span className="opacity-70"> ({guide.complexity.note})</span>}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Canonical Problems */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>Canonical problems</span>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {guide.canonicalProblems.map((prob, idx) => (
                      <div key={idx} className="text-xs text-[var(--text-muted)] leading-relaxed">
                        <span className="font-medium text-[var(--text-main)]">
                          {prob.id ? `#${prob.id} ` : ''}{prob.name}:
                        </span>{' '}
                        <span>{prob.why}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </details>
      )}

      {/* Apple Spotlight Search Bar (Centered) */}
      <div className="max-w-2xl mx-auto">
        <div className="relative group flex items-center h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]/30 focus-within:border-[var(--text-main)]/35 shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-200">
          <Search className="absolute left-4.5 w-4 h-4 text-[var(--text-light)] group-focus-within:text-[var(--text-main)] transition-colors pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${pattern.name} problems (#15, 3Sum, Two Pointers...)...`}
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
          {/* Row 1: Company & Difficulty */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Company Filter */}
            <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-main)]">
              <Building2 className="w-3.5 h-3.5 opacity-70 shrink-0" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none pr-4 text-inherit"
                aria-label="Filter by company"
              >
                <option value="ALL" className="bg-[var(--bg-card)] text-[var(--text-main)]">All Companies</option>
                {companyOptions.map(([slug, { name, count }]) => (
                  <option key={slug} value={slug} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                    {name} ({count})
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
                aria-label="Sort pattern problems"
              >
                <option value="companiesCount" className="bg-[var(--bg-card)] text-[var(--text-main)]">Companies Asking</option>
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
                title="Open random problem"
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
          {/* Primary Filter Row: Company Selector & Quick Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
            {/* Company Filter Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] text-xs text-[var(--text-muted)] self-start md:self-auto">
              <Building2 className="w-3.5 h-3.5 opacity-70" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="bg-transparent text-[var(--text-main)] font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Companies</option>
                {companyOptions.map(([slug, { name, count }]) => (
                  <option key={slug} value={slug}>
                    {name} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-1 self-start md:self-auto shrink-0 text-xs">
              <button
                onClick={handleRandomProblem}
                className="apple-press px-2.5 py-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors flex items-center gap-1 cursor-pointer"
                title="Open random problem in this pattern"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Random</span>
              </button>
              <button
                onClick={() => setHideTopics(!hideTopics)}
                className={`apple-press px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  hideTopics
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-main)] font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
                }`}
                title="Toggle topic labels"
              >
                {hideTopics ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>Topics</span>
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
                title="Export pattern problems to CSV"
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

      {/* Problem Table & Mobile Cards */}
      <div className="apple-enter border border-[var(--border)] rounded-3xl bg-[var(--bg-card)] overflow-hidden shadow-xs">
        {/* Mobile Problems Card List (No horizontal table scrolling needed) */}
        <div className="md:hidden divide-y divide-[var(--border)]">
          {sortedProblems.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
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
          ) : (
            sortedProblems.map((prob) => {
              const isSolved = solvedSet.has(prob.slug);
              const accPercent = prob.acceptance > 0
                ? (prob.acceptance <= 1 ? (prob.acceptance * 100).toFixed(1) : prob.acceptance.toFixed(1)) + '%'
                : '-';
              const freq = Math.min(100, Math.max(0, prob.maxFrequency));

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
                    {isSolved && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5] apple-check-pop" />}
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
                        rel="nofollow noopener noreferrer"
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
                      <span>{prob.companiesCount} companies</span>
                      {freq > 0 && (
                        <>
                          <span>·</span>
                          <span>Max freq {freq.toFixed(0)}%</span>
                        </>
                      )}
                      <span>·</span>
                      <span>Acc {accPercent}</span>
                    </div>

                    {/* Top Companies Chips */}
                    {prob.companies && prob.companies.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        {prob.companies.slice(0, 3).map((c) => (
                          <span
                            key={c.slug}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-light)]"
                          >
                            {c.name}
                          </span>
                        ))}
                        {prob.companies.length > 3 && (
                          <span className="text-[9px] text-[var(--text-light)]">+{prob.companies.length - 3}</span>
                        )}
                      </div>
                    )}
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
                            rel="nofollow noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 font-medium hover:text-[var(--text-main)] hover:underline transition-colors ${
                              isSolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'
                            }`}
                          >
                            <span>{prob.title}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </a>

                          {!hideTopics && prob.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {prob.topics.map((t, tIdx) => (
                                <span
                                  key={`${t}-${tIdx}`}
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
                          {Array.from(new Map(prob.companies.map((c) => [c.slug, c])).values())
                            .slice(0, 4)
                            .map((c, cIdx) => (
                              <Link
                                key={`${prob.slug || prob.id || prob.title}-${c.slug}-${cIdx}`}
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

      {/* Pattern Stepping Navigation (Previous & Next) */}
      {allPatterns.length > 1 && (() => {
        const curIdx = allPatterns.findIndex((p) => p.slug === pattern.slug);
        const prevP = curIdx > 0 ? allPatterns[curIdx - 1] : allPatterns[allPatterns.length - 1];
        const nextP = curIdx >= 0 && curIdx < allPatterns.length - 1 ? allPatterns[curIdx + 1] : allPatterns[0];

        return (
          <nav aria-label="Pattern roadmap navigation" className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {prevP && (
              <Link
                href={`/patterns/${prevP.slug}`}
                className="apple-press p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]/40 transition-all flex items-center gap-3 shadow-xs group"
              >
                <div className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)] transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-muted)]">Previous Pattern</span>
                  <p className="text-xs font-semibold text-[var(--text-main)] truncate">{prevP.name}</p>
                </div>
              </Link>
            )}
            {nextP && (
              <Link
                href={`/patterns/${nextP.slug}`}
                className="apple-press p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--text-muted)]/40 transition-all flex items-center justify-between gap-3 shadow-xs group text-right sm:text-right"
              >
                <div className="min-w-0 flex-1 text-left sm:text-right">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-muted)]">Next Pattern</span>
                  <p className="text-xs font-semibold text-[var(--text-main)] truncate">{nextP.name}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            )}
          </nav>
        );
      })()}

      {/* Top Companies Asking This Pattern (Cross-Domain Linking) */}
      {pattern.topCompanies && pattern.topCompanies.length > 0 && (
        <section className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Top Companies Testing {pattern.name}</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Browse company-specific interview problem lists and recency breakdowns:
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {pattern.topCompanies.map((cName) => {
              const cSlug = cName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              return (
                <Link
                  key={cName}
                  href={`/company/${cSlug}`}
                  className="apple-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--text-muted)]/40 transition-colors"
                >
                  <Building2 className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>{cName} Questions</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Explore All 22 Coding Patterns Directory (Full Mesh Inter-linking) */}
      {allPatterns.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[var(--accent)]" />
                <span>Explore All 22 DSA Coding Patterns</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Master core algorithmic patterns tested in FAANG & Big Tech coding interviews.
              </p>
            </div>
            <Link
              href="/patterns"
              className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Patterns Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {allPatterns.map((p) => {
                const isCurrent = p.slug === pattern.slug;
                return (
                  <Link
                    key={p.slug}
                    href={`/patterns/${p.slug}`}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isCurrent
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] pointer-events-none'
                        : 'bg-[var(--bg-subtle)]/70 hover:bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-main)] hover:border-[var(--text-muted)]/40'
                    }`}
                  >
                    <span>{p.name}</span>
                    {p.total > 0 && (
                      <span className={`text-[10px] tabular-nums ${isCurrent ? 'opacity-80' : 'text-[var(--text-muted)]'}`}>
                        ({p.total})
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
