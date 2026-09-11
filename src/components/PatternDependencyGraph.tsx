'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PatternSummary } from '@/types';
import { ZoomIn, ZoomOut, RotateCcw, Compass, CheckCircle2 } from 'lucide-react';

interface GraphNode {
  id: string;
  title: string;
  slug: string;
  x: number;
  y: number;
  total: number;
  category: 'Fundamentals' | 'Data Structures' | 'Trees & Graphs' | 'Advanced & DP';
}

interface GraphEdge {
  from: string;
  to: string;
}

// 8 Strictly Ordered Horizontal Tiers with generous spacing
const NODES: GraphNode[] = [
  // Tier 0 (Root)
  { id: 'arrays-hashing', title: 'Arrays & Hashing', slug: 'prefix-sum', x: 560, y: 60, total: 220, category: 'Fundamentals' },

  // Tier 1
  { id: 'two-pointers', title: 'Two Pointers', slug: 'two-pointers', x: 420, y: 165, total: 215, category: 'Fundamentals' },
  { id: 'stack', title: 'Stack', slug: 'monotonic-stack', x: 700, y: 165, total: 85, category: 'Data Structures' },

  // Tier 2
  { id: 'binary-search', title: 'Binary Search', slug: 'binary-search', x: 270, y: 275, total: 315, category: 'Fundamentals' },
  { id: 'sliding-window', title: 'Sliding Window', slug: 'sliding-window', x: 560, y: 275, total: 145, category: 'Fundamentals' },
  { id: 'linked-list', title: 'Linked List', slug: 'linked-list-manipulation', x: 850, y: 275, total: 70, category: 'Fundamentals' },

  // Tier 3
  { id: 'trees', title: 'Trees', slug: 'tree-dfs', x: 560, y: 385, total: 357, category: 'Trees & Graphs' },

  // Tier 4
  { id: 'tries', title: 'Tries', slug: 'trie', x: 270, y: 495, total: 53, category: 'Data Structures' },
  { id: 'heap', title: 'Heap / Priority Queue', slug: 'heaps-top-k', x: 560, y: 495, total: 190, category: 'Data Structures' },
  { id: 'backtracking', title: 'Backtracking', slug: 'backtracking', x: 850, y: 495, total: 114, category: 'Advanced & DP' },

  // Tier 5
  { id: 'intervals', title: 'Intervals', slug: 'intervals', x: 135, y: 615, total: 41, category: 'Data Structures' },
  { id: 'greedy', title: 'Greedy', slug: 'greedy', x: 370, y: 615, total: 414, category: 'Advanced & DP' },
  { id: 'graphs', title: 'Graphs', slug: 'graph-traversal', x: 670, y: 615, total: 167, category: 'Trees & Graphs' },
  { id: 'dp-1d', title: '1-D Dynamic Programming', slug: 'dynamic-programming-1d', x: 955, y: 615, total: 560, category: 'Advanced & DP' },

  // Tier 6
  { id: 'advanced-graphs', title: 'Advanced Graphs', slug: 'topological-sort', x: 515, y: 725, total: 39, category: 'Trees & Graphs' },
  { id: 'dp-2d', title: '2-D Dynamic Programming', slug: 'dynamic-programming-2d', x: 750, y: 725, total: 557, category: 'Advanced & DP' },
  { id: 'bit-manipulation', title: 'Bit Manipulation', slug: 'bit-manipulation', x: 955, y: 725, total: 234, category: 'Advanced & DP' },

  // Tier 7
  { id: 'math-geometry', title: 'Math & Geometry', slug: 'matrix-traversal', x: 852, y: 835, total: 243, category: 'Trees & Graphs' },
];

const EDGES: GraphEdge[] = [
  // Tier 0 -> Tier 1
  { from: 'arrays-hashing', to: 'two-pointers' },
  { from: 'arrays-hashing', to: 'stack' },

  // Tier 1 -> Tier 2
  { from: 'two-pointers', to: 'binary-search' },
  { from: 'two-pointers', to: 'sliding-window' },
  { from: 'two-pointers', to: 'linked-list' },

  // Tier 2 -> Tier 3 (Convergence to Trees)
  { from: 'binary-search', to: 'trees' },
  { from: 'sliding-window', to: 'trees' },
  { from: 'linked-list', to: 'trees' },

  // Tier 3 -> Tier 4
  { from: 'trees', to: 'tries' },
  { from: 'trees', to: 'heap' },
  { from: 'trees', to: 'backtracking' },

  // Tier 4 -> Tier 5
  { from: 'heap', to: 'intervals' },
  { from: 'heap', to: 'greedy' },
  { from: 'backtracking', to: 'graphs' },
  { from: 'backtracking', to: 'dp-1d' },

  // Tier 4 & 5 -> Tier 6
  { from: 'heap', to: 'advanced-graphs' },
  { from: 'graphs', to: 'advanced-graphs' },
  { from: 'graphs', to: 'dp-2d' },
  { from: 'dp-1d', to: 'dp-2d' },
  { from: 'dp-1d', to: 'bit-manipulation' },

  // Tier 6 -> Tier 7 (Convergence to Math & Geometry)
  { from: 'dp-2d', to: 'math-geometry' },
  { from: 'bit-manipulation', to: 'math-geometry' },
];

