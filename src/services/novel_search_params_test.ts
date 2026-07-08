import {
  assertJsonEquals,
  assertStrictEquals as assertEquals,
  assertThrowsError as assertThrows,
} from "./test_asserts.ts";
import * as novelSearchParamsModel from "./novel_search_params.ts";
import {
  buildNovelSearchApiParams,
  buildNovelSearchErrorResponse,
  buildNovelSearchPagination,
  buildNovelSearchRequest,
  collectNovelSearchQuery,
  InvalidSearchParameterError,
  MissingNovelSearchKeywordError,
} from "./novel_search_params.ts";

Deno.test("novel search filter metadata groups route and API filter fields", () => {
  assertJsonEquals(
    (novelSearchParamsModel as Record<string, unknown>).NOVEL_SEARCH_FILTER_FIELDS,
    {
      optionalQuery: [
        "sort",
        "search_target",
        "start_date",
        "end_date",
        "bookmark_num",
        "bookmark_num_min",
        "bookmark_num_max",
        "text_length_min",
        "include_potential_violation_works",
        "include_translated_tag_results",
        "is_original_only",
        "is_replaceable_only",
        "merge_plain_keyword_results",
        "search_ai_type",
        "lang",
      ],
      enum: ["sort", "search_target", "search_ai_type", "lang"],
      date: ["start_date", "end_date"],
      positiveInteger: ["bookmark_num_min", "bookmark_num_max", "text_length_min"],
      boolean: [
        "include_potential_violation_works",
        "include_translated_tag_results",
        "is_original_only",
        "is_replaceable_only",
        "merge_plain_keyword_results",
      ],
    },
  );
});

Deno.test("collectNovelSearchQuery reads supported route query fields", () => {
  const routeQuery = new Map([
    ["word", "五悠"],
    ["sort", "popular_desc"],
    ["search_target", "keyword"],
    ["start_date", "2025-04-26"],
    ["end_date", "2026-04-26"],
    ["bookmark_num", "100"],
    ["bookmark_num_min", "1000"],
    ["bookmark_num_max", "4999"],
    ["text_length_min", "3000"],
    ["include_potential_violation_works", "false"],
    ["include_translated_tag_results", "true"],
    ["is_original_only", "false"],
    ["is_replaceable_only", "false"],
    ["merge_plain_keyword_results", "true"],
    ["search_ai_type", "1"],
    ["lang", "ja"],
    ["page", "2"],
  ]);

  assertJsonEquals(collectNovelSearchQuery((name) => routeQuery.get(name)), {
    word: "五悠",
    sort: "popular_desc",
    search_target: "keyword",
    start_date: "2025-04-26",
    end_date: "2026-04-26",
    bookmark_num: "100",
    bookmark_num_min: "1000",
    bookmark_num_max: "4999",
    text_length_min: "3000",
    include_potential_violation_works: "false",
    include_translated_tag_results: "true",
    is_original_only: "false",
    is_replaceable_only: "false",
    merge_plain_keyword_results: "true",
    search_ai_type: "1",
    lang: "ja",
    page: "2",
  });
});

Deno.test("collectNovelSearchQuery preserves existing route defaults for missing word and page", () => {
  assertJsonEquals(collectNovelSearchQuery(() => undefined), {
    word: "",
    page: "1",
  });
});

Deno.test("buildNovelSearchApiParams forwards verified App API search filters", () => {
  const params = buildNovelSearchApiParams({
    word: "五悠",
    sort: "popular_desc",
    search_target: "keyword",
    start_date: "2025-04-26",
    end_date: "2026-04-26",
    bookmark_num_min: "1000",
    bookmark_num_max: "4999",
    text_length_min: "3000",
    include_potential_violation_works: "false",
    include_translated_tag_results: "true",
    is_original_only: "false",
    is_replaceable_only: "false",
    merge_plain_keyword_results: "true",
    search_ai_type: "1",
    lang: "ja",
    page: "2",
  });

  assertEquals(params.get("word"), "五悠");
  assertEquals(params.get("sort"), "popular_desc");
  assertEquals(params.get("search_target"), "keyword");
  assertEquals(params.get("start_date"), "2025-04-26");
  assertEquals(params.get("end_date"), "2026-04-26");
  assertEquals(params.get("bookmark_num_min"), "1000");
  assertEquals(params.get("bookmark_num_max"), "4999");
  assertEquals(params.get("text_length_min"), "3000");
  assertEquals(params.get("include_potential_violation_works"), "false");
  assertEquals(params.get("include_translated_tag_results"), "true");
  assertEquals(params.get("is_original_only"), "false");
  assertEquals(params.get("is_replaceable_only"), "false");
  assertEquals(params.get("merge_plain_keyword_results"), "true");
  assertEquals(params.get("search_ai_type"), "1");
  assertEquals(params.get("lang"), "ja");
  assertEquals(params.get("offset"), "30");
});

