import {
  assertJsonEquals as assertEquals,
  assertThrowsError as assertThrows,
} from "./test_asserts.ts";
import {
  buildAuthErrorResponse,
  buildAuthRouteErrorResponse,
  buildAuthSessionErrorResponse,
  buildAuthStatusErrorResponse,
  buildAuthStatusResponse,
  buildLogoutSuccessResponse,
  buildRefreshSuccessResponse,
  buildSessionCookieOptions,
  buildSetupSuccessResponse,
  MissingRefreshTokenError,
  parseSetupRefreshToken,
} from "./auth_model.ts";
import type { Session } from "./kv_store.ts";
import type { TokenResponse } from "./oauth_service.ts";

function createTokenResponse(): TokenResponse {
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
  };
}

function createSession(): Session {
  return {
    userId: "user-1",
    userName: "User name",
    userAccount: "user-account",
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: 3_601_000,
  };
}

Deno.test("parseSetupRefreshToken reads refreshToken from setup request bodies", () => {
  assertEquals(parseSetupRefreshToken({ refreshToken: "refresh-token" }), "refresh-token");
});

Deno.test("parseSetupRefreshToken rejects missing, empty, and non-string refresh tokens", () => {
  assertThrows(() => parseSetupRefreshToken({}), MissingRefreshTokenError);
  assertThrows(() => parseSetupRefreshToken({ refreshToken: "" }), MissingRefreshTokenError);
  assertThrows(() => parseSetupRefreshToken({ refreshToken: 123 }), MissingRefreshTokenError);
  assertThrows(() => parseSetupRefreshToken(null), MissingRefreshTokenError);

  try {
    parseSetupRefreshToken({});
  } catch (error) {
    assertEquals((error as Error).message, "refresh_token is required");
  }
});

Deno.test("buildSessionCookieOptions returns secure production session cookie settings", () => {
  assertEquals(buildSessionCookieOptions("production"), {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 2_592_000,
  });
});

Deno.test("buildSessionCookieOptions keeps local development cookies non-secure", () => {
  assertEquals(buildSessionCookieOptions("development"), {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 2_592_000,
  });
});

Deno.test("buildSetupSuccessResponse returns public setup payload", () => {
  assertEquals(buildSetupSuccessResponse(createTokenResponse()), {
    success: true,
    user: {
      id: "user-1",
      name: "User name",
      account: "user-account",
    },
  });
});

Deno.test("buildRefreshSuccessResponse returns refreshed expiry payload", () => {
  assertEquals(buildRefreshSuccessResponse(createSession()), {
    success: true,
    expiresAt: 3_601_000,
  });
});

Deno.test("buildAuthStatusResponse returns anonymous or authenticated status payloads", () => {
  assertEquals(buildAuthStatusResponse(null), { authenticated: false });
  assertEquals(buildAuthStatusResponse(createSession()), {
    authenticated: true,
    user: {
      id: "user-1",
      name: "User name",
      account: "user-account",
    },
    expiresAt: 3_601_000,
  });
});

Deno.test("buildAuthStatusErrorResponse keeps status checks public and loggable", () => {
  assertEquals(buildAuthStatusErrorResponse(), {
    body: { authenticated: false },
    shouldLog: true,
  });
});

Deno.test("buildAuthErrorResponse wraps auth error messages", () => {
  assertEquals(buildAuthErrorResponse("Invalid session"), {
    error: "Invalid session",
  });
});

Deno.test("buildAuthRouteErrorResponse maps setup validation and fallback failures", () => {
  assertEquals(
    buildAuthRouteErrorResponse(
      new MissingRefreshTokenError(),
      "Invalid refresh_token or authentication failed",
      401,
    ),
    {
      body: { error: "refresh_token is required" },
      status: 400,
      shouldLog: false,
    },
  );

  assertEquals(
    buildAuthRouteErrorResponse(
      new Error("OAuth failed"),
      "Invalid refresh_token or authentication failed",
      401,
    ),
    {
      body: { error: "Invalid refresh_token or authentication failed" },
      status: 401,
      shouldLog: true,
    },
  );
});

Deno.test("buildAuthSessionErrorResponse maps session failure reasons", () => {
  assertEquals(buildAuthSessionErrorResponse("missing"), {
    error: "Unauthorized",
  });
  assertEquals(buildAuthSessionErrorResponse("invalid"), {
    error: "Invalid session",
  });
});

Deno.test("buildLogoutSuccessResponse returns the logout success payload", () => {
  assertEquals(buildLogoutSuccessResponse(), {
    success: true,
  });
});
