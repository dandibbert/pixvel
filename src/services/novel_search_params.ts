import {
  buildRoutePublicClientErrorResponse,
  type RouteErrorResponse,
} from "./route_response.ts";
import { buildUrlSearchParams } from "./url_search_params.ts";

export class InvalidSearchParameterError extends Error {
  constructor(parameter: string) {
    super(`Invalid ${parameter}`);
    this.name = "InvalidSearchParameterError";
  }
}

export class MissingNovelSearchKeywordError extends Error {
  constructor() {
    super("Missing search keyword");
    this.name = "MissingNovelSearchKeywordError";
  }
}

export interface NovelSearchQuery {
  word: string;
  sort?: string;
  search_target?: string;
  start_date?: string;
  end_date?: string;
  bookmark_num?: string;
  bookmark_num_min?: string;
  bookmark_num_max?: string;
  text_length_min?: string;
  include_potential_violation_works?: string;
  include_translated_tag_results?: string;
  is_original_only?: string;
  is_replaceable_only?: string;
  merge_plain_keyword_results?: string;
  search_ai_type?: string;
  lang?: string;
  page?: string;
}

export interface NovelSearchRequest {
  params: URLSearchParams;
  page: number;
}

type NovelSearchQueryReader = (name: string) => string | undefined;

type OptionalNovelSearchQueryField = Exclude<keyof NovelSearchQuery, "word" | "page">;
type EnumNovelSearchFilterField = "sort" | "search_target" | "search_ai_type" | "lang";
type DateNovelSearchFilterField = "start_date" | "end_date";
type PositiveIntegerNovelSearchFilterField =
  | "bookmark_num_min"
  | "bookmark_num_max"
  | "text_length_min";
type BooleanNovelSearchFilterField =
  | "include_potential_violation_works"
  | "include_translated_tag_results"
  | "is_original_only"
  | "is_replaceable_only"
  | "merge_plain_keyword_results";

const VALID_SORT_VALUES = new Set(["date_desc", "date_asc", "popular_desc"]);
const VALID_SEARCH_TARGET_VALUES = new Set([
  "partial_match_for_tags",
  "exact_match_for_tags",
  "keyword",
  "text",
]);
const VALID_SEARCH_AI_TYPE_VALUES = new Set(["0", "1"]);
const VALID_BOOLEAN_VALUES = new Set(["true", "false"]);
const VALID_LANG_VALUES = new Set(["ja", "zh-CN"]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;
const MAX_WORD_LENGTH = 100;
const MAX_PAGE = 100;
const MAX_BOOKMARK_NUM = 999_999;
const MAX_TEXT_LENGTH = 1_000_000;
const ITEMS_PER_PAGE = 30;

export const NOVEL_SEARCH_FILTER_FIELDS = {
  optionalQuery: [
    "sort",
    "search_target",
    "start_date",
    "end_date",
    "bookmark_num",
    "bookmark_num_min",
    "bookmark_num_max",
    "text_length_min",
    "include_potential_violation_works",
    "include_translated_tag_results",
    "is_original_only",
    "is_replaceable_only",
    "merge_plain_keyword_results",
    "search_ai_type",
    "lang",
  ],
  enum: ["sort", "search_target", "search_ai_type", "lang"],
  date: ["start_date", "end_date"],
  positiveInteger: ["bookmark_num_min", "bookmark_num_max", "text_length_min"],
  boolean: [
    "include_potential_violation_works",
    "include_translated_tag_results",
    "is_original_only",
    "is_replaceable_only",
    "merge_plain_keyword_results",
  ],
} satisfies {
  optionalQuery: readonly OptionalNovelSearchQueryField[];
  enum: readonly EnumNovelSearchFilterField[];
  date: readonly DateNovelSearchFilterField[];
  positiveInteger: readonly PositiveIntegerNovelSearchFilterField[];
  boolean: readonly BooleanNovelSearchFilterField[];
};

const ENUM_FILTER_VALUES: Record<EnumNovelSearchFilterField, Set<string>> = {
  sort: VALID_SORT_VALUES,
  search_target: VALID_SEARCH_TARGET_VALUES,
  search_ai_type: VALID_SEARCH_AI_TYPE_VALUES,
  lang: VALID_LANG_VALUES,
};

const POSITIVE_INTEGER_FILTER_LIMITS: Record<PositiveIntegerNovelSearchFilterField, number> = {
  bookmark_num_min: MAX_BOOKMARK_NUM,
  bookmark_num_max: MAX_BOOKMARK_NUM,
  text_length_min: MAX_TEXT_LENGTH,
};

export function collectNovelSearchQuery(readQuery: NovelSearchQueryReader): NovelSearchQuery {
  const query: NovelSearchQuery = {
    word: readQuery("word") || "",
    page: readQuery("page") || "1",
  };

  for (const field of NOVEL_SEARCH_FILTER_FIELDS.optionalQuery) {
    const value = readQuery(field);
    if (value !== undefined) {
      query[field] = value;
    }
  }

  return query;
}

export function buildNovelSearchPagination({
  page,
  hasMore,
  searchSpanLimit,
}: {
  page: number;
  hasMore: boolean;
  searchSpanLimit: number;
}) {
  const maxResults = searchSpanLimit || MAX_PAGE * ITEMS_PER_PAGE;
  const maxResultPages = Math.ceil(maxResults / ITEMS_PER_PAGE);
  const totalPages = hasMore ? Math.min(MAX_PAGE, maxResultPages, page + 50) : page;

  return {
    total: totalPages * ITEMS_PER_PAGE,
    totalPages,
  };
}

function appendEnum(
  params: URLSearchParams,
  name: string,
  value: string | undefined,
  validValues: Set<string>,
) {
  if (value === undefined || value === "") return;
  if (!validValues.has(value)) {
    throw new InvalidSearchParameterError(name);
  }
  params.set(name, value);
}

function parsePositiveInteger(name: string, value: string | undefined, max: number) {
  if (value === undefined || value === "") return undefined;
  if (!POSITIVE_INTEGER_PATTERN.test(value)) {
    throw new InvalidSearchParameterError(name);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > max) {
    throw new InvalidSearchParameterError(name);
  }

  return parsed;
}

function appendPositiveInteger(
  params: URLSearchParams,
  name: string,
  value: string | undefined,
  max: number,
) {
  const parsed = parsePositiveInteger(name, value, max);
  if (parsed === undefined) return;
  params.set(name, value as string);
}

function parseDate(name: string, value: string | undefined) {
  if (value === undefined || value === "") return undefined;
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new InvalidSearchParameterError(name);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new InvalidSearchParameterError(name);
  }

  return value;
}

