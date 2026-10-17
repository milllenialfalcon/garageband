#!/usr/bin/env node
// Sprint status, ETAs, the next tickets to start, and safe ledger edits.
//
//   node sprint/scripts/gb-sprint.mjs status [--json]     progress, in flight, blocked, needs-you, ETAs
//   node sprint/scripts/gb-sprint.mjs next [--limit 5] [--lane heavy]   tickets ready to start now
//   node sprint/scripts/gb-sprint.mjs show <ticket>       one ledger row
//   node sprint/scripts/gb-sprint.mjs set <ticket> field=value … [--save]   edit a row (Chief only)
//   node sprint/scripts/gb-sprint.mjs add <ticket> phase=… title=… lane=… size=… [after=…] [--save]
//
// Options: --factory <dir> (default: the main checkout's .factory), --slots claude=2,codex=2,go=4,gemini=2
// set: value "now" for Started/Finished stamps the current IST time; "+1" for Attempts adds one.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { findFactory, readLedger, writeLedger, deps, nowIST, parseIST, fmtIST, saveFactory, STATUSES, ACTIVE, COLUMNS } from "./ledger.mjs";

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const bool = (n) => { const i = args.indexOf(n); if (i < 0) return false; args.splice(i, 1); return true; };
const factory = findFactory(flag("--factory"));
const json = bool("--json");
const save = bool("--save");
const limit = Number(flag("--limit", "5"));
const laneFilter = flag("--lane");
const slots = Object.fromEntries((flag("--slots", "claude=2,codex=2,go=4,gemini=2")).split(",").map((s) => s.split("=")).map(([k, v]) => [k, Number(v)]));
const [cmd = "status", ...rest] = args;

const LANE_POOL = { frontend: "go", backend: "go", heavy: "go", risky: "go", chief: "claude", probe: "claude" }; // DeepSeek builds every lane
const PRIORITY = { A0: 1, B0: 1, C1: 2, B1: 2, B2: 2, M0: 2, B4: 3, B6: 3, M1: 3, C2: 4 };
const HOURS = { S: 2, M: 5, L: 12 };        // agent wall-clock incl. lead brief and review, before calibration
const WORK_HOURS_PER_DAY = 20;              // the line pauses for quota resets and reviews

const led = readLedger(factory);
const rows = led.rows;
const byId = new Map(rows.map((r) => [r.Ticket, r]));
const isDone = (id) => ["done", "dropped"].includes(byId.get(id)?.Status);
const canStart = (r) => r.Status === "ready" && deps(r).every(isDone);
const prio = (r) => (PRIORITY[r.Phase] ?? 9);

function calibration() {
  const ratios = rows.filter((r) => r.Status === "done" && r.Started && r.Finished).map((r) => {
    const h = (parseIST(r.Finished) - parseIST(r.Started)) / 3.6e6;
    return h > 0 ? h / (HOURS[r.Size] ?? 4) : null;
  }).filter((x) => x !== null).sort((a, b) => a - b);
  if (ratios.length < 3) return { factor: 1, basedOn: ratios.length };
  const med = ratios[Math.floor(ratios.length / 2)];
  return { factor: Math.min(3, Math.max(0.4, med)), basedOn: ratios.length };
}

