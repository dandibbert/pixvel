import { buildUrlSearchParams, type UrlSearchParamValue } from "./url_search_params.ts";

export class InvalidRouteParameterError extends Error {
  constructor(parameter: string) {
    super(`Invalid ${parameter}`);
    this.name = "InvalidRouteParameterError";
  }
}

export class MissingRouteParameterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingRouteParameterError";
  }
}

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;
const PIXIV_PAGE_SIZE = 30;

export function parsePositiveIntegerParameter(
  parameter: string,
  value: string | number | undefined,
  options: { defaultValue?: number; max?: number } = {},
) {
  if (value === undefined || value === "") {
    if (options.defaultValue !== undefined) return options.defaultValue;
    throw new InvalidRouteParameterError(parameter);
  }

  const text = value.toString();
  if (!POSITIVE_INTEGER_PATTERN.test(text)) {
    throw new InvalidRouteParameterError(parameter);
  }

  const parsed = Number(text);
  if (
    !Number.isSafeInteger(parsed) ||
    (options.max !== undefined && parsed > options.max)
  ) {
    throw new InvalidRouteParameterError(parameter);
  }

  return parsed;
}

export function parseRequiredPositiveIntegerParameter(
  parameter: string,
  value: string | number | undefined,
  missingMessage: string,
  options: { max?: number } = {},
) {
  if (value === undefined || value === "") {
    throw new MissingRouteParameterError(missingMessage);
  }

  return parsePositiveIntegerParameter(parameter, value, options);
}

export function parseRequiredNovelIdParameter(value: string | number | undefined) {
  return parseRequiredPositiveIntegerParameter("novel ID", value, "Missing novel ID");
}

export function calculatePixivOffset(page: number, pageSize = PIXIV_PAGE_SIZE) {
  return (page - 1) * pageSize;
}

export function buildPixivPagedParams(
  baseParams: Record<string, UrlSearchParamValue>,
  offset: number,
) {
  const params = buildUrlSearchParams(baseParams);

  if (offset > 0) {
    params.set("offset", offset.toString());
  }

  return params;
}
