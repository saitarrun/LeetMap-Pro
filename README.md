# LeetMap Pro — Free Company-Wise LeetCode & SQL Interview Questions

<p align="center">
  <a href="https://www.leetmap-pro.com">
    <img src="https://www.leetmap-pro.com/icon-192.png" width="80" height="80" alt="LeetMap Pro Logo" />
  </a>
</p>

<p align="center">
  <b>The modern, free, and open-source platform for practicing Company-Wise LeetCode and SQL questions ranked by real interview frequency and recency.</b>
</p>

<p align="center">
  <a href="https://www.leetmap-pro.com"><img src="https://img.shields.io/badge/Live%20App-www.leetmap--pro.com-2563eb?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Application" /></a>
  <a href="https://www.leetmap-pro.com/sql"><img src="https://img.shields.io/badge/SQL%20Hub-73%2B%20Companies-f59e0b?style=for-the-badge&logo=postgresql&logoColor=white" alt="SQL Practice Hub" /></a>
  <a href="https://www.leetmap-pro.com/patterns"><img src="https://img.shields.io/badge/DSA%20Patterns-22%20Roadmaps-10b981?style=for-the-badge&logo=git&logoColor=white" alt="DSA Patterns" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-gray?style=for-the-badge" alt="MIT License" /></a>
</p>

---

## 🌐 Explore Live Hubs