// List-scheduling simulation: each pool runs up to N tickets at once, respecting "After".
function forecast() {
  const { factor, basedOn } = calibration();
  const now = Date.now();
  const finish = new Map();       // id -> hours from now
  const poolFree = {};            // pool -> array of hours when each slot frees up
  for (const [p, n] of Object.entries(slots)) poolFree[p] = Array(n).fill(0);
  for (const r of rows) {
    if (isDone(r.Ticket)) finish.set(r.Ticket, 0);
  }
  for (const r of rows.filter((x) => ACTIVE.includes(x.Status) || x.Status === "blocked")) {
    const est = (HOURS[r.Size] ?? 4) * factor;
    const elapsed = r.Started ? (now - parseIST(r.Started)) / 3.6e6 : 0;
    if (r.Status === "blocked") { finish.set(r.Ticket, est * 2); continue; } // unknown wait; doesn't hold a slot
    const left = Math.max(0.25, est - elapsed);
    const pool = LANE_POOL[r.Lane] ?? "claude";
    const slotsArr = poolFree[pool] ?? (poolFree[pool] = [0]);
    slotsArr.sort((a, b) => a - b);
    slotsArr[0] += left;
    finish.set(r.Ticket, slotsArr[0]);
  }
  let pending = rows.filter((r) => r.Status === "ready");
  let guard = 0;
  while (pending.length && guard++ < 1000) {
    const startable = pending.filter((r) => deps(r).every((d) => finish.has(d))).sort((a, b) => prio(a) - prio(b) || a.Ticket.localeCompare(b.Ticket));
    if (!startable.length) break; // dependency on a missing ticket
    const r = startable[0];
    const pool = LANE_POOL[r.Lane] ?? "claude";
    const slotsArr = poolFree[pool] ?? (poolFree[pool] = [0]);
    slotsArr.sort((a, b) => a - b);
    const depReady = Math.max(0, ...deps(r).map((d) => finish.get(d)));
    const start = Math.max(slotsArr[0], depReady);
    const end = start + (HOURS[r.Size] ?? 4) * factor;
    slotsArr[0] = end;
    finish.set(r.Ticket, end);
    pending = pending.filter((x) => x !== r);
  }
  const toDate = (h) => new Date(now + (h * 24 / WORK_HOURS_PER_DAY) * 3.6e6);
  const phases = {};
  for (const r of rows) {
    const p = (phases[r.Phase] ??= { total: 0, done: 0, hours: 0 });
    p.total++; if (isDone(r.Ticket)) p.done++;
    if (r.Status !== "dropped") p.hours = Math.max(p.hours, finish.get(r.Ticket) ?? Infinity);
  }
  const out = {};
  for (const [k, p] of Object.entries(phases)) {
    out[k] = { done: p.done, total: p.total, eta: p.done === p.total ? "done" : Number.isFinite(p.hours) ? fmtIST(toDate(p.hours)) : "unknown (dependency missing)" };
  }
  const all = Math.max(0, ...[...finish.values()]);
  return { factor: Number(factor.toFixed(2)), calibratedOn: basedOn, phases: out, sprintEta: fmtIST(toDate(all)), rangeHours: [Math.round(all * 0.7 * 24 / WORK_HOURS_PER_DAY), Math.round(all * 1.4 * 24 / WORK_HOURS_PER_DAY)] };
}

function needsYou() {
  const f = join(factory, "needs-you.md");
  if (!existsSync(f)) return [];
  return readFileSync(f, "utf8").split("\n").filter((l) => /^- \[ \]/.test(l)).map((l) => l.replace(/^- \[ \]\s*/, ""));
}

