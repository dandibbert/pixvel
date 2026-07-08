import {
  assertRejectsError,
  assertStrictEquals as assertEquals,
  assertThrowsError,
} from "./test_asserts.ts";
import {
  buildPixivNovelContentWebviewUrl,
  fetchPixivNovelContent,
  NovelContentUnavailableError,
  parsePixivNovelContentHtml,
} from "./novel_content.ts";

function createResponse(body: string, status = 200, statusText = "OK") {
  return new Response(body, { status, statusText });
}

Deno.test("parsePixivNovelContentHtml extracts text from Pixiv webview HTML", () => {
  assertEquals(
    parsePixivNovelContentHtml(
      'window.__DATA__ = { novel: {"text":"本文"},\n  isOwnWork: false };',
    ),
    "本文",
  );
});

Deno.test("parsePixivNovelContentHtml rejects missing or empty novel text", () => {
  const missingTextError = assertThrowsError(
    () => parsePixivNovelContentHtml("no novel json"),
    NovelContentUnavailableError,
  );
  assertEquals(missingTextError.message, "Failed to parse novel content from response");

  const emptyTextError = assertThrowsError(
    () => parsePixivNovelContentHtml('novel: {"text":""},\n  isOwnWork: false'),
    NovelContentUnavailableError,
  );
  assertEquals(emptyTextError.message, "The novel text is empty or unavailable");
});

Deno.test("buildPixivNovelContentWebviewUrl builds the Pixiv novel content URL", () => {
  assertEquals(
    buildPixivNovelContentWebviewUrl(123).toString(),
    "https://app-api.pixiv.net/webview/v2/novel?id=123",
  );
});

Deno.test("fetchPixivNovelContent fetches content with Pixiv app headers", async () => {
  const requested: { url: string; authorization: string | null }[] = [];

  const result = await fetchPixivNovelContent({
    novelId: 123,
    accessToken: "access",
    refreshToken: "refresh",
    fetchFn: (input, init) => {
      requested.push({
        url: input.toString(),
        authorization: new Headers(init?.headers).get("Authorization"),
      });
      return Promise.resolve(createResponse('novel: {"text":"本文"},\n  isOwnWork: false'));
    },
    refreshAccessTokenFn: () => {
      throw new Error("refresh should not run");
    },
    updateTokensFn: () => {
      throw new Error("token update should not run");
    },
  });

  assertEquals(result, "本文");
  assertEquals(
    requested[0].url,
    "https://app-api.pixiv.net/webview/v2/novel?id=123",
  );
  assertEquals(requested[0].authorization, "Bearer access");
});

Deno.test("fetchPixivNovelContent refreshes tokens once on auth failure", async () => {
  const authorizations: string[] = [];
  const persistedTokens: string[] = [];

  const result = await fetchPixivNovelContent({
    novelId: 123,
    accessToken: "old-access",
    refreshToken: "old-refresh",
    sessionId: "session-1",
    now: () => 1_000,
    fetchFn: (_input, init) => {
      authorizations.push(new Headers(init?.headers).get("Authorization") ?? "");
      if (authorizations.length === 1) {
        return Promise.resolve(createResponse("", 401, "Unauthorized"));
      }
      return Promise.resolve(createResponse('novel: {"text":"新本文"},\n  isOwnWork: false'));
    },
    refreshAccessTokenFn: (refreshToken) => {
      assertEquals(refreshToken, "old-refresh");
      return Promise.resolve({
        access_token: "new-access",
        refresh_token: "new-refresh",
        expires_in: 3600,
      });
    },
    updateTokensFn: (_sessionId, accessToken, refreshToken, expiresAt) => {
      persistedTokens.push(`${accessToken}:${refreshToken}:${expiresAt}`);
      return Promise.resolve();
    },
  });

  assertEquals(result, "新本文");
  assertEquals(authorizations.join(","), "Bearer old-access,Bearer new-access");
  assertEquals(persistedTokens.join(","), "new-access:new-refresh:3601000");
});

Deno.test("fetchPixivNovelContent throws HTTP errors after retry", async () => {
  const error = await assertRejectsError(
    () =>
      fetchPixivNovelContent({
        novelId: 123,
        accessToken: "access",
        refreshToken: "refresh",
        fetchFn: () => Promise.resolve(createResponse("", 503, "Service Unavailable")),
        refreshAccessTokenFn: () => {
          throw new Error("refresh should not run");
        },
        updateTokensFn: () => Promise.resolve(),
      }),
    Error,
  );
  assertEquals(error.message, "Pixiv API error (503): Service Unavailable");
});
