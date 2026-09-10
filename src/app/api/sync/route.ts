import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { auth } from '@clerk/nextjs/server';
import { isTrustedMutationRequest } from '@/utils/request-security';

const execFileAsync = promisify(execFile);
const SYNC_COOLDOWN_MS = 60_000;
const lastSyncByUser = new Map<string, number>();
let syncInProgress = false;

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const allowedUserIds = (process.env.SYNC_ADMIN_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (allowedUserIds.length === 0) {
    console.error('SYNC_ADMIN_USER_IDS is not configured');
    return NextResponse.json({ error: 'Sync is not configured' }, { status: 503 });
  }
  if (!allowedUserIds.includes(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = Date.now();
  const lastSync = lastSyncByUser.get(userId) || 0;
  if (syncInProgress || now - lastSync < SYNC_COOLDOWN_MS) {
    return NextResponse.json(
      { error: syncInProgress ? 'A sync is already running' : 'Please wait before syncing again' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  syncInProgress = true;
  lastSyncByUser.set(userId, now);
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'sync-data.py');
    await execFileAsync('python3', [scriptPath], {
      cwd: process.cwd(),
      timeout: 120000,
      maxBuffer: 1024 * 1024,
    });

    const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');
    let statusData = {};
    if (fs.existsSync(statusPath)) {
      statusData = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    }

    return NextResponse.json({
      success: true,
      status: statusData,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sync failed',
      },
      { status: 500 }
    );
  } finally {
    syncInProgress = false;
  }
}
