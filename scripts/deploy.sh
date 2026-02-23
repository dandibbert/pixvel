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

deno deploy \
  --org="$DENO_DEPLOY_ORG" \
  --app="$DENO_DEPLOY_APP" \
  --prod .
