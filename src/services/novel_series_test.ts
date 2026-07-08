import { assertJsonEquals as assertEquals } from "./test_asserts.ts";
import {
  buildNovelTextApiPath,
  buildNovelSeriesPageApiPath,
  resolvePixivNovelSeries,
} from "./novel_series.ts";

Deno.test("buildNovelTextApiPath returns the novel text endpoint", () => {
  assertEquals(buildNovelTextApiPath(123), "/v1/novel/text?novel_id=123");
});

Deno.test("buildNovelSeriesPageApiPath returns the series page endpoint with default offset", () => {
  assertEquals(buildNovelSeriesPageApiPath(456), "/v2/novel/series?series_id=456");
});

Deno.test("buildNovelSeriesPageApiPath includes offset when provided", () => {
  assertEquals(buildNovelSeriesPageApiPath(456, 60), "/v2/novel/series?series_id=456&offset=60");
});

function createClient(responses: Record<string, unknown>) {
  const calls: string[] = [];

  return {
    calls,
    client: {
      fetch: (path: string) => {
        calls.push(path);
        const response = responses[path];
        if (response instanceof Error) {
          return Promise.reject(response);
        }
        if (response === undefined) {
          throw new Error(`Unexpected request: ${path}`);
        }
        return Promise.resolve(response);
      },
    },
  };
}

Deno.test("resolvePixivNovelSeries uses hinted series and text API neighbors", async () => {
  const { calls, client } = createClient({
    "/v1/novel/text?novel_id=123": {
      series_prev: { id: 122, title: "Previous" },
      series_next: { id: 124, title: "Next" },
    },
  });

  const result = await resolvePixivNovelSeries({
    novelId: 123,
    hintedSeriesId: 999,
    hintedSeriesTitle: "Hinted title",
    client,
  });

  assertEquals(result, {
    id: "999",
    title: "Hinted title",
    prev_novel: { id: "122", title: "Previous" },
    next_novel: { id: "124", title: "Next" },
  });
  assertEquals(calls, ["/v1/novel/text?novel_id=123"]);
});

Deno.test("resolvePixivNovelSeries returns null when detail has no series", async () => {
  const { calls, client } = createClient({
    "/v2/novel/detail?novel_id=123": {
      novel: {
        id: 123,
        title: "Standalone",
        series: null,
      },
    },
  });

  const result = await resolvePixivNovelSeries({ novelId: 123, client });

  assertEquals(result, null);
  assertEquals(calls, ["/v2/novel/detail?novel_id=123"]);
});

Deno.test("resolvePixivNovelSeries gets missing series hints from novel detail", async () => {
  const { calls, client } = createClient({
    "/v2/novel/detail?novel_id=123": {
      novel: {
        id: 123,
        title: "Current",
        series: { id: 456, title: "Detail series" },
      },
    },
    "/v1/novel/text?novel_id=123": {
      series_prev: null,
      series_next: { id: 124, title: "Next" },
    },
  });

  const result = await resolvePixivNovelSeries({ novelId: 123, client });

  assertEquals(result, {
    id: "456",
    title: "Detail series",
    next_novel: { id: "124", title: "Next" },
  });
  assertEquals(calls, [
    "/v2/novel/detail?novel_id=123",
    "/v1/novel/text?novel_id=123",
  ]);
});

Deno.test("resolvePixivNovelSeries falls back to series pagination when text API fails", async () => {
  const { calls, client } = createClient({
    "/v1/novel/text?novel_id=123": new Error("text unavailable"),
    "/v2/novel/series?series_id=456": {
      novel_series_detail: { id: 456, title: "Paged series" },
      novels: [
        { id: 122, title: "Previous" },
        { id: 123, title: "Current" },
        { id: 124, title: "Next" },
      ],
      next_url: null,
    },
  });

  const result = await resolvePixivNovelSeries({
    novelId: 123,
    hintedSeriesId: 456,
    client,
  });

  assertEquals(result, {
    id: "456",
    title: "Paged series",
    prev_novel: { id: "122", title: "Previous" },
    next_novel: { id: "124", title: "Next" },
  });
  assertEquals(calls, [
    "/v1/novel/text?novel_id=123",
    "/v2/novel/series?series_id=456",
  ]);
});

Deno.test("resolvePixivNovelSeries stops paginated fallback after safety cap", async () => {
  const responses: Record<string, unknown> = {
    "/v1/novel/text?novel_id=123": new Error("text unavailable"),
  };

  for (let page = 1; page <= 30; page += 1) {
    responses[`/v2/novel/series?series_id=456${page === 1 ? "" : `&offset=${(page - 1) * 30}`}`] = {
      novel_series_detail: { id: 456, title: "Paged series" },
      novels: [{ id: page, title: `Novel ${page}` }],
      next_url: `/v2/novel/series?series_id=456&offset=${page * 30}`,
    };
  }

  const { calls, client } = createClient(responses);

  const result = await resolvePixivNovelSeries({
    novelId: 123,
    hintedSeriesId: 456,
    client,
  });

  assertEquals(result, {
    id: "456",
    title: "Paged series",
  });
  assertEquals(calls.length, 31);
});
