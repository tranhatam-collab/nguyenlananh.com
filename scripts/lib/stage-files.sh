#!/usr/bin/env bash
# Stage modified files using hash-object + update-index to avoid git add hang
# This bypasses the LFS filter and any other git add issues

REPO="/Users/tranhatam/Documents/Devnewproject/nguyenlananh.com"
cd "$REPO" || exit 1

echo "Hashing and staging modified files..."

# Find all HTML/JS/CSS/JSON/MJS/SH files in target directories
# and stage them using update-index
stage_file() {
  local f="$1"
  local hash
  hash=$(git hash-object -w "$REPO/$f" 2>&1)
  if [ $? -eq 0 ]; then
    local perm
    perm=$(stat -f "%p" "$REPO/$f" | tail -c 4)
    # Normalize: executable = 100755, regular = 100644
    if [ -x "$REPO/$f" ]; then
      git update-index --cacheinfo 100755,"$hash","$f"
    else
      git update-index --cacheinfo 100644,"$hash","$f"
    fi
    echo "Staged: $f ($hash)"
  else
    echo "ERROR hashing: $f"
  fi
}

# Get list of files in target dirs from index, compare to working tree
for dir in members admin en/members en/admin; do
  if [ -d "$REPO/$dir" ]; then
    while IFS= read -r -d '' file; do
      rel="${file#$REPO/}"
      idx_hash=$(git ls-files -s "$rel" 2>/dev/null | awk '{print $2}')
      wt_hash=$(git hash-object "$file" 2>/dev/null)
      if [ -n "$wt_hash" ] && [ "$idx_hash" != "$wt_hash" ]; then
        stage_file "$rel"
      fi
    done < <(find "$REPO/$dir" -type f -print0)
  fi
done

# Handle specific files
for f in "assets/members.js"; do
  idx_hash=$(git ls-files -s "$f" 2>/dev/null | awk '{print $2}')
  wt_hash=$(git hash-object "$REPO/$f" 2>/dev/null)
  if [ -n "$wt_hash" ] && [ "$idx_hash" != "$wt_hash" ]; then
    stage_file "$f"
  fi
done

# Handle scripts/ directory
while IFS= read -r -d '' file; do
  rel="${file#$REPO/}"
  idx_hash=$(git ls-files -s "$rel" 2>/dev/null | awk '{print $2}')
  wt_hash=$(git hash-object "$file" 2>/dev/null)
  if [ -n "$wt_hash" ] && [ "$idx_hash" != "$wt_hash" ]; then
    stage_file "$rel"
  fi
done < <(find "$REPO/scripts" -type f -print0)

echo "Done staging!"
