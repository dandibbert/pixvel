/**
 * Writes `build-info.json` so the running server can report which revision of
 * the repository it was deployed from.
 *
 * `treeHash` fingerprints the exact files that `deno deploy` uploads, which is
 * what makes a deployment comparable with a local checkout even when the work
 * has not been committed yet.
 */
import { BUILD_INFO_PATH, type BuildInfo, UNKNOWN_VALUE } from "../src/services/build_info.ts";

export async function runGit(args: string[]): Promise<string | null> {
  try {
    const command = new Deno.Command("git", { args, stdout: "piped", stderr: "null" });
    const { code, stdout } = await command.output();
    if (code !== 0) return null;
    return new TextDecoder().decode(stdout);
  } catch {
    return null;
  }
}

/**
 * Tracked files plus untracked files that are not gitignored: the same set the
 * `deno deploy` CLI uploads. `build-info.json` is excluded so that writing it
 * cannot change the hash it records.
 */
export async function listDeployableFiles(): Promise<string[]> {
  const output = await runGit(["ls-files", "--cached", "--others", "--exclude-standard", "-z"]);
  if (output === null) return [];

  const excluded = BUILD_INFO_PATH.replace(/^\.\//, "");
  return [...new Set(output.split("\0"))]
    .filter((path) => path !== "" && path !== excluded)
    .sort();
}

export async function sha256Hex(data: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data as BufferSource);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashDeployableFiles(paths: string[]): Promise<string> {
  const entries: string[] = [];

  for (const path of paths) {
    try {
      entries.push(`${await sha256Hex(await Deno.readFile(path))}  ${path}`);
    } catch {
      // A listed file can disappear between listing and hashing; record its
      // absence so the fingerprint still reflects the deployed file set.
      entries.push(`missing  ${path}`);
    }
  }

  return await sha256Hex(new TextEncoder().encode(entries.join("\n")));
}

/**
 * CI checkouts are often on a detached HEAD, where Git can only report
 * "HEAD"; the workflow passes the real branch through `BUILD_BRANCH`.
 */
export function pickBranch(gitBranch: string | null, envBranch: string | null): string {
  const fromGit = gitBranch?.trim();
  if (fromGit && fromGit !== "HEAD") return fromGit;

  return envBranch?.trim() || fromGit || UNKNOWN_VALUE;
}

export async function resolveBranch(): Promise<string> {
  let envBranch: string | null = null;
  try {
    envBranch = Deno.env.get("BUILD_BRANCH") ?? null;
  } catch {
    // Running without --allow-env: fall back to whatever Git reports.
  }

  return pickBranch(await runGit(["rev-parse", "--abbrev-ref", "HEAD"]), envBranch);
}

export async function isWorkingTreeDirty(): Promise<boolean> {
  const output = await runGit(["status", "--porcelain", "-z"]);
  if (output === null) return false;

  const excluded = BUILD_INFO_PATH.replace(/^\.\//, "");
  return output
    .split("\0")
    .filter((entry) => entry.trim() !== "")
    .some((entry) => entry.slice(3).trim() !== excluded);
}

export async function collectBuildInfo(): Promise<BuildInfo> {
  const commit = (await runGit(["rev-parse", "HEAD"]))?.trim() || UNKNOWN_VALUE;
  const branch = await resolveBranch();
  const files = await listDeployableFiles();

  return {
    commit,
    commitShort: commit === UNKNOWN_VALUE ? UNKNOWN_VALUE : commit.slice(0, 7),
    branch,
    dirty: await isWorkingTreeDirty(),
    treeHash: files.length === 0 ? UNKNOWN_VALUE : await hashDeployableFiles(files),
    builtAt: new Date().toISOString(),
  };
}

export async function writeBuildInfo(): Promise<BuildInfo> {
  const info = await collectBuildInfo();
  await Deno.writeTextFile(BUILD_INFO_PATH, `${JSON.stringify(info, null, 2)}\n`);
  return info;
}

if (import.meta.main) {
  const info = await writeBuildInfo();

  if (info.treeHash === UNKNOWN_VALUE) {
    console.error("Warning: could not fingerprint the project (is git available?)");
  }

  console.log(`build-info.json -> ${info.commitShort}${info.dirty ? "-dirty" : ""}`);
  console.log(`tree hash: ${info.treeHash}`);
}
