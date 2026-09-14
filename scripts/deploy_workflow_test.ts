import { assertStrictEquals as assertEquals } from "../src/services/test_asserts.ts";

const WORKFLOW_PATH = "./.github/workflows/deploy.yml";
const PUBLISH_PATH = "./scripts/publish.sh";

async function readWorkflow(): Promise<string> {
  return await Deno.readTextFile(WORKFLOW_PATH);
}

/**
 * A deploy that cannot be checked is the failure mode that hid a broken
 * production release: the upload succeeded, the workflow went green, and the
 * site kept serving the previous revision.
 */
Deno.test("the deploy workflow never skips verifying the live deployment", async () => {
  const workflow = await readWorkflow();
  const verifyStep = workflow.slice(
    workflow.indexOf("- name: Verify the deployment serves this revision"),
  );

  assertEquals(verifyStep.length > 0, true);

  const stepBody = verifyStep.slice(0, verifyStep.indexOf("\n      - name: "));
  assertEquals(stepBody.includes("if: "), false);
  assertEquals(stepBody.includes("deno task deploy:check"), true);
});

Deno.test("the deploy workflow fails when it has no URL to verify", async () => {
  const workflow = await readWorkflow();

  assertEquals(workflow.includes('if [ -z "$VERIFY_URL" ]'), true);
  assertEquals(workflow.includes("::error::Nothing can confirm this deploy went live"), true);
});

Deno.test("the deploy workflow reports a revision that never reached production", async () => {
  const workflow = await readWorkflow();

  assertEquals(workflow.includes("jq -r '.productionUrl // empty'"), true);
  assertEquals(workflow.includes("::warning::This revision was uploaded but no production"), true);
});

Deno.test("the deploy result is captured outside the repository", async () => {
  const workflow = await readWorkflow();

  // An extra file in the working tree would change the tree hash that
  // deploy:check compares against, turning every deploy into a mismatch.
  assertEquals(workflow.includes("DEPLOY_RESULT_PATH: ${{ runner.temp }}/"), true);
});

Deno.test("publish.sh asks for machine-readable output only when capturing it", async () => {
  const publish = await Deno.readTextFile(PUBLISH_PATH);

  assertEquals(publish.includes('if [ -n "${DEPLOY_RESULT_PATH:-}" ]'), true);
  assertEquals(publish.includes("args+=(--json)"), true);
  assertEquals(publish.includes("--prod"), true);
});
