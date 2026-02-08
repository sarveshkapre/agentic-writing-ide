#!/usr/bin/env bash
set -euo pipefail

if ! command -v go >/dev/null 2>&1; then
  echo "Go is required to run workflow linting (install Go 1.22+)." >&2
  exit 1
fi

BIN_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/agentic-writing-ide/bin"
ACTIONLINT_BIN="$BIN_DIR/actionlint"

mkdir -p "$BIN_DIR"

if [[ ! -x "$ACTIONLINT_BIN" ]]; then
  echo "Installing actionlint..." >&2
  GOBIN="$BIN_DIR" go install github.com/rhysd/actionlint/cmd/actionlint@v1.7.10
fi

"$ACTIONLINT_BIN" "$@"
