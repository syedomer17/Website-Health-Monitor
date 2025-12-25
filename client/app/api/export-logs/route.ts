import { NextResponse } from 'next/server';
import { healthStore } from '@/lib/healthStore';

export async function GET() {
  try {
    const logs = healthStore.getLogs();
    
    // Convert logs to CSV format
    const csvHeader = 'Date,Time,URL,Status Code,Health Status\n';
    const csvRows = logs.map(log => {
      const date = new Date(log.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      const healthStatus = log.isHealthy ? 'Healthy' : 'Unhealthy';
      
      // Escape commas and quotes in CSV
      const escapeCsv = (str: string) => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      return `${escapeCsv(dateStr)},${escapeCsv(timeStr)},${escapeCsv(log.url)},${log.statusCode},${escapeCsv(healthStatus)}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Generate filename with current date
    const now = new Date();
    const filename = `health-monitor-logs-${now.toISOString().split('T')[0]}.csv`;
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to export logs' },
      { status: 500 }
    );
  }
}

