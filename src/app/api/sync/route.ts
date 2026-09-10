import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'sync-data.py');
    const { stdout, stderr } = await execAsync(`python3 "${scriptPath}"`, {
      cwd: process.cwd(),
      timeout: 120000,
    });

    const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');
    let statusData = {};
    if (fs.existsSync(statusPath)) {
      statusData = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    }

    return NextResponse.json({
      success: true,
      stdout,
      stderr,
      status: statusData,
    });
  } catch (error: any) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Sync failed',
        stdout: error.stdout,
        stderr: error.stderr,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
