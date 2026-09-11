'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PatternSummary } from '@/types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  X,
  ChevronRight,
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
  TrendingUp,
  Boxes,
  Flame,
  Cpu,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  'two-pointers': ArrowLeftRight,
  'sliding-window': SlidersHorizontal,
  'binary-search': Binary,
  'prefix-sum': Sigma,
  'fast-slow-pointers': IterationCcw,
  'linked-list-manipulation': Link2,
  'monotonic-stack': Layers,
  'heaps-top-k': Crown,
  'trie': FolderTree,
  'union-find': Network,
  'intervals': CalendarRange,
  'tree-dfs': GitBranch,
  'tree-bfs': Rows3,
  'binary-search-tree': Split,
  'graph-traversal': Share2,
  'topological-sort': ArrowDownUp,
  'matrix-traversal': Grid,
  'backtracking': RotateCcw,
  'dynamic-programming-1d': TrendingUp,
  'dynamic-programming-2d': Boxes,
  'greedy': Flame,
  'bit-manipulation': Cpu,
};

export interface SubPattern {
  slug: string;
  name: string;
  total: number;
  tagline: string;
}

interface GraphNode {
  id: string;
  title: string;
  slug: string;
  x: number;
  y: number;
  total: number;
  category: string;
  subPatterns?: SubPattern[];
}

interface GraphEdge {
  from: string;
  to: string;
}

