#!/usr/bin/env node
// One-way mirror: sprint ledger → Trello board. Never reads anything back into the ledger.
//
//   node sprint/scripts/gb-trello.mjs sync [--dry-run]
//
// Needs TRELLO_KEY, TRELLO_TOKEN and TRELLO_BOARD_ID (box/box.env). Without them it exits 0
// with a note, so a missing key never breaks the concierge's schedule.
//
// Board layout it maintains (creates anything missing):
//   lists: Sprint · Needs you · Ready · In progress · Review · Blocked · Done
//   one card per phase, named "[A0] Prove the core", moved to the list that matches its tickets,
//   with a checklist of its tickets; one "Sprint status" card; one card per open needs-you item.
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findFactory, readLedger, nowIST } from "./ledger.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const dry = process.argv.includes("--dry-run");
const { TRELLO_KEY: key, TRELLO_TOKEN: token, TRELLO_BOARD_ID: board } = process.env;
if (!key || !token || !board) {
  console.log("gb-trello: TRELLO_KEY, TRELLO_TOKEN or TRELLO_BOARD_ID not set; skipping (status stays in the ledger).");
  process.exit(0);
}

const PHASE_NAMES = {
  A0: "Prove the core", A1: "One-command setup", A2: "Orchestrator skill", C1: "Station contracts",
  C2: "Line file and bring-your-own skills", B0: "Fork foundation", B1: "Install skills once",
  B2: "Hermes as a native provider", B4: "Live factory board", B6: "Safety and cost controls",
};
const LISTS = ["Sprint", "Needs you", "Ready", "In progress", "Review", "Blocked", "Done"];

const api = async (method, path, params = {}) => {
  const q = new URLSearchParams({ key, token, ...params });
  if (dry && method !== "GET") { console.log(`(dry-run) ${method} ${path} ${JSON.stringify(params).slice(0, 160)}`); return {}; }
  const res = await fetch(`https://api.trello.com/1${path}?${q}`, { method });
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
};

const factory = findFactory();
const { rows } = readLedger(factory);
const status = JSON.parse(execFileSync(process.execPath, [join(here, "gb-sprint.mjs"), "status", "--json", "--factory", factory], { encoding: "utf8" }));
const text = execFileSync(process.execPath, [join(here, "gb-sprint.mjs"), "status", "--factory", factory], { encoding: "utf8" });

const lists = await api("GET", `/boards/${board}/lists`, { filter: "open" });
const listId = {};
for (const name of LISTS) {
  const found = lists.find((l) => l.name === name);
  listId[name] = found ? found.id : (await api("POST", "/lists", { name, idBoard: board, pos: "bottom" })).id;
}
const cards = await api("GET", `/boards/${board}/cards`, { fields: "name,idList,desc,closed", checklists: "all", filter: "open" });
const findCard = (prefix) => cards.find((c) => c.name.startsWith(prefix));
const upsert = async (name, prefix, list, desc) => {
  const c = findCard(prefix);
  if (!c) return api("POST", "/cards", { idList: listId[list], name, desc, pos: "bottom" });
  const p = {};
  if (c.idList !== listId[list]) p.idList = listId[list];
  if (c.desc !== desc) p.desc = desc;
  if (c.name !== name) p.name = name;
  if (Object.keys(p).length) await api("PUT", `/cards/${c.id}`, p);
  return c;
};

// Sprint status card
await upsert("Sprint status", "Sprint status", "Sprint", `Updated ${nowIST()} IST by the concierge (one-way mirror of the sprint ledger).\n\n\`\`\`\n${text.slice(0, 15000)}\n\`\`\``);

// Phase cards
let changes = 0;
for (const [phase, label] of Object.entries(PHASE_NAMES)) {
  const tickets = rows.filter((r) => r.Phase === phase);
  if (!tickets.length) continue;
  const st = tickets.map((t) => t.Status);
  const list = st.every((s) => s === "done" || s === "dropped") ? "Done"
    : st.includes("blocked") ? "Blocked"
    : st.some((s) => s === "in-review" || s === "changes-requested") ? "Review"
    : st.includes("claimed") || st.includes("done") ? "In progress" : "Ready";
  const f = status.forecast.phases[phase] ?? {};
  const desc = `${f.done ?? 0}/${f.total ?? tickets.length} tickets done · ETA ${f.eta ?? "?"} IST\n\n` +
    tickets.map((t) => `- ${t.Ticket} **${t.Status}** ${t.Title}${t.PR ? ` · ${t.PR}` : ""}`).join("\n");
  const card = await upsert(`[${phase}] ${label}`, `[${phase}]`, list, desc);
  if (!card.id) continue;
  let cl = (card.checklists ?? []).find((c) => c.name === "Tickets");
  if (!cl) cl = await api("POST", `/cards/${card.id}/checklists`, { name: "Tickets" });
  const items = cl.checkItems ?? [];
  for (const t of tickets) {
    const name = `${t.Ticket} ${t.Title}`;
    const want = t.Status === "done" || t.Status === "dropped" ? "complete" : "incomplete";
    const it = items.find((i) => i.name.startsWith(`${t.Ticket} `));
    if (!it) { await api("POST", `/checklists/${cl.id}/checkItems`, { name, checked: String(want === "complete") }); changes++; }
    else if (it.state !== want) { await api("PUT", `/cards/${card.id}/checkItem/${it.id}`, { state: want }); changes++; }
  }
}

// Needs-you cards: one per open item; archive cards whose item is gone
const open = status.needsYou.map((n) => n.slice(0, 120));
for (const item of open) {
  if (!cards.some((c) => c.idList === listId["Needs you"] && c.name === item)) { await api("POST", "/cards", { idList: listId["Needs you"], name: item, pos: "bottom" }); changes++; }
}
for (const c of cards.filter((c) => c.idList === listId["Needs you"] && !open.includes(c.name))) { await api("PUT", `/cards/${c.id}`, { closed: "true" }); changes++; }

console.log(`gb-trello: synced at ${nowIST()} IST (${changes} checklist/needs-you changes)${dry ? " [dry-run]" : ""}`);
