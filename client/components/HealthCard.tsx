'use client';

import { useState } from 'react';
import { HealthStatus, MonitoredUrl } from '@/types/health';
import { getFaviconUrl } from '@/lib/favicon';
import Image from 'next/image';

interface HealthCardProps {
  status: HealthStatus;
  name?: string;
  monitoredUrl?: MonitoredUrl;
  onToggle?: (url: string, enabled: boolean) => void;
}

export default function HealthCard({ status, name, monitoredUrl, onToggle }: HealthCardProps) {
  const [faviconError, setFaviconError] = useState(false);
  const isEnabled = monitoredUrl?.enabled !== false; // Default to true
  
  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const faviconUrl = getFaviconUrl(status.url);

  const handleToggle = async () => {
    if (!monitoredUrl || !onToggle) return;
    const newEnabled = !isEnabled;
    onToggle(monitoredUrl.id, newEnabled);
  };

  return (
    <div className={`rounded-lg border-2 p-6 shadow-md transition-all ${
      !isEnabled 
        ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 opacity-60' 
        : status.isHealthy 
        ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
        : 'border-red-500 bg-red-50 dark:bg-red-950/20'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {!faviconError ? (
                <Image
                  src={faviconUrl}
                  alt={`${name || status.url} favicon`}
                  width={32}
                  height={32}
                  className="rounded"
                  unoptimized
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <div className="w-8 h-8 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">🌐</span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {name || status.url}
              </h3>
            </div>
            {monitoredUrl && (
              <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={isEnabled}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 break-all">
            {status.url}
          </p>
          {!isEnabled && (
            <div className="mt-2 mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                Monitoring Disabled
              </span>
            </div>
          )}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status:
              </span>
              <span className={`text-sm font-bold ${
                status.isHealthy ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {status.statusCode || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Checked:
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatTime(status.lastChecked)}
              </span>
            </div>
          </div>
        </div>
        <div className="ml-4">
          {isEnabled ? (
            <div className={`w-4 h-4 rounded-full pulse-dot ${
              status.isHealthy ? 'bg-green-500' : 'bg-red-500'
            }`} title={status.isHealthy ? 'Healthy' : 'Unhealthy'} />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gray-400" title="Disabled" />
          )}
        </div>
      </div>
    </div>
  );
}

