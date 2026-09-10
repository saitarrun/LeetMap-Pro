export interface PatternGuide {
  steps: string[];
  template: string;
  complexity: string;
  pitfall: string;
}

export const PATTERN_GUIDES: Record<string, PatternGuide> = {
  'two-pointers': {
    steps: ['Choose opposite or same-direction pointers.', 'Move the pointer that makes progress.', 'Stop when pointers meet or one reaches the end.'],
    template: 'while (left < right) { check(); moveOne(); }',
    complexity: 'Usually O(n) time · O(1) space',
    pitfall: 'Move a pointer on every path to avoid infinite loops.',
  },
  'sliding-window': {
    steps: ['Expand right and add the new value.', 'Shrink left while the window is invalid.', 'Update the answer at the valid boundary.'],
    template: 'for (right...) { add; while (invalid) remove(left++); }',
    complexity: 'Usually O(n) time · O(k) space',
    pitfall: 'Use a window only when the target range is contiguous.',
  },
  'binary-search': {
    steps: ['Define the monotonic search space.', 'Choose what true and false mean.', 'Preserve the answer inside the boundaries.'],
    template: 'while (lo < hi) { mid = lo + (hi-lo)/2; narrow(); }',
    complexity: 'O(log n) checks · check cost may vary',
    pitfall: 'Pick one boundary convention and keep it consistent.',
  },
  'prefix-sum': {
    steps: ['Build a running cumulative value.', 'Express each range as a prefix difference.', 'Store prior prefixes when counting targets.'],
    template: 'prefix += x; answer += seen[prefix - target]; seen[prefix]++;',
    complexity: 'O(n) time · O(n) space with a map',
    pitfall: 'Seed the map with prefix 0 occurring once.',
  },
  'fast-slow-pointers': {
    steps: ['Advance slow once and fast twice.', 'Detect a meeting or a null boundary.', 'Reset one pointer when locating cycle entry.'],
    template: 'slow = next(slow); fast = next(next(fast));',
    complexity: 'O(n) time · O(1) space',
    pitfall: 'Check fast and fast.next before moving twice.',
  },
  'linked-list-manipulation': {
    steps: ['Use a dummy node for head edge cases.', 'Save next before changing a link.', 'Reconnect the transformed segment carefully.'],
    template: 'next = curr.next; curr.next = prev; prev = curr; curr = next;',
    complexity: 'Usually O(n) time · O(1) space',
    pitfall: 'Never overwrite a next pointer before saving it.',
  },
  'monotonic-stack': {
    steps: ['Choose increasing or decreasing order.', 'Pop while the new value resolves old entries.', 'Push indices when distance or width matters.'],
    template: 'while (stack && violates(top, x)) resolve(pop()); push(i);',
    complexity: 'O(n) time · O(n) space',
    pitfall: 'Decide whether equal values should stay or pop.',
  },
  'heaps-top-k': {
    steps: ['Choose a min-heap for top K largest.', 'Push candidates and trim beyond size K.', 'Read or drain the heap for the result.'],
    template: 'push(x); if (heap.size > k) pop();',
    complexity: 'O(n log k) time · O(k) space',
    pitfall: 'Use the opposite heap from the extreme you are keeping.',
  },
  trie: {
    steps: ['Walk one character at a time.', 'Create missing child nodes on insert.', 'Mark complete words separately from prefixes.'],
    template: 'for (char of word) node = node.children[char];',
    complexity: 'O(L) per operation · O(total characters) space',
    pitfall: 'A valid prefix is not necessarily a complete word.',
  },
  'union-find': {
    steps: ['Initialize every node as its own parent.', 'Find roots with path compression.', 'Union roots by rank or size.'],
    template: 'find(x) = parent[x] == x ? x : parent[x] = find(parent[x]);',
    complexity: 'Near O(1) amortized · O(n) space',
    pitfall: 'Compare roots, not the original nodes, before union.',
  },
  intervals: {
    steps: ['Sort by start time unless the proof needs end time.', 'Compare the current interval with the last result.', 'Merge overlaps or finalize a disjoint interval.'],
    template: 'if (start <= lastEnd) merge(); else append();',
    complexity: 'O(n log n) time · O(n) output space',
    pitfall: 'Confirm whether touching endpoints count as overlap.',
  },
  'tree-dfs': {
    steps: ['Define what each recursive call returns.', 'Handle the null-node base case.', 'Combine left and right results at the parent.'],
    template: 'dfs(node) { if (!node) base; return combine(dfs(left), dfs(right)); }',
    complexity: 'O(n) time · O(h) call stack',
    pitfall: 'Separate global answers from values returned upward.',
  },
  'tree-bfs': {
    steps: ['Queue the root.', 'Capture queue size before each level.', 'Process exactly that many nodes, then enqueue children.'],
    template: 'while (queue) { size = queue.size; repeat(size) visit(pop()); }',
    complexity: 'O(n) time · O(width) space',
    pitfall: 'Do not use a changing queue length as the level bound.',
  },
  'binary-search-tree': {
    steps: ['Use the lower/upper bounds implied by ancestors.', 'Go left for smaller and right for larger.', 'Use inorder traversal when sorted order helps.'],
    template: 'valid(node, low, high) with low < node.val < high',
    complexity: 'O(h) search · O(n) worst case',
    pitfall: 'Immediate-parent checks are not enough for validation.',
  },
  'graph-traversal': {
    steps: ['Build or infer neighbors.', 'Mark nodes visited before enqueueing or recursing.', 'Use BFS for unweighted shortest paths, DFS for exploration.'],
    template: 'visit(start); for (next of neighbors) if (!seen) visit(next);',
    complexity: 'O(V + E) time · O(V) space',
    pitfall: 'Mark visited early so the same node is not queued twice.',
  },
  'topological-sort': {
    steps: ['Build edges and indegree counts.', 'Queue every zero-indegree node.', 'Remove edges; processed count detects cycles.'],
    template: 'queue(indegree == 0); pop; for (next) if (--indegree[next] == 0) push;',
    complexity: 'O(V + E) time · O(V + E) space',
    pitfall: 'Edge direction must follow the prerequisite relationship.',
  },
  'matrix-traversal': {
    steps: ['Represent cells as row and column pairs.', 'Centralize bounds and visited checks.', 'Use direction vectors instead of repeated branches.'],
    template: 'for ([dr, dc] of dirs) visit(row + dr, col + dc);',
    complexity: 'Usually O(rows × cols) time',
    pitfall: 'Do not mix row limits with column limits.',
  },
  backtracking: {
    steps: ['Choose a candidate.', 'Recurse only if the partial state is valid.', 'Undo the choice before trying the next candidate.'],
    template: 'choose(x); backtrack(next); unchoose(x);',
    complexity: 'Often exponential · O(depth) stack',
    pitfall: 'Copy a completed path before storing it.',
  },
  'dynamic-programming-1d': {
    steps: ['Define the state in one sentence.', 'Write the transition from smaller states.', 'Set base cases, then choose iteration order.'],
    template: 'dp[i] = best(dp[i-1], dp[i-2] + value[i]);',
    complexity: 'Usually O(n) time · O(n) or O(1) space',
    pitfall: 'Optimize memory only after the recurrence is correct.',
  },
  'dynamic-programming-2d': {
    steps: ['Define what dp[i][j] represents.', 'Identify row and column base cases.', 'Fill in an order where dependencies already exist.'],
    template: 'dp[i][j] = combine(dp[i-1][j], dp[i][j-1], ...);',
    complexity: 'Usually O(mn) time · O(mn) space',
    pitfall: 'Rolling arrays may require right-to-left iteration.',
  },
  greedy: {
    steps: ['Identify the locally best irreversible choice.', 'Sort or prioritize candidates if needed.', 'Prove an exchange cannot improve the answer.'],
    template: 'sort(candidates); for (x) if (feasible(x)) take(x);',
    complexity: 'Often O(n log n) due to sorting',
    pitfall: 'A plausible local choice is not enough—find the proof.',
  },
  'bit-manipulation': {
    steps: ['Translate the condition into bits or a mask.', 'Apply one known identity at a time.', 'Test zero, sign, and highest-bit edge cases.'],
    template: 'clearLowBit: n &= n - 1 · lowBit: n & -n · toggle: mask ^= 1 << i',
    complexity: 'Often O(1) or O(number of bits)',
    pitfall: 'Know whether the language uses signed bitwise integers.',
  },
};
