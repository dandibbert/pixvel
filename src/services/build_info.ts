/**
 * Build metadata written by `scripts/build_info.ts` right before a deploy.
 *
 * The file must stay tracked by Git: the `deno deploy` CLI skips gitignored
 * paths when it uploads the project, so an ignored build file would never
 * reach production and every deployment would report "unknown".
 */
export const BUILD_INFO_PATH = "./build-info.json";

export interface BuildInfo {
  commit: string;
  commitShort: string;
  branch: string;
  dirty: boolean;
  treeHash: string;
  builtAt: string;
}

export const UNKNOWN_VALUE = "unknown";

export const UNKNOWN_BUILD_INFO: BuildInfo = {
  commit: UNKNOWN_VALUE,
  commitShort: UNKNOWN_VALUE,
  branch: UNKNOWN_VALUE,
  dirty: false,
  treeHash: UNKNOWN_VALUE,
  builtAt: UNKNOWN_VALUE,
};

export interface BuildInfoDependencies {
  path?: string;
  readTextFile?: (path: string) => Promise<string>;
}

export function parseBuildInfo(raw: string): BuildInfo {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...UNKNOWN_BUILD_INFO };
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ...UNKNOWN_BUILD_INFO };
  }

  const record = parsed as Record<string, unknown>;
  return {
    commit: readString(record.commit),
    commitShort: readString(record.commitShort) === UNKNOWN_VALUE
      ? shortenCommit(readString(record.commit))
      : readString(record.commitShort),
    branch: readString(record.branch),
    dirty: record.dirty === true,
    treeHash: readString(record.treeHash),
    builtAt: readString(record.builtAt),
  };
}

export function shortenCommit(commit: string): string {
  if (commit === UNKNOWN_VALUE || commit.length < 7) return commit;
  return commit.slice(0, 7);
}

export function describeBuildInfo(info: BuildInfo): string {
  const revision = info.commitShort === UNKNOWN_VALUE ? UNKNOWN_VALUE : info.commitShort;
  return `${revision}${info.dirty ? "-dirty" : ""}`;
}

export async function readBuildInfo(
  dependencies: BuildInfoDependencies = {},
): Promise<BuildInfo> {
  const path = dependencies.path || BUILD_INFO_PATH;
  const readTextFile = dependencies.readTextFile || Deno.readTextFile;

  try {
    return parseBuildInfo(await readTextFile(path));
  } catch {
    return { ...UNKNOWN_BUILD_INFO };
  }
}

let cachedBuildInfo: Promise<BuildInfo> | null = null;

/**
 * Build metadata never changes within a deployment, so the file is read once
 * per isolate instead of on every request.
 */
export function loadBuildInfo(dependencies: BuildInfoDependencies = {}): Promise<BuildInfo> {
  if (dependencies.path || dependencies.readTextFile) {
    return readBuildInfo(dependencies);
  }

  cachedBuildInfo ??= readBuildInfo();
  return cachedBuildInfo;
}

export function resetBuildInfoCache() {
  cachedBuildInfo = null;
}

function readString(value: unknown): string {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : UNKNOWN_VALUE;
}
