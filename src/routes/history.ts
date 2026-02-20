/**
 * Reading history API routes
 */
import { Hono } from "hono";
import { getCookie } from "hono/helper/cookie/index.ts";
import {
  appendHistory,
  getHistory,
  getPosition,
  getSession,
  setPosition,
} from "../services/kv_store.ts";

const history = new Hono();

/**
 * POST /api/history/position
 * Save reading position
 */
history.post("/position", async (c) => {
  try {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await getSession(sessionId);
    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const body = await c.req.json();
    const { novelId, position, title, coverUrl } = body;

    if (!novelId || position === undefined) {
      return c.json({ error: "Missing novelId or position" }, 400);
    }

    // Save position
    await setPosition(session.userId, novelId, position);

    // Update history entry
    if (title && coverUrl) {
      await appendHistory(session.userId, {
        novelId,
        title,
        coverUrl,
        lastReadAt: Date.now(),
        position,
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Save position error:", error);
    return c.json({
      error: "Failed to save position",
      message: (error as Error).message,
    }, 500);
  }
});

/**
 * GET /api/history/position/:id
 * Get reading position for a novel
 */
history.get("/position/:id", async (c) => {
  try {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await getSession(sessionId);
    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const novelId = c.req.param("id");
    if (!novelId) {
      return c.json({ error: "Missing novel ID" }, 400);
    }

    const positionData = await getPosition(session.userId, parseInt(novelId));

    if (!positionData) {
      return c.json({ position: 0, updatedAt: null });
    }

    return c.json(positionData);
  } catch (error) {
    console.error("Get position error:", error);
    return c.json({
      error: "Failed to get position",
      message: (error as Error).message,
    }, 500);
  }
});

/**
 * GET /api/history/novels
 * Get reading history list
 */
history.get("/novels", async (c) => {
  try {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await getSession(sessionId);
    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const limit = parseInt(c.req.query("limit") || "50");
    const entries = await getHistory(session.userId, limit);

    return c.json({ history: entries });
  } catch (error) {
    console.error("Get history error:", error);
    return c.json({
      error: "Failed to get history",
      message: (error as Error).message,
    }, 500);
  }
});

export default history;
