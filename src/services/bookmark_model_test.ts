import {
  assertJsonEquals as assertEquals,
  assertThrowsError as assertThrows,
} from "./test_asserts.ts";
import {
  buildBookmarkAddApiPath,
  buildBookmarkAddPayload,
  buildBookmarkAddRequest,
  buildBookmarkDeleteApiPath,
  buildBookmarkDeleteRequest,
  buildBookmarkedNovelsApiPath,
  buildBookmarkedNovelsParams,
  buildBookmarkedNovelsRequest,
  buildBookmarkedNovelsResponse,
  parseBookmarkRestrict,
} from "./bookmark_model.ts";
import { InvalidRouteParameterError, MissingRouteParameterError } from "./route_params.ts";

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

Deno.test("parseBookmarkRestrict defaults empty values to public", () => {
  assertEquals(parseBookmarkRestrict(undefined), "public");
  assertEquals(parseBookmarkRestrict(null), "public");
  assertEquals(parseBookmarkRestrict(""), "public");
});

Deno.test("parseBookmarkRestrict accepts supported Pixiv restrict values", () => {
  assertEquals(parseBookmarkRestrict("public"), "public");
  assertEquals(parseBookmarkRestrict("private"), "private");
});

Deno.test("parseBookmarkRestrict rejects unsupported values without leaking them", () => {
  assertThrows(() => parseBookmarkRestrict("friends-only"), InvalidRouteParameterError);

  try {
    parseBookmarkRestrict("friends-only");
  } catch (error) {
    assertEquals((error as Error).message, "Invalid restrict");
  }
});

Deno.test("buildBookmarkAddPayload creates Pixiv bookmark body", () => {
  assertEquals(buildBookmarkAddPayload({ novelId: 123, restrict: "private" }), {
    novel_id: 123,
    restrict: "private",
  });
});

Deno.test("bookmark action API paths target the Pixiv bookmark endpoints", () => {
  assertEquals(buildBookmarkAddApiPath(), "/v2/novel/bookmark/add");
  assertEquals(buildBookmarkDeleteApiPath(), "/v1/novel/bookmark/delete");
});

Deno.test("buildBookmarkAddRequest parses route body and creates Pixiv payload", () => {
  assertEquals(buildBookmarkAddRequest({ novelId: "123", restrict: "private" }), {
    novelId: 123,
    restrict: "private",
    payload: {
      novel_id: 123,
      restrict: "private",
    },
  });
});

Deno.test("buildBookmarkAddRequest defaults restrict and preserves missing novel errors", () => {
  assertEquals(buildBookmarkAddRequest({ novelId: 123 }), {
    novelId: 123,
    restrict: "public",
    payload: {
      novel_id: 123,
      restrict: "public",
    },
  });

  assertThrows(
    () => buildBookmarkAddRequest({ restrict: "public" }),
    MissingRouteParameterError,
  );
});

Deno.test("buildBookmarkDeleteRequest parses route id and creates Pixiv payload", () => {
  assertEquals(buildBookmarkDeleteRequest("456"), {
    novelId: 456,
    payload: {
      novel_id: 456,
    },
  });
});

Deno.test("buildBookmarkDeleteRequest preserves missing novel ID errors", () => {
  assertThrows(
    () => buildBookmarkDeleteRequest(undefined),
    MissingRouteParameterError,
  );
});

Deno.test("buildBookmarkedNovelsApiPath builds the Pixiv bookmark list endpoint", () => {
  const params = new URLSearchParams({
    user_id: "user-1",
    restrict: "public",
    filter: "for_android",
  });

  assertEquals(
    buildBookmarkedNovelsApiPath(params),
    "/v1/user/bookmarks/novel?user_id=user-1&restrict=public&filter=for_android",
  );
});

Deno.test("buildBookmarkedNovelsParams creates Pixiv bookmark list query", () => {
  const params = buildBookmarkedNovelsParams({
    userId: "user-1",
    restrict: "public",
    offset: 60,
  });

  assertEquals(params.toString(), "user_id=user-1&restrict=public&filter=for_android&offset=60");
});

Deno.test("buildBookmarkedNovelsParams omits zero offsets", () => {
  const params = buildBookmarkedNovelsParams({
    userId: "user-1",
    restrict: "private",
    offset: 0,
  });

  assertEquals(params.toString(), "user_id=user-1&restrict=private&filter=for_android");
});

Deno.test("buildBookmarkedNovelsRequest returns Pixiv params with the parsed page", () => {
  const request = buildBookmarkedNovelsRequest({
    userId: "user-1",
    restrict: "private",
    page: "3",
  });

  assertEquals(request.page, 3);
  assertEquals(
    request.params.toString(),
    "user_id=user-1&restrict=private&filter=for_android&offset=60",
  );
});

Deno.test("buildBookmarkedNovelsRequest defaults restrict and page", () => {
  const request = buildBookmarkedNovelsRequest({
    userId: "user-1",
    restrict: undefined,
    page: undefined,
  });

  assertEquals(request.restrict, "public");
  assertEquals(request.page, 1);
  assertEquals(request.params.toString(), "user_id=user-1&restrict=public&filter=for_android");
});

Deno.test("buildBookmarkedNovelsResponse transforms bookmarked novels and next page state", () => {
  assertEquals(
    buildBookmarkedNovelsResponse({
      novels: [createPixivNovel()],
      nextUrl: "https://app-api.pixiv.net/v1/user/bookmarks/novel?offset=60",
    }),
    {
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
      total: 1,
      nextPage: 3,
    },
  );
});
