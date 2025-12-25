export interface HealthCheckLog {
  id: string;
  url: string;
  timestamp: string;
  statusCode: number;
  isHealthy: boolean;
}

export interface HealthStatus {
  url: string;
  lastChecked: string;
  statusCode: number;
  isHealthy: boolean;
}

export interface MonitoredUrl {
  id: string;
  url: string;
  name?: string;
  enabled?: boolean; // Default to true if not specified
}

