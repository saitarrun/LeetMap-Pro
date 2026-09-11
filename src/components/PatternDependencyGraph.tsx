'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PatternSummary } from '@/types';

interface GraphNode {
  id: string;
  title: string;
  slug: string;
  x: number;
  y: number;
  total: number;
  category: string;
}

interface GraphEdge {
  from: string;
  to: string;
}

const NODES: GraphNode[] = [
  { id: 'arrays-hashing', title: 'Arrays & Hashing', slug: 'prefix-sum', x: 480, y: 44, total: 220, category: 'Fundamentals' },
  { id: 'two-pointers', title: 'Two Pointers', slug: 'two-pointers', x: 380, y: 140, total: 215, category: 'Fundamentals' },
  { id: 'stack', title: 'Stack', slug: 'monotonic-stack', x: 580, y: 140, total: 85, category: 'Data Structures' },
  { id: 'binary-search', title: 'Binary Search', slug: 'binary-search', x: 230, y: 246, total: 315, category: 'Fundamentals' },
  { id: 'sliding-window', title: 'Sliding Window', slug: 'sliding-window', x: 410, y: 246, total: 145, category: 'Fundamentals' },
  { id: 'linked-list', title: 'Linked List', slug: 'linked-list-manipulation', x: 620, y: 246, total: 70, category: 'Fundamentals' },
  { id: 'trees', title: 'Trees', slug: 'tree-dfs', x: 410, y: 350, total: 357, category: 'Trees & Graphs' },
  { id: 'tries', title: 'Tries', slug: 'trie', x: 240, y: 454, total: 53, category: 'Data Structures' },
  { id: 'backtracking', title: 'Backtracking', slug: 'backtracking', x: 590, y: 454, total: 114, category: 'Advanced & DP' },
  { id: 'heap', title: 'Heap / Priority Queue', slug: 'heaps-top-k', x: 360, y: 550, total: 190, category: 'Data Structures' },
  { id: 'intervals', title: 'Intervals', slug: 'intervals', x: 100, y: 654, total: 41, category: 'Data Structures' },
  { id: 'greedy', title: 'Greedy', slug: 'greedy', x: 270, y: 694, total: 414, category: 'Advanced & DP' },
  { id: 'advanced-graphs', title: 'Advanced Graphs', slug: 'topological-sort', x: 440, y: 674, total: 39, category: 'Trees & Graphs' },
  { id: 'graphs', title: 'Graphs', slug: 'graph-traversal', x: 580, y: 576, total: 167, category: 'Trees & Graphs' },
  { id: 'dp-1d', title: '1-D Dynamic Programming', slug: 'dynamic-programming-1d', x: 780, y: 576, total: 560, category: 'Advanced & DP' },
  { id: 'dp-2d', title: '2-D Dynamic Programming', slug: 'dynamic-programming-2d', x: 660, y: 714, total: 557, category: 'Advanced & DP' },
  { id: 'bit-manipulation', title: 'Bit Manipulation', slug: 'bit-manipulation', x: 860, y: 694, total: 234, category: 'Advanced & DP' },
  { id: 'math-geometry', title: 'Math & Geometry', slug: 'matrix-traversal', x: 790, y: 824, total: 243, category: 'Trees & Graphs' },
];

const EDGES: GraphEdge[] = [
  { from: 'arrays-hashing', to: 'two-pointers' },
  { from: 'arrays-hashing', to: 'stack' },
  { from: 'two-pointers', to: 'binary-search' },
  { from: 'two-pointers', to: 'sliding-window' },
  { from: 'two-pointers', to: 'linked-list' },
  { from: 'binary-search', to: 'trees' },
  { from: 'sliding-window', to: 'trees' },
  { from: 'linked-list', to: 'trees' },
  { from: 'trees', to: 'tries' },
  { from: 'trees', to: 'heap' },
  { from: 'trees', to: 'backtracking' },
  { from: 'heap', to: 'intervals' },
  { from: 'heap', to: 'greedy' },
  { from: 'heap', to: 'advanced-graphs' },
  { from: 'backtracking', to: 'graphs' },
  { from: 'backtracking', to: 'dp-1d' },
  { from: 'graphs', to: 'advanced-graphs' },
  { from: 'graphs', to: 'dp-2d' },
  { from: 'dp-1d', to: 'dp-2d' },
  { from: 'dp-1d', to: 'bit-manipulation' },
  { from: 'dp-2d', to: 'math-geometry' },
  { from: 'bit-manipulation', to: 'math-geometry' },
];

