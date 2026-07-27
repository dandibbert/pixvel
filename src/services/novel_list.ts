import {
  buildPixivPagedParams,
  calculatePixivOffset,
  parsePositiveIntegerParameter,
} from "./route_params.ts";
import {
  parsePixivNextPage,
  type PixivNovelSummaryPayload,
  transformPixivNovelSummaries,
} from "./novel_transformer.ts";

type NovelListParamName = "user_id" | "series_id";

interface BuildNovelListResponseOptions {
  novels: PixivNovelSummaryPayload[];
  page: number;
  nextUrl: string | null;
}

interface BuildUserNovelListResponseOptions extends BuildNovelListResponseOptions {
  userId: number;
}

interface BuildSeriesNovelListResponseOptions extends BuildNovelListResponseOptions {
  seriesId: number;
  seriesTitle: string;
}

interface BuildNovelListRequestOptions {
  idParamName: NovelListParamName;
  id: number;
  page: string | number | undefined;
}

export interface NovelListRequest {
  params: URLSearchParams;
  page: number;
  id: number;
}

export function buildNovelListParams(
  idParamName: NovelListParamName,
  id: number,
  page: number,
): URLSearchParams {
  return buildPixivPagedParams(
    { [idParamName]: id },
    calculatePixivOffset(page),
  );
}

export function buildNovelListRequest({
  idParamName,
  id,
  page,
}: BuildNovelListRequestOptions): NovelListRequest {
  const parsedPage = parsePositiveIntegerParameter("page", page, { defaultValue: 1 });

  return {
    params: buildNovelListParams(idParamName, id, parsedPage),
    page: parsedPage,
    id,
  };
}

export function buildUserNovelListResponse({
  userId,
  novels,
  page,
  nextUrl,
}: BuildUserNovelListResponseOptions) {
  const transformedNovels = transformPixivNovelSummaries(novels);

  return {
    author: transformedNovels[0]?.author || { id: userId.toString(), name: "Unknown" },
    novels: transformedNovels,
    ...buildNovelListPageState({ page, nextUrl }),
  };
}

export function buildSeriesNovelListResponse({
  seriesId,
  seriesTitle,
  novels,
  page,
  nextUrl,
}: BuildSeriesNovelListResponseOptions) {
  const fallbackSeries = seriesTitle ? { id: seriesId.toString(), title: seriesTitle } : undefined;
  const transformedNovels = transformPixivNovelSummaries(novels, { fallbackSeries });

  return {
    series: {
      id: seriesId.toString(),
      title: seriesTitle,
    },
    novels: transformedNovels,
    ...buildNovelListPageState({ page, nextUrl }),
  };
}

function buildNovelListPageState({
  page,
  nextUrl,
}: {
  page: number;
  nextUrl: string | null;
}) {
  return {
    page,
    nextPage: parsePixivNextPage(nextUrl),
    hasMore: nextUrl !== null,
  };
}
