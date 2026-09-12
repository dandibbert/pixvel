#!/bin/bash
set -e

if [ -f .env.deploy ]; then
  set -a
  source .env.deploy
  set +a
fi

if [ -z "$DENO_DEPLOY_ORG" ] || [ -z "$DENO_DEPLOY_APP" ]; then
  echo "Error: set DENO_DEPLOY_ORG and DENO_DEPLOY_APP in .env.deploy or environment"
  exit 1
fi

npm --prefix frontend run build

# Must run after the frontend build so the recorded fingerprint covers the
# assets that are about to be uploaded.
deno run --allow-read --allow-write --allow-env=BUILD_BRANCH --allow-run=git scripts/build_info.ts

deno deploy \
  --org="$DENO_DEPLOY_ORG" \
  --app="$DENO_DEPLOY_APP" \
  --prod .
