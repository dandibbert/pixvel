import { Hono } from "hono";
import { assertExactJsonEquals as assertEquals } from "../services/test_asserts.ts";
import { createSessionMiddleware, type SessionEnv } from "./session.ts";
import type { Session } from "../services/kv_store.ts";

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

Deno.test("sessionMiddleware rejects requests without a session cookie", async () => {
  const app = new Hono<SessionEnv>();
  app.use(
    "*",
    createSessionMiddleware({ getSession: () => Promise.resolve(createSession()) }),
  );
  app.get("/", (c) => c.json({ userId: c.get("session").userId }));

  const response = await app.request("/");

  assertEquals(response.status, 401);
  assertEquals(await readJson(response), { error: "Unauthorized" });
});

Deno.test("sessionMiddleware rejects unknown session IDs", async () => {
  const app = new Hono<SessionEnv>();
  app.use("*", createSessionMiddleware({ getSession: () => Promise.resolve(null) }));
  app.get("/", (c) => c.json({ userId: c.get("session").userId }));

  const response = await app.request("/", {
    headers: { Cookie: "session_id=missing-session" },
  });

  assertEquals(response.status, 401);
  assertEquals(await readJson(response), { error: "Invalid session" });
});

Deno.test("sessionMiddleware exposes sessionId and session to downstream handlers", async () => {
  const session = createSession();
  const app = new Hono<SessionEnv>();
  app.use(
    "*",
    createSessionMiddleware({
      getSession: (sessionId: string) =>
        Promise.resolve(sessionId === "session-1" ? session : null),
    }),
  );
  app.get("/", (c) =>
    c.json({
      sessionId: c.get("sessionId"),
      userId: c.get("session").userId,
    }));

  const response = await app.request("/", {
    headers: { Cookie: "session_id=session-1" },
  });

  assertEquals(response.status, 200);
  assertEquals(await readJson(response), {
    sessionId: "session-1",
    userId: "user-1",
  });
});
