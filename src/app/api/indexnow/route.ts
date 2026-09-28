import { NextResponse } from 'next/server';
import sitemap from '@/app/sitemap';

const INDEXNOW_KEY = 'c7b91d2f8e4a460393b6e82a15f07d2e';
const HOST = 'www.leetmap-pro.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

function getAllCanonicalUrls(): string[] {
  // Reuse the sitemap's quality gate so IndexNow never receives thin,
  // noindexed, duplicate, or alias URLs that contradict our Google signals.
  return sitemap().map((entry) => entry.url);
}

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  return Boolean(cronSecret) && request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } }
  );
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

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorizedResponse();

  try {
    const urls = getAllCanonicalUrls();
    const results = await submitToIndexNow(urls);
    return NextResponse.json({
      success: true,
      submittedCount: urls.length,
      submittedUrls: urls.slice(0, 50),
      results,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit to IndexNow' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return unauthorizedResponse();

  try {
    const body = await request.json().catch(() => ({}));
    const canonicalUrls = getAllCanonicalUrls();
    const canonicalSet = new Set(canonicalUrls);
    const requestedUrls: string[] = [];
    if (Array.isArray(body?.urls)) {
      for (const url of body.urls) {
        if (typeof url === 'string' && canonicalSet.has(url)) requestedUrls.push(url);
      }
    }
    const urls = requestedUrls.length > 0 ? [...new Set(requestedUrls)] : canonicalUrls;
    const results = await submitToIndexNow(urls);

    return NextResponse.json({
      success: true,
      submittedCount: urls.length,
      submittedUrls: urls.slice(0, 50),
      results,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit to IndexNow' },
      { status: 500 }
    );
  }
}
