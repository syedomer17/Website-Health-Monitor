// Initialize background task when the module is imported
// This will run when the server starts

if (typeof window === 'undefined') {
  // Only run on server side
  import('./backgroundTask').then(({ startBackgroundHealthChecks }) => {
    startBackgroundHealthChecks();
  });
}

