import { NovelContentUnavailableError } from "./novel_content.ts";
import {
  buildRouteErrorResponse,
  buildRouteParameterErrorResponse,
  buildRouteStatusErrorResponse,
  type RouteErrorResponse,
} from "./route_response.ts";

export interface NovelContentErrorResponse extends RouteErrorResponse {
  logLabel: string;
  logValue?: unknown;
}

export function buildNovelContentErrorResponse(error: unknown): NovelContentErrorResponse {
  const parameterErrorResponse = buildRouteParameterErrorResponse(error);
  if (parameterErrorResponse) {
    return {
      ...parameterErrorResponse,
      logLabel: "",
      logValue: undefined,
    };
  }

  if (error instanceof NovelContentUnavailableError) {
    return {
      ...buildRouteStatusErrorResponse(error, "Novel content not available", 404),
      logLabel: "Novel content unavailable:",
      logValue: error.message,
    };
  }

  return {
    ...buildRouteErrorResponse(error, "Failed to fetch novel content"),
    logLabel: "Novel content error:",
    logValue: error,
  };
}
