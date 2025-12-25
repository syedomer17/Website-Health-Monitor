'use client';

import { useEffect, useState } from 'react';
import { HealthStatus } from '@/types/health';
import HealthCard from '@/components/HealthCard';
import Navigation from '@/components/Navigation';
import { MonitoredUrl } from '@/types/health';
import AddWebsiteModal from '@/components/AddWebsiteModal';

export default function Dashboard() {
  const [statuses, setStatuses] = useState<HealthStatus[]>([]);
  const [monitoredUrls, setMonitoredUrls] = useState<MonitoredUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
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

  const performHealthChecks = async () => {
    // Only check enabled URLs
    const enabledUrls = monitoredUrls.filter(u => u.enabled !== false).map(u => u.url);
    if (enabledUrls.length === 0) return;

    try {
      // Perform health checks for enabled URLs only
      await Promise.all(
        enabledUrls.map(url => 
          fetch('/api/health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          })
        )
      );
      
      // Then fetch updated statuses
      await fetchStatuses();
    } catch (error) {
      console.error('Failed to perform health checks:', error);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/monitored-urls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });
      
      if (response.ok) {
        // Update local state
        setMonitoredUrls(prev => 
          prev.map(url => url.id === id ? { ...url, enabled } : url)
        );
        // Refresh statuses
        await fetchStatuses();
      }
    } catch (error) {
      console.error('Failed to toggle URL status:', error);
    }
  };

  const handleAddWebsite = async (name: string, url: string) => {
    const response = await fetch('/api/monitored-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name }),
    });

    if (!response.ok) {
      throw new Error('Failed to add website');
    }

    const newUrl = await response.json();
    setMonitoredUrls(prev => [...prev, newUrl]);
    await fetchMonitoredUrls();
    await fetchStatuses();
  };

  const handleCheckNow = async () => {
    setIsChecking(true);
    try {
      await performHealthChecks();
      setCountdown(60);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchMonitoredUrls();
  }, []);

  useEffect(() => {
    if (monitoredUrls.length > 0) {
      fetchStatuses();
      // Perform initial health check
      const performChecks = async () => {
        try {
          // Only check enabled URLs
          const enabledUrls = monitoredUrls.filter(u => u.enabled !== false).map(u => u.url);
          if (enabledUrls.length > 0) {
            await Promise.all(
              enabledUrls.map(url => 
                fetch('/api/health', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url }),
                })
              )
            );
            await fetchStatuses();
            setCountdown(60); // Reset countdown after check
          }
        } catch (error) {
          console.error('Failed to perform health checks:', error);
        }
      };
      
      performChecks();
      
      // Set up polling every 1 minute (60 seconds)
      const interval = setInterval(performChecks, 60000);

      return () => clearInterval(interval);
    }
  }, [monitoredUrls]);

  // Check if any API is enabled
  const hasEnabledUrls = monitoredUrls.some(u => u.enabled !== false);

  // Countdown timer effect - decrements every second (only when APIs are enabled)
  useEffect(() => {
    if (monitoredUrls.length > 0 && !loading && hasEnabledUrls) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 60; // Reset to 60 when it reaches 0 (will be synced by health check)
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (!hasEnabledUrls) {
      // Stop the countdown when all are disabled
      setCountdown(60);
    }
  }, [monitoredUrls, loading, hasEnabledUrls]);

  // Create a map of URL to name and monitored URL for display
  const urlToName = new Map(monitoredUrls.map(u => [u.url, u.name || u.url]));
  const urlToMonitored = new Map(monitoredUrls.map(u => [u.url, u]));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Website Health Monitor
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Real-time monitoring of API and website health status
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!loading && monitoredUrls.length > 0 && hasEnabledUrls && (
                <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Next check in:
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {countdown}s
                  </span>
                </div>
              )}
              {!loading && hasEnabledUrls && (
                <button
                  onClick={handleCheckNow}
                  disabled={isChecking}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isChecking ? 'Checking...' : 'Check Now'}
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Add Website
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : statuses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No monitored URLs configured. Add URLs to start monitoring.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statuses.map((status) => (
              <HealthCard
                key={status.url}
                status={status}
                name={urlToName.get(status.url)}
                monitoredUrl={urlToMonitored.get(status.url)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}

        <AddWebsiteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddWebsite}
        />
      </main>
    </div>
  );
}
