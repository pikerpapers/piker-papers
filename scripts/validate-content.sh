#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENTRY_DIR="$ROOT_DIR/content/entries"
FAILED=0
FEATURED_COUNT=0

if [[ ! -d "$ENTRY_DIR" ]]; then
  echo "Missing content directory: $ENTRY_DIR"
  exit 1
fi

for entry in "$ENTRY_DIR"/*.md; do
  if [[ "$(basename "$entry")" == "_index.md" ]]; then
    continue
  fi

  for required in \
    "title =" \
    "date =" \
    "description =" \
    "[taxonomies]" \
    "categories =" \
    "severity =" \
    "entry_type =" \
    "[extra]" \
    "status =" \
    "schema_version =" \
    "[[extra.sources]]"; do
    if ! rg -q "^${required}" "$entry"; then
      echo "Missing '$required' in $(basename "$entry")"
      FAILED=1
    fi
  done

  status="$(rg -o '^status = "([^"]+)"' "$entry" | sed -E 's/^status = "([^"]+)"$/\1/' | head -n 1)"
  case "$status" in
    published|under_review|retracted) ;;
    *)
      echo "Invalid status '$status' in $(basename "$entry")"
      FAILED=1
      ;;
  esac

  featured="$(rg -o '^featured = (true|false)' "$entry" | sed -E 's/^featured = (true|false)$/\1/' | head -n 1 || true)"
  if [[ "$featured" == "true" ]]; then
    if [[ "$status" != "published" ]]; then
      echo "Featured file must be published in $(basename "$entry")"
      FAILED=1
    fi

    FEATURED_COUNT=$((FEATURED_COUNT + 1))
  fi
done

if [[ "$FEATURED_COUNT" -gt 1 ]]; then
  echo "Only one featured file is allowed."
  FAILED=1
fi

if [[ "$FAILED" -ne 0 ]]; then
  echo "Content validation failed."
  exit 1
fi

echo "Content validation passed."
