import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect('https://leetcode.com/problemset/', {
    status: 307,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
