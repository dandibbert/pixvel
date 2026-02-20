/**
 * Authentication middleware for protected routes
 * Validates session cookie and attaches session data to context
 */

import { Context, Next } from "hono";
import { getCookie } from "hono/helper/cookie/index.ts";

const kv = await Deno.openKv();

export interface Session {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Auth middleware - validates session and attaches to context
 * Usage: app.use("/api/protected/*", authMiddleware)
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    // Get session ID from cookie
    const sessionId = getCookie(c, "session_id");

    if (!sessionId) {
      return c.json({ error: "Unauthorized: No session cookie" }, 401);
    }

    // Retrieve session from Deno KV
    const sessionEntry = await kv.get<Session>(["session", sessionId]);

    if (!sessionEntry.value) {
      return c.json({ error: "Unauthorized: Invalid session" }, 401);
    }

    const session = sessionEntry.value;

    // Check if token is expired
    if (Date.now() >= session.expiresAt) {
      return c.json({ error: "Unauthorized: Token expired" }, 401);
    }

    // Attach session to context
    c.set("session", session);
    c.set("sessionId", sessionId);

    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

/**
 * Helper to get session from context
 * @param c Hono context
 * @returns Session object or undefined
 */
export function getSession(c: Context): Session | undefined {
  return c.get("session");
}
