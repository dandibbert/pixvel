import {
  assertStrictEquals as assertEquals,
  assertThrowsError as assertThrows,
  assertThrowsErrorMessage as assertThrowsMessage,
} from "./test_asserts.ts";
import {
  buildPixivPagedParams,
  calculatePixivOffset,
  InvalidRouteParameterError,
  MissingRouteParameterError,
  parsePositiveIntegerParameter,
  parseRequiredNovelIdParameter,
  parseRequiredPositiveIntegerParameter,
} from "./route_params.ts";

Deno.test("parsePositiveIntegerParameter parses strict positive integer strings", () => {
  assertEquals(parsePositiveIntegerParameter("novel ID", "123"), 123);
  assertEquals(parsePositiveIntegerParameter("novel ID", 123), 123);
});

Deno.test("parsePositiveIntegerParameter applies a default for absent optional values", () => {
  assertEquals(parsePositiveIntegerParameter("page", undefined, { defaultValue: 1 }), 1);
  assertEquals(parsePositiveIntegerParameter("page", "", { defaultValue: 1 }), 1);
});

Deno.test("parsePositiveIntegerParameter rejects partial, zero, decimal, and unsafe values", () => {
  assertThrows(
    () => parsePositiveIntegerParameter("page", "2abc"),
    InvalidRouteParameterError,
  );
  assertThrows(
    () => parsePositiveIntegerParameter("page", "0"),
    InvalidRouteParameterError,
  );
  assertThrows(
    () => parsePositiveIntegerParameter("page", "1.5"),
    InvalidRouteParameterError,
  );
  assertThrows(
    () => parsePositiveIntegerParameter("page", "9007199254740992"),
    InvalidRouteParameterError,
  );
});

Deno.test("parsePositiveIntegerParameter enforces optional upper bounds", () => {
  assertEquals(parsePositiveIntegerParameter("limit", "50", { max: 100 }), 50);
  assertThrows(
    () => parsePositiveIntegerParameter("limit", "101", { max: 100 }),
    InvalidRouteParameterError,
  );
});

Deno.test("InvalidRouteParameterError does not expose rejected values", () => {
  assertEquals(new InvalidRouteParameterError("page").message, "Invalid page");
});

Deno.test("parseRequiredPositiveIntegerParameter preserves explicit missing parameter messages", () => {
  assertEquals(
    parseRequiredPositiveIntegerParameter("novel ID", "123", "Missing novel ID"),
    123,
  );
  assertThrowsMessage(
    () => parseRequiredPositiveIntegerParameter("novel ID", undefined, "Missing novel ID"),
    MissingRouteParameterError,
    "Missing novel ID",
  );
  assertThrowsMessage(
    () => parseRequiredPositiveIntegerParameter("novel ID", "", "Missing novel ID"),
    MissingRouteParameterError,
    "Missing novel ID",
  );
});

Deno.test("parseRequiredPositiveIntegerParameter keeps invalid values distinct from missing values", () => {
  assertThrowsMessage(
    () => parseRequiredPositiveIntegerParameter("novel ID", "abc", "Missing novel ID"),
    InvalidRouteParameterError,
    "Invalid novel ID",
  );
});

Deno.test("parseRequiredNovelIdParameter applies shared novel route errors", () => {
  assertEquals(parseRequiredNovelIdParameter("123"), 123);
  assertThrowsMessage(
    () => parseRequiredNovelIdParameter(undefined),
    MissingRouteParameterError,
    "Missing novel ID",
  );
  assertThrowsMessage(
    () => parseRequiredNovelIdParameter("abc"),
    InvalidRouteParameterError,
    "Invalid novel ID",
  );
});

Deno.test("calculatePixivOffset converts one-based pages to API offsets", () => {
  assertEquals(calculatePixivOffset(1), 0);
  assertEquals(calculatePixivOffset(3), 60);
  assertEquals(calculatePixivOffset(3, 10), 20);
});

Deno.test("buildPixivPagedParams preserves base params and omits zero offsets", () => {
  assertEquals(
    buildPixivPagedParams({ user_id: "123" }, 0).toString(),
    "user_id=123",
  );
  assertEquals(
    buildPixivPagedParams({ user_id: "123", filter: "for_android" }, 60).toString(),
    "user_id=123&filter=for_android&offset=60",
  );
});
