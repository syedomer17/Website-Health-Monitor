import { NextRequest, NextResponse } from 'next/server';
import { healthStore } from '@/lib/healthStore';
import { MonitoredUrl } from '@/types/health';
import { createWebsiteFile } from '@/lib/fileLogger';

export async function GET() {
  try {
    const urls = healthStore.getMonitoredUrls();
    return NextResponse.json(urls);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get monitored URLs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, name } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const newUrl: MonitoredUrl = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      url,
      name: name || url,
      enabled: true, // Enable by default
    };

    healthStore.addMonitoredUrl(newUrl);

    // Create the status file for this website
    try {
      createWebsiteFile(newUrl.name || newUrl.url, newUrl.url);
    } catch (error) {
      console.error('Failed to create website file:', error);
      // Continue even if file creation fails
    }

    return NextResponse.json(newUrl);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add monitored URL' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    healthStore.removeMonitoredUrl(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove monitored URL' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, enabled } = body;

    if (!id || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'ID and enabled (boolean) are required' },
        { status: 400 }
      );
    }

    const urls = healthStore.getMonitoredUrls();
    const url = urls.find(u => u.id === id);
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    url.enabled = enabled;

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update URL status' },
      { status: 500 }
    );
  }
}

