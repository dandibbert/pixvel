/**
 * Novel API routes
 */
import { Hono } from "hono";
import { fetchPixivNovelContent } from "../services/novel_content.ts";
import { buildNovelContentErrorResponse } from "../services/novel_content_model.ts";
import { buildNovelSearchErrorResponse } from "../services/novel_search_params.ts";
import { buildNovelSearchResponse } from "../services/novel_search.ts";
import {
  type PixivNovelDetailPayload,
  type PixivNovelSummaryPayload,
  transformPixivNovelDetail,
} from "../services/novel_transformer.ts";
import {
  buildSeriesNovelListResponse,
  buildUserNovelListResponse,
} from "../services/novel_list.ts";
import { resolvePixivNovelSeriesCached } from "../services/novel_series.ts";
import {
  buildNovelContentSuccessBody,
  buildNovelDetailApiPath,
  buildNovelDetailRouteRequest,
  buildNovelSearchApiPath,
  buildNovelSearchRouteRequest,
  buildNovelSeriesResolveRouteRequest,
  buildSeriesNovelListRouteRequest,
  buildSeriesNovelsApiPath,
  buildUserNovelListRouteRequest,
  buildUserNovelsApiPath,
  NOVEL_SERIES_CACHE_HEADERS,
} from "../services/novel_route_model.ts";
import { type SessionEnv, sessionMiddleware } from "../middleware/session.ts";
import { createSessionPixivClient } from "../services/route_auth.ts";
import {
  buildLoggedRouteErrorResponse,
  buildRoutePublicErrorResponse,
  logRouteError,
} from "../services/route_response.ts";

const novels = new Hono<SessionEnv>();

novels.use("*", sessionMiddleware);

/**
 * GET /api/novels/search
 * Search novels with filters
 */
novels.get("/search", async (c) => {
  try {
    const searchRequest = buildNovelSearchRouteRequest((name) => c.req.query(name));
    const client = createSessionPixivClient(c.get("sessionId"), c.get("session"));

    const response = await client.fetch<{
      novels: PixivNovelSummaryPayload[];
      next_url: string | null;
      search_span_limit: number;
    }>(buildNovelSearchApiPath(searchRequest.params));

    return c.json(buildNovelSearchResponse({
      novels: response.novels,
      nextUrl: response.next_url,
      searchSpanLimit: response.search_span_limit,
      page: searchRequest.page,
    }));
  } catch (error) {
    const errorResponse = buildNovelSearchErrorResponse(error) ??
      buildRoutePublicErrorResponse(error, "Search failed", 500);
    logRouteError(errorResponse, "Search error:", error);
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * GET /api/novels/user/:userId
 * Get novels by user
 */
novels.get("/user/:userId", async (c) => {
  try {
    const listRequest = buildUserNovelListRouteRequest({
      userId: c.req.param("userId"),
      page: c.req.query("page"),
    });

    const client = createSessionPixivClient(c.get("sessionId"), c.get("session"));

    const response = await client.fetch<{
      novels: PixivNovelSummaryPayload[];
      next_url: string | null;
    }>(buildUserNovelsApiPath(listRequest.params));

    return c.json(buildUserNovelListResponse({
      userId: listRequest.id,
      novels: response.novels,
      page: listRequest.page,
      nextUrl: response.next_url,
    }));
  } catch (error) {
    const errorResponse = buildLoggedRouteErrorResponse(
      error,
      "Failed to fetch user novels",
      "User novels error:",
    );
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * GET /api/novels/series/:seriesId
 * Get novels in a series
 */
novels.get("/series/:seriesId", async (c) => {
  try {
    const listRequest = buildSeriesNovelListRouteRequest({
      seriesId: c.req.param("seriesId"),
      page: c.req.query("page"),
    });

    const client = createSessionPixivClient(c.get("sessionId"), c.get("session"));

    const response = await client.fetch<{
      novel_series_detail?: {
        id: number;
        title: string;
      };
      novels: PixivNovelSummaryPayload[];
      next_url: string | null;
    }>(buildSeriesNovelsApiPath(listRequest.params));

    const seriesTitle = response.novel_series_detail?.title || "";

    return c.json(buildSeriesNovelListResponse({
      seriesId: listRequest.id,
      seriesTitle,
      novels: response.novels,
      page: listRequest.page,
      nextUrl: response.next_url,
    }));
  } catch (error) {
    const errorResponse = buildLoggedRouteErrorResponse(
      error,
      "Failed to fetch series list",
      "Novel series list error:",
    );
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * GET /api/novels/:id
 * Get novel details
 */
novels.get("/:id", async (c) => {
  try {
    const detailRequest = buildNovelDetailRouteRequest({
      novelId: c.req.param("id"),
    });
    const client = createSessionPixivClient(c.get("sessionId"), c.get("session"));

    const response = await client.fetch<{
      novel: PixivNovelDetailPayload;
    }>(buildNovelDetailApiPath(detailRequest.novelId));

    return c.json(transformPixivNovelDetail(response.novel));
  } catch (error) {
    const errorResponse = buildLoggedRouteErrorResponse(
      error,
      "Failed to fetch novel details",
      "Novel detail error:",
    );
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * GET /api/novels/:id/content
 * Get novel text content using /webview/v2/novel API (returns HTML with embedded JSON)
 */
novels.get("/:id/content", async (c) => {
  try {
    const session = c.get("session");
    const detailRequest = buildNovelDetailRouteRequest({
      novelId: c.req.param("id"),
    });

    const content = await fetchPixivNovelContent({
      novelId: detailRequest.novelId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      sessionId: c.get("sessionId"),
    });

    return c.json(buildNovelContentSuccessBody(content, detailRequest.novelId));
  } catch (error) {
    const errorResponse = buildNovelContentErrorResponse(error);
    logRouteError(errorResponse, errorResponse.logLabel, errorResponse.logValue);
    return c.json(errorResponse.body, errorResponse.status);
  }
});

/**
 * GET /api/novels/:id/series
 * Get novel series information
 */
novels.get("/:id/series", async (c) => {
  try {
    const seriesResolveRequest = buildNovelSeriesResolveRouteRequest({
      novelId: c.req.param("id"),
      seriesId: c.req.query("series_id"),
      seriesTitle: c.req.query("series_title"),
    });
    const client = createSessionPixivClient(c.get("sessionId"), c.get("session"));
    const series = await resolvePixivNovelSeriesCached({
      novelId: seriesResolveRequest.novelId,
      hintedSeriesId: seriesResolveRequest.hintedSeriesId,
      hintedSeriesTitle: seriesResolveRequest.hintedSeriesTitle,
      client,
    });

    if (!series) {
      return c.json(null);
    }

    return c.json(
      series,
      200,
      NOVEL_SERIES_CACHE_HEADERS,
    );
  } catch (error) {
    const errorResponse = buildLoggedRouteErrorResponse(
      error,
      "Failed to fetch series information",
      "Novel series error:",
    );
    return c.json(errorResponse.body, errorResponse.status);
  }
});

export default novels;
