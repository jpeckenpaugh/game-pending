#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ARTIFACTS_DIR=${TEST_ARTIFACTS_DIR:-"$ROOT/test-artifacts"}
case "$ARTIFACTS_DIR" in
  /*) ;;
  *) ARTIFACTS_DIR="$ROOT/$ARTIFACTS_DIR" ;;
esac
MODE=fast
case "${1-}" in
  "") ;;
  --showcase) MODE=showcase ;;
  *) echo "Usage: $0 [--showcase]" >&2; exit 2 ;;
esac
if [ "$#" -gt 1 ]; then
  echo "Usage: $0 [--showcase]" >&2
  exit 2
fi
mkdir -p "$ARTIFACTS_DIR"
docker build -t game-pending-browser-test:local "$ROOT/test-runner"
docker run --rm --init --name game-pending-browser-test \
  -e GAME_PENDING_SHOWCASE="$([ "$MODE" = showcase ] && echo 1 || echo 0)" \
  -v "$ROOT/html:/game:ro" -v "$ARTIFACTS_DIR:/artifacts" \
  game-pending-browser-test:local