const NODE_WIDTH = 176;
const NODE_HEIGHT = 52;
const PROGRESS_BAR_WIDTH = 144;

interface PatternDependencyGraphProps {
  patterns: PatternSummary[];
  solvedSet?: Set<string>;
}

export function PatternDependencyGraph({ patterns, solvedSet = new Set() }: PatternDependencyGraphProps) {
  const router = useRouter();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Pattern map for instant lookup
  const patternMap = useMemo(() => {
    return new Map(patterns.map((p) => [p.slug, p]));
  }, [patterns]);

  // Fast node coordinate map
  const nodeMap = useMemo(() => {
    return new Map(NODES.map((n) => [n.id, n]));
  }, []);

  // Compute progress for a node
  const getNodeProgress = (node: GraphNode) => {
    const p = patternMap.get(node.slug);
    const total = p?.total || node.total;
    const solved = solvedSet.size > 0 && p
      ? Math.min(total, Array.from(solvedSet).filter(id => id.startsWith(node.slug)).length)
      : 0;
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { total, solved, pct, p };
  };

  // Trace prerequisite parents and unlocked children
  const { parentIds, childIds, incomingEdges, outgoingEdges } = useMemo(() => {
    if (!hoveredNodeId) {
      return {
        parentIds: new Set<string>(),
        childIds: new Set<string>(),
        incomingEdges: new Set<string>(),
        outgoingEdges: new Set<string>(),
      };
    }
    const parents = new Set<string>();
    const children = new Set<string>();
    const inEdges = new Set<string>();
    const outEdges = new Set<string>();

    for (const edge of EDGES) {
      if (edge.to === hoveredNodeId) {
        parents.add(edge.from);
        inEdges.add(`${edge.from}->${edge.to}`);
      }
      if (edge.from === hoveredNodeId) {
        children.add(edge.to);
        outEdges.add(`${edge.from}->${edge.to}`);
      }
    }

    return {
      parentIds: parents,
      childIds: children,
      incomingEdges: inEdges,
      outgoingEdges: outEdges,
    };
  }, [hoveredNodeId]);

  const hoveredNode = hoveredNodeId ? nodeMap.get(hoveredNodeId) : null;
  const hoveredProgress = hoveredNode ? getNodeProgress(hoveredNode) : null;

  return (
    <div className="space-y-3.5 max-w-5xl mx-auto w-full">
      {/* High-contrast Apple-Style Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--text-main)]">Learning Roadmap &amp; Dependencies</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
              18 Topics
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Follow the arrows to master prerequisites. Hover any pattern to trace unlock paths; click to practice.
          </p>
        </div>

        {/* Minimalist Zoom Controls & Legend */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] py-1 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-1 rounded-sm bg-slate-400 inline-block opacity-70" />
              <span>Path</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 rounded-sm bg-emerald-500 inline-block" />
              <span>Solved</span>
            </span>
          </div>

          <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-0.5 text-xs text-[var(--text-muted)]">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.75, +(z - 0.15).toFixed(2)))}
              className="apple-press p-1.5 hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[10px] select-none text-[var(--text-muted)]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, +(z + 0.15).toFixed(2)))}
              className="apple-press p-1.5 hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="apple-press p-1.5 hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded transition-colors border-l border-[var(--border)] ml-0.5"
                title="Reset zoom"
                aria-label="Reset zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Graph Canvas Container */}
      <div className="relative rounded-2xl border border-[var(--border)] bg-[#0d111a] dark:bg-[#0d111a] overflow-hidden shadow-sm">
        <div className="overflow-x-auto [scrollbar-width:thin] py-8 px-4">
          <div
            className="min-w-[840px] sm:min-w-[980px] flex justify-center transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          >
            <svg
              viewBox="0 0 1120 900"
              className="w-full h-auto max-w-[1080px] select-none"
              aria-label="Interactive pattern dependency tree"
            >
              <defs>
                {/* Clearly visible canvas dot grid */}
                <pattern id="clear-dot-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.1" fill="#475569" opacity="0.35" />
                </pattern>

                {/* Soft diffuse ambient card shadow */}
                <filter id="soft-card-shadow" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
                </filter>
                <filter id="glow-card-shadow" x="-25%" y="-25%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10b981" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Dot Grid Background */}
              <rect width="100%" height="100%" fill="url(#clear-dot-grid)" />

              {/* Connecting Bezier Edges - High visibility */}
              <g className="edges">
                {EDGES.map((edge) => {
                  const source = nodeMap.get(edge.from);
                  const target = nodeMap.get(edge.to);
                  if (!source || !target) return null;

                  const key = `${edge.from}->${edge.to}`;
                  const isIncoming = incomingEdges.has(key);
                  const isOutgoing = outgoingEdges.has(key);
                  const isHighlighted = isIncoming || isOutgoing;
                  const isAnyHovered = hoveredNodeId !== null;

                  // Smooth cubic Bezier curve from source bottom to target top
                  const startX = source.x;
                  const startY = source.y + NODE_HEIGHT / 2;
                  const endX = target.x;
                  const endY = target.y - NODE_HEIGHT / 2;
                  const deltaY = endY - startY;
                  const cY1 = startY + deltaY * 0.5;
                  const cY2 = endY - deltaY * 0.5;
                  const d = `M ${startX} ${startY} C ${startX} ${cY1}, ${endX} ${cY2}, ${endX} ${endY}`;

                  return (
                    <path
                      key={key}
                      d={d}
                      fill="none"
                      stroke={
                        isIncoming
                          ? '#10b981' // Green for prerequisites
                          : isOutgoing
                          ? '#38bdf8' // Blue for unlocks
                          : '#64748b' // Clearly visible slate
                      }
                      strokeWidth={isHighlighted ? 3 : 2}
                      strokeOpacity={isHighlighted ? 1 : isAnyHovered ? 0.12 : 0.45}
                      strokeLinecap="round"
                      className="transition-all duration-200"
                    />
                  );
                })}
              </g>

              {/* Nodes - High Contrast NeetCode Cards */}
              <g className="nodes">
                {NODES.map((node) => {
                  const { pct } = getNodeProgress(node);

                  const isHovered = hoveredNodeId === node.id;
                  const isParent = parentIds.has(node.id);
                  const isChild = childIds.has(node.id);
                  const isFocused = isHovered || isParent || isChild;

                  const left = node.x - NODE_WIDTH / 2;
                  const top = node.y - NODE_HEIGHT / 2;

                  const isLongTitle = node.title.length > 18;
                  const fontSize = isLongTitle ? 11.5 : 12.5;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${left}, ${top})`}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => router.push(`/patterns/${node.slug}`)}
                    >
                      {/* Node Card Outer Rectangle - High contrast slate card */}
                      <rect
                        width={NODE_WIDTH}
                        height={NODE_HEIGHT}
                        rx={10}
                        fill={isHovered ? '#262f48' : '#1e2438'}
                        stroke={
                          isHovered
                            ? '#10b981'
                            : isParent
                            ? '#10b981'
                            : isChild
                            ? '#38bdf8'
                            : '#3e4768'
                        }
                        strokeWidth={isFocused ? 2 : 1.5}
                        filter={isHovered ? 'url(#glow-card-shadow)' : 'url(#soft-card-shadow)'}
                        className="transition-all duration-150"
                      />

                      {/* Main Node Title - Centered, high contrast crisp white */}
                      <text
                        x={NODE_WIDTH / 2}
                        y={27}
                        textAnchor="middle"
                        fontSize={fontSize}
                        fontWeight="600"
                        fill="#ffffff"
                        className="font-sans select-none tracking-tight"
                      >
                        {node.title}
                      </text>

                      {/* Progress Bar Background Track - High contrast translucent white pill */}
                      <rect
                        x={(NODE_WIDTH - PROGRESS_BAR_WIDTH) / 2}
                        y={37}
                        width={PROGRESS_BAR_WIDTH}
                        height={4}
                        rx={2}
                        fill="rgba(255, 255, 255, 0.25)"
                      />

                      {/* Emerald Progress Fill */}
                      {pct > 0 && (
                        <rect
                          x={(NODE_WIDTH - PROGRESS_BAR_WIDTH) / 2}
                          y={37}
                          width={Math.max(6, (PROGRESS_BAR_WIDTH * pct) / 100)}
                          height={4}
                          rx={2}
                          fill="#10b981"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Dynamic Context Footer on Node Hover */}
        <div className="px-5 py-3 bg-[#131826] border-t border-[#262e45] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          {hoveredNode && hoveredProgress ? (
            <div className="flex items-center gap-2 min-w-0 flex-wrap text-[#e2e8f0]">
              <span className="font-semibold text-white">{hoveredNode.title}</span>
              <span className="text-[#94a3b8]">
                · {hoveredProgress.total} curated problems ({hoveredProgress.solved} solved)
              </span>
              {parentIds.size > 0 && (
                <span className="text-emerald-400 font-medium">
                  · Prerequisites: {Array.from(parentIds).map(id => nodeMap.get(id)?.title).join(', ')}
                </span>
              )}
              {childIds.size > 0 && (
                <span className="text-sky-400 font-medium">
                  · Unlocks: {Array.from(childIds).map(id => nodeMap.get(id)?.title).join(', ')}
                </span>
              )}
              <span className="text-[#94a3b8]">
                · Click to practice →
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Prerequisites flow from top to bottom. Click any pattern card to view its study guide and problems.</span>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-3 text-[11px] text-[#94a3b8] font-mono shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Prerequisite
            </span>
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Unlocks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
