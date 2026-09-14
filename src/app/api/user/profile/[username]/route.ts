import { NextResponse } from 'next/server';
import { fetchPublicUserProfile } from '@/utils/server-user';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const clean = username?.trim().toLowerCase();
  if (!clean || !/^[a-z0-9_-]+$/.test(clean)) {
    return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
  }

  const profile = await fetchPublicUserProfile(username);
  if (!profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }

  return NextResponse.json(profile, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
