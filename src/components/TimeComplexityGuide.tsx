'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import {
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Code2,
  Layers,
  Info,
} from 'lucide-react';

/* ─────────────────────────────── types ─────────────────────────────── */
interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

/* ─────────────────────── collapsible wrapper ─────────────────────────── */
function SectionCard({
  icon,
  title,
  subtitle,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--text-muted)]">
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--text-main)] leading-tight">{title}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{subtitle}</p>
          </div>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-[var(--border)]">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── chips ─────────────────────────────── */
function ComplexityChip({
  label,
  color,
  note,
}: {
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red' | 'purple';
  note: string;
}) {
  const colors = {
    green: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400',
    yellow: 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400',
    orange: 'bg-orange-500/10 border-orange-500/25 text-orange-600 dark:text-orange-400',
    red: 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400',
    purple: 'bg-purple-500/10 border-purple-500/25 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]">
      <code className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold shrink-0 ${colors[color]}`}>
        {label}
      </code>
      <span className="text-xs text-[var(--text-muted)] leading-snug">{note}</span>
    </div>
  );
}

/* ─────────────────────────── code block ─────────────────────────────── */
function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)]">
      {label && (
        <div className="px-4 py-1.5 bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[10px] font-mono text-[var(--text-muted)] tracking-wide uppercase">
          {label}
        </div>
      )}
      <pre className="p-4 text-xs leading-relaxed text-[var(--text-main)] bg-[var(--bg-card)] overflow-x-auto font-mono whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

/* ─────────────────────────── callout ─────────────────────────────── */
function Callout({
  type,
  children,
}: {
  type: 'tip' | 'warning' | 'info';
  children: React.ReactNode;
}) {
  const styles = {
    tip: {
      cls: 'bg-emerald-500/8 border-emerald-500/25 text-emerald-700 dark:text-emerald-300',
      Icon: CheckCircle2,
    },
    warning: {
      cls: 'bg-amber-500/8 border-amber-500/25 text-amber-700 dark:text-amber-300',
      Icon: AlertTriangle,
    },
    info: {
      cls: 'bg-blue-500/8 border-blue-500/25 text-blue-700 dark:text-blue-300',
      Icon: Info,
    },
  };
  const { cls, Icon } = styles[type];

  return (
    <div className={`flex gap-2.5 p-3.5 rounded-xl border text-xs leading-relaxed ${cls}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export function TimeComplexityGuide() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-5">

        {/* ── Hero ── */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)] shadow-2xs">
            <Clock className="w-3.5 h-3.5 opacity-80" />
            <span>Master Notes · From Scratch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
            Time &amp; Space Complexity
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            The complete guide to analyzing algorithm efficiency — from what Big O means to calculating
            complexity of any code you write, with examples from every pattern.
          </p>
        </section>

        {/* ══ 1. What Is Complexity Analysis ══ */}
        <SectionCard
          icon={<BookOpen className="w-4 h-4" />}
          title="1 · What Is Complexity Analysis?"
          subtitle="Understanding what we're measuring and why it matters"
        >
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Complexity analysis answers one question: <strong className="text-[var(--text-main)]">how does the runtime (or memory) of
              an algorithm grow as the input size grows?</strong> We express this with <em>Big O notation</em>.
            </p>
            <Callout type="info">
              <strong>Why not just time it?</strong> Wall-clock time depends on hardware, OS load, and language.
              Big O describes the <em>mathematical relationship</em> between input size and operations — so it
              holds on any machine.
            </Callout>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { term: 'n', def: 'The size of the input (e.g., length of an array, number of nodes in a graph)' },
                { term: 'T(n)', def: 'The exact number of operations as a function of n' },
                { term: 'O(f(n))', def: 'An upper bound — T(n) grows no faster than f(n) times a constant' },
              ].map(({ term, def }) => (
                <div key={term} className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] space-y-1">
                  <code className="text-sm font-mono font-bold text-[var(--text-main)]">{term}</code>
                  <p className="text-xs text-[var(--text-muted)] leading-snug">{def}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ══ 2. Big O Classes (the complexity ladder) ══ */}
        <SectionCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="2 · The Complexity Ladder"
          subtitle="Every Big O class, ordered from fastest to slowest"
        >
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              For n = 1,000,000 — here is roughly how many operations each class performs:
            </p>
            <div className="space-y-2">
              <ComplexityChip label="O(1)" color="green" note="Constant — same number of ops regardless of input size. Array index lookup, hash-map get/set, stack push/pop. ≈ 1 op" />
              <ComplexityChip label="O(log n)" color="green" note="Logarithmic — halves the problem each step. Binary search, balanced BST lookup. ≈ 20 ops for n = 1M" />
              <ComplexityChip label="O(n)" color="green" note="Linear — visits every element once. Single loop, linear scan, BFS/DFS. ≈ 1,000,000 ops" />
              <ComplexityChip label="O(n log n)" color="yellow" note="Linearithmic — optimal for comparison-based sorting. Merge sort, heap sort, most built-in sorts. ≈ 20,000,000 ops" />
              <ComplexityChip label="O(n²)" color="orange" note="Quadratic — nested loops over the same input. Bubble sort, brute-force pair search. ≈ 10¹² ops (too slow for n = 1M)" />
              <ComplexityChip label="O(n³)" color="red" note="Cubic — triple nested loops. Floyd-Warshall on dense graphs. Acceptable only for n ≤ 500" />
              <ComplexityChip label="O(2ⁿ)" color="red" note="Exponential — all subsets. Brute-force subset enumeration. Feasible only for n ≤ 25" />
              <ComplexityChip label="O(n!)" color="purple" note="Factorial — all permutations. Brute-force TSP. Feasible only for n ≤ 12" />
            </div>
            <Callout type="tip">
              <strong>Interview rule of thumb:</strong> ≤ 10⁸ operations per second is the safe budget.
              n = 10⁵ → O(n log n) is fine. n = 10³ → O(n²) is fine. n = 20 → O(2ⁿ) is fine.
            </Callout>
          </div>
        </SectionCard>

        {/* ══ 3. Four Rules for Calculating Big O ══ */}
        <SectionCard
          icon={<Zap className="w-4 h-4" />}
          title="3 · Four Golden Rules for Calculating Big O"
          subtitle="Apply these rules to any code snippet to get its complexity"
        >
          <div className="space-y-5">

            {/* Rule 1 */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wide">Rule 1 — Drop Constants</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Big O describes growth rate, not exact counts. Multiplicative constants are irrelevant
                because hardware already absorbs constant factors.
              </p>
              <CodeBlock label="example" code={`// Two separate loops → 2n ops → O(n), not O(2n)
for (let i = 0; i < n; i++) doSomething(i);
for (let i = 0; i < n; i++) doSomethingElse(i);`} />
            </div>

            {/* Rule 2 */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wide">Rule 2 — Drop Lower-Order Terms</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                When two terms are added, keep only the dominant one. For large n, n² completely
                overshadows n.
              </p>
              <CodeBlock label="example" code={`// O(n² + n)  →  O(n²)
// O(n log n + n)  →  O(n log n)
// O(2ⁿ + n³)  →  O(2ⁿ)

// In code: outer O(n²) loop + inner O(n) loop = O(n²) total
for (let i = 0; i < n; i++)          // n iterations
  for (let j = 0; j < n; j++)        //   × n = n²
    process(i, j);

for (let k = 0; k < n; k++)          // + n  → still O(n²)
  scan(k);`} />
            </div>

            {/* Rule 3 */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wide">Rule 3 — Sequential Steps Add, Nested Steps Multiply</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Steps one-after-another → add. Steps one-inside-another → multiply.
              </p>
              <CodeBlock label="add (sequential)" code={`// O(n) + O(m)  →  O(n + m)   different inputs!
function twoArrays(a, b) {
  for (const x of a) print(x);   // O(n)
  for (const y of b) print(y);   // O(m)
}`} />
              <CodeBlock label="multiply (nested)" code={`// O(n) × O(m)  →  O(n·m)
function pairs(a, b) {
  for (const x of a)            // O(n)
    for (const y of b)          //   × O(m)
      print(x, y);              // → O(n·m)
}`} />
              <Callout type="warning">
                When two inputs are <em>different</em> arrays (n and m), keep both variables — do not
                simplify to O(n²).
              </Callout>
            </div>

            {/* Rule 4 */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wide">Rule 4 — Recursion = Work per Call × Number of Calls</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                For recursive functions draw the <em>recursion tree</em>: how many nodes (calls) and
                how much work at each node?
              </p>
              <CodeBlock label="fibonacci (naïve)" code={`// fib(n) calls fib(n-1) and fib(n-2)
// Tree has ≈ 2ⁿ nodes, O(1) work each → O(2ⁿ)
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`} />
              <CodeBlock label="merge sort" code={`// mergeSort splits in half → log n levels
// Each level merges O(n) elements in total
// → O(n log n)
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  return merge(
    mergeSort(arr.slice(0, mid)),   // left half
    mergeSort(arr.slice(mid))       // right half
  );
  // merge() is O(n) per level, log n levels → O(n log n)
}`} />
            </div>
          </div>
        </SectionCard>

        {/* ══ 4. Pattern-by-Pattern Complexity ══ */}
        <SectionCard
          icon={<Code2 className="w-4 h-4" />}
          title="4 · Pattern-by-Pattern Complexity"
          subtitle="Why each DSA pattern has its characteristic Big O"
        >
          <div className="space-y-3">
            {[
              {
                name: 'Two Pointers',
                time: 'O(n)',
                space: 'O(1)',
                why: 'Each pointer moves at most n steps in total. Even when both move, combined steps ≤ 2n.',
              },
              {
                name: 'Sliding Window',
                time: 'O(n)',
                space: 'O(k)',
                why: 'right pointer advances n times; left pointer also advances at most n times total. Each element enters and leaves the window once.',
              },
              {
                name: 'Binary Search',
                time: 'O(log n)',
                space: 'O(1)',
                why: 'Each comparison halves the remaining search space. Starting with n, after k steps we have n / 2^k. When n / 2^k = 1, k = log₂n.',
              },
              {
                name: 'Prefix Sum',
                time: 'O(n) build + O(1) query',
                space: 'O(n)',
                why: 'One pass to build the prefix array. Any range sum is then a single subtraction.',
              },
              {
                name: 'Monotonic Stack',
                time: 'O(n)',
                space: 'O(n)',
                why: 'Every element is pushed once and popped at most once. Total push+pop operations = 2n.',
              },
              {
                name: 'Heap / Top-K',
                time: 'O(n log k)',
                space: 'O(k)',
                why: 'Each of n elements is pushed into a heap of size k. A heap push/pop is O(log k). Total: n × log k.',
              },
              {
                name: 'BFS / DFS (Graph)',
                time: 'O(V + E)',
                space: 'O(V)',
                why: 'Each vertex is visited once (O(V)). Each edge is inspected once from both ends (O(E)). Queue or stack holds at most O(V) nodes.',
              },
              {
                name: 'Tree DFS',
                time: 'O(n)',
                space: 'O(h) — call stack',
                why: 'Every node is visited once. Stack depth equals tree height h. For balanced trees h = O(log n); for skewed trees h = O(n).',
              },
              {
                name: 'Merge Sort / Sort',
                time: 'O(n log n)',
                space: 'O(n)',
                why: 'log n levels of recursion. Each level does O(n) merge work. Array.sort() in JS is Timsort — same asymptotic bound.',
              },
              {
                name: '1D Dynamic Programming',
                time: 'O(n)',
                space: 'O(n) → O(1) optimized',
                why: 'Fill n states, each in O(1). Rolling array optimization drops space to O(1) when only previous states are needed.',
              },
              {
                name: '2D Dynamic Programming',
                time: 'O(m × n)',
                space: 'O(m × n) → O(n) optimized',
                why: 'Fill every cell in an m×n table. With rolling rows, space drops to O(n).',
              },
              {
                name: 'Backtracking',
                time: 'O(b^d) where b = branching factor, d = depth',
                space: 'O(d)',
                why: 'In the worst case all branches are explored. Pruning reduces the constant but not the worst-case class.',
              },
              {
                name: 'Union-Find',
                time: 'O(α(n)) per op ≈ O(1)',
                space: 'O(n)',
                why: 'With path compression + union by rank, the inverse Ackermann function α(n) < 5 for any practical n.',
              },
            ].map(({ name, time, space, why }) => (
              <div key={name} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-main)]">{name}</span>
                  <code className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
                    Time: {time}
                  </code>
                  <code className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-mono">
                    Space: {space}
                  </code>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{why}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══ 5. Space Complexity ══ */}
        <SectionCard
          icon={<Layers className="w-4 h-4" />}
          title="5 · Space Complexity"
          subtitle="Memory usage — call stack, auxiliary data structures, and input"
        >
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Space complexity counts all memory <em>your algorithm allocates</em>, excluding the read-only input
              (unless explicitly storing it). Include:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Variables', note: 'Primitives, pointers, accumulators — all O(1)' },
                { label: 'Call stack', note: 'Each recursive call frame counts. Depth h → O(h) stack space' },
                { label: 'Data structures', note: 'Arrays, sets, maps, queues you create — count their size' },
                { label: 'Output space', note: 'Often excluded from auxiliary space analysis; ask your interviewer' },
              ].map(({ label, note }) => (
                <div key={label} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] space-y-0.5">
                  <p className="text-xs font-semibold text-[var(--text-main)]">{label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{note}</p>
                </div>
              ))}
            </div>
            <CodeBlock label="space analysis example" code={`function reverseWords(s: string): string {
  const words = s.split(' ');   // O(n) space — new array
  words.reverse();              // O(1) extra (in-place)
  return words.join(' ');       // O(n) output
}
// Auxiliary space: O(n)  (the words array)
// Output space: O(n)  (the returned string)

// ────────────────────────────────────────────
function factorialRecursive(n: number): number {
  if (n <= 1) return 1;
  return n * factorialRecursive(n - 1);
}
// Time: O(n)   — n recursive calls
// Space: O(n)  — n frames on the call stack

function factorialIterative(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}
// Time: O(n)   — same
// Space: O(1)  — single variable, no call stack growth`} />
            <Callout type="tip">
              Interviewers often ask you to trade space for time. A hash map can reduce an O(n²)
              brute-force to O(n) time at the cost of O(n) space. Recognize these trade-offs.
            </Callout>
          </div>
        </SectionCard>

        {/* ══ 6. Step-by-Step: How to Analyze Any Code ══ */}
        <SectionCard
          icon={<CheckCircle2 className="w-4 h-4" />}
          title="6 · Step-by-Step: How to Analyze Any Code"
          subtitle="A systematic method you can apply in every interview"
          defaultOpen={false}
        >
          <div className="space-y-4">
            <ol className="space-y-3">
              {[
                {
                  step: '1',
                  title: 'Identify the input variable(s)',
                  body: 'Name them: n = array length, m = string length, V = vertices, E = edges. If multiple inputs, keep separate variables.',
                },
                {
                  step: '2',
                  title: 'Find every loop and recursive call',
                  body: 'Mark each loop with how many times it runs in terms of n. Nested loops multiply; sequential loops add.',
                },
                {
                  step: '3',
                  title: 'Check what happens inside each loop',
                  body: 'Is the inner work O(1)? Does it call sort() → O(n log n)? Does it do a set lookup → O(1)? Multiply loop count × inner cost.',
                },
                {
                  step: '4',
                  title: 'Handle recursion with the recursion tree',
                  body: 'Draw levels of the tree. Width at each level × work per node = cost per level. Sum across log n or n levels.',
                },
                {
                  step: '5',
                  title: 'Apply the four rules',
                  body: 'Drop constants. Drop lower-order terms. Combine with + or ×. Simplify to the dominant term.',
                },
                {
                  step: '6',
                  title: 'Count space separately',
                  body: 'List every data structure and call stack depth. Sum them. Drop lower-order space terms too.',
                },
              ].map(({ step, title, body }) => (
                <li key={step} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] shrink-0 mt-0.5">
                    {step}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-main)]">{title}</p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-0.5">{body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <CodeBlock label="worked example — two sum" code={`function twoSum(nums: number[], target: number) {
  // Step 1: n = nums.length
  const map = new Map<number, number>();  // Space: O(n)

  for (let i = 0; i < n; i++) {          // Step 2: loop runs n times
    const complement = target - nums[i]; // Step 3: O(1) arithmetic
    if (map.has(complement))             //         O(1) hash lookup
      return [map.get(complement)!, i];
    map.set(nums[i], i);                 //         O(1) hash set
  }                                      // Total inner work: O(1)
}

// Time:  n iterations × O(1) inner → O(n)
// Space: map grows up to n entries → O(n)
// Final answer: O(n) time · O(n) space`} />
          </div>
        </SectionCard>

        {/* ══ 7. Common Mistakes ══ */}
        <SectionCard
          icon={<AlertTriangle className="w-4 h-4" />}
          title="7 · Common Mistakes & Traps"
          subtitle="Things that trip up even experienced engineers"
          defaultOpen={false}
        >
          <div className="space-y-3">
            {[
              {
                trap: 'String concatenation in a loop',
                detail: `In most languages, "str += c" inside a loop is O(n²) because each concat copies the whole string. Use an array and join at the end → O(n).`,
              },
              {
                trap: 'Forgetting sort() inside a loop',
                detail: `If you call arr.sort() inside a loop of n iterations, total cost is O(n² log n). Pull sorting out of loops whenever possible.`,
              },
              {
                trap: 'Assuming Array.includes() is O(1)',
                detail: `Array.includes() / indexOf() is O(n) — it scans linearly. Convert to a Set first for O(1) lookups.`,
              },
              {
                trap: 'Treating two separate inputs as the same',
                detail: `If a function takes arrays A and B of lengths n and m, O(n + m) is NOT the same as O(n). Keep both terms until you know their relationship.`,
              },
              {
                trap: 'Ignoring slice/splice costs',
                detail: `arr.slice(mid) creates a new array in O(n). If done inside a recursive call, it multiplies the cost. Use index pointers instead.`,
              },
              {
                trap: 'Counting amortized operations incorrectly',
                detail: `Array push is O(1) amortized, not O(1) always — occasional resizing is O(n) but spread over n pushes gives O(1) average.`,
              },
            ].map(({ trap, detail }) => (
              <div key={trap} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1.5">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {trap}
                </p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══ 8. Interview Cheat Sheet ══ */}
        <SectionCard
          icon={<Zap className="w-4 h-4" />}
          title="8 · Interview Cheat Sheet"
          subtitle="Quick-reference table — memorize this"
          defaultOpen={false}
        >
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border)]">
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Operation</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Time</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--text-main)]">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {[
                  ['Array index', 'O(1)', 'Read or write by index'],
                  ['Array push / pop (end)', 'O(1) amortized', 'May resize occasionally'],
                  ['Array shift / unshift', 'O(n)', 'Shifts all elements'],
                  ['Array slice(i, j)', 'O(j - i)', 'Copies a segment'],
                  ['Array sort', 'O(n log n)', 'Timsort in JS/Python'],
                  ['Set / Map lookup', 'O(1) avg', 'O(n) worst in rare cases'],
                  ['Set / Map insert', 'O(1) amortized', ''],
                  ['Binary search', 'O(log n)', 'Sorted array required'],
                  ['Heap push / pop', 'O(log n)', 'n = heap size'],
                  ['Build heap from array', 'O(n)', 'heapify algorithm'],
                  ['String concat (+=)', 'O(n) per op', 'Use array + join for loops'],
                  ['Recursive DFS on tree', 'O(n)', 'O(h) stack space'],
                  ['Trie insert / search', 'O(L)', 'L = word length'],
                  ['Union-Find find', 'O(α(n)) ≈ O(1)', 'With path compression'],
                ].map(([op, time, note], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-subtle)]/40'}>
                    <td className="px-4 py-2 font-mono text-[var(--text-main)]">{op}</td>
                    <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{time}</td>
                    <td className="px-4 py-2 text-[var(--text-muted)]">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

      </main>
    </div>
  );
}