const NODE_WIDTH = 146;
const NODE_HEIGHT = 48;
const PROGRESS_BAR_WIDTH = 114;

interface PatternDependencyGraphProps {
  patterns: PatternSummary[];
  solvedSet?: Set<string>;
}

export function PatternDependencyGraph({ patterns, solvedSet = new Set() }: PatternDependencyGraphProps) {
  const router = useRouter();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Map patterns for quick slug lookups
  const patternMap = useMemo(() => {
    return new Map(patterns.map((p) => [p.slug, p]));
  }, [patterns]);

  // Compute solved count per pattern if question slugs match, or approximate from solvedSet
  const getNodeStats = (node: GraphNode) => {
    const p = patternMap.get(node.slug);
    const total = p?.total || node.total;
    const solved = solvedSet.size > 0 && p
      ? Math.min(total, Array.from(solvedSet).filter(id => id.startsWith(node.slug)).length)
      : 0;
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { total, solved, pct };
  };

  // Set of edges connected to the hovered node
  const activeEdgeKeys = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const keys = new Set<string>();
    for (const e of EDGES) {
      if (e.from === hoveredNodeId || e.to === hoveredNodeId) {
        keys.add(`${e.from}->${e.to}`);
      }
    }
    return keys;
  }, [hoveredNodeId]);

  // Nodes map for coordinate calculation
  const nodeCoords = useMemo(() => {
    return new Map(NODES.map((n) => [n.id, n]));
  }, []);

  const hoveredNode = hoveredNodeId ? nodeCoords.get(hoveredNodeId) : null;

  return (
    <div className="space-y-4 max-w-5xl mx-auto w-full">
      {/* Quiet Minimalist Graph Header / Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--text-main)]">Pattern Dependency Graph</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
              18 Core Topics
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-normal">
            Prerequisite tree &amp; optimal learning progression. Hover to trace dependencies; click any card to practice.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded bg-[var(--border)] inline-block opacity-60" />
            <span>Dependency path</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-1.5 rounded-sm bg-emerald-500 inline-block" />
            <span>Solved progress</span>
          </span>
        </div>
      </div>

      {/* Canvas Card */}
      <div className="relative rounded-2xl border border-[var(--border)]/60 bg-[var(--bg-card)] overflow-hidden shadow-xs">
        {/* Subtle Canvas Dot Grid Background */}
        <div className="overflow-x-auto [scrollbar-width:thin] py-4 px-2">
          <div className="min-w-[760px] sm:min-w-[880px] flex justify-center">
            <svg
              viewBox="0 0 960 900"
              className="w-full h-auto max-w-[940px] select-none"
              aria-label="Pattern dependency graph roadmap"
            >
              <defs>
                {/* Dot grid pattern */}
                <pattern id="dep-dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.85" fill="currentColor" opacity="0.08" />
                </pattern>

                {/* Subtle drop shadow for cards */}
                <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.05" />
                </filter>
                <filter id="card-hover-shadow" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Background grid */}
              <rect width="100%" height="100%" fill="url(#dep-dot-grid)" />

              {/* Connecting Bezier Edges */}
              <g className="edges">
                {EDGES.map((edge) => {
                  const source = nodeCoords.get(edge.from);
                  const target = nodeCoords.get(edge.to);
                  if (!source || !target) return null;

                  const key = `${edge.from}->${edge.to}`;
                  const isHovered = activeEdgeKeys.has(key);
                  const isAnyHovered = hoveredNodeId !== null;

                  // Smooth cubic Bezier curve from source bottom to target top
                  const startX = source.x;
                  const startY = source.y + NODE_HEIGHT / 2;
                  const endX = target.x;
                  const endY = target.y - NODE_HEIGHT / 2;
                  const deltaY = endY - startY;
                  const cY1 = startY + deltaY * 0.48;
                  const cY2 = endY - deltaY * 0.48;
                  const d = `M ${startX} ${startY} C ${startX} ${cY1}, ${endX} ${cY2}, ${endX} ${endY}`;

                  return (
                    <path
                      key={key}
                      d={d}
                      fill="none"
                      stroke={isHovered ? '#10b981' : 'currentColor'}
                      strokeWidth={isHovered ? 2.2 : 1.4}
                      strokeOpacity={isHovered ? 0.95 : isAnyHovered ? 0.08 : 0.22}
                      strokeLinecap="round"
                      className="transition-all duration-200"
                    />
                  );
                })}
              </g>

              {/* Nodes */}
              <g className="nodes">
                {NODES.map((node) => {
                  const { total, solved, pct } = getNodeStats(node);
                  const isHovered = hoveredNodeId === node.id;
                  const isConnected = hoveredNodeId && activeEdgeKeys.size > 0 &&
                    Array.from(activeEdgeKeys).some(k => k.includes(node.id));

                  const left = node.x - NODE_WIDTH / 2;
                  const top = node.y - NODE_HEIGHT / 2;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${left}, ${top})`}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => router.push(`/patterns/${node.slug}`)}
                    >
                      {/* Node Card Background */}
                      <rect
                        width={NODE_WIDTH}
                        height={NODE_HEIGHT}
                        rx={10}
                        fill="var(--bg-card)"
                        stroke={
                          isHovered
                            ? 'var(--text-main)'
                            : isConnected
                            ? '#10b981'
                            : 'var(--border)'
                        }
                        strokeWidth={isHovered || isConnected ? 1.5 : 1}
                        filter={isHovered ? 'url(#card-hover-shadow)' : 'url(#card-shadow)'}
                        className="transition-all duration-150"
                      />

                      {/* Subtle hover background highlight */}
                      {isHovered && (
                        <rect
                          width={NODE_WIDTH}
                          height={NODE_HEIGHT}
                          rx={10}
                          fill="var(--bg-subtle)"
                          opacity={0.4}
                        />
                      )}

                      {/* Node Title */}
                      <text
                        x={NODE_WIDTH / 2}
                        y={21}
                        textAnchor="middle"
                        fontSize={11.5}
                        fontWeight="600"
                        fill="var(--text-main)"
                        className="font-sans select-none"
                      >
                        {node.title}
                      </text>

                      {/* Progress Bar Track */}
                      <rect
                        x={(NODE_WIDTH - PROGRESS_BAR_WIDTH) / 2}
                        y={31}
                        width={PROGRESS_BAR_WIDTH}
                        height={3}
                        rx={1.5}
                        fill="var(--bg-subtle)"
                        stroke="var(--border)"
                        strokeWidth={0.5}
                      />

                      {/* Filled Progress Bar */}
                      {pct > 0 ? (
                        <rect
                          x={(NODE_WIDTH - PROGRESS_BAR_WIDTH) / 2}
                          y={31}
                          width={Math.max(4, (PROGRESS_BAR_WIDTH * pct) / 100)}
                          height={3}
                          rx={1.5}
                          fill="#10b981"
                        />
                      ) : null}

                      {/* Problem Count Indicator */}
                      <text
                        x={(NODE_WIDTH - PROGRESS_BAR_WIDTH) / 2 + PROGRESS_BAR_WIDTH}
                        y={41}
                        textAnchor="end"
                        fontSize={8.5}
                        fill="var(--text-muted)"
                        opacity={isHovered ? 0.9 : 0.5}
                        fontFamily="monospace"
                      >
                        {total} Qs
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Bottom Context Footer when a node is hovered */}
        <div className="px-4 py-2.5 bg-[var(--bg-subtle)]/40 border-t border-[var(--border)]/40 flex items-center justify-between text-xs">
          {hoveredNode ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-[var(--text-main)] truncate">{hoveredNode.title}</span>
              <span className="text-[11px] text-[var(--text-muted)]">
                · {getNodeStats(hoveredNode).total} problems
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                · Click to open pattern view
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-[var(--text-muted)]">
              💡 Tip: Click any pattern node to open its full study guide, templates, and problem sets.
            </span>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
            <span>Dependency Flow: Top ↓ Down</span>
          </div>
        </div>
      </div>
    </div>
  );
}
