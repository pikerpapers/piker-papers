#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ZOLA_BIN="$ROOT_DIR/.tools/bin/zola"

if [[ -x "$ZOLA_BIN" ]]; then
  exec "$ZOLA_BIN" "$@"
fi

if command -v zola >/dev/null 2>&1; then
  exec zola "$@"
fi

echo "Missing Zola binary at $ZOLA_BIN"
echo "Install Zola locally or place a binary at .tools/bin/zola."
exit 1
