import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { buildAuthSessionErrorResponse } from "./auth_model.ts";
import type { Session } from "./kv_store.ts";
import { getSession, updateTokens } from "./kv_store.ts";
import { PixivClient } from "./pixiv_client.ts";

/** Fallback when Pixiv's response omits expires_in; matches its historical 1h TTL. */
const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 3600;

export interface RouteAuthDependencies {
  getSession: (sessionId: string) => Promise<Session | null>;
}

export interface RouteSessionLookup {
  sessionId: string | null;
  session: Session | null;
}

export interface SessionPixivClientDependencies {
  updateTokens: (
    sessionId: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
  ) => Promise<void>;
  now: () => number;
}

export type RouteAuthResult =
  | {
    ok: true;
    sessionId: string;
    session: Session;
  }
  | {
    ok: false;
    response: Response;
  };

export async function requireSession(
  c: Context,
  dependencies: RouteAuthDependencies = { getSession },
): Promise<RouteAuthResult> {
  const { sessionId, session } = await getRouteSession(c, dependencies);
  if (!sessionId) {
    return {
      ok: false,
      response: c.json(buildAuthSessionErrorResponse("missing"), 401),
    };
  }

  if (!session) {
    return {
      ok: false,
      response: c.json(buildAuthSessionErrorResponse("invalid"), 401),
    };
  }

  return {
    ok: true,
    sessionId,
    session,
  };
}

export async function getRouteSession(
  c: Context,
  dependencies: RouteAuthDependencies = { getSession },
): Promise<RouteSessionLookup> {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId) {
    return {
      sessionId: null,
      session: null,
    };
  }

  return {
    sessionId,
    session: await dependencies.getSession(sessionId),
  };
}

export function createSessionTokenRefreshHandler(
  sessionId: string,
  dependencies: SessionPixivClientDependencies = {
    updateTokens,
    now: Date.now,
  },
) {
  return async (accessToken: string, refreshToken: string, expiresIn?: number) => {
    const ttlSeconds = expiresIn ?? DEFAULT_ACCESS_TOKEN_TTL_SECONDS;
    await dependencies.updateTokens(
      sessionId,
      accessToken,
      refreshToken,
      dependencies.now() + ttlSeconds * 1000,
    );
  };
}

export function createSessionPixivClient(sessionId: string, session: Session) {
  return new PixivClient(
    session.accessToken,
    session.refreshToken,
    createSessionTokenRefreshHandler(sessionId),
    // Known expiry enables proactive refresh before doomed upstream calls
    { expiresAt: session.expiresAt },
  );
}
