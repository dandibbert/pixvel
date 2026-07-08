/**
 * Reading history API routes
 */
import { Hono } from "hono";
import { appendHistory, getHistory, getPosition, setPosition } from "../services/kv_store.ts";
import {
  buildHistoryListResponse,
  buildHistoryListRouteRequest,
  buildHistoryPositionErrorResponse,
  buildReadingPositionResponse,
  buildReadingPositionRouteRequest,
  buildTimestampedHistoryPositionUpdate,
} from "../services/history_model.ts";
import { requireSession } from "../services/route_auth.ts";
import {
  buildLoggedRouteErrorResponse,
  buildRouteErrorResponse,
  buildSuccessResponse,
  logRouteError,
} from "../services/route_response.ts";

const history = new Hono();

/**
 * POST /api/history/position
 * Save reading position
 */
history.post("/position", async (c) => {
  try {
    const auth = await requireSession(c);
    if (!auth.ok) return auth.response;

    const body = await c.req.json();
    const update = buildTimestampedHistoryPositionUpdate({ body });

    // Save position
    await setPosition(auth.session.userId, update.novelId, update.position, update.updatedAt);

    // Update history entry
    if (update.historyEntry) {
      await appendHistory(auth.session.userId, update.historyEntry);
    }

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
    const auth = await requireSession(c);
    if (!auth.ok) return auth.response;

    const positionRequest = buildReadingPositionRouteRequest({
      novelId: c.req.param("id"),
    });
    const positionData = await getPosition(auth.session.userId, positionRequest.novelId);

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
    const auth = await requireSession(c);
    if (!auth.ok) return auth.response;

    const historyRequest = buildHistoryListRouteRequest({
      limit: c.req.query("limit"),
    });
    const entries = await getHistory(auth.session.userId, historyRequest.limit);

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
