#!/usr/bin/env node
// Garageband team tool: set up, check and show which AI tool and model does which job (TEAM.md).
//
//   node scripts/gb-team.mjs              show the routing table
//   node scripts/gb-team.mjs --check      check TEAM.md (exit 1 on errors; unconfigured is OK unless --strict)
//   node scripts/gb-team.mjs --setup      answer a few questions and write TEAM.md
//   node scripts/gb-team.mjs --setup --preset split|claude-only   start from a preset
// Options: --file <path> (default TEAM.md), --strict, --json
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
const file = path.resolve(opt("--file", "TEAM.md"));

const ROLES = ["orchestrator", "frontend", "backend", "heavy", "checker", "researcher"];
const LANES = ["frontend", "backend", "heavy", "risky"];
const TOOLS = ["claude", "codex", "opencode", "hermes", "cursor", "grok", "gemini", "other"];
const ROLE_HELP = {
  orchestrator: "thinks: validate, spec, architecture, tickets, briefs, final calls",
  frontend: "builds user interface tickets",
  backend: "builds server, data and integration tickets",
  heavy: "large, low-ambiguity work: scaffolding, test backfills, refactors, bulk fixes",
  checker: "reader tests, research checks, routine reviews, triage",
  researcher: "broad research; output untrusted until verified",
};
const LANE_HELP = {
  frontend: "user interface", backend: "server logic", heavy: "big but clear work",
  risky: "auth, payments, permissions, database structure, security",
};

const PRESETS = {
  split: {
    label: "Split team: Claude Opus orchestrates, Codex frontend, Claude backend, DeepSeek (OpenCode) heavy work",
    roles: {
      orchestrator: { tool: "claude", model: "claude-opus-5-5", pool: "claude" },
      frontend: { tool: "codex", model: "", pool: "codex" },
      backend: { tool: "claude", model: "claude-sonnet-5-5", pool: "claude" },
      heavy: { tool: "opencode", model: "", pool: "opencode" },
      checker: { tool: "codex", model: "", pool: "codex" },
      researcher: { tool: "opencode", model: "", pool: "free" },
    },
    lanes: {
      frontend: { author: "frontend", reviewer: "backend" },
      backend: { author: "backend", reviewer: "checker" },
      heavy: { author: "heavy", reviewer: "checker" },
      risky: { author: "orchestrator", reviewer: "frontend" },
    },
  },
  "claude-only": {
    label: "Claude only: Opus orchestrates and handles risky work, Sonnet builds, Haiku checks",
    roles: {
      orchestrator: { tool: "claude", model: "claude-opus-5-5", pool: "claude" },
      frontend: { tool: "claude", model: "claude-sonnet-5-5", pool: "claude" },
      backend: { tool: "claude", model: "claude-sonnet-5-5", pool: "claude" },
      heavy: { tool: "claude", model: "claude-haiku-5-5", pool: "claude" },
      checker: { tool: "claude", model: "claude-haiku-5-5", pool: "claude" },
      researcher: { tool: "claude", model: "claude-haiku-5-5", pool: "claude" },
    },
    lanes: {
      frontend: { author: "frontend", reviewer: "orchestrator" },
      backend: { author: "backend", reviewer: "checker" },
      heavy: { author: "heavy", reviewer: "backend" },
      risky: { author: "orchestrator", reviewer: "backend" },
    },
  },
};

