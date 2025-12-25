export function initBackgroundTask() {
  if (typeof window === 'undefined') {
    import('./backgroundTask').then(({ startBackgroundHealthChecks }) => {
      startBackgroundHealthChecks();
    });
  }
}
