import { buildNovelListRequest } from "./novel_list.ts";
import {
  buildNovelSearchRequest,
  collectNovelSearchQuery,
  MissingNovelSearchKeywordError,
} from "./novel_search_params.ts";
import {
  parsePositiveIntegerParameter,
  parseRequiredNovelIdParameter,
  parseRequiredPositiveIntegerParameter,
} from "./route_params.ts";

export const NOVEL_SERIES_CACHE_HEADERS = {
  "Cache-Control": "private, max-age=30",
} as const;

export function buildNovelSearchApiPath(params: URLSearchParams): string {
  return `/v1/search/novel?${params.toString()}`;
}

export function buildUserNovelsApiPath(params: URLSearchParams): string {
  return `/v1/user/novels?${params.toString()}`;
}

export function buildSeriesNovelsApiPath(params: URLSearchParams): string {
  return `/v2/novel/series?${params.toString()}`;
}

export function buildNovelDetailApiPath(novelId: number): string {
  return `/v2/novel/detail?novel_id=${novelId}`;
}

export function buildNovelContentSuccessBody(content: string, novelId: number) {
  return {
    content,
    novelId,
  };
}

export function buildNovelSearchRouteRequest(
  readQuery: (name: string) => string | undefined,
) {
  const searchQuery = collectNovelSearchQuery(readQuery);
  if (!searchQuery.word) {
    throw new MissingNovelSearchKeywordError();
  }

  return buildNovelSearchRequest(searchQuery);
}

export function buildNovelSeriesHintRequest({
  seriesId,
  seriesTitle,
}: {
  seriesId?: string;
  seriesTitle?: string;
}) {
  return {
    hintedSeriesId: seriesId ? parsePositiveIntegerParameter("series_id", seriesId) : undefined,
    hintedSeriesTitle: seriesTitle || "",
  };
}

export function buildUserNovelListRouteRequest({
  userId,
  page,
}: {
  userId?: string;
  page?: string;
}) {
  return buildNovelListRequest({
    idParamName: "user_id",
    id: parseRequiredPositiveIntegerParameter(
      "user ID",
      userId,
      "Missing user ID",
    ),
    page,
  });
}

export function buildSeriesNovelListRouteRequest({
  seriesId,
  page,
}: {
  seriesId?: string;
  page?: string;
}) {
  return buildNovelListRequest({
    idParamName: "series_id",
    id: parseRequiredPositiveIntegerParameter(
      "series ID",
      seriesId,
      "Missing series ID",
    ),
    page,
  });
}

export function buildNovelDetailRouteRequest({ novelId }: { novelId?: string }) {
  return {
    novelId: parseRequiredNovelIdParameter(novelId),
  };
}

export function buildNovelSeriesRouteRequest({ novelId }: { novelId?: string }) {
  return {
    novelId: parseRequiredNovelIdParameter(novelId),
  };
}

export function buildNovelSeriesResolveRouteRequest({
  novelId,
  seriesId,
  seriesTitle,
}: {
  novelId?: string;
  seriesId?: string;
  seriesTitle?: string;
}) {
  return {
    ...buildNovelSeriesRouteRequest({ novelId }),
    ...buildNovelSeriesHintRequest({ seriesId, seriesTitle }),
  };
}