// ---------- tiny YAML subset (maps nested by 2-space indents, scalar values) ----------
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  for (const raw of m[1].split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, "").replace(/^#.*$/, "");
    if (!line.trim()) continue;
    const indent = line.match(/^ */)[0].length;
    const kv = line.trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    while (stack.length && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    const [, key, val] = kv;
    if (val === "") { parent[key] = {}; stack.push({ indent, obj: parent[key] }); }
    else parent[key] = val.replace(/^["']|["']$/g, "");
  }
  return { data: root, body: text.slice(m[0].length) };
}

function writeFrontmatter(team) {
  const q = (v) => (v === "" || /[:#\s]/.test(v) ? JSON.stringify(v) : v);
  const lines = ["---",
    "# Garageband team: which AI tool and model does which job. Machine-readable.",
    "# Change it with the team-setup skill or: node scripts/gb-team.mjs --setup",
    "version: 1", `status: ${team.status}`, "roles:"];
  for (const r of ROLES) {
    const x = team.roles[r];
    lines.push(`  ${r}:   # ${ROLE_HELP[r]}`, `    tool: ${q(x.tool)}`, `    model: ${q(x.model)}`, `    pool: ${q(x.pool)}`);
  }
  lines.push("lanes:");
  for (const l of LANES) {
    const x = team.lanes[l];
    lines.push(`  ${l}:   # ${LANE_HELP[l]}`, `    author: ${x.author}`, `    reviewer: ${x.reviewer}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

// ---------- checks ----------
function check(team) {
  const errors = [], warnings = [];
  if (!team.roles) errors.push("missing roles");
  if (!team.lanes) errors.push("missing lanes");
  if (errors.length) return { errors, warnings };
  for (const r of ROLES) {
    const x = team.roles[r];
    if (!x) { errors.push(`role "${r}" is missing`); continue; }
    if (!TOOLS.includes(x.tool)) errors.push(`role "${r}": tool "${x.tool}" isn't one of ${TOOLS.join(", ")}`);
    if (!x.model && team.status === "configured") warnings.push(`role "${r}": no model named; the tool's default will be used`);
    if (!x.pool) warnings.push(`role "${r}": no pool (allowance) named`);
  }
  const id = (r) => team.roles[r] ? `${team.roles[r].tool}:${team.roles[r].model || "default"}` : null;
  for (const l of LANES) {
    const x = team.lanes[l];
    if (!x) { errors.push(`lane "${l}" is missing`); continue; }
    for (const k of ["author", "reviewer"]) {
      if (!ROLES.includes(x[k])) errors.push(`lane "${l}": ${k} "${x[k]}" isn't a role (${ROLES.join(", ")})`);
    }
    if (ROLES.includes(x.author) && ROLES.includes(x.reviewer) && id(x.author) === id(x.reviewer)) {
      errors.push(`lane "${l}": author and reviewer are the same model (${id(x.author)}). Reviews must come from a different model.`);
    }
  }
  if (team.lanes?.risky && team.lanes.risky.author !== "orchestrator" && team.lanes.risky.author !== "backend") {
    warnings.push(`lane "risky" is built by "${team.lanes.risky.author}". Usually the orchestrator or the strongest backend model should build risky work.`);
  }
  if (team.lanes?.risky && team.roles?.[team.lanes.risky.reviewer] && team.lanes.risky.reviewer === "researcher") {
    errors.push(`lane "risky" can't be reviewed by the researcher role (untrusted).`);
  }
  // shared allowances
  const pools = {};
  for (const r of ROLES) if (team.roles[r]?.pool) (pools[team.roles[r].pool] ??= []).push(r);
  for (const [p, rs] of Object.entries(pools)) {
    if (rs.length > 1 && rs.includes("orchestrator") && p !== "free") {
      warnings.push(`orchestrator shares the "${p}" allowance with ${rs.filter((r) => r !== "orchestrator").join(", ")}. ` +
        `Building work there uses the orchestrator's thinking budget; model-router moves it to the heavy lane when "${p}" runs low.`);
    }
  }
  return { errors, warnings, pools };
}

// ---------- show ----------
function show(team) {
  const name = (r) => { const x = team.roles[r]; return `${x.tool} · ${x.model || "default model"}`; };
  const out = [];
  out.push(`Garageband team (${team.status})`, "");
  out.push("Roles");
  for (const r of ROLES) out.push(`  ${r.padEnd(13)} ${name(r).padEnd(34)} allowance: ${team.roles[r].pool}`);
  out.push("", "Who builds and who reviews");
  for (const l of LANES) {
    const x = team.lanes[l];
    out.push(`  ${l.padEnd(9)} built by ${x.author} (${name(x.author)}), reviewed by ${x.reviewer} (${name(x.reviewer)})`);
  }
  out.push("", "Opening a thread for a ticket (e.g. in T3 Code)");
  for (const l of LANES) {
    const a = team.roles[team.lanes[l].author];
    out.push(`  ${l.padEnd(9)} → provider ${a.tool}, model ${a.model || "its default"}, in a new worktree`);
  }
  return out.join("\n");
}

// ---------- setup wizard ----------
async function setup() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  const it = rl[Symbol.asyncIterator]();
  const ask = async (q, def) => {
    process.stdout.write(`${q}${def !== undefined && def !== "" ? ` [${def}]` : ""}: `);
    const { value, done } = await it.next();
    const a = done ? "" : String(value).trim();
    if (done || !process.stdin.isTTY) process.stdout.write(a + "\n");
    return a || def || "";
  };

  let existing = null;
  if (fs.existsSync(file)) existing = parseFrontmatter(fs.readFileSync(file, "utf8"));
  console.log("Garageband team setup. Press Enter to accept the value in [brackets].\n");
  let preset = opt("--preset");
  if (!preset) {
    console.log("Starting point:");
    console.log(`  1) split        ${PRESETS.split.label}`);
    console.log(`  2) claude-only  ${PRESETS["claude-only"].label}`);
    console.log("  3) current      keep what TEAM.md has now and edit it");
    const c = await ask("Choose 1, 2 or 3", "1");
    preset = { "1": "split", "2": "claude-only", "3": "current" }[c] ?? c;
  }
  let team;
  if (preset === "current" && existing?.data?.roles) team = structuredClone(existing.data);
  else if (PRESETS[preset]) team = structuredClone({ roles: PRESETS[preset].roles, lanes: PRESETS[preset].lanes });
  else { console.error(`Unknown preset "${preset}". Use split, claude-only or current.`); process.exit(1); }

  console.log(`\nTools: ${TOOLS.join(", ")}. "pool" = which subscription allowance it uses (roles on the same plan share one).`);
  for (const r of ROLES) {
    console.log(`\n${r}: ${ROLE_HELP[r]}`);
    const x = team.roles[r];
    for (;;) {
      x.tool = await ask("  tool", x.tool);
      if (TOOLS.includes(x.tool)) break;
      console.log(`  Please choose one of: ${TOOLS.join(", ")}`);
    }
    x.model = await ask("  model (exact name as the tool shows it; Enter = tool default)", x.model);
    x.pool = await ask("  allowance / pool", x.pool || x.tool);
  }
  console.log("\nReviews: each lane's work is reviewed by a different model.");
  for (const l of LANES) {
    const x = team.lanes[l];
    for (;;) {
      x.author = await ask(`  ${l} lane (${LANE_HELP[l]}) built by`, x.author);
      x.reviewer = await ask(`  ${l} lane reviewed by`, x.reviewer);
      const r = check({ ...team, status: "configured" });
      const laneErr = r.errors.filter((e) => e.startsWith(`lane "${l}"`));
      if (!laneErr.length) break;
      laneErr.forEach((e) => console.log("  ! " + e));
    }
  }
  team.status = "configured";
  const result = check(team);
  if (result.errors.length) {
    result.errors.forEach((e) => console.log("ERROR " + e));
    console.log("TEAM.md not written. Fix the answers and run setup again.");
    rl.close(); process.exit(1);
  }
  const body = existing?.body ?? "\n# TEAM.md\n\nSee the team-setup skill for what each role and lane means.\n";
  fs.writeFileSync(file, writeFrontmatter(team) + body.replace(/^\n*/, "\n"));
  rl.close();
  console.log(`\nWrote ${path.relative(process.cwd(), file) || file}\n`);
  console.log(show(team));
  result.warnings.forEach((w) => console.log("\nnote: " + w));
}

// ---------- main ----------
async function main() {
  if (has("--help") || has("-h")) { console.log(fs.readFileSync(new URL(import.meta.url)).toString().split("\n").slice(1, 9).map((l) => l.replace(/^\/\/ ?/, "")).join("\n")); return; }
  if (has("--setup")) return setup();
  if (!fs.existsSync(file)) {
    console.log("No TEAM.md yet. Run: node scripts/gb-team.mjs --setup (or ask an agent to use the team-setup skill).");
    process.exit(has("--strict") ? 1 : 0);
  }
  const parsed = parseFrontmatter(fs.readFileSync(file, "utf8"));
  if (!parsed) { console.error("TEAM.md has no frontmatter block (--- … ---)."); process.exit(1); }
  const team = parsed.data;
  const r = check(team);
  if (has("--json")) { console.log(JSON.stringify({ team, ...r }, null, 2)); process.exit(r.errors.length ? 1 : 0); }
  if (has("--check")) {
    if (team.status !== "configured") {
      console.log("TEAM.md is not configured yet. Run: node scripts/gb-team.mjs --setup (or the team-setup skill).");
      process.exit(has("--strict") ? 1 : (r.errors.length ? 1 : 0));
    }
    r.warnings.forEach((w) => console.log("warn  " + w));
    r.errors.forEach((e) => console.log("ERROR " + e));
    console.log(`\nTEAM.md: ${r.errors.length} errors, ${r.warnings.length} warnings`);
    process.exit(r.errors.length ? 1 : 0);
  }
  console.log(show(team));
  r.warnings.forEach((w) => console.log("\nnote: " + w));
  r.errors.forEach((e) => console.log("\nERROR " + e));
  process.exit(r.errors.length ? 1 : 0);
}
main();
