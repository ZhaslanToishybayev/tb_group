#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Bootstrapping status-service"
(
  cd "$REPO_ROOT/status-service"
  npm install
  npm run build
  npm test
  rm -rf dist node_modules
)

echo "==> Bootstrapping taskmaster"
(
  cd "$REPO_ROOT/taskmaster"
  npm install --legacy-peer-deps
  npm run test -- --testPathPattern=unit --coverage=false
  rm -rf dist node_modules
)

echo "==> Bootstrap complete. Repository is clean and verified."
