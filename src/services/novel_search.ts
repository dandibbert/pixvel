import {
  type PixivNovelSummaryPayload,
  transformPixivNovelSummaries,
} from "./novel_transformer.ts";
import { buildNovelSearchPagination } from "./novel_search_params.ts";

export function buildNovelSearchResponse({
  novels,
  page,
  nextUrl,
  searchSpanLimit,
}: {
  novels: PixivNovelSummaryPayload[];
  page: number;
  nextUrl: string | null;
  searchSpanLimit: number;
}) {
  const pagination = buildNovelSearchPagination({
    page,
    hasMore: nextUrl !== null,
    searchSpanLimit,
  });

  return {
    novels: transformPixivNovelSummaries(novels),
    total: pagination.total,
    page,
    totalPages: pagination.totalPages,
  };
}
