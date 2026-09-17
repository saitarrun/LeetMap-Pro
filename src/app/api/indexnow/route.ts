import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const INDEXNOW_KEY = 'c7b91d2f8e4a460393b6e82a15f07d2e';
const HOST = 'www.leetmap-pro.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

function getAllCanonicalUrls(): string[] {
  const baseUrls = [
    `https://${HOST}`,
    `https://${HOST}/strategy`,
    `https://${HOST}/patterns`,
    `https://${HOST}/sql`,
    `https://${HOST}/patterns/time-complexity`,
    `https://${HOST}/privacy`,
    `https://${HOST}/terms`,
  ];

  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const companiesPath = path.join(dataDir, 'companies.json');
    if (fs.existsSync(companiesPath)) {
      const companies: { slug: string }[] = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
      companies.forEach((c) => {
        if (c.slug) baseUrls.push(`https://${HOST}/company/${c.slug}`);
      });
    }

    const patternsPath = path.join(dataDir, 'patterns.json');
    if (fs.existsSync(patternsPath)) {
      const patterns: { slug: string }[] = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
      patterns.forEach((p) => {
        if (p.slug) baseUrls.push(`https://${HOST}/patterns/${p.slug}`);
      });
    }

    const sqlPath = path.join(dataDir, 'sql-companies.json');
    if (fs.existsSync(sqlPath)) {
      const sqlCompanies: { slug: string }[] = JSON.parse(fs.readFileSync(sqlPath, 'utf8'));
      sqlCompanies.forEach((s) => {
        if (s.slug) baseUrls.push(`https://${HOST}/sql/${s.slug}`);
      });
    }
  } catch (err) {
    console.error('Failed to load canonical URLs for IndexNow:', err);
  }

  return baseUrls;
}

async function submitToIndexNow(urls: string[]) {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  // Submit to both indexnow.org and bing.com endpoints for fast propagation
  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ];

  const results = await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      return {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        ok: response.status === 200 || response.status === 202,
      };
    })
  );

  return results.map((r) =>
    r.status === 'fulfilled' ? r.value : { status: 500, error: String(r.reason) }
  );
}

export async function GET() {
  try {
    const urls = getAllCanonicalUrls();
    const results = await submitToIndexNow(urls);
    return NextResponse.json({
      success: true,
      submittedCount: urls.length,
      submittedUrls: urls.slice(0, 50),
      results,
    });
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit to IndexNow' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const urls = Array.isArray(body?.urls) && body.urls.length > 0 ? body.urls : getAllCanonicalUrls();
    const results = await submitToIndexNow(urls);

    return NextResponse.json({
      success: true,
      submittedCount: urls.length,
      submittedUrls: urls.slice(0, 50),
      results,
    });
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit to IndexNow' },
      { status: 500 }
    );
  }
}
