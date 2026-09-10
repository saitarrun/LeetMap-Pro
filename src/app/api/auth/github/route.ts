import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/callback/github`;

  if (!clientId) {
    // If OAuth is not configured in environment, inform client to use dev-login fallback
    return NextResponse.json({
      configured: false,
      message: 'GITHUB_CLIENT_ID not configured. Use the direct GitHub profile sign-in.',
    });
  }

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');

  return NextResponse.redirect(githubAuthUrl.toString());
}
