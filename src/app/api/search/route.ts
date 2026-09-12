import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export type SearchResult = {
  type: 'company' | 'problem' | 'pattern' | 'sql';
  id?: string;
  slug?: string;
  label: string;
  description: string;
  href: string;
  meta?: string;
  difficulty?: string;
  topics?: string[];
  companiesCount?: number;
  topCompanies?: string[];
  topCompanySlugs?: string[];
};

let cachedResults: SearchResult[] | null = null;

function buildIndex(): SearchResult[] {
  if (cachedResults) return cachedResults;

  const dataPath = path.join(process.cwd(), 'public', 'data');
  const results: SearchResult[] = [];

  try {
    const companies = JSON.parse(fs.readFileSync(path.join(dataPath, 'companies.json'), 'utf8')) as Array<{ name: string; slug: string; total: number }>;
    for (const company of companies) {
      results.push({
        type: 'company',
        slug: company.slug,
        label: company.name,
        description: `${company.total.toLocaleString()} interview problems`,
        href: `/company/${company.slug}`,
        meta: 'Company',
        companiesCount: company.total,
      });
    }
  } catch {}

  try {
    const patterns = JSON.parse(fs.readFileSync(path.join(dataPath, 'patterns.json'), 'utf8')) as Array<{ name: string; slug: string; total: number; category: string }>;
    for (const pattern of patterns) {
      results.push({
        type: 'pattern',
        slug: pattern.slug,
        label: pattern.name,
        description: `${pattern.total.toLocaleString()} problems · ${pattern.category}`,
        href: `/patterns/${pattern.slug}`,
        meta: 'Pattern',
      });
    }
  } catch {}

  try {
    const sql = JSON.parse(fs.readFileSync(path.join(dataPath, 'sql-problems.json'), 'utf8')) as {
      problems: Array<{ id: string; title: string; slug: string; difficulty: string; companiesCount: number; topics?: string[]; companies?: Array<{ name: string }> }>;
    };
    for (const problem of sql.problems) {
      results.push({
        type: 'sql',
        id: problem.id,
        slug: problem.slug,
        label: `#${problem.id} ${problem.title}`,
        description: `${problem.difficulty} · ${problem.companiesCount} companies · SQL`,
        href: `/sql#${problem.slug}`,
        meta: problem.difficulty,
        difficulty: problem.difficulty,
        topics: problem.topics || ['Database'],
        companiesCount: problem.companiesCount,
        topCompanies: problem.companies?.slice(0, 4).map((c) => c.name) || [],
      });
    }
  } catch {}

  // Load pre-compiled DSA problems index if available
  const dsaIndexPath = path.join(dataPath, 'dsa-problems-index.json');
  if (fs.existsSync(dsaIndexPath)) {
    try {
      const dsaProblems = JSON.parse(fs.readFileSync(dsaIndexPath, 'utf8')) as Array<{
        id: string;
        title: string;
        slug: string;
        difficulty: string;
        topics?: string[];
        companiesCount: number;
        topCompanies: string[];
        topCompanySlugs?: string[];
      }>;
      for (const p of dsaProblems) {
        results.push({
          type: 'problem',
          id: p.id,
          slug: p.slug,
          label: `#${p.id} ${p.title}`,
          description: `${p.difficulty} · ${p.companiesCount} companies · ${p.topics?.slice(0, 3).join(' · ') || 'DSA'}`,
          href: `https://leetcode.com/problems/${p.slug}`,
          meta: p.difficulty,
          difficulty: p.difficulty,
          topics: p.topics,
          companiesCount: p.companiesCount,
          topCompanies: p.topCompanies,
          topCompanySlugs: p.topCompanySlugs,
        });
      }
    } catch {}
  } else {
    // Fallback if pre-compiled index doesn't exist
    const problemIdsPath = path.join(dataPath, 'leetcode-problem-ids.json');
    let problemIds: Record<string, string> = {};
    if (fs.existsSync(problemIdsPath)) {
      try {
        problemIds = JSON.parse(fs.readFileSync(problemIdsPath, 'utf8'));
      } catch {}
    }

    const uniqueProblems = new Map<string, SearchResult>();
    try {
      const companiesDir = path.join(dataPath, 'companies');
      if (fs.existsSync(companiesDir)) {
        for (const file of fs.readdirSync(companiesDir)) {
          if (!file.endsWith('.json')) continue;
          try {
            const company = JSON.parse(fs.readFileSync(path.join(companiesDir, file), 'utf8')) as {
              name: string;
              windows?: Array<{ problems?: Array<{ title: string; slug: string; difficulty: string; topics?: string[] }> }>;
            };
            for (const window of company.windows || []) {
              for (const problem of window.problems || []) {
                if (!uniqueProblems.has(problem.slug)) {
                  const id = problemIds[problem.slug] || '';
                  uniqueProblems.set(problem.slug, {
                    type: 'problem',
                    id,
                    slug: problem.slug,
                    label: id ? `#${id} ${problem.title}` : problem.title,
                    description: `${problem.difficulty} · ${problem.topics?.slice(0, 3).join(' · ') || 'LeetCode problem'}`,
                    href: `https://leetcode.com/problems/${problem.slug}`,
                    meta: problem.difficulty,
                    difficulty: problem.difficulty,
                    topics: problem.topics,
                    companiesCount: 1,
                    topCompanies: [company.name],
                  });
                }
              }
            }
          } catch {}
        }
      }
    } catch {}
    results.push(...uniqueProblems.values());
  }

  cachedResults = results;
  return cachedResults;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawQuery = url.searchParams.get('q')?.trim() || '';
  const typeFilter = url.searchParams.get('type')?.trim();

  if (rawQuery.length === 0) return NextResponse.json({ results: [] });

  const query = rawQuery.toLowerCase().slice(0, 100);
  const cleanNum = query.replace(/^#/, '');
  const isNumeric = /^\d+$/.test(cleanNum);

  const allItems = buildIndex();
  let filtered = allItems;
  if (typeFilter) {
    filtered = filtered.filter((r) => r.type === typeFilter);
  }

  const matches = filtered.filter((result) => {
    // Check exact id match if numeric
    if (isNumeric && result.id === cleanNum) return true;
    if (result.id && result.id.startsWith(cleanNum) && cleanNum.length >= 2) return true;
    // Check title / label / description / slug / companies
    const searchString = `${result.id || ''} ${result.label} ${result.slug || ''} ${result.description} ${(result.topCompanies || []).join(' ')}`.toLowerCase();
    return searchString.includes(query);
  });

  // Sort results: exact ID matches first, then exact label startsWith, then highest company count
  matches.sort((a, b) => {
    if (isNumeric) {
      if (a.id === cleanNum && b.id !== cleanNum) return -1;
      if (b.id === cleanNum && a.id !== cleanNum) return 1;
    }
    const aLabelStarts = a.label.toLowerCase().includes(query);
    const bLabelStarts = b.label.toLowerCase().includes(query);
    if (aLabelStarts && !bLabelStarts) return -1;
    if (!aLabelStarts && bLabelStarts) return 1;
    return (b.companiesCount ?? 0) - (a.companiesCount ?? 0);
  });

  return NextResponse.json(
    { results: matches.slice(0, 50) },
    { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' } }
  );
}

