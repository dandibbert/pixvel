/**
 * Bookmarks API routes
 */
import { Hono } from "hono";
import {
  buildBookmarkAddApiPath,
  buildBookmarkAddRequest,
  buildBookmarkDeleteApiPath,
  buildBookmarkDeleteRequest,
  buildBookmarkedNovelsApiPath,
  buildBookmarkedNovelsRequest,
  buildBookmarkedNovelsResponse,
} from "../services/bookmark_model.ts";
import { type SessionEnv, sessionMiddleware } from "../middleware/session.ts";
import { type PixivNovelSummaryPayload } from "../services/novel_transformer.ts";
import { createSessionPixivClient } from "../services/route_auth.ts";
import { buildLoggedRouteErrorResponse, buildSuccessResponse } from "../services/route_response.ts";

const bookmarks = new Hono<SessionEnv>();

bookmarks.use("*", sessionMiddleware);

/**
 * POST /api/bookmarks/novel
 * Bookmark a novel
 */
bookmarks.post("/novel", async (c) => {
  try {
    const body = await c.req.json();
    const bookmarkRequest = buildBookmarkAddRequest(body);
    const client = createSessionPixivClient(c.get("sessionId"), c.get("session"));

    // Call Pixiv API to add bookmark
    await client.fetch(buildBookmarkAddApiPath(), {
      method: "POST",
      body: bookmarkRequest.payload,
    });

    return c.json(buildSuccessResponse());
  } catch (error) {
    const errorResponse = buildLoggedRouteErrorResponse(
      error,
      "Failed to bookmark novel",
      "Bookmark novel error:",
    );
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * DELETE /api/bookmarks/novel/:id
 * Remove bookmark from a novel
 */
bookmarks.delete("/novel/:id", async (c) => {
  try {
    const novelId = c.req.param("id");
    const bookmarkRequest = buildBookmarkDeleteRequest(novelId);
    const client = createSessionPixivClient(c.get("sessionId"), c.get("session"));

    // Call Pixiv API to delete bookmark
    await client.fetch(buildBookmarkDeleteApiPath(), {
      method: "POST",
      body: bookmarkRequest.payload,
    });

    return c.json(buildSuccessResponse());
  } catch (error) {
    const errorResponse = buildLoggedRouteErrorResponse(
      error,
      "Failed to delete bookmark",
      "Delete bookmark error:",
    );
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * GET /api/bookmarks/novels
 * Get user's bookmarked novels
 */
bookmarks.get("/novels", async (c) => {
  try {
    const session = c.get("session");
    const bookmarksRequest = buildBookmarkedNovelsRequest({
      userId: session.userId,
      restrict: c.req.query("restrict"),
      page: c.req.query("page"),
    });

    const client = createSessionPixivClient(c.get("sessionId"), session);

    // Call Pixiv API
    const response = await client.fetch<{
      novels: PixivNovelSummaryPayload[];
      next_url: string | null;
    }>(buildBookmarkedNovelsApiPath(bookmarksRequest.params));

    return c.json(buildBookmarkedNovelsResponse({
      novels: response.novels,
      nextUrl: response.next_url,
    }));
  } catch (error) {
    const errorResponse = buildLoggedRouteErrorResponse(
      error,
      "Failed to get bookmarks",
      "Get bookmarks error:",
    );
    return c.json(errorResponse.body, errorResponse.status);
  }
});

export default bookmarks;
