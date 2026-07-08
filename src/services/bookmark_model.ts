import {
  buildPixivPagedParams,
  calculatePixivOffset,
  InvalidRouteParameterError,
  parsePositiveIntegerParameter,
  parseRequiredNovelIdParameter,
  parseRequiredPositiveIntegerParameter,
} from "./route_params.ts";
import {
  parsePixivNextPage,
  type PixivNovelSummaryPayload,
  transformPixivNovelSummaries,
} from "./novel_transformer.ts";

export type PixivBookmarkRestrict = "public" | "private";

const BOOKMARK_RESTRICT_VALUES = new Set(["public", "private"]);

interface BuildBookmarkedNovelsRequestOptions {
  userId: string;
  restrict: unknown;
  page: string | number | undefined;
}

interface BuildBookmarkAddRequestBody {
  novelId?: string | number;
  restrict?: unknown;
}

export interface BookmarkAddRequest {
  novelId: number;
  restrict: PixivBookmarkRestrict;
  payload: ReturnType<typeof buildBookmarkAddPayload>;
}

export interface BookmarkDeleteRequest {
  novelId: number;
  payload: ReturnType<typeof buildBookmarkDeletePayload>;
}

export interface BookmarkedNovelsRequest {
  params: URLSearchParams;
  restrict: PixivBookmarkRestrict;
  page: number;
}

export function parseBookmarkRestrict(value: unknown): PixivBookmarkRestrict {
  if (value === undefined || value === null || value === "") {
    return "public";
  }

  if (typeof value !== "string" || !BOOKMARK_RESTRICT_VALUES.has(value)) {
    throw new InvalidRouteParameterError("restrict");
  }

  return value as PixivBookmarkRestrict;
}

export function buildBookmarkAddPayload({
  novelId,
  restrict,
}: {
  novelId: number;
  restrict: PixivBookmarkRestrict;
}) {
  return {
    novel_id: novelId,
    restrict,
  };
}

export function buildBookmarkAddApiPath(): string {
  return "/v2/novel/bookmark/add";
}

export function buildBookmarkAddRequest(
  body: BuildBookmarkAddRequestBody,
): BookmarkAddRequest {
  const novelId = parseRequiredPositiveIntegerParameter(
    "novelId",
    body.novelId,
    "Missing novelId",
  );
  const restrict = parseBookmarkRestrict(body.restrict);

  return {
    novelId,
    restrict,
    payload: buildBookmarkAddPayload({ novelId, restrict }),
  };
}

export function buildBookmarkDeletePayload({ novelId }: { novelId: number }) {
  return {
    novel_id: novelId,
  };
}

export function buildBookmarkDeleteRequest(
  value: string | number | undefined,
): BookmarkDeleteRequest {
  const novelId = parseRequiredNovelIdParameter(value);

  return {
    novelId,
    payload: buildBookmarkDeletePayload({ novelId }),
  };
}

export function buildBookmarkDeleteApiPath(): string {
  return "/v1/novel/bookmark/delete";
}

export function buildBookmarkedNovelsApiPath(params: URLSearchParams): string {
  return `/v1/user/bookmarks/novel?${params.toString()}`;
}

export function buildBookmarkedNovelsParams({
  userId,
  restrict,
  offset,
}: {
  userId: string;
  restrict: PixivBookmarkRestrict;
  offset: number;
}) {
  return buildPixivPagedParams({
    user_id: userId,
    restrict,
    filter: "for_android",
  }, offset);
}

export function buildBookmarkedNovelsRequest({
  userId,
  restrict,
  page,
}: BuildBookmarkedNovelsRequestOptions): BookmarkedNovelsRequest {
  const parsedRestrict = parseBookmarkRestrict(restrict);
  const parsedPage = parsePositiveIntegerParameter("page", page, { defaultValue: 1 });

  return {
    params: buildBookmarkedNovelsParams({
      userId,
      restrict: parsedRestrict,
      offset: calculatePixivOffset(parsedPage),
    }),
    restrict: parsedRestrict,
    page: parsedPage,
  };
}

export function buildBookmarkedNovelsResponse({
  novels,
  nextUrl,
}: {
  novels: PixivNovelSummaryPayload[];
  nextUrl: string | null;
}) {
  const transformedNovels = transformPixivNovelSummaries(novels);

  return {
    novels: transformedNovels,
    total: transformedNovels.length,
    nextPage: parsePixivNextPage(nextUrl),
  };
}
