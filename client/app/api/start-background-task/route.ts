import { NextResponse } from 'next/server';
import { startBackgroundHealthChecks } from '@/lib/backgroundTask';

// API route to start the background health check task
export async function POST() {
  try {
    startBackgroundHealthChecks();
    return NextResponse.json({ message: 'Background health check task started' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to start background task' },
      { status: 500 }
    );
  }
}

