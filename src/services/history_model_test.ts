import {
  assertJsonEquals as assertEquals,
  assertThrowsError as assertThrows,
} from "./test_asserts.ts";
import {
  buildHistoryListResponse,
  buildHistoryListRouteRequest,
  buildHistoryPositionErrorResponse,
  buildHistoryPositionUpdate,
  buildReadingPositionResponse,
  buildReadingPositionRouteRequest,
  buildTimestampedHistoryPositionUpdate,
  MissingHistoryPositionParameterError,
  parseReadingPosition,
} from "./history_model.ts";
import { InvalidRouteParameterError } from "./route_params.ts";

Deno.test("parseReadingPosition accepts safe non-negative integer positions", () => {
  assertEquals(parseReadingPosition(0), 0);
  assertEquals(parseReadingPosition(12), 12);
  assertEquals(parseReadingPosition("12"), 12);
});

Deno.test("parseReadingPosition rejects missing, negative, partial, decimal, and unsafe values", () => {
  assertThrows(() => parseReadingPosition(undefined), InvalidRouteParameterError);
  assertThrows(() => parseReadingPosition(-1), InvalidRouteParameterError);
  assertThrows(() => parseReadingPosition("2abc"), InvalidRouteParameterError);
  assertThrows(() => parseReadingPosition(1.5), InvalidRouteParameterError);
  assertThrows(() => parseReadingPosition(Number.MAX_SAFE_INTEGER + 1), InvalidRouteParameterError);
});

Deno.test("parseReadingPosition errors do not leak rejected values", () => {
  try {
    parseReadingPosition("2abc");
  } catch (error) {
    assertEquals((error as Error).message, "Invalid position");
  }
});

Deno.test("buildHistoryPositionUpdate normalizes complete history writes", () => {
  assertEquals(
    buildHistoryPositionUpdate({
      body: {
        novelId: "123",
        position: 4,
        title: "Novel title",
        coverUrl: "cover.jpg",
      },
      now: 1000,
    }),
    {
      novelId: 123,
      position: 4,
      updatedAt: 1000,
      historyEntry: {
        novelId: 123,
        title: "Novel title",
        coverUrl: "cover.jpg",
        lastReadAt: 1000,
        position: 4,
      },
    },
  );
});

Deno.test("buildHistoryPositionUpdate skips history entry when title or cover URL is absent", () => {
  assertEquals(
    buildHistoryPositionUpdate({
      body: {
        novelId: 123,
        position: 0,
        title: "Novel title",
        coverUrl: "",
      },
      now: 1000,
    }),
    {
      novelId: 123,
      position: 0,
      updatedAt: 1000,
      historyEntry: null,
    },
  );
});

Deno.test("buildTimestampedHistoryPositionUpdate delegates timestamp creation to the injected clock", () => {
  assertEquals(
    buildTimestampedHistoryPositionUpdate({
      body: {
        novelId: "123",
        position: 4,
        title: "Novel title",
        coverUrl: "cover.jpg",
      },
      now: () => 2000,
    }),
    {
      novelId: 123,
      position: 4,
      updatedAt: 2000,
      historyEntry: {
        novelId: 123,
        title: "Novel title",
        coverUrl: "cover.jpg",
        lastReadAt: 2000,
        position: 4,
      },
    },
  );
});

Deno.test("buildHistoryPositionUpdate rejects non-object request bodies", () => {
  assertThrows(
    () => buildHistoryPositionUpdate({ body: null, now: 1000 }),
    InvalidRouteParameterError,
  );
  assertThrows(
    () => buildHistoryPositionUpdate({ body: "bad", now: 1000 }),
    InvalidRouteParameterError,
  );
});

Deno.test("buildHistoryPositionUpdate preserves missing novelId or position errors", () => {
  assertThrows(
    () => buildHistoryPositionUpdate({ body: { novelId: 123 }, now: 1000 }),
    MissingHistoryPositionParameterError,
  );
  assertThrows(
    () => buildHistoryPositionUpdate({ body: { position: 0 }, now: 1000 }),
    MissingHistoryPositionParameterError,
  );

  try {
    buildHistoryPositionUpdate({ body: { novelId: 123 }, now: 1000 });
  } catch (error) {
    assertEquals((error as Error).message, "Missing novelId or position");
  }
});

Deno.test("buildHistoryPositionErrorResponse maps missing payload fields to public 400 responses", () => {
  assertEquals(
    buildHistoryPositionErrorResponse(new MissingHistoryPositionParameterError()),
    {
      body: { error: "Missing novelId or position" },
      status: 400,
      shouldLog: false,
    },
  );
  assertEquals(buildHistoryPositionErrorResponse(new Error("boom")), null);
});

Deno.test("buildReadingPositionRouteRequest parses route novel IDs", () => {
  assertEquals(buildReadingPositionRouteRequest({ novelId: "123" }), {
    novelId: 123,
  });
});

Deno.test("buildReadingPositionRouteRequest preserves novel ID validation", () => {
  try {
    buildReadingPositionRouteRequest({ novelId: "bad-novel" });
  } catch (error) {
    if (error instanceof InvalidRouteParameterError) {
      assertEquals(error.message, "Invalid novel ID");
      return;
    }
    throw error;
  }

  throw new Error("Expected InvalidRouteParameterError");
});

Deno.test("buildReadingPositionResponse preserves stored positions and defaults missing positions", () => {
  assertEquals(buildReadingPositionResponse(null), {
    position: 0,
    updatedAt: null,
  });

  assertEquals(buildReadingPositionResponse({ position: 12, updatedAt: 1000 }), {
    position: 12,
    updatedAt: 1000,
  });
});

Deno.test("buildHistoryListRouteRequest parses route limits", () => {
  assertEquals(buildHistoryListRouteRequest({ limit: "25" }), {
    limit: 25,
  });
  assertEquals(buildHistoryListRouteRequest({ limit: undefined }), {
    limit: 50,
  });
});

Deno.test("buildHistoryListRouteRequest preserves safe limit validation", () => {
  try {
    buildHistoryListRouteRequest({ limit: "1<script>" });
  } catch (error) {
    if (error instanceof InvalidRouteParameterError) {
      assertEquals(error.message, "Invalid limit");
      return;
    }
    throw error;
  }

  throw new Error("Expected InvalidRouteParameterError");
});

Deno.test("buildHistoryListResponse wraps reading history entries", () => {
  const entry = {
    novelId: 123,
    title: "Novel title",
    coverUrl: "cover.jpg",
    lastReadAt: 1000,
    position: 4,
  };

  assertEquals(buildHistoryListResponse([entry]), {
    history: [entry],
  });
});
