import { assertJsonEquals as assertEquals } from "./test_asserts.ts";
import { buildNovelSearchResponse } from "./novel_search.ts";

function createPixivNovel() {
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
  };
}

Deno.test("buildNovelSearchResponse transforms Pixiv search results and derives pagination", () => {
  const response = buildNovelSearchResponse({
    novels: [createPixivNovel()],
    page: 2,
    nextUrl: "https://app-api.pixiv.net/v1/search/novel?offset=60",
    searchSpanLimit: 300,
  });

  assertEquals(response, {
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
    }],
    total: 300,
    page: 2,
    totalPages: 10,
  });
});
