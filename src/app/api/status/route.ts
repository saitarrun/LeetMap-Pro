import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const statusPath = path.join(process.cwd(), 'public', 'data', 'sync-status.json');
    if (fs.existsSync(statusPath)) {
      const data = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
      });
    }
    return NextResponse.json(
      {
        status: 'pending',
        message: 'No sync has been executed yet',
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Failed to read sync status:', error);
    return NextResponse.json(
      { error: 'Failed to read status' },
      { status: 500 }
    );
  }
}
