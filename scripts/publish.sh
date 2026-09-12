#!/bin/bash
set -euo pipefail

# Uploads the current working tree to Deno Deploy. Shared by `deno task deploy`
# and the GitHub Actions workflow so both use the exact same invocation.
#
# Reads DENO_DEPLOY_ORG / DENO_DEPLOY_APP when set; otherwise the org and app
# recorded in deno.json are used.

DEPLOY_CLI_MODULE="${DEPLOY_CLI_MODULE:-jsr:@deno/deploy}"

args=(--prod)

if [ -n "${DENO_DEPLOY_ORG:-}" ]; then
  args+=(--org "$DENO_DEPLOY_ORG")
fi

if [ -n "${DENO_DEPLOY_APP:-}" ]; then
  args+=(--app "$DENO_DEPLOY_APP")
fi

if [ -n "${CI:-}" ]; then
  args+=(--non-interactive)
fi

# Deno 2.9.x forwards every flag to the bundled deploy CLI twice, so the
# subcommand rejects its own arguments ("can only occur once"). Probing with
# --version tells the two behaviours apart; when it fails, the identical CLI is
# run straight from JSR instead.
if deno deploy --version >/dev/null 2>&1; then
  exec deno deploy "${args[@]}" "${@:-.}"
fi

echo "note: 'deno deploy' cannot parse its own flags on this Deno version; using $DEPLOY_CLI_MODULE"
exec deno run --allow-all "$DEPLOY_CLI_MODULE" "${args[@]}" "${@:-.}"
