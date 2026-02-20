/**
 * Authentication routes - Simplified for refresh_token based auth
 */
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/helper/cookie/index.ts";
import { refreshAccessToken } from "../services/oauth_service.ts";

const auth = new Hono();
const kv = await Deno.openKv();

/**
 * POST /api/auth/setup
 * Setup authentication with user-provided refresh_token
 */
auth.post("/setup", async (c) => {
  try {
    const body = await c.req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return c.json({ error: "refresh_token is required" }, 400);
    }

    // Try to refresh token to validate it
    const tokenResponse = await refreshAccessToken(refreshToken);

    // Generate session ID
    const sessionId = crypto.randomUUID();

    // Store session in KV
    await kv.set(["session", sessionId], {
      userId: tokenResponse.user.id,
      userName: tokenResponse.user.name,
      userAccount: tokenResponse.user.account,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    });

    // Set HTTP-only cookie
    setCookie(c, "session_id", sessionId, {
      httpOnly: true,
      secure: Deno.env.get("DENO_ENV") === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return c.json({
      success: true,
      user: {
        id: tokenResponse.user.id,
        name: tokenResponse.user.name,
        account: tokenResponse.user.account,
      },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return c.json({ error: "Invalid refresh_token or authentication failed" }, 401);
  }
});

/**
 * POST /api/auth/refresh
 * Manually refresh access token
 */
auth.post("/refresh", async (c) => {
  try {
    const sessionId = getCookie(c, "session_id");

    if (!sessionId) {
      return c.json({ error: "No session found" }, 401);
    }

    // Retrieve session from KV
    const sessionEntry = await kv.get<{
      userId: string;
      userName: string;
      userAccount: string;
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    }>(["session", sessionId]);

    if (!sessionEntry.value) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const { refreshToken: oldRefreshToken } = sessionEntry.value;

    // Refresh tokens
    const tokenResponse = await refreshAccessToken(oldRefreshToken);

    // Update session in KV
    await kv.set(["session", sessionId], {
      userId: tokenResponse.user.id,
      userName: tokenResponse.user.name,
      userAccount: tokenResponse.user.account,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    });

    return c.json({
      success: true,
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return c.json({ error: "Token refresh failed" }, 500);
  }
});

/**
 * GET /api/auth/status
 * Check authentication status
 */
auth.get("/status", async (c) => {
  try {
    const sessionId = getCookie(c, "session_id");

    if (!sessionId) {
      return c.json({ authenticated: false });
    }

    const sessionEntry = await kv.get<{
      userId: string;
      userName: string;
      userAccount: string;
      expiresAt: number;
    }>(["session", sessionId]);

    if (!sessionEntry.value) {
      return c.json({ authenticated: false });
    }

    return c.json({
      authenticated: true,
      user: {
        id: sessionEntry.value.userId,
        name: sessionEntry.value.userName,
        account: sessionEntry.value.userAccount,
      },
      expiresAt: sessionEntry.value.expiresAt,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return c.json({ authenticated: false });
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
      await kv.delete(["session", sessionId]);
    }

    deleteCookie(c, "session_id");

    return c.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ error: "Logout failed" }, 500);
  }
});

export default auth;
