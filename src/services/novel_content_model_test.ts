import { assertExactJsonEquals as assertEquals } from "./test_asserts.ts";
import { NovelContentUnavailableError } from "./novel_content.ts";
import { buildNovelContentErrorResponse } from "./novel_content_model.ts";
import { MissingRouteParameterError } from "./route_params.ts";

Deno.test("buildNovelContentErrorResponse keeps parameter errors public and unlogged", () => {
  assertEquals(
    buildNovelContentErrorResponse(new MissingRouteParameterError("Missing novel ID")),
    {
      body: { error: "Missing novel ID" },
      status: 400,
      shouldLog: false,
      logLabel: "",
      logValue: undefined,
    },
  );
});

Deno.test("buildNovelContentErrorResponse maps unavailable content to the route 404 policy", () => {
  assertEquals(
    buildNovelContentErrorResponse(
      new NovelContentUnavailableError("The novel text is empty or unavailable"),
    ),
    {
      body: {
        error: "Novel content not available",
        message: "The novel text is empty or unavailable",
      },
      status: 404,
      shouldLog: true,
      logLabel: "Novel content unavailable:",
      logValue: "The novel text is empty or unavailable",
    },
  );
});

Deno.test("buildNovelContentErrorResponse maps unexpected errors to the route 500 policy", () => {
  const error = new Error("Pixiv API error (503): Service Unavailable");

  assertEquals(buildNovelContentErrorResponse(error), {
    body: {
      error: "Failed to fetch novel content",
      message: "Pixiv API error (503): Service Unavailable",
    },
    status: 500,
    shouldLog: true,
    logLabel: "Novel content error:",
    logValue: error,
  });
});
