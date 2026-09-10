import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserProfile } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUsername = body.username?.trim();

    if (!rawUsername) {
      return NextResponse.json({ success: false, error: 'GitHub username is required' }, { status: 400 });
    }

    // Clean username (remove leading @ if provided)
    const username = rawUsername.replace(/^@/, '');

    // Fetch public profile from GitHub API
    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'grindmap-web',
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 },
    });

    if (!ghRes.ok) {
      if (ghRes.status === 404) {
        return NextResponse.json({ success: false, error: `GitHub user "@${username}" not found` }, { status: 404 });
      }
      return NextResponse.json({ success: false, error: 'Failed to query GitHub API' }, { status: ghRes.status });
    }

    const ghUser = await ghRes.json();

    const userProfile: UserProfile = {
      id: String(ghUser.id),
      username: ghUser.login,
      name: ghUser.name || ghUser.login,
      avatarUrl: ghUser.avatar_url,
      bio: ghUser.bio || undefined,
      githubUrl: ghUser.html_url,
      createdAt: new Date().toISOString(),
    };

    // Save session cookie for 30 days
    const cookieStore = await cookies();
    cookieStore.set('grindmap_session', JSON.stringify(userProfile), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({ success: true, user: userProfile });
  } catch (err: any) {
    console.error('Dev login error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
