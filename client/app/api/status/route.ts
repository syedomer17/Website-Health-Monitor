import { NextResponse } from 'next/server';
import { healthStore } from '@/lib/healthStore';

export async function GET() {
  try {
    const statuses = healthStore.getAllStatuses();
    return NextResponse.json(statuses);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get statuses' },
      { status: 500 }
    );
  }
}

