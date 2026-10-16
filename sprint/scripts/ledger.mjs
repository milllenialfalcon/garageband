// Shared helpers for the sprint ledger (.factory/ledger.md on the factory-state branch).
// The ledger is a Markdown table so people and models can read it; these helpers keep
// machine edits consistent. No dependencies.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

export const COLUMNS = ["Ticket", "Phase", "Title", "Lane", "Size", "After", "Status", "Builder", "Reviewer", "PR", "Attempts", "Started", "Finished"];
export const STATUSES = ["ready", "claimed", "in-review", "changes-requested", "blocked", "done", "dropped"];
export const ACTIVE = ["claimed", "in-review", "changes-requested"];
const TABLE_START = "<!-- ledger:start -->";
const TABLE_END = "<!-- ledger:end -->";

export function findFactory(explicit) {
  if (explicit) return resolve(explicit);
  if (process.env.GB_FACTORY) return resolve(process.env.GB_FACTORY);
  let top = process.cwd();
  try {
    const list = execFileSync("git", ["worktree", "list", "--porcelain"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const first = list.split("\n").find((l) => l.startsWith("worktree "));
    if (first) top = first.slice(9).trim();
  } catch { /* not a git repo: use cwd */ }
  return join(top, ".factory");
}

const esc = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const unesc = (v) => v.replace(/\\\|/g, "|").trim();

export function readLedger(factory) {
  const file = join(factory, "ledger.md");
  if (!existsSync(file)) throw new Error(`No ledger at ${file}. Is the factory-state worktree linked?`);
  const text = readFileSync(file, "utf8");
  const a = text.indexOf(TABLE_START), b = text.indexOf(TABLE_END);
  if (a < 0 || b < 0) throw new Error(`${file} has no ${TABLE_START} … ${TABLE_END} table`);
  const lines = text.slice(a + TABLE_START.length, b).split("\n").filter((l) => l.trim().startsWith("|"));
  const header = splitRow(lines[0]);
  const rows = lines.slice(2).map((l) => {
    const cells = splitRow(l);
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""]));
  });
  return { file, text, rows, before: text.slice(0, a), after: text.slice(b + TABLE_END.length) };
}

function splitRow(line) {
  const cells = [];
  let cur = "", i = line.indexOf("|") + 1;
  for (; i < line.length; i++) {
    if (line[i] === "\\" && line[i + 1] === "|") { cur += "\\|"; i++; continue; }
    if (line[i] === "|") { cells.push(unesc(cur)); cur = ""; continue; }
    cur += line[i];
  }
  return cells;
}

export function renderTable(rows) {
  const out = [`| ${COLUMNS.join(" | ")} |`, `|${COLUMNS.map(() => "---").join("|")}|`];
  for (const r of rows) out.push(`| ${COLUMNS.map((c) => esc(r[c])).join(" | ")} |`);
  return out.join("\n");
}

export function writeLedger(led, rows) {
  const text = `${led.before}${TABLE_START}\n${renderTable(rows)}\n${TABLE_END}${led.after}`;
  writeFileSync(led.file, text);
}

export function deps(row) {
  return (row.After || "").split(/[,\s]+/).map((s) => s.trim()).filter((s) => s && s !== "—" && s !== "-");
}

export function nowIST() {
  // Ledger timestamps are IST (UTC+05:30), minute precision: 2026-10-16 14:05
  const d = new Date(Date.now() + 330 * 60000);
  return d.toISOString().slice(0, 16).replace("T", " ");
}

export function parseIST(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) return null;
  return new Date(`${s.replace(" ", "T")}:00+05:30`);
}

export function fmtIST(date) {
  return new Date(date.getTime() + 330 * 60000).toISOString().slice(0, 16).replace("T", " ");
}

export function saveFactory(factory, message) {
  const git = (...a) => execFileSync("git", ["-C", factory, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  git("add", "-A");
  try { git("commit", "-q", "-m", message); } catch { return "nothing to commit"; }
  for (let i = 0; i < 4; i++) {
    try { git("push", "-q"); return "saved"; } catch {
      try { git("pull", "-q", "--rebase"); } catch (e) { return `push failed and rebase needs attention: ${e.message.split("\n")[0]}`; }
    }
  }
  return "push failed after retries";
}
