/**
 * Compares the deployed build with the local checkout:
 *
 *   deno task deploy:check https://your-app.deno.net
 */
import { type BuildInfo, parseBuildInfo, UNKNOWN_VALUE } from "../src/services/build_info.ts";
import { collectBuildInfo } from "./build_info.ts";

export function resolveVersionUrl(baseUrl: string): string {
  return new URL("/api/version", baseUrl).toString();
}

/**
 * A 404 is its own answer: every build that reports a version serves this
 * endpoint, so a host without it is running code older than version tracking
 * and therefore cannot be the revision being checked.
 */
export function describeUnreadableVersion(url: string, status: number): string {
  if (status === 404) {
    return `${url} responded with 404, so that host runs code from before the version endpoint existed. ` +
      "It is not the revision you are checking.";
  }
  return `${url} responded with ${status}, so the deployed version could not be read.`;
}

export class UnreadableVersionError extends Error {
  constructor(readonly status: number, url: string) {
    super(describeUnreadableVersion(url, status));
    this.name = "UnreadableVersionError";
  }
}

export async function fetchDeployedBuildInfo(baseUrl: string): Promise<BuildInfo> {
  const url = resolveVersionUrl(baseUrl);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    // The body is never used, and an unread body keeps the process alive.
    await response.body?.cancel();
    throw new UnreadableVersionError(response.status, url);
  }

  return parseBuildInfo(await response.text());
}

export function compareBuilds(local: BuildInfo, deployed: BuildInfo) {
  const comparable = local.treeHash !== UNKNOWN_VALUE && deployed.treeHash !== UNKNOWN_VALUE;

  return {
    comparable,
    matches: comparable && local.treeHash === deployed.treeHash,
    sameCommit: local.commit !== UNKNOWN_VALUE && local.commit === deployed.commit,
  };
}

function printBuild(label: string, info: BuildInfo) {
  console.log(`${label}:`);
  console.log(`  commit    ${info.commitShort}${info.dirty ? " (working tree modified)" : ""}`);
  console.log(`  branch    ${info.branch}`);
  console.log(`  tree hash ${info.treeHash}`);
  console.log(`  built at  ${info.builtAt}`);
}

if (import.meta.main) {
  const baseUrl = Deno.args[0] || Deno.env.get("DEPLOY_URL");
  if (!baseUrl) {
    console.error("Usage: deno task deploy:check <https://your-app.deno.net>");
    Deno.exit(2);
  }

  let deployed: BuildInfo;
  try {
    deployed = await fetchDeployedBuildInfo(baseUrl);
  } catch (error) {
    if (error instanceof UnreadableVersionError) {
      console.error(error.message);
      Deno.exit(error.status === 404 ? 1 : 2);
    }
    throw error;
  }

  const local = await collectBuildInfo();

  printBuild("deployed", deployed);
  printBuild("local", local);

  const { comparable, matches, sameCommit } = compareBuilds(local, deployed);

  if (!comparable) {
    console.error(
      "\nCannot compare: the deployment predates build tracking, or git is unavailable here.",
    );
    console.error("Run `deno task deploy` once so the running app reports its build.");
    Deno.exit(2);
  }

  if (matches) {
    console.log("\nMatch: the deployment serves exactly this working tree.");
    Deno.exit(0);
  }

  console.log(
    sameCommit
      ? "\nMismatch: same commit, but the deployed files differ (uncommitted or stale build output)."
      : "\nMismatch: the deployment was built from different sources than this working tree.",
  );
  Deno.exit(1);
}
