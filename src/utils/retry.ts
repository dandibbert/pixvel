/**
 * Retry logic for network requests
 * - Network errors: retry up to 2 times
 * - Rate limit errors: fail immediately
 * - Other errors: fail immediately
 */

/**
 * Wrap a function with retry logic
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries (default: 2)
 * @returns Result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if this is a rate limit error (contains "Limit" in message)
      if (lastError.message.includes("Limit")) {
        throw lastError; // Don't retry rate limit errors
      }

      // Check if we should retry (network errors only)
      const isNetworkError = lastError.message.includes("fetch") ||
        lastError.message.includes("network") ||
        lastError.message.includes("ECONNREFUSED") ||
        lastError.message.includes("ETIMEDOUT") ||
        lastError.message.includes("ENOTFOUND");

      if (!isNetworkError || attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
