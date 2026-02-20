/**
 * Novel API routes
 */
import { Hono } from "hono";
import { getCookie } from "hono/helper/cookie/index.ts";
import { PixivClient } from "../services/pixiv_client.ts";
import { refreshAccessToken } from "../services/oauth_service.ts";
import { getSession, updateTokens } from "../services/kv_store.ts";

const novels = new Hono();

interface Novel {
  id: number;
  title: string;
  caption: string;
  restrict: number;
  x_restrict: number;
  is_original: boolean;
  image_urls: {
    square_medium: string;
    medium: string;
    large: string;
  };
  create_date: string;
  tags: Array<{
    name: string;
    translated_name: string | null;
    added_by_uploaded_user: boolean;
  }>;
  page_count: number;
  text_length: number;
  user: {
    id: number;
    name: string;
    account: string;
    profile_image_urls: {
      medium: string;
    };
    is_followed: boolean;
  };
  series: {
    id: number;
    title: string;
  } | null;
  is_bookmarked: boolean;
  total_bookmarks: number;
  total_view: number;
  visible: boolean;
  total_comments: number;
  is_muted: boolean;
  is_mypixiv_only: boolean;
  is_x_restricted: boolean;
}

interface SearchParams {
  word: string;
  sort?: string;
  search_target?: string;
  start_date?: string;
  end_date?: string;
  bookmark_num?: string;
  page?: string;
}

/**
 * Parse next_url to extract page number
 */
function parseNextPage(nextUrl: string | null): number | null {
  if (!nextUrl) return null;
  try {
    const url = new URL(nextUrl);
    const offset = url.searchParams.get("offset");
    if (!offset) return null;
    return Math.floor(parseInt(offset) / 30) + 1;
  } catch {
    return null;
  }
}

/**
 * GET /api/novels/search
 * Search novels with filters
 */