if (cmd === "status") {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, rows.filter((r) => r.Status === s).length]));
  const inFlight = rows.filter((r) => ACTIVE.includes(r.Status)).map((r) => ({ id: r.Ticket, title: r.Title, status: r.Status, builder: r.Builder, since: r.Started, pr: r.PR, attempts: r.Attempts }));
  const blocked = rows.filter((r) => r.Status === "blocked").map((r) => ({ id: r.Ticket, title: r.Title }));
  const fc = forecast();
  const nextUp = rows.filter(canStart).sort((a, b) => prio(a) - prio(b) || a.Ticket.localeCompare(b.Ticket)).slice(0, 5).map((r) => r.Ticket);
  const done = counts.done + counts.dropped;
  const report = { asOf: nowIST(), total: rows.length, done, percent: Math.round((done / rows.length) * 100), counts, inFlight, blocked, needsYou: needsYou(), nextUp, forecast: fc };
  if (json) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }
  console.log(`Sprint status at ${report.asOf} IST: ${done}/${rows.length} tickets done (${report.percent}%)`);
  console.log(`  ${STATUSES.map((s) => `${s} ${counts[s]}`).join(" · ")}`);
  console.log("\nBy phase (ETA in IST)");
  for (const [k, p] of Object.entries(fc.phases)) console.log(`  ${k.padEnd(4)} ${String(p.done).padStart(2)}/${String(p.total).padEnd(3)} ${p.eta}`);
  console.log(`\nWhole sprint: about ${fc.sprintEta} IST (range ${fc.rangeHours[0]}–${fc.rangeHours[1]} hours from now; speed factor ${fc.factor} from ${fc.calibratedOn} finished tickets)`);
  console.log(`\nIn flight (${inFlight.length})`);
  for (const t of inFlight) console.log(`  ${t.id} ${t.status.padEnd(17)} ${t.builder || "?"} · since ${t.since || "?"}${t.pr ? ` · ${t.pr}` : ""}${Number(t.attempts) > 0 ? ` · attempts ${t.attempts}` : ""}  ${t.title}`);
  if (blocked.length) { console.log(`\nBlocked (${blocked.length})`); for (const t of blocked) console.log(`  ${t.id} ${t.title}`); }
  const ny = report.needsYou;
  console.log(`\nNeeds you (${ny.length})${ny.length ? "" : ": nothing"}`);
  for (const n of ny) console.log(`  - ${n}`);
  console.log(`\nNext up: ${nextUp.join(", ") || "nothing startable"}`);
} else if (cmd === "next") {
  const list = rows.filter(canStart).filter((r) => !laneFilter || r.Lane === laneFilter).sort((a, b) => prio(a) - prio(b) || a.Ticket.localeCompare(b.Ticket)).slice(0, limit);
  if (json) console.log(JSON.stringify(list, null, 2));
  else for (const r of list) console.log(`${r.Ticket}  ${r.Lane.padEnd(8)} ${r.Size}  ${r.Title}`);
} else if (cmd === "show") {
  const r = byId.get(rest[0]);
  if (!r) { console.error(`no ticket ${rest[0]}`); process.exit(1); }
  console.log(json ? JSON.stringify(r, null, 2) : COLUMNS.map((c) => `${c}: ${r[c]}`).join("\n"));
} else if (cmd === "set") {
  const [id, ...pairs] = rest;
  const r = byId.get(id);
  if (!r) { console.error(`no ticket ${id}`); process.exit(1); }
  for (const p of pairs) {
    const eq = p.indexOf("=");
    if (eq < 1) { console.error(`bad field=value: ${p}`); process.exit(1); }
    const key = COLUMNS.find((c) => c.toLowerCase() === p.slice(0, eq).toLowerCase());
    let val = p.slice(eq + 1);
    if (!key) { console.error(`unknown field ${p.slice(0, eq)} (fields: ${COLUMNS.join(", ")})`); process.exit(1); }
    if (key === "Status" && !STATUSES.includes(val)) { console.error(`status must be one of ${STATUSES.join(", ")}`); process.exit(1); }
    if ((key === "Started" || key === "Finished") && val === "now") val = nowIST();
    if (key === "Attempts" && val === "+1") val = String(Number(r.Attempts || 0) + 1);
    r[key] = val;
  }
  writeLedger(led, rows);
  console.log(`${id}: ${pairs.join(" ")}`);
  if (save) console.log(saveFactory(factory, `ledger: ${id} ${pairs.join(" ")}`));
} else if (cmd === "add") {
  const [id, ...pairs] = rest;
  if (!id || byId.has(id)) { console.error(id ? `ticket ${id} already exists` : "usage: add <id> phase=… title=… lane=… size=… [after=…]"); process.exit(1); }
  const r = Object.fromEntries(COLUMNS.map((c) => [c, ""]));
  Object.assign(r, { Ticket: id, Status: "ready", Attempts: "0", After: "—" });
  for (const p of pairs) {
    const eq = p.indexOf("=");
    const key = COLUMNS.find((c) => c.toLowerCase() === p.slice(0, eq).toLowerCase());
    if (eq < 1 || !key) { console.error(`bad field=value: ${p}`); process.exit(1); }
    r[key] = p.slice(eq + 1);
  }
  for (const need of ["Phase", "Title", "Lane", "Size"]) if (!r[need]) { console.error(`add needs ${need.toLowerCase()}=`); process.exit(1); }
  for (const d of deps(r)) if (!byId.has(d)) { console.error(`after: unknown ticket ${d}`); process.exit(1); }
  rows.push(r);
  writeLedger(led, rows);
  console.log(`added ${id}`);
  if (save) console.log(saveFactory(factory, `ledger: add ${id}`));
} else {
  console.error(`unknown command ${cmd}. Commands: status, next, show, set, add`);
  process.exit(1);
}
