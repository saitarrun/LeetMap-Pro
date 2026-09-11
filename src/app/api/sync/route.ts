import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { auth } from '@clerk/nextjs/server';
import { BlobPreconditionFailedError, del, get, put } from '@vercel/blob';
import { isTrustedMutationRequest } from '@/utils/request-security';

const execFileAsync = promisify(execFile);
const SYNC_COOLDOWN_MS = 10_000;
const SYNC_LOCK_MAX_AGE_MS = 3 * 60_000;
const SYNC_LOCK_PATH = 'system/sync.lock.json';
const SYNC_LAST_ATTEMPT_PATH = 'system/sync-last-attempt.json';
const lastSyncByUser = new Map<string, number>();
let syncInProgress = false;

interface SyncTimestamp {
  timestamp: number;
}

async function readBlobTimestamp(pathname: string): Promise<number> {
  const blob = await get(pathname, { access: 'private', useCache: false });
  if (!blob || blob.statusCode !== 200) return 0;

  try {
    const parsed = JSON.parse(await new Response(blob.stream).text()) as Partial<SyncTimestamp>;
    return typeof parsed.timestamp === 'number' && Number.isFinite(parsed.timestamp) ? parsed.timestamp : 0;
  } catch {
    return 0;
  }
}

async function acquireDistributedSyncLock(now: number): Promise<'acquired' | 'busy' | 'cooldown'> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return 'acquired';

  const lastAttempt = await readBlobTimestamp(SYNC_LAST_ATTEMPT_PATH);
  if (now - lastAttempt < SYNC_COOLDOWN_MS) return 'cooldown';

  const existingLock = await readBlobTimestamp(SYNC_LOCK_PATH);
  if (existingLock && now - existingLock >= SYNC_LOCK_MAX_AGE_MS) {
    await del(SYNC_LOCK_PATH);
  }

  try {
    await put(SYNC_LOCK_PATH, JSON.stringify({ timestamp: now }), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return 'busy';
    throw error;
  }

  await put(SYNC_LAST_ATTEMPT_PATH, JSON.stringify({ timestamp: now }), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
  return 'acquired';
}

async function releaseDistributedSyncLock(): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) await del(SYNC_LOCK_PATH);
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const isCron = Boolean(process.env.CRON_SECRET) && authHeader === `Bearer ${process.env.CRON_SECRET}`;

  let userId: string | null = null;

  if (!isCron) {
    const authSession = await auth();
    userId = authSession.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isTrustedMutationRequest(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isDev = process.env.NODE_ENV === 'development';
    const allowedUserIds = (process.env.SYNC_ADMIN_USER_IDS || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    // In development, allow any authenticated user by default.
    // In production, check allowlist (or allow if '*' is specified).
    const isAllowed =
      isDev ||
      allowedUserIds.includes('*') ||
      allowedUserIds.includes(userId);

    if (!isAllowed) {
      if (allowedUserIds.length === 0) {
        console.error('SYNC_ADMIN_USER_IDS is not configured');
        return NextResponse.json({ error: 'Sync is not configured. Set SYNC_ADMIN_USER_IDS in environment.' }, { status: 503 });
      }
      return NextResponse.json({ error: 'Forbidden: Admin privileges required to trigger sync' }, { status: 403 });
    }
  } else {
    userId = 'cron-system';
  }

  const now = Date.now();
  const lastSync = lastSyncByUser.get(userId) || 0;
  if (syncInProgress || now - lastSync < SYNC_COOLDOWN_MS) {
    return NextResponse.json(
      { error: syncInProgress ? 'A sync is already running' : 'Please wait before syncing again' },
      { status: 429, headers: { 'Retry-After': '10' } }
    );
  }

  let distributedLockAcquired = false;
  try {
    const lockState = await acquireDistributedSyncLock(now);
    if (lockState !== 'acquired') {
      return NextResponse.json(
        { error: lockState === 'busy' ? 'A sync is already running' : 'Please wait before syncing again' },
        { status: 429, headers: { 'Retry-After': lockState === 'busy' ? '180' : '10' } }
      );
    }
    distributedLockAcquired = true;
  } catch (error) {
    console.error('Failed to acquire distributed sync lock:', error);
    return NextResponse.json({ error: 'Sync coordination is temporarily unavailable' }, { status: 503 });
  }

  syncInProgress = true;
  lastSyncByUser.set(userId, now);
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'sync-data.py');
    const { stdout, stderr } = await execFileAsync('python3', [scriptPath], {
      cwd: process.cwd(),
      timeout: 120000,
      maxBuffer: 2 * 1024 * 1024,
    });

    const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');
    let statusData = {};
    if (fs.existsSync(statusPath)) {
      statusData = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    }

    return NextResponse.json({
      success: true,
      status: statusData,
      stdout,
      stderr,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      },
      { status: 500 }
    );
  } finally {
    syncInProgress = false;
    if (distributedLockAcquired) {
      try {
        await releaseDistributedSyncLock();
      } catch (error) {
        console.error('Failed to release distributed sync lock:', error);
      }
    }
  }
}
