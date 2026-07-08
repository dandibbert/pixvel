import { assertJsonEquals as assertEquals } from "./test_asserts.ts";
import {
  buildNovelListParams,
  buildNovelListRequest,
  buildSeriesNovelListResponse,
  buildUserNovelListResponse,
} from "./novel_list.ts";
import type { PixivNovelSummaryPayload } from "./novel_transformer.ts";

function createPixivNovel(
  overrides: Partial<PixivNovelSummaryPayload> = {},
): PixivNovelSummaryPayload {
  return {
    id: 123,
    title: "Novel title",
    caption: "Novel caption",
    image_urls: {
      large: "large.jpg",
    },
    create_date: "2026-04-26T00:00:00+09:00",
    tags: [{ name: "tag-a" }],
    page_count: 3,
    text_length: 1200,
    user: {
      id: 456,
      name: "Author name",
      profile_image_urls: {
        medium: "avatar.jpg",
      },
    },
    total_bookmarks: 88,
    total_view: 999,
    ...overrides,
  };
}

Deno.test("buildNovelListParams creates Pixiv list params and omits first-page offsets", () => {
  assertEquals(buildNovelListParams("user_id", 123, 1).toString(), "user_id=123");
  assertEquals(buildNovelListParams("series_id", 789, 3).toString(), "series_id=789&offset=60");
});

Deno.test("buildNovelListRequest returns Pixiv params with the parsed page", () => {
  const request = buildNovelListRequest({
    idParamName: "user_id",
    id: 123,
    page: "3",
  });

  assertEquals(request.page, 3);
  assertEquals(request.params.toString(), "user_id=123&offset=60");
});

Deno.test("buildNovelListRequest keeps first page as the default", () => {
  const request = buildNovelListRequest({
    idParamName: "series_id",
    id: 789,
    page: undefined,
  });

  assertEquals(request.page, 1);
  assertEquals(request.params.toString(), "series_id=789");
});

Deno.test("buildUserNovelListResponse transforms novels and derives author metadata", () => {
  assertEquals(
    buildUserNovelListResponse({
      userId: 456,
      novels: [createPixivNovel()],
      page: 2,
      nextUrl: "https://app-api.pixiv.net/v1/user/novels?user_id=456&offset=60",
    }),
    {
      author: {
        id: "456",
        name: "Author name",
        avatar: "avatar.jpg",
      },
      novels: [{
        id: "123",
        title: "Novel title",
        description: "Novel caption",
        author: {
          id: "456",
          name: "Author name",
          avatar: "avatar.jpg",
        },
        coverImage: "large.jpg",
        tags: ["tag-a"],
        pageCount: 3,
        textLength: 1200,
        totalBookmarks: 88,
        totalViews: 999,
        createdAt: "2026-04-26T00:00:00+09:00",
        updatedAt: "2026-04-26T00:00:00+09:00",
      }],
      page: 2,
      nextPage: 3,
      hasMore: true,
    },
  );
});

Deno.test("buildUserNovelListResponse falls back to unknown author for empty lists", () => {
  assertEquals(
    buildUserNovelListResponse({
      userId: 456,
      novels: [],
      page: 1,
      nextUrl: null,
    }),
    {
      author: {
        id: "456",
        name: "Unknown",
      },
      novels: [],
      page: 1,
      nextPage: null,
      hasMore: false,
    },
  );
});

Deno.test("buildSeriesNovelListResponse applies series metadata as fallback to novels", () => {
  assertEquals(
    buildSeriesNovelListResponse({
      seriesId: 789,
      seriesTitle: "Series title",
      novels: [createPixivNovel({ series: null })],
      page: 1,
      nextUrl: null,
    }),
    {
      series: {
        id: "789",
        title: "Series title",
      },
      novels: [{
        id: "123",
        title: "Novel title",
        description: "Novel caption",
        author: {
          id: "456",
          name: "Author name",
          avatar: "avatar.jpg",
        },
        coverImage: "large.jpg",
        tags: ["tag-a"],
        pageCount: 3,
        textLength: 1200,
        totalBookmarks: 88,
        totalViews: 999,
        createdAt: "2026-04-26T00:00:00+09:00",
        updatedAt: "2026-04-26T00:00:00+09:00",
        series: {
          id: "789",
          title: "Series title",
        },
      }],
      page: 1,
      nextPage: null,
      hasMore: false,
    },
  );
});
