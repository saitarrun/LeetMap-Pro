import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserProfile } from '@/types';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('grindmap_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({
        user: null,
        oauthConfigured: Boolean(process.env.GITHUB_CLIENT_ID),
      });
    }

    const user: UserProfile = JSON.parse(sessionCookie);
    return NextResponse.json({
      user,
      oauthConfigured: Boolean(process.env.GITHUB_CLIENT_ID),
    });
  } catch (e) {
    return NextResponse.json({
      user: null,
      oauthConfigured: Boolean(process.env.GITHUB_CLIENT_ID),
    });
  }
}
