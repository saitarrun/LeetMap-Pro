import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CompanySummary } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').toLowerCase().trim().slice(0, 100);
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '0', 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 0), 1000) : 0;

    const filePath = path.join(process.cwd(), 'public', 'data', 'companies.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Companies data not found' }, { status: 404 });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    let companies = JSON.parse(raw) as CompanySummary[];

    if (query) {
      companies = companies.filter((c) =>
        c.name.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        (c.domain && c.domain.toLowerCase().includes(query))
      );
    }

    if (limit > 0) {
      companies = companies.slice(0, limit);
    }

    return NextResponse.json(companies, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Failed to retrieve companies:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve companies' },
      { status: 500 }
    );
  }
}
