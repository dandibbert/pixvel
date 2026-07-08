import { assertStrictEquals as assertEquals } from "./test_asserts.ts";
import { buildUrlSearchParams } from "./url_search_params.ts";

Deno.test("buildUrlSearchParams converts primitive values in insertion order", () => {
  assertEquals(
    buildUrlSearchParams({
      word: "五 悠",
      page: 2,
      include_policy: true,
    }).toString(),
    "word=%E4%BA%94+%E6%82%A0&page=2&include_policy=true",
  );
});

Deno.test("buildUrlSearchParams returns an independent URLSearchParams instance", () => {
  const params = buildUrlSearchParams({ user_id: "123" });

  params.set("offset", "60");

  assertEquals(params.toString(), "user_id=123&offset=60");
});
