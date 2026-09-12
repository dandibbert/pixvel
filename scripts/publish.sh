#!/bin/bash
set -euo pipefail

# Uploads the current working tree to Deno Deploy. Shared by `deno task deploy`
# and the GitHub Actions workflow so both use the exact same invocation.
#
# The target is never hardcoded in the repository: set DENO_DEPLOY_ORG and
# DENO_DEPLOY_APP in .env.deploy locally, or as repository variables in CI.

DEPLOY_CLI_MODULE="${DEPLOY_CLI_MODULE:-jsr:@deno/deploy}"
DEPLOY_CONFIG_FILE="deno.json"

if [ -z "${DENO_DEPLOY_ORG:-}" ] || [ -z "${DENO_DEPLOY_APP:-}" ]; then
  echo "Error: set DENO_DEPLOY_ORG and DENO_DEPLOY_APP before deploying" >&2
  exit 1
fi

args=(--prod --org "$DENO_DEPLOY_ORG" --app "$DENO_DEPLOY_APP")

if [ -n "${CI:-}" ]; then
  args+=(--non-interactive)
fi

# After a successful upload the deploy CLI writes the resolved org and app back
# into deno.json. That would put the account name back into a tracked file and
# leave the working tree differing from what was just uploaded, which in turn
# makes `deno task deploy:check` report a false mismatch. The target is always
# passed explicitly above, so the rewrite is simply undone.
config_backup="$(mktemp)"
cp "$DEPLOY_CONFIG_FILE" "$config_backup"

restore_deploy_config() {
  if ! cmp -s "$DEPLOY_CONFIG_FILE" "$config_backup"; then
    cp "$config_backup" "$DEPLOY_CONFIG_FILE"
    echo "note: reverted the org/app the deploy CLI wrote into $DEPLOY_CONFIG_FILE"
  fi
  rm -f "$config_backup"
}

trap restore_deploy_config EXIT

# Deno 2.9.x forwards every flag to the bundled deploy CLI twice, so the
# subcommand rejects its own arguments ("can only occur once"). Probing with
# --version tells the two behaviours apart; when it fails, the identical CLI is
# run straight from JSR instead.
if deno deploy --version >/dev/null 2>&1; then
  deno deploy "${args[@]}" "${@:-.}"
else
  echo "note: 'deno deploy' cannot parse its own flags on this Deno version; using $DEPLOY_CLI_MODULE"
  deno run --allow-all "$DEPLOY_CLI_MODULE" "${args[@]}" "${@:-.}"
fi
