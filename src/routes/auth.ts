/**
 * Authentication routes - Simplified for refresh_token based auth
 */
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { refreshAccessToken } from "../services/oauth_service.ts";
import { deleteSession, putSession } from "../services/kv_store.ts";
import { logRouteError } from "../services/route_response.ts";

import {
  buildAuthErrorResponse,
  buildAuthRouteErrorResponse,
  buildAuthStatusErrorResponse,
  buildAuthStatusResponse,
  buildLogoutSuccessResponse,
  buildRefreshSuccessResponse,
  buildSessionCookieOptions,
  buildSetupSuccessResponse,
  parseSetupRefreshToken,
} from "../services/auth_model.ts";
import { getRouteSession } from "../services/route_auth.ts";
import { buildTimestampedSessionFromTokenResponse } from "../services/session_model.ts";

const auth = new Hono();

/**
 * POST /api/auth/setup
 * Setup authentication with user-provided refresh_token
 */
auth.post("/setup", async (c) => {
  try {
    const body = await c.req.json();
    const refreshToken = parseSetupRefreshToken(body);

    // Try to refresh token to validate it
    const tokenResponse = await refreshAccessToken(refreshToken);

    // Generate session ID
    const sessionId = crypto.randomUUID();

    await putSession(sessionId, buildTimestampedSessionFromTokenResponse({ tokenResponse }));

    // Set HTTP-only cookie
    setCookie(c, "session_id", sessionId, buildSessionCookieOptions(Deno.env.get("DENO_ENV")));

    return c.json(buildSetupSuccessResponse(tokenResponse));
  } catch (error) {
    const errorResponse = buildAuthRouteErrorResponse(
      error,
      "Invalid refresh_token or authentication failed",
      401,
    );
    logRouteError(errorResponse, "Setup error:", error);
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * POST /api/auth/refresh
 * Manually refresh access token
 */
auth.post("/refresh", async (c) => {
  try {
    const { sessionId, session } = await getRouteSession(c);

    if (!sessionId) {
      return c.json(buildAuthErrorResponse("No session found"), 401);
    }

    if (!session) {
      return c.json(buildAuthErrorResponse("Invalid session"), 401);
    }

    // Refresh tokens
    const tokenResponse = await refreshAccessToken(session.refreshToken);

    const updatedSession = buildTimestampedSessionFromTokenResponse({ tokenResponse });
    await putSession(sessionId, updatedSession);

    return c.json(buildRefreshSuccessResponse(updatedSession));
  } catch (error) {
    const errorResponse = buildAuthRouteErrorResponse(error, "Token refresh failed", 500);
    logRouteError(errorResponse, "Refresh error:", error);
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * GET /api/auth/status
 * Check authentication status
 */
auth.get("/status", async (c) => {
  try {
    const { session } = await getRouteSession(c);
    if (!session) {
      return c.json(buildAuthStatusResponse(null));
    }

    return c.json(buildAuthStatusResponse(session));
  } catch (error) {
    const errorResponse = buildAuthStatusErrorResponse();
    logRouteError(errorResponse, "Status check error:", error);
    return c.json(errorResponse.body);
  }
});

/**
 * POST /api/auth/logout
 * Logout and clear session
 */
auth.post("/logout", async (c) => {
  try {
    const sessionId = getCookie(c, "session_id");

    if (sessionId) {
      await deleteSession(sessionId);
    }

    deleteCookie(c, "session_id");

    return c.json(buildLogoutSuccessResponse());
  } catch (error) {
    const errorResponse = buildAuthRouteErrorResponse(error, "Logout failed", 500);
    logRouteError(errorResponse, "Logout error:", error);
    return c.json(errorResponse.body, errorResponse.status);
  }
});

export default auth;
