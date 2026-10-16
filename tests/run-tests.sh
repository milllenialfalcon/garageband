#!/usr/bin/env bash
# Garageband self-tests: skill validation, guard hook, pre-push hook, bootstrap, slop-lint, installer, server helper.
# Usage: bash tests/run-tests.sh
set -uo pipefail
repo="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
pass=0 fail=0
ok()   { pass=$((pass+1)); printf '  ✓ %s\n' "$1"; }
bad()  { fail=$((fail+1)); printf '  ✗ %s\n' "$1"; }
expect() { # expect <desc> <expected-exit> <command...>
  local desc="$1" want="$2"; shift 2
  "$@" >"$work/out" 2>&1; local got=$?
  if [ "$got" = "$want" ]; then ok "$desc"; else bad "$desc (exit $got, wanted $want)"; sed 's/^/      /' "$work/out" | head -8; fi
}
git_q() { git -c user.email=t@t -c user.name=t -c init.defaultBranch=main "$@" >/dev/null 2>&1; }

echo "1. Skill validation"
expect "all skills valid" 0 node "$repo/scripts/validate-skills.mjs"
cp -r "$repo" "$work/badrepo"; sed -i 's/^name: tdd-slice/name: tdd_slice/' "$work/badrepo/skills/tdd-slice/SKILL.md"
expect "validator catches a bad skill name" 1 node "$work/badrepo/scripts/validate-skills.mjs"
cp -r "$repo" "$work/badrepo2"; sed -i 's/^description: "\(.*\)"$/description: Use when: \1/' "$work/badrepo2/skills/cost-watch/SKILL.md"
expect "validator catches an unquoted colon (strict YAML)" 1 node "$work/badrepo2/scripts/validate-skills.mjs"

echo "2. Claude Code guard hook"
g="$repo/hooks/guard.sh"
hook() { printf '{"tool_name":"Bash","tool_input":{"command":"%s"}}' "$1" | bash "$g"; }
expect "allows git status"               0 hook "git status"
expect "allows push to a feature branch" 0 hook "git push origin t-014-photos"
expect "allows rm of a build folder"     0 hook "rm -rf ./dist"
expect "blocks force push"               2 hook "git push --force origin t-014"
expect "blocks push to main"             2 hook "git push origin main"
expect "blocks push to refs/heads/main"  2 hook "git push origin HEAD:refs/heads/main"
expect "allows pushing factory state"    0 hook "git -C .factory push origin factory-state"
expect "blocks reset --hard"             2 hook "git reset --hard HEAD~3"
expect "blocks rm -rf of home"           2 hook "rm -rf ~"
expect "blocks drop table"               2 hook "psql -c 'DROP TABLE users'"
expect "blocks agent merging a PR"       2 hook "gh pr merge 12 --squash"

echo "3. Project bootstrap"
proj="$work/proj"
expect "bootstrap into new folder" 0 bash "$repo/skills/project-bootstrap/scripts/bootstrap.sh" "$proj"
for f in AGENTS.md CLAUDE.md PRODUCT.md DESIGN.md CHANGELOG.md .env.example .gitignore docs/accounts.md docs/costs.md docs/compliance.md .factory/ledger.md .factory/TICKET_TEMPLATE.md .github/workflows/garageband-ci.yml .githooks/pre-push scripts/slop-lint.mjs docs/specs/_TEMPLATE.md; do
  [ -e "$proj/$f" ] && ok "has $f" || bad "missing $f"
done
[ "$(git -C "$proj" config core.hooksPath)" = ".githooks" ] && ok "git hooks switched on" || bad "hooksPath not set"
[ "$(git -C "$proj/.factory" branch --show-current)" = "factory-state" ] && ok ".factory is a checkout of factory-state" || bad ".factory not on factory-state"
git -C "$proj/.factory" log --oneline | grep -q "initialise ledger" && ok "factory-state has the initial ledger commit" || bad "no initial factory commit"
[ -z "$(git -C "$proj" status --porcelain .factory)" ] && ok "main never sees .factory files" || bad ".factory leaks into main"
echo "secret customer message" > "$proj/.factory/intake/raw/today.md"
[ -z "$(git -C "$proj/.factory" status --porcelain intake/raw)" ] && ok "raw customer messages are never committed" || bad "intake/raw is tracked"
rm "$proj/.factory/intake/raw/today.md"
echo "custom" > "$proj/PRODUCT.md"
bash "$repo/skills/project-bootstrap/scripts/bootstrap.sh" "$proj" >/dev/null 2>&1
[ "$(cat "$proj/PRODUCT.md")" = "custom" ] && ok "re-run never overwrites existing files" || bad "PRODUCT.md overwritten"

