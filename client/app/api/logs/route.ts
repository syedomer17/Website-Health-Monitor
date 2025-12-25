import { NextRequest, NextResponse } from 'next/server';
import { healthStore } from '@/lib/healthStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    let logs;
    if (url) {
      logs = healthStore.getLogsByUrl(url);
    } else {
      logs = healthStore.getLogs();
    }

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get logs' },
      { status: 500 }
    );
  }
}

