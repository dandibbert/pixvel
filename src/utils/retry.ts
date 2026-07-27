/**
 * Retry logic for network requests
 * - Network errors: retry up to 2 times
 * - Rate limit errors: fail immediately
 * - Other errors: fail immediately
 */

/** Abort upstream fetches that hang; TimeoutError is treated as retryable. */
export const UPSTREAM_FETCH_TIMEOUT_MS = 15_000;

/**
 * Message fragments that indicate a transient network failure.
 * Includes Node-style codes and the shapes Deno's fetch actually throws,
 * e.g. "TypeError: error sending request for url (...): client error (Connect):
 * tcp connect error: Connection refused (os error 61)".
 */
const NETWORK_ERROR_MESSAGE_MARKERS = [
  "fetch",
  "network",
  "econnrefused",
  "etimedout",
  "enotfound",
  "error sending request",
  "tcp connect error",
  "connection refused",
  "connection reset",
  "dns error",
];

/**
 * Determine whether an error is a transient network failure worth retrying.
 * Deno throws TypeError for fetch transport errors and TimeoutError DOMException
 * for AbortSignal.timeout expirations.
 */
export function isRetryableNetworkError(error: Error): boolean {
  if (error.name === "TimeoutError") return true;
  if (error instanceof TypeError) return true;

  const message = error.message.toLowerCase();
  return NETWORK_ERROR_MESSAGE_MARKERS.some((marker) => message.includes(marker));
}

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

      if (!isRetryableNetworkError(lastError) || attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