function appendDate(params: URLSearchParams, name: string, value: string | undefined) {
  const parsed = parseDate(name, value);
  if (parsed === undefined) return;
  params.set(name, parsed);
}

function appendBoolean(params: URLSearchParams, name: string, value: string | undefined) {
  appendEnum(params, name, value, VALID_BOOLEAN_VALUES);
}

function parsePage(page: string | undefined) {
  return parsePositiveInteger("page", page, MAX_PAGE) ?? 1;
}

function validateWord(word: string) {
  if (word.trim().length === 0 || word.length > MAX_WORD_LENGTH) {
    throw new InvalidSearchParameterError("word");
  }
}

function validateRanges(query: NovelSearchQuery) {
  const startDate = parseDate("start_date", query.start_date);
  const endDate = parseDate("end_date", query.end_date);
  if (startDate !== undefined && endDate !== undefined && startDate > endDate) {
    throw new InvalidSearchParameterError("date_range");
  }

  const bookmarkMin = parsePositiveInteger(
    "bookmark_num_min",
    query.bookmark_num_min ?? query.bookmark_num,
    MAX_BOOKMARK_NUM,
  );
  const bookmarkMax = parsePositiveInteger(
    "bookmark_num_max",
    query.bookmark_num_max,
    MAX_BOOKMARK_NUM,
  );
  if (bookmarkMin !== undefined && bookmarkMax !== undefined && bookmarkMin > bookmarkMax) {
    throw new InvalidSearchParameterError("bookmark_num_range");
  }
}

export function buildNovelSearchApiParams(query: NovelSearchQuery): URLSearchParams {
  validateWord(query.word);
  validateRanges(query);

  const params = buildUrlSearchParams({
    word: query.word,
    sort: "date_desc",
    search_target: "partial_match_for_tags",
    filter: "for_android",
  });

  for (const field of NOVEL_SEARCH_FILTER_FIELDS.enum) {
    appendEnum(params, field, query[field], ENUM_FILTER_VALUES[field]);
  }

  for (const field of NOVEL_SEARCH_FILTER_FIELDS.date) {
    appendDate(params, field, query[field]);
  }

  for (const field of NOVEL_SEARCH_FILTER_FIELDS.positiveInteger) {
    appendPositiveInteger(
      params,
      field,
      resolvePositiveIntegerFilterValue(query, field),
      POSITIVE_INTEGER_FILTER_LIMITS[field],
    );
  }

  for (const field of NOVEL_SEARCH_FILTER_FIELDS.boolean) {
    appendBoolean(params, field, query[field]);
  }

  const page = parsePage(query.page);
  const offset = (page - 1) * ITEMS_PER_PAGE;
  if (offset > 0) params.set("offset", offset.toString());

  return params;
}

function resolvePositiveIntegerFilterValue(
  query: NovelSearchQuery,
  field: PositiveIntegerNovelSearchFilterField,
) {
  return field === "bookmark_num_min" ? query.bookmark_num_min ?? query.bookmark_num : query[field];
}

export function buildNovelSearchRequest(query: NovelSearchQuery): NovelSearchRequest {
  return {
    params: buildNovelSearchApiParams(query),
    page: parsePage(query.page),
  };
}

export function buildNovelSearchErrorResponse(error: unknown): RouteErrorResponse | null {
  if (
    !(error instanceof MissingNovelSearchKeywordError) &&
    !(error instanceof InvalidSearchParameterError)
  ) {
    return null;
  }

  return buildRoutePublicClientErrorResponse(error.message);
}
