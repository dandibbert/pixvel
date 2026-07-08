import { assertJsonEquals as assertEquals } from "./test_asserts.ts";
import * as novelTransformer from "./novel_transformer.ts";
import {
  parsePixivNextPage,
  transformPixivNovelDetail,
  transformPixivNovelSummary,
} from "./novel_transformer.ts";

function createPixivNovel(overrides: Record<string, unknown> = {}) {
  return {
    id: 123,
    title: "Novel title",
    caption: "Novel caption",
    image_urls: {
      square_medium: "square.jpg",
      medium: "medium.jpg",
      large: "large.jpg",
    },
    create_date: "2026-04-26T00:00:00+09:00",
    tags: [
      {
        name: "tag-a",
        translated_name: null,
        added_by_uploaded_user: true,
      },
      {
        name: "tag-b",
        translated_name: "Tag B",
        added_by_uploaded_user: false,
      },
    ],
    page_count: 3,
    text_length: 1200,
    user: {
      id: 456,
      name: "Author name",
      account: "author",
      profile_image_urls: {
        medium: "avatar.jpg",
      },
      is_followed: false,
    },
    series: {
      id: 789,
      title: "Series title",
    },
    is_bookmarked: true,
    total_bookmarks: 88,
    total_view: 999,
    ...overrides,
  };
}

Deno.test("parsePixivNextPage extracts one-based page numbers from Pixiv next_url offsets", () => {
  assertEquals(
    parsePixivNextPage("https://app-api.pixiv.net/v1/user/novels?user_id=1&offset=60"),
    3,
  );
  assertEquals(parsePixivNextPage(null), null);
  assertEquals(parsePixivNextPage("https://app-api.pixiv.net/v1/user/novels?user_id=1"), null);
  assertEquals(parsePixivNextPage("not a url"), null);
  assertEquals(
    parsePixivNextPage("https://app-api.pixiv.net/v1/user/novels?user_id=1&offset=abc"),
    null,
  );
});

Deno.test("transformPixivNovelSummary maps Pixiv novel payloads to frontend novel summaries", () => {
  assertEquals(transformPixivNovelSummary(createPixivNovel()), {
    id: "123",
    title: "Novel title",
    description: "Novel caption",
    author: {
      id: "456",
      name: "Author name",
      avatar: "avatar.jpg",
    },
    coverImage: "large.jpg",
    tags: ["tag-a", "tag-b"],
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
  });
});

Deno.test("transformPixivNovelSummary applies fallback series and numeric defaults", () => {
  assertEquals(
    transformPixivNovelSummary(
      createPixivNovel({
        series: null,
        page_count: undefined,
        text_length: undefined,
        total_bookmarks: undefined,
        total_view: undefined,
      }),
      { fallbackSeries: { id: "series-1", title: "Fallback series" } },
    ),
    {
      id: "123",
      title: "Novel title",
      description: "Novel caption",
      author: {
        id: "456",
        name: "Author name",
        avatar: "avatar.jpg",
      },
      coverImage: "large.jpg",
      tags: ["tag-a", "tag-b"],
      pageCount: 0,
      textLength: 0,
      totalBookmarks: 0,
      totalViews: 0,
      createdAt: "2026-04-26T00:00:00+09:00",
      updatedAt: "2026-04-26T00:00:00+09:00",
      series: {
        id: "series-1",
        title: "Fallback series",
      },
    },
  );
});

Deno.test("transformPixivNovelSummaries maps collections with shared options", () => {
  const transformPixivNovelSummaries = (novelTransformer as {
    transformPixivNovelSummaries?: (
      novels: ReturnType<typeof createPixivNovel>[],
      options?: Parameters<typeof transformPixivNovelSummary>[1],
    ) => ReturnType<typeof transformPixivNovelSummary>[];
  }).transformPixivNovelSummaries;

  assertEquals(
    typeof transformPixivNovelSummaries,
    "function",
  );
  assertEquals(
    transformPixivNovelSummaries?.(
      [
        createPixivNovel({ id: 1, series: null }),
        createPixivNovel({ id: 2, series: null }),
      ],
      { fallbackSeries: { id: "series-1", title: "Fallback series" } },
    ).map((novel) => ({
      id: novel.id,
      series: novel.series,
    })),
    [
      { id: "1", series: { id: "series-1", title: "Fallback series" } },
      { id: "2", series: { id: "series-1", title: "Fallback series" } },
    ],
  );
});

Deno.test("transformPixivNovelDetail maps content and detail-only fields", () => {
  assertEquals(transformPixivNovelDetail(createPixivNovel({ text: "正文" })), {
    id: "123",
    title: "Novel title",
    description: "Novel caption",
    author: {
      id: "456",
      name: "Author name",
      avatar: "avatar.jpg",
    },
    coverImage: "large.jpg",
    tags: ["tag-a", "tag-b"],
    pageCount: 3,
    textLength: 1200,
    totalBookmarks: 88,
    totalViews: 999,
    createdAt: "2026-04-26T00:00:00+09:00",
    updatedAt: "2026-04-26T00:00:00+09:00",
    content: "正文",
    pages: [],
    series: {
      id: "789",
      title: "Series title",
    },
  });
});
