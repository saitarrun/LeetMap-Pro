import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SqlCatalog } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = (searchParams.get('company') || '').toLowerCase().trim().slice(0, 100);
    const query = (searchParams.get('q') || '').toLowerCase().trim().slice(0, 100);
    const difficulty = (searchParams.get('difficulty') || '').toUpperCase().trim();

    const filePath = path.join(process.cwd(), 'public', 'data', 'sql-problems.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'SQL catalog not found' }, { status: 404 });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const catalog = JSON.parse(raw) as SqlCatalog;
    let problems = catalog.problems;

    if (company) {
      problems = problems.filter((problem) =>
        problem.companies.some((problemCompany) =>
          problemCompany.slug === company || problemCompany.name.toLowerCase().includes(company)
        )
      );
    }

    if (query) {
      problems = problems.filter((problem) =>
        problem.title.toLowerCase().includes(query) ||
        problem.slug.toLowerCase().includes(query) ||
        (problem.id && problem.id.includes(query)) ||
        problem.topics.some((topic) => topic.toLowerCase().includes(query))
      );
    }

    if (difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      problems = problems.filter((problem) => problem.difficulty === difficulty);
    }

    return NextResponse.json(
      {
        totalSqlProblems: problems.length,
        lastUpdated: catalog.lastUpdated,
        problems,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } }
    );
  } catch (error) {
    console.error('Failed to retrieve SQL problems:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve SQL problems' },
      { status: 500 }
    );
  }
}
