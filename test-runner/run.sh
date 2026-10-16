#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$ROOT/test-artifacts"
docker build -t game-pending-browser-test:local "$ROOT/test-runner"
docker run --rm --init --name game-pending-browser-test \
  -v "$ROOT/html:/game:ro" -v "$ROOT/test-artifacts:/artifacts" \
  game-pending-browser-test:local
