/**
 * Session authentication middleware
 *
 * Replaces the per-route `requireSession` boilerplate: mount once per router
 * and read the verified session from context variables in handlers.
 */
import type { Context, Next } from "hono";
import type { Session } from "../services/kv_store.ts";
import { requireSession, type RouteAuthDependencies } from "../services/route_auth.ts";

export interface SessionVariables {
  sessionId: string;
  session: Session;
}

export type SessionEnv = { Variables: SessionVariables };

export function createSessionMiddleware(dependencies?: RouteAuthDependencies) {
  return async (c: Context<SessionEnv>, next: Next) => {
    const auth = dependencies ? await requireSession(c, dependencies) : await requireSession(c);
    if (!auth.ok) return auth.response;

    c.set("sessionId", auth.sessionId);
    c.set("session", auth.session);
    await next();
  };
}

export const sessionMiddleware = createSessionMiddleware();
