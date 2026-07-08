import {
  mapArrayOrEmpty,
  numberOrZero,
  stringOrEmpty,
} from "./default_values.ts";

export interface PixivNovelSummaryPayload {
  id?: number;
  title?: string;
  caption?: string;
  image_urls?: {
    square_medium?: string;
    medium?: string;
    large?: string;
  };
  create_date?: string;
  tags?: Array<{
    name: string;
    translated_name?: string | null;
    added_by_uploaded_user?: boolean;
  }>;
  page_count?: number;
  text_length?: number;
  user?: {
    id?: number;
    name?: string;
    account?: string;
    profile_image_urls?: {
      medium?: string;
    };
    is_followed?: boolean;
  };
  series?: {
    id?: number;
    title?: string;
  } | null;
  is_bookmarked?: boolean;
  total_bookmarks?: number;
  total_view?: number;
}

export interface PixivNovelDetailPayload extends PixivNovelSummaryPayload {
  text?: string;
}

export interface FrontendNovelSummary {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  coverImage?: string;
  tags: string[];
  pageCount: number;
  textLength: number;
  totalBookmarks: number;
  totalViews: number;
  createdAt: string;
  updatedAt: string;
  series?: {
    id: string;
    title: string;
  };
}

export interface FrontendNovelDetail extends FrontendNovelSummary {
  content: string;
  pages: string[];
}

interface TransformNovelOptions {
  fallbackSeries?: {
    id: string;
    title: string;
  };
}

const PIXIV_PAGE_SIZE = 30;

export function parsePixivNextPage(nextUrl: string | null): number | null {
  if (!nextUrl) return null;

  try {
    const url = new URL(nextUrl);
    const offset = url.searchParams.get("offset");
    if (!offset) return null;

    const parsedOffset = Number(offset);
    if (!Number.isSafeInteger(parsedOffset) || parsedOffset < 0) return null;

    return Math.floor(parsedOffset / PIXIV_PAGE_SIZE) + 1;
  } catch {
    return null;
  }
}

export function transformPixivNovelSummary(
  novel: PixivNovelSummaryPayload,
  options: TransformNovelOptions = {},
): FrontendNovelSummary {
  const createdAt = novel.create_date || new Date().toISOString();

  return {
    id: stringOrEmpty(novel.id),
    title: stringOrEmpty(novel.title),
    description: stringOrEmpty(novel.caption),
    author: {
      id: stringOrEmpty(novel.user?.id),
      name: stringOrEmpty(novel.user?.name),
      avatar: novel.user?.profile_image_urls?.medium,
    },
    coverImage: novel.image_urls?.large,
    tags: mapArrayOrEmpty(novel.tags, (tag) => tag.name),
    pageCount: numberOrZero(novel.page_count),
    textLength: numberOrZero(novel.text_length),
    totalBookmarks: numberOrZero(novel.total_bookmarks),
    totalViews: numberOrZero(novel.total_view),
    createdAt,
    updatedAt: createdAt,
    series: transformPixivSeries(novel, options),
  };
}

export function transformPixivNovelSummaries(
  novels: PixivNovelSummaryPayload[],
  options: TransformNovelOptions = {},
): FrontendNovelSummary[] {
  return novels.map((novel) => transformPixivNovelSummary(novel, options));
}

export function transformPixivNovelDetail(novel: PixivNovelDetailPayload): FrontendNovelDetail {
  return {
    ...transformPixivNovelSummary(novel),
    content: stringOrEmpty(novel.text),
    pages: [],
  };
}

function transformPixivSeries(
  novel: PixivNovelSummaryPayload,
  options: TransformNovelOptions,
) {
  if (novel.series) {
    return {
      id: stringOrEmpty(novel.series.id),
      title: stringOrEmpty(novel.series.title),
    };
  }

  return options.fallbackSeries;
}
