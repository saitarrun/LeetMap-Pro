import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { get, put } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { SolvedProblemRecord } from '@/types';
import { isTrustedMutationRequest } from '@/utils/request-security';

const MAX_BODY_BYTES = 1024 * 1024;
const MAX_RECORDS = 5000;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface UserStorageData {
  userId: string;
  solvedSlugs: string[];
  activityRecords: SolvedProblemRecord[];
  updatedAt: string;
}

function getUserDir(): string {
  const directory = path.join(process.cwd(), 'data', 'user-progress');
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  }
  fs.chmodSync(directory, 0o700);
  return directory;
}

function getSafeFilePath(userId: string): string {
  const safeUserId = userId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return path.join(getUserDir(), `${safeUserId}.json`);
}

function getBlobPath(userId: string): string {
  const safeUserId = userId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return `user-progress/${safeUserId}.json`;
}

function emptyUserData(userId: string): UserStorageData {
  return {
    userId,
    solvedSlugs: [],
    activityRecords: [],
    updatedAt: new Date(0).toISOString(),
  };
}

function isSolvedProblemRecord(value: unknown): value is SolvedProblemRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<SolvedProblemRecord>;
  return (
    typeof record.slug === 'string' &&
    SLUG_PATTERN.test(record.slug) &&
    typeof record.solvedAt === 'string' &&
    record.solvedAt.length <= 40 &&
    Number.isFinite(Date.parse(record.solvedAt)) &&
    typeof record.date === 'string' &&
    DATE_PATTERN.test(record.date) &&
    (record.title === undefined || (typeof record.title === 'string' && record.title.length <= 200)) &&
    (record.difficulty === undefined || ['EASY', 'MEDIUM', 'HARD'].includes(record.difficulty))
  );
}

function parseUserData(userId: string, parsed: unknown): UserStorageData {
  if (!parsed || typeof parsed !== 'object') return emptyUserData(userId);

  const stored = parsed as Partial<UserStorageData>;
  return {
    userId,
    solvedSlugs: Array.isArray(stored.solvedSlugs)
      ? stored.solvedSlugs.filter((slug): slug is string => typeof slug === 'string')
      : [],
    activityRecords: Array.isArray(stored.activityRecords)
      ? stored.activityRecords.filter(isSolvedProblemRecord)
      : [],
    updatedAt: typeof stored.updatedAt === 'string' ? stored.updatedAt : new Date(0).toISOString(),
  };
}

async function readUserData(userId: string): Promise<UserStorageData> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await get(getBlobPath(userId), { access: 'private', useCache: false });
      if (!blob || blob.statusCode !== 200) return emptyUserData(userId);
      return parseUserData(userId, JSON.parse(await new Response(blob.stream).text()));
    } catch {
      return emptyUserData(userId);
    }
  }

  const filePath = getSafeFilePath(userId);
  if (!fs.existsSync(filePath)) return emptyUserData(userId);

  try {
    return parseUserData(userId, JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } catch {
    return emptyUserData(userId);
  }
}

async function writeUserData(userId: string, data: UserStorageData): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(getBlobPath(userId), JSON.stringify(data), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return;
  }

  const filePath = getSafeFilePath(userId);
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(data, null, 2), {
    encoding: 'utf8',
    flag: 'wx',
    mode: 0o600,
  });
  fs.renameSync(temporaryPath, filePath);
}

async function readRequestBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) throw new RangeError('Request body too large');

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    throw new RangeError('Request body too large');
  }
  return JSON.parse(rawBody);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(await readUserData(userId), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await readRequestBody(request);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const payload = body as { solvedSlugs?: unknown; activityRecords?: unknown };
    const solvedSlugs = Array.isArray(payload.solvedSlugs)
      ? Array.from(
          new Set(
            payload.solvedSlugs.filter(
              (slug): slug is string => typeof slug === 'string' && SLUG_PATTERN.test(slug)
            )
          )
        ).slice(0, MAX_RECORDS)
      : [];
    const solvedSet = new Set(solvedSlugs);
    const activityRecords = Array.isArray(payload.activityRecords)
      ? payload.activityRecords
          .filter(isSolvedProblemRecord)
          .filter((record) => solvedSet.has(record.slug))
          .slice(0, MAX_RECORDS)
      : [];

    const updatedData: UserStorageData = {
      userId,
      solvedSlugs,
      activityRecords,
      updatedAt: new Date().toISOString(),
    };
    await writeUserData(userId, updatedData);

    return NextResponse.json(
      { success: true, ...updatedData },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Failed to update user progress on server:', error);
    if (error instanceof RangeError) {
      return NextResponse.json({ error: error.message }, { status: 413 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
