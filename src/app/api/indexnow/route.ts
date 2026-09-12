import { NextResponse } from 'next/server';

const INDEXNOW_KEY = 'c7b91d2f8e4a460393b6e82a15f07d2e';
const HOST = 'leetmap-pro.vercel.app';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const CORE_URLS = [
  `https://${HOST}`,
  `https://${HOST}/strategy`,
  `https://${HOST}/patterns`,
  `https://${HOST}/sql`,
  `https://${HOST}/patterns/time-complexity`,
  `https://${HOST}/company/netflix`,
  `https://${HOST}/company/google`,
  `https://${HOST}/company/meta`,
  `https://${HOST}/company/amazon`,
  `https://${HOST}/company/apple`,
  `https://${HOST}/company/microsoft`,
  `https://${HOST}/company/bloomberg`,
  `https://${HOST}/company/citadel`,
  `https://${HOST}/privacy`,
  `https://${HOST}/terms`,
];

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
    const results = await submitToIndexNow(CORE_URLS);
    return NextResponse.json({
      success: true,
      submittedUrls: CORE_URLS,
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
    const urls = Array.isArray(body?.urls) && body.urls.length > 0 ? body.urls : CORE_URLS;
    const results = await submitToIndexNow(urls);

    return NextResponse.json({
      success: true,
      submittedUrls: urls,
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
