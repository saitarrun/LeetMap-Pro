import { NextResponse } from 'next/server';
import { fetchPublicUserProfile } from '@/utils/server-user';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  const profile = await fetchPublicUserProfile(username);
  if (!profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }

  return NextResponse.json(profile, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
