import { assertExactJsonEquals as assertEquals } from "./test_asserts.ts";
import {
  buildCaughtRouteErrorBody,
  buildRouteErrorBody,
  buildRouteErrorResponse,
  buildRouteParameterErrorBody,
  buildRouteParameterErrorResponse,
  buildRoutePublicClientErrorResponse,
  buildRoutePublicErrorResponse,
  buildRouteStatusErrorResponse,
  buildSuccessResponse,
  buildLoggedRouteErrorResponse,
  logRouteError,
} from "./route_response.ts";
import { InvalidRouteParameterError, MissingRouteParameterError } from "./route_params.ts";

Deno.test("buildRouteErrorBody creates stable public error payloads", () => {
  assertEquals(buildRouteErrorBody("Invalid page"), { error: "Invalid page" });
  assertEquals(buildRouteErrorBody("Failed to fetch", "HTTP 500"), {
    error: "Failed to fetch",
    message: "HTTP 500",
  });
});

Deno.test("buildCaughtRouteErrorBody includes only Error messages as details", () => {
  assertEquals(buildCaughtRouteErrorBody("Failed to fetch", new Error("HTTP 500")), {
    error: "Failed to fetch",
    message: "HTTP 500",
  });
  assertEquals(buildCaughtRouteErrorBody("Failed to fetch", "raw failure"), {
    error: "Failed to fetch",
  });
});

Deno.test("buildRouteParameterErrorBody maps route parameter errors to public 400 payloads", () => {
  assertEquals(
    buildRouteParameterErrorBody(new MissingRouteParameterError("Missing novel ID")),
    { error: "Missing novel ID" },
  );
  assertEquals(
    buildRouteParameterErrorBody(new InvalidRouteParameterError("novel ID")),
    { error: "Invalid novel ID" },
  );
});

Deno.test("buildRouteParameterErrorBody ignores unrelated errors", () => {
  assertEquals(buildRouteParameterErrorBody(new Error("Database failed")), null);
  assertEquals(buildRouteParameterErrorBody("raw failure"), null);
});

Deno.test("buildRouteParameterErrorResponse wraps parameter error bodies with status codes", () => {
  assertEquals(
    buildRouteParameterErrorResponse(new MissingRouteParameterError("Missing novel ID")),
    {
      body: { error: "Missing novel ID" },
      status: 400,
      shouldLog: false,
    },
  );
  assertEquals(buildRouteParameterErrorResponse(new Error("Database failed")), null);
});

Deno.test("buildRoutePublicClientErrorResponse creates public non-loggable client errors", () => {
  assertEquals(buildRoutePublicClientErrorResponse("Invalid search"), {
    body: { error: "Invalid search" },
    status: 400,
    shouldLog: false,
  });
});

Deno.test("buildRouteErrorResponse returns non-loggable 400 responses for route parameter errors", () => {
  assertEquals(
    buildRouteErrorResponse(
      new MissingRouteParameterError("Missing novel ID"),
      "Failed to fetch novel",
    ),
    {
      body: { error: "Missing novel ID" },
      status: 400,
      shouldLog: false,
    },
  );
});

Deno.test("buildRouteErrorResponse returns loggable 500 responses for unexpected errors", () => {
  assertEquals(
    buildRouteErrorResponse(new Error("Pixiv failed"), "Failed to fetch novel"),
    {
      body: {
        error: "Failed to fetch novel",
        message: "Pixiv failed",
      },
      status: 500,
      shouldLog: true,
    },
  );
});

Deno.test("buildRoutePublicErrorResponse returns loggable fallback bodies without cause details", () => {
  assertEquals(
    buildRoutePublicErrorResponse(new Error("Pixiv leaked detail"), "Search failed", 500),
    {
      body: { error: "Search failed" },
      status: 500,
      shouldLog: true,
    },
  );
});

Deno.test("buildRoutePublicErrorResponse keeps parameter errors non-loggable", () => {
  assertEquals(
    buildRoutePublicErrorResponse(
      new MissingRouteParameterError("Missing search keyword"),
      "Search failed",
      500,
    ),
    {
      body: { error: "Missing search keyword" },
      status: 400,
      shouldLog: false,
    },
  );
});

Deno.test("buildRouteStatusErrorResponse wraps non-500 route failures with Error details", () => {
  assertEquals(
    buildRouteStatusErrorResponse(
      new Error("No text content"),
      "Novel content not available",
      404,
    ),
    {
      body: {
        error: "Novel content not available",
        message: "No text content",
      },
      status: 404,
      shouldLog: true,
    },
  );
});

Deno.test("logRouteError delegates loggable route failures to an injected logger", () => {
  const calls: unknown[][] = [];
  const response = buildRouteErrorResponse(new Error("Pixiv failed"), "Failed to fetch novel");

  logRouteError(
    response,
    "Novel detail error:",
    new Error("Pixiv failed"),
    (label: string, value: unknown) => {
      calls.push([label, value]);
    },
  );

  assertEquals(calls.length, 1);
  assertEquals(calls[0][0], "Novel detail error:");
  assertEquals((calls[0][1] as Error).message, "Pixiv failed");
});

Deno.test("logRouteError skips non-loggable route failures", () => {
  const calls: unknown[][] = [];
  const response = buildRouteErrorResponse(
    new MissingRouteParameterError("Missing novel ID"),
    "Failed to fetch novel",
  );

  logRouteError(
    response,
    "Novel detail error:",
    new Error("should not log"),
    (label: string, value: unknown) => {
      calls.push([label, value]);
    },
  );

  assertEquals(calls, []);
});

Deno.test("buildLoggedRouteErrorResponse builds standard responses and logs only loggable errors", () => {
  const calls: unknown[][] = [];
  const logger = (label: string, value: unknown) => {
    calls.push([label, value]);
  };
  const unexpectedError = new Error("Pixiv failed");

  assertEquals(
    buildLoggedRouteErrorResponse(
      unexpectedError,
      "Failed to fetch novel",
      "Novel detail error:",
      logger,
    ),
    {
      body: {
        error: "Failed to fetch novel",
        message: "Pixiv failed",
      },
      status: 500,
      shouldLog: true,
    },
  );
  assertEquals(calls.length, 1);
  assertEquals(calls[0][0], "Novel detail error:");
  assertEquals((calls[0][1] as Error).message, "Pixiv failed");

  assertEquals(
    buildLoggedRouteErrorResponse(
      new MissingRouteParameterError("Missing novel ID"),
      "Failed to fetch novel",
      "Novel detail error:",
      logger,
    ),
    {
      body: { error: "Missing novel ID" },
      status: 400,
      shouldLog: false,
    },
  );
  assertEquals(calls.length, 1);
});

Deno.test("buildSuccessResponse creates shared success payloads", () => {
  assertEquals(buildSuccessResponse(), { success: true });
});
