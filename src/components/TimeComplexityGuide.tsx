'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import {
  Clock, Zap, TrendingUp, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronRight, BookOpen, Code2, Layers, Info, BarChart3, GitMerge, ArrowLeft,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   HELPER COMPONENTS
══════════════════════════════════════════════════════════ */

function SectionCard({
  id, icon, title, subtitle, children, defaultOpen = true,
}: {
  id?: string;
  icon: React.ReactNode; title: string; subtitle: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="apple-card scroll-mt-20 rounded-2xl border border-[var(--border)]/50 bg-[var(--bg-card)] overflow-hidden transition-all shadow-xs">
      <button
        onClick={() => setOpen(!open)}
        className="apple-press w-full flex items-center justify-between gap-4 p-4 sm:p-4.5 text-left hover:bg-[var(--bg-subtle)]/30 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]"
        aria-expanded={open}
        aria-controls={id ? `${id}-content` : undefined}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 text-[var(--text-muted)]">
            {icon}
          </div>
          <div className="min-w-0">
            <h2 id={id ? `${id}-title` : undefined} className="text-sm font-semibold text-[var(--text-main)] leading-snug">{title}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate font-normal">{subtitle}</p>
          </div>
        </div>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 opacity-60" />
          : <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 opacity-60" />}
      </button>
      {open && (
        <div id={id ? `${id}-content` : undefined} aria-labelledby={id ? `${id}-title` : undefined} className="min-w-0 px-4 sm:px-5 pb-5 border-t border-[var(--border)]/40">
          <div className="pt-4 space-y-4">{children}</div>
        </div>
      )}
    </div>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)]/60 bg-[var(--bg-card)]">
      {label && (
        <div className="px-3.5 py-1 bg-[var(--bg-subtle)]/40 border-b border-[var(--border)]/40 text-[10px] font-mono text-[var(--text-light)] tracking-wider uppercase">
          {label}
        </div>
      )}
      <pre className="p-3.5 text-xs leading-relaxed text-[var(--text-main)] bg-transparent overflow-x-auto font-mono whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function Callout({ type, children }: { type: 'tip' | 'warning' | 'info'; children: React.ReactNode }) {
  const map = {
    tip:     { cls: 'bg-emerald-500/5 text-emerald-800 dark:text-emerald-300', Icon: CheckCircle2 },
    warning: { cls: 'bg-amber-500/5 text-amber-800 dark:text-amber-300',     Icon: AlertTriangle },
    info:    { cls: 'bg-blue-500/5 text-blue-800 dark:text-blue-300',          Icon: Info },
  };
  const { cls, Icon } = map[type];
  return (
    <div className={`flex gap-2.5 p-3 rounded-xl border border-[var(--border)]/60 text-xs leading-relaxed ${cls}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
      <div>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SVG: BIG O GROWTH CURVES CHART
══════════════════════════════════════════════════════════ */
function ComplexityChart() {
  const W = 540, H = 280;
  const pad = { l: 46, t: 18, r: 18, b: 38 };
  const cW = W - pad.l - pad.r;   // 476
  const cH = H - pad.t - pad.b;   // 224
  const nMin = 1, nMax = 8, maxVal = 72;

  const xS = (n: number) => pad.l + ((n - nMin) / (nMax - nMin)) * cW;
  const yS = (v: number) => pad.t + cH - (Math.min(Math.max(v, 0), maxVal) / maxVal) * cH;

  const pts = Array.from({ length: 120 }, (_, i) => nMin + (i / 119) * (nMax - nMin));

  const curves: { label: string; fn: (n: number) => number; color: string }[] = [
    { label: 'O(1)',      fn: ()  => 1,                      color: '#10b981' },
    { label: 'O(log n)',  fn: n   => Math.log2(n),           color: '#34d399' },
    { label: 'O(n)',      fn: n   => n,                       color: '#fbbf24' },
    { label: 'O(n log n)',fn: n   => n * Math.log2(n),        color: '#f97316' },
    { label: 'O(n²)',     fn: n   => n * n,                   color: '#ef4444' },
    { label: 'O(2ⁿ)',     fn: n   => Math.pow(2, n),          color: '#a855f7' },
  ];

  const makePath = (fn: (n: number) => number) =>
    pts.map((n, i) => {
      const x = xS(n).toFixed(1);
      const y = Math.max(pad.t, yS(fn(n))).toFixed(1);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

  const gridYFracs = [0, 0.25, 0.5, 0.75, 1];
  const xTicks = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label="Big O complexity growth curves chart">
      {/* horizontal grid */}
      {gridYFracs.map(t => {
        const y = pad.t + t * cH;
        return <line key={t} x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />;
      })}
      {/* vertical grid */}
      {xTicks.map(n => (
        <line key={n} x1={xS(n)} x2={xS(n)} y1={pad.t} y2={pad.t + cH} stroke="currentColor" strokeOpacity={0.05} strokeWidth={1} />
      ))}

      {/* curves */}
      {curves.map(({ label, fn, color }) => (
        <path key={label} d={makePath(fn)} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      ))}

      {/* axes */}
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + cH} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1} />
      <line x1={pad.l} x2={W - pad.r} y1={pad.t + cH} y2={pad.t + cH} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1} />

      {/* x ticks + labels */}
      {xTicks.map(n => (
        <g key={n}>
          <line x1={xS(n)} x2={xS(n)} y1={pad.t + cH} y2={pad.t + cH + 4} stroke="currentColor" strokeOpacity={0.3} />
          <text x={xS(n)} y={pad.t + cH + 16} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.45}>{n}</text>
        </g>
      ))}

      {/* axis labels */}
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.4}>Input size (n)</text>
      <text x={12} y={H / 2} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.4}
        transform={`rotate(-90 12 ${H / 2})`}>Operations</text>

      {/* clamp annotation for 2^n */}
      <text x={xS(6.3)} y={pad.t + 10} fontSize={8} fill="#a855f7" opacity={0.75} textAnchor="middle">↑ 2ⁿ exceeds chart</text>

      {/* legend — 2 columns */}
      {curves.map(({ label, color }, i) => {
        const col = i < 3 ? 0 : 1;
        const row = i % 3;
        const lx = pad.l + 10 + col * 118;
        const ly = pad.t + 20 + row * 17;
        return (
          <g key={label}>
            <line x1={lx} x2={lx + 16} y1={ly + 5} y2={ly + 5} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            <text x={lx + 20} y={ly + 9} fontSize={9} fill={color} fontWeight="600">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   SVG: MERGE SORT RECURSION TREE (n=8)
══════════════════════════════════════════════════════════ */
function RecursionTreeDiagram() {
  const W = 560, H = 230;
  // node: 38×20, half: 19×10
  const nHW = 19, nHH = 10;

  const levels = [
    { y: 28,  label: 'n = 8',   work: 'O(n) merge', color: '#10b981', nodes: [{ x: 250, t: '[1..8]' }] },
    { y: 88,  label: 'n = 4',   work: 'O(n) merge', color: '#10b981', nodes: [{ x: 125, t: '[1..4]' }, { x: 375, t: '[5..8]' }] },
    { y: 148, label: 'n = 2',   work: 'O(n) merge', color: '#10b981', nodes: [{ x: 63, t: '[1,2]' }, { x: 188, t: '[3,4]' }, { x: 313, t: '[5,6]' }, { x: 438, t: '[7,8]' }] },
    { y: 200, label: 'n = 1',   work: 'base case',  color: '#f59e0b', nodes: [
      { x: 31, t: '1' }, { x: 94, t: '2' }, { x: 156, t: '3' }, { x: 219, t: '4' },
      { x: 281, t: '5' }, { x: 344, t: '6' }, { x: 406, t: '7' }, { x: 469, t: '8' },
    ]},
  ];

  // edges: [x1,y1, x2,y2]
  const edges: [number, number, number, number][] = [
    [250, 28+nHH, 125, 88-nHH], [250, 28+nHH, 375, 88-nHH],
    [125, 88+nHH, 63, 148-nHH], [125, 88+nHH, 188, 148-nHH],
    [375, 88+nHH, 313, 148-nHH], [375, 88+nHH, 438, 148-nHH],
    [63, 148+nHH, 31, 200-nHH], [63, 148+nHH, 94, 200-nHH],
    [188, 148+nHH, 156, 200-nHH], [188, 148+nHH, 219, 200-nHH],
    [313, 148+nHH, 281, 200-nHH], [313, 148+nHH, 344, 200-nHH],
    [438, 148+nHH, 406, 200-nHH], [438, 148+nHH, 469, 200-nHH],
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label="Merge sort recursion tree diagram">
      {/* edges */}
      {edges.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={0.18} strokeWidth={1.2} />
      ))}

      {/* nodes + level annotations */}
      {levels.map((lv, li) => (
        <g key={li}>
          {/* right-side annotation */}
          <text x={W - 4} y={lv.y + 5} fontSize={9} fill={lv.color} opacity={0.9} textAnchor="end" fontWeight="600">
            {lv.work}
          </text>

          {lv.nodes.map((node, ni) => (
            <g key={ni}>
              <rect
                x={node.x - nHW} y={lv.y - nHH}
                width={nHW * 2} height={nHH * 2}
                rx={5}
                fill="var(--bg-subtle)"
                stroke="currentColor"
                strokeOpacity={li === 3 ? 0.12 : 0.2}
                strokeWidth={1}
              />
              <text x={node.x} y={lv.y + 4} textAnchor="middle"
                fontSize={li === 3 ? 8 : 9} fill="currentColor" opacity={0.8} fontFamily="monospace">
                {node.t}
              </text>
            </g>
          ))}
        </g>
      ))}

      {/* bottom total label */}
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.45}>
        log₂8 = 3 levels × O(n) merge work per level → O(n log n)
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   GROWTH RATE TABLE
══════════════════════════════════════════════════════════ */
function GrowthRateTable() {
  const ns = [10, 100, 1_000, 10_000, 1_000_000];
  const comps: { label: string; fn: (n: number) => number }[] = [
    { label: 'O(log n)',   fn: n => Math.log2(n) },
    { label: 'O(n)',       fn: n => n },
    { label: 'O(n log n)', fn: n => n * Math.log2(n) },
    { label: 'O(n²)',      fn: n => n * n },
    { label: 'O(2ⁿ)',      fn: n => Math.pow(2, n) },
  ];

  const fmt = (v: number): string => {
    if (!isFinite(v) || v > 1e15) return '∞';
    if (v > 1e12) return '> 10¹²';
    if (v > 1e9)  return `~${(v / 1e9).toFixed(0)}B`;
    if (v > 1e6)  return `~${(v / 1e6).toFixed(0)}M`;
    if (v > 1e3)  return `~${(v / 1e3).toFixed(0)}K`;
    return Math.round(v).toLocaleString();
  };

  const cellCls = (v: number): string => {
    if (!isFinite(v) || v > 1e12) return 'text-[var(--text-muted)] opacity-40';
    if (v > 1e9)  return 'text-rose-600 dark:text-rose-400 font-bold';
    if (v > 1e8)  return 'text-orange-600 dark:text-orange-400 font-semibold';
    if (v > 1e7)  return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const cellBg = (v: number): string => {
    if (!isFinite(v) || v > 1e12) return '';
    if (v > 1e9)  return 'bg-rose-500/6';
    if (v > 1e8)  return 'bg-orange-500/6';
    if (v > 1e7)  return 'bg-amber-500/6';
    return 'bg-emerald-500/6';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]/50 bg-[var(--bg-card)]">
      <table className="w-full text-xs min-w-[480px]">
        <thead>
          <tr className="bg-[var(--bg-subtle)]/60 border-b border-[var(--border)]/40">
            <th className="text-left px-3 py-2.5 font-semibold text-[var(--text-main)]">n</th>
            {comps.map(c => (
              <th key={c.label} className="text-center px-3 py-2.5 font-mono font-semibold text-[var(--text-main)]">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]/30">
          {ns.map(n => (
            <tr key={n}>
              <td className="px-3 py-2 font-mono font-bold text-[var(--text-main)]">{n.toLocaleString()}</td>
              {comps.map(c => {
                const v = c.fn(n);
                return (
                  <td key={c.label} className={`px-3 py-2 text-center ${cellBg(v)}`}>
                    <span className={`font-mono ${cellCls(v)}`}>{fmt(v)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[var(--bg-subtle)] border-t border-[var(--border)]">
            <td colSpan={6} className="px-3 py-1.5 text-[10px] text-[var(--text-muted)]">
              <span className="inline-flex gap-3 flex-wrap">
                <span><span className="text-emerald-500">■</span> &lt; 10M ops — fast</span>
                <span><span className="text-amber-500">■</span> 10M–100M — approaching limit</span>
                <span><span className="text-orange-500">■</span> 100M–1B — probably TLE</span>
                <span><span className="text-rose-500">■</span> &gt; 1B — TLE</span>
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   VISUAL COMPLEXITY BAR
══════════════════════════════════════════════════════════ */
function ComplexityBar({
  label, note, pct, color, rating,
}: { label: string; note: string; pct: number; color: string; rating: string }) {
  const colorMap: Record<string, string> = {
    green:  'bg-emerald-500',
    lime:   'bg-emerald-400',
    yellow: 'bg-amber-400',
    orange: 'bg-orange-500',
    red:    'bg-rose-500',
    purple: 'bg-purple-500',
  };
  const textMap: Record<string, string> = {
    green:  'text-emerald-600 dark:text-emerald-400',
    lime:   'text-emerald-600 dark:text-emerald-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red:    'text-rose-600 dark:text-rose-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <code className={`shrink-0 text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] ${textMap[color]}`}>
            {label}
          </code>
          <span className="text-xs text-[var(--text-muted)] truncate font-normal">{note}</span>
        </div>
        <span className={`text-[10px] font-medium shrink-0 opacity-80 ${textMap[color]}`}>{rating}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PATTERN TABLE ROW
══════════════════════════════════════════════════════════ */
function PatternRow({
  name, time, space, why, timeColor,
}: { name: string; time: string; space: string; why: string; timeColor: 'green' | 'yellow' | 'orange' | 'red' }) {
  const timeCls = {
    green:  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    yellow: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    red:    'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };

  return (
    <div className="p-3 rounded-xl bg-[var(--bg-subtle)]/50 hover:bg-[var(--bg-subtle)] transition-colors space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[var(--text-main)]">{name}</span>
        <code className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-medium ${timeCls[timeColor]}`}>
          {time}
        </code>
        <code className="px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-muted)] text-[11px] font-mono">
          {space}
        </code>
      </div>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">{why}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export function TimeComplexityGuide() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="guide-reading flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-normal flex-wrap">
          <Link href="/patterns" className="apple-press hover:text-[var(--text-main)] flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Patterns Hub</span>
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-[var(--text-main)] font-medium">Time &amp; Space Complexity</span>
        </nav>

        {/* Minimal Hero */}
        <section className="text-center max-w-2xl mx-auto space-y-2.5 pt-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
            Time &amp; Space Complexity
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-normal leading-relaxed">
            The visual guide to analyzing algorithm efficiency — Big O notation,
            recursion trees, and complexity for every interview pattern.
          </p>
        </section>

        {/* Flat Nav Jump Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <a href="#time-complexity" className="apple-press px-3 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors font-medium">
            Big O reference
          </a>
          <a href="#python-essentials" className="apple-press px-3 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors font-medium">
            Python essentials
          </a>
        </div>

        {/* ══ 1. What Is Complexity? ══ */}
        <SectionCard icon={<BookOpen className="w-4 h-4" />}
          title="1 · What Is Complexity Analysis?"
          subtitle="Understanding what we're measuring and why it matters">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Complexity analysis answers:{' '}
            <strong className="text-[var(--text-main)]">
              how does runtime (or memory) grow as input size grows?
            </strong>{' '}
            We express this with <em>Big O notation</em>.
          </p>
          <Callout type="info">
            <strong>Why not just time it?</strong> Wall-clock time depends on hardware and OS load.
            Big O describes the <em>mathematical relationship</em> between input size and operations
            — valid on any machine.
          </Callout>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {[
              { term: 'n', def: 'The input size — array length, node count, string length, etc.' },
              { term: 'T(n)', def: 'The exact number of operations as a function of n' },
              { term: 'O(f(n))', def: 'Upper bound — T(n) grows no faster than f(n) times a constant' },
            ].map(({ term, def }) => (
              <div key={term} className="p-3 rounded-xl bg-[var(--bg-subtle)]/60 space-y-1">
                <code className="text-sm font-mono font-bold text-[var(--text-main)]">{term}</code>
                <p className="text-xs text-[var(--text-muted)] leading-snug">{def}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {[
              { term: 'Best case Ω', def: 'Lower bound on runtime — the algorithm is at least this fast' },
              { term: 'Average Θ', def: 'Tight bound — the algorithm runs in exactly this class on average' },
              { term: 'Worst case O', def: 'Upper bound — interviews always ask for this one' },
            ].map(({ term, def }) => (
              <div key={term} className="p-3 rounded-xl bg-[var(--bg-subtle)]/60 space-y-1">
                <code className="text-sm font-mono font-bold text-[var(--text-main)]">{term}</code>
                <p className="text-xs text-[var(--text-muted)] leading-snug">{def}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══ 2. The Growth Curves Chart ══ */}
        <SectionCard icon={<BarChart3 className="w-4 h-4" />}
          title="2 · Growth Curves Visualized"
          subtitle="How every Big O class actually looks as n increases">
          <div className="rounded-xl bg-[var(--bg-subtle)]/40 border border-[var(--border)]/40 p-4">
            <img src="/assets/complexity/growth_curves.jpg" alt="Big O growth curves chart" className="w-full h-auto" />
          </div>
          <Callout type="tip">
            Notice how <strong>O(2ⁿ)</strong> shoots off the chart before n=7, while{' '}
            <strong>O(1)</strong> and <strong>O(log n)</strong> are nearly flat — this visual
            gap is why algorithm choice matters so much for large inputs.
          </Callout>

          {/* Growth Rate Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wide">
              Actual Operation Counts for Common Input Sizes
            </h3>
            <GrowthRateTable />
          </div>
        </SectionCard>

        {/* ══ 3. Complexity Ladder with Bars ══ */}
        <SectionCard icon={<TrendingUp className="w-4 h-4" />}
          title="3 · The Complexity Ladder"
          subtitle="All Big O classes from fastest to slowest — with visual performance bars">
          <p className="text-xs text-[var(--text-muted)]">
            Bar width represents relative &quot;slowness&quot; on a log scale for n = 10,000.
            The longer the bar, the more operations.
          </p>
          <div className="space-y-3 pt-1">
            <ComplexityBar label="O(1)"      note="Constant — array index, hash map get/set, stack push/pop"       pct={3}  color="green"  rating="Perfect" />
            <ComplexityBar label="O(log n)"  note="Logarithmic — binary search, balanced BST, heap push/pop"        pct={9}  color="green"  rating="Excellent" />
            <ComplexityBar label="O(n)"      note="Linear — single loop, BFS/DFS, linear scan"                     pct={28} color="lime"   rating="Good" />
            <ComplexityBar label="O(n log n)" note="Linearithmic — merge sort, heap sort, most built-in sorts"     pct={40} color="yellow" rating="Fair" />
            <ComplexityBar label="O(n²)"     note="Quadratic — nested loops over same input, bubble sort"           pct={65} color="orange" rating="Slow" />
            <ComplexityBar label="O(n³)"     note="Cubic — triple nested loops, Floyd-Warshall (dense graph)"       pct={82} color="red"    rating="Very Slow" />
            <ComplexityBar label="O(2ⁿ)"     note="Exponential — all subsets enumeration (brute force)"            pct={93} color="red"    rating="Avoid" />
            <ComplexityBar label="O(n!)"     note="Factorial — all permutations (brute force TSP)"                  pct={100} color="purple" rating="Never for n>12" />
          </div>
          <Callout type="tip">
            <strong>Interview sizing rule:</strong>{' '}
            ≈ 10⁸ ops/second. n ≤ 10⁵ → O(n log n) fine. n ≤ 10³ → O(n²) fine. n ≤ 25 → O(2ⁿ) fine.
          </Callout>
        </SectionCard>

        {/* ══ 4. Four Golden Rules ══ */}
        <SectionCard icon={<Zap className="w-4 h-4" />}
          title="4 · Four Golden Rules for Calculating Big O"
          subtitle="Apply these rules to any code snippet to get its complexity">

          {/* Rule 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <h3 className="text-xs font-semibold text-[var(--text-main)]">Drop Constants</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-8">
              Multiplicative constants are dropped. Hardware absorbs constants;
              Big O cares only about growth shape.
            </p>
            <div className="pl-8">
              <CodeBlock label="Python example" code={`# Two separate loops → 2n → O(n)  (NOT O(2n))
for i in range(n):
    do_a(i)
for i in range(n):
    do_b(i)

# 100 constant ops inside a loop → still O(n)
for i in range(n):
    x = a + b          # O(1)
    y = c * d          # O(1)
    # ... 98 more O(1) operations`} />
            </div>
          </div>

          {/* Rule 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <h3 className="text-xs font-semibold text-[var(--text-main)]">Drop Lower-Order Terms</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-8">
              Keep only the dominant term. For large n, n² completely dwarfs n.
            </p>
            <div className="pl-8">
              <CodeBlock label="Python simplification examples" code={`O(n² + n)     →  O(n²)
O(n log n + n) →  O(n log n)
O(2ⁿ + n³)    →  O(2ⁿ)
O(500)        →  O(1)

# In code:
for i in range(n):              # O(n²) — dominant
    for j in range(n):
        process(i, j)

for k in range(n):              # + O(n) — dropped
    scan(k)
# Total: O(n²)`} />
            </div>
          </div>

          {/* Rule 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <h3 className="text-xs font-semibold text-[var(--text-main)]">Sequential → Add. Nested → Multiply.</h3>
            </div>
            <div className="pl-8 grid sm:grid-cols-2 gap-3">
              <CodeBlock label="add (sequential)" code={`# O(n) + O(m) = O(n + m)
def two_arrays(a, b):
    for x in a:              # O(n)
        print(x)
    for y in b:              # O(m)
        print(y)
# → O(n + m)  (keep both!)`} />
              <CodeBlock label="multiply (nested)" code={`# O(n) × O(m) = O(n·m)
def pairs(a, b):
    for x in a:              # O(n)
        for y in b:          # × O(m)
            print(x, y)
# → O(n·m)`} />
            </div>
            <div className="pl-8">
              <Callout type="warning">
                When two inputs are <em>different</em> (arrays a and b of sizes n and m),
                write <code>O(n + m)</code> or <code>O(n·m)</code> — never collapse to <code>O(n²)</code>
                unless you know n = m.
              </Callout>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
              <h3 className="text-xs font-semibold text-[var(--text-main)]">Recursion = Work per Call × Number of Calls</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-8">
              Draw the recursion tree. Count nodes (calls) × work per node.
            </p>
            <div className="pl-8">
              <CodeBlock label="Python fibonacci — O(2ⁿ)" code={`# Each call spawns 2 more → binary tree of calls
# Tree has ≈ 2ⁿ nodes, O(1) work each → O(2ⁿ)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)  # 2 calls`} />
            </div>
          </div>
        </SectionCard>

        {/* ══ 5. Recursion Tree Diagram ══ */}
        <SectionCard icon={<GitMerge className="w-4 h-4" />}
          title="5 · Recursion Tree — Merge Sort Explained"
          subtitle="Visual diagram showing why merge sort is O(n log n)">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Merge sort splits the array in half each time (producing <strong>log n levels</strong>),
            then merges each level back together — doing <strong>O(n) total work per level</strong>.
          </p>
          <div className="rounded-xl bg-[var(--bg-subtle)]/50 p-4">
            <img src="/assets/complexity/merge_sort_tree_minimal.png" alt="Minimal merge sort recursion tree diagram" className="w-full h-auto" />
          </div>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {[
              { label: 'Levels in tree', val: 'log₂n = log₂8 = 3', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Work per level', val: 'O(n) merge ops', color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Total', val: 'O(n) × log n = O(n log n)', color: 'text-[var(--text-main)]' },
            ].map(({ label, val, color }) => (
              <div key={label} className="p-3 rounded-xl bg-[var(--bg-subtle)]/60 space-y-1 text-center">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
                <p className={`text-xs font-mono font-semibold ${color}`}>{val}</p>
              </div>
            ))}
          </div>
          <Callout type="info">
            This same analysis applies to <strong>any divide-and-conquer algorithm</strong> that
            splits in half and does O(n) work to recombine. Quicksort is O(n log n) on average
            for the same reason, but O(n²) worst-case when pivots are poorly chosen.
          </Callout>
        </SectionCard>

        {/* ══ 6. Pattern-by-Pattern ══ */}
        <SectionCard icon={<Code2 className="w-4 h-4" />}
          title="6 · Pattern-by-Pattern Complexity"
          subtitle="Why each DSA pattern has its characteristic Big O — with color-coded time bounds">
          <div className="space-y-2">
            <PatternRow name="Two Pointers"     timeColor="green"  time="O(n)"        space="O(1)"       why="Each pointer moves at most n steps. Even with both moving, combined steps ≤ 2n. Drop the constant → O(n)." />
            <PatternRow name="Sliding Window"   timeColor="green"  time="O(n)"        space="O(k)"       why="right advances n times, left advances at most n times total. Each element enters and leaves the window once." />
            <PatternRow name="Binary Search"    timeColor="green"  time="O(log n)"    space="O(1)"       why="Each comparison halves the remaining space. Starting at n, after k steps we have n/2^k elements. k = log₂n when that reaches 1." />
            <PatternRow name="Prefix Sum"       timeColor="green"  time="O(n) build + O(1) query" space="O(n)" why="One pass to build. Any range sum [i,j] = prefix[j] − prefix[i−1] — a single subtraction." />
            <PatternRow name="Monotonic Stack"  timeColor="green"  time="O(n)"        space="O(n)"       why="Every element is pushed once and popped at most once. Total push + pop operations = 2n." />
            <PatternRow name="Heap / Top-K"     timeColor="yellow" time="O(n log k)"  space="O(k)"       why="Each of n elements is pushed into a k-sized heap. Heap push/pop = O(log k). Total: n × log k." />
            <PatternRow name="BFS / DFS (Graph)"timeColor="green"  time="O(V + E)"    space="O(V)"       why="Each vertex visited once (O(V)). Each edge inspected once from both endpoints (O(E)). Queue holds at most O(V)." />
            <PatternRow name="Tree DFS"         timeColor="green"  time="O(n)"        space="O(h) stack" why="Every node visited once. Stack depth = tree height h. Balanced: h = O(log n). Skewed: h = O(n)." />
            <PatternRow name="Merge Sort / Sort"timeColor="yellow" time="O(n log n)"  space="O(n)"       why="log n levels of recursion. O(n) merge work per level. Python's sorted() is Timsort — same bound." />
            <PatternRow name="1D DP"            timeColor="green"  time="O(n)"        space="O(n)→O(1)"  why="Fill n states, each O(1). Rolling array optimization: drop space to O(1) when only previous 1–2 states needed." />
            <PatternRow name="2D DP"            timeColor="yellow" time="O(m × n)"    space="O(mn)→O(n)" why="Fill every cell in m×n table. Rolling rows reduces space to O(n)." />
            <PatternRow name="Backtracking"     timeColor="red"    time="O(bᵈ)"       space="O(d)"       why="b = branching factor, d = depth. Pruning reduces the constant but not the worst-case class." />
            <PatternRow name="Union-Find"       timeColor="green"  time="O(α(n)) ≈ O(1)" space="O(n)"   why="With path compression + union by rank, α(n) < 5 for any practical n (inverse Ackermann function)." />
            <PatternRow name="Topological Sort" timeColor="green"  time="O(V + E)"    space="O(V + E)"   why="Same analysis as BFS — each vertex and edge processed exactly once via Kahn's algorithm." />
            <PatternRow name="Intervals"        timeColor="yellow" time="O(n log n)"  space="O(n)"       why="Sort by start time (O(n log n)) then one linear pass to merge/process (O(n)). Dominated by sort." />
          </div>
        </SectionCard>

        {/* ══ 7. Space Complexity ══ */}
        <SectionCard icon={<Layers className="w-4 h-4" />}
          title="7 · Space Complexity"
          subtitle="Memory usage — call stack, auxiliary data structures, and the difference">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Space complexity counts all memory <em>your algorithm allocates</em>, excluding
            the read-only input (unless explicitly storing it).
          </p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {[
              { label: 'Variables & Primitives', note: 'Each int, bool, pointer = O(1)' },
              { label: 'Call Stack', note: 'Each recursive frame counts. Depth h → O(h) space' },
              { label: 'Data Structures', note: 'Arrays, sets, maps, queues you create — count their size' },
              { label: 'Output Space', note: 'Often excluded from auxiliary analysis — ask your interviewer' },
            ].map(({ label, note }) => (
              <div key={label} className="p-3.5 rounded-xl bg-[var(--bg-subtle)]/60 space-y-0.5">
                <p className="text-xs font-semibold text-[var(--text-main)]">{label}</p>
                <p className="text-xs text-[var(--text-muted)]">{note}</p>
              </div>
            ))}
          </div>
          <CodeBlock label="Python recursive vs iterative — space trade-off" code={`# RECURSIVE factorial
# Time: O(n) · Space: O(n) — n frames on call stack
def factorial_recursive(n):
    if n <= 1:
        return 1
    return n * factorial_recursive(n - 1)  # stack grows with each call

# ITERATIVE factorial
# Time: O(n) · Space: O(1) — single variable, no stack growth
def factorial_iterative(n):
    result = 1
    for value in range(2, n + 1):
        result *= value
    return result

# DFS on balanced tree of height h = log n
# Time: O(n) · Space: O(log n) — call stack = height
def dfs(node):
    if node is None:
        return 0
    return 1 + dfs(node.left) + dfs(node.right)`} />
          <Callout type="tip">
            Interviewers often ask you to trade space for time.
            A hash map reduces O(n²) brute-force lookup to O(n) time at the cost of O(n) space.
            Learn to recognize and articulate these trade-offs.
          </Callout>
        </SectionCard>

        {/* ══ 8. Step-by-Step Analysis Method ══ */}
        <SectionCard icon={<CheckCircle2 className="w-4 h-4" />}
          title="8 · Step-by-Step: How to Analyze Any Code"
          subtitle="A systematic 6-step method you can apply in any interview">
          <ol className="space-y-3">
            {[
              { step: '1', title: 'Identify input variables', body: 'Name them: n = array length, m = string length, V = vertices, E = edges. Keep separate variables for separate inputs.' },
              { step: '2', title: 'Find every loop and recursive call', body: 'Mark each loop with how many times it runs in terms of your variables. Nested → multiply. Sequential → add.' },
              { step: '3', title: 'Cost of inner work', body: 'Is inner work O(1)? Does it call sort() → O(n log n)? A set lookup → O(1)? Multiply loop count × inner cost.' },
              { step: '4', title: 'Handle recursion with the tree', body: 'Width at each tree level × work per node = cost per level. Sum across log n or n levels.' },
              { step: '5', title: 'Apply the four rules', body: 'Drop constants. Drop lower-order terms. Combine with + or ×. Simplify to dominant term.' },
              { step: '6', title: 'Count space separately', body: 'List every data structure and call stack depth. Sum them. Drop lower-order space terms too.' },
            ].map(({ step, title, body }) => (
              <li key={step} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[10px] font-semibold text-[var(--text-muted)] shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-main)]">{title}</p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <CodeBlock label="Python worked example — two sum O(n) time · O(n) space" code={`def two_sum(nums, target):
    # Step 1: n = len(nums)
    seen = {}  # Space: O(n) — dictionary grows up to n entries

    for i, value in enumerate(nums):       # Step 2: loop runs n times
        complement = target - value         # Step 3: O(1) arithmetic
        if complement in seen:              #         O(1) hash lookup
            return [seen[complement], i]
        seen[value] = i                     #         O(1) hash insert
    return []                               # Inner work: O(1)

# Time:  n × O(1) = O(n)
# Space: O(n) — the dictionary`} />
        </SectionCard>

        {/* ══ 9. Hard Loop Patterns ══ */}
        <SectionCard icon={<TrendingUp className="w-4 h-4" />}
          title="9 · Hard Loop Patterns"
          subtitle="The non-obvious loops that separate O(n) from O(n log n), O(n²), and O(√n)">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Never classify a loop by its syntax alone. Track how the control variable changes and
            count the values it can take. A variable that doubles is logarithmic; a variable that
            grows by a fixed amount is linear; a variable that resets creates a multiplication.
          </p>
          <div className="space-y-3">
            <CodeBlock label="geometric progress — O(log n)" code={`value = 1
while value < n:
    work(value)
    value *= 2

# Values: 1, 2, 4, 8, ...
# After k iterations: 2^k >= n → k = O(log n)`} />
            <CodeBlock label="shrinking by a constant fraction — O(log n)" code={`remaining = n
while remaining > 1:
    work(remaining)
    remaining //= 3

# n, n/3, n/9, ... → O(log n) iterations` } />
            <CodeBlock label="triangular loop — O(n²)" code={`for i in range(n):
    j = i
    while j < n:
        work(i, j)
        j += 1

# Work = n + (n - 1) + ... + 1 = n(n + 1)/2 = O(n²)`} />
            <CodeBlock label="square-root loop — O(√n)" code={`i = 1
while i * i <= n:
    work(i)
    i += 1

# The loop stops when i reaches √n → O(√n)`} />
          </div>
          <Callout type="warning">
            Two loops are not automatically O(n²). If the inner pointer never resets and only
            moves forward across the entire function, the total work can still be O(n).
          </Callout>
          <CodeBlock label="nested-looking but linear — O(n)" code={`left = 0
for right in range(n):
    while left < right and invalid(left, right):
        left += 1

# right moves n times; left also moves at most n times total.
# Total pointer moves ≤ 2n → O(n), not O(n²).`} />
        </SectionCard>

        {/* ══ 10. Recurrences & Amortized Analysis ══ */}
        <SectionCard icon={<GitMerge className="w-4 h-4" />}
          title="10 · Recurrences, Amortized Cost & Hidden Work"
          subtitle="How to analyze divide-and-conquer, dynamic resizing, and library calls">
          <div className="grid sm:grid-cols-2 gap-2.5">
            {[
              { name: 'Binary divide + linear combine', rule: 'T(n) = 2T(n/2) + O(n)', result: 'O(n log n)', note: 'Merge sort' },
              { name: 'One smaller recursive call', rule: 'T(n) = T(n/2) + O(1)', result: 'O(log n)', note: 'Binary search' },
              { name: 'Two calls shrinking by one', rule: 'T(n) = 2T(n − 1) + O(1)', result: 'O(2ⁿ)', note: 'Naive Fibonacci' },
              { name: 'Linear work at every level', rule: 'T(n) = T(n − 1) + O(n)', result: 'O(n²)', note: 'Repeated prefix work' },
            ].map(({ name, rule, result, note }) => (
              <div key={name} className="p-3.5 rounded-xl bg-[var(--bg-subtle)]/50 hover:bg-[var(--bg-subtle)] transition-colors space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[var(--text-main)]">{name}</p>
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">{result}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <code className="text-[11px] font-mono text-[var(--text-muted)]">{rule}</code>
                  <span className="text-[10px] text-[var(--text-light)]">{note}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            For a recurrence, write down the number of recursive calls, the size of each subproblem,
            and the non-recursive work done in the current call. Then use a recursion tree: add the
            work across one level, count the number of levels, and multiply when each level has the same cost.
          </p>
          <CodeBlock label="amortized analysis — dynamic array growth" code={`items = []
for value in values:
    items.append(value)

# Most append operations cost O(1).
# An occasional resize copies k existing items and costs O(k).
# Across n appends, copied totals are 1 + 2 + 4 + ... + n < 2n.
# Total cost = O(n), so average/amortized append = O(1).`} />
          <Callout type="info">
            Amortized O(1) does not mean every operation is O(1). It means a long sequence of
            operations has O(1) average cost per operation. State this distinction explicitly in interviews.
          </Callout>
          <CodeBlock label="hidden work — slicing changes the answer" code={`def bad_merge_sort(values):
    if len(values) <= 1:
        return values
    mid = len(values) // 2
    left = bad_merge_sort(values[:mid])   # slicing copies O(n) here
    right = bad_merge_sort(values[mid:])  # slicing copies O(n) here
    return merge(left, right)             # O(n)

# Recurrence: T(n) = 2T(n/2) + O(n) → O(n log n)
# The slices add O(n) per level, but do not change the class here.
# In a different recursive algorithm, repeated slices can add another factor.`} />
        </SectionCard>

        {/* ══ 11. Common Mistakes ══ */}
        <SectionCard icon={<AlertTriangle className="w-4 h-4" />}
          title="11 · Common Mistakes & Traps"
          subtitle="Things that trip up even experienced engineers">
          <div className="space-y-2.5">
            {[
              { trap: 'String concatenation inside a loop', detail: '"result += char" in a loop can be O(n²) — each concat may copy the whole string. Use a list with append() and join() at the end → O(n).' },
              { trap: 'Calling sort() inside a loop',       detail: 'values.sort() inside an n-iteration loop = O(n² log n) total. Pull sorting out of loops.' },
              { trap: 'Assuming list membership is O(1)',   detail: 'value in a list scans linearly → O(n). Convert to a set first for average O(1) lookups.' },
              { trap: 'Treating two different inputs as one',detail: 'If you take lists A (size n) and B (size m), write O(n + m) or O(n·m), never O(n²) unless you know n = m.' },
              { trap: 'Ignoring slicing cost',             detail: 'values[mid:] creates a new list in O(k), where k is the slice length. Inside recursion it multiplies cost. Use index pointers instead.' },
              { trap: 'Forgetting call stack space',        detail: 'A recursion of depth n uses O(n) call-stack space even if each frame is O(1). Stack overflow is possible for n > ~10,000.' },
              { trap: 'Misidentifying amortized complexity',detail: 'Array push is O(1) amortized, not always O(1). Resizing is O(n) but spread over n pushes gives O(1) average. Don\'t count the resize cost per push.' },
            ].map(({ trap, detail }) => (
              <div key={trap} className="p-3.5 rounded-xl border border-rose-500/15 bg-rose-500/5 space-y-1">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {trap}
                </p>
                <p className="text-xs text-[var(--text-main)] leading-relaxed pl-5">{detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══ 12. Cheat Sheet Table ══ */}
        <SectionCard id="time-complexity" icon={<Zap className="w-4 h-4" />}
          title="12 · Time Complexity Reference"
          subtitle="Quick-reference Big O costs for common operations and data structures">
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]/50 bg-[var(--bg-card)]">
            <table className="w-full text-xs min-w-[420px]">
              <thead>
                <tr className="bg-[var(--bg-subtle)]/60 border-b border-[var(--border)]/40">
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Operation</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Time</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)] hidden sm:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/30">
                {[
                  ['List index [i]',             'O(1)',           'Read or write by index'],
                  ['list.append() / pop()',      'O(1) amortized','May resize occasionally'],
                  ['list.insert(0) / pop(0)',    'O(n)',           'Shifts all elements left/right'],
                  ['List slice [i:j]',            'O(j − i)',       'Copies a segment — not free!'],
                  ['sorted(list)',                'O(n log n)',     'Timsort; returns a new list'],
                  ['value in list',               'O(n)',           'Linear scan — use a set for average O(1)'],
                  ['value in set / dict',         'O(1) avg',       'O(n) worst in rare hash-collision cases'],
                  ['set.add() / dict[key] = val','O(1) amortized', 'Hash-table insertion'],
                  ['String += char',              'O(n) per op',    'Use list.append() + "".join() in loops!'],
                  ['String slice [i:j]',           'O(k)',           'k = length of returned slice'],
                  ['Binary search',              'O(log n)',       'Array must be sorted'],
                  ['Heap push / pop',            'O(log n)',       'n = current heap size'],
                  ['Build heap from array',      'O(n)',           "heapify via Floyd's algorithm"],
                  ['Trie insert / search',       'O(L)',           'L = length of the word'],
                  ['Union-Find find (with PC)',  'O(α(n)) ≈ O(1)','α = inverse Ackermann'],
                  ['BFS / DFS on graph',         'O(V + E)',       'Visits each vertex + edge once'],
                  ['Recursive DFS on tree',      'O(n) time · O(h) space', 'h = tree height'],
                ].map(([op, time, note], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-transparent' : 'bg-[var(--bg-subtle)]/20'}>
                    <td className="px-4 py-2 font-mono text-[var(--text-main)]">{op}</td>
                    <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">{time}</td>
                    <td className="px-4 py-2 text-[var(--text-muted)] hidden sm:table-cell">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* ══ 13. Python Essentials ══ */}
        <SectionCard id="python-essentials" icon={<Code2 className="w-4 h-4" />}
          title="13 · Python LeetCode Essentials"
          subtitle="The built-ins, data structures, and templates used across problem types">
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Python LeetCode Toolkit</h3>
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]/50 bg-[var(--bg-card)]">
              <table className="w-full text-xs min-w-[620px]">
                <thead>
                  <tr className="bg-[var(--bg-subtle)]/60 border-b border-[var(--border)]/40">
                    <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Category</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Python pattern</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Use it for</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    ['Dict', 'd[key] / d.get(key, 0)', 'Frequency maps, memoization, complements', 'O(1) avg'],
                    ['Dict', 'd.setdefault(key, [])', 'Group values without a key-exists branch', 'O(1) avg'],
                    ['Dict', 'd.items() / d.keys() / d.values()', 'Traverse a map or build a lookup', 'O(n) total'],
                    ['Dict', 'collections.defaultdict(int)', 'Counters and graph adjacency lists', 'O(1) avg / access'],
                    ['Dict', 'collections.Counter(values)', 'Counts, most_common(k), anagrams', 'O(n) build'],
                    ['Set', 'seen.add(x) / x in seen', 'Deduplication and constant-time membership', 'O(1) avg'],
                    ['Set', 'a | b / a & b / a - b', 'Union, intersection, and difference', 'O(len operands)'],
                    ['Iteration', 'for i, value in enumerate(values)', 'Index and value together; avoid range(len(...))', 'O(n)'],
                    ['Iteration', 'for left, right in zip(a, b)', 'Walk arrays together; stops at shorter input', 'O(min(n, m))'],
                    ['Iteration', 'zip(*matrix)', 'Transpose a matrix or unpack columns', 'O(rows × cols)'],
                    ['Sorting', 'sorted(values, key=lambda x: x[1])', 'Sort by a field without mutating input', 'O(n log n)'],
                    ['Sorting', 'values.sort(key=..., reverse=True)', 'In-place sort when mutation is safe', 'O(n log n)'],
                    ['Sorting', 'min(values, key=...) / max(...)', 'Best item by a score in one pass', 'O(n)'],
                    ['Logic', 'any(condition(x) for x in values)', 'Existence check with short-circuiting', 'O(n) worst'],
                    ['Logic', 'all(condition(x) for x in values)', 'Validate every item with short-circuiting', 'O(n) worst'],
                    ['Stack', 'stack.append(x) / stack.pop()', 'Parentheses, monotonic stack, DFS', 'O(1) amortized'],
                    ['Queue', 'deque(); q.append(x); q.popleft()', 'BFS and sliding-window queues', 'O(1)'],
                    ['Heap', 'heappush(h, x) / heappop(h)', 'Top-k, scheduling, Dijkstra', 'O(log k)'],
                    ['Heap', 'heapify(values)', 'Turn a list into a min-heap', 'O(n)'],
                    ['Heap', 'heappushpop(h, x)', 'Push then remove smallest efficiently', 'O(log k)'],
                    ['Search', 'bisect_left(a, x) / bisect_right(a, x)', 'First/last insertion position in sorted data', 'O(log n)'],
                    ['Search', 'bisect.insort(a, x)', 'Insert while keeping list sorted', 'O(n) shift'],
                    ['Math', 'math.gcd(a, b) / math.lcm(a, b)', 'Ratios, cycles, divisibility', 'O(log min(a,b))'],
                    ['Math', 'divmod(a, b)', 'Quotient and remainder together', 'O(1)'],
                    ['Math', 'float("inf") / -float("inf")', 'Initial min/max distances and DP values', 'O(1)'],
                    ['Strings', 's.isalnum() / isalpha() / isdigit()', 'Validate characters', 'O(len(s))'],
                    ['Strings', 's.split() / " ".join(words)', 'Tokenize and rebuild strings', 'O(len(s))'],
                    ['Strings', 's[::-1] / reversed(s)', 'Reverse a string or sequence', 'O(n)'],
                    ['Arrays', 'range(start, stop, step)', 'Bounded loops and arithmetic progression', 'O(1) creation'],
                    ['Arrays', '[f(x) for x in values if ok(x)]', 'Transform/filter in one readable pass', 'O(n)'],
                  ].map(([category, pattern, use, cost], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-subtle)]/30'}>
                      <td className="px-4 py-2 text-[var(--text-light)]">{category}</td>
                      <td className="px-4 py-2 font-mono text-[var(--text-main)] whitespace-nowrap">{pattern}</td>
                      <td className="px-4 py-2 text-[var(--text-muted)]">{use}</td>
                      <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">{cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            <CodeBlock label="matrix traversal + directions" code={`rows, cols = len(grid), len(grid[0])
directions = ((1, 0), (-1, 0), (0, 1), (0, -1))

for row in range(rows):
    for col in range(cols):
        for dr, dc in directions:
            nr, nc = row + dr, col + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                visit(grid[nr][nc])

# Full matrix scan: O(rows × cols)
# Four neighbors per cell: still O(rows × cols)`} />
            <CodeBlock label="matrix BFS / flood fill" code={`from collections import deque

queue = deque([(start_row, start_col)])
seen = {(start_row, start_col)}
while queue:
    row, col = queue.popleft()
    for dr, dc in directions:
        nr, nc = row + dr, col + dc
        if (0 <= nr < rows and 0 <= nc < cols
                and (nr, nc) not in seen and is_open(nr, nc)):
            seen.add((nr, nc))
            queue.append((nr, nc))

# Time: O(rows × cols) · Space: O(rows × cols)`} />
            <CodeBlock label="adjacency list + graph DFS" code={`graph = [[] for _ in range(nodes)]
for source, target in edges:
    graph[source].append(target)

seen = set()
def dfs(node):
    if node in seen:
        return
    seen.add(node)
    for neighbor in graph[node]:
        dfs(neighbor)

# Adjacency list: O(V + E) space
# DFS: O(V + E) time, O(V) visited + call stack` } />
            <CodeBlock label="undirected graph / connected components" code={`def count_components(nodes, edges):
    graph = [[] for _ in range(nodes)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)

    seen = set()
    components = 0
    for node in range(nodes):
        if node not in seen:
            components += 1
            stack = [node]
            seen.add(node)
            while stack:
                current = stack.pop()
                for neighbor in graph[current]:
                    if neighbor not in seen:
                        seen.add(neighbor)
                        stack.append(neighbor)
    return components`} />
            <CodeBlock label="binary tree DFS" code={`def preorder(node):
    if node is None:
        return
    visit(node.val)
    preorder(node.left)
    preorder(node.right)

# Inorder: left → node → right (sorted BST order)
# Postorder: left → right → node (delete / aggregate children)
# Time: O(n) · Space: O(h), where h is tree height`} />
            <CodeBlock label="binary tree BFS by level" code={`from collections import deque

levels = []
queue = deque([root] if root else [])
while queue:
    current_level = []
    for _ in range(len(queue)):
        node = queue.popleft()
        current_level.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    levels.append(current_level)

# Time: O(n) · Space: O(width)`} />
            <CodeBlock label="topological sort — prerequisites" code={`from collections import deque

graph = [[] for _ in range(courses)]
indegree = [0] * courses
for course, prerequisite in prerequisites:
    graph[prerequisite].append(course)
    indegree[course] += 1

queue = deque(i for i, degree in enumerate(indegree) if degree == 0)
order = []
while queue:
    node = queue.popleft()
    order.append(node)
    for neighbor in graph[node]:
        indegree[neighbor] -= 1
        if indegree[neighbor] == 0:
            queue.append(neighbor)

# A cycle exists when len(order) < courses.
# Time: O(V + E) · Space: O(V + E)`} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]/50 bg-[var(--bg-card)]">
            <table className="w-full text-xs min-w-[620px]">
              <thead>
                <tr className="bg-[var(--bg-subtle)]/60 border-b border-[var(--border)]/40">
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Structure</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Representation</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Typical pattern</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/30">
                {[
                  ['Matrix', 'list[list[int]]', 'Nested loops, directions, flood fill', 'O(R × C)'],
                  ['Graph', 'list[list[int]]', 'DFS/BFS with visited set', 'O(V + E)'],
                  ['Weighted graph', 'list[list[tuple]]', 'Dijkstra with heapq', 'O((V + E) log V)'],
                  ['Tree', 'node.left / node.right', 'Recursive DFS or iterative stack', 'O(n)'],
                  ['BST', 'left < node < right', 'Inorder traversal gives sorted order', 'O(h) search'],
                  ['DAG', 'adjacency list + indegree', 'Kahn topological sort', 'O(V + E)'],
                  ['Union-Find', 'parent[] + rank/size[]', 'Connectivity and cycle detection', '≈ O(1) amortized'],
                ].map(([structure, representation, pattern, cost], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-subtle)]/30'}>
                    <td className="px-4 py-2 font-semibold text-[var(--text-main)]">{structure}</td>
                    <td className="px-4 py-2 font-mono text-[var(--text-main)]">{representation}</td>
                    <td className="px-4 py-2 text-[var(--text-muted)]">{pattern}</td>
                    <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">{cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            <CodeBlock label="frequency map + grouping" code={`from collections import Counter, defaultdict

counts = Counter(nums)
groups = defaultdict(list)
for word in words:
    groups[tuple(sorted(word))].append(word)

# Counter: counts[x], counts.most_common(k)
# defaultdict: missing keys receive a default value`} />
            <CodeBlock label="heap + deque patterns" code={`from collections import deque
import heapq

queue = deque([start])
heap = []
heapq.heappush(heap, (distance, node))
distance, node = heapq.heappop(heap)

# deque.popleft() is O(1); list.pop(0) is O(n).
# Python's heapq is a min-heap; negate values for max-heap behavior.`} />
          </div>
          <Callout type="tip">
            In an interview, always state the assumption behind a cost: dictionary and set lookups
            are average O(1), Python sorting is O(n log n), and a list insertion at the front is O(n).
          </Callout>
        </SectionCard>

      </main>
    </div>
  );
}
