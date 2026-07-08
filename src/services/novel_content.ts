import { updateTokens } from "./kv_store.ts";
import { refreshAccessToken } from "./oauth_service.ts";

export class NovelContentUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NovelContentUnavailableError";
  }
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type RefreshAccessTokenFn = (refreshToken: string) => Promise<TokenResponse>;
type NowFn = () => number;
type UpdateTokensFn = (
  sessionId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
) => Promise<void>;

const PIXIV_WEBVIEW_HEADERS = {
  "User-Agent": "PixivAndroidApp/5.0.234 (Android 11; Pixel 5)",
  "Accept-Language": "zh-CN",
  "App-OS": "android",
  "App-OS-Version": "11",
  "App-Version": "5.0.234",
};

function buildWebviewHeaders(accessToken: string): Record<string, string> {
  return {
    "Authorization": `Bearer ${accessToken}`,
    ...PIXIV_WEBVIEW_HEADERS,
  };
}

export function buildPixivNovelContentWebviewUrl(novelId: number): URL {
  const url = new URL("https://app-api.pixiv.net/webview/v2/novel");
  url.searchParams.set("id", novelId.toString());
  return url;
}

export function parsePixivNovelContentHtml(html: string) {
  const novelRegex = /novel: ({.*?}),\n\s*isOwnWork/;
  const match = html.match(novelRegex);

  if (!match?.[1]) {
    throw new NovelContentUnavailableError("Failed to parse novel content from response");
  }

  const novelJson = JSON.parse(match[1]);

  if (!novelJson.text) {
    throw new NovelContentUnavailableError("The novel text is empty or unavailable");
  }

  return novelJson.text as string;
}

export async function fetchPixivNovelContent({
  novelId,
  accessToken,
  refreshToken,
  sessionId,
  fetchFn = fetch,
  refreshAccessTokenFn = refreshAccessToken,
  updateTokensFn = updateTokens,
  now = Date.now,
}: {
  novelId: number;
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
  fetchFn?: FetchFn;
  refreshAccessTokenFn?: RefreshAccessTokenFn;
  updateTokensFn?: UpdateTokensFn;
  now?: NowFn;
}) {
  const url = buildPixivNovelContentWebviewUrl(novelId);
  let response = await fetchFn(url, { headers: buildWebviewHeaders(accessToken) });

  if (!response.ok && (response.status === 400 || response.status === 401)) {
    if (!sessionId) {
      throw new Error("Session ID is required to refresh novel content access");
    }

    const tokenResponse = await refreshAccessTokenFn(refreshToken);
    await updateTokensFn(
      sessionId,
      tokenResponse.access_token,
      tokenResponse.refresh_token,
      now() + tokenResponse.expires_in * 1000,
    );
    response = await fetchFn(url, { headers: buildWebviewHeaders(tokenResponse.access_token) });
  }

  if (!response.ok) {
    throw new Error(`Pixiv API error (${response.status}): ${response.statusText}`);
  }

  return parsePixivNovelContentHtml(await response.text());
}
