import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = (searchParams.get('company') || '').toLowerCase().trim();
    const query = (searchParams.get('q') || '').toLowerCase().trim();
    const difficulty = (searchParams.get('difficulty') || '').toUpperCase().trim();

    const filePath = path.join(process.cwd(), 'public', 'data', 'sql-problems.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'SQL catalog not found' }, { status: 404 });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const catalog = JSON.parse(raw);
    let problems = catalog.problems;

    if (company) {
      problems = problems.filter((p: any) =>
        p.companies.some((c: any) => c.slug === company || c.name.toLowerCase().includes(company))
      );
    }

    if (query) {
      problems = problems.filter((p: any) =>
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        (p.id && p.id.includes(query)) ||
        p.topics.some((t: string) => t.toLowerCase().includes(query))
      );
    }

    if (difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      problems = problems.filter((p: any) => p.difficulty === difficulty);
    }

    return NextResponse.json({
      totalSqlProblems: problems.length,
      lastUpdated: catalog.lastUpdated,
      problems,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve SQL problems', details: String(error) },
      { status: 500 }
    );
  }
}
