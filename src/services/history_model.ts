import type { HistoryEntry } from "./kv_store.ts";
import {
  InvalidRouteParameterError,
  parsePositiveIntegerParameter,
  parseRequiredNovelIdParameter,
} from "./route_params.ts";
import { buildRoutePublicClientErrorResponse, type RouteErrorResponse } from "./route_response.ts";

const NON_NEGATIVE_INTEGER_PATTERN = /^(0|[1-9]\d*)$/;

export interface HistoryPositionUpdate {
  novelId: number;
  position: number;
  updatedAt: number;
  historyEntry: HistoryEntry | null;
}

interface ReadingPosition {
  position: number;
  updatedAt: number;
}

export interface ReadingPositionRouteRequest {
  novelId: number;
}

export interface HistoryListRouteRequest {
  limit: number;
}

export class MissingHistoryPositionParameterError extends Error {
  constructor() {
    super("Missing novelId or position");
    this.name = "MissingHistoryPositionParameterError";
  }
}

export function parseReadingPosition(value: unknown): number {
  if (value === undefined || value === null || value === "") {
    throw new InvalidRouteParameterError("position");
  }

  const text = value.toString();
  if (!NON_NEGATIVE_INTEGER_PATTERN.test(text)) {
    throw new InvalidRouteParameterError("position");
  }

  const parsed = Number(text);
  if (!Number.isSafeInteger(parsed)) {
    throw new InvalidRouteParameterError("position");
  }

  return parsed;
}

export function buildHistoryPositionUpdate({
  body,
  now,
}: {
  body: unknown;
  now: number;
}): HistoryPositionUpdate {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new InvalidRouteParameterError("request body");
  }

  const payload = body as Record<string, unknown>;
  if (!payload.novelId || payload.position === undefined) {
    throw new MissingHistoryPositionParameterError();
  }

  const novelId = parsePositiveIntegerParameter("novelId", toRouteParameterValue(payload.novelId));
  const position = parseReadingPosition(payload.position);

  return {
    novelId,
    position,
    updatedAt: now,
    historyEntry: buildHistoryEntry({
      novelId,
      position,
      title: payload.title,
      coverUrl: payload.coverUrl,
      now,
    }),
  };
}

export function buildTimestampedHistoryPositionUpdate({
  body,
  now = Date.now,
}: {
  body: unknown;
  now?: () => number;
}): HistoryPositionUpdate {
  return buildHistoryPositionUpdate({ body, now: now() });
}

export function buildReadingPositionResponse(positionData: ReadingPosition | null) {
  return positionData ?? {
    position: 0,
    updatedAt: null,
  };
}

export function buildReadingPositionRouteRequest({
  novelId,
}: {
  novelId?: string | number;
}): ReadingPositionRouteRequest {
  return {
    novelId: parseRequiredNovelIdParameter(novelId),
  };
}

export function buildHistoryListRouteRequest({
  limit,
}: {
  limit?: string | number;
}): HistoryListRouteRequest {
  return {
    limit: parsePositiveIntegerParameter("limit", limit, { defaultValue: 50 }),
  };
}

export function buildHistoryListResponse(entries: HistoryEntry[]) {
  return {
    history: entries,
  };
}

export function buildHistoryPositionErrorResponse(error: unknown): RouteErrorResponse | null {
  if (!(error instanceof MissingHistoryPositionParameterError)) {
    return null;
  }

  return buildRoutePublicClientErrorResponse(error.message);
}

function toRouteParameterValue(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

function buildHistoryEntry({
  novelId,
  position,
  title,
  coverUrl,
  now,
}: {
  novelId: number;
  position: number;
  title: unknown;
  coverUrl: unknown;
  now: number;
}): HistoryEntry | null {
  if (typeof title !== "string" || title.length === 0) {
    return null;
  }
  if (typeof coverUrl !== "string" || coverUrl.length === 0) {
    return null;
  }

  return {
    novelId,
    title,
    coverUrl,
    lastReadAt: now,
    position,
  };
}
