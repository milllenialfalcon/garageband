#!/usr/bin/env bash
# Factory box smoke test: every tool installed, logged in, able to answer, and the
# git guard working. Prints PASS/FAIL per line and a summary. Safe to run any time.
set -uo pipefail
export PATH="/opt/factory/bin:$HOME/.local/bin:/opt/npm-global/bin:$HOME/.cargo/bin:$HOME/.local/share/vite-plus/bin:$PATH"
pass=0 fail=0
row() { if [ "$2" = 0 ]; then printf '  PASS  %s\n' "$1"; pass=$((pass+1)); else printf '  FAIL  %s  %s\n' "$1" "${3:-}"; fail=$((fail+1)); fi; }
have() { command -v "$1" >/dev/null 2>&1; }
t() { timeout "${2:-120}" bash -c "$1" >/tmp/smoke.out 2>&1; }

echo "Tools"
for c in t3 node git gh claude codex opencode hermes; do have "$c"; row "$c installed" $? ; done
have vp; row "vp (Enigma builds)" $? "installed on the first Enigma ticket if missing"

echo "Logins and a one-line answer from each (uses a tiny amount of each plan)"
t 'gh auth status'; row "GitHub" $?
t 'claude -p "Reply with the single word READY" | grep -q READY' 180; row "Claude Code answers" $? "$(tail -1 /tmp/smoke.out)"
t 'codex exec --skip-git-repo-check "Reply with the single word READY" | grep -q READY' 180; row "Codex answers" $? "$(tail -1 /tmp/smoke.out)"
t 'opencode run "Reply with the single word READY" | grep -q READY' 180; row "OpenCode answers" $? "$(tail -1 /tmp/smoke.out)"
if have hermes; then t 'hermes chat -q "Reply with the single word READY" | grep -q READY' 180; row "Hermes answers" $? "$(tail -1 /tmp/smoke.out)"; fi

echo "Skills"
n=$(ls -d "$HOME"/.agents/skills/*/ 2>/dev/null | wc -l); [ "$n" -ge 37 ]; row "Garageband skills in ~/.agents/skills ($n)" $?
n=$(ls -d "$HOME"/.claude/skills/*/ 2>/dev/null | wc -l); [ "$n" -ge 37 ]; row "Garageband skills in ~/.claude/skills ($n)" $?

echo "Workspace"
[ -e /workspace/garageband/.factory/ledger.md ]; row "factory-state ledger linked" $?
curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${T3CODE_PORT:-3773}/" | grep -qv "^000$"; row "T3 server responding on :${T3CODE_PORT:-3773}" $?

echo "Guards"
tmp="$(mktemp -d)"; git init -q --bare "$tmp/remote.git"; git init -q "$tmp/w"
( cd "$tmp/w" && git commit -q --allow-empty -m x && git remote add origin "$tmp/remote.git" )
git -C "$tmp/w" push -q origin HEAD:main >/dev/null 2>&1; [ $? -ne 0 ]; row "push to main is blocked" $?
git -C "$tmp/w" push -q origin HEAD:refs/heads/t/a-001-x >/dev/null 2>&1; row "push to a ticket branch works" $?
git -C "$tmp/w" push -q --no-verify origin HEAD:main >/dev/null 2>&1; [ $? -ne 0 ]; row "--no-verify is refused" $?
rm -rf "$tmp"

echo
echo "$pass passed, $fail failed"
[ "$fail" = 0 ]
