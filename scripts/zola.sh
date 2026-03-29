#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ZOLA_BIN="$ROOT_DIR/.tools/bin/zola"

if [[ ! -x "$ZOLA_BIN" ]]; then
  echo "Missing Zola binary at $ZOLA_BIN"
  echo "Expected local binary. Re-download or install Zola first."
  exit 1
fi

exec "$ZOLA_BIN" "$@"
