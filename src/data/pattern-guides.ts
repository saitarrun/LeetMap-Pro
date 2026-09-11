export interface PatternGuide {
  summary: string;
  triggers: string[];
  whenNotToUse?: string;
  mentalModel: string;
  steps: string[];
  templateName?: string;
  template: string;
  canonicalProblems: { id?: string; name: string; why: string }[];
  complexity: {
    time: string;
    space: string;
    note?: string;
  };
  pitfalls: string[];
}

export const PATTERN_GUIDES: Record<string, PatternGuide> = {
  'two-pointers': {
    summary: 'Search pairs or reverse sequences by moving two indices inward or in parallel, pruning suboptimal options in O(1) time without nested loops.',
    triggers: [
      'Array is sorted and you need to find a pair, triplet, or target sum',
      'Palindrome verification, string reversal, or inward symmetry checking',
      'Partitioning an array around a pivot (Dutch National Flag, sort colors)',
      'Trapping rainwater / container boundaries where width and height constrain area',
    ],
    whenNotToUse: 'Array is unsorted and problem requires contiguous subarrays with sum K (especially with negative numbers; use Prefix Sum + Hash Map instead).',
    mentalModel: 'Maintain the search space invariant: elements outside [left, right] have already been evaluated and eliminated. Advance whichever pointer monotonically improves or resolves the target condition.',
    steps: [
      'Initialize left = 0 and right = len(nums) - 1 (for opposite-direction pointers).',
      'In a `while left < right` loop, evaluate the current state: curr_sum = nums[left] + nums[right].',
      'If target matched, record answer or return immediately.',
      'If curr_sum < target, advance `left += 1` to increase sum; if curr_sum > target, decrement `right -= 1` to decrease sum.',
      'Skip duplicate values using inner while loops when unique tuples are required (e.g. 3Sum).',
    ],
    templateName: 'Opposite-Direction Two Pointers',
    template: `def two_pointers_search(nums: list[int], target: int) -> list[int]:
    # Prerequisite: array must be sorted
    left, right = 0, len(nums) - 1
    
    while left < right:
        curr_sum = nums[left] + nums[right]
        if curr_sum == target:
            return [left, right]
        elif curr_sum < target:
            left += 1   # Need larger sum -> move left inward
        else:
            right -= 1  # Need smaller sum -> move right inward
            
    return []`,
    canonicalProblems: [
      { id: '167', name: 'Two Sum II - Input Array Is Sorted', why: 'Inward movement directly targets sum' },
      { id: '15', name: '3Sum', why: 'Fix one element, then run Two Pointers on sorted remainder' },
      { id: '11', name: 'Container With Most Water', why: 'Always move the shorter line inward' },
      { id: '125', name: 'Valid Palindrome', why: 'Compare characters inward while skipping non-alphanumerics' },
    ],
    complexity: {
      time: 'O(n) [or O(n log n) if sorting is required]',
      space: 'O(1) auxiliary memory',
      note: 'Sort in-place to preserve O(1) space guarantee.',
    },
    pitfalls: [
      'Off-by-one in loop condition (\`left < right\` vs \`left <= right\` when element reuse is prohibited)',
      'Forgetting to skip duplicate elements inside the loop when unique triplets/quadruplets are needed',
      'Not advancing pointers inside duplicate skip loops causing infinite loops',
    ],
  },

  'sliding-window': {
    summary: 'Track a contiguous subsegment of an array or string by expanding a right boundary and lazily contracting a left boundary whenever a constraint is broken.',
    triggers: [
      'Contiguous subarray or substring',
      'Longest / shortest substring meeting constraint K (e.g., at most K distinct chars)',
      'Find minimum size subarray with sum >= S (non-negative numbers)',
      'Fixed window of size K (e.g., maximum average of any subarray of size K)',
    ],
    whenNotToUse: 'Array contains negative numbers and constraint is on sum (monotonicity is broken; must use Prefix Sum + Hash Map).',
    mentalModel: 'Monotonicity invariant: As `right` expands, window validity only degrades; advancing `left` only restores validity. Left pointer never moves backward, guaranteeing O(N) total pointer steps.',
    steps: [
      'Initialize `left = 0`, state tracking (e.g., frequency map or running sum), and `ans`.',
      'Iterate `right` from 0 to len(arr) - 1, incorporating `arr[right]` into window state.',
      'While the window constraint is broken: remove `arr[left]` from state and increment `left += 1`.',
      'For longest valid window: update `ans = max(ans, right - left + 1)` after the shrink loop.',
      'For shortest valid window: update `ans = min(ans, right - left + 1)` inside or right before the shrink loop.',
    ],
    templateName: 'Dynamic Sliding Window (Flexible / At Most K)',
    template: `from collections import defaultdict

def sliding_window_at_most_k(s: str, k: int) -> int:
    counts = defaultdict(int)
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        # 1. Expand window: include s[right]
        counts[s[right]] += 1
        
        # 2. Shrink window: contract from left while invalid
        while len(counts) > k:  # e.g., at most k distinct characters
            counts[s[left]] -= 1
            if counts[s[left]] == 0:
                del counts[s[left]]  # Must remove key to fix len(counts)
            left += 1
            
        # 3. Window [left...right] is now guaranteed valid
        max_len = max(max_len, right - left + 1)
        
    return max_len`,
    canonicalProblems: [
      { id: '3', name: 'Longest Substring Without Repeating Characters', why: 'Shrink left until repeated char count drops back to 1' },
      { id: '76', name: 'Minimum Window Substring', why: 'Expand until all target chars covered, shrink left to minimize length' },
      { id: '209', name: 'Minimum Size Subarray Sum', why: 'Shrink left while sum >= target to find minimal length' },
      { id: '424', name: 'Longest Repeating Character Replacement', why: 'Window is valid as long as window_len - max_freq <= k' },
    ],
    complexity: {
      time: 'O(n) amortized (each item added and removed at most once)',
      space: 'O(k) or O(min(n, alphabet_size))',
      note: 'State map size bounded by distinct character alphabet (usually <= 26 or 128).',
    },
    pitfalls: [
      'Shrinking with `if` instead of `while` when multiple elements must be evicted to restore validity',
      'Forgetting to `del counts[key]` when count drops to 0 (leaving a 0 entry distorts len(counts))',
      'Updating the answer at the wrong time (before vs after shrink loop depending on min vs max window)',
    ],
  },

  'binary-search': {
    summary: 'Halve the search space at each step over any monotonically ordered sequence or decision boundary (FF...FTTT...T).',
    triggers: [
      'Search target in sorted or rotated sorted array in O(log n)',
      'Find first or last occurrence of an element in a duplicated sorted array',
      'Find minimum or maximum value satisfying a condition (Binary Search on Answer)',
      'Keywords: "minimize the maximum", "maximize the minimum", "capacity to ship", "eating speed"',
    ],
    whenNotToUse: 'Search space is neither sorted nor monotonic (the feasibility predicate does not stay True once satisfied).',
    mentalModel: 'The predicate `feasible(mid)` divides the range into two halves: [False, ..., False, True, ..., True]. Binary search pinpoints the exact boundary where the transition occurs.',
    steps: [
      'Define search boundaries: `low` = minimum possible answer, `high` = maximum possible answer.',
      'In a `while low <= high` loop: calculate `mid = low + (high - low) // 2`.',
      'Evaluate feasibility: `can_achieve(mid)`.',
      'For minimization: if feasible, record `ans = mid` and search smaller values `high = mid - 1`; else `low = mid + 1`.',
      'For maximization: if feasible, record `ans = mid` and search larger values `low = mid + 1`; else `high = mid - 1`.',
      'Return recorded `ans`.',
    ],
    templateName: 'Binary Search on Answer (Minimize Feasible Value)',
    template: `def binary_search_on_answer(weights: list[int], days: int) -> int:
    def can_ship(capacity: int) -> bool:
        needed_days = 1
        curr_load = 0
        for w in weights:
            if curr_load + w > capacity:
                needed_days += 1
                curr_load = 0
            curr_load += w
        return needed_days <= days

    # Boundaries: minimum single package and total package weight
    low, high = max(weights), sum(weights)
    best = high
    
    while low <= high:
        mid = low + (high - low) // 2
        if can_ship(mid):
            best = mid        # Capacity works, try to find smaller
            high = mid - 1
        else:
            low = mid + 1     # Capacity too small, must increase
            
    return best`,
    canonicalProblems: [
      { id: '704', name: 'Binary Search', why: 'Canonical search for value in sorted array' },
      { id: '33', name: 'Search in Rotated Sorted Array', why: 'One half is always sorted; check if target falls inside it' },
      { id: '875', name: 'Koko Eating Bananas', why: 'Search eating speed in range [1, max(piles)]' },
      { id: '1011', name: 'Capacity To Ship Packages Within D Days', why: 'Search minimum ship capacity in range [max(w), sum(w)]' },
    ],
    complexity: {
      time: 'O(log(range) * O(check))',
      space: 'O(1) auxiliary space',
      note: 'Logarithmic iterations guarantee extremely fast convergence (< 32 iterations for 10^9).',
    },
    pitfalls: [
      'Infinite loop from improper midpoint update: avoid `low = mid` without `+ 1` in `while low <= high`',
      'Setting `low` too small in answer search (e.g. `low = 0` when individual items cannot fit)',
      'Integer overflow in non-Python languages: use `low + (high - low) // 2` instead of `(low + high) // 2`',
    ],
  },

  'prefix-sum': {
    summary: 'Precompute cumulative values so any range sum sum(nums[i..j]) is computed in O(1) time as prefix[j+1] - prefix[i], or combined with a Hash Map to find subarrays in O(N).',
    triggers: [
      'Subarray sum equals K (especially with negative numbers)',
      'Number of continuous subarrays divisible by K',
      'Longest subarray with equal number of 0s and 1s',
      'Repeated range sum queries on static array / 2D matrix',
    ],
    whenNotToUse: 'Frequent updates/modifications to array elements (use Fenwick Tree / Segment Tree for O(log n) dynamic updates).',
    mentalModel: 'Sum(i..j) = Prefix[j] - Prefix[i-1] = target implies Prefix[i-1] = Prefix[j] - target. By storing seen prefix sums in a Hash Map, we can count or find valid starting indices in O(1)!',
    steps: [
      'Initialize `curr_sum = 0`, `count = 0`, and `seen = {0: 1}` (empty prefix has sum 0 occurring once).',
      'Iterate through each number `x` in the array.',
      'Add to running sum: `curr_sum += x`.',
      'Check if `(curr_sum - target)` exists in `seen`. If so, add its frequency to `count`.',
      'Record current sum in map: `seen[curr_sum] = seen.get(curr_sum, 0) + 1`.',
      'Return `count`.',
    ],
    templateName: 'Prefix Sum + Hash Map (Subarray Sum Equals K)',
    template: `def subarray_sum_equals_k(nums: list[int], k: int) -> int:
    prefix_counts = {0: 1}  # Base case: sum 0 occurs once before array starts
    curr_sum = 0
    total_subarrays = 0
    
    for num in nums:
        curr_sum += num
        # If (curr_sum - k) was seen before, those prior points form valid subarrays
        diff = curr_sum - k
        if diff in prefix_counts:
            total_subarrays += prefix_counts[diff]
            
        prefix_counts[curr_sum] = prefix_counts.get(curr_sum, 0) + 1
        
    return total_subarrays`,
    canonicalProblems: [
      { id: '560', name: 'Subarray Sum Equals K', why: 'Count subarrays with sum K even with negative numbers' },
      { id: '525', name: 'Contiguous Array', why: 'Map 0 -> -1; longest subarray with sum 0 has equal 0s and 1s' },
      { id: '238', name: 'Product of Array Except Self', why: 'Combine prefix products from left and suffix products from right' },
      { id: '304', name: 'Range Sum Query 2D - Immutable', why: '2D prefix grid inclusion-exclusion area formula' },
    ],
    complexity: {
      time: 'O(n) single pass',
      space: 'O(n) for hash map / prefix array',
      note: 'Reduces an O(n^2) brute force subarray check down to O(n).',
    },
    pitfalls: [
      'Forgetting `{0: 1}` in the hash map (fails on valid subarrays starting from index 0)',
      'Updating the hash map BEFORE checking `curr_sum - k` (can cause self-match when k = 0)',
      'Mistakenly using Sliding Window when numbers can be negative (Sliding Window requires monotonic sums)',
    ],
  },

  'fast-slow-pointers': {
    summary: 'Advance two pointers at different speeds (usually 1 step and 2 steps) to detect cycles or locate the middle node in O(N) time and O(1) space.',
    triggers: [
      'Detect cycle in a Linked List',
      'Find the exact start / entry node of a cycle',
      'Find middle node of a Linked List in a single pass',
      'Find duplicate number in array without modifying it (Floyd cycle)',
      'Happy Number (detect repeating loop in sum of squared digits)',
    ],
    whenNotToUse: 'Need random access or already have O(N) auxiliary space permitted to use a Hash Set.',
    mentalModel: 'In a cycle of length C, each iteration closes the gap between fast and slow by 1. Fast catches slow in <= C steps. Distance from head to cycle entry equals distance from collision point to cycle entry.',
    steps: [
      'Initialize `slow = head`, `fast = head`.',
      'Advance `slow = slow.next` and `fast = fast.next.next` inside `while fast and fast.next`.',
      'If `slow == fast`, a cycle is detected.',
      'To find cycle start: reset `slow = head`. Move both `slow` and `fast` 1 step at a time until they meet. The meeting node is the cycle entry.',
      'For middle node: when fast reaches the end, slow is at the middle.',
    ],
    templateName: "Floyd's Cycle Detection & Entry Finder",
    template: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def detect_cycle_entry(head: ListNode | None) -> ListNode | None:
    slow = fast = head
    
    # Phase 1: Determine if a cycle exists
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            break
    else:
        return None  # Reached end of list -> No cycle
        
    # Phase 2: Find cycle entry node
    slow = head
    while slow != fast:
        slow = slow.next
        fast = fast.next
        
    return slow  # Both pointers meet at cycle entrance`,
    canonicalProblems: [
      { id: '141', name: 'Linked List Cycle', why: 'Verify if fast pointer collides with slow pointer' },
      { id: '142', name: 'Linked List Cycle II', why: 'Reset slow to head to find exact entry node' },
      { id: '876', name: 'Middle of the Linked List', why: 'When fast hits the end, slow is at the midpoint' },
      { id: '287', name: 'Find the Duplicate Number', why: 'Treat array indices as pointers and find cycle entrance' },
    ],
    complexity: {
      time: 'O(n) linear scan',
      space: 'O(1) strictly constant space',
      note: 'Guarantees O(1) space where a visited hash set would take O(n).',
    },
    pitfalls: [
      'Dereferencing `fast.next.next` without checking both `fast` and `fast.next` (causes AttributeError)',
      'Even-length lists: slow stops at the second middle node if starting both at head',
      'Assuming an array has no cycle without checking bounds when modeling indices as pointers',
    ],
  },

  'linked-list-manipulation': {
    summary: 'Rearrange nodes and pointers in-place by maintaining dummy heads, tracking previous/current/next pointers, and preserving detached segments.',
    triggers: [
      'Reverse linked list / reverse nodes in K-groups',
      'Merge two or K sorted linked lists',
      'Remove N-th node from end of list',
      'Reorder list (interleave first half with reversed second half)',
      'Partition list around value X',
    ],
    whenNotToUse: 'Random indexed access is required or node count is static and O(N) space is acceptable (convert to list).',
    mentalModel: 'Pointer Surgery: Always save `temp = curr.next` before overwriting `curr.next`. Use a `dummy` node (`dummy.next = head`) to eliminate edge-case conditionals when mutating the head.',
    steps: [
      'Create `dummy = ListNode(0, head)` and set `prev = None`, `curr = head`.',
      'Before modifying any link: save `next_node = curr.next`.',
      'Reverse or rewire pointer: `curr.next = prev`.',
      'Advance pointers: `prev = curr; curr = next_node`.',
      'Return `dummy.next` or `prev` depending on whether head was replaced.',
    ],
    templateName: 'Iterative In-Place Linked List Reversal',
    template: `def reverse_linked_list(head: ListNode | None) -> ListNode | None:
    prev = None
    curr = head
    
    while curr:
        next_temp = curr.next  # 1. Save next reference before breaking link
        curr.next = prev       # 2. Reverse direction of pointer
        prev = curr            # 3. Advance prev forward
        curr = next_temp       # 4. Advance curr forward
        
    return prev  # New head of reversed list`,
    canonicalProblems: [
      { id: '206', name: 'Reverse Linked List', why: 'Foundational 3-pointer reversal' },
      { id: '21', name: 'Merge Two Sorted Lists', why: 'Dummy head + compare node values to splice' },
      { id: '143', name: 'Reorder List', why: 'Find middle + reverse second half + interleave' },
      { id: '25', name: 'Reverse Nodes in k-Group', why: 'Count k nodes, reverse segment, reconnect recursively' },
    ],
    complexity: {
      time: 'O(n) single pass',
      space: 'O(1) in-place pointer updates',
      note: 'Zero node allocations; all modifications are in-place.',
    },
    pitfalls: [
      'Overwriting `curr.next` before caching the old next reference',
      'Creating circular loops by forgetting to terminate `tail.next = None`',
      'Failing on empty list (`head = None`) or single-node lists',
    ],
  },

  'monotonic-stack': {
    summary: 'Maintain a stack with strictly increasing or decreasing elements to find the Nearest Greater or Smaller Element for all elements in O(N) total time.',
    triggers: [
      'Find next greater / next smaller element for each position',
      'Previous greater element / stock span problems',
      'Largest rectangle in histogram',
      'Daily temperatures (number of days until a warmer day)',
      'Trapping rain water (horizontal bounded bars)',
    ],
    whenNotToUse: 'Need arbitrary lookups across non-monotonic boundaries or dynamic insertions with k-th queries (use Heap or BST).',
    mentalModel: 'Every element is pushed once and popped at most once. Pushing an element pops all elements that violate monotonicity, meaning the incoming element IS their Next Greater/Smaller answer!',
    steps: [
      'Initialize `stack = []` (store indices to compute distances) and `res = [-1] * n`.',
      'Iterate `i` from 0 to n - 1 with current value `x = nums[i]`.',
      'While stack is non-empty and `nums[stack[-1]] < x` (for next greater): pop `idx = stack.pop()`, record `res[idx] = x`.',
      'Push current index `i` onto stack.',
      'Elements left in stack have no next greater element (remain -1).',
    ],
    templateName: 'Next Greater Element (Monotonic Decreasing Stack)',
    template: `def next_greater_elements(nums: list[int]) -> list[int]:
    n = len(nums)
    res = [-1] * n
    stack = []  # Stores indices of unresolved elements
    
    for i in range(n):
        # Pop all elements smaller than current element nums[i]
        while stack and nums[i] > nums[stack[-1]]:
            popped_idx = stack.pop()
            res[popped_idx] = nums[i]  # nums[i] is the next greater element!
            
        stack.append(i)
        
    return res`,
    canonicalProblems: [
      { id: '739', name: 'Daily Temperatures', why: 'Monotonic decreasing stack tracks days until warmer temperature' },
      { id: '84', name: 'Largest Rectangle in Histogram', why: 'Monotonic increasing stack finds left/right smaller boundaries' },
      { id: '42', name: 'Trapping Rain Water', why: 'Stack stores decreasing valley bars until bounded by higher right wall' },
      { id: '907', name: 'Sum of Subarray Minimums', why: 'Find left and right strictly smaller elements for each value' },
    ],
    complexity: {
      time: 'O(n) amortized (each index pushed and popped at most once)',
      space: 'O(n) for stack and result array',
      note: 'Avoids O(n^2) nested search for adjacent extremes.',
    },
    pitfalls: [
      'Storing values instead of indices (indices allow both value lookup and distance calculation)',
      'Confusion over `<` vs `<=` (decide whether equal values should pop or remain based on problem statement)',
      'Circular arrays: forget to iterate `2 * n` with index `i % n`',
    ],
  },

  'heaps-top-k': {
    summary: 'Dynamically maintain the K extreme elements using a binary heap, turning an O(N log N) full sort into O(N log K) time.',
    triggers: [
      'Find K-th largest or K-th smallest element in array or stream',
      'Top K frequent elements or most frequent words',
      'Merge K sorted linked lists / arrays',
      'Find median from data stream (dual heap: max-heap + min-heap)',
      'Task scheduler / meeting rooms',
    ],
    whenNotToUse: 'K is very close to N (quickselect or full sort is faster and simpler), or random indexed lookups are needed.',
    mentalModel: 'The Heap Inversion Principle: To maintain the top K LARGEST elements, use a MIN-heap of size K! The heap root holds the smallest of the top K; if a new element is larger than root, pop root and push new.',
    steps: [
      'To find top K largest: maintain `min_heap = []` (in Python `heapq` is a min-heap by default).',
      'Iterate through elements or frequency counts.',
      'Push onto heap: `heapq.heappush(heap, item)`.',
      'If `len(heap) > k`: pop smallest element: `heapq.heappop(heap)`.',
      'Heap now holds the K largest elements; root `heap[0]` is the K-th largest.',
    ],
    templateName: 'Top K Frequent Elements (Min-Heap of size K)',
    template: `import heapq
from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    freq_map = Counter(nums)
    # Min-heap stores tuples: (frequency, number)
    min_heap = []
    
    for num, count in freq_map.items():
        heapq.heappush(min_heap, (count, num))
        # Keep heap size <= k so root is always the smallest among top k
        if len(min_heap) > k:
            heapq.heappop(min_heap)
            
    return [num for count, num in min_heap]`,
    canonicalProblems: [
      { id: '215', name: 'Kth Largest Element in an Array', why: 'Min-heap of size K yields answer at root heap[0]' },
      { id: '347', name: 'Top K Frequent Elements', why: 'Heap sorted by frequency maintains top K elements' },
      { id: '295', name: 'Find Median from Data Stream', why: 'Balance max-heap (lower half) and min-heap (upper half)' },
      { id: '23', name: 'Merge k Sorted Lists', why: 'Min-heap of size K holds head of each list for O(N log K) merge' },
    ],
    complexity: {
      time: 'O(n log k) vs O(n log n) full sort',
      space: 'O(k) auxiliary memory',
      note: 'Significant speedup when k << n (e.g. k=10, n=1,000,000).',
    },
    pitfalls: [
      'Using a max-heap for top K largest (requires pushing all N elements taking O(N log N) space and time)',
      "Python's `heapq` is MIN-heap only; negate numbers `(-val)` to emulate max-heap behavior",
      'Tuple comparison tie-breakers: if frequencies match, Python compares the next tuple element (ensure elements are comparable)',
    ],
  },

  trie: {
    summary: 'Tree structure where paths from root represent string prefixes, allowing prefix searches, autocomplete, and dictionary lookups in O(L) time proportional to word length.',
    triggers: [
      'Prefix search / implement startsWith(prefix)',
      'Word search board with dictionary / Boggle game',
      'Autocomplete / search suggestions / spell checker',
      'Replace words with shortest root',
      'Maximum XOR pair in an array (Binary Bitwise Trie)',
    ],
    whenNotToUse: 'Exact lookups only with no prefix queries (standard Hash Set has less memory overhead and O(1) expected time).',
    mentalModel: 'Each node represents a character transition. A node contains children `char -> TrieNode` and a boolean flag `is_end = True` indicating if a complete word terminates at that node.',
    steps: [
      'Define `TrieNode` with `children = {}` and `is_end = False`.',
      'Insert: walk character by character. If character not in `curr.children`, create new node. Mark last node `is_end = True`.',
      'Search: walk characters. If any character missing, return False. If all found, return `curr.is_end`.',
      'StartsWith: walk characters. If any missing, return False. If found, return True regardless of `is_end`.',
    ],
    templateName: 'Prefix Tree (Trie) Implementation',
    template: `class TrieNode:
    def __init__(self):
        self.children: dict[str, TrieNode] = {}
        self.is_end: bool = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root
        for char in word:
            if char not in curr.children:
                curr.children[char] = TrieNode()
            curr = curr.children[char]
        curr.is_end = True

    def search(self, word: str) -> bool:
        node = self._traverse(word)
        return node is not None and node.is_end

    def starts_with(self, prefix: str) -> bool:
        return self._traverse(prefix) is not None

    def _traverse(self, prefix: str) -> TrieNode | None:
        curr = self.root
        for char in prefix:
            if char not in curr.children:
                return None
            curr = curr.children[char]
        return curr`,
    canonicalProblems: [
      { id: '208', name: 'Implement Trie (Prefix Tree)', why: 'Foundational insert, search, and startsWith operations' },
      { id: '211', name: 'Design Add and Search Words Data Structure', why: 'DFS on Trie branches to handle "." wildcard queries' },
      { id: '212', name: 'Word Search II', why: 'Traverse 2D matrix with Trie to prune invalid prefixes immediately' },
      { id: '421', name: 'Maximum XOR of Two Numbers in an Array', why: 'Bitwise 0/1 Trie picks opposite bits greedily' },
    ],
    complexity: {
      time: 'O(L) per insert/search where L is word length',
      space: 'O(total characters * alphabet size)',
      note: 'Lookup speed is completely independent of the number of words stored in the Trie.',
    },
    pitfalls: [
      'Confusing `search` (requires `node.is_end == True`) with `starts_with` (only requires node exists)',
      'Memory explosion: in Python, using `dict` children is more memory-efficient than `[None] * 26`',
      'Word Search II TLE: forget to remove found words from Trie or mark already visited grid cells',
    ],
  },

  'union-find': {
    summary: 'Disjoint Set Union (DSU) tracks partitions and connectivity of elements, merging groups and querying whether two elements share a component in near-constant O(α(N)) time.',
    triggers: [
      'Connected components in an undirected network',
      'Redundant connection / cycle detection in undirected graph',
      'Number of provinces / islands / friend circles',
      'Graph valid tree (exactly n - 1 edges and 1 connected component)',
      "Minimum Spanning Tree (Kruskal's algorithm)",
    ],
    whenNotToUse: 'Directed graphs (DSU cannot handle edge directions; use Topological Sort or Tarjan / Kosaraju).',
    mentalModel: 'Maintain representative parent pointers. With Path Compression (`parent[x] = find(parent[x])`) and Union by Rank, tree depth remains <= 4 for all practical universe scales (inverse Ackermann α(N)).',
    steps: [
      'Initialize `parent = list(range(n))` and `rank = [1] * n`.',
      'Implement `find(x)`: recursively find root while flattening tree (`parent[x] = find(parent[x])`).',
      'Implement `union(x, y)`: find roots `rx = find(x)`, `ry = find(y)`. If equal, they already connect (cycle detected!).',
      'If unequal, attach smaller rank root under larger rank root, and decrement component count.',
      'Return True if merged, False if already connected.',
    ],
    templateName: 'Disjoint Set Union (DSU) with Path Compression & Rank',
    template: `class UnionFind:
    def __init__(self, size: int):
        self.parent = list(range(size))
        self.rank = [1] * size
        self.components = size

    def find(self, x: int) -> int:
        if self.parent[x] != x:
            # Path compression: flatten path directly to root
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        root_x, root_y = self.find(x), self.find(y)
        if root_x == root_y:
            return False  # Already in same set (cycle detected!)
            
        # Union by rank: attach smaller tree under larger tree
        if self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        elif self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
            
        self.components -= 1
        return True`,
    canonicalProblems: [
      { id: '547', name: 'Number of Provinces', why: 'Union cities with direct flights; return final component count' },
      { id: '684', name: 'Redundant Connection', why: 'First edge where union returns False creates the cycle' },
      { id: '261', name: 'Graph Valid Tree', why: 'Must have exactly n - 1 edges and 1 connected component' },
      { id: '128', name: 'Longest Consecutive Sequence', why: 'Union adjacent numbers x and x+1' },
    ],
    complexity: {
      time: 'O(α(N)) ≈ O(1) amortized per operation',
      space: 'O(N) for parent and rank arrays',
      note: 'Inverse Ackermann α(N) never exceeds 4 for any practical input size.',
    },
    pitfalls: [
      'Comparing raw node IDs instead of representative roots (`x == y` instead of `find(x) == find(y)`)',
      'Omitting path compression: operations degenerate to O(N) linear chains without it',
      'Using DSU on directed graphs where edge orientation matters',
    ],
  },

  intervals: {
    summary: 'Sort ranges by start (or end) time so overlapping relationships can be resolved linearly by comparing adjacent pairs.',
    triggers: [
      'Merge overlapping intervals',
      'Insert interval into sorted non-overlapping list',
      'Non-overlapping intervals (erase minimum overlaps)',
      'Meeting rooms (minimum conference rooms needed / can attend all)',
    ],
    whenNotToUse: 'Intervals cannot be sorted or endpoints are infinite/continuous without discrete ordering.',
    mentalModel: 'Once sorted by start time (`start_i <= start_j`), interval J overlaps with interval I if and only if `start_j <= end_i`. When overlapping, merged end is `max(end_i, end_j)`.',
    steps: [
      'Sort intervals by start time: `intervals.sort(key=lambda x: x[0])`.',
      'Initialize `merged = [intervals[0]]`.',
      'Iterate through subsequent intervals `[curr_start, curr_end]`.',
      'If `curr_start <= merged[-1][1]`: overlap exists! Update `merged[-1][1] = max(merged[-1][1], curr_end)`.',
      'Else: no overlap. Append `[curr_start, curr_end]` to `merged`.',
      'Return `merged`.',
    ],
    templateName: 'Merge Overlapping Intervals',
    template: `def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
        
    # Sort primarily by start time
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    
    for start, end in intervals[1:]:
        last_end = merged[-1][1]
        
        if start <= last_end:
            # Overlapping intervals: merge by taking the max end
            merged[-1][1] = max(last_end, end)
        else:
            # Non-overlapping: append as separate interval
            merged.append([start, end])
            
    return merged`,
    canonicalProblems: [
      { id: '56', name: 'Merge Intervals', why: 'Standard sort by start time and extend ends' },
      { id: '57', name: 'Insert Interval', why: 'Add before overlap, merge during overlap, append after overlap' },
      { id: '435', name: 'Non-overlapping Intervals', why: 'Greedy: sort by end time to keep intervals that finish earliest' },
      { id: '253', name: 'Meeting Rooms II', why: 'Min-heap of end times tracks currently occupied rooms' },
    ],
    complexity: {
      time: 'O(n log n) dominated by initial sort',
      space: 'O(n) for output list',
      note: 'Linear O(n) pass after the O(n log n) sort.',
    },
    pitfalls: [
      'Touching endpoints edge case: verify if `[1, 2]` and `[2, 3]` overlap (`start <= last_end` vs `start < last_end`)',
      'Forgetting `max(last_end, end)`: the previous interval might already be longer than current',
      'Meeting Rooms II: sorting only by start time without tracking end times with a heap',
    ],
  },

  greedy: {
    summary: 'Make the locally optimal choice at each decision step with the mathematical guarantee that it leads to the globally optimal solution without backtracking.',
    triggers: [
      'Maximize profit / minimize cost with independent sequential choices',
      'Jump game (maximum reachable index)',
      'Gas station circuit / circular route',
      'Task scheduler / candy distribution',
      'Minimum arrows to burst balloons',
    ],
    whenNotToUse: 'Local decisions constrain future options in conflicting ways (e.g. 0/1 Knapsack, Coin Change with arbitrary denominations; must use DP!).',
    mentalModel: 'Greedy Choice Property: Can you prove by exchange argument that swapping a greedy decision with any alternative never produces a superior outcome? If yes, greedy holds.',
    steps: [
      'Identify the greedy metric (e.g. earliest finish time, farthest reach, max profit step).',
      'Sort inputs if necessary to enforce the greedy ordering.',
      'Maintain a single state variable (e.g., `farthest_reach = 0`, `current_gas = 0`).',
      'Iterate through elements and update state irreversibly.',
      'Return final accumulated score or boolean feasibility.',
    ],
    templateName: 'Farthest Reach Greedy (Jump Game)',
    template: `def can_jump(nums: list[int]) -> bool:
    farthest = 0
    
    for i, jump in enumerate(nums):
        # If current index is beyond the farthest reach, we cannot proceed
        if i > farthest:
            return False
        # Update maximum index we can reach
        farthest = max(farthest, i + jump)
        if farthest >= len(nums) - 1:
            return True
            
    return True`,
    canonicalProblems: [
      { id: '55', name: 'Jump Game', why: 'Greedily extend farthest reachable milestone' },
      { id: '45', name: 'Jump Game II', why: 'Count jumps whenever current step boundary is reached' },
      { id: '134', name: 'Gas Station', why: 'If total gas >= total cost, start right after the worst deficit point' },
      { id: '621', name: 'Task Scheduler', why: 'Most frequent task forms idle slot framework' },
    ],
    complexity: {
      time: 'O(n) single pass or O(n log n) with sorting',
      space: 'O(1) auxiliary space',
      note: 'Extremely memory efficient when greedy choice property holds.',
    },
    pitfalls: [
      'Assuming greedy works without proof (e.g. Coin Change fails for denominations [1, 3, 4] with target 6)',
      'Premature optimization: always verify if dynamic programming is required before committing to greedy',
      'Failing to check if starting point is unreachable in Jump Game',
    ],
  },

  backtracking: {
    summary: 'Explore all combinatorial possibilities through depth-first recursion, systematically making a choice, exploring its consequences, and pruning or undoing the choice (backtracking).',
    triggers: [
      'Generate all permutations, combinations, or subsets',
      'Find all valid configurations (N-Queens, Sudoku)',
      'Word search in a 2D grid',
      'Generate parentheses',
      'Partition array into equal sum subsets',
    ],
    whenNotToUse: 'Only the optimal value (count, min, max) is needed, not the actual paths/subsets (usually DP instead of backtracking!).',
    mentalModel: 'DFS on a Decision Tree: at each node: 1) Check base case; 2) Iterate over choices; 3) Prune invalid choices early; 4) Make choice; 5) Recurse; 6) Undo choice (restore state).',
    steps: [
      'Define `backtrack(start_idx, current_path)`.',
      'Base case: if `current_path` meets length or target, add a deep copy `ans.append(list(current_path))` and return.',
      'Loop through candidate elements from `start_idx` to `n`.',
      'Pruning: skip if candidate exceeds remaining budget or is duplicate: `if i > start_idx and nums[i] == nums[i-1]: continue`.',
      'Choose: `current_path.append(nums[i])`.',
      'Recurse: `backtrack(i + 1, current_path)`.',
      'Unchoose: `current_path.pop()`.',
    ],
    templateName: 'Combinations / Subsets with Pruning',
    template: `def subsets_with_dup(nums: list[int]) -> list[list[int]]:
    nums.sort()  # Sorting is mandatory to group duplicates for pruning
    result = []
    
    def backtrack(start: int, path: list[int]) -> None:
        # Every node in the decision tree is a valid subset
        result.append(list(path))  # Important: copy current path!
        
        for i in range(start, len(nums)):
            # Prune duplicate branches at the same tree level
            if i > start and nums[i] == nums[i - 1]:
                continue
                
            path.append(nums[i])        # Make choice
            backtrack(i + 1, path)      # Explore choice (i + 1 prevents reuse)
            path.pop()                  # Undo choice (backtrack)
            
    backtrack(0, [])
    return result`,
    canonicalProblems: [
      { id: '78', name: 'Subsets', why: 'Explore 2^n include/exclude decision tree' },
      { id: '46', name: 'Permutations', why: 'Explore all n! orderings using visited set' },
      { id: '39', name: 'Combination Sum', why: 'Allow reuse of same element with target reduction' },
      { id: '51', name: 'N-Queens', why: 'Prune attacks along cols, positive diagonals, negative diagonals' },
    ],
    complexity: {
      time: 'O(2^n) subsets, O(n!) permutations',
      space: 'O(n) recursion call stack depth',
      note: 'Pruning invalid branches early is crucial for passing time limits.',
    },
    pitfalls: [
      'Appending `path` instead of `path.copy()` or `list(path)` (results in empty arrays after unchoose pops)',
      'Forgetting to sort before skipping duplicates (`nums[i] == nums[i-1]`)',
      'Incorrect recursion index: `backtrack(start + 1)` instead of `backtrack(i + 1)` in recursive call',
    ],
  },

  'dynamic-programming-1d': {
    summary: 'Break a sequential decision problem into overlapping subproblems governed by a recurrence relation dp[i] = f(dp[i-1], dp[i-2], ...), caching intermediate states to avoid exponential recomputation.',
    triggers: [
      'Number of ways to reach step N / amount',
      'Maximum profit without taking adjacent items (House Robber)',
      'Minimum cost / coins to form total amount',
      'Longest increasing subsequence',
      'Word break / decode ways',
    ],
    whenNotToUse: 'Decisions have circular dependencies or no optimal substructure (e.g. past decisions invalidate state without being captured in state index).',
    mentalModel: 'State definition must capture all information needed for future transitions. E.g., `dp[i]` = best answer considering elements up to `i`. Once `dp[i]` is computed, prior steps never need re-evaluation.',
    steps: [
      'Define state in plain words: what does `dp[i]` store?',
      'Identify recurrence relation: how does `dp[i]` depend on `dp[i-1]`, `dp[i-2]`, etc.?',
      'Identify base cases: `dp[0] = 0`, `dp[1] = ...`.',
      'Determine computation order: iterate bottom-up from 1 to N.',
      'Space optimization: if `dp[i]` only relies on the last K states, replace array with K variables for O(1) space.',
    ],
    templateName: '1D DP Tabulation & Space Optimization (House Robber)',
    template: `def rob(nums: list[int]) -> int:
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
        
    # State: dp[i] = max money robbing from house 0..i
    # Transition: dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    # Space optimized: only need previous two values
    prev2 = nums[0]
    prev1 = max(nums[0], nums[1])
    
    for i in range(2, len(nums)):
        curr = max(prev1, prev2 + nums[i])
        prev2 = prev1
        prev1 = curr
        
    return prev1`,
    canonicalProblems: [
      { id: '70', name: 'Climbing Stairs', why: 'Fibonacci recurrence: dp[i] = dp[i-1] + dp[i-2]' },
      { id: '198', name: 'House Robber', why: 'Pick or skip adjacent: max(skip, take + prev2)' },
      { id: '322', name: 'Coin Change', why: 'Unbounded knapsack: min(dp[a - coin] + 1)' },
      { id: '300', name: 'Longest Increasing Subsequence', why: 'dp[i] = 1 + max(dp[j]) for all j < i where nums[j] < nums[i]' },
    ],
    complexity: {
      time: 'O(n) [or O(n * amount)]',
      space: 'O(n) array, reducible to O(1) with rolling variables',
      note: 'Reduces exponential 2^n recursion to linear O(n).',
    },
    pitfalls: [
      'Array indexing off-by-one (e.g. allocating `dp` of size `n` instead of `n + 1` for 1-indexed amounts)',
      'Initializing with 0 instead of `infinity` for minimization problems (e.g. Coin Change)',
      'Premature space optimization before verifying the recurrence on edge cases',
    ],
  },

  'dynamic-programming-2d': {
    summary: 'Solve problems with two independent dimensions (e.g. two strings, grid cells, or items vs capacity) by filling an M × N table where dp[i][j] transitions from adjacent predecessors.',
    triggers: [
      'Compare two strings: Longest Common Subsequence, Edit Distance',
      'Grid path counting / minimum path sum',
      '0/1 Knapsack problem (subset sum with capacity)',
      'Distinct subsequences / interleaved strings',
      'Palindromic substrings / longest palindromic subsequence',
    ],
    whenNotToUse: 'Greedy works (e.g. Fractional Knapsack), or dimensions are sparse with massive bounds (use memoized recursion).',
    mentalModel: 'Table grid invariant: Every cell `dp[i][j]` is derived from `dp[i-1][j]` (delete/skip first), `dp[i][j-1]` (insert/skip second), or `dp[i-1][j-1]` (match/replace both). Base row `i=0` and col `j=0` define boundary conditions.',
    steps: [
      'Define `dp[i][j]`: e.g. LCS length of `text1[0..i-1]` and `text2[0..j-1]`.',
      'Create table: `dp = [[0] * (n + 1) for _ in range(m + 1)]`.',
      'Initialize base cases (row 0 and column 0).',
      'Fill row by row: if characters match `text1[i-1] == text2[j-1]`, take diagonal `dp[i-1][j-1] + 1`; else take `max(dp[i-1][j], dp[i][j-1])`.',
      'Return bottom-right cell `dp[m][n]`.',
    ],
    templateName: '2D DP on Two Strings (Longest Common Subsequence)',
    template: `def longest_common_subsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    # dp[i][j] = LCS length between text1[:i] and text2[:j]
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                # Characters match: extend diagonal subsequence
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                # Discard either char from text1 or text2
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
                
    return dp[m][n]`,
    canonicalProblems: [
      { id: '1143', name: 'Longest Common Subsequence', why: 'Archetypal string comparison 2D table' },
      { id: '72', name: 'Edit Distance', why: 'Operations match insert (i, j-1), delete (i-1, j), replace (i-1, j-1)' },
      { id: '62', name: 'Unique Paths', why: 'Grid path sum: dp[r][c] = dp[r-1][c] + dp[r][c-1]' },
      { id: '516', name: 'Longest Palindromic Subsequence', why: 'LCS between string and its reverse, or interval 2D DP' },
    ],
    complexity: {
      time: 'O(m * n) quadratic cell visits',
      space: 'O(m * n) table, reducible to O(min(m, n)) rolling row',
      note: 'Can compress to 1D rolling array if only previous row is needed.',
    },
    pitfalls: [
      'Python list multiplication bug: \`[[0] * n] * m\` makes shallow copies of rows! Always use comprehension \`[[0] * n for _ in range(m)]\`',
      'Mismatch between 1-based DP table indices `i, j` and 0-based string characters `s[i-1]`',
      'Rolling array for Knapsack requires iterating capacity backwards to prevent reusing the same item',
    ],
  },

  'graph-traversal': {
    summary: 'Explore vertices and edges in arbitrary networks using BFS (for unweighted shortest paths) or DFS (for connectivity, cycle detection, and component exploration).',
    triggers: [
      'Shortest path / minimum transformations in unweighted graph',
      'Clone graph / serialize network',
      'Connected components / bipartite graph check',
      'Word ladder (transform word A to B)',
      'Detect cycle in directed or undirected graph',
    ],
    whenNotToUse: 'Weighted graph with varying edge costs (use Dijkstra for non-negative weights, Bellman-Ford for negative weights).',
    mentalModel: 'Visited Set Invariant: A node must be marked visited AT THE MOMENT IT IS ENQUEUED (for BFS) or entered (for DFS). Marking on pop causes the same node to be enqueued multiple times exponentially.',
    steps: [
      'Construct adjacency list: `graph = collections.defaultdict(list)`.',
      'Choose traversal: BFS (`deque`) for shortest path; DFS (recursion) for exploration/cycles.',
      'Initialize `visited = set([start_node])` and `queue = deque([(start_node, 0)])`.',
      'While queue is not empty: pop `curr, dist`.',
      'If `curr == target`, return `dist`.',
      'For each `neighbor in graph[curr]`: if `neighbor not in visited`, mark `visited.add(neighbor)` and `queue.append((neighbor, dist + 1))`.',
    ],
    templateName: 'BFS Shortest Path (Unweighted Graph)',
    template: `from collections import deque, defaultdict

def bfs_shortest_path(edges: list[list[int]], start: int, target: int) -> int:
    # 1. Build adjacency list
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
        
    # 2. Queue stores (current_node, distance)
    queue = deque([(start, 0)])
    visited = {start}  # ALWAYS mark visited at enqueue time
    
    while queue:
        curr, dist = queue.popleft()
        if curr == target:
            return dist
            
        for neighbor in graph[curr]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist + 1))
                
    return -1  # Target unreachable`,
    canonicalProblems: [
      { id: '127', name: 'Word Ladder', why: 'BFS finds shortest sequence of 1-letter word mutations' },
      { id: '133', name: 'Clone Graph', why: 'DFS/BFS with hash map mapping original node to cloned copy' },
      { id: '785', name: 'Is Graph Bipartite?', why: '2-color BFS/DFS to verify no adjacent nodes share same color' },
      { id: '200', name: 'Number of Islands', why: 'Graph traversal over grid adjacency' },
    ],
    complexity: {
      time: 'O(V + E) visits every vertex and edge once',
      space: 'O(V) for queue and visited set',
      note: 'Linear in graph size for adjacency list representation.',
    },
    pitfalls: [
      'Marking visited on pop instead of enqueue: causes catastrophic duplicate queue insertions and TLE',
      'Directed vs undirected: adding bidirectional edges when edges are strictly directed',
      'Not handling disconnected graph components (need a wrapper loop over all nodes `0..V-1`)',
    ],
  },

  'topological-sort': {
    summary: "Linearly order vertices in a Directed Acyclic Graph (DAG) such that for every directed edge u -> v, vertex u comes before v (Kahn's algorithm using indegree BFS).",
    triggers: [
      'Task prerequisite scheduling / course schedule',
      'Compilation dependency order',
      'Build system build sequence',
      'Detect cycle in directed graph',
      'Alien dictionary (derive alphabet ordering)',
    ],
    whenNotToUse: 'Undirected graphs (use standard BFS/DFS or DSU) or graphs known to contain self-loops/cycles where no order can exist.',
    mentalModel: "Kahn's Algorithm: Any node with `indegree == 0` has no remaining prerequisites and can be processed immediately. When processed, decrement indegrees of all outgoing neighbors; new 0-indegree nodes become eligible.",
    steps: [
      'Build adjacency list `graph` and calculate `indegree` array/map for all nodes.',
      'Enqueue all nodes with `indegree == 0` into a `queue`.',
      'Initialize `order = []`.',
      'While queue: pop `curr`, append to `order`. For each neighbor `nxt` of `curr`, decrement `indegree[nxt] -= 1`.',
      'If `indegree[nxt] == 0`, enqueue `nxt`.',
      'Cycle check: if `len(order) == num_nodes`, a valid topological order exists; otherwise, a directed cycle was present!',
    ],
    templateName: "Kahn's Algorithm (BFS Indegree Topological Sort)",
    template: `from collections import deque, defaultdict

def topological_sort(num_courses: int, prerequisites: list[list[int]]) -> list[int]:
    graph = defaultdict(list)
    indegrees = [0] * num_courses
    
    # Prerequisite [a, b] means: must take b before a (edge: b -> a)
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        indegrees[course] += 1
        
    # Start with all nodes having zero prerequisites
    queue = deque([i for i in range(num_courses) if indegrees[i] == 0])
    order = []
    
    while queue:
        curr = queue.popleft()
        order.append(curr)
        
        for next_course in graph[curr]:
            indegrees[next_course] -= 1
            if indegrees[next_course] == 0:
                queue.append(next_course)
                
    # If order doesn't include all courses, a cycle exists
    return order if len(order) == num_courses else []`,
    canonicalProblems: [
      { id: '207', name: 'Course Schedule', why: 'Detect if prerequisites form a cycle (len(order) == n)' },
      { id: '210', name: 'Course Schedule II', why: 'Return the actual linear order of courses' },
      { id: '269', name: 'Alien Dictionary', why: 'Derive character edge directions from adjacent words and sort' },
      { id: '310', name: 'Minimum Height Trees', why: 'Repeatedly trim leaves (degree 1) inward toward the center' },
    ],
    complexity: {
      time: 'O(V + E) linear scan of nodes and dependency edges',
      space: 'O(V + E) graph + queue',
      note: 'Optimal linear time dependency resolution.',
    },
    pitfalls: [
      'Reversing edge directions (e.g. `[a, b]` direction is `b -> a`, not `a -> b`)',
      'Failing to detect cycles by assuming all nodes are processed',
      'Disconnected nodes: ensure all vertices `0..n-1` are registered in the indegree table',
    ],
  },

  'tree-dfs': {
    summary: 'Traverse binary or general trees by recurring deep along branches, computing subtree metrics bottom-up (postorder) or passing state top-down (preorder).',
    triggers: [
      'Maximum / minimum depth of binary tree',
      'Invert / clone binary tree',
      'Diameter of binary tree',
      'Lowest common ancestor (LCA)',
      'Path sum / maximum path sum across branches',
      'Check balanced binary tree',
    ],
    whenNotToUse: 'Level-by-level processing or shortest path in terms of edge counts (Tree BFS is cleaner).',
    mentalModel: 'Recursive Trust: Assume `dfs(node.left)` and `dfs(node.right)` return the correct subtree answers. Combine them at `node` with the base case (`if not node: return base_val`).',
    steps: [
      'Handle base case: `if not node: return 0` (or `None`, `True`).',
      'Recursively solve left subtree: `left = dfs(node.left)`.',
      'Recursively solve right subtree: `right = dfs(node.right)`.',
      'Combine results at parent: e.g., update global variable `self.max_diameter = max(self.max_diameter, left + right)`.',
      'Return single-branch contribution upward: `return 1 + max(left, right)`.',
    ],
    templateName: 'Bottom-Up Postorder Tree DFS (Diameter / Path Metric)',
    template: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def diameter_of_binary_tree(root: TreeNode | None) -> int:
    max_diameter = 0
    
    def dfs(node: TreeNode | None) -> int:
        nonlocal max_diameter
        if not node:
            return 0  # Height of empty subtree
            
        # Postorder: solve children first
        left_height = dfs(node.left)
        right_height = dfs(node.right)
        
        # Invariant: longest path through current node spans both subtrees
        max_diameter = max(max_diameter, left_height + right_height)
        
        # Return single branch height upward to parent
        return 1 + max(left_height, right_height)
        
    dfs(root)
    return max_diameter`,
    canonicalProblems: [
      { id: '104', name: 'Maximum Depth of Binary Tree', why: '1 + max(dfs(left), dfs(right))' },
      { id: '226', name: 'Invert Binary Tree', why: 'Swap node.left and node.right recursively' },
      { id: '543', name: 'Diameter of Binary Tree', why: 'Combine left and right depths at each node' },
      { id: '236', name: 'Lowest Common Ancestor of a Binary Tree', why: 'Return node if target found in both subtrees' },
    ],
    complexity: {
      time: 'O(N) visits each node once',
      space: 'O(H) call stack where H is tree height (O(log N) balanced, O(N) worst-case skewed)',
      note: 'Avoids O(N^2) parent traversals.',
    },
    pitfalls: [
      'Mixing up what is returned upward vs what updates the global answer (e.g. returning both branches to parent)',
      'Recursion limit exceeded on deeply skewed trees (Python default limit is 1000)',
      'Forgetting to handle `node is None` as base case',
    ],
  },

  'tree-bfs': {
    summary: 'Traverse tree level by level using a FIFO queue, processing all nodes at depth D before any node at depth D+1.',
    triggers: [
      'Level order traversal / zigzag level order',
      'Binary tree right side view',
      'Populate next right pointers in each node',
      'Minimum depth of binary tree (earliest leaf found)',
    ],
    whenNotToUse: 'Path sum from root to leaf or deep ancestor queries (Tree DFS is simpler and uses less auxiliary memory).',
    mentalModel: 'Level Snapshot: At the start of each while loop iteration, `len(queue)` EXACTLY equals the number of nodes on the current level. Process that fixed count in a loop before touching the next level.',
    steps: [
      'If `not root: return []`.',
      'Initialize `queue = collections.deque([root])`.',
      'While `queue`: capture `level_size = len(queue)` and create `current_level = []`.',
      'Loop `for _ in range(level_size)`: pop `node = queue.popleft()`, append `node.val` to `current_level`.',
      'Enqueue children: `if node.left: queue.append(node.left)` and `if node.right: queue.append(node.right)`.',
      'Append `current_level` to `result`.',
    ],
    templateName: 'Level-by-Level Tree BFS (Level Order Traversal)',
    template: `from collections import deque

def level_order(root: TreeNode | None) -> list[list[int]]:
    if not root:
        return []
        
    levels = []
    queue = deque([root])
    
    while queue:
        level_size = len(queue)  # Snapshot number of nodes at this depth
        curr_level = []
        
        for _ in range(level_size):
            node = queue.popleft()
            curr_level.append(node.val)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
                
        levels.append(curr_level)
        
    return levels`,
    canonicalProblems: [
      { id: '102', name: 'Binary Tree Level Order Traversal', why: 'Standard level batching' },
      { id: '199', name: 'Binary Tree Right Side View', why: 'Last element in each level snapshot is visible from the right' },
      { id: '103', name: 'Binary Tree Zigzag Level Order Traversal', why: 'Reverse alternate level arrays or use deque' },
      { id: '111', name: 'Minimum Depth of Binary Tree', why: 'First leaf node encountered across levels guarantees minimum depth' },
    ],
    complexity: {
      time: 'O(N) visits each node once',
      space: 'O(W) where W is maximum width of tree (up to N/2 at bottom level)',
      note: 'Optimal for level-oriented questions.',
    },
    pitfalls: [
      'Using dynamic `len(queue)` directly in `while` loop condition without freezing `level_size`',
      'Forgetting to check `if not root:` before creating queue (adds `None` to queue)',
      'Using a Python list as queue with `pop(0)` (which is O(N) per pop!) instead of `deque.popleft()` (O(1))',
    ],
  },

  'binary-search-tree': {
    summary: 'Exploit the BST invariant (every left descendant < root < every right descendant) to search, insert, and validate in O(height) time without inspecting the whole tree.',
    triggers: [
      'Validate Binary Search Tree',
      'Lowest Common Ancestor in BST',
      'Kth smallest / largest element in BST',
      'Convert sorted array / list to balanced BST',
      'Delete / Insert node in BST',
    ],
    whenNotToUse: 'Tree does not follow BST ordering property or duplicates are allowed without clear convention.',
    mentalModel: 'BST Invariant: Validating a node requires verifying it against an ancestor range `(low, high)`, NOT just its immediate parent. Inorder traversal of a BST always yields strictly sorted ascending order.',
    steps: [
      'For validation: pass valid bounds `(low, high)` down the tree: `low < node.val < high`.',
      'For search/LCA: compare `p.val` and `q.val` with `curr.val`. If both smaller, go left; if both larger, go right; if they split, `curr` IS the LCA!',
      'For kth smallest: execute iterative inorder traversal using stack; the k-th popped node is the k-th smallest.',
    ],
    templateName: 'Validate BST (Range Invariant) & Inorder Traversal',
    template: `def is_valid_bst(root: TreeNode | None) -> bool:
    def validate(node: TreeNode | None, low: float, high: float) -> bool:
        if not node:
            return True
        # Node value must strictly lie within inherited ancestor bounds
        if not (low < node.val < high):
            return False
            
        # Left children must be < node.val; Right children must be > node.val
        return (validate(node.left, low, node.val) and 
                validate(node.right, node.val, high))
                
    return validate(root, float('-inf'), float('inf'))`,
    canonicalProblems: [
      { id: '98', name: 'Validate Binary Search Tree', why: 'Verify ancestor bounds (low, high) on every node' },
      { id: '235', name: 'Lowest Common Ancestor of a BST', why: 'O(H) search: split point between p and q is the LCA' },
      { id: '230', name: 'Kth Smallest Element in a BST', why: 'Inorder traversal visits nodes in sorted order; stop at k' },
      { id: '108', name: 'Convert Sorted Array to Binary Search Tree', why: 'Pick middle element as root and recurse on halves' },
    ],
    complexity: {
      time: 'O(H) where H = height (O(log N) balanced, O(N) skewed)',
      space: 'O(H) stack depth',
      note: 'Inorder traversal yields sorted order in O(N) time.',
    },
    pitfalls: [
      'Only checking immediate parent: `node.left.val < node.val` allows invalid grand-ancestors (e.g. right child of left subtree > root)',
      'Handling `<` vs `<=`: LeetCode standard BST has strictly distinct values (`low < val < high`)',
      'Forgetting that BST operations degrade to O(N) if the tree is unbalanced',
    ],
  },

  'matrix-traversal': {
    summary: 'Navigate 2D grids as implicit graphs where each cell (r, c) has up to 4 orthogonal neighbors, using direction arrays [(0,1), (0,-1), (1,0), (-1,0)] and boundary checks.',
    triggers: [
      'Number of islands / island perimeter / max area of island',
      'Flood fill / paint bucket tool',
      'Rotting oranges (multi-source BFS)',
      'Surrounded regions / capture enclosed territory',
      'Pacific Atlantic water flow',
    ],
    whenNotToUse: 'Grid has arbitrary jump teleports or diagonal movement when only orthogonal is specified.',
    mentalModel: 'Grid = Graph where V = R × C and E ≤ 4 × R × C. Use direction vectors `DIRECTIONS = [(0, 1), (0, -1), (1, 0), (-1, 0)]` to replace 4 repetitive if-statements with a single clean loop.',
    steps: [
      'Define dimensions `ROWS, COLS = len(grid), len(grid[0])`.',
      'Define directions: `DIRECTIONS = [(0, 1), (0, -1), (1, 0), (-1, 0)]`.',
      'Centralize boundary check: `0 <= r < ROWS and 0 <= c < COLS and grid[r][c] == target`.',
      'For DFS/BFS: mark visited immediately (e.g. mutate `grid[r][c] = "0"` in-place or add to `visited` set).',
      'For multi-source BFS: enqueue all starting sources (e.g. all rotten oranges) at time 0 before running queue.',
    ],
    templateName: 'Multi-Source Grid BFS (Rotting Oranges)',
    template: `from collections import deque

def oranges_rotting(grid: list[list[int]]) -> int:
    ROWS, COLS = len(grid), len(grid[0])
    queue = deque()
    fresh_count = 0
    
    # 1. Multi-source initialization: find all rotten oranges and count fresh
    for r in range(ROWS):
        for c in range(COLS):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh_count += 1
                
    if fresh_count == 0:
        return 0
        
    minutes = 0
    DIRECTIONS = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    
    # 2. BFS spreading level by level
    while queue and fresh_count > 0:
        minutes += 1
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in DIRECTIONS:
                nr, nc = r + dr, c + dc
                if 0 <= nr < ROWS and 0 <= nc < COLS and grid[nr][nc] == 1:
                    grid[nr][nc] = 2  # Infect fresh orange
                    fresh_count -= 1
                    queue.append((nr, nc))
                    
    return minutes if fresh_count == 0 else -1`,
    canonicalProblems: [
      { id: '200', name: 'Number of Islands', why: 'Iterate cells; whenever "1" found, trigger DFS to sink connected land' },
      { id: '994', name: 'Rotting Oranges', why: 'Multi-source BFS tracks time for rot to propagate across grid' },
      { id: '130', name: 'Surrounded Regions', why: 'Start DFS from boundary "O"s to preserve non-enclosed regions' },
      { id: '417', name: 'Pacific Atlantic Water Flow', why: 'Reverse flow: DFS upwards from Pacific and Atlantic borders' },
    ],
    complexity: {
      time: 'O(R * C) visits each grid cell at most a constant number of times',
      space: 'O(R * C) for queue/recursion stack in worst case',
      note: 'Can mutate grid in-place to achieve O(1) auxiliary heap space.',
    },
    pitfalls: [
      'Mixing up `ROWS` and `COLS` in boundary checks (`r < COLS` or `c < ROWS`)',
      'Mutating grid without confirming if mutation is allowed in interview problem statement',
      'In multi-source BFS: incrementing time counter even when no fresh items were converted',
    ],
  },

  'bit-manipulation': {
    summary: 'Perform bitwise operations (&, |, ^, ~, <<, >>) to check, set, toggle, or count bits in O(1) time and space without allocating memory.',
    triggers: [
      'Single number (every element appears twice except one)',
      'Number of 1 bits (Hamming weight)',
      'Counting bits from 0 to N',
      'Subsets represented as bitmasks (N <= 20)',
      'Power of two verification',
    ],
    whenNotToUse: 'Numbers exceed 64-bit integer limits and bitwise representations become complex strings, or problem requires decimal digits.',
    mentalModel: 'Essential Bit Identities: 1) `x ^ x = 0` and `x ^ 0 = x` (cancels pairs); 2) `n & (n - 1)` clears the lowest set bit (Brian Kernighan); 3) `n & -n` isolates lowest set bit; 4) `(1 << k)` creates mask for k-th bit.',
    steps: [
      'Identify if problem involves duplicate cancellation (XOR), bit counting (`n & (n - 1)`), or subset mask (`1 << n`).',
      'To clear lowest set bit: `n &= (n - 1)` in a loop until `n == 0`.',
      'To check if k-th bit is set: `(n & (1 << k)) != 0`.',
      'To toggle k-th bit: `n ^= (1 << k)`.',
      'To check power of two: `n > 0 and (n & (n - 1)) == 0`.',
    ],
    templateName: "Brian Kernighan's Bit Counting & XOR Reduction",
    template: `def single_number(nums: list[int]) -> int:
    # XOR Property: x ^ x = 0 and x ^ 0 = x
    # All duplicate pairs cancel out, leaving the unique single number
    unique = 0
    for x in nums:
        unique ^= x
    return unique

def count_set_bits(n: int) -> int:
    # Brian Kernighan's Algorithm: n & (n - 1) clears the lowest set bit
    count = 0
    while n > 0:
        n &= (n - 1)
        count += 1
    return count`,
    canonicalProblems: [
      { id: '136', name: 'Single Number', why: 'XOR all numbers to cancel duplicates in O(N) time and O(1) space' },
      { id: '191', name: 'Number of 1 Bits', why: 'Clear lowest bit with n & (n - 1) in loop' },
      { id: '231', name: 'Power of Two', why: 'n > 0 and (n & (n - 1)) == 0' },
      { id: '338', name: 'Counting Bits', why: 'DP on bits: dp[i] = dp[i >> 1] + (i & 1)' },
    ],
    complexity: {
      time: 'O(1) or O(number of set bits)',
      space: 'O(1) strictly constant memory',
      note: 'Hardware-level instructions with blazing fast execution.',
    },
    pitfalls: [
      'Operator precedence: `==` has higher precedence than `&` in Python! Always wrap `(n & (1 << i)) != 0` in parentheses',
      'Negative numbers in Python: Python uses arbitrary-precision integers, so bit shifts on negative numbers require masking with `0xFFFFFFFF`',
      'Off-by-one in bit shifts: 0-indexed vs 1-indexed bit positions',
    ],
  },
};
