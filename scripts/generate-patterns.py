import os
import json
import glob
import re

PATTERNS_CONFIG = [
    {
        "slug": "two-pointers",
        "name": "Two Pointers",
        "category": "Fundamentals",
        "icon": "ArrowLeftRight",
        "tagline": "Opposite or parallel pointers traversing sequences in linear time O(N)",
        "strategy": "Initialize two pointers (often start and end, or fast and slow) and move them towards each other or in lockstep based on comparison conditions to eliminate quadratic O(N²) nested loops.",
        "clues": [
            "Given a sorted array or list to find pairs/triplets",
            "Target sum search (e.g. 2Sum II, 3Sum)",
            "Palindrome verification or in-place reversal",
            "Trapping rain water / container boundaries"
        ],
        "topics": ["Two Pointers"],
        "keywords": [
            r"\btwo sum\b", r"\bthree sum\b", r"\b3sum\b", r"\b4sum\b",
            r"\bvalid palindrome\b", r"\bcontainer with most water\b",
            r"\btrapping rain water\b", r"\bsort colors\b", r"\bboats to save people\b",
            r"\bsquares of a sorted array\b", r"\bremove duplicates from sorted\b"
        ]
    },
    {
        "slug": "sliding-window",
        "name": "Sliding Window",
        "category": "Fundamentals",
        "icon": "SlidersHorizontal",
        "tagline": "Dynamic and fixed-size windows over contiguous subarrays or substrings",
        "strategy": "Maintain a contiguous subsegment with left and right bounds. Expand right pointer to incorporate new elements until constraint is met; shrink left pointer to find minimum or restore validity.",
        "clues": [
            "Contiguous subarray or substring problem",
            "Longest substring with at most K distinct characters",
            "Minimum size subarray sum >= target",
            "Fixed window size K running aggregation"
        ],
        "topics": ["Sliding Window"],
        "keywords": [
            r"longest substring without repeating", r"minimum window substring",
            r"sliding window maximum", r"longest repeating character replacement",
            r"fruit into baskets", r"max consecutive ones", r"permutation in string",
            r"find all anagrams in a string"
        ]
    },
    {
        "slug": "binary-search",
        "name": "Binary Search & Modified BS",
        "category": "Fundamentals",
        "icon": "Binary",
        "tagline": "Logarithmic O(log N) search on sorted spaces, monotonic predicates, and answers",
        "strategy": "Halve search interval at each step. Beyond sorted arrays, apply binary search on the answer domain when a validation predicate is monotonic (if X is possible, all Y >= X are possible).",
        "clues": [
            "Sorted array search with O(log N) runtime requirement",
            "Rotated sorted arrays or matrix search",
            "Find minimum / maximum threshold satisfying condition",
            "Koko Eating Bananas / Capacity to Ship Packages"
        ],
        "topics": ["Binary Search"],
        "keywords": [
            r"binary search", r"search in rotated sorted array", r"find minimum in rotated",
            r"search a 2d matrix", r"find peak element", r"first and last position",
            r"koko eating bananas", r"capacity to ship packages", r"median of two sorted arrays"
        ]
    },
    {
        "slug": "prefix-sum",
        "name": "Prefix Sum & Hash Map",
        "category": "Fundamentals",
        "icon": "Sigma",
        "tagline": "O(1) range queries and subarray sum lookups using cumulative totals",
        "strategy": "Precompute cumulative sums so any subarray sum sum(i..j) equals prefix[j] - prefix[i-1]. Pair with a Hash Map storing past prefix sums for instant O(N) subarray sum detection.",
        "clues": [
            "Count subarrays summing to K",
            "Continuous subarray with equal 0s and 1s",
            "Frequent range sum queries on immutable array",
            "Subarray sum divisible by K"
        ],
        "topics": ["Prefix Sum"],
        "keywords": [
            r"subarray sum equals k", r"range sum query", r"continuous subarray sum",
            r"contiguous array", r"subarray sums divisible by k", r"product of array except self"
        ]
    },
    {
        "slug": "fast-slow-pointers",
        "name": "Fast & Slow Pointers",
        "category": "Fundamentals",
        "icon": "IterationCcw",
        "tagline": "Cycle detection and midpoint traversal using Floyd's Tortoise and Hare algorithm",
        "strategy": "Advance one pointer by 1 step and another by 2 steps. In a cycle, the fast pointer will inevitably lap the slow pointer. Also locates middle of linked lists in a single pass.",
        "clues": [
            "Detect cycle in linked list or array",
            "Find cycle start node or duplicate number",
            "Find middle of linked list without knowing length",
            "Happy Number or circular loop"
        ],
        "topics": [],
        "keywords": [
            r"linked list cycle", r"find the duplicate number", r"happy number",
            r"middle of the linked list", r"palindrome linked list", r"circular array loop"
        ]
    },
    {
        "slug": "linked-list-manipulation",
        "name": "Linked List In-Place Manipulation",
        "category": "Fundamentals",
        "icon": "Link2",
        "tagline": "Reversing, reordering, and partitioning pointer chains with O(1) space",
        "strategy": "Use dummy nodes to simplify edge cases at head. Maintain prev, curr, and next pointers to rewire node references in a single pass without allocating new nodes.",
        "clues": [
            "Reverse entire or partial linked list",
            "Merge K or two sorted lists",
            "Reorder list (weave front and back)",
            "Remove Nth node from end"
        ],
        "topics": ["Linked List"],
        "keywords": [
            r"reverse linked list", r"reorder list", r"remove nth node from end",
            r"merge two sorted lists", r"swap nodes in pairs", r"reverse nodes in k-group",
            r"copy list with random pointer", r"rotate list", r"odd even linked list"
        ]
    },
    {
        "slug": "monotonic-stack",
        "name": "Monotonic Stack & Queue",
        "category": "Data Structures",
        "icon": "Layers",
        "tagline": "Nearest greater/smaller elements and range extremums in linear time",
        "strategy": "Maintain stack elements in strictly ascending or descending order. When an incoming element violates the order, pop elements to resolve their nearest greater/smaller neighbor.",
        "clues": [
            "Find next greater element or previous smaller element",
            "Daily temperatures or stock span",
            "Largest rectangle in histogram",
            "Sliding window maximum / minimum"
        ],
        "topics": ["Monotonic Stack", "Monotonic Queue"],
        "keywords": [
            r"daily temperatures", r"next greater element", r"largest rectangle in histogram",
            r"maximal rectangle", r"online stock span", r"asteroid collision",
            r"remove k digits", r"132 pattern", r"sum of subarray minimums"
        ]
    },
    {
        "slug": "heaps-top-k",
        "name": "Top K Elements & Priority Queues",
        "category": "Data Structures",
        "icon": "Crown",
        "tagline": "Tracking extremes, medians, and K largest/smallest elements in dynamic streams",
        "strategy": "Use a Min-Heap of size K to find the K largest elements (or Max-Heap for smallest). Pair two heaps (Min-Heap & Max-Heap) to maintain the median of a streaming dataset.",
        "clues": [
            "Find K largest or most frequent elements",
            "Merge K sorted lists or arrays",
            "Find median from continuous data stream",
            "Task scheduling / reorganize string"
        ],
        "topics": ["Heap (Priority Queue)"],
        "keywords": [
            r"kth largest element", r"top k frequent", r"merge k sorted lists",
            r"find median from data stream", r"k closest points to origin",
            r"reorganize string", r"task scheduler", r"furthest building you can reach"
        ]
    },
    {
        "slug": "trie",
        "name": "Trie (Prefix Tree)",
        "category": "Data Structures",
        "icon": "FolderTree",
        "tagline": "Efficient prefix matching, autocomplete, and dictionary lookups",
        "strategy": "Tree data structure where each node represents a character. Common prefixes share branches, enabling O(L) search, insert, and startsWith operations where L is string length.",
        "clues": [
            "Autocomplete or dictionary word search",
            "Prefix matching (startsWith)",
            "Boggle / Bounding grid word search (Word Search II)",
            "Maximum XOR of two numbers in an array"
        ],
        "topics": ["Trie"],
        "keywords": [
            r"implement trie", r"word search ii", r"design add and search words",
            r"replace words", r"concatenated words", r"stream of characters",
            r"maximum xor of two numbers"
        ]
    },
    {
        "slug": "union-find",
        "name": "Union-Find (Disjoint Set)",
        "category": "Data Structures",
        "icon": "Network",
        "tagline": "Connectivity, cycle detection, and clustering in undirected networks",
        "strategy": "Maintain component representatives in a parent array. Use path compression and union by rank to achieve near-constant amortized time O(α(N)) per operation.",
        "clues": [
            "Connected components in an undirected graph",
            "Cycle detection in dynamic edge additions",
            "Redundant connection identification",
            "Accounts merge / email clustering"
        ],
        "topics": ["Union Find", "Union-Find"],
        "keywords": [
            r"number of connected components", r"redundant connection", r"accounts merge",
            r"graph valid tree", r"number of provinces", r"friend circles",
            r"satisfiability of equality equations", r"longest consecutive sequence"
        ]
    },
    {
        "slug": "intervals",
        "name": "Intervals & Overlap Scheduling",
        "category": "Data Structures",
        "icon": "CalendarRange",
        "tagline": "Managing overlapping timelines, meeting rooms, and range merges",
        "strategy": "Sort intervals by start time (or end time). Iterate sequentially, merging when curr.start <= prev.end, or using a Min-Heap of end times to schedule parallel rooms.",
        "clues": [
            "Merge overlapping ranges",
            "Insert new interval into non-overlapping list",
            "Meeting rooms required for schedule",
            "Minimum intervals to remove for zero overlap"
        ],
        "topics": [],
        "keywords": [
            r"interval", r"meeting rooms", r"non-overlapping",
            r"minimum number of arrows", r"my calendar", r"car pooling",
            r"employee free time", r"teemo attacking", r"video stitching",
            r"data stream as disjoint intervals"
        ]
    },
    {
        "slug": "tree-dfs",
        "name": "Tree Depth-First Search (DFS)",
        "category": "Trees & Graphs",
        "icon": "GitBranch",
        "tagline": "Recursive top-down and bottom-up traversals on hierarchical structures",
        "strategy": "Traverse left and right subtrees recursively (Preorder, Inorder, Postorder). Base case handles null nodes; return values aggregate information up the tree.",
        "clues": [
            "Max depth, diameter, or path sum in binary tree",
            "Lowest common ancestor (LCA)",
            "Serialize and deserialize binary tree",
            "Subtree validation or symmetry check"
        ],
        "topics": ["Tree", "Binary Tree", "Depth-First Search"],
        "keywords": [
            r"maximum depth of binary tree", r"lowest common ancestor", r"binary tree maximum path sum",
            r"diameter of binary tree", r"balanced binary tree", r"same tree",
            r"invert binary tree", r"symmetric tree", r"path sum", r"serialize and deserialize"
        ]
    },
    {
        "slug": "tree-bfs",
        "name": "Tree Breadth-First Search (BFS)",
        "category": "Trees & Graphs",
        "icon": "Rows3",
        "tagline": "Level-order traversal and horizontal tier exploration using queues",
        "strategy": "Enqueue root node, then process queue level by level. In each iteration, record queue size to batch-process all nodes at the current depth before advancing.",
        "clues": [
            "Level-order traversal / zigzag traversal",
            "Right side view or boundary traversal",
            "Minimum depth of binary tree",
            "Connect next right pointers at each level"
        ],
        "topics": ["Tree", "Binary Tree", "Breadth-First Search"],
        "keywords": [
            r"binary tree level order traversal", r"binary tree right side view",
            r"binary tree zigzag level order", r"populating next right pointers",
            r"vertical order traversal", r"minimum depth of binary tree"
        ]
    },
    {
        "slug": "binary-search-tree",
        "name": "Binary Search Tree (BST)",
        "category": "Trees & Graphs",
        "icon": "Split",
        "tagline": "Ordered hierarchical storage with monotonic inorder traversal",
        "strategy": "Exploit left < root < right property. An inorder traversal produces sorted values. Eliminates half of candidate nodes at each step in search/insert.",
        "clues": [
            "Validate binary search tree",
            "Kth smallest / largest element in BST",
            "Inorder predecessor or successor",
            "Convert sorted array to BST"
        ],
        "topics": ["Binary Search Tree"],
        "keywords": [
            r"validate binary search tree", r"kth smallest element in a bst",
            r"lowest common ancestor of a binary search tree", r"insert into a binary search tree",
            r"delete node in a bst", r"convert sorted array to binary search tree"
        ]
    },
    {
        "slug": "graph-traversal",
        "name": "Graph Traversal (BFS & DFS)",
        "category": "Trees & Graphs",
        "icon": "Share2",
        "tagline": "Shortest paths, flood fills, and connected components in arbitrary networks",
        "strategy": "Track visited vertices to prevent infinite loops in cyclic graphs. Use BFS for unweighted shortest paths (word ladder, rotting oranges); use DFS for exhaustive component exploration (islands, clone graph).",
        "clues": [
            "Number of islands / matrix grid exploration",
            "Clone graph with deep pointer copies",
            "Word ladder (minimum transformation steps)",
            "Rotting oranges (multisource BFS level propagation)"
        ],
        "topics": ["Graph Theory", "Graph"],
        "keywords": [
            r"number of islands", r"clone graph", r"word ladder",
            r"rotting oranges", r"pacific atlantic water flow", r"surrounded regions",
            r"walls and gates", r"max area of island", r"open the lock"
        ]
    },
    {
        "slug": "topological-sort",
        "name": "Topological Sort (Kahn's & DFS)",
        "category": "Trees & Graphs",
        "icon": "ArrowDownUp",
        "tagline": "Linear dependency ordering and cycle detection in Directed Acyclic Graphs (DAG)",
        "strategy": "Kahn's Algorithm: compute in-degrees for all nodes; enqueue zero in-degree nodes; remove them and decrement neighbor in-degrees. If processed nodes < total, a cycle exists.",
        "clues": [
            "Prerequisite course scheduling",
            "Alien dictionary character precedence",
            "Compilation build task order",
            "Minimum height trees"
        ],
        "topics": ["Topological Sort"],
        "keywords": [
            r"course schedule", r"alien dictionary", r"minimum height trees",
            r"sequence reconstruction", r"sort items by groups respecting dependencies"
        ]
    },
    {
        "slug": "matrix-traversal",
        "name": "Matrix & Grid Traversal",
        "category": "Trees & Graphs",
        "icon": "Grid",
        "tagline": "Coordinate navigation, spiral unwrapping, and 2D cellular automations",
        "strategy": "Model 2D arrays with (r, c) coordinates and direction vectors `dx = [0, 1, 0, -1]`, `dy = [1, 0, -1, 0]`. Check boundary limits before accessing neighbors.",
        "clues": [
            "Spiral order matrix traversal",
            "In-place 90 degree matrix rotation",
            "Set matrix zeroes with O(1) space",
            "Game of Life state transitions"
        ],
        "topics": ["Matrix"],
        "keywords": [
            r"spiral matrix", r"rotate image", r"set matrix zeroes",
            r"game of life", r"word search\b", r"battleships in a board"
        ]
    },
    {
        "slug": "backtracking",
        "name": "Backtracking & Exhaustive Search",
        "category": "Advanced & DP",
        "icon": "RotateCcw",
        "tagline": "Combinations, permutations, and constraint satisfaction through pruned search trees",
        "strategy": "Construct candidates incrementally. At each step, test validity. If invalid, backtrack by undoing state changes to explore other branches (choose, explore, un-choose).",
        "clues": [
            "Generate all subsets, permutations, or combinations",
            "N-Queens board configuration",
            "Sudoku solver",
            "Palindrome partitioning / word break II"
        ],
        "topics": ["Backtracking"],
        "keywords": [
            r"\bsubsets\b", r"\bpermutations\b", r"\bcombination sum\b",
            r"\bn-queens\b", r"\bsudoku solver\b", r"\bpalindrome partitioning\b",
            r"\bgenerate parentheses\b", r"\bletter combinations of a phone number\b"
        ]
    },
    {
        "slug": "dynamic-programming-1d",
        "name": "1D Dynamic Programming",
        "category": "Advanced & DP",
        "icon": "TrendingUp",
        "tagline": "Linear recurrence relations, state machines, and optimal decision subproblems",
        "strategy": "Define state dp[i] as best solution using first i elements. Identify base cases and transition formula (e.g. dp[i] = max(dp[i-1], dp[i-2] + nums[i])). Optimize space to O(1) variables.",
        "clues": [
            "Climbing stairs / Fibonacci recurrence",
            "House robber (cannot rob adjacent houses)",
            "Coin change (minimum coins to reach amount)",
            "Longest Increasing Subsequence (LIS)"
        ],
        "topics": ["Dynamic Programming"],
        "keywords": [
            r"climbing stairs", r"house robber", r"coin change\b",
            r"longest increasing subsequence", r"word break\b", r"decode ways",
            r"maximum subarray", r"jump game"
        ]
    },
    {
        "slug": "dynamic-programming-2d",
        "name": "2D Dynamic Programming & Knapsack",
        "category": "Advanced & DP",
        "icon": "Boxes",
        "tagline": "Grid optimization, 0/1 knapsack, and dual string alignments",
        "strategy": "State dp[i][j] represents subproblem considering i items and capacity j (knapsack) or prefixes s1[0..i] and s2[0..j] (string alignment). Use rolling arrays to reduce memory from O(M*N) to O(N).",
        "clues": [
            "Unique paths / min path sum in grid",
            "Longest common subsequence (LCS) / Edit distance",
            "0/1 Knapsack / Partition equal subset sum",
            "Interleaving string verification"
        ],
        "topics": ["Dynamic Programming"],
        "keywords": [
            r"unique paths", r"minimum path sum", r"longest common subsequence",
            r"edit distance", r"target sum", r"partition equal subset sum",
            r"coin change 2", r"interleaving string", r"distinct subsequences"
        ]
    },
    {
        "slug": "greedy",
        "name": "Greedy Algorithms",
        "category": "Advanced & DP",
        "icon": "Flame",
        "tagline": "Making locally optimal choices that guarantee global optimal outcomes",
        "strategy": "Prove greedy choice property and optimal substructure. Make the locally best choice at each step without ever revising past decisions. Often involves sorting input beforehand.",
        "clues": [
            "Jump game (track maximum reachable index)",
            "Gas station complete circuit",
            "Task scheduler with cooldown",
            "Partition labels into maximum disjoint segments"
        ],
        "topics": ["Greedy"],
        "keywords": [
            r"jump game", r"gas station", r"task scheduler",
            r"partition labels", r"lemonade change", r"candy\b",
            r"hand of straights", r"queue reconstruction by height"
        ]
    },
    {
        "slug": "bit-manipulation",
        "name": "Bit Manipulation",
        "category": "Advanced & DP",
        "icon": "Cpu",
        "tagline": "O(1) low-level bitwise operations, masks, and XOR parity tricks",
        "strategy": "Use XOR properties (x ^ x = 0, x ^ 0 = x) for missing/duplicate numbers. Clear lowest set bit with `n & (n - 1)`. Use bitmasks to represent subsets up to length 32/64.",
        "clues": [
            "Single number among duplicates",
            "Number of 1 bits (Hamming weight)",
            "Counting bits sequence",
            "Reverse bits / bitwise AND of numbers range"
        ],
        "topics": ["Bit Manipulation"],
        "keywords": [
            r"single number", r"number of 1 bits", r"counting bits",
            r"reverse bits", r"bitwise and of numbers range", r"power of two",
            r"sum of two integers"
        ]
    }
]

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_data_dir = os.path.join(base_dir, "public", "data")
    companies_dir = os.path.join(public_data_dir, "companies")
    patterns_dir = os.path.join(public_data_dir, "patterns")
    os.makedirs(patterns_dir, exist_ok=True)

    print("🧩 Compiling LeetCode DSA Patterns Catalog...")

    # 1. Collect all unique DSA problems across all 683 companies
    unique_probs = {}
    for fpath in glob.glob(os.path.join(companies_dir, "*.json")):
        with open(fpath, "r", encoding="utf-8") as f:
            comp = json.load(f)
        comp_slug = comp["slug"]
        comp_name = comp["name"]

        # Look into the all-time window
        all_time_window = comp["windows"][-1]
        for p in all_time_window["problems"]:
            if p.get("isSql") or "database" in [t.lower() for t in p.get("topics", [])]:
                continue
            slug = p["slug"]
            if slug not in unique_probs:
                unique_probs[slug] = {
                    "id": p.get("id", ""),
                    "title": p["title"],
                    "slug": slug,
                    "difficulty": p["difficulty"],
                    "acceptance": p.get("acceptance", 0),
                    "link": p["link"],
                    "topics": p.get("topics", []),
                    "maxFrequency": p.get("frequency", 0),
                    "companiesCount": 0,
                    "companies": []
                }
            unique_probs[slug]["companies"].append({
                "name": comp_name,
                "slug": comp_slug,
                "frequency": p.get("frequency", 0)
            })
            if p.get("frequency", 0) > unique_probs[slug]["maxFrequency"]:
                unique_probs[slug]["maxFrequency"] = p.get("frequency", 0)

    # Calculate companiesCount and sort companies by frequency
    for p in unique_probs.values():
        p["companiesCount"] = len(p["companies"])
        p["companies"].sort(key=lambda x: x["frequency"], reverse=True)

    print(f"📊 Processed {len(unique_probs)} distinct DSA questions across {len(glob.glob(os.path.join(companies_dir, '*.json')))} companies.")

    # 2. Match each pattern
    pattern_summaries = []

    for pat in PATTERNS_CONFIG:
        slug = pat["slug"]
        pat_topics_lower = [t.lower() for t in pat["topics"]]
        regexes = [re.compile(kw, re.IGNORECASE) for kw in pat["keywords"]]

        matched_problems = []
        for p in unique_probs.values():
            p_topics_lower = [t.lower() for t in p["topics"]]
            has_topic = any(t in p_topics_lower for t in pat_topics_lower)
            has_kw = any(rgx.search(p["title"]) or rgx.search(p["slug"].replace("-", " ")) for rgx in regexes)

            if has_topic or has_kw:
                matched_problems.append(p)

        # Sort problems by popularity: companiesCount descending, then maxFrequency descending
        matched_problems.sort(key=lambda x: (x["companiesCount"], x["maxFrequency"]), reverse=True)

        easy_c = sum(1 for p in matched_problems if p["difficulty"] == "EASY")
        med_c = sum(1 for p in matched_problems if p["difficulty"] == "MEDIUM")
        hard_c = sum(1 for p in matched_problems if p["difficulty"] == "HARD")

        # Extract top companies asking problems from this pattern
        comp_counter = {}
        for p in matched_problems:
            for c in p["companies"]:
                comp_counter[c["name"]] = comp_counter.get(c["name"], 0) + 1
        top_companies = [c[0] for c in sorted(comp_counter.items(), key=lambda x: x[1], reverse=True)[:6]]

        pattern_detail = {
            "slug": slug,
            "name": pat["name"],
            "category": pat["category"],
            "icon": pat["icon"],
            "tagline": pat["tagline"],
            "strategy": pat["strategy"],
            "clues": pat["clues"],
            "total": len(matched_problems),
            "easy": easy_c,
            "medium": med_c,
            "hard": hard_c,
            "topCompanies": top_companies,
            "problems": matched_problems
        }

        # Save individual pattern file
        detail_path = os.path.join(patterns_dir, f"{slug}.json")
        with open(detail_path, "w", encoding="utf-8") as f:
            json.dump(pattern_detail, f, separators=(',', ':'))

        # Lightweight summary for patterns index
        pattern_summaries.append({
            "slug": slug,
            "name": pat["name"],
            "category": pat["category"],
            "icon": pat["icon"],
            "tagline": pat["tagline"],
            "total": len(matched_problems),
            "easy": easy_c,
            "medium": med_c,
            "hard": hard_c,
            "topCompanies": top_companies
        })

    # Save patterns index
    patterns_index_path = os.path.join(public_data_dir, "patterns.json")
    with open(patterns_index_path, "w", encoding="utf-8") as f:
        json.dump(pattern_summaries, f, separators=(',', ':'))

    print(f"✅ Successfully compiled {len(pattern_summaries)} patterns to public/data/patterns.json and public/data/patterns/")

if __name__ == "__main__":
    main()
