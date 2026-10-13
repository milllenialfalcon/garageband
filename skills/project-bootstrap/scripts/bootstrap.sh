#!/usr/bin/env bash
# Garageband project bootstrap.
# Copies the Garageband project kit into a repo without overwriting anything that already exists.
#
# Usage: bash bootstrap.sh [target-dir] [--protect]
#   target-dir  defaults to the current directory
#   --protect   also turn on GitHub branch protection for main (needs the gh CLI, logged in, admin rights)
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
kit="$here/../assets/project"
target="."
protect=0
for a in "$@"; do
  case "$a" in
    --protect) protect=1 ;;
    -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
    *) target="$a" ;;
  esac
done

[ -d "$kit" ] || { echo "Kit not found at $kit" >&2; exit 1; }
mkdir -p "$target"
target="$(cd "$target" && pwd)"

added=() skipped=()
while IFS= read -r -d '' src; do
  rel="${src#"$kit"/}"
  dst="$target/$rel"
  if [ -e "$dst" ]; then
    skipped+=("$rel")
  else
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
    added+=("$rel")
  fi
done < <(find "$kit" -type f -print0 | sort -z)

mkdir -p "$target/.factory/briefs" "$target/.factory/handoffs" "$target/.factory/research" \
         "$target/.factory/retros" "$target/.factory/reports" "$target/.factory/tickets" \
         "$target/.factory/intake" "$target/docs/design/pages"
for d in briefs handoffs research retros reports tickets intake; do
  [ -e "$target/.factory/$d/.gitkeep" ] || touch "$target/.factory/$d/.gitkeep"
done
[ -e "$target/docs/design/pages/.gitkeep" ] || touch "$target/docs/design/pages/.gitkeep"
chmod +x "$target/.githooks/pre-push" 2>/dev/null || true

# CLAUDE.md points at AGENTS.md so every tool reads the same constitution
if [ ! -e "$target/CLAUDE.md" ]; then
  (cd "$target" && ln -s AGENTS.md CLAUDE.md 2>/dev/null) || cp "$target/AGENTS.md" "$target/CLAUDE.md"
  added+=("CLAUDE.md -> AGENTS.md")
fi

# Git: init if needed, and switch on the shared hooks folder
if [ ! -d "$target/.git" ]; then
  git -C "$target" init -q -b main
  added+=("git repository (branch main)")
fi
git -C "$target" config core.hooksPath .githooks

echo "Garageband kit installed in $target"
echo "  Added:   ${#added[@]} items"
for f in "${added[@]}"; do echo "    + $f"; done
if [ ${#skipped[@]} -gt 0 ]; then
  echo "  Kept your existing files (not overwritten): ${#skipped[@]}"
  for f in "${skipped[@]}"; do echo "    = $f"; done
fi
echo "  Git hooks: on (.githooks/pre-push blocks pushes to main, force pushes and obvious secrets)"

if [ "$protect" -eq 1 ]; then
  if ! command -v gh >/dev/null 2>&1; then
    echo "  Branch protection: skipped, gh CLI not installed." >&2
  else
    repo="$(cd "$target" && gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
    if [ -z "$repo" ]; then
      echo "  Branch protection: skipped, no GitHub remote found. Push the repo first, then re-run with --protect." >&2
    else
      gh api -X PUT "repos/$repo/branches/main/protection" --input - >/dev/null <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["quality", "secrets"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
      echo "  Branch protection: on for $repo main (PRs must pass 'quality' and 'secrets'; no force pushes or deletion)"
    fi
  fi
else
  echo "  Branch protection: not set. Re-run with --protect after pushing to GitHub (recommended)."
fi

echo
echo "Next: fill in AGENTS.md section 8 (stack, commands, model roles), then run validate-idea or write-spec."
