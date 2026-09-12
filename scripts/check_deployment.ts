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

export async function fetchDeployedBuildInfo(baseUrl: string): Promise<BuildInfo> {
  const response = await fetch(resolveVersionUrl(baseUrl), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${resolveVersionUrl(baseUrl)} responded with ${response.status}`);
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

  const deployed = await fetchDeployedBuildInfo(baseUrl);
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
