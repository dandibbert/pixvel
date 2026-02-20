/**
 * Pixiv API client with mobile headers and auto-refresh
 */

import { buildPixivHeaders } from "../utils/headers.ts";
import { withRetry } from "../utils/retry.ts";
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
 * Pixiv API client with automatic token refresh
 */
export class PixivClient {
  private accessToken: string;
  private refreshTokenValue: string;
  private onTokenRefresh?: (accessToken: string, refreshToken: string) => Promise<void>;

  constructor(
    accessToken: string,
    refreshTokenValue: string,
    onTokenRefresh?: (accessToken: string, refreshToken: string) => Promise<void>,
  ) {
    this.accessToken = accessToken;
    this.refreshTokenValue = refreshTokenValue;
    this.onTokenRefresh = onTokenRefresh;
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
    try {
      return await pixivFetch<T>(endpoint, {
        ...options,
        accessToken: this.accessToken,
      });
    } catch (error) {
      const err = error as Error;

      // If OAuth error, try to refresh token once
      if (err.message.includes("OAuth error")) {
        try {
          const tokenResponse = await refreshAccessToken(this.refreshTokenValue);

          // Update tokens
          this.accessToken = tokenResponse.access_token;
          this.refreshTokenValue = tokenResponse.refresh_token;

          // Notify callback
          if (this.onTokenRefresh) {
            await this.onTokenRefresh(
              tokenResponse.access_token,
              tokenResponse.refresh_token,
            );
          }

          // Retry the original request with new token
          return await pixivFetch<T>(endpoint, {
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
