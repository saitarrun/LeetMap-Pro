import { NextRequest, NextResponse } from 'next/server';

const LEETCODE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const safeSlug = slug ? slug.toLowerCase().trim() : '';

  if (!safeSlug || !LEETCODE_SLUG_PATTERN.test(safeSlug)) {
    return NextResponse.redirect('https://leetcode.com/problemset/', {
      status: 307,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  return NextResponse.redirect(`https://leetcode.com/problems/${safeSlug}/`, {
    status: 307,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
