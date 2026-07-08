import { assertExactJsonEquals as assertEquals } from "./test_asserts.ts";
import {
  applySessionTokenRefresh,
  buildPublicUserFromSession,
  buildPublicUserFromTokenResponse,
  buildSessionFromTokenResponse,
  buildTimestampedSessionFromTokenResponse,
} from "./session_model.ts";
import type { TokenResponse } from "./oauth_service.ts";
import type { Session } from "./kv_store.ts";

function createTokenResponse(overrides: Partial<TokenResponse> = {}): TokenResponse {
  return {
    access_token: "access-token",
    refresh_token: "refresh-token",
    expires_in: 3600,
    user: {
      id: "user-1",
      name: "User name",
      account: "user-account",
      profile_image_urls: {
        px_16x16: "16.jpg",
        px_50x50: "50.jpg",
        px_170x170: "170.jpg",
      },
    },
    ...overrides,
  };
}

Deno.test("buildSessionFromTokenResponse creates the stored session shape from OAuth response", () => {
  assertEquals(buildSessionFromTokenResponse(createTokenResponse(), 1_000), {
    userId: "user-1",
    userName: "User name",
    userAccount: "user-account",
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: 3_601_000,
  });
});

Deno.test("buildTimestampedSessionFromTokenResponse uses the injected clock for session expiry", () => {
  assertEquals(
    buildTimestampedSessionFromTokenResponse({
      tokenResponse: createTokenResponse(),
      now: () => 1_000,
    }),
    {
      userId: "user-1",
      userName: "User name",
      userAccount: "user-account",
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresAt: 3_601_000,
    },
  );
});

Deno.test("buildPublicUserFromTokenResponse returns the auth response user payload", () => {
  assertEquals(buildPublicUserFromTokenResponse(createTokenResponse()), {
    id: "user-1",
    name: "User name",
    account: "user-account",
  });
});

Deno.test("buildPublicUserFromSession returns status user fields from the stored session", () => {
  const session: Session = {
    userId: "user-1",
    userName: "User name",
    userAccount: "user-account",
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: 3_601_000,
  };

  assertEquals(buildPublicUserFromSession(session), {
    id: "user-1",
    name: "User name",
    account: "user-account",
  });
});

Deno.test("applySessionTokenRefresh returns an updated session without mutating the original", () => {
  const session: Session = {
    userId: "user-1",
    userName: "User name",
    userAccount: "user-account",
    accessToken: "old-access-token",
    refreshToken: "old-refresh-token",
    expiresAt: 1_000,
  };

  const updatedSession = applySessionTokenRefresh(session, {
    accessToken: "new-access-token",
    refreshToken: "new-refresh-token",
    expiresAt: 2_000,
  });

  assertEquals(updatedSession, {
    userId: "user-1",
    userName: "User name",
    userAccount: "user-account",
    accessToken: "new-access-token",
    refreshToken: "new-refresh-token",
    expiresAt: 2_000,
  });
  assertEquals(session, {
    userId: "user-1",
    userName: "User name",
    userAccount: "user-account",
    accessToken: "old-access-token",
    refreshToken: "old-refresh-token",
    expiresAt: 1_000,
  });
});
