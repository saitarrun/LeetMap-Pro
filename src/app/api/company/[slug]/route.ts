import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const safeSlug = slug.toLowerCase();
    if (!/^[a-z0-9-]{1,100}$/.test(safeSlug)) {
      return NextResponse.json({ error: 'Invalid company slug' }, { status: 400 });
    }
    const filePath = path.join(process.cwd(), 'public', 'data', 'companies', `${safeSlug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const companyData = JSON.parse(raw);
    return NextResponse.json(companyData, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Failed to retrieve company data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve company data' },
      { status: 500 }
    );
  }
}
