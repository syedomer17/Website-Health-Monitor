import { HealthCheckLog, HealthStatus, MonitoredUrl } from '@/types/health';

// In-memory storage (can be replaced with database)
class HealthStore {
  private logs: HealthCheckLog[] = [];
  private monitoredUrls: MonitoredUrl[] = [];

  addLog(log: HealthCheckLog): void {
    this.logs.unshift(log); // Add to beginning for latest-first ordering
    // Keep only last 1000 logs to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }
  }

  getLogs(): HealthCheckLog[] {
    return this.logs;
  }

  getLogsByUrl(url: string): HealthCheckLog[] {
    return this.logs.filter(log => log.url === url);
  }

  getMonitoredUrls(): MonitoredUrl[] {
    return this.monitoredUrls;
  }

  getMonitoredUrlByUrl(url: string): MonitoredUrl | undefined {
    return this.monitoredUrls.find(u => u.url === url);
  }

  addMonitoredUrl(url: MonitoredUrl): void {
    this.monitoredUrls.push(url);
  }

  removeMonitoredUrl(id: string): void {
    this.monitoredUrls = this.monitoredUrls.filter(url => url.id !== id);
  }

  getLatestStatus(url: string): HealthStatus | null {
    const latestLog = this.logs.find(log => log.url === url);
    if (!latestLog) return null;

    return {
      url: latestLog.url,
      lastChecked: latestLog.timestamp,
      statusCode: latestLog.statusCode,
      isHealthy: latestLog.isHealthy,
    };
  }

  getAllStatuses(): HealthStatus[] {
    return this.monitoredUrls.map(monitored => {
      const status = this.getLatestStatus(monitored.url);
      if (status) return status;
      
      return {
        url: monitored.url,
        lastChecked: '',
        statusCode: 0,
        isHealthy: false,
      };
    });
  }

  toggleUrlEnabled(id: string): void {
    const url = this.monitoredUrls.find(u => u.id === id);
    if (url) {
      url.enabled = url.enabled === undefined ? false : !url.enabled;
    }
  }

  isUrlEnabled(url: string): boolean {
    const monitored = this.monitoredUrls.find(u => u.url === url);
    return monitored?.enabled !== false; // Default to true
  }

  // Track last notification state to avoid spamming
  // null = no previous state, true = healthy, false = unhealthy
  private lastNotificationState: Map<string, boolean | null> = new Map();

  // Check if we should send "down" notification (healthy -> unhealthy)
  shouldSendDownNotification(url: string, isHealthy: boolean): boolean {
    const lastState = this.lastNotificationState.get(url);
    
    // Only send notification when status changes from healthy to unhealthy
    if (lastState === true && !isHealthy) {
      this.lastNotificationState.set(url, false);
      return true;
    }
    
    // Update state if it's the first check or state hasn't changed
    if (lastState === null || lastState === isHealthy) {
      this.lastNotificationState.set(url, isHealthy);
    }
    
    return false;
  }

  // Check if we should send "recovered" notification (unhealthy -> healthy)
  shouldSendRecoveredNotification(url: string, isHealthy: boolean): boolean {
    const lastState = this.lastNotificationState.get(url);
    
    // Only send notification when status changes from unhealthy to healthy
    if (lastState === false && isHealthy) {
      this.lastNotificationState.set(url, true);
      return true;
    }
    
    // Update state if it's the first check or state hasn't changed
    if (lastState === null || lastState === isHealthy) {
      this.lastNotificationState.set(url, isHealthy);
    }
    
    return false;
  }

  resetNotificationState(url: string): void {
    this.lastNotificationState.delete(url);
  }
}

// Singleton instance
export const healthStore = new HealthStore();