novels.get("/search", async (c) => {
  try {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await getSession(sessionId);
    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    // Parse query parameters
    const searchParams: SearchParams = {
      word: c.req.query("word") || "",
      sort: c.req.query("sort") || "date_desc",
      search_target: c.req.query("search_target") || "partial_match_for_tags",
      start_date: c.req.query("start_date"),
      end_date: c.req.query("end_date"),
      bookmark_num: c.req.query("bookmark_num"),
      page: c.req.query("page") || "1",
    };

    if (!searchParams.word) {
      return c.json({ error: "Missing search keyword" }, 400);
    }

    // Build Pixiv API parameters
    const params = new URLSearchParams({
      word: searchParams.word,
      sort: searchParams.sort || "date_desc",
      search_target: searchParams.search_target || "partial_match_for_tags",
      filter: "for_android",
    });

    if (searchParams.start_date) params.set("start_date", searchParams.start_date);
    if (searchParams.end_date) params.set("end_date", searchParams.end_date);
    if (searchParams.bookmark_num) params.set("bookmark_num_min", searchParams.bookmark_num);

    // Convert page to offset (30 items per page)
    const page = parseInt(searchParams.page || "1");
    const offset = (page - 1) * 30;
    if (offset > 0) params.set("offset", offset.toString());

    // Create Pixiv client with token refresh callback
    const client = new PixivClient(
      session.accessToken,
      session.refreshToken,
      async (accessToken, refreshToken) => {
        await updateTokens(
          sessionId,
          accessToken,
          refreshToken,
          Date.now() + 3600 * 1000,
        );
      },
    );

    // Call Pixiv API
    const response = await client.fetch<{
      novels: Novel[];
      next_url: string | null;
      search_span_limit: number;
    }>(`/v1/search/novel?${params.toString()}`);

    // Parse next page
    const hasMore = response.next_url !== null;

    // Transform novels to match frontend interface
    const transformedNovels = response.novels.map((novel) => ({
      id: novel.id.toString(),
      title: novel.title,
      description: novel.caption,
      author: {
        id: novel.user.id.toString(),
        name: novel.user.name,
        avatar: novel.user.profile_image_urls.medium,
      },
      coverImage: novel.image_urls.large,
      tags: novel.tags.map((tag) => tag.name),
      pageCount: novel.page_count || 0,
      textLength: novel.text_length || 0,
      totalBookmarks: novel.total_bookmarks || 0,
      totalViews: novel.total_view || 0,
      createdAt: novel.create_date,
      updatedAt: novel.create_date,
      series: novel.series
        ? {
          id: novel.series.id?.toString() || "",
          title: novel.series.title || "",
        }
        : undefined,
    }));

    // Pixiv API doesn't return exact total count
    // We use search_span_limit (usually 5000) as the maximum
    // If there's a next_url, we know there are more results
    const maxResults = response.search_span_limit || 5000;
    const itemsPerPage = 30;

    // Calculate total pages based on whether there's more data
    let totalPages: number;
    if (hasMore) {
      // If there's a next page, show at least current page + 1
      // But cap at the maximum possible pages
      totalPages = Math.min(Math.ceil(maxResults / itemsPerPage), page + 50);
    } else {
      // No more results, current page is the last page
      totalPages = page;
    }

    return c.json({
      novels: transformedNovels,
      total: totalPages * itemsPerPage, // Estimated total for frontend calculation
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Search error:", error);
    return c.json({
      error: "Search failed",
      message: (error as Error).message,
    }, 500);
  }
});

/**
 * GET /api/novels/user/:userId
 * Get novels by user
 */
novels.get("/user/:userId", async (c) => {
  try {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await getSession(sessionId);
    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const userId = c.req.param("userId");
    if (!userId) {
      return c.json({ error: "Missing user ID" }, 400);
    }

    const page = parseInt(c.req.query("page") || "1");
    const offset = (page - 1) * 30;
    const params = new URLSearchParams({
      user_id: userId,
    });
    if (offset > 0) params.set("offset", offset.toString());

    const client = new PixivClient(
      session.accessToken,
      session.refreshToken,
      async (accessToken, refreshToken) => {
        await updateTokens(
          sessionId,
          accessToken,
          refreshToken,
          Date.now() + 3600 * 1000,
        );
      },
    );

    const response = await client.fetch<{
      novels: Novel[];
      next_url: string | null;
    }>(`/v1/user/novels?${params.toString()}`);

    const hasMore = response.next_url !== null;
    const nextPage = parseNextPage(response.next_url);

    const transformedNovels = response.novels.map((novel) => ({
      id: novel.id.toString(),
      title: novel.title,
      description: novel.caption,
      author: {
        id: novel.user.id.toString(),
        name: novel.user.name,
        avatar: novel.user.profile_image_urls.medium,
      },
      coverImage: novel.image_urls.large,
      tags: novel.tags.map((tag) => tag.name),
      pageCount: novel.page_count || 0,
      textLength: novel.text_length || 0,
      totalBookmarks: novel.total_bookmarks || 0,
      totalViews: novel.total_view || 0,
      createdAt: novel.create_date,
      updatedAt: novel.create_date,
      series: novel.series
        ? {
          id: novel.series.id?.toString() || "",
          title: novel.series.title || "",
        }
        : undefined,
    }));

    const author = transformedNovels[0]?.author;

    return c.json({
      author: author || { id: userId, name: "Unknown" },
      novels: transformedNovels,
      page,
      nextPage,
      hasMore,
    });
  } catch (error) {
    console.error("User novels error:", error);
    return c.json({
      error: "Failed to fetch user novels",
      message: (error as Error).message,
    }, 500);
  }
});

/**
 * GET /api/novels/series/:seriesId
 * Get novels in a series
 */
novels.get("/series/:seriesId", async (c) => {
  try {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await getSession(sessionId);
    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const seriesId = c.req.param("seriesId");
    if (!seriesId) {
      return c.json({ error: "Missing series ID" }, 400);
    }

    const page = parseInt(c.req.query("page") || "1");
    const offset = (page - 1) * 30;
    const params = new URLSearchParams({
      series_id: seriesId,
    });
    if (offset > 0) params.set("offset", offset.toString());

    // Create Pixiv client
    const client = new PixivClient(
      session.accessToken,
      session.refreshToken,
      async (accessToken, refreshToken) => {
        await updateTokens(
          sessionId,
          accessToken,
          refreshToken,
          Date.now() + 3600 * 1000,
        );
      },
    );

    const response = await client.fetch<{
      novel_series_detail?: {
        id: number;
        title: string;
      };
      novels: Novel[];
      next_url: string | null;
    }>(`/v2/novel/series?${params.toString()}`);

    const hasMore = response.next_url !== null;
    const nextPage = parseNextPage(response.next_url);
    const seriesTitle = response.novel_series_detail?.title || "";

    const transformedNovels = response.novels.map((novel) => ({
      id: novel.id.toString(),
      title: novel.title,
      description: novel.caption,
      author: {
        id: novel.user.id.toString(),
        name: novel.user.name,
        avatar: novel.user.profile_image_urls.medium,
      },
      coverImage: novel.image_urls.large,
      tags: novel.tags.map((tag) => tag.name),
      pageCount: novel.page_count || 0,
      textLength: novel.text_length || 0,
      totalBookmarks: novel.total_bookmarks || 0,
      totalViews: novel.total_view || 0,
      createdAt: novel.create_date,
      updatedAt: novel.create_date,
      series: novel.series
        ? {
          id: novel.series.id?.toString() || "",
          title: novel.series.title || "",
        }
        : seriesTitle
        ? { id: seriesId, title: seriesTitle }
        : undefined,
    }));

    return c.json({
      series: {
        id: seriesId,
        title: seriesTitle,
      },
      novels: transformedNovels,
      page,
      nextPage,
      hasMore,
    });
  } catch (error) {
    console.error("Novel series list error:", error);
    return c.json({
      error: "Failed to fetch series list",
      message: (error as Error).message,
    }, 500);
  }
});

/**
 * GET /api/novels/:id
 * Get novel details
 */
novels.get("/:id", async (c) => {
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

    // Create Pixiv client
    const client = new PixivClient(
      session.accessToken,
      session.refreshToken,
      async (accessToken, refreshToken) => {
        await updateTokens(
          sessionId,
          accessToken,
          refreshToken,
          Date.now() + 3600 * 1000,
        );
      },
    );

    // Call Pixiv API
    const response = await client.fetch<{
      novel: Novel & {
        text: string;
      };
    }>(`/v2/novel/detail?novel_id=${novelId}`);

    // Transform novel to match frontend interface
    const novel = response.novel;
    const transformedNovel = {
      id: novel.id?.toString() || "",
      title: novel.title || "",
      description: novel.caption || "",
      author: {
        id: novel.user?.id?.toString() || "",
        name: novel.user?.name || "",
        avatar: novel.user?.profile_image_urls?.medium,
      },
      coverImage: novel.image_urls?.large,
      tags: novel.tags?.map((tag) => tag.name) || [],
      pageCount: novel.page_count || 0,
      textLength: novel.text_length || 0,
      totalBookmarks: novel.total_bookmarks || 0,
      totalViews: novel.total_view || 0,
      createdAt: novel.create_date || new Date().toISOString(),
      updatedAt: novel.create_date || new Date().toISOString(),
      content: novel.text || "",
      pages: [],
      series: novel.series
        ? {
          id: novel.series.id?.toString() || "",
          title: novel.series.title || "",
        }
        : undefined,
    };

    return c.json(transformedNovel);
  } catch (error) {
    console.error("Novel detail error:", error);
    return c.json({
      error: "Failed to fetch novel details",
      message: (error as Error).message,
    }, 500);
  }
});

/**
 * GET /api/novels/:id/content
 * Get novel text content using /webview/v2/novel API (returns HTML with embedded JSON)
 */
novels.get("/:id/content", async (c) => {
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

    // Build URL
    const url = `https://app-api.pixiv.net/webview/v2/novel?id=${novelId}`;

    const buildHeaders = (accessToken: string): Record<string, string> => ({
      "Authorization": `Bearer ${accessToken}`,
      "User-Agent": "PixivAndroidApp/5.0.234 (Android 11; Pixel 5)",
      "Accept-Language": "zh-CN",
      "App-OS": "android",
      "App-OS-Version": "11",
      "App-Version": "5.0.234",
    });

    // Fetch HTML directly (retry once on auth error)
    let response = await fetch(url, { headers: buildHeaders(session.accessToken) });
    if (!response.ok && (response.status === 400 || response.status === 401)) {
      const tokenResponse = await refreshAccessToken(session.refreshToken);
      await updateTokens(
        sessionId,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        Date.now() + tokenResponse.expires_in * 1000,
      );
      response = await fetch(url, { headers: buildHeaders(tokenResponse.access_token) });
    }

    if (!response.ok) {
      throw new Error(`Pixiv API error (${response.status}): ${response.statusText}`);
    }

    const html = await response.text();

    // Extract JSON from HTML using regex (same as Flutter implementation)
    const novelRegex = /novel: ({.*?}),\n\s*isOwnWork/;
    const match = html.match(novelRegex);

    if (!match || !match[1]) {
      console.error("Failed to extract novel JSON from HTML");
      return c.json({
        error: "Novel content not available",
        message: "Failed to parse novel content from response",
      }, 404);
    }

    const novelJson = JSON.parse(match[1]);

    if (!novelJson.text) {
      console.error("Novel text is missing in extracted JSON:", novelJson);
      return c.json({
        error: "Novel content not available",
        message: "The novel text is empty or unavailable",
      }, 404);
    }

    return c.json({
      content: novelJson.text,
      novelId: parseInt(novelId),
    });
  } catch (error) {
    console.error("Novel content error:", error);
    return c.json({
      error: "Failed to fetch novel content",
      message: (error as Error).message,
    }, 500);
  }
});

