import { NextResponse } from 'next/server';
import { healthStore } from '@/lib/healthStore';
import { performHealthCheck } from '@/lib/healthCheck';

// This API route will be called every minute to perform health checks
export async function GET(request: Request) {
  // Optional: Add a secret token to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const monitoredUrls = healthStore.getMonitoredUrls();
    const enabledUrls = monitoredUrls
      .filter(u => u.enabled !== false)
      .map(u => ({ url: u.url, name: u.name || u.url }));

    if (enabledUrls.length === 0) {
      return NextResponse.json({ message: 'No enabled URLs to check' });
    }

    // Perform health checks for all enabled URLs
    const results = await Promise.all(
      enabledUrls.map(async ({ url }) => {
        try {
          const log = await performHealthCheck(url);
          return { url, success: true, statusCode: log.statusCode, isHealthy: log.isHealthy };
        } catch (error: any) {
          console.error(`Failed to check ${url}:`, error);
          return { url, success: false, error: error.message };
        }
      })
    );

    return NextResponse.json({
      message: 'Health checks completed',
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error('Cron health check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform health checks' },
      { status: 500 }
    );
  }
}

