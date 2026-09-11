import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type SearchResult = {
  type: 'company' | 'problem' | 'pattern' | 'sql';
  label: string;
  description: string;
  href: string;
  meta?: string;
};

let cachedResults: SearchResult[] | null = null;

function buildIndex() {
  if (cachedResults) return cachedResults;

  const dataPath = path.join(process.cwd(), 'public', 'data');
  const results: SearchResult[] = [];
  const companies = JSON.parse(fs.readFileSync(path.join(dataPath, 'companies.json'), 'utf8')) as Array<{ name: string; slug: string; total: number }>;
  const patterns = JSON.parse(fs.readFileSync(path.join(dataPath, 'patterns.json'), 'utf8')) as Array<{ name: string; slug: string; total: number; category: string }>;
  const sql = JSON.parse(fs.readFileSync(path.join(dataPath, 'sql-problems.json'), 'utf8')) as { problems: Array<{ title: string; slug: string; difficulty: string; companiesCount: number }> };

  for (const company of companies) {
    results.push({ type: 'company', label: company.name, description: `${company.total.toLocaleString()} interview problems`, href: `/company/${company.slug}`, meta: 'Company' });
  }
  for (const pattern of patterns) {
    results.push({ type: 'pattern', label: pattern.name, description: `${pattern.total.toLocaleString()} problems · ${pattern.category}`, href: `/patterns/${pattern.slug}`, meta: 'Pattern' });
  }
  for (const problem of sql.problems) {
    results.push({ type: 'sql', label: problem.title, description: `${problem.companiesCount} companies · SQL`, href: `/sql#${problem.slug}`, meta: problem.difficulty });
  }

  const uniqueProblems = new Map<string, SearchResult>();
  for (const file of fs.readdirSync(path.join(dataPath, 'companies'))) {
    if (!file.endsWith('.json')) continue;
    try {
      const company = JSON.parse(fs.readFileSync(path.join(dataPath, 'companies', file), 'utf8')) as { name: string; windows?: Array<{ problems?: Array<{ title: string; slug: string; difficulty: string; topics?: string[] }> }> };
      for (const window of company.windows || []) {
        for (const problem of window.problems || []) {
          if (!uniqueProblems.has(problem.slug)) {
            uniqueProblems.set(problem.slug, {
              type: 'problem',
              label: problem.title,
              description: `${problem.difficulty} · ${problem.topics?.slice(0, 3).join(' · ') || 'LeetCode problem'}`,
              href: `https://leetcode.com/problems/${problem.slug}`,
              meta: 'LeetCode',
            });
          }
        }
      }
    } catch {
      // Ignore one malformed source file and keep the global index usable.
    }
  }

  cachedResults = [...results, ...uniqueProblems.values()];
  return cachedResults;
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim().toLowerCase().slice(0, 100) || '';
  if (query.length < 2) return NextResponse.json({ results: [] });

  const results = buildIndex().filter((result) => `${result.label} ${result.description}`.toLowerCase().includes(query));
  return NextResponse.json({ results: results.slice(0, 60) }, { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' } });
}
