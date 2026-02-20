/**
 * Bookmarks API routes
 */
import { Hono } from "hono";
import { getCookie } from "hono/helper/cookie/index.ts";
import { PixivClient } from "../services/pixiv_client.ts";
import { getSession, updateTokens } from "../services/kv_store.ts";

const bookmarks = new Hono();

/**
 * POST /api/bookmarks/novel
 * Bookmark a novel
 */
bookmarks.post("/novel", async (c) => {
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
    const { novelId, restrict } = body;

    if (!novelId) {
      return c.json({ error: "Missing novelId" }, 400);
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

    // Call Pixiv API to add bookmark
    await client.fetch("/v2/novel/bookmark/add", {
      method: "POST",
      body: {
        novel_id: novelId,
        restrict: restrict || "public", // public or private
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Bookmark novel error:", error);
    return c.json({
      error: "Failed to bookmark novel",
      message: (error as Error).message,
    }, 500);
  }
});

/**
 * DELETE /api/bookmarks/novel/:id
 * Remove bookmark from a novel
 */
bookmarks.delete("/novel/:id", async (c) => {
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

    // Call Pixiv API to delete bookmark
    await client.fetch("/v1/novel/bookmark/delete", {
      method: "POST",
      body: {
        novel_id: parseInt(novelId),
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return c.json({
      error: "Failed to delete bookmark",
      message: (error as Error).message,
    }, 500);
  }
});

/**
 * GET /api/bookmarks/novels
 * Get user's bookmarked novels
 */
bookmarks.get("/novels", async (c) => {
  try {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await getSession(sessionId);
    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const restrict = c.req.query("restrict") || "public"; // public or private
    const page = parseInt(c.req.query("page") || "1");
    const offset = (page - 1) * 30;

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

    // Build query parameters
    const params = new URLSearchParams({
      user_id: session.userId,
      restrict,
      filter: "for_android",
    });

    if (offset > 0) params.set("offset", offset.toString());

    // Call Pixiv API
    const response = await client.fetch<{
      novels: Array<{
        id: number;
        title: string;
        caption: string;
        image_urls: {
          square_medium: string;
          medium: string;
          large: string;
        };
        create_date: string;
        tags: Array<{
          name: string;
          translated_name: string | null;
        }>;
        user: {
          id: number;
          name: string;
          account: string;
          profile_image_urls: {
            medium: string;
          };
        };
        page_count?: number;
        text_length?: number;
        is_bookmarked: boolean;
        total_bookmarks: number;
        total_view: number;
      }>;
      next_url: string | null;
    }>(`/v1/user/bookmarks/novel?${params.toString()}`);

    // Parse next page
    const nextPage = response.next_url
      ? (() => {
        try {
          const url = new URL(response.next_url);
          const nextOffset = url.searchParams.get("offset");
          return nextOffset ? Math.floor(parseInt(nextOffset) / 30) + 1 : null;
        } catch {
          return null;
        }
      })()
      : null;

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
    }));

    return c.json({
      novels: transformedNovels,
      total: transformedNovels.length,
      nextPage,
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return c.json({
      error: "Failed to get bookmarks",
      message: (error as Error).message,
    }, 500);
  }
});

export default bookmarks;
