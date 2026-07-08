import type { Context } from "hono";
import { getCookie } from "hono/helper/cookie/index.ts";
import { buildAuthSessionErrorResponse } from "./auth_model.ts";
import type { Session } from "./kv_store.ts";
import { getSession, updateTokens } from "./kv_store.ts";
import { PixivClient } from "./pixiv_client.ts";

const ACCESS_TOKEN_TTL_MS = 3600 * 1000;

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
  return async (accessToken: string, refreshToken: string) => {
    await dependencies.updateTokens(
      sessionId,
      accessToken,
      refreshToken,
      dependencies.now() + ACCESS_TOKEN_TTL_MS,
    );
  };
}

export function createSessionPixivClient(sessionId: string, session: Session) {
  return new PixivClient(
    session.accessToken,
    session.refreshToken,
    createSessionTokenRefreshHandler(sessionId),
  );
}
