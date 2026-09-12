import { assertJsonEquals, assertStrictEquals as assertEquals } from "./test_asserts.ts";
import {
  describeBuildInfo,
  loadBuildInfo,
  parseBuildInfo,
  readBuildInfo,
  resetBuildInfoCache,
  shortenCommit,
  UNKNOWN_BUILD_INFO,
} from "./build_info.ts";

const SAMPLE = {
  commit: "63dd472663644d200c6de4592d071e8f45b976ff",
  commitShort: "63dd472",
  branch: "main",
  dirty: false,
  treeHash: "8f14e45fceea167a5a36dedd4bea2543",
  builtAt: "2026-09-12T10:00:00.000Z",
};

Deno.test("build info file stays tracked so deno deploy uploads it", async () => {
  const ignoreRules = await Deno.readTextFile("./.gitignore");
  const ignoresBuildInfo = ignoreRules
    .split("\n")
    .map((line) => line.trim())
    .includes("build-info.json");

  assertEquals(ignoresBuildInfo, false);
});

Deno.test("deno.json does not pin a deploy target", async () => {
  const config = JSON.parse(await Deno.readTextFile("./deno.json"));

  // The deploy CLI writes the resolved org/app back into deno.json; committing
  // them would tie the repository to one account.
  assertEquals(config.deploy, undefined);
});

Deno.test("parseBuildInfo reads deploy metadata", () => {
  assertJsonEquals(parseBuildInfo(JSON.stringify(SAMPLE)), SAMPLE);
});

Deno.test("parseBuildInfo falls back to unknown for malformed files", () => {
  assertJsonEquals(parseBuildInfo("not json"), UNKNOWN_BUILD_INFO);
  assertJsonEquals(parseBuildInfo("[]"), UNKNOWN_BUILD_INFO);
  assertJsonEquals(parseBuildInfo("null"), UNKNOWN_BUILD_INFO);
  assertJsonEquals(parseBuildInfo("{}"), UNKNOWN_BUILD_INFO);
});

Deno.test("parseBuildInfo ignores non-string and blank fields", () => {
  const info = parseBuildInfo(JSON.stringify({
    commit: 42,
    branch: "   ",
    dirty: "yes",
    treeHash: null,
    builtAt: "2026-09-12T10:00:00.000Z",
  }));

  assertEquals(info.commit, "unknown");
  assertEquals(info.branch, "unknown");
  assertEquals(info.dirty, false);
  assertEquals(info.treeHash, "unknown");
  assertEquals(info.builtAt, "2026-09-12T10:00:00.000Z");
});

Deno.test("parseBuildInfo derives the short commit when it is missing", () => {
  const info = parseBuildInfo(JSON.stringify({ commit: SAMPLE.commit }));

  assertEquals(info.commitShort, "63dd472");
});

Deno.test("shortenCommit keeps unknown and short values unchanged", () => {
  assertEquals(shortenCommit("unknown"), "unknown");
  assertEquals(shortenCommit("abc"), "abc");
  assertEquals(shortenCommit(SAMPLE.commit), "63dd472");
});

Deno.test("describeBuildInfo marks builds made from a modified working tree", () => {
  assertEquals(describeBuildInfo(parseBuildInfo(JSON.stringify(SAMPLE))), "63dd472");
  assertEquals(
    describeBuildInfo(parseBuildInfo(JSON.stringify({ ...SAMPLE, dirty: true }))),
    "63dd472-dirty",
  );
});

Deno.test("readBuildInfo returns unknown metadata when the file is missing", async () => {
  const info = await readBuildInfo({
    readTextFile: () => Promise.reject(new Deno.errors.NotFound()),
  });

  assertJsonEquals(info, UNKNOWN_BUILD_INFO);
});

Deno.test("loadBuildInfo reads the file once per isolate", async () => {
  resetBuildInfoCache();

  const first = await loadBuildInfo();
  const second = await loadBuildInfo();

  assertEquals(first, second);
  resetBuildInfoCache();
});

Deno.test("loadBuildInfo bypasses the cache for injected dependencies", async () => {
  resetBuildInfoCache();
  let reads = 0;
  const readTextFile = () => {
    reads += 1;
    return Promise.resolve(JSON.stringify(SAMPLE));
  };

  assertJsonEquals(await loadBuildInfo({ readTextFile }), SAMPLE);
  assertJsonEquals(await loadBuildInfo({ readTextFile }), SAMPLE);
  assertEquals(reads, 2);
});
