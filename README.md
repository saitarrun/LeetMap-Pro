# leetmap Pro — Company-wise LeetCode Interview Questions

A fast, responsive, modern web application for practicing LeetCode problems categorized by company, ranked by recency and interview frequency. Powered by community-maintained upstream datasets from [`liquidslr/leetcode-company-wise-problems`](https://github.com/liquidslr/leetcode-company-wise-problems) and [`snehasishroy/leetcode-companywise-interview-questions`](https://github.com/snehasishroy/leetcode-companywise-interview-questions).

---

## ⚡ Features

- **680+ Companies Catalog**: Browse questions for Google, Amazon, Meta, Bloomberg, Uber, Citadel, Jane Street, Stripe, Apple, Microsoft, and hundreds more.
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
  - Size-bounded in-memory tarball parsing aggregates upstream company datasets.
  - Clerk-authenticated, administrator-only on-demand sync via `/api/sync`.

---

## 🏗 Architecture & Synchronization

```
┌────────────────────────────────────────────────────────┐
│ Upstream GitHub Repository                             │
│ (liquidslr/leetcode-company-wise-problems)             │
│ - Company directories and recency-window CSVs          │
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
- Node.js 20.9+
- Python 3.8+ (for running the sync script)

### 1. Install dependencies
```bash
npm install
```

### 2. Fetch/Sync latest data
```bash
npm run sync
```
*This downloads size-bounded upstream archives, parses their CSV files, and updates `public/data/`.*

### 3. Run Development Server

Configure Clerk and the sync administrator allowlist in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
SYNC_ADMIN_USER_IDS=user_your_clerk_user_id
```

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
- **`POST /api/sync`**: Triggers a rate-limited sync for Clerk users listed in `SYNC_ADMIN_USER_IDS`.
- **`GET /api/companies?q=google`**: Search companies with optional search query.
- **`GET /api/company/:slug`**: Retrieves the full dataset for a specific company.

---

## 🔐 Security

- Clerk is the only authentication provider used by the application.
- Progress and sync endpoints require a verified Clerk session.
- Sync authorization fails closed unless `SYNC_ADMIN_USER_IDS` is configured.
- Security headers and a Clerk-compatible Content Security Policy are applied globally.
- Run `npm run security:audit` to check dependencies for known vulnerabilities.
