// Background task that runs health checks every minute
// This should be initialized when the server starts

let intervalId: NodeJS.Timeout | null = null;
let isRunning = false;

export function startBackgroundHealthChecks() {
  // Prevent multiple instances
  if (isRunning) {
    console.log('Background health check task is already running');
    return;
  }

  // Clear any existing interval
  if (intervalId) {
    clearInterval(intervalId);
  }

  isRunning = true;

  // Perform initial check after a short delay
  setTimeout(() => {
    performHealthCheckTask();
  }, 5000); // Wait 5 seconds after server start

  // Set up interval to run every 1 minute (60000ms)
  intervalId = setInterval(() => {
    performHealthCheckTask();
  }, 60000);

  console.log('Background health check task started (runs every 1 minute)');
}

export function stopBackgroundHealthChecks() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    console.log('Background health check task stopped');
  }
}

async function performHealthCheckTask() {
  try {
    const { healthStore } = await import('./healthStore');
    const { performHealthCheck } = await import('./healthCheck');

    const monitoredUrls = healthStore.getMonitoredUrls();
    const enabledUrls = monitoredUrls
      .filter(u => u.enabled !== false)
      .map(u => u.url);

    if (enabledUrls.length === 0) {
      return;
    }

    // Perform health checks for all enabled URLs
    await Promise.all(
      enabledUrls.map(async (url) => {
        try {
          await performHealthCheck(url);
        } catch (error) {
          console.error(`Background health check failed for ${url}:`, error);
        }
      })
    );
  } catch (error) {
    console.error('Background health check task error:', error);
  }
}

