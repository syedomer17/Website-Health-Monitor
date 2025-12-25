import { NextRequest, NextResponse } from 'next/server';
import { performHealthCheck } from '@/lib/healthCheck';
// Initialize background task on server startup
if (typeof window === 'undefined') {
  import('@/lib/initBackgroundTask');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const log = await performHealthCheck(url);

    return NextResponse.json(log);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to perform health check' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const log = await performHealthCheck(url);

    return NextResponse.json(log);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to perform health check' },
      { status: 500 }
    );
  }
}

