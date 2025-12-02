#!/usr/bin/env bash
set -euo pipefail

NEWS_JSON="../data/news.json"
NEWS_ROOT="../assets/news"

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required but not installed." >&2
  exit 1
fi

if [ ! -f "$NEWS_JSON" ]; then
  echo "Error: $NEWS_JSON not found." >&2
  exit 1
fi

echo "🔍 Reading folders from $NEWS_JSON ..."

folders=$(jq -r '.items[].folder // empty' "$NEWS_JSON" | sort -u)

if [ -z "$folders" ]; then
  echo "No folders found in items[].folder"
  exit 0
fi

for folder in $folders; do
  dir="$NEWS_ROOT/$folder"
  echo "📂 Processing folder: $dir"

  if [ ! -d "$dir" ]; then
    echo "  ⚠️ Folder missing: $dir"
    images_json="[]"
  else
    echo "  📸 Scanning images (supports spaces)..."

    # Collect file list safely into a temp file
    filelist=$(mktemp)

    # Use find -print0 + while read -r -d ''
    find "$dir" -maxdepth 1 -type f \( \
      -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o \
      -iname '*.webp' -o -iname '*.gif' \
    \) -print0 | while IFS= read -r -d '' file; do
      printf '%s\n' "$file" >> "$filelist"
    done

    if [ ! -s "$filelist" ]; then
      echo "  ⚠️ No images found"
      images_json="[]"
    else
      echo "  ✅ Found images:"
      cat "$filelist"

      # Convert newline-separated file list → JSON array
      images_json=$(jq -R . < "$filelist" | jq -s .)
    fi

    rm -f "$filelist"
  fi

  # Update JSON
  tmp=$(mktemp)
  jq --arg folder "$folder" --argjson images "$images_json" '
    .items |= map(
      if .folder == $folder then
        .images = $images
      else
        .
      end
    )
  ' "$NEWS_JSON" > "$tmp"
  mv "$tmp" "$NEWS_JSON"

  echo "  ✅ Updated JSON for folder '$folder'"
done

echo "🎉 Done! Updated $NEWS_JSON with full filenames (including spaces)"