- 🏢 **[Company-Wise DSA Questions](https://www.leetmap-pro.com)** — Browse verified questions asked by **680+ tech companies** (Google, Meta, Amazon, Apple, Netflix, Microsoft, Bloomberg, Citadel, Uber, and more).
- 🗄️ **[Company-Wise SQL Practice Hub](https://www.leetmap-pro.com/sql)** — Curated SQL and database interview questions across 73 top companies for Software Engineers, Data Engineers, and Data Analysts.
- 🧩 **[Interactive DSA Coding Patterns](https://www.leetmap-pro.com/patterns)** — Master 22 core interview patterns including Sliding Window, Two Pointers, Monotonic Stack, Graph Traversal, and Dynamic Programming.
- 🗺️ **[Visual Strategy Roadmap](https://www.leetmap-pro.com/strategy)** — Interactive directed graph mapping optimal study paths from basics to advanced topics.
- ⏱️ **[Big-O Time & Space Complexity Guide](https://www.leetmap-pro.com/patterns/time-complexity)** — Comprehensive reference for data structure complexities and algorithm efficiency.

---

## ⚡ Features

- **680+ Companies Catalog**: Instant access to real interview problems asked by top tech firms and quantitative hedge funds without any subscription or paywall.
- **5 Granular Recency Windows**:
  - `Last 30 Days` (Active hiring trends and recently reported questions)
  - `Last 3 Months`
  - `Last 6 Months`
  - `6+ Months Ago`
  - `All Time`
- **Blind Practice Mode ("Hide Topics")**: Hide algorithm tags (DP, Graph, Binary Search, etc.) to practice without spoilers and simulate authentic interview pressure.
- **Progress Tracking ("Hide Solved")**: Check off solved problems with local storage persistence and real-time progress completion meters per company.
- **Problem Search by Name & Number**: Instantly find any problem across DSA and SQL company views by ID (e.g. `#1`, `#146`) or keyword (e.g. `LRU Cache`, `Two Sum`).
- **Random Problem Picker**: Pick an unsolved question with one click from your active filters.
- **Multi-Parameter Sorting & Filtering**:
  - Filter by Difficulty (`All`, `Easy`, `Medium`, `Hard`)
  - Filter by Topics (interactive chips with live problem counts)
  - Sort by Frequency, Difficulty, Acceptance Rate, ID, or Title
- **Export to CSV**: Export filtered problem sets directly for Notion, Obsidian, Anki, or Excel.
- **Apple-Grade Fluid UI**: Ultra-fast response times, full keyboard shortcuts (`/` to search, `Esc` to dismiss), dark/light mode with zero flash.

---

## 🏢 Top Featured Companies

| Company | LeetCode Questions | SQL Questions | Top Problem Patterns |
| :--- | :--- | :--- | :--- |
| **[Google](https://www.leetmap-pro.com/company/google)** | [View Google Questions](https://www.leetmap-pro.com/company/google) | [Google SQL](https://www.leetmap-pro.com/sql/google) | Trees, Graphs, DP, Trie |
| **[Meta](https://www.leetmap-pro.com/company/meta)** | [View Meta Questions](https://www.leetmap-pro.com/company/meta) | [Meta SQL](https://www.leetmap-pro.com/sql/meta) | Two Pointers, Binary Search, Sliding Window |
| **[Amazon](https://www.leetmap-pro.com/company/amazon)** | [View Amazon Questions](https://www.leetmap-pro.com/company/amazon) | [Amazon SQL](https://www.leetmap-pro.com/sql/amazon) | Arrays, Heaps, BFS/DFS, Greedy |
| **[Netflix](https://www.leetmap-pro.com/company/netflix)** | [View Netflix Questions](https://www.leetmap-pro.com/company/netflix) | [Netflix SQL](https://www.leetmap-pro.com/sql/netflix) | Design, Slidng Window, Graph Traversal |
| **[Apple](https://www.leetmap-pro.com/company/apple)** | [View Apple Questions](https://www.leetmap-pro.com/company/apple) | [Apple SQL](https://www.leetmap-pro.com/sql/apple) | Linked Lists, Trees, Strings, Dynamic Programming |
| **[Microsoft](https://www.leetmap-pro.com/company/microsoft)** | [View Microsoft Questions](https://www.leetmap-pro.com/company/microsoft) | [Microsoft SQL](https://www.leetmap-pro.com/sql/microsoft) | String Manipulation, Trees, Hash Tables |
| **[Bloomberg](https://www.leetmap-pro.com/company/bloomberg)** | [View Bloomberg Questions](https://www.leetmap-pro.com/company/bloomberg) | [Bloomberg SQL](https://www.leetmap-pro.com/sql/bloomberg) | Design, Stack, Two Pointers, Sorting |
| **[Citadel](https://www.leetmap-pro.com/company/citadel)** | [View Citadel Questions](https://www.leetmap-pro.com/company/citadel) | [Citadel SQL](https://www.leetmap-pro.com/sql/citadel) | Heaps, Monotonic Stack, Segment Trees |

---

## 🏗 Architecture & Data Pipeline

```
┌────────────────────────────────────────────────────────┐
│ Upstream Community Datasets                             │
│ (liquidslr & snehasishroy company repositories)        │
│ - Company directories and recency-window CSVs          │
└──────────────────────────┬─────────────────────────────┘
                           │ Streamed tarball
                           ▼
┌────────────────────────────────────────────────────────┐
│ In-Memory Aggregation Engine (scripts/sync-data.py)    │
│ - Parses & reconciles multiple datasets in ~2s         │
│ - Computes multi-window recency frequencies            │
│ - Generates static JSON indexes + sync status          │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌─────────────────────────┐         ┌────────────────────────┐
│ public/data/            │         │ Next.js App Router     │
│ - companies.json        │ ◄────── │ - 808 Pre-rendered     │
│ - companies/[slug].json │         │   Static HTML Pages    │
│ - sql-companies.json    │         │ - Edge CDN Cache       │
│ - patterns/*.json       │         │ - Local Storage Sync   │
└─────────────────────────┘         └────────────────────────┘
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 20.9+
- Python 3.8+ (for dataset sync)

### 1. Clone & Install
```bash
git clone https://github.com/saitarrun/LeetMap-Pro.git
cd LeetMap-Pro
npm install
```

### 2. Fetch Latest Problem Data
```bash
npm run sync
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔄 API Routes

- **`GET /api/companies?q=netflix`**: Search company dataset by keyword.
- **`GET /api/company/:slug`**: Retrieves the verified frequency breakdown for a company.
- **`GET /api/sql`**: Retrieves all SQL-enabled companies and problems.
- **`GET /api/status`**: Returns current dataset sync commit hash and timestamp.
- **`GET /api/indexnow`**: Automated search engine notification endpoint for Bing and IndexNow.

---

## 📄 License & Attribution

- Released under the **[MIT License](LICENSE)**.
- Data sources: community-maintained repositories [`liquidslr/leetcode-company-wise-problems`](https://github.com/liquidslr/leetcode-company-wise-problems) and [`snehasishroy/leetcode-companywise-interview-questions`](https://github.com/snehasishroy/leetcode-companywise-interview-questions).
- *Disclaimer: LeetCode is a registered trademark of LeetCode LLC. LeetMap Pro is an independent open-source educational project not affiliated with or endorsed by LeetCode LLC.*
