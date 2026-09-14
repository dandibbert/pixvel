import { assertStrictEquals as assertEquals } from "../src/services/test_asserts.ts";
import { UNKNOWN_VALUE } from "../src/services/build_info.ts";
import {
  collectBuildInfo,
  hashDeployableFiles,
  listDeployableFiles,
  pickBranch,
  sha256Hex,
} from "./build_info.ts";
import { compareBuilds, describeUnreadableVersion, resolveVersionUrl } from "./check_deployment.ts";

Deno.test("sha256Hex produces the well known digest of an empty input", async () => {
  assertEquals(
    await sha256Hex(new Uint8Array()),
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
});

Deno.test("hashDeployableFiles is stable and depends on file contents", async () => {
  const first = await hashDeployableFiles(["deno.json"]);
  const second = await hashDeployableFiles(["deno.json"]);
  const withMore = await hashDeployableFiles(["deno.json", "README.md"]);

  assertEquals(first, second);
  assertEquals(first === withMore, false);
});

Deno.test("hashDeployableFiles tolerates files that disappeared", async () => {
  const hash = await hashDeployableFiles(["definitely-not-here.txt"]);

  assertEquals(hash.length, 64);
});

Deno.test("listDeployableFiles excludes the build info file it generates", async () => {
  const files = await listDeployableFiles();

  assertEquals(files.includes("build-info.json"), false);
  assertEquals(files.includes("deno.json"), true);
  assertEquals(files.includes("frontend/dist/index.html"), true);
});

Deno.test("collectBuildInfo fingerprints the current checkout", async () => {
  const info = await collectBuildInfo();

  assertEquals(info.commit.length, 40);
  assertEquals(info.commitShort, info.commit.slice(0, 7));
  assertEquals(info.treeHash === UNKNOWN_VALUE, false);
  assertEquals(Number.isNaN(Date.parse(info.builtAt)), false);
});

Deno.test("pickBranch prefers the branch Git reports", () => {
  assertEquals(pickBranch("main", "feature"), "main");
  assertEquals(pickBranch("  main  ", null), "main");
});

Deno.test("pickBranch falls back to the CI branch on a detached HEAD", () => {
  assertEquals(pickBranch("HEAD", "main"), "main");
  assertEquals(pickBranch(null, "main"), "main");
  assertEquals(pickBranch("HEAD", null), "HEAD");
  assertEquals(pickBranch(null, null), "unknown");
  assertEquals(pickBranch(null, "   "), "unknown");
});

Deno.test("resolveVersionUrl targets the version endpoint of a deployment", () => {
  assertEquals(resolveVersionUrl("https://pixvel.deno.net"), "https://pixvel.deno.net/api/version");
  assertEquals(
    resolveVersionUrl("https://pixvel.deno.net/novels/123"),
    "https://pixvel.deno.net/api/version",
  );
});

Deno.test("describeUnreadableVersion names a host that predates version tracking", () => {
  const stale = describeUnreadableVersion("https://pixvel.deno.net/api/version", 404);
  assertEquals(stale.includes("before the version endpoint existed"), true);
  assertEquals(stale.includes("not the revision you are checking"), true);

  assertEquals(
    describeUnreadableVersion("https://pixvel.deno.net/api/version", 503).includes("503"),
    true,
  );
});

Deno.test("compareBuilds matches deployments by deployed file fingerprint", () => {
  const local = {
    commit: "a".repeat(40),
    commitShort: "aaaaaaa",
    branch: "main",
    dirty: false,
    treeHash: "hash-1",
    builtAt: "2026-09-12T10:00:00.000Z",
  };

  assertEquals(compareBuilds(local, { ...local }).matches, true);
  assertEquals(compareBuilds(local, { ...local, treeHash: "hash-2" }).matches, false);
  assertEquals(compareBuilds(local, { ...local, treeHash: "hash-2" }).sameCommit, true);
  assertEquals(
    compareBuilds(local, { ...local, commit: "b".repeat(40), treeHash: "hash-2" }).sameCommit,
    false,
  );
});

Deno.test("compareBuilds reports deployments that cannot be fingerprinted", () => {
  const unknown = {
    commit: UNKNOWN_VALUE,
    commitShort: UNKNOWN_VALUE,
    branch: UNKNOWN_VALUE,
    dirty: false,
    treeHash: UNKNOWN_VALUE,
    builtAt: UNKNOWN_VALUE,
  };
  const local = { ...unknown, commit: "a".repeat(40), treeHash: "hash-1" };

  assertEquals(compareBuilds(local, unknown).comparable, false);
  assertEquals(compareBuilds(local, unknown).matches, false);
});
