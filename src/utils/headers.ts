/**
 * Pixiv mobile app headers generator
 */
import { calcClientHash } from "./md5.ts";

/**
 * Build the X-Client-Time / X-Client-Hash pair Pixiv uses to authenticate
 * mobile clients. Time is ISO 8601 with a +00:00 suffix.
 */
export function buildClientTimeHeaders(): { clientTime: string; clientHash: string } {
  const clientTime = new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00");
  return { clientTime, clientHash: calcClientHash(clientTime) };
}

/**
 * Build Pixiv mobile app headers
 * @param accessToken Optional access token for authenticated requests
 * @returns Headers object for Pixiv API requests
 */
export function buildPixivHeaders(accessToken?: string): Record<string, string> {
  const { clientTime, clientHash } = buildClientTimeHeaders();

  const headers: Record<string, string> = {
    "X-Client-Time": clientTime,
    "X-Client-Hash": clientHash,
    "User-Agent": "PixivAndroidApp/5.0.166 (Android 10.0; Pixel C)",
    "App-OS": "Android",
    "App-OS-Version": "Android 10.0",
    "App-Version": "5.0.166",
    "Accept-Language": "zh-CN",
    "Host": "app-api.pixiv.net",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}
