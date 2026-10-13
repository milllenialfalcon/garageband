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

echo "2. Claude Code guard hook"
g="$repo/hooks/guard.sh"
hook() { printf '{"tool_name":"Bash","tool_input":{"command":"%s"}}' "$1" | bash "$g"; }
expect "allows git status"               0 hook "git status"
expect "allows push to a feature branch" 0 hook "git push origin t-014-photos"
expect "allows rm of a build folder"     0 hook "rm -rf ./dist"
expect "blocks force push"               2 hook "git push --force origin t-014"
expect "blocks push to main"             2 hook "git push origin main"
expect "blocks reset --hard"             2 hook "git reset --hard HEAD~3"
expect "blocks rm -rf of home"           2 hook "rm -rf ~"
expect "blocks drop table"               2 hook "psql -c 'DROP TABLE users'"
expect "blocks agent merging a PR"       2 hook "gh pr merge 12 --squash"

echo "3. Project bootstrap"
proj="$work/proj"
expect "bootstrap into new folder" 0 bash "$repo/skills/project-bootstrap/scripts/bootstrap.sh" "$proj"
for f in AGENTS.md CLAUDE.md PRODUCT.md DESIGN.md .factory/ledger.md .github/workflows/garageband-ci.yml .githooks/pre-push scripts/slop-lint.mjs docs/specs/_TEMPLATE.md; do
  [ -e "$proj/$f" ] && ok "has $f" || bad "missing $f"
done
[ "$(git -C "$proj" config core.hooksPath)" = ".githooks" ] && ok "git hooks switched on" || bad "hooksPath not set"
echo "custom" > "$proj/PRODUCT.md"
bash "$repo/skills/project-bootstrap/scripts/bootstrap.sh" "$proj" >/dev/null 2>&1
[ "$(cat "$proj/PRODUCT.md")" = "custom" ] && ok "re-run never overwrites existing files" || bad "PRODUCT.md overwritten"

echo "4. Pre-push guard"
remote="$work/remote.git"; git init -q --bare "$remote"
cd "$proj" && git_q add -A && git_q commit -m init && git_q remote add origin "$remote"
git -c core.hooksPath=/dev/null push -q origin main >/dev/null 2>&1   # seed remote main, bypassing the hook
git_q checkout -b feature && echo a > a.txt && git_q add a.txt && git_q commit -m a
expect "allows pushing a feature branch" 0 git push -q origin feature
echo b > b.txt && git_q add b.txt && git_q commit -m b
expect "blocks pushing to main"          1 git push -q origin feature:main
git_q reset --hard HEAD~2 && echo c > c.txt && git_q add c.txt && git_q commit -m c
expect "blocks force push"               1 git push -q --force origin feature
git_q checkout -b leak && printf 'KEY=AKIAABCDEFGHIJKLMNOP\n' > leak.txt && git_q add leak.txt && git_q commit -m leak
expect "blocks a pushed secret key"      1 git push -q origin leak
cd "$repo"

echo "5. slop-lint"
lint="$proj/scripts/slop-lint.mjs"
mkdir -p "$proj/src" && cp "$repo/tests/fixtures/bad.tsx" "$proj/src/" && cp "$repo/tests/fixtures/good.tsx" "$proj/src/"
(cd "$proj" && node scripts/slop-lint.mjs src --json) > "$work/lint.json" 2>/dev/null
node -e '
const r = JSON.parse(require("fs").readFileSync(process.argv[1]));
const hit = (file, rule) => r.findings.some(f => f.file.endsWith(file) && f.rule === rule);
const must = ["zoom-disabled","focus-removed","img-no-alt","gradient-text","ai-gradient","eyebrow-label","numbered-sections","arrow-cta","middot-meta","transition-all","emoji-icon","buzzword-copy","off-token-colour"];
const missing = must.filter(m => !hit("bad.tsx", m));
const falsePos = r.findings.filter(f => f.file.endsWith("good.tsx"));
if (missing.length) { console.log("missed: " + missing.join(", ")); process.exit(1); }
if (falsePos.length) { console.log("false positives on good.tsx: " + falsePos.map(f=>f.rule).join(", ")); process.exit(2); }
' "$work/lint.json" && ok "catches all 13 bad patterns, zero false positives on clean code" || bad "slop-lint detection"
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
[ "$n" -eq 37 ] && ok "36 skills installed alongside the user's own skill" || bad "found $n SKILL.md files, wanted 37"
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

echo
echo "Passed: $pass   Failed: $fail"
[ "$fail" -eq 0 ]
