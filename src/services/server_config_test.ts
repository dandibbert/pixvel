import { assertStrictEquals as assertEquals } from "./test_asserts.ts";
import { parseServerPort } from "./server_config.ts";

Deno.test("parseServerPort returns the default port when the value is missing or blank", () => {
  assertEquals(parseServerPort(undefined), 8000);
  assertEquals(parseServerPort(null), 8000);
  assertEquals(parseServerPort(""), 8000);
  assertEquals(parseServerPort("   "), 8000);
});

Deno.test("parseServerPort accepts valid TCP port numbers", () => {
  assertEquals(parseServerPort("1"), 1);
  assertEquals(parseServerPort("3000"), 3000);
  assertEquals(parseServerPort(" 65535 "), 65535);
});

Deno.test("parseServerPort rejects malformed and out-of-range values", () => {
  assertEquals(parseServerPort("abc"), 8000);
  assertEquals(parseServerPort("3000abc"), 8000);
  assertEquals(parseServerPort("3000.5"), 8000);
  assertEquals(parseServerPort("0"), 8000);
  assertEquals(parseServerPort("65536"), 8000);
});

Deno.test("parseServerPort supports an explicit fallback port", () => {
  assertEquals(parseServerPort("invalid", 9000), 9000);
});
