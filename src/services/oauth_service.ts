/**
 * Pixiv OAuth Service - Simplified for refresh_token based auth
 */

import { buildClientTimeHeaders } from "../utils/headers.ts";
import { buildUrlSearchParams } from "./url_search_params.ts";
import { UPSTREAM_FETCH_TIMEOUT_MS } from "../utils/retry.ts";

const PIXIV_TOKEN_URL = "https://oauth.secure.pixiv.net/auth/token";
const CLIENT_ID = "MOBrBDS8blbauoSck0ZfDbtuzpyT";
const CLIENT_SECRET = "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    name: string;
    account: string;
    profile_image_urls: {
      px_16x16: string;
      px_50x50: string;
      px_170x170: string;
    };
  };
}

/**
 * Refresh access token using refresh_token
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const { clientTime, clientHash } = buildClientTimeHeaders();

  const params = buildUrlSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    include_policy: "true",
  });

  const response = await fetch(PIXIV_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "PixivAndroidApp/5.0.166 (Android 10.0; Pixel C)",
      "X-Client-Time": clientTime,
      "X-Client-Hash": clientHash,
      "Accept-Language": "zh-CN",
      "App-OS": "Android",
      "App-OS-Version": "Android 10.0",
      "App-Version": "5.0.166",
    },
    body: params.toString(),
    signal: AbortSignal.timeout(UPSTREAM_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
  }

  return await response.json();
}
