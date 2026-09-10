import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserProfile } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const origin = new URL(request.url).origin;

  if (error || !code) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error || 'missing_code')}`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/?auth_error=oauth_unconfigured`);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to obtain access token');
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'leetmap',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userRes.ok) {
      throw new Error('Failed to fetch user from GitHub');
    }

    const ghUser = await userRes.json();

    const userProfile: UserProfile = {
      id: String(ghUser.id),
      username: ghUser.login,
      name: ghUser.name || ghUser.login,
      avatarUrl: ghUser.avatar_url,
      bio: ghUser.bio || undefined,
      githubUrl: ghUser.html_url,
      email: ghUser.email || undefined,
      createdAt: new Date().toISOString(),
    };

    // 3. Store session in secure cookie (valid for 30 days)
    const cookieStore = await cookies();
    cookieStore.set('leetmap_session', JSON.stringify(userProfile), {
      httpOnly: false, // accessible to client for offline/react state sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.redirect(`${origin}/?auth_success=1`);
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(err.message || 'auth_failed')}`);
  }
}
