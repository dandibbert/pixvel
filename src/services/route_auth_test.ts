import { Hono } from "hono";
import { assertExactJsonEquals as assertEquals } from "./test_asserts.ts";
import {
  createSessionTokenRefreshHandler,
  getRouteSession,
  requireSession,
  type SessionPixivClientDependencies,
} from "./route_auth.ts";
import type { Session } from "./kv_store.ts";

function createSession(overrides: Partial<Session> = {}): Session {
  return {
    userId: "user-1",
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: 123,
    ...overrides,
  };
}

async function readJson(response: Response) {
  return await response.json() as unknown;
}

Deno.test("requireSession rejects requests without a session cookie", async () => {
  const app = new Hono();
  app.get("/", async (c) => {
    const auth = await requireSession(c, {
      getSession: () => Promise.resolve(createSession()),
    });
    if (!auth.ok) return auth.response;
    return c.json({ sessionId: auth.sessionId });
  });

  const response = await app.request("/");

  assertEquals(response.status, 401);
  assertEquals(await readJson(response), { error: "Unauthorized" });
});

Deno.test("requireSession rejects unknown session IDs without leaking session details", async () => {
  const app = new Hono();
  app.get("/", async (c) => {
    const auth = await requireSession(c, {
      getSession: () => Promise.resolve(null),
    });
    if (!auth.ok) return auth.response;
    return c.json({ sessionId: auth.sessionId });
  });

  const response = await app.request("/", {
    headers: {
      Cookie: "session_id=missing-session",
    },
  });

  assertEquals(response.status, 401);
  assertEquals(await readJson(response), { error: "Invalid session" });
});

Deno.test("requireSession returns the session ID and session when authentication succeeds", async () => {
  const app = new Hono();
  const session = createSession();
  app.get("/", async (c) => {
    const auth = await requireSession(c, {
      getSession: (sessionId: string) =>
        Promise.resolve(sessionId === "session-1" ? session : null),
    });
    if (!auth.ok) return auth.response;
    return c.json({
      sessionId: auth.sessionId,
      userId: auth.session.userId,
    });
  });

  const response = await app.request("/", {
    headers: {
      Cookie: "session_id=session-1",
    },
  });

  assertEquals(response.status, 200);
  assertEquals(await readJson(response), {
    sessionId: "session-1",
    userId: "user-1",
  });
});

Deno.test("getRouteSession skips storage lookups when the session cookie is missing", async () => {
  const app = new Hono();
  app.get("/", async (c) => {
    const routeSession = await getRouteSession(c, {
      getSession: () => {
        throw new Error("getSession should not be called");
      },
    });

    return c.json(routeSession);
  });

  const response = await app.request("/");

  assertEquals(response.status, 200);
  assertEquals(await readJson(response), {
    sessionId: null,
    session: null,
  });
});

Deno.test("getRouteSession returns the cookie session ID with a missing session", async () => {
  const app = new Hono();
  app.get("/", async (c) => {
    const routeSession = await getRouteSession(c, {
      getSession: () => Promise.resolve(null),
    });

    return c.json(routeSession);
  });

  const response = await app.request("/", {
    headers: {
      Cookie: "session_id=missing-session",
    },
  });

  assertEquals(response.status, 200);
  assertEquals(await readJson(response), {
    sessionId: "missing-session",
    session: null,
  });
});

Deno.test("getRouteSession returns the matching session", async () => {
  const app = new Hono();
  const session = createSession();
  app.get("/", async (c) => {
    const routeSession = await getRouteSession(c, {
      getSession: (sessionId: string) =>
        Promise.resolve(sessionId === "session-1" ? session : null),
    });

    return c.json({
      sessionId: routeSession.sessionId,
      userId: routeSession.session?.userId,
    });
  });

  const response = await app.request("/", {
    headers: {
      Cookie: "session_id=session-1",
    },
  });

  assertEquals(response.status, 200);
  assertEquals(await readJson(response), {
    sessionId: "session-1",
    userId: "user-1",
  });
});

Deno.test("createSessionTokenRefreshHandler persists refreshed tokens with the existing route expiry window", async () => {
  const updates: unknown[] = [];
  const dependencies: SessionPixivClientDependencies = {
    updateTokens: (sessionId, accessToken, refreshToken, expiresAt) => {
      updates.push({ sessionId, accessToken, refreshToken, expiresAt });
      return Promise.resolve();
    },
    now: () => 1_000,
  };

  const onTokenRefresh = createSessionTokenRefreshHandler("session-1", dependencies);
  await onTokenRefresh("new-access", "new-refresh");

  assertEquals(updates, [
    {
      sessionId: "session-1",
      accessToken: "new-access",
      refreshToken: "new-refresh",
      expiresAt: 3_601_000,
    },
  ]);
});
