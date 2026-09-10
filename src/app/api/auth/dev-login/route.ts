import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserProfile } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawInput = (body.username || body.email || '').trim();
    const provider = body.provider || 'github';

    if (!rawInput && provider !== 'google') {
      return NextResponse.json({ success: false, error: 'Email or GitHub username is required' }, { status: 400 });
    }

    let userProfile: UserProfile;

    if (provider === 'google') {
      const email = rawInput || 'user@gmail.com';
      const cleanName = email.includes('@') ? email.split('@')[0] : 'Google User';
      const username = cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      userProfile = {
        id: `google_${Date.now()}`,
        username: username,
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        email: email,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        githubUrl: `https://github.com/${username}`,
        createdAt: new Date().toISOString(),
      };
    } else {
      // Determine username from email or direct handle
      const isEmail = rawInput.includes('@');
      const targetHandle = isEmail ? rawInput.split('@')[0] : rawInput.replace(/^@/, '');

      // Try fetching public profile from GitHub API
      let ghUser: any = null;
      try {
        const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(targetHandle)}`, {
          headers: {
            'User-Agent': 'leetmap',
            Accept: 'application/vnd.github.v3+json',
          },
          next: { revalidate: 3600 },
        });
        if (ghRes.ok) {
          ghUser = await ghRes.json();
        }
      } catch (err) {
        // Fallback below
      }

      if (ghUser) {
        userProfile = {
          id: String(ghUser.id),
          username: ghUser.login,
          name: ghUser.name || ghUser.login,
          avatarUrl: ghUser.avatar_url,
          bio: ghUser.bio || undefined,
          githubUrl: ghUser.html_url,
          email: isEmail ? rawInput : ghUser.email || undefined,
          createdAt: new Date().toISOString(),
        };
      } else {
        // Fallback profile if user does not exist on GitHub
        userProfile = {
          id: `user_${Date.now()}`,
          username: targetHandle.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
          name: targetHandle,
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${targetHandle}`,
          email: isEmail ? rawInput : `${targetHandle}@leetmap.dev`,
          githubUrl: `https://github.com/${targetHandle}`,
          createdAt: new Date().toISOString(),
        };
      }
    }

    // Save session cookie for 30 days
    const cookieStore = await cookies();
    cookieStore.set('leetmap_session', JSON.stringify(userProfile), {
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
