#!/usr/bin/env node
// Mechanical PR gate: the cheap checks a script can do, run before any model reviews a PR.
// Prints PASS, or FAIL with a numbered list, and exits 0/1. No model needed.
//
//   node sprint/scripts/gb-gate.mjs <pr-number> --ticket <id> [--repo owner/name] [--factory dir]
//   node sprint/scripts/gb-gate.mjs --pr-json <file> --ticket-file <file>     (offline, for tests)
//
// Checks:
//  1. CI checks ran and all passed
//  2. Every changed file is inside the ticket's "Touch only" paths
//  3. No protected file changed (sprint machinery, guards, CI, ledger) unless the ticket lists it
//  4. Code changed → a test file changed too (docs-only and chief tickets exempt)
//  5. PR body has a plain-English summary and a STATUS block with evidence
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { findFactory } from "./ledger.mjs";

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i < 0 ? undefined : args[i + 1]; };
const pr = args[0] && !args[0].startsWith("--") ? args[0] : undefined;

const PROTECTED = [
  "sprint/scripts/", "sprint/ORCHESTRATOR.md", "sprint/RELIEF.md", "sprint/CONCIERGE.md", "sprint/SPRINT.md", "sprint/TEAM.md",
  "hooks/", "box/githooks/", "box/scripts/git", ".github/workflows/", ".githooks/", "AGENTS.md", ".factory/",
];
const TEST_RE = /(^|\/)(tests?|__tests__|spec)\/|\.(test|spec)\.[cm]?[jt]sx?$|_test\.(go|py)$|test_[^/]*\.py$|run-tests\.sh$/;
const DOC_RE = /\.(md|txt|svg|png|jpe?g|gif)$|^docs\//;

function load() {
  if (opt("--pr-json")) return { data: JSON.parse(readFileSync(opt("--pr-json"), "utf8")), ticketText: readFileSync(opt("--ticket-file"), "utf8") };
  const ticket = opt("--ticket");
  if (!pr || !ticket) { console.error("usage: gb-gate.mjs <pr> --ticket <id> [--repo owner/name]"); process.exit(2); }
  const repo = opt("--repo") ? ["--repo", opt("--repo")] : [];
  const data = JSON.parse(execFileSync("gh", ["pr", "view", pr, ...repo, "--json", "files,body,headRefOid,statusCheckRollup,baseRefName"], { encoding: "utf8" }));
  const ticketText = readFileSync(join(findFactory(opt("--factory")), "tickets", `${ticket}.md`), "utf8");
  return { data, ticketText };
}

export function gate(data, ticketText) {
  const fails = [];
  const touchLine = (ticketText.match(/^- Touch only: (.*)$/m) || [])[1] || "";
  const allowed = [...touchLine.matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((p) => !/^(new repo|fork source)$/.test(p));
  const anywhere = /`(new repo|fork source)`/.test(touchLine);
  const lane = (ticketText.match(/Lane: (\w+)/) || [])[1] || "";
  const files = (data.files || []).map((f) => f.path);

  // 1. CI
  const checks = data.statusCheckRollup || [];
  if (!checks.length) fails.push("No CI checks ran on this PR.");
  for (const c of checks) {
    const state = (c.conclusion || c.state || c.status || "").toUpperCase();
    if (!["SUCCESS", "NEUTRAL", "SKIPPED"].includes(state)) fails.push(`CI check "${c.name || c.context}" is ${state || "pending"}.`);
  }
  // 2. scope
  const inside = (f, p) => {
    const re = new RegExp("^" + p.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "§").replace(/\*/g, "[^/]*").replace(/§/g, ".*") + (p.endsWith("/") ? "" : "($|/)"));
    return re.test(f);
  };
  if (!anywhere && allowed.length) {
    for (const f of files) if (!allowed.some((p) => inside(f, p))) fails.push(`Changed a file outside the ticket's paths: ${f}`);
  }
  // 3. protected
  for (const f of files) {
    if (PROTECTED.some((p) => inside(f, p)) && !allowed.some((p) => inside(f, p))) fails.push(`Changed a protected file the ticket doesn't list: ${f}`);
  }
  // 4. tests
  const code = files.filter((f) => !DOC_RE.test(f) && !TEST_RE.test(f));
  if (code.length && !files.some((f) => TEST_RE.test(f)) && lane !== "chief") fails.push("Code changed but no test file was added or changed.");
  // 5. body
  const body = data.body || "";
  if (body.replace(/\s+/g, " ").trim().length < 80) fails.push("PR body has no plain-English summary.");
  if (!/STATUS:\s*(DONE|DONE_WITH_CONCERNS)/.test(body)) fails.push("PR body has no STATUS: DONE (or DONE_WITH_CONCERNS) block.");
  if (!/EVIDENCE/i.test(body)) fails.push("PR body has no EVIDENCE section with fresh check output.");
  return fails;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { data, ticketText } = load();
  const fails = gate(data, ticketText);
  if (!fails.length) { console.log(`PASS${data.headRefOid ? ` (head ${data.headRefOid.slice(0, 12)})` : ""}`); process.exit(0); }
  console.log(`FAIL\n${fails.map((f, i) => `${i + 1}. ${f}`).join("\n")}`);
  process.exit(1);
}
