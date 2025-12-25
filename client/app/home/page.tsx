'use client';

import { useEffect, useState } from 'react';
import { HealthCheckLog } from '@/types/health';
import Navigation from '@/components/Navigation';
import { MonitoredUrl } from '@/types/health';

export default function LiveHealthCheck() {
  const [logs, setLogs] = useState<HealthCheckLog[]>([]);
  const [monitoredUrls, setMonitoredUrls] = useState<MonitoredUrl[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonitoredUrls = async () => {
    try {
      const response = await fetch('/api/monitored-urls');
      const data = await response.json();
      setMonitoredUrls(data);
    } catch (error) {
      console.error('Failed to fetch monitored URLs:', error);
    }
  };

  const performHealthChecks = async () => {
    // Only check enabled URLs
    const enabledUrls = monitoredUrls.filter(u => u.enabled !== false).map(u => u.url);
    if (enabledUrls.length === 0) return;

    try {
      const results = await Promise.all(
        enabledUrls.map(async (url) => {
          const response = await fetch('/api/health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });
          return response.json();
        })
      );

      // Add new logs to the beginning of the array
      setLogs(prev => [...results, ...prev].slice(0, 100)); // Keep last 100 logs
    } catch (error) {
      console.error('Failed to perform health checks:', error);
    }
  };

  useEffect(() => {
    fetchMonitoredUrls();
  }, []);

  useEffect(() => {
    if (monitoredUrls.length > 0) {
      setLoading(false);
      // Perform initial health check
      const performChecks = async () => {
        try {
          // Only check enabled URLs
          const enabledUrls = monitoredUrls.filter(u => u.enabled !== false).map(u => u.url);
          if (enabledUrls.length > 0) {
            const results = await Promise.all(
              enabledUrls.map(async (url) => {
                const response = await fetch('/api/health', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url }),
                });
                return response.json();
              })
            );
            setLogs(prev => [...results, ...prev].slice(0, 100));
          }
        } catch (error) {
          console.error('Failed to perform health checks:', error);
        }
      };
      
      performChecks();
      
      // Set up polling every 1 minute (60 seconds)
      const interval = setInterval(performChecks, 60000);

      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [monitoredUrls]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Create a map of URL to name for display
  const urlToName = new Map(monitoredUrls.map(u => [u.url, u.name || u.url]));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Live Health Check
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time API calls and status updates (updates every 1 minute)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Waiting for health checks to start...
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      API / Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Health Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {urlToName.get(log.url) || log.url}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                          {log.url}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatTime(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          log.isHealthy 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-red-700 dark:text-red-400'
                        }`}>
                          {log.statusCode || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.isHealthy ? (
                          <span className="text-lg" title="Healthy">✅</span>
                        ) : (
                          <span className="text-lg" title="Unhealthy">❌</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

