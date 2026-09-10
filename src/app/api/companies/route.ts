import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').toLowerCase().trim();
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    const filePath = path.join(process.cwd(), 'public', 'data', 'companies.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Companies data not found' }, { status: 404 });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    let companies = JSON.parse(raw);

    if (query) {
      companies = companies.filter((c: any) =>
        c.name.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        (c.domain && c.domain.toLowerCase().includes(query))
      );
    }

    if (limit > 0) {
      companies = companies.slice(0, limit);
    }

    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve companies', details: String(error) },
      { status: 500 }
    );
  }
}
