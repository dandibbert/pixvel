import type { Session } from "./kv_store.ts";
import type { TokenResponse } from "./oauth_service.ts";
import { buildPublicUserFromSession, buildPublicUserFromTokenResponse } from "./session_model.ts";

const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export class MissingRefreshTokenError extends Error {
  constructor() {
    super("refresh_token is required");
    this.name = "MissingRefreshTokenError";
  }
}

export function parseSetupRefreshToken(body: unknown): string {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new MissingRefreshTokenError();
  }

  const refreshToken = (body as Record<string, unknown>).refreshToken;
  if (typeof refreshToken !== "string" || refreshToken.length === 0) {
    throw new MissingRefreshTokenError();
  }

  return refreshToken;
}

export function buildSessionCookieOptions(environment: string | undefined) {
  return {
    httpOnly: true,
    secure: environment === "production",
    sameSite: "Lax" as const,
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  };
}

export function buildSetupSuccessResponse(tokenResponse: TokenResponse) {
  return {
    success: true,
    user: buildPublicUserFromTokenResponse(tokenResponse),
  };
}

export function buildLogoutSuccessResponse() {
  return {
    success: true,
  };
}

export function buildAuthErrorResponse(message: string) {
  return {
    error: message,
  };
}

export function buildAuthRouteErrorResponse(
  error: unknown,
  fallbackMessage: string,
  fallbackStatus: 401 | 500,
) {
  if (error instanceof MissingRefreshTokenError) {
    return {
      body: buildAuthErrorResponse(error.message),
      status: 400 as const,
      shouldLog: false,
    };
  }

  return {
    body: buildAuthErrorResponse(fallbackMessage),
    status: fallbackStatus,
    shouldLog: true,
  };
}

export function buildAuthSessionErrorResponse(reason: "missing" | "invalid") {
  return buildAuthErrorResponse(reason === "missing" ? "Unauthorized" : "Invalid session");
}

export function buildRefreshSuccessResponse(session: Session) {
  return {
    success: true,
    expiresAt: session.expiresAt,
  };
}

export function buildAuthStatusResponse(session: Session | null) {
  if (!session) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    user: buildPublicUserFromSession(session),
    expiresAt: session.expiresAt,
  };
}

export function buildAuthStatusErrorResponse() {
  return {
    body: buildAuthStatusResponse(null),
    shouldLog: true,
  };
}
