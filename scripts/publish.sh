#!/bin/bash
set -euo pipefail

# Uploads the current working tree to Deno Deploy. Shared by `deno task deploy`
# and the GitHub Actions workflow so both use the exact same invocation.
#
# The target is never hardcoded in the repository: set DENO_DEPLOY_ORG and
# DENO_DEPLOY_APP in .env.deploy locally, or as repository variables in CI.

DEPLOY_CLI_MODULE="${DEPLOY_CLI_MODULE:-jsr:@deno/deploy}"

if [ -z "${DENO_DEPLOY_ORG:-}" ] || [ -z "${DENO_DEPLOY_APP:-}" ]; then
  echo "Error: set DENO_DEPLOY_ORG and DENO_DEPLOY_APP before deploying" >&2
  exit 1
fi

args=(--prod --org "$DENO_DEPLOY_ORG" --app "$DENO_DEPLOY_APP")

if [ -n "${CI:-}" ]; then
  args+=(--non-interactive)
fi

# Uploading is not the same as going live: the CLI reports the domains the
# revision ended up serving on, and that list is empty when nothing reached
# production. Only the JSON output exposes it, so ask for it whenever the
# caller wants the result captured. Keep the path outside the repository —
# an extra file in the working tree changes the tree hash that
# `deno task deploy:check` compares against.
if [ -n "${DEPLOY_RESULT_PATH:-}" ]; then
  args+=(--json)
fi

# Deploying must not edit the project itself: the CLI writes the resolved org
# and app back into deno.json, and running it from JSR would record its own
# dependencies in deno.lock. Either change puts the working tree out of sync
# with what was just uploaded, which makes `deno task deploy:check` report a
# false mismatch (and would commit the account name). The target is always
# passed explicitly above, so both rewrites are simply undone.
tracked_files=(deno.json deno.lock)
backup_dir="$(mktemp -d)"

for file in "${tracked_files[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$backup_dir/$file"
  fi
done

restore_project_files() {
  for file in "${tracked_files[@]}"; do
    if [ -f "$backup_dir/$file" ] && ! cmp -s "$file" "$backup_dir/$file"; then
      cp "$backup_dir/$file" "$file"
      echo "note: reverted the changes the deploy CLI made to $file"
    fi
  done
  rm -rf "$backup_dir"
}

trap restore_project_files EXIT

# Deno 2.9.x forwards every flag to the bundled deploy CLI twice, so the
# subcommand rejects its own arguments ("can only occur once"). Probing with
# --version tells the two behaviours apart; when it fails, the identical CLI is
# run straight from JSR instead.
run_deploy_cli() {
  if deno deploy --version >/dev/null 2>&1; then
    deno deploy "${args[@]}" "${@:-.}"
  else
    # stderr: stdout carries the JSON result when --json is in use.
    echo "note: 'deno deploy' cannot parse its own flags on this Deno version; using $DEPLOY_CLI_MODULE" >&2
    deno run --allow-all --no-lock "$DEPLOY_CLI_MODULE" "${args[@]}" "${@:-.}"
  fi
}

if [ -n "${DEPLOY_RESULT_PATH:-}" ]; then
  run_deploy_cli "$@" | tee "$DEPLOY_RESULT_PATH"
else
  run_deploy_cli "$@"
fi
