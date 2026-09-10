# GrindMap Pro — Company-wise LeetCode Interview Questions

A fast, responsive, modern web application for practicing LeetCode problems categorized by company, ranked by recency and interview frequency. Modeled after [GrindMap](https://grindmap.xevrion.dev/) and powered by community-maintained upstream datasets from [`liquidslr/leetcode-company-wise-problems`](https://github.com/liquidslr/leetcode-company-wise-problems) and [`snehasishroy/leetcode-companywise-interview-questions`](https://github.com/snehasishroy/leetcode-companywise-interview-questions).

---

## ⚡ Features

- **470+ Companies Catalog**: Browse questions for Google, Amazon, Meta, Bloomberg, Uber, Citadel, Jane Street, Stripe, Apple, Microsoft, and hundreds more.
- **5 Recency Windows**:
  - `Last 30 Days` (current interview trends)
  - `Last 3 Months`
  - `Last 6 Months`
  - `6+ Months Ago`
  - `All Time`
- **Blind Practice Mode ("Hide Topics")**: Hide algorithm tags (DP, Binary Search, Graph, etc.) to simulate realistic, unassisted interview environments.
- **Progress Tracking ("Hide Solved")**: Check off solved problems with local storage persistence and real-time progress meters per company.
- **Random Problem Picker**: Instantly pick an unsolved question from your currently filtered list.
- **Multi-parameter Filtering & Sorting**:
  - Filter by Difficulty (`All`, `Easy`, `Medium`, `Hard`)
  - Filter by Topic Tags (interactive chips with problem counts)
  - Sort by Frequency, Difficulty, Acceptance Rate, or Problem Name
- **Export to CSV**: Export filtered problem sets directly for import into Notion, Obsidian, or Excel.
- **Dark & Light Mode**: Seamless theme toggle with zero flash on page load.
- **Realtime Sync Pipeline & Dashboard**:
  - Automated in-memory tarball streaming parses all 2,350 CSV files across 470 companies in **~2 seconds**.
  - On-demand sync via `/api/sync` or UI modal button.
  - Scheduled automated daily sync via GitHub Actions (`.github/workflows/sync.yml`).

---

## 🏗 Architecture & Synchronization

```
┌────────────────────────────────────────────────────────┐
│ Upstream GitHub Repository                             │
│ (liquidslr/leetcode-company-wise-problems)             │
│ - 470 company directories                              │
│ - 2,350 CSVs (30 Days, 3 Months, 6 Months, etc.)      │
└──────────────────────────┬─────────────────────────────┘
                           │ Single tar.gz stream (~1.3MB)
                           ▼
┌────────────────────────────────────────────────────────┐
│ High-Speed In-Memory Sync Engine                       │
│ (scripts/sync-data.py & /api/sync)                     │
│ - Extracts and parses in ~2 seconds                    │
│ - Normalizes schemas & assigns official domains        │
│ - Generates static JSONs + sync metadata               │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌─────────────────────────┐         ┌────────────────────────┐
│ public/data/            │         │ Next.js App Router     │
│ - companies.json        │ ◄────── │ - Server-Side First    │
│ - companies/[slug].json │         │   Paint (SSR/ISR)      │
│ - sync-status.json      │         │ - Client-Side Caching  │
└─────────────────────────┘         └────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- Python 3.8+ (for running the sync script)

### 1. Install dependencies
```bash
npm install
```

### 2. Fetch/Sync latest data
```bash
npm run sync
```
*This downloads the latest tarball from upstream, parses all 2,350 CSVs, and updates `public/data/` in ~2 seconds.*

### 3. Run Development Server
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

## 🔄 Realtime Sync Endpoints

- **`GET /api/status`**: Returns current sync metadata (upstream commit SHA, last sync date, company count, problem count).
- **`POST /api/sync`**: Triggers a live sync run and returns stdout logs and updated stats.
- **`GET /api/companies?q=google`**: Search companies with optional search query.
- **`GET /api/company/:slug`**: Retrieves the full dataset for a specific company.

---

## 🤖 Automated Daily Sync (GitHub Actions)

A GitHub Actions workflow is located at `.github/workflows/sync.yml` that runs automatically every day at `02:00 UTC`. It fetches changes from the upstream dataset, updates `public/data/`, and commits any updates automatically.
