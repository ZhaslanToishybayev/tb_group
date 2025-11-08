#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <version>" >&2
  exit 1
fi

VERSION="$1"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE_PATH="$REPO_ROOT/releases/base-stack-${VERSION}.tar.gz"

echo "==> Creating release archive ${ARCHIVE_PATH}"

tar -czf "$ARCHIVE_PATH" \
  --exclude='releases/*.tar.gz' \
  --exclude='node_modules' \
  --exclude='*/node_modules' \
  --exclude='dist' \
  --exclude='*/dist' \
  -C "$REPO_ROOT" .

echo "==> Release archive ready: $ARCHIVE_PATH"
