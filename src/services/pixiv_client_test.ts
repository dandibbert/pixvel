import { assertStrictEquals as assertEquals } from "./test_asserts.ts";
import { PixivClient, TOKEN_REFRESH_SKEW_MS } from "./pixiv_client.ts";
import type { TokenResponse } from "./oauth_service.ts";

const NOW = 1_000_000;

function createTokenResponse(overrides: Partial<TokenResponse> = {}): TokenResponse {
  return {
    access_token: "new-access",
    refresh_token: "new-refresh",
    expires_in: 3600,
    user: {
      id: "user-1",
      name: "User",
      account: "user",
      profile_image_urls: { px_16x16: "", px_50x50: "", px_170x170: "" },
    },
    ...overrides,
  };
}

interface ClientHarnessOptions {
  expiresAt?: number;
  refreshFails?: boolean;
  requestFailsWithOAuthErrorOnTokens?: string[];
}

function createClientHarness(options: ClientHarnessOptions = {}) {
  const refreshCalls: string[] = [];
  const requestTokens: string[] = [];
  const persistedTokens: Array<{ accessToken: string; refreshToken: string; expiresIn: number }> =
    [];

  const client = new PixivClient(
    "initial-access",
    "initial-refresh",
    (accessToken, refreshToken, expiresIn) => {
      persistedTokens.push({ accessToken, refreshToken, expiresIn });
      return Promise.resolve();
    },
    {
      expiresAt: options.expiresAt,
      now: () => NOW,
      refreshAccessTokenFn: (refreshToken) => {
        refreshCalls.push(refreshToken);
        if (options.refreshFails) {
          return Promise.reject(new Error("invalid_grant"));
        }
        return Promise.resolve(createTokenResponse());
      },
      requestFn: <T>(_endpoint: string, requestOptions?: { accessToken?: string }) => {
        const token = requestOptions?.accessToken ?? "";
        requestTokens.push(token);
        if (options.requestFailsWithOAuthErrorOnTokens?.includes(token)) {
          return Promise.reject(new Error("OAuth error: Token expired or invalid"));
        }
        return Promise.resolve({ ok: true } as T);
      },
    },
  );

  return { client, refreshCalls, requestTokens, persistedTokens };
}

Deno.test("PixivClient skips refresh when the token is still fresh", async () => {
  const { client, refreshCalls, requestTokens } = createClientHarness({
    expiresAt: NOW + TOKEN_REFRESH_SKEW_MS + 1,
  });

  await client.fetch("/v1/test");

  assertEquals(refreshCalls.length, 0);
  assertEquals(requestTokens.join(","), "initial-access");
});

Deno.test("PixivClient refreshes proactively when the token is inside the skew window", async () => {
  const { client, refreshCalls, requestTokens, persistedTokens } = createClientHarness({
    expiresAt: NOW + TOKEN_REFRESH_SKEW_MS,
  });

  await client.fetch("/v1/test");

  // Refreshed BEFORE the request: exactly one upstream call, with the new token
  assertEquals(refreshCalls.join(","), "initial-refresh");
  assertEquals(requestTokens.join(","), "new-access");
  assertEquals(persistedTokens.length, 1);
  assertEquals(persistedTokens[0].expiresIn, 3600);
});

Deno.test("PixivClient without known expiry keeps the reactive refresh path", async () => {
  const { client, refreshCalls, requestTokens } = createClientHarness({
    requestFailsWithOAuthErrorOnTokens: ["initial-access"],
  });

  const result = await client.fetch<{ ok: boolean }>("/v1/test");

  assertEquals(result.ok, true);
  assertEquals(refreshCalls.join(","), "initial-refresh");
  // First attempt with stale token, retry with refreshed token
  assertEquals(requestTokens.join(","), "initial-access,new-access");
});

Deno.test("PixivClient deduplicates concurrent refreshes onto one upstream call", async () => {
  const { client, refreshCalls } = createClientHarness({
    expiresAt: NOW, // already expired
  });

  await Promise.all([
    client.fetch("/v1/a"),
    client.fetch("/v1/b"),
    client.fetch("/v1/c"),
  ]);

  assertEquals(refreshCalls.length, 1);
});

Deno.test("PixivClient still attempts the request when proactive refresh fails", async () => {
  const { client, requestTokens } = createClientHarness({
    expiresAt: NOW,
    refreshFails: true,
  });

  const result = await client.fetch<{ ok: boolean }>("/v1/test");

  // Proactive refresh failed silently; request proceeded with the old token
  assertEquals(result.ok, true);
  assertEquals(requestTokens.join(","), "initial-access");
});

Deno.test("PixivClient surfaces refresh failure when the reactive path also fails", async () => {
  const { client } = createClientHarness({
    refreshFails: true,
    requestFailsWithOAuthErrorOnTokens: ["initial-access"],
  });

  let thrown: Error | null = null;
  try {
    await client.fetch("/v1/test");
  } catch (error) {
    thrown = error as Error;
  }

  assertEquals(thrown !== null, true);
  assertEquals(thrown!.message.includes("Token refresh failed"), true);
});
