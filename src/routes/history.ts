/**
 * Reading history API routes
 */
import { Hono } from "hono";
import { getHistory, getPosition, savePositionWithHistory } from "../services/kv_store.ts";
import { type SessionEnv, sessionMiddleware } from "../middleware/session.ts";
import {
  buildHistoryListResponse,
  buildHistoryListRouteRequest,
  buildHistoryPositionErrorResponse,
  buildReadingPositionResponse,
  buildReadingPositionRouteRequest,
  buildTimestampedHistoryPositionUpdate,
} from "../services/history_model.ts";
import {
  buildLoggedRouteErrorResponse,
  buildRouteErrorResponse,
  buildSuccessResponse,
  logRouteError,
} from "../services/route_response.ts";

const history = new Hono<SessionEnv>();

history.use("*", sessionMiddleware);

/**
 * POST /api/history/position
 * Save reading position
 */
history.post("/position", async (c) => {
  try {
    const session = c.get("session");

    const body = await c.req.json();
    const update = buildTimestampedHistoryPositionUpdate({ body });

    // Save position and history entry atomically in a single KV commit
    await savePositionWithHistory(
      session.userId,
      update.novelId,
      update.position,
      update.updatedAt,
      update.historyEntry ?? undefined,
    );

    return c.json(buildSuccessResponse());
  } catch (error) {
    const errorResponse = buildHistoryPositionErrorResponse(error) ??
      buildRouteErrorResponse(error, "Failed to save position");
    logRouteError(errorResponse, "Save position error:", error);
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * GET /api/history/position/:id
 * Get reading position for a novel
 */
history.get("/position/:id", async (c) => {
  try {
    const session = c.get("session");

    const positionRequest = buildReadingPositionRouteRequest({
      novelId: c.req.param("id"),
    });
    const positionData = await getPosition(session.userId, positionRequest.novelId);

    return c.json(buildReadingPositionResponse(positionData));
  } catch (error) {
    const errorResponse = buildLoggedRouteErrorResponse(
      error,
      "Failed to get position",
      "Get position error:",
    );
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * GET /api/history/novels
 * Get reading history list
 */
history.get("/novels", async (c) => {
  try {
    const session = c.get("session");

    const historyRequest = buildHistoryListRouteRequest({
      limit: c.req.query("limit"),
    });
    const entries = await getHistory(session.userId, historyRequest.limit);

    return c.json(buildHistoryListResponse(entries));
  } catch (error) {
    const errorResponse = buildLoggedRouteErrorResponse(
      error,
      "Failed to get history",
      "Get history error:",
    );
    return c.json(errorResponse.body, errorResponse.status);
  }
});

export default history;