/**
 * GET /api/novels/:id/series
 * Get novel series information
 */
novels.get("/:id/series", async (c) => {
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

    // Optional: Accept series_id and series_title from query params to skip detail call
    const hintedSeriesId = c.req.query("series_id");
    const hintedSeriesTitle = c.req.query("series_title") || "";

    // Create Pixiv client
    const client = new PixivClient(
      session.accessToken,
      session.refreshToken,
      async (accessToken, refreshToken) => {
        await updateTokens(
          sessionId,
          accessToken,
          refreshToken,
          Date.now() + 3600 * 1000,
        );
      },
    );

    const novelIdNumber = parseInt(novelId, 10);
    let seriesId: number;
    let seriesTitle = hintedSeriesTitle;

    // If series_id is provided, skip the detail API call
    if (hintedSeriesId) {
      const parsedSeriesId = parseInt(hintedSeriesId, 10);
      if (isNaN(parsedSeriesId)) {
        return c.json({ error: "Invalid series_id" }, 400);
      }
      seriesId = parsedSeriesId;
    } else {
      // Fallback: get novel details to check if it has a series
      const detailResponse = await client.fetch<{
        novel: Novel;
      }>(`/v2/novel/detail?novel_id=${novelId}`);

      if (!detailResponse.novel.series) {
        return c.json(null);
      }

      seriesId = detailResponse.novel.series.id;
      if (!seriesTitle) {
        seriesTitle = detailResponse.novel.series?.title || "";
      }
    }
    let prevNovel: { id: string; title: string } | null = null;
    let nextNovel: { id: string; title: string } | null = null;

    try {
      // Prefer novel text API: returns series_prev/series_next across long series.
      const textResponse = await client.fetch<{
        series_prev: { id?: number; title?: string } | null;
        series_next: { id?: number; title?: string } | null;
      }>(`/v1/novel/text?novel_id=${novelId}`);

      if (textResponse.series_prev?.id) {
        prevNovel = {
          id: textResponse.series_prev.id.toString(),
          title: textResponse.series_prev.title || "",
        };
      }
      if (textResponse.series_next?.id) {
        nextNovel = {
          id: textResponse.series_next.id.toString(),
          title: textResponse.series_next.title || "",
        };
      }
    } catch {
      // Fallback to /v2/novel/series pagination when /v1/novel/text fails.
      let nextUrl: string | null = `/v2/novel/series?series_id=${seriesId}`;
      let safety = 0;

      while (nextUrl && safety < 30 && (!prevNovel || !nextNovel)) {
        safety += 1;
        const seriesResponse: {
          novel_series_detail?: { id: number; title: string };
          novels: Novel[];
          next_url: string | null;
        } = await client.fetch(nextUrl);

        if (!seriesTitle && seriesResponse.novel_series_detail?.title) {
          seriesTitle = seriesResponse.novel_series_detail.title;
        }

        const novels = seriesResponse.novels || [];
        const currentIndex = novels.findIndex((n) => n.id === novelIdNumber);
        if (currentIndex >= 0) {
          if (currentIndex > 0) {
            prevNovel = {
              id: novels[currentIndex - 1].id.toString(),
              title: novels[currentIndex - 1].title,
            };
          }
          if (currentIndex < novels.length - 1) {
            nextNovel = {
              id: novels[currentIndex + 1].id.toString(),
              title: novels[currentIndex + 1].title,
            };
          }
          break;
        }

        nextUrl = seriesResponse.next_url;
      }
    }

    return c.json({
      id: seriesId.toString(),
      title: seriesTitle,
      ...(prevNovel ? { prev_novel: prevNovel } : {}),
      ...(nextNovel ? { next_novel: nextNovel } : {}),
    }, 200, {
      "Cache-Control": "private, max-age=30",
    });
  } catch (error) {
    console.error("Novel series error:", error);
    return c.json({
      error: "Failed to fetch series information",
      message: (error as Error).message,
    }, 500);
  }
});

export default novels;
