export class InvalidSearchParameterError extends Error {
  constructor(parameter: string) {
    super(`Invalid ${parameter}`);
    this.name = "InvalidSearchParameterError";
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
  const bookmarkMax = parsePositiveInteger("bookmark_num_max", query.bookmark_num_max, MAX_BOOKMARK_NUM);
  if (bookmarkMin !== undefined && bookmarkMax !== undefined && bookmarkMin > bookmarkMax) {
    throw new InvalidSearchParameterError("bookmark_num_range");
  }
}

export function buildNovelSearchApiParams(query: NovelSearchQuery): URLSearchParams {
  validateWord(query.word);
  validateRanges(query);

  const params = new URLSearchParams({
    word: query.word,
    sort: "date_desc",
    search_target: "partial_match_for_tags",
    filter: "for_android",
  });

  appendEnum(params, "sort", query.sort, VALID_SORT_VALUES);
  appendEnum(params, "search_target", query.search_target, VALID_SEARCH_TARGET_VALUES);
  appendEnum(params, "search_ai_type", query.search_ai_type, VALID_SEARCH_AI_TYPE_VALUES);

  appendDate(params, "start_date", query.start_date);
  appendDate(params, "end_date", query.end_date);
  appendPositiveInteger(params, "bookmark_num_min", query.bookmark_num_min ?? query.bookmark_num, MAX_BOOKMARK_NUM);
  appendPositiveInteger(params, "bookmark_num_max", query.bookmark_num_max, MAX_BOOKMARK_NUM);
  appendPositiveInteger(params, "text_length_min", query.text_length_min, MAX_TEXT_LENGTH);
  appendEnum(params, "lang", query.lang, VALID_LANG_VALUES);

  appendBoolean(
    params,
    "include_potential_violation_works",
    query.include_potential_violation_works,
  );
  appendBoolean(params, "include_translated_tag_results", query.include_translated_tag_results);
  appendBoolean(params, "is_original_only", query.is_original_only);
  appendBoolean(params, "is_replaceable_only", query.is_replaceable_only);
  appendBoolean(params, "merge_plain_keyword_results", query.merge_plain_keyword_results);

  const page = parsePage(query.page);
  const offset = (page - 1) * ITEMS_PER_PAGE;
  if (offset > 0) params.set("offset", offset.toString());

  return params;
}