Deno.test("buildNovelSearchApiParams keeps legacy bookmark_num as bookmark_num_min", () => {
  const params = buildNovelSearchApiParams({
    word: "五悠",
    bookmark_num: "100",
    page: "1",
  });

  assertEquals(params.get("bookmark_num_min"), "100");
  assertEquals(params.has("offset"), false);
});

Deno.test("buildNovelSearchRequest returns Pixiv params with the parsed route page", () => {
  const request = buildNovelSearchRequest({
    word: "五悠",
    sort: "popular_desc",
    page: "3",
  });

  assertEquals(request.page, 3);
  assertEquals(request.params.get("word"), "五悠");
  assertEquals(request.params.get("sort"), "popular_desc");
  assertEquals(request.params.get("offset"), "60");
});

Deno.test("buildNovelSearchRequest keeps default page behavior with omitted page", () => {
  const request = buildNovelSearchRequest({
    word: "五悠",
  });

  assertEquals(request.page, 1);
  assertEquals(request.params.has("offset"), false);
});

Deno.test("buildNovelSearchApiParams rejects unsupported search enum values", () => {
  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        search_target: "title_and_caption",
      }),
    InvalidSearchParameterError,
  );

  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        search_ai_type: "2",
      }),
    InvalidSearchParameterError,
  );
});

Deno.test("buildNovelSearchApiParams rejects invalid boolean search filters", () => {
  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        include_translated_tag_results: "yes",
      }),
    InvalidSearchParameterError,
  );
});

Deno.test("buildNovelSearchApiParams rejects invalid numeric filters", () => {
  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        bookmark_num_min: "abc",
      }),
    InvalidSearchParameterError,
  );

  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        bookmark_num_max: "-1",
      }),
    InvalidSearchParameterError,
  );

  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        text_length_min: "1.5",
      }),
    InvalidSearchParameterError,
  );
});

Deno.test("buildNovelSearchApiParams rejects invalid dates and languages", () => {
  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        start_date: "2026-02-30",
      }),
    InvalidSearchParameterError,
  );

  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        end_date: "20260426",
      }),
    InvalidSearchParameterError,
  );

  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        lang: "evil",
      }),
    InvalidSearchParameterError,
  );
});

Deno.test("buildNovelSearchApiParams rejects invalid pages", () => {
  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        page: "0",
      }),
    InvalidSearchParameterError,
  );

  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        page: "2abc",
      }),
    InvalidSearchParameterError,
  );
});

Deno.test("buildNovelSearchApiParams rejects unbounded search values", () => {
  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五".repeat(101),
      }),
    InvalidSearchParameterError,
  );

  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        page: "101",
      }),
    InvalidSearchParameterError,
  );

  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        bookmark_num_min: "1000000000",
      }),
    InvalidSearchParameterError,
  );
});

Deno.test("buildNovelSearchApiParams rejects inconsistent filter ranges", () => {
  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        start_date: "2026-04-26",
        end_date: "2025-04-26",
      }),
    InvalidSearchParameterError,
  );

  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "五悠",
        bookmark_num_min: "5000",
        bookmark_num_max: "1000",
      }),
    InvalidSearchParameterError,
  );
});

Deno.test("buildNovelSearchApiParams rejects whitespace-only search terms", () => {
  assertThrows(
    () =>
      buildNovelSearchApiParams({
        word: "   ",
      }),
    InvalidSearchParameterError,
  );
});

Deno.test("InvalidSearchParameterError does not expose rejected values", () => {
  const error = new InvalidSearchParameterError("word");

  assertEquals(error.message, "Invalid word");
});

Deno.test("buildNovelSearchErrorResponse maps public search validation failures", () => {
  assertJsonEquals(buildNovelSearchErrorResponse(new MissingNovelSearchKeywordError()), {
    body: { error: "Missing search keyword" },
    status: 400,
    shouldLog: false,
  });
  assertJsonEquals(buildNovelSearchErrorResponse(new InvalidSearchParameterError("page")), {
    body: { error: "Invalid page" },
    status: 400,
    shouldLog: false,
  });
  assertEquals(buildNovelSearchErrorResponse(new Error("boom")), null);
});

Deno.test("buildNovelSearchPagination caps estimated pages to supported page maximum", () => {
  const pagination = buildNovelSearchPagination({
    page: 99,
    hasMore: true,
    searchSpanLimit: 5000,
  });

  assertEquals(pagination.totalPages, 100);
  assertEquals(pagination.total, 3000);
});