echo "3b. Worktree setup (T3 Code threads)"
git_q -C "$proj" add -A && git_q -C "$proj" commit -m kit
git_q -C "$proj" worktree add -b t-001-demo "$work/wt"
expect "links shared factory state into a new worktree" 0 bash -c "cd '$work/wt' && bash scripts/gb-worktree-setup.sh"
[ -f "$work/wt/.factory/ledger.md" ] && ok "worktree sees the shared ledger" || bad "ledger not visible in worktree"
[ -z "$(git -C "$work/wt" status --porcelain)" ] && ok "the link never shows up as a change" || bad "worktree status not clean: $(git -C "$work/wt" status --porcelain)"
expect "running it twice is harmless" 0 bash -c "cd '$work/wt' && bash scripts/gb-worktree-setup.sh"
expect "does nothing in the main folder" 0 bash -c "cd '$proj' && bash scripts/gb-worktree-setup.sh"
git_q -C "$proj" worktree remove --force "$work/wt"; git_q -C "$proj" branch -D t-001-demo

echo "3c. Team setup (TEAM.md)"
team="$proj/scripts/gb-team.mjs"
expect "unconfigured TEAM.md passes the CI check" 0 bash -c "cd '$proj' && node scripts/gb-team.mjs --check"
expect "but fails it in --strict mode"          1 bash -c "cd '$proj' && node scripts/gb-team.mjs --check --strict"
cp "$proj/TEAM.md" "$work/TEAM.orig.md"
printf '1\n' > "$work/answers"; for i in $(seq 1 30); do echo >> "$work/answers"; done
expect "setup with the split preset (all defaults)" 0 bash -c "cd '$proj' && node scripts/gb-team.mjs --setup < '$work/answers'"
grep -q "^status: configured" "$proj/TEAM.md" && ok "TEAM.md marked configured" || bad "status not configured"
grep -q "Lane rules" "$proj/TEAM.md" && ok "setup keeps the lane rules text" || bad "body lost"
expect "configured team passes --check --strict" 0 bash -c "cd '$proj' && node scripts/gb-team.mjs --check --strict"
(cd "$proj" && node scripts/gb-team.mjs --check) | grep -q 'shares the "claude" allowance' && ok "warns that orchestrator and backend share the Claude allowance" || bad "no shared-allowance warning"
(cd "$proj" && node scripts/gb-team.mjs) | grep -q "heavy     built by heavy (opencode" && ok "routing table shows heavy work on OpenCode" || bad "routing table wrong"
sed -i 's/^    reviewer: checker$/    reviewer: backend/' "$proj/TEAM.md"
expect "rejects a lane reviewed by its own builder's model" 1 bash -c "cd '$proj' && node scripts/gb-team.mjs --check"
expect "setup with the claude-only preset" 0 bash -c "cd '$proj' && node scripts/gb-team.mjs --setup --preset claude-only < /dev/null"
expect "claude-only team is valid" 0 bash -c "cd '$proj' && node scripts/gb-team.mjs --check --strict"
cp "$work/TEAM.orig.md" "$proj/TEAM.md"

echo "4. Pre-push guard"
remote="$work/remote.git"; git init -q --bare "$remote"
cd "$proj" && git_q add -A && { git_q commit -m init || true; } && git_q remote add origin "$remote"
git -c core.hooksPath=/dev/null push -q origin main >/dev/null 2>&1   # seed remote main, bypassing the hook
git_q checkout -b feature && echo a > a.txt && git_q add a.txt && git_q commit -m a
expect "allows pushing a feature branch" 0 git push -q origin feature
echo b > b.txt && git_q add b.txt && git_q commit -m b
expect "blocks pushing to main"          1 git push -q origin feature:main
git_q reset --hard HEAD~2 && echo c > c.txt && git_q add c.txt && git_q commit -m c
expect "blocks force push"               1 git push -q --force origin feature
expect "allows pushing factory-state"    0 git -C "$proj/.factory" push -q origin factory-state
git_q checkout -b leak && printf 'KEY=AKIAABCDEFGHIJKLMNOP\n' > leak.txt && git_q add leak.txt && git_q commit -m leak
expect "blocks a pushed secret key"      1 git push -q origin leak
cd "$repo"

