import {
  assertJsonEquals as assertEquals,
  assertStrictEquals,
} from "./test_asserts.ts";
import {
  arrayOrEmpty,
  firstNonEmptyString,
  mapArrayOrEmpty,
  numberOrZero,
  stringOrEmpty,
} from "./default_values.ts";

Deno.test("stringOrEmpty converts present values and defaults absent values", () => {
  assertStrictEquals(stringOrEmpty("title"), "title");
  assertStrictEquals(stringOrEmpty(123), "123");
  assertStrictEquals(stringOrEmpty(undefined), "");
  assertStrictEquals(stringOrEmpty(null), "");
});

Deno.test("numberOrZero preserves present numbers and defaults absent or falsy values", () => {
  assertStrictEquals(numberOrZero(5), 5);
  assertStrictEquals(numberOrZero(0), 0);
  assertStrictEquals(numberOrZero(undefined), 0);
  assertStrictEquals(numberOrZero(null), 0);
  assertStrictEquals(numberOrZero(Number.NaN), 0);
});

Deno.test("firstNonEmptyString returns the first present non-empty value", () => {
  assertStrictEquals(firstNonEmptyString("", undefined, "fallback"), "fallback");
  assertStrictEquals(firstNonEmptyString(null, "first", "second"), "first");
  assertStrictEquals(firstNonEmptyString(undefined, ""), "");
});

Deno.test("arrayOrEmpty preserves arrays and defaults absent arrays", () => {
  const values = [{ id: 1 }, { id: 2 }];

  assertStrictEquals(arrayOrEmpty(values), values);
  assertEquals(arrayOrEmpty(undefined), []);
  assertEquals(arrayOrEmpty(null), []);
});

Deno.test("mapArrayOrEmpty maps present arrays and defaults absent arrays", () => {
  assertEquals(
    mapArrayOrEmpty([{ name: "tag-a" }, { name: "tag-b" }], (tag: { name: string }) => tag.name),
    ["tag-a", "tag-b"],
  );
  assertEquals(mapArrayOrEmpty(undefined, (tag: { name: string }) => tag.name), []);
  assertEquals(mapArrayOrEmpty(null, (tag: { name: string }) => tag.name), []);
});