// 7 Strictly Ordered Horizontal Tiers matching the roadmap
const NODES: GraphNode[] = [
  // Tier 0 (Root)
  {
    id: 'arrays-hashing',
    title: 'Arrays & Hashing',
    slug: 'prefix-sum',
    x: 530,
    y: 60,
    total: 220,
    category: 'Arrays & Strings',
    subPatterns: [
      { slug: 'two-pointers', name: 'Two Pointers', total: 215, tagline: 'Opposite or parallel pointers traversing sequences in linear time O(N)' },
      { slug: 'sliding-window', name: 'Sliding Window', total: 145, tagline: 'Dynamic and fixed-size windows over contiguous subarrays or substrings' },
      { slug: 'fast-slow-pointers', name: 'Fast & Slow Pointers', total: 7, tagline: "Cycle detection and midpoint traversal using Floyd's Tortoise and Hare algorithm" },
      { slug: 'prefix-sum', name: 'Arrays & Hashing (Prefix Sum)', total: 220, tagline: 'O(1) range queries and subarray sum lookups using cumulative totals' },
      { slug: 'binary-search', name: 'Binary Search & Modified BS', total: 315, tagline: 'Logarithmic O(log N) search on sorted spaces and monotonic ranges' },
    ],
  },

  // Tier 1
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    slug: 'two-pointers',
    x: 380,
    y: 165,
    total: 215,
    category: 'Arrays & Strings',
    subPatterns: [
      { slug: 'two-pointers', name: 'Two Pointers', total: 215, tagline: 'Opposite or parallel pointers traversing sequences in linear time O(N)' },
      { slug: 'fast-slow-pointers', name: 'Fast & Slow Pointers', total: 7, tagline: "Cycle detection and midpoint traversal using Floyd's Tortoise and Hare algorithm" },
    ],
  },
  { id: 'stack', title: 'Stack', slug: 'monotonic-stack', x: 680, y: 165, total: 85, category: 'Stacks & Queues' },

  // Tier 2
  { id: 'binary-search', title: 'Binary Search', slug: 'binary-search', x: 230, y: 275, total: 315, category: 'Arrays & Strings' },
  { id: 'sliding-window', title: 'Sliding Window', slug: 'sliding-window', x: 530, y: 275, total: 145, category: 'Arrays & Strings' },
  {
    id: 'linked-list',
    title: 'Linked List',
    slug: 'linked-list-manipulation',
    x: 830,
    y: 275,
    total: 70,
    category: 'Linked Lists',
    subPatterns: [
      { slug: 'linked-list-manipulation', name: 'Linked List Manipulation', total: 70, tagline: 'Reversing, reordering, and partitioning pointer chains with O(1) space' },
      { slug: 'fast-slow-pointers', name: 'Fast & Slow Pointers', total: 7, tagline: "Cycle detection and midpoint traversal using Floyd's Tortoise and Hare algorithm" },
    ],
  },

  // Tier 3 (Convergence to Trees)
  {
    id: 'trees',
    title: 'Trees',
    slug: 'tree-dfs',
    x: 530,
    y: 385,
    total: 357,
    category: 'Trees & Tries',
    subPatterns: [
      { slug: 'tree-dfs', name: 'Tree Depth-First Search (DFS)', total: 357, tagline: 'Recursive top-down and bottom-up traversals on hierarchical structures' },
      { slug: 'tree-bfs', name: 'Tree Breadth-First Search (BFS)', total: 390, tagline: 'Level-order traversal and horizontal tier exploration using queues' },
      { slug: 'binary-search-tree', name: 'Binary Search Tree (BST)', total: 37, tagline: 'Ordered hierarchical storage with monotonic inorder traversal' },
      { slug: 'trie', name: 'Tries (Prefix Tree)', total: 53, tagline: 'Efficient prefix matching, autocomplete, and dictionary lookups' },
    ],
  },

  // Tier 4
  { id: 'tries', title: 'Tries', slug: 'trie', x: 230, y: 495, total: 53, category: 'Trees & Tries' },
  { id: 'heap', title: 'Heap / Priority Queue', slug: 'heaps-top-k', x: 530, y: 495, total: 190, category: 'Heaps & Intervals' },
  { id: 'backtracking', title: 'Backtracking', slug: 'backtracking', x: 830, y: 495, total: 114, category: 'Advanced & Greedy' },

  // Tier 5
  { id: 'intervals', title: 'Intervals', slug: 'intervals', x: 130, y: 615, total: 41, category: 'Heaps & Intervals' },
  { id: 'greedy', title: 'Greedy', slug: 'greedy', x: 370, y: 615, total: 414, category: 'Advanced & Greedy' },
  {
    id: 'graphs',
    title: 'Graphs',
    slug: 'graph-traversal',
    x: 670,
    y: 615,
    total: 167,
    category: 'Graphs',
    subPatterns: [
      { slug: 'graph-traversal', name: 'Graphs (BFS & DFS)', total: 167, tagline: 'Shortest paths, flood fills, and connected components in arbitrary networks' },
      { slug: 'matrix-traversal', name: 'Matrix & Grid Traversal', total: 243, tagline: 'Coordinate navigation, spiral unwrapping, and 2D flood fills' },
    ],
  },
  { id: 'dp-1d', title: '1-D Dynamic Programming', slug: 'dynamic-programming-1d', x: 930, y: 615, total: 560, category: 'Dynamic Programming' },

  // Tier 6 (Final Convergence)
  {
    id: 'advanced-graphs',
    title: 'Advanced Graphs',
    slug: 'topological-sort',
    x: 490,
    y: 735,
    total: 39,
    category: 'Graphs',
    subPatterns: [
      { slug: 'topological-sort', name: 'Advanced Graphs (Topological Sort)', total: 39, tagline: 'Linear dependency ordering and cycle detection in DAGs' },
      { slug: 'union-find', name: 'Union-Find (Disjoint Set)', total: 86, tagline: 'Connectivity, cycle detection, and clustering in undirected networks' },
    ],
  },
  { id: 'dp-2d', title: '2-D Dynamic Programming', slug: 'dynamic-programming-2d', x: 730, y: 735, total: 557, category: 'Dynamic Programming' },
  { id: 'bit-manipulation', title: 'Bit Manipulation', slug: 'bit-manipulation', x: 930, y: 735, total: 234, category: 'Advanced & Greedy' },
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
];

const NODE_WIDTH = 176;
const NODE_HEIGHT = 52;
const PROGRESS_BAR_WIDTH = 144;