echo "5. slop-lint"
lint="$proj/scripts/slop-lint.mjs"
mkdir -p "$proj/src" && cp "$repo/tests/fixtures/bad.tsx" "$proj/src/" && cp "$repo/tests/fixtures/good.tsx" "$proj/src/"
cp -r "$repo/tests/fixtures/app" "$proj/src/"
(cd "$proj" && node scripts/slop-lint.mjs src --json) > "$work/lint.json" 2>/dev/null
node -e '
const r = JSON.parse(require("fs").readFileSync(process.argv[1]));
const hit = (file, rule) => r.findings.some(f => f.file.endsWith(file) && f.rule === rule);
const must = ["zoom-disabled","focus-removed","img-no-alt","gradient-text","ai-gradient","eyebrow-label","numbered-sections","arrow-cta","middot-meta","transition-all","emoji-icon","buzzword-copy","off-token-colour"];
const missing = must.filter(m => !hit("bad.tsx", m));
const falsePos = r.findings.filter(f => f.file.endsWith("good.tsx") || f.file.endsWith("about/page.tsx"));
if (!hit("app/layout.tsx", "zoom-disabled")) { console.log("missed userScalable:false in app/layout.tsx"); process.exit(3); }
if (!hit("app/layout.tsx", "img-no-alt")) { console.log("missed multi-line img in app/layout.tsx"); process.exit(4); }
if (missing.length) { console.log("missed: " + missing.join(", ")); process.exit(1); }
if (falsePos.length) { console.log("false positives on good.tsx: " + falsePos.map(f=>f.rule).join(", ")); process.exit(2); }
' "$work/lint.json" && ok "catches all 13 bad patterns + app/layout.tsx cases, zero false positives on clean code" || bad "slop-lint detection"
expect "exits 1 when errors present"  1 bash -c "cd '$proj' && node scripts/slop-lint.mjs src"
expect "--warn-only exits 0"          0 bash -c "cd '$proj' && node scripts/slop-lint.mjs src --warn-only"
expect "clean file passes"            0 bash -c "cd '$proj' && node scripts/slop-lint.mjs src/good.tsx"
sed -i 's/user-scalable=no" \/>/user-scalable=no" \/> {\/* slop-ok: test *\/}/' "$proj/src/bad.tsx"
(cd "$proj" && node scripts/slop-lint.mjs src --json) | grep -q '"zoom-disabled"' && bad "slop-ok ignore not honoured" || ok "slop-ok comment ignores a line"

