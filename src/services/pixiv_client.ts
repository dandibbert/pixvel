/**
 * Pixiv API client with mobile headers and auto-refresh
 */

import { buildPixivHeaders } from "../utils/headers.ts";
import { UPSTREAM_FETCH_TIMEOUT_MS, withRetry } from "../utils/retry.ts";
import { refreshAccessToken } from "./oauth_service.ts";

const PIXIV_API_BASE = "https://app-api.pixiv.net";

interface PixivFetchOptions {
  method?: string;
  body?: Record<string, unknown>;
  accessToken?: string;
}

interface PixivError {
  error?: {
    user_message?: string;
    message?: string;
  };
}

/**
 * Unified Pixiv API request wrapper
 * - Automatically adds mobile headers
 * - Adds filter=for_android query parameter
 * - Handles token refresh on 401/400 OAuth errors
 * - Retries network errors
 * @param endpoint API endpoint (e.g., "/v1/user/detail")
 * @param options Request options
 * @returns JSON response
 */
export async function pixivFetch<T = unknown>(
  endpoint: string,
  options: PixivFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, accessToken } = options;

  // Build URL with filter parameter
  const url = new URL(endpoint, PIXIV_API_BASE);
  url.searchParams.set("filter", "for_android");

  // Build headers
  const headers = buildPixivHeaders(accessToken);

  // Make request with retry logic
  return await withRetry(async () => {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        ...headers,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(UPSTREAM_FETCH_TIMEOUT_MS),
    });

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as PixivError;

      // Check if this is an OAuth error (401 or 400 with OAuth message)
      const isOAuthError = response.status === 401 ||
        (response.status === 400 &&
          (errorData.error?.message?.includes("OAuth") ||
            errorData.error?.message?.includes("invalid_grant")));

      if (isOAuthError) {
        throw new Error("OAuth error: Token expired or invalid");
      }

      // Check for rate limit
      const errorMessage = errorData.error?.user_message || errorData.error?.message ||
        response.statusText;
      throw new Error(`Pixiv API error (${response.status}): ${errorMessage}`);
    }

    return await response.json() as T;
  });
}

/**
 * Refresh this long before expiresAt so in-flight requests never race the
 * actual expiry moment.
 */
export const TOKEN_REFRESH_SKEW_MS = 60_000;

export interface PixivClientOptions {
  /** Epoch ms when the access token expires; enables proactive refresh. */
  expiresAt?: number;
  now?: () => number;
  refreshAccessTokenFn?: typeof refreshAccessToken;
  requestFn?: typeof pixivFetch;
}

/**
 * Pixiv API client with automatic token refresh
 *
 * Refresh strategy:
 * - Proactive: when expiresAt is known and within the skew window, refresh
 *   BEFORE the request — avoids a doomed upstream round trip (request → 401
 *   → refresh → retry) on every call after expiry.
 * - Reactive: on OAuth errors, refresh once and retry (handles revocations
 *   and unknown expiry).
 * Concurrent refreshes are deduplicated onto one in-flight promise.
 */
export class PixivClient {
  private accessToken: string;
  private refreshTokenValue: string;
  private expiresAt?: number;
  private refreshPromise: Promise<void> | null = null;
  private onTokenRefresh?: (
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ) => Promise<void>;
  private now: () => number;
  private refreshAccessTokenFn: typeof refreshAccessToken;
  private requestFn: typeof pixivFetch;

  constructor(
    accessToken: string,
    refreshTokenValue: string,
    onTokenRefresh?: (
      accessToken: string,
      refreshToken: string,
      expiresIn: number,
    ) => Promise<void>,
    options: PixivClientOptions = {},
  ) {
    this.accessToken = accessToken;
    this.refreshTokenValue = refreshTokenValue;
    this.onTokenRefresh = onTokenRefresh;
    this.expiresAt = options.expiresAt;
    this.now = options.now ?? Date.now;
    this.refreshAccessTokenFn = options.refreshAccessTokenFn ?? refreshAccessToken;
    this.requestFn = options.requestFn ?? pixivFetch;
  }

  private isTokenExpiringSoon(): boolean {
    return this.expiresAt !== undefined &&
      this.expiresAt <= this.now() + TOKEN_REFRESH_SKEW_MS;
  }

  /**
   * Refresh tokens, deduplicating concurrent callers onto one upstream call.
   */
  private refreshTokens(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const tokenResponse = await this.refreshAccessTokenFn(this.refreshTokenValue);

        this.accessToken = tokenResponse.access_token;
        this.refreshTokenValue = tokenResponse.refresh_token;
        this.expiresAt = this.now() + tokenResponse.expires_in * 1000;

        if (this.onTokenRefresh) {
          await this.onTokenRefresh(
            tokenResponse.access_token,
            tokenResponse.refresh_token,
            tokenResponse.expires_in,
          );
        }
      })().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  /**
   * Make a request with automatic token refresh on auth errors
   * @param endpoint API endpoint
   * @param options Request options
   * @returns JSON response
   */
  async fetch<T = unknown>(
    endpoint: string,
    options: Omit<PixivFetchOptions, "accessToken"> = {},
  ): Promise<T> {
    if (this.isTokenExpiringSoon()) {
      // Best-effort: if the proactive refresh fails, still attempt the
      // request — the reactive path below surfaces persistent failures.
      await this.refreshTokens().catch(() => {});
    }

    try {
      return await this.requestFn<T>(endpoint, {
        ...options,
        accessToken: this.accessToken,
      });
    } catch (error) {
      const err = error as Error;

      // If OAuth error, try to refresh token once
      if (err.message.includes("OAuth error")) {
        try {
          await this.refreshTokens();

          // Retry the original request with new token
          return await this.requestFn<T>(endpoint, {
            ...options,
            accessToken: this.accessToken,
          });
        } catch (refreshError) {
          throw new Error(
            `Token refresh failed: ${(refreshError as Error).message}`,
          );
        }
      }

      throw error;
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string {
    return this.accessToken;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string {
    return this.refreshTokenValue;
  }
}
