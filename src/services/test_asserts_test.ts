import {
  assertExactJsonEquals,
  assertJsonEquals,
  assertRejectsError,
  assertStrictEquals,
  assertThrowsError,
  assertThrowsErrorMessage,
} from "./test_asserts.ts";

Deno.test("assertJsonEquals compares nested objects independent of key insertion order", () => {
  assertJsonEquals(
    {
      b: 2,
      a: {
        d: 4,
        c: [{ z: 1, y: 2 }],
      },
    },
    {
      a: {
        c: [{ y: 2, z: 1 }],
        d: 4,
      },
      b: 2,
    },
  );
});

Deno.test("assertJsonEquals throws readable messages for different values", () => {
  try {
    assertJsonEquals({ value: 1 }, { value: 2 });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("Expected")) {
      throw error;
    }
    return;
  }

  throw new Error("Expected assertJsonEquals to throw");
});

Deno.test("assertExactJsonEquals preserves JSON stringification semantics", () => {
  assertExactJsonEquals({ value: 1 }, { value: 1 });
  assertThrowsError(
    () => assertExactJsonEquals({ left: 1, right: 2 }, { right: 2, left: 1 }),
    Error,
  );
});

Deno.test("assertStrictEquals compares values without coercion", () => {
  assertStrictEquals("1", "1");
  assertThrowsError(() => assertStrictEquals("1", 1), Error);
});

Deno.test("assertThrowsError accepts the expected error class", () => {
  const error = assertThrowsError(() => {
    throw new TypeError("bad type");
  }, TypeError);

  assertStrictEquals(error.message, "bad type");
});

Deno.test("assertThrowsError rejects missing or unexpected errors", () => {
  assertThrowsError(() => {
    try {
      assertThrowsError(() => undefined, TypeError);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Expected TypeError")) {
        throw error;
      }
    }
  }, Error);

  assertThrowsError(() => {
    assertThrowsError(() => {
      throw new Error("wrong");
    }, TypeError);
  }, Error);
});

Deno.test("assertThrowsErrorMessage verifies the expected error class and message", () => {
  assertThrowsErrorMessage(
    () => {
      throw new TypeError("bad type");
    },
    TypeError,
    "bad type",
  );

  assertThrowsError(() => {
    assertThrowsErrorMessage(
      () => {
        throw new TypeError("bad type");
      },
      TypeError,
      "different message",
    );
  }, Error);
});

Deno.test("assertRejectsError accepts the expected rejection error class", async () => {
  const error = await assertRejectsError(
    () => Promise.reject(new TypeError("bad async type")),
    TypeError,
  );

  assertStrictEquals(error.message, "bad async type");
});

Deno.test("assertRejectsError rejects resolved or unexpected errors", async () => {
  const resolvedError = await assertRejectsError(
    () => assertRejectsError(() => Promise.resolve(undefined), TypeError),
    Error,
  );
  if (!resolvedError.message.includes("Expected TypeError")) {
    throw resolvedError;
  }

  const unexpectedError = await assertRejectsError(
    () =>
      assertRejectsError(
        () => Promise.reject(new Error("wrong")),
        TypeError,
      ),
    Error,
  );
  if (!unexpectedError.message.includes("Expected TypeError")) {
    throw unexpectedError;
  }
});
