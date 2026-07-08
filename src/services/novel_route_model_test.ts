import { assertExactJsonEquals as assertEquals } from "./test_asserts.ts";
import {
  buildNovelContentSuccessBody,
  buildNovelDetailApiPath,
  buildNovelDetailRouteRequest,
  buildNovelSearchApiPath,
  buildNovelSearchRouteRequest,
  buildNovelSeriesHintRequest,
  buildNovelSeriesResolveRouteRequest,
  buildNovelSeriesRouteRequest,
  buildSeriesNovelListRouteRequest,
  buildSeriesNovelsApiPath,
  buildUserNovelListRouteRequest,
  buildUserNovelsApiPath,
  NOVEL_SERIES_CACHE_HEADERS,
} from "./novel_route_model.ts";
import {
  InvalidSearchParameterError,
  MissingNovelSearchKeywordError,
} from "./novel_search_params.ts";
import { InvalidRouteParameterError } from "./route_params.ts";

Deno.test("novel route model builds Pixiv endpoint paths from validated params", () => {
  assertEquals(
    buildNovelSearchApiPath(new URLSearchParams({ word: "五悠", page: "2" })),
    "/v1/search/novel?word=%E4%BA%94%E6%82%A0&page=2",
  );
  assertEquals(
    buildUserNovelsApiPath(new URLSearchParams({ user_id: "123", offset: "30" })),
    "/v1/user/novels?user_id=123&offset=30",
  );
  assertEquals(
    buildSeriesNovelsApiPath(new URLSearchParams({ series_id: "456" })),
    "/v2/novel/series?series_id=456",
  );
  assertEquals(
    buildNovelDetailApiPath(789),
    "/v2/novel/detail?novel_id=789",
  );
});

Deno.test("novel route model builds stable route response metadata", () => {
  assertEquals(buildNovelContentSuccessBody("first page", 789), {
    content: "first page",
    novelId: 789,
  });
  assertEquals(NOVEL_SERIES_CACHE_HEADERS, {
    "Cache-Control": "private, max-age=30",
  });
});

Deno.test("novel route model builds search requests from route query params", () => {
  const routeQuery = new URLSearchParams({
    word: "五悠",
    page: "3",
    bookmark_num: "1000",
    include_translated_tag_results: "true",
  });
  const request = buildNovelSearchRouteRequest((name) => routeQuery.get(name) ?? undefined);

  assertEquals(request.page, 3);
  assertEquals(
    request.params.toString(),
    "word=%E4%BA%94%E6%82%A0&sort=date_desc&search_target=partial_match_for_tags&filter=for_android&bookmark_num_min=1000&include_translated_tag_results=true&offset=60",
  );
});

Deno.test("novel route model preserves search keyword validation", () => {
  try {
    buildNovelSearchRouteRequest(() => undefined);
  } catch (error) {
    if (error instanceof MissingNovelSearchKeywordError) {
      assertEquals(error.message, "Missing search keyword");
      return;
    }
    throw error;
  }

  throw new Error("Expected MissingNovelSearchKeywordError");
});

Deno.test("novel route model preserves safe search filter validation", () => {
  const routeQuery = new URLSearchParams({
    word: "五悠",
    bookmark_num_min: "1<script>",
  });

  try {
    buildNovelSearchRouteRequest((name) => routeQuery.get(name) ?? undefined);
  } catch (error) {
    if (error instanceof InvalidSearchParameterError) {
      assertEquals(error.message, "Invalid bookmark_num_min");
      return;
    }
    throw error;
  }

  throw new Error("Expected InvalidSearchParameterError");
});

Deno.test("novel route model parses optional series hint query values", () => {
  assertEquals(
    buildNovelSeriesHintRequest({
      seriesId: "456",
      seriesTitle: "Series title",
    }),
    {
      hintedSeriesId: 456,
      hintedSeriesTitle: "Series title",
    },
  );
  assertEquals(
    buildNovelSeriesHintRequest({
      seriesId: undefined,
      seriesTitle: undefined,
    }),
    {
      hintedSeriesId: undefined,
      hintedSeriesTitle: "",
    },
  );
});

Deno.test("novel route model preserves positive integer validation for series hints", () => {
  try {
    buildNovelSeriesHintRequest({
      seriesId: "not-a-number",
      seriesTitle: "Series title",
    });
  } catch (error) {
    if (error instanceof InvalidRouteParameterError) {
      assertEquals(error.message, "Invalid series_id");
      return;
    }
    throw error;
  }

  throw new Error("Expected InvalidRouteParameterError");
});

Deno.test("novel route model builds user and series list requests from route params", () => {
  const userRequest = buildUserNovelListRouteRequest({
    userId: "123",
    page: "3",
  });
  const seriesRequest = buildSeriesNovelListRouteRequest({
    seriesId: "456",
    page: "2",
  });

  assertEquals(userRequest.page, 3);
  assertEquals(userRequest.params.toString(), "user_id=123&offset=60");
  assertEquals(seriesRequest.page, 2);
  assertEquals(seriesRequest.params.toString(), "series_id=456&offset=30");
});

Deno.test("novel route model preserves required ID validation for list requests", () => {
  try {
    buildUserNovelListRouteRequest({
      userId: "bad-user",
      page: "1",
    });
  } catch (error) {
    if (error instanceof InvalidRouteParameterError) {
      assertEquals(error.message, "Invalid user ID");
      return;
    }
    throw error;
  }

  throw new Error("Expected InvalidRouteParameterError");
});

Deno.test("novel route model builds single novel route requests from route params", () => {
  assertEquals(buildNovelDetailRouteRequest({ novelId: "789" }), {
    novelId: 789,
  });
  assertEquals(buildNovelSeriesRouteRequest({ novelId: "789" }), {
    novelId: 789,
  });
});

Deno.test("novel route model preserves required novel ID validation for single novel requests", () => {
  try {
    buildNovelDetailRouteRequest({
      novelId: "bad-novel",
    });
  } catch (error) {
    if (error instanceof InvalidRouteParameterError) {
      assertEquals(error.message, "Invalid novel ID");
      return;
    }
    throw error;
  }

  throw new Error("Expected InvalidRouteParameterError");
});

Deno.test("novel route model builds series resolve requests from route and query params", () => {
  assertEquals(
    buildNovelSeriesResolveRouteRequest({
      novelId: "789",
      seriesId: "456",
      seriesTitle: "Series title",
    }),
    {
      novelId: 789,
      hintedSeriesId: 456,
      hintedSeriesTitle: "Series title",
    },
  );
  assertEquals(
    buildNovelSeriesResolveRouteRequest({
      novelId: "789",
      seriesId: undefined,
      seriesTitle: undefined,
    }),
    {
      novelId: 789,
      hintedSeriesId: undefined,
      hintedSeriesTitle: "",
    },
  );
});
