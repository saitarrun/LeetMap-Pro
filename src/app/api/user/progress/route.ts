import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { UserProfile, SolvedProblemRecord } from '@/types';

function getUserDir() {
  const dir = path.join(process.cwd(), 'data', 'user-progress');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getSafeFilePath(username: string): string {
  // sanitize username to prevent path traversal
  const safe = username.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return path.join(getUserDir(), `${safe}.json`);
}

interface UserStorageData {
  username: string;
  solvedSlugs: string[];
  activityRecords: SolvedProblemRecord[];
  updatedAt: string;
}

function readUserData(username: string): UserStorageData {
  const filepath = getSafeFilePath(username);
  if (!fs.existsSync(filepath)) {
    return {
      username,
      solvedSlugs: [],
      activityRecords: [],
      updatedAt: new Date().toISOString(),
    };
  }
  try {
    const raw = fs.readFileSync(filepath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      username,
      solvedSlugs: Array.isArray(parsed.solvedSlugs) ? parsed.solvedSlugs : [],
      activityRecords: Array.isArray(parsed.activityRecords) ? parsed.activityRecords : [],
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (e) {
    return {
      username,
      solvedSlugs: [],
      activityRecords: [],
      updatedAt: new Date().toISOString(),
    };
  }
}

function writeUserData(username: string, data: UserStorageData): void {
  const filepath = getSafeFilePath(username);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
}

async function getSessionUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('grindmap_session')?.value;
    if (!sessionCookie) return null;
    return JSON.parse(sessionCookie);
  } catch (e) {
    return null;
  }
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || !user.username) {
    return NextResponse.json({ authenticated: false, solvedSlugs: [], activityRecords: [] });
  }

  const data = readUserData(user.username);
  return NextResponse.json({
    authenticated: true,
    username: user.username,
    solvedSlugs: data.solvedSlugs,
    activityRecords: data.activityRecords,
    updatedAt: data.updatedAt,
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !user.username) {
    return NextResponse.json(
      { error: 'Unauthorized. Sign in to save cloud progress.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const current = readUserData(user.username);

    // Merge client-provided data (two-way sync)
    const clientSlugs: string[] = Array.isArray(body.solvedSlugs) ? body.solvedSlugs : [];
    const clientRecords: SolvedProblemRecord[] = Array.isArray(body.activityRecords) ? body.activityRecords : [];

    const mergedSlugsSet = new Set([...current.solvedSlugs, ...clientSlugs]);

    // Merge records by slug
    const recordMap = new Map<string, SolvedProblemRecord>();
    current.activityRecords.forEach((r) => recordMap.set(r.slug, r));
    clientRecords.forEach((r) => {
      if (!recordMap.has(r.slug)) {
        recordMap.set(r.slug, r);
      }
    });

    const updatedData: UserStorageData = {
      username: user.username,
      solvedSlugs: Array.from(mergedSlugsSet),
      activityRecords: Array.from(recordMap.values()),
      updatedAt: new Date().toISOString(),
    };

    writeUserData(user.username, updatedData);

    return NextResponse.json({
      success: true,
      username: user.username,
      solvedSlugs: updatedData.solvedSlugs,
      activityRecords: updatedData.activityRecords,
      updatedAt: updatedData.updatedAt,
    });
  } catch (err: any) {
    console.error('Failed to update user progress on server:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
