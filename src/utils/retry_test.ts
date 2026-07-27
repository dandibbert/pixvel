import { assertStrictEquals as assertEquals } from "../services/test_asserts.ts";
import { assertRejectsError } from "../services/test_asserts.ts";
import { isRetryableNetworkError, withRetry } from "./retry.ts";

Deno.test("withRetry resolves on first success", async () => {
  let calls = 0;
  const result = await withRetry(() => {
    calls++;
    return Promise.resolve(42);
  });
  assertEquals(calls, 1);
  assertEquals(result, 42);
});

Deno.test("withRetry retries on network errors up to maxRetries then resolves", async () => {
  let calls = 0;
  const result = await withRetry(() => {
    calls++;
    if (calls < 3) return Promise.reject(new Error("fetch failed"));
    return Promise.resolve("ok");
  }, 2);
  assertEquals(calls, 3);
  assertEquals(result, "ok");
});

Deno.test("withRetry does not retry on rate limit errors", async () => {
  let calls = 0;
  await assertRejectsError(
    async () => {
      await withRetry(() => {
        calls++;
        return Promise.reject(new Error("Rate Limit exceeded"));
      }, 5);
    },
    Error,
  );
  assertEquals(calls, 1);
});

Deno.test("withRetry does not retry on non-network errors", async () => {
  let calls = 0;
  await assertRejectsError(
    async () => {
      await withRetry(() => {
        calls++;
        return Promise.reject(new Error("something unexpected"));
      }, 5);
    },
    Error,
  );
  assertEquals(calls, 1);
});

Deno.test("withRetry exhausts retries and rethrows the last error", async () => {
  let calls = 0;
  await assertRejectsError(
    async () => {
      await withRetry(() => {
        calls++;
        return Promise.reject(new Error("ETIMEDOUT"));
      }, 2);
    },
    Error,
  );
  assertEquals(calls, 3);
});

Deno.test("withRetry retries on all recognized network error messages", async () => {
  const networkMessages = [
    "fetch failed",
    "network error",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
  ];

  for (const message of networkMessages) {
    let calls = 0;
    await assertRejectsError(
      async () => {
        await withRetry(() => {
          calls++;
          return Promise.reject(new Error(message));
        }, 1);
      },
      Error,
    );
    assertEquals(calls, 2);
  }
});

Deno.test("isRetryableNetworkError recognizes real Deno fetch transport errors", () => {
  // Deno throws TypeError for transport failures
  assertEquals(
    isRetryableNetworkError(
      new TypeError(
        "error sending request for url (https://app-api.pixiv.net/): client error (Connect): tcp connect error: Connection refused (os error 61)",
      ),
    ),
    true,
  );
  // Same message shape but generic Error (e.g. re-wrapped upstream)
  assertEquals(
    isRetryableNetworkError(new Error("error sending request for url (https://x): dns error")),
    true,
  );
  // AbortSignal.timeout produces a DOMException named TimeoutError
  const timeoutError = new Error("Signal timed out.");
  timeoutError.name = "TimeoutError";
  assertEquals(isRetryableNetworkError(timeoutError), true);
});

Deno.test("isRetryableNetworkError rejects application-level errors", () => {
  assertEquals(isRetryableNetworkError(new Error("Pixiv API error (404): Not Found")), false);
  assertEquals(isRetryableNetworkError(new Error("OAuth error: Token expired or invalid")), false);
  assertEquals(isRetryableNetworkError(new Error("something unexpected")), false);
});

Deno.test("withRetry retries Deno-shaped TypeError transport failures then resolves", async () => {
  let calls = 0;
  const result = await withRetry(() => {
    calls++;
    if (calls < 2) {
      return Promise.reject(
        new TypeError("error sending request for url (https://x): tcp connect error"),
      );
    }
    return Promise.resolve("ok");
  }, 2);
  assertEquals(calls, 2);
  assertEquals(result, "ok");
});
