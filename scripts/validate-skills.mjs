#!/usr/bin/env node
// Validates every skills/<name>/SKILL.md against the rules shared by Claude Code, Codex and OpenCode,
// and checks that every skill mentioned in the router and README exists.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const skillsDir = path.join(root, "skills");
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const RESERVED = /(^|-)(claude|anthropic)(-|$)/;
const errors = [];
const warns = [];

const names = fs.readdirSync(skillsDir).filter((d) => fs.statSync(path.join(skillsDir, d)).isDirectory()).sort();

for (const dir of names) {
  const file = path.join(skillsDir, dir, "SKILL.md");
  if (!fs.existsSync(file)) { errors.push(`${dir}: missing SKILL.md`); continue; }
  const text = fs.readFileSync(file, "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) { errors.push(`${dir}: no YAML frontmatter`); continue; }
  const get = (k) => (fm[1].match(new RegExp(`^${k}:\\s*(.+)$`, "m")) ?? [])[1]?.trim();
  const name = get("name");
  const rawDesc = get("description");
  // Strict YAML parsers reject unquoted values containing ": " or " #". Require quotes when needed.
  if (rawDesc && !/^".*"$/.test(rawDesc) && /: | #/.test(rawDesc)) {
    errors.push(`${dir}: description contains ": " or " #" and must be wrapped in double quotes for strict YAML parsers`);
  }
  const desc = rawDesc && /^".*"$/.test(rawDesc) ? JSON.parse(rawDesc) : rawDesc;
  if (!name) errors.push(`${dir}: missing name`);
  else {
    if (name !== dir) errors.push(`${dir}: name "${name}" does not match folder`);
    if (!NAME_RE.test(name) || name.length > 64) errors.push(`${dir}: name breaks naming rules`);
    if (RESERVED.test(name)) errors.push(`${dir}: name uses a reserved word`);
  }
  if (!desc) errors.push(`${dir}: missing description`);
  else {
    if (desc.length > 1024) errors.push(`${dir}: description ${desc.length} chars (max 1024)`);
    if (!/^Use (when|at|after|before|for|to|once|whenever|monthly|two)/.test(desc)) warns.push(`${dir}: description should start with "Use when…"`);
    if (/[<>]/.test(desc)) errors.push(`${dir}: description contains angle brackets`);
  }
  const body = text.slice(fm[0].length);
  const lines = body.split("\n").length;
  if (lines > 220) warns.push(`${dir}: SKILL.md body is ${lines} lines; consider moving detail to references/`);
  // referenced scripts exist
  for (const m of body.matchAll(/`(?:node|bash) <[^>]+>\/scripts\/([\w.-]+)/g)) {
    if (!fs.existsSync(path.join(skillsDir, dir, "scripts", m[1]))) errors.push(`${dir}: references missing script ${m[1]}`);
  }
}

// every backticked or bold skill-like name in router + README must exist
const set = new Set(names);
for (const f of [path.join(skillsDir, "garageband", "SKILL.md"), path.join(root, "README.md")]) {
  const t = fs.readFileSync(f, "utf8");
  const table = t.split("\n").filter((l) => l.startsWith("|"));
  for (const l of table) {
    for (const m of l.matchAll(/`?\b([a-z]+(?:-[a-z]+)+)\b`?/g)) {
      const cand = m[1];
      if (/^(spike|two-way|one-way|non-engineer|sideways-sweep|off-token|fill-ins|money-pits|quick-wins|big-bets|go-no-go|first-run)$/.test(cand)) continue;
      if (/(design|skill|plan|review|check|test|gate|brief|log|router|ledger|founder|research|slice|debug|migration|qa|pass|compliance|ship|outcome|triage|watch|sweep|priority|instincts|lab|rules|critique|variants|ui|idea|spec|bootstrap|summary|system)$/.test(cand)
          && !set.has(cand) && /^[a-z]+-[a-z-]+$/.test(cand) && l.includes("`" + cand + "`")) {
        errors.push(`${path.basename(f)}: mentions unknown skill \`${cand}\``);
      }
    }
  }
}
// every skill is mentioned in the router (so nothing is orphaned)
const router = fs.readFileSync(path.join(skillsDir, "garageband", "SKILL.md"), "utf8");
for (const n of names) if (n !== "garageband" && !router.includes(n)) errors.push(`router does not route to ${n}`);

for (const w of warns) console.log("warn  " + w);
for (const e of errors) console.log("ERROR " + e);
console.log(`\n${names.length} skills checked, ${errors.length} errors, ${warns.length} warnings`);
process.exit(errors.length ? 1 : 0);
