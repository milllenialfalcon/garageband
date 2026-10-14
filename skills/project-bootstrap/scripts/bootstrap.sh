#!/usr/bin/env bash
# Garageband project bootstrap.
# Copies the Garageband project kit into a repo without overwriting anything that already exists,
# and sets up .factory/ as a worktree of the `factory-state` branch (shared state for every model and tool).
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
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) target="$a" ;;
  esac
done

[ -d "$kit" ] || { echo "Kit not found at $kit" >&2; exit 1; }
mkdir -p "$target"
target="$(cd "$target" && pwd)"
g() { git -C "$target" "$@"; }
# Commits made by this script need an identity even on a fresh machine.
gc() { git -C "$1" -c user.name="${GIT_AUTHOR_NAME:-$(git config user.name || echo Garageband)}" \
                   -c user.email="${GIT_AUTHOR_EMAIL:-$(git config user.email || echo garageband@localhost)}" "${@:2}"; }

added=() skipped=() notes=()

# 1. Git repository
if ! g rev-parse --git-dir >/dev/null 2>&1; then
  g init -q -b main
  added+=("git repository (branch main)")
fi
g config core.hooksPath .githooks

# 2. .gitignore: make sure the essentials are ignored even if the repo already has its own file
if [ ! -e "$target/.gitignore" ]; then
  cp "$kit/_gitignore" "$target/.gitignore"
  added+=(".gitignore")
fi
for line in ".factory" ".env" ".env.*" "!.env.example" "node_modules/"; do
  grep -qxF "$line" "$target/.gitignore" || { printf '%s\n' "$line" >> "$target/.gitignore"; notes+=(".gitignore += $line"); }
done

# 3. .factory/ as a worktree of the factory-state branch
fdir="$target/.factory"
if [ -e "$fdir/.git" ]; then
  notes+=(".factory already set up as factory-state worktree")
elif [ -d "$fdir" ] && [ -n "$(ls -A "$fdir" 2>/dev/null)" ]; then
  notes+=("WARNING: .factory exists as a plain folder; left as is. Move it aside and re-run to use the factory-state branch.")
else
  rmdir "$fdir" 2>/dev/null || true
  if g show-ref --verify --quiet refs/heads/factory-state; then
    :
  elif g remote get-url origin >/dev/null 2>&1 && g ls-remote --exit-code --heads origin factory-state >/dev/null 2>&1; then
    g fetch -q origin factory-state:factory-state
  else
    empty_tree="$(g hash-object -t tree /dev/null)"
    first="$(gc "$target" commit-tree "$empty_tree" -m "factory: start factory-state branch")"
    g branch factory-state "$first"
  fi
  g worktree add -q "$fdir" factory-state
  added+=(".factory/ (worktree of branch factory-state)")
fi

# 4. Copy the kit, never overwriting
while IFS= read -r -d '' src; do
  rel="${src#"$kit"/}"
  [ "$rel" = "_gitignore" ] && continue   # top-level ignore file is handled in step 2
  # Kit files named _gitignore are stored that way so the Garageband repo itself never ignores them;
  # they are installed as .gitignore.
  case "$rel" in */_gitignore|_gitignore) rel="${rel%_gitignore}.gitignore" ;; esac
  dst="$target/$rel"
  if [ -e "$dst" ]; then
    skipped+=("$rel")
  else
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
    added+=("$rel")
  fi
done < <(find "$kit" -type f -print0 | sort -z)

for d in briefs handoffs research retros reports tickets intake/raw skill-lab; do
  mkdir -p "$fdir/$d"
  [ -e "$fdir/$d/.gitkeep" ] || touch "$fdir/$d/.gitkeep"
done
mkdir -p "$target/docs/design/pages" "$target/docs/legal"
[ -e "$target/docs/design/pages/.gitkeep" ] || touch "$target/docs/design/pages/.gitkeep"
chmod +x "$target/.githooks/pre-push" "$target/scripts/slop-lint.mjs" "$target/scripts/gb-worktree-setup.sh" 2>/dev/null || true

# CLAUDE.md points at AGENTS.md so every tool reads the same constitution
if [ ! -e "$target/CLAUDE.md" ]; then
  (cd "$target" && ln -s AGENTS.md CLAUDE.md 2>/dev/null) || cp "$target/AGENTS.md" "$target/CLAUDE.md"
  added+=("CLAUDE.md -> AGENTS.md")
fi

# 5. Commit the initial factory state on its own branch
if [ -e "$fdir/.git" ] && [ -n "$(git -C "$fdir" status --porcelain)" ]; then
  git -C "$fdir" add -A
  gc "$fdir" commit -q -m "factory: initialise ledger and templates"
fi

echo "Garageband kit installed in $target"
echo "  Added: ${#added[@]} items"
for f in "${added[@]}"; do echo "    + $f"; done
if [ ${#skipped[@]} -gt 0 ]; then
  echo "  Kept your existing files (not overwritten): ${#skipped[@]}"
  for f in "${skipped[@]}"; do echo "    = $f"; done
fi
for n in "${notes[@]}"; do echo "  - $n"; done
echo "  Git hooks: on for this clone (.githooks/pre-push blocks pushes to main, force pushes and obvious secrets)."
echo "             Other clones: run  git config core.hooksPath .githooks"

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
  "required_status_checks": { "strict": true, "contexts": ["quality", "e2e", "secrets"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
      echo "  Branch protection: on for $repo main (PRs must pass quality, e2e and secrets; no force pushes or deletion)"
    fi
  fi
else
  echo "  Branch protection: not set. Push to GitHub, then re-run with --protect (recommended)."
fi

cat <<'EOF'

Next steps
  1. Fill in AGENTS.md section 8 (stack, commands, model roles).
  2. Share factory state once a GitHub remote exists:  git -C .factory push -u origin factory-state
  3. Run validate-idea (new product) or write-spec (new feature).
EOF
