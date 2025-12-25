'use client';

import { useEffect, useState } from 'react';
import { HealthCheckLog } from '@/types/health';
import Navigation from '@/components/Navigation';
import { MonitoredUrl } from '@/types/health';
import { getFaviconUrl } from '@/lib/favicon';
import Image from 'next/image';

export default function Logs() {
  const [logs, setLogs] = useState<HealthCheckLog[]>([]);
  const [monitoredUrls, setMonitoredUrls] = useState<MonitoredUrl[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitoredUrls = async () => {
    try {
      const response = await fetch('/api/monitored-urls');
      const data = await response.json();
      setMonitoredUrls(data);
    } catch (error) {
      console.error('Failed to fetch monitored URLs:', error);
    }
  };

  useEffect(() => {
    fetchMonitoredUrls();
    fetchLogs();
  }, []);

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/export-logs');
      if (!response.ok) throw new Error('Failed to export logs');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-monitor-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export logs:', error);
      alert('Failed to export logs. Please try again.');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      full: date.toLocaleString(),
    };
  };

  // Group logs by URL and limit to 10 latest per URL
  const logsByUrl = new Map<string, HealthCheckLog[]>();
  logs.forEach(log => {
    if (!logsByUrl.has(log.url)) {
      logsByUrl.set(log.url, []);
    }
    logsByUrl.get(log.url)!.push(log);
  });
  
  // Limit each URL's logs to 10 latest entries
  logsByUrl.forEach((urlLogs, url) => {
    logsByUrl.set(url, urlLogs.slice(0, 10));
  });

  // Create a map of URL to name for display
  const urlToName = new Map(monitoredUrls.map(u => [u.url, u.name || u.url]));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                History & Logs
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Latest 10 health check logs per API grouped by website (ordered latest first)
              </p>
            </div>
            {logs.length > 0 && (
              <button
                onClick={handleExportLogs}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                📥 Export Logs
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : logsByUrl.size === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No logs available yet. Health checks will appear here once they start.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(logsByUrl.entries()).map(([url, urlLogs]) => {
              const name = urlToName.get(url) || url;
              const faviconUrl = getFaviconUrl(url);
              
              return (
                <ApiLogTable
                  key={url}
                  url={url}
                  name={name}
                  faviconUrl={faviconUrl}
                  logs={urlLogs}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function ApiLogTable({ url, name, faviconUrl, logs }: { url: string; name: string; faviconUrl: string; logs: HealthCheckLog[] }) {
  const [faviconError, setFaviconError] = useState(false);
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      full: date.toLocaleString(),
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-3">
          {!faviconError ? (
            <Image
              src={faviconUrl}
              alt={`${name} favicon`}
              width={24}
              height={24}
              className="rounded"
              unoptimized
              onError={() => setFaviconError(true)}
            />
          ) : (
            <div className="w-6 h-6 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">🌐</span>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
              {url}
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Time
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
            {logs.map((log) => {
              const timeInfo = formatTime(log.timestamp);
              return (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {timeInfo.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {timeInfo.time}
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
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full pulse-dot ${
                        log.isHealthy ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {log.isHealthy ? 'Healthy' : 'Unhealthy'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

