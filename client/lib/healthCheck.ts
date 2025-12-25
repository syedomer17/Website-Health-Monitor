import { HealthCheckLog } from '@/types/health';
import { healthStore } from './healthStore';
import { appendHealthCheckLog } from './fileLogger';
import { sendNotificationsDown, sendNotificationsRecovered } from './notifications';

export async function performHealthCheck(url: string): Promise<HealthCheckLog> {
  const timestamp = new Date().toISOString();
  let statusCode = 0;
  let isHealthy = false;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Website-Health-Monitor/1.0',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    statusCode = response.status;
    isHealthy = statusCode === 200 || statusCode === 201;
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Network errors, timeouts, etc.
    statusCode = error.name === 'AbortError' ? 408 : 0;
    isHealthy = false;
  }

  const log: HealthCheckLog = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    url,
    timestamp,
    statusCode,
    isHealthy,
  };

  // Store the log
  healthStore.addLog(log);

  // Append to website file
  try {
    const monitoredUrl = healthStore.getMonitoredUrlByUrl(url);
    if (monitoredUrl) {
      appendHealthCheckLog(monitoredUrl.name || url, {
        timestamp: log.timestamp,
        statusCode: log.statusCode,
        isHealthy: log.isHealthy,
        url: log.url,
      });
    }
  } catch (error) {
    console.error('Failed to append log to file:', error);
    // Continue even if file logging fails
  }

  // Send notifications based on status change (only once per state change)
  try {
    const monitoredUrl = healthStore.getMonitoredUrlByUrl(url);
    if (monitoredUrl) {
      const websiteName = monitoredUrl.name || url;
      
      if (!log.isHealthy) {
        // Check if we should send "down" notification (healthy -> unhealthy)
        if (healthStore.shouldSendDownNotification(url, log.isHealthy)) {
          // Send notifications in background (don't wait for them)
          sendNotificationsDown(websiteName, url, log.statusCode, log.timestamp).catch(
            (error) => console.error('Failed to send down notifications:', error)
          );
        }
      } else {
        // Check if we should send "recovered" notification (unhealthy -> healthy)
        if (healthStore.shouldSendRecoveredNotification(url, log.isHealthy)) {
          // Send notifications in background (don't wait for them)
          sendNotificationsRecovered(websiteName, url, log.statusCode, log.timestamp).catch(
            (error) => console.error('Failed to send recovered notifications:', error)
          );
        }
      }
    }
  } catch (error) {
    console.error('Failed to check notification state:', error);
    // Continue even if notification check fails
  }

  return log;
}

export async function performHealthChecks(urls: string[]): Promise<HealthCheckLog[]> {
  const promises = urls.map(url => performHealthCheck(url));
  return Promise.all(promises);
}