interface PatternDependencyGraphProps {
  patterns: PatternSummary[];
  patternProblems?: Record<string, string[]>;
  solvedSet?: Set<string>;
}

export function PatternDependencyGraph({
  patterns,
  patternProblems = {},
  solvedSet = new Set(),
}: PatternDependencyGraphProps) {
  const router = useRouter();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedGroupNode, setSelectedGroupNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Close modal on Escape key
  React.useEffect(() => {
    if (!selectedGroupNode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedGroupNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGroupNode]);

  // Pattern map for instant lookup
  const patternMap = useMemo(() => {
    return new Map(patterns.map((p) => [p.slug, p]));
  }, [patterns]);

  // Fast node coordinate map
  const nodeMap = useMemo(() => {
    return new Map(NODES.map((n) => [n.id, n]));
  }, []);

  // Compute progress for a node (aggregates across subpatterns if grouped)
  const getNodeProgress = (node: GraphNode) => {
    if (node.subPatterns && node.subPatterns.length > 1) {
      let groupTotal = 0;
      let groupSolved = 0;
      for (const sub of node.subPatterns) {
        const p = patternMap.get(sub.slug);
        const tot = p?.total || sub.total;
        groupTotal += tot;
        const slugs = patternProblems[sub.slug];
        if (slugs && solvedSet.size > 0) {
          groupSolved += slugs.filter((id) => solvedSet.has(id)).length;
        }
      }
      const pct = groupTotal > 0 ? Math.min(100, Math.round((groupSolved / groupTotal) * 100)) : 0;
      return { total: groupTotal, solved: groupSolved, pct, p: patternMap.get(node.slug) };
    }

    const p = patternMap.get(node.slug);
    const total = p?.total || node.total;
    const slugs = patternProblems[node.slug];
    const solved = slugs && solvedSet.size > 0
      ? slugs.filter((id) => solvedSet.has(id)).length
      : 0;
    const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
    return { total, solved, pct, p };
  };

  // Compute progress for a single subpattern
  const getSubPatternProgress = (sub: SubPattern) => {
    const p = patternMap.get(sub.slug);
    const total = p?.total || sub.total;
    const slugs = patternProblems[sub.slug];
    const solved = slugs && solvedSet.size > 0
      ? slugs.filter((id) => solvedSet.has(id)).length
      : 0;
    const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
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
              17 Topics
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

      {/* Main Graph Canvas Container - Dark Black in Dark Mode, White in Light Mode */}
      <div className="relative rounded-2xl border border-[var(--graph-canvas-border)] bg-[var(--graph-canvas-bg)] overflow-hidden shadow-2xl transition-colors duration-200">
        <div className="overflow-x-auto [scrollbar-width:thin] py-8 px-4 bg-[var(--graph-canvas-bg)]">
          <div
            className="min-w-[840px] sm:min-w-[980px] flex justify-center transition-transform duration-200 origin-top bg-[var(--graph-canvas-bg)]"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          >
            <svg
              viewBox="0 0 1060 810"
              className="w-full h-auto max-w-[1080px] select-none bg-[var(--graph-canvas-bg)]"
              aria-label="Interactive pattern dependency tree"
            >
              <defs>
                {/* Responsive dot grid for dark and light modes */}
                <pattern id="clear-dot-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="var(--graph-dot-color)" opacity="var(--graph-dot-opacity)" />
                </pattern>

                {/* Soft diffuse ambient card shadow */}
                <filter id="soft-card-shadow" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.08" />
                </filter>
                <filter id="glow-card-shadow" x="-25%" y="-25%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10b981" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Canvas Background: Pure dark black in dark mode, pure white in light mode */}
              <rect width="100%" height="100%" fill="var(--graph-canvas-bg)" />
              <rect width="100%" height="100%" fill="url(#clear-dot-grid)" />

              {/* Connecting Bezier Edges */}
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
                          : 'var(--graph-edge-color)'
                      }
                      strokeWidth={isHighlighted ? 3 : 2}
                      strokeOpacity={isHighlighted ? 1 : isAnyHovered ? 0.15 : 0.6}
                      strokeLinecap="round"
                      className="transition-all duration-200"
                    />
                  );
                })}
              </g>

              {/* Nodes - Adaptive High Contrast Cards */}
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
                    <a
                      key={node.id}
                      href={`/patterns/${node.slug}`}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                          e.preventDefault();
                          if (node.subPatterns && node.subPatterns.length > 1) {
                            setSelectedGroupNode(node);
                          } else {
                            router.push(`/patterns/${node.slug}`);
                          }
                        }
                      }}
                      className="cursor-pointer group select-none outline-none"
                      aria-label={`View ${node.title} study guide and problems`}
                    >
                      <g
                        transform={`translate(${left}, ${top})`}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                      >
                        {/* Node Card Outer Rectangle */}
                        <rect
                          width={NODE_WIDTH}
                          height={NODE_HEIGHT}
                          rx={10}
                          fill={isHovered ? 'var(--graph-node-hover-bg)' : 'var(--graph-node-bg)'}
                          stroke={
                            isHovered
                              ? '#10b981'
                              : isParent
                              ? '#10b981'
                              : isChild
                              ? '#38bdf8'
                              : 'var(--graph-node-border)'
                          }
                          strokeWidth={isFocused ? 2 : 1.4}
                          filter={isHovered ? 'url(#glow-card-shadow)' : 'url(#soft-card-shadow)'}
                          className="transition-all duration-150"
                        />

                        {/* Sub-patterns indicator pill if node has a group of patterns */}
                        {node.subPatterns && node.subPatterns.length > 1 && (
                          <g transform={`translate(${NODE_WIDTH - 26}, 6)`} className="pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                            <rect width={18} height={13} rx={4} fill="var(--graph-canvas-bg)" stroke="var(--graph-node-border)" strokeWidth={0.8} />
                            <text x={9} y={9.5} textAnchor="middle" fontSize={8.5} fontWeight="700" fill="var(--graph-node-text)">
                              {node.subPatterns.length}
                            </text>
                          </g>
                        )}

                        {/* Main Node Title - Centered, dynamic text color */}
                        <text
                          x={NODE_WIDTH / 2}
                          y={27}
                          textAnchor="middle"
                          fontSize={fontSize}
                          fontWeight="600"
                          fill="var(--graph-node-text)"
                          className="font-sans select-none tracking-tight pointer-events-none"
                        >
                          {node.title}
                        </text>

                        {/* Progress Bar Background Track */}
                        <rect
                          x={(NODE_WIDTH - PROGRESS_BAR_WIDTH) / 2}
                          y={37}
                          width={PROGRESS_BAR_WIDTH}
                          height={4}
                          rx={2}
                          fill="var(--graph-progress-track)"
                          className="pointer-events-none"
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
                            className="pointer-events-none"
                          />
                        )}
                      </g>
                    </a>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Dynamic Context Footer on Node Hover */}
        <div className="px-5 py-3 bg-[var(--graph-footer-bg)] border-t border-[var(--graph-footer-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[var(--graph-footer-text)] transition-colors duration-200">
          {hoveredNode && hoveredProgress ? (
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="font-semibold">{hoveredNode.title}</span>
              <span className="text-[var(--graph-footer-muted)]">
                · {hoveredProgress.total} curated problems {hoveredProgress.solved > 0 ? `(${hoveredProgress.solved} solved)` : ''}
              </span>
              {parentIds.size > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  · Prerequisites: {Array.from(parentIds).map(id => nodeMap.get(id)?.title).join(', ')}
                </span>
              )}
              {childIds.size > 0 && (
                <span className="text-sky-600 dark:text-sky-400 font-medium">
                  · Unlocks: {Array.from(childIds).map(id => nodeMap.get(id)?.title).join(', ')}
                </span>
              )}
              {hoveredNode.subPatterns && hoveredNode.subPatterns.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setSelectedGroupNode(hoveredNode)}
                  className="apple-press inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer ml-1 text-xs"
                >
                  <span>Explore {hoveredNode.title} ({hoveredNode.subPatterns.length} Patterns)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href={`/patterns/${hoveredNode.slug}`}
                  className="apple-press inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
                >
                  <span>Practice {hoveredNode.title}</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[var(--graph-footer-muted)]">
              <Compass className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span>Prerequisites flow from top to bottom. Click any pattern card to view its study guide and problems.</span>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-3 text-[11px] text-[var(--graph-footer-muted)] font-mono shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Prerequisite
            </span>
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-500" /> Unlock
            </span>
          </div>
        </div>
      </div>

      {/* Apple-Style Pattern Selection Modal Sheet */}
      {selectedGroupNode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 dark:bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedGroupNode(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-pattern-title"
            className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-[28px] bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_32px_80px_rgba(0,0,0,0.18)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.65)] overflow-hidden scale-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-3 flex items-start justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 id="group-pattern-title" className="text-[20px] font-semibold text-[var(--text-main)] tracking-tight">
                    {selectedGroupNode.title}
                  </h3>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {selectedGroupNode.subPatterns?.length || 0} Patterns
                  </span>
                  <span className="text-[11px] font-normal text-[var(--text-muted)]">
                    · {selectedGroupNode.category}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--text-muted)] pt-0.5 leading-relaxed font-normal">
                  Select a pattern below to practice curated problems, code templates, and interview blueprints.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGroupNode(null)}
                className="apple-press w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/[0.1] active:bg-black/[0.15] dark:bg-white/[0.1] dark:hover:bg-white/[0.18] flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-all cursor-pointer shrink-0 ml-3"
                aria-label="Close pattern selection modal"
              >
                <X className="w-3.5 h-3.5 stroke-[2.4]" />
              </button>
            </div>

            {/* Modal Sub-Patterns List - Smooth Apple Inset Group with Hidden Raw Scrollbar */}
            <div className="px-5 pb-5 pt-1 space-y-2 overflow-y-auto max-h-[56vh] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-contain">
              {selectedGroupNode.subPatterns?.map((sub) => {
                const { total, solved, pct } = getSubPatternProgress(sub);
                const Icon = ICON_MAP[sub.slug] || GitBranch;

                return (
                  <Link
                    key={sub.slug}
                    href={`/patterns/${sub.slug}`}
                    onClick={() => setSelectedGroupNode(null)}
                    className="apple-press group flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/[0.025] hover:bg-black/[0.05] active:scale-[0.99] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-black/[0.04] hover:border-black/[0.08] dark:border-white/[0.06] dark:hover:border-white/[0.12] transition-all cursor-pointer"
                  >
                    {/* Apple Icon Squircle Tile */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-white/[0.08] shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/[0.04] dark:border-white/[0.06] text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Middle Info */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[14.5px] font-semibold text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight truncate">
                          {sub.name}
                        </span>
                        <span className="text-[11.5px] font-mono text-[var(--text-muted)] font-medium shrink-0">
                          {solved > 0 ? `${solved} / ${total} (${pct}%)` : `${total} problems`}
                        </span>
                      </div>

                      {sub.tagline && (
                        <p className="text-[12px] text-[var(--text-muted)] line-clamp-1 font-normal leading-normal">
                          {sub.tagline}
                        </p>
                      )}

                      {/* Apple Progress Bar */}
                      {pct > 0 && (
                        <div className="w-full h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden mt-1.5">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Apple SF Chevron */}
                    <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                  </Link>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-black/[0.05] dark:border-white/[0.07] bg-black/[0.015] dark:bg-white/[0.02] flex items-center justify-between text-[12px] text-[var(--text-muted)]">
              <span>Looking for the primary overview?</span>
              <Link
                href={`/patterns/${selectedGroupNode.slug}`}
                onClick={() => setSelectedGroupNode(null)}
                className="apple-press inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                <span>{selectedGroupNode.title} Overview</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.4]" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
