import { InvalidRouteParameterError, MissingRouteParameterError } from "./route_params.ts";

export interface RouteErrorBody {
  error: string;
  message?: string;
}

export interface RouteSuccessBody {
  success: true;
}

export interface RouteErrorResponse {
  body: RouteErrorBody;
  status: 400 | 404 | 500;
  shouldLog: boolean;
}

export type RouteErrorLogger = (label: string, value: unknown) => void;

export function buildRouteErrorBody(error: string, message?: string): RouteErrorBody {
  if (!message) {
    return { error };
  }

  return { error, message };
}

export function buildCaughtRouteErrorBody(error: string, cause: unknown): RouteErrorBody {
  return buildRouteErrorBody(error, cause instanceof Error ? cause.message : undefined);
}

export function buildRouteParameterErrorBody(error: unknown): RouteErrorBody | null {
  if (
    error instanceof MissingRouteParameterError ||
    error instanceof InvalidRouteParameterError
  ) {
    return buildRouteErrorBody(error.message);
  }

  return null;
}

export function buildRouteParameterErrorResponse(error: unknown): RouteErrorResponse | null {
  const body = buildRouteParameterErrorBody(error);

  if (!body) {
    return null;
  }

  return buildRoutePublicClientErrorResponse(body.error);
}

export function buildRoutePublicClientErrorResponse(error: string): RouteErrorResponse {
  return {
    body: buildRouteErrorBody(error),
    status: 400,
    shouldLog: false,
  };
}

export function buildRouteErrorResponse(
  error: unknown,
  fallbackError: string,
): RouteErrorResponse {
  const parameterErrorResponse = buildRouteParameterErrorResponse(error);

  if (parameterErrorResponse) {
    return parameterErrorResponse;
  }

  return {
    body: buildCaughtRouteErrorBody(fallbackError, error),
    status: 500,
    shouldLog: true,
  };
}

export function buildRoutePublicErrorResponse(
  error: unknown,
  fallbackError: string,
  status: RouteErrorResponse["status"],
): RouteErrorResponse {
  const parameterErrorResponse = buildRouteParameterErrorResponse(error);

  if (parameterErrorResponse) {
    return parameterErrorResponse;
  }

  return {
    body: buildRouteErrorBody(fallbackError),
    status,
    shouldLog: true,
  };
}

export function buildRouteStatusErrorResponse(
  error: unknown,
  fallbackError: string,
  status: RouteErrorResponse["status"],
): RouteErrorResponse {
  return {
    body: buildCaughtRouteErrorBody(fallbackError, error),
    status,
    shouldLog: true,
  };
}

export function logRouteError(
  response: Pick<RouteErrorResponse, "shouldLog">,
  label: string,
  value: unknown,
  logger: RouteErrorLogger = console.error,
) {
  if (response.shouldLog) {
    logger(label, value);
  }
}

export function buildLoggedRouteErrorResponse(
  error: unknown,
  fallbackError: string,
  logLabel: string,
  logger: RouteErrorLogger = console.error,
): RouteErrorResponse {
  const response = buildRouteErrorResponse(error, fallbackError);

  logRouteError(response, logLabel, error, logger);

  return response;
}

export function buildSuccessResponse(): RouteSuccessBody {
  return { success: true };
}