echo "6. Installer"
fakehome="$work/home"; mkdir -p "$fakehome/.agents/skills/my-own-skill"
printf -- '---\nname: my-own-skill\ndescription: Use when testing.\n---\n' > "$fakehome/.agents/skills/my-own-skill/SKILL.md"
expect "installs to ~/.agents/skills" 0 env HOME="$fakehome" bash "$repo/install.sh"
n=$(find "$fakehome/.agents/skills" -mindepth 2 -maxdepth 2 -name SKILL.md | wc -l)
want=$(( $(ls -d "$repo"/skills/*/ | wc -l) + 1 ))
[ "$n" -eq "$want" ] && ok "all $((want-1)) skills installed alongside the user's own skill" || bad "found $n SKILL.md files, wanted $want"
expect "re-install (update) works"    0 env HOME="$fakehome" bash "$repo/install.sh"
mkdir -p "$fakehome/.claude/skills/tdd-slice" && echo mine > "$fakehome/.claude/skills/tdd-slice/SKILL.md"
env HOME="$fakehome" bash "$repo/install.sh" --claude > "$work/inst" 2>&1
grep -q "isn't from Garageband" "$work/inst" && [ "$(cat "$fakehome/.claude/skills/tdd-slice/SKILL.md")" = mine ] \
  && ok "never overwrites a same-named skill it didn't install" || bad "clobbered a foreign skill"
expect "uninstall works" 0 env HOME="$fakehome" bash "$repo/install.sh" --uninstall
[ -d "$fakehome/.agents/skills/my-own-skill" ] && [ ! -d "$fakehome/.agents/skills/tdd-slice" ] \
  && ok "uninstall removes only Garageband skills" || bad "uninstall removed the wrong things"
expect "--project installs and bootstraps" 0 env HOME="$fakehome" bash "$repo/install.sh" --project "$work/proj2"
[ -f "$work/proj2/.agents/skills/garageband/SKILL.md" ] && [ -f "$work/proj2/AGENTS.md" ] && ok "project has skills and kit" || bad "project install incomplete"

echo "7. with-server helper"
cat > "$work/server.mjs" <<'EOF'
import http from "node:http";
http.createServer((q, s) => { s.end("ok"); }).listen(45678);
EOF
expect "starts server, runs command, stops server" 0 node "$repo/skills/browser-qa/scripts/with-server.mjs" \
  --cmd "node $work/server.mjs" --url http://127.0.0.1:45678 --timeout 20 -- node -e "fetch('http://127.0.0.1:45678').then(r=>r.text()).then(t=>process.exit(t==='ok'?0:1))"
sleep 1
node -e "fetch('http://127.0.0.1:45678').then(()=>process.exit(1)).catch(()=>process.exit(0))" && ok "server stopped afterwards" || bad "server still running"
expect "passes through a failing command's exit code" 3 node "$repo/skills/browser-qa/scripts/with-server.mjs" \
  --cmd "node $work/server.mjs" --url http://127.0.0.1:45678 --timeout 20 -- node -e "process.exit(3)"

echo "8. Sprint tools (ledger, status, team)"
fac="$work/factory"
expect "seeds the sprint ledger" 0 node "$repo/sprint/scripts/gb-seed.mjs" "$fac"
[ "$(ls "$fac/tickets" | wc -l)" -ge 50 ] && ok "ticket files written" || bad "ticket files missing"
expect "status runs" 0 node "$repo/sprint/scripts/gb-sprint.mjs" status --factory "$fac"
expect "status --json is valid JSON" 0 bash -c "node '$repo/sprint/scripts/gb-sprint.mjs' status --json --factory '$fac' | node -e 'JSON.parse(require(\"fs\").readFileSync(0,\"utf8\"))'"
node "$repo/sprint/scripts/gb-sprint.mjs" next --factory "$fac" --limit 50 | grep -q '^A0-05' && bad "next lists a ticket whose dependencies aren't done" || ok "next skips tickets with unfinished dependencies"
expect "set updates a row" 0 node "$repo/sprint/scripts/gb-sprint.mjs" set A0-01 status=done finished=now --factory "$fac"
node "$repo/sprint/scripts/gb-sprint.mjs" show A0-01 --factory "$fac" | grep -q "Status: done" && ok "row reads back" || bad "row did not update"
expect "set rejects an unknown status" 1 node "$repo/sprint/scripts/gb-sprint.mjs" set A0-01 status=finished --factory "$fac"
expect "add creates a ticket" 0 node "$repo/sprint/scripts/gb-sprint.mjs" add A1-02a phase=A1 lane=heavy size=S after=A1-01 title="Split piece | with pipe" --factory "$fac"
node "$repo/sprint/scripts/gb-sprint.mjs" show A1-02a --factory "$fac" | grep -q "Title: Split piece | with pipe" && ok "pipes in titles survive the table" || bad "pipe in title broke the table"
expect "add rejects unknown dependency" 1 node "$repo/sprint/scripts/gb-sprint.mjs" add A9-01 phase=A9 lane=heavy size=S after=Z9-99 title=x --factory "$fac"
expect "sprint TEAM.md passes the team check" 0 node "$repo/skills/project-bootstrap/assets/project/scripts/gb-team.mjs" --check --strict --file "$repo/sprint/TEAM.md"
expect "trello mirror skips cleanly without a key" 0 env -u TRELLO_KEY GB_FACTORY="$fac" node "$repo/sprint/scripts/gb-trello.mjs" sync

echo "9. Factory box push guard"
gw="$work/gw"; mkdir -p "$gw/bin" "$gw/hooks"
sed "s#/opt/factory/githooks#$gw/hooks#g" "$repo/box/scripts/git" > "$gw/bin/git"
sed "s#/opt/factory/githooks#$gw/hooks#g" "$repo/box/githooks/pre-push" > "$gw/hooks/pre-push"
chmod +x "$gw/bin/git" "$gw/hooks/pre-push"
git_q init --bare "$gw/r.git"; git_q init "$gw/w"; (cd "$gw/w" && git_q commit --allow-empty -m x && git remote add origin "$gw/r.git")
gpush() { (cd "$gw/w" && PATH="$gw/bin:$PATH" git push -q "$@" >/dev/null 2>&1); }
gpush origin HEAD:main && bad "push to main allowed" || ok "push to main blocked"
gpush --no-verify origin HEAD:main && bad "--no-verify allowed" || ok "--no-verify refused"
gpush origin HEAD:refs/heads/t/a0-01-x && ok "ticket branch push works" || bad "ticket branch push blocked"
gpush origin HEAD:sprint/track-a && ok "sprint branch push works" || bad "sprint branch push blocked"
(cd "$gw/w" && git_q commit --amend --allow-empty -m y)
gpush -f origin HEAD:sprint/track-a && bad "force push to sprint branch allowed" || ok "force push to sprint branch blocked"
gpush -f origin HEAD:t/a0-01-x && ok "force push to own ticket branch works" || bad "force push to ticket branch blocked"
gpush origin :sprint/track-a && bad "deleting sprint branch allowed" || ok "deleting sprint branch blocked"

echo
echo "Passed: $pass   Failed: $fail"
[ "$fail" -eq 0 ]
