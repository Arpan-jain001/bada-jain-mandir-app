import { api } from './api';

/**
 * Silent health check - hits the backend without blocking or showing errors
 * Useful for warming up the server and establishing connection
 */
export const silentHealthCheck = async () => {
  try {
    // Hit the root endpoint silently - fails gracefully
    await Promise.race([
      api.get('/', { timeout: 5000 }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      ),
    ]).catch(() => {
      // Ignore all errors - this is just a health check
    });
  } catch {
    // Silent fail - health check is optional
  }
};
