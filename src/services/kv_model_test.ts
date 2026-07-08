import { assertExactJsonEquals as assertEquals } from "./test_asserts.ts";
import {
  buildHistoryKey,
  buildHistoryPrefix,
  buildPositionKey,
  buildReadingPositionRecord,
  buildSessionKey,
  buildTimestampedReadingPositionRecord,
  sortHistoryEntriesByRecency,
} from "./kv_model.ts";
import type { HistoryEntry } from "./kv_store.ts";

Deno.test("kv key builders keep storage namespaces consistent", () => {
  assertEquals(buildSessionKey("session-1"), ["session", "session-1"]);
  assertEquals(buildHistoryKey("user-1", 123), ["history", "user-1", "123"]);
  assertEquals(buildHistoryPrefix("user-1"), ["history", "user-1"]);
  assertEquals(buildPositionKey("user-1", 123), ["position", "user-1", "123"]);
});

Deno.test("sortHistoryEntriesByRecency returns a limited newest-first copy", () => {
  const oldest: HistoryEntry = {
    novelId: 1,
    title: "oldest",
    coverUrl: "oldest.jpg",
    lastReadAt: 100,
    position: 1,
  };
  const newest: HistoryEntry = {
    novelId: 2,
    title: "newest",
    coverUrl: "newest.jpg",
    lastReadAt: 300,
    position: 3,
  };
  const middle: HistoryEntry = {
    novelId: 3,
    title: "middle",
    coverUrl: "middle.jpg",
    lastReadAt: 200,
    position: 2,
  };
  const entries = [oldest, newest, middle];

  const sorted = sortHistoryEntriesByRecency(entries, 2);

  assertEquals(sorted.map((entry) => entry.title), ["newest", "middle"]);
  assertEquals(entries.map((entry) => entry.title), ["oldest", "newest", "middle"]);
});

Deno.test("buildReadingPositionRecord stores position with update timestamp", () => {
  assertEquals(buildReadingPositionRecord(12, 123456), {
    position: 12,
    updatedAt: 123456,
  });
});

Deno.test("buildTimestampedReadingPositionRecord uses explicit timestamps or an injected clock", () => {
  assertEquals(
    buildTimestampedReadingPositionRecord({
      position: 12,
      updatedAt: 123456,
      now: () => 999999,
    }),
    {
      position: 12,
      updatedAt: 123456,
    },
  );

  assertEquals(
    buildTimestampedReadingPositionRecord({
      position: 12,
      now: () => 999999,
    }),
    {
      position: 12,
      updatedAt: 999999,
    },
  );
});
