#!/usr/bin/env bash
# Guided one-time setup inside the factory box. Safe to run again: finished steps are skipped.
#   docker compose -f box/compose.yaml exec box first-run
set -uo pipefail
export PATH="/opt/factory/bin:$HOME/.local/bin:/opt/npm-global/bin:$HOME/.cargo/bin:$HOME/.local/share/vite-plus/bin:$PATH"

GB_REPO="${GB_REPO:-milllenialfalcon/Garageband}"
SPRINT_BRANCH="${SPRINT_BRANCH:-sprint/track-a}"
WS=/workspace
GB="$WS/garageband"

bold() { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok() { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
ask() { local q="$1" d="${2:-}" a; read -r -p "  $q${d:+ [$d]}: " a; printf '%s' "${a:-$d}"; }
yes() { local a; read -r -p "  $1 [Y/n]: " a; [ -z "$a" ] || [[ "$a" =~ ^[Yy] ]]; }

bold "Garageband factory box: first-run setup"
echo "  About 15 minutes. Each login opens a link: paste it into your Windows browser."

# 1. T3 Code server (nightly, to match your desktop app)
bold "1/9  T3 Code server"
if command -v t3 >/dev/null 2>&1; then ok "t3 $(t3 --version 2>/dev/null | head -1)"
else
  curl -fsSL https://t3.codes/install.sh | T3CODE_CHANNEL="${T3CODE_CHANNEL:-nightly}" sh && hash -r
  command -v t3 >/dev/null 2>&1 && ok "installed t3 (the box starts serving it within 10 seconds)" || warn "t3 install failed; see output above"
fi

# 2. Hermes Agent CLI
bold "2/9  Hermes Agent"
if command -v hermes >/dev/null 2>&1; then ok "hermes found"
else
  curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash -s -- --non-interactive --skip-computer-use
  hash -r
  [ -x "$HOME/.local/bin/hermes" ] || [ -n "$(command -v hermes)" ] && ok "installed hermes" || warn "hermes install failed; the heavy lane falls back to OpenCode"
fi

# 3. GitHub
bold "3/9  GitHub (agents push branches and open pull requests; they never push main)"
if gh auth status >/dev/null 2>&1; then ok "gh logged in as $(gh api user -q .login 2>/dev/null)"
else
  gh auth login --hostname github.com --git-protocol https --web --scopes "repo,workflow,read:org" || warn "GitHub login skipped"
fi
gh auth setup-git >/dev/null 2>&1 || true
if [ -z "$(git config --global user.name)" ]; then
  login="$(gh api user -q .login 2>/dev/null || echo avi)"
  git config --global user.name "$(ask 'Name for commits' "$login")"
  git config --global user.email "$(ask 'Email for commits' "$login@users.noreply.github.com")"
fi
ok "commits as $(git config --global user.name) <$(git config --global user.email)>"

# 4. Agent logins
bold "4/9  Agent logins"
login_step() { # name, check-command, login-command
  if eval "$2" >/dev/null 2>&1; then ok "$1 already logged in"
  else
    echo "  Logging in to $1 ..."
    eval "$3" || warn "$1 login did not finish; run it again later: $3"
  fi
}
login_step "Claude Code" "claude auth status" "claude auth login"
login_step "Codex" "codex login status" "codex login --device-auth"
login_step "OpenCode (choose OpenCode Go)" "opencode auth list | grep -qi opencode" "opencode auth login"
if command -v hermes >/dev/null 2>&1; then
  if [ -s "$HOME/.hermes/config.yaml" ]; then ok "Hermes configured ($HOME/.hermes/config.yaml)"
  else
    echo "  Set Hermes to the same DeepSeek model you use on Windows."
    echo "  Tip: instead, copy your Windows config in from PowerShell:"
    echo "    docker cp \$env:USERPROFILE\\.hermes\\config.yaml garageband-box:/home/factory/.hermes/config.yaml"
    echo "    docker cp \$env:USERPROFILE\\.hermes\\.env garageband-box:/home/factory/.hermes/.env"
    yes "Run 'hermes setup' now?" && hermes setup
  fi
fi

# 5. Repositories
bold "5/9  Repositories"
mkdir -p "$WS/reference"
if [ ! -d "$GB/.git" ]; then git clone "https://github.com/$GB_REPO.git" "$GB" || warn "clone failed"; fi
if [ -d "$GB/.git" ]; then
  git -C "$GB" fetch -q origin
  if git -C "$GB" rev-parse -q --verify "origin/$SPRINT_BRANCH" >/dev/null; then
    git -C "$GB" checkout -q "$SPRINT_BRANCH" 2>/dev/null || git -C "$GB" checkout -q -b "$SPRINT_BRANCH" "origin/$SPRINT_BRANCH"
  fi
  if [ ! -e "$GB/.factory" ] && git -C "$GB" rev-parse -q --verify origin/factory-state >/dev/null; then
    git -C "$GB" worktree add -q "$GB/.factory" factory-state 2>/dev/null \
      || git -C "$GB" worktree add -q -B factory-state "$GB/.factory" origin/factory-state
  fi
  ok "Garageband at $GB on $(git -C "$GB" branch --show-current); factory state: $([ -e "$GB/.factory/ledger.md" ] && echo linked || echo MISSING)"
fi
if [ ! -d "$WS/reference/t3code/.git" ]; then
  git clone -q --depth 50 https://github.com/pingdotgg/t3code.git "$WS/reference/t3code" && ok "T3 Code source (read-only reference) at $WS/reference/t3code"
else ok "T3 Code reference present"; fi

# 6. Garageband skills for every tool
bold "6/9  Garageband skills"
curl -fsSL "https://raw.githubusercontent.com/$GB_REPO/main/install.sh" | bash -s -- --agents --claude \
  && ok "skills in ~/.agents/skills and ~/.claude/skills" || warn "skills install failed"
if command -v hermes >/dev/null 2>&1; then
  mkdir -p "$HOME/.hermes/skills"
  for d in "$HOME/.agents/skills"/*/; do n="$(basename "$d")"; [ -e "$HOME/.hermes/skills/$n" ] || ln -s "$d" "$HOME/.hermes/skills/$n"; done
  ok "skills linked into ~/.hermes/skills"
fi

# 7. Register the project in T3
bold "7/9  T3 project"
for _ in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${T3CODE_PORT:-3773}/" | grep -qv "^000$" && break; sleep 2; done
if t3 project add "$GB" --title "Garageband" >/dev/null 2>&1; then ok "added Garageband to T3"
else ok "Garageband already registered in T3 (or the server is still starting; first-run can be re-run)"; fi

# 8. Trello key check (optional)
bold "8/9  Trello mirror (optional)"
if [ -n "${TRELLO_KEY:-}" ] && [ -n "${TRELLO_TOKEN:-}" ]; then ok "Trello key present"
else warn "No Trello key in box/box.env. The concierge will keep status in the ledger only until you add one."; fi

# 9. Pairing
bold "9/9  Connect your T3 desktop app"
echo "  In the T3 desktop app: Settings → Connections → Add environment → paste the link below,"
echo "  but change the address part to  http://127.0.0.1:3773  (the box publishes T3 only to this PC)."
t3 pair --label "Windows desktop" 2>/dev/null || warn "pairing failed; run: docker compose -f box/compose.yaml exec box t3 pair"

bold "Done. Run the smoke test:  docker compose -f box/compose.yaml exec box box-smoke"
