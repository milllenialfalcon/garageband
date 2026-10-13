#!/usr/bin/env bash
# Garageband installer for Codex, OpenCode and any tool that reads ~/.agents/skills.
# (Claude Code users: install the plugin instead, see README. Doing both makes OpenCode see duplicates.)
#
#   curl -fsSL https://raw.githubusercontent.com/milllenialfalcon/Garageband/main/install.sh | bash
#
# Options:
#   --agents            install to ~/.agents/skills (default; read by Codex and OpenCode)
#   --claude            also install to ~/.claude/skills (only if you are NOT using the Claude Code plugin)
#   --project <dir>     install into <dir>/.agents/skills and bootstrap the project kit there
#   --uninstall         remove Garageband skills from the chosen location(s)
#   --dry-run           show what would happen
set -euo pipefail

REPO="${GB_REPO:-milllenialfalcon/Garageband}"
REF="${GB_REF:-main}"

targets=() project="" uninstall=0 dry=0 want_agents=0 want_claude=0
while [ $# -gt 0 ]; do
  case "$1" in
    --agents) want_agents=1 ;;
    --claude) want_claude=1 ;;
    --project) project="${2:?--project needs a directory}"; shift ;;
    --uninstall) uninstall=1 ;;
    --dry-run) dry=1 ;;
    -h|--help) sed -n '2,15p' "$0" 2>/dev/null || true; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done
[ $want_agents -eq 0 ] && [ $want_claude -eq 0 ] && [ -z "$project" ] && want_agents=1
[ $want_agents -eq 1 ] && targets+=("$HOME/.agents/skills")
[ $want_claude -eq 1 ] && targets+=("$HOME/.claude/skills")
if [ -n "$project" ]; then
  mkdir -p "$project"
  targets+=("$(cd "$project" && pwd)/.agents/skills")
fi

say() { printf '%s\n' "$*"; }
run() { if [ $dry -eq 1 ]; then say "  (dry-run) $*"; else "$@"; fi; }

# Find the skills: use this checkout if we're inside one, otherwise download.
src=""
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
if [ -n "$script_dir" ] && [ -d "$script_dir/skills/garageband" ]; then
  src="$script_dir"
else
  if [ -z "$REPO" ]; then
    say "GB_REPO is empty. Unset it, set GB_REPO=<owner>/Garageband, or run install.sh from a clone." >&2
    exit 1
  fi
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  say "Downloading $REPO@$REF ..."
  if command -v git >/dev/null 2>&1; then
    git clone -q --depth 1 --branch "$REF" "https://github.com/$REPO.git" "$tmp/gb"
  else
    curl -fsSL "https://codeload.github.com/$REPO/tar.gz/refs/heads/$REF" | tar -xz -C "$tmp"
    mv "$tmp"/*-"$REF" "$tmp/gb"
  fi
  src="$tmp/gb"
fi

skills=()
for d in "$src"/skills/*/; do
  [ -f "$d/SKILL.md" ] && skills+=("$(basename "$d")")
done
[ ${#skills[@]} -gt 0 ] || { say "No skills found in $src/skills" >&2; exit 1; }
version="$(grep -m1 '"version"' "$src/.claude-plugin/plugin.json" 2>/dev/null | sed -E 's/.*"([0-9][^"]*)".*/\1/' || echo unknown)"

for t in "${targets[@]}"; do
  manifest="$t/.garageband-manifest"
  if [ $uninstall -eq 1 ]; then
    if [ -f "$manifest" ]; then
      while read -r s; do [ -n "$s" ] && run rm -rf "${t:?}/$s"; done < "$manifest"
      run rm -f "$manifest"
      say "Removed Garageband from $t"
    else
      say "Garageband not found in $t"
    fi
    continue
  fi

  run mkdir -p "$t"
  for s in "${skills[@]}"; do
    if [ -e "$t/$s" ] && ! grep -qx "$s" "$manifest" 2>/dev/null; then
      say "  ! $t/$s exists and isn't from Garageband. Skipped (rename or remove it, then re-run)."
      continue
    fi
    run rm -rf "${t:?}/$s"
    run cp -R "$src/skills/$s" "$t/$s"
  done
  if [ $dry -eq 0 ]; then
    printf '%s\n' "${skills[@]}" > "$manifest"
    find "$t" -path '*/scripts/*' -type f \( -name '*.sh' -o -name '*.mjs' \) -exec chmod +x {} + 2>/dev/null || true
  fi
  say "Installed ${#skills[@]} Garageband skills (v$version) into $t"
done

if [ -n "$project" ] && [ $uninstall -eq 0 ]; then
  say "Bootstrapping project kit in $project ..."
  run bash "$src/skills/project-bootstrap/scripts/bootstrap.sh" "$project"
fi

if [ $uninstall -eq 0 ]; then
  cat <<'EOF'

Done. Start any session with:   use the garageband skill
  Codex:     type $garageband  (or /skills to browse)
  OpenCode:  ask "use the garageband skill"
In a new project, run the project-bootstrap skill first.
EOF
fi
