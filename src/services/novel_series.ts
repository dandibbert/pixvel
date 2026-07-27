import { arrayOrEmpty, firstNonEmptyString, stringOrEmpty } from "./default_values.ts";
import { buildNovelDetailApiPath } from "./novel_route_model.ts";
import type { PixivNovelSummaryPayload } from "./novel_transformer.ts";
import {
  type CachedSeriesResolution,
  getCachedSeriesResolution,
  setCachedSeriesResolution,
} from "./kv_store.ts";

export interface PixivNovelSeriesClient {
  fetch: (path: string) => Promise<unknown>;
}

export interface NovelSeriesNeighbor {
  id: string;
  title: string;
}

export interface NovelSeriesInfo {
  id: string;
  title: string;
  prev_novel?: NovelSeriesNeighbor;
  next_novel?: NovelSeriesNeighbor;
}

export interface ResolvePixivNovelSeriesOptions {
  novelId: number;
  hintedSeriesId?: number;
  hintedSeriesTitle?: string;
  client: PixivNovelSeriesClient;
}

interface PixivNovelTextSeriesResponse {
  series_prev: { id?: number; title?: string } | null;
  series_next: { id?: number; title?: string } | null;
}

interface PixivNovelSeriesResponse {
  novel_series_detail?: {
    id: number;
    title: string;
  };
  novels?: PixivNovelSummaryPayload[];
  next_url: string | null;
}

const SERIES_FALLBACK_PAGE_LIMIT = 30;

export function buildNovelTextApiPath(novelId: number): string {
  return `/v1/novel/text?novel_id=${novelId}`;
}

export function buildNovelSeriesPageApiPath(seriesId: number, offset?: number): string {
  const base = `/v2/novel/series?series_id=${seriesId}`;
  return offset === undefined ? base : `${base}&offset=${offset}`;
}

export interface ResolvePixivNovelSeriesCacheDependencies<T> {
  getCached: (novelId: number) => Promise<CachedSeriesResolution<T> | null>;
  setCached: (novelId: number, series: T | null) => Promise<void>;
}

/**
 * Cached wrapper around resolvePixivNovelSeries.
 *
 * The pagination fallback inside can cost up to SERIES_FALLBACK_PAGE_LIMIT
 * sequential upstream calls, so results (including "no series") are cached
 * in KV for 1h. Cache failures degrade to a direct resolve — never block
 * the request on cache availability.
 */
export async function resolvePixivNovelSeriesCached(
  options: ResolvePixivNovelSeriesOptions,
  dependencies: ResolvePixivNovelSeriesCacheDependencies<NovelSeriesInfo> = {
    getCached: getCachedSeriesResolution<NovelSeriesInfo>,
    setCached: setCachedSeriesResolution<NovelSeriesInfo>,
  },
): Promise<NovelSeriesInfo | null> {
  let cached: CachedSeriesResolution<NovelSeriesInfo> | null = null;
  try {
    cached = await dependencies.getCached(options.novelId);
  } catch {
    // Cache read failure: fall through to a direct resolve
  }

  if (cached) {
    return cached.found ? cached.series : null;
  }

  const series = await resolvePixivNovelSeries(options);

  try {
    await dependencies.setCached(options.novelId, series);
  } catch {
    // Cache write failure is non-fatal; the resolution already succeeded
  }

  return series;
}

export async function resolvePixivNovelSeries({
  novelId,
  hintedSeriesId,
  hintedSeriesTitle = "",
  client,
}: ResolvePixivNovelSeriesOptions): Promise<NovelSeriesInfo | null> {
  const seriesContext = await resolveSeriesContext({
    novelId,
    hintedSeriesId,
    hintedSeriesTitle,
    client,
  });

  if (!seriesContext) return null;

  const neighbors = await resolveSeriesNeighbors({
    novelId,
    seriesId: seriesContext.seriesId,
    seriesTitle: seriesContext.seriesTitle,
    client,
  });

  return {
    id: seriesContext.seriesId.toString(),
    title: neighbors.seriesTitle,
    ...(neighbors.prevNovel ? { prev_novel: neighbors.prevNovel } : {}),
    ...(neighbors.nextNovel ? { next_novel: neighbors.nextNovel } : {}),
  };
}

async function resolveSeriesContext({
  novelId,
  hintedSeriesId,
  hintedSeriesTitle,
  client,
}: ResolvePixivNovelSeriesOptions) {
  if (hintedSeriesId !== undefined) {
    return {
      seriesId: hintedSeriesId,
      seriesTitle: firstNonEmptyString(hintedSeriesTitle),
    };
  }

  const detailResponse = await client.fetch(buildNovelDetailApiPath(novelId)) as {
    novel: PixivNovelSummaryPayload;
  };

  if (!detailResponse.novel.series?.id) {
    return null;
  }

  return {
    seriesId: detailResponse.novel.series.id,
    seriesTitle: firstNonEmptyString(hintedSeriesTitle, detailResponse.novel.series.title),
  };
}

async function resolveSeriesNeighbors({
  novelId,
  seriesId,
  seriesTitle,
  client,
}: {
  novelId: number;
  seriesId: number;
  seriesTitle: string;
  client: PixivNovelSeriesClient;
}) {
  try {
    const textResponse = await client.fetch(
      buildNovelTextApiPath(novelId),
    ) as PixivNovelTextSeriesResponse;

    return {
      seriesTitle,
      prevNovel: toSeriesNeighbor(textResponse.series_prev),
      nextNovel: toSeriesNeighbor(textResponse.series_next),
    };
  } catch {
    return resolveSeriesNeighborsFromPagination({
      novelId,
      seriesId,
      seriesTitle,
      client,
    });
  }
}

async function resolveSeriesNeighborsFromPagination({
  novelId,
  seriesId,
  seriesTitle,
  client,
}: {
  novelId: number;
  seriesId: number;
  seriesTitle: string;
  client: PixivNovelSeriesClient;
}) {
  let nextUrl: string | null = buildNovelSeriesPageApiPath(seriesId);
  let safety = 0;
  let resolvedTitle = seriesTitle;
  let prevNovel: NovelSeriesNeighbor | null = null;
  let nextNovel: NovelSeriesNeighbor | null = null;

  while (nextUrl && safety < SERIES_FALLBACK_PAGE_LIMIT && (!prevNovel || !nextNovel)) {
    safety += 1;
    const seriesResponse = await client.fetch(nextUrl) as PixivNovelSeriesResponse;

    if (!resolvedTitle && seriesResponse.novel_series_detail?.title) {
      resolvedTitle = seriesResponse.novel_series_detail.title;
    }

    const novels = arrayOrEmpty(seriesResponse.novels);
    const currentIndex = novels.findIndex((novel) => novel.id === novelId);
    if (currentIndex >= 0) {
      prevNovel = toSeriesNeighbor(novels[currentIndex - 1]);
      nextNovel = toSeriesNeighbor(novels[currentIndex + 1]);
      break;
    }

    nextUrl = seriesResponse.next_url;
  }

  return {
    seriesTitle: resolvedTitle,
    prevNovel,
    nextNovel,
  };
}

function toSeriesNeighbor(novel: { id?: number; title?: string } | null | undefined) {
  if (!novel?.id) return null;

  return {
    id: novel.id.toString(),
    title: stringOrEmpty(novel.title),
  };
}
