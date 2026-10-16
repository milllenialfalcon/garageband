#!/usr/bin/env node
// Seed the sprint ledger and ticket files from sprint/tickets.src.mjs into a factory-state
// checkout. Run once at sprint start; refuses to overwrite an existing ticket file.
//   node sprint/scripts/gb-seed.mjs <factory-dir>
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderTable } from "./ledger.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const { TICKETS, REPOS, PRIORITY } = await import(join(here, "..", "tickets.src.mjs"));
const factory = process.argv[2];
if (!factory) { console.error("usage: gb-seed.mjs <factory-dir>"); process.exit(1); }

const ids = new Set(TICKETS.map((t) => t.id));
for (const t of TICKETS) for (const d of t.after) if (!ids.has(d)) throw new Error(`${t.id} depends on unknown ${d}`);

const rows = TICKETS.map((t) => ({
  Ticket: t.id, Phase: t.phase, Title: t.title, Lane: t.lane, Size: t.size,
  After: t.after.join(", ") || "—", Status: "ready", Builder: "", Reviewer: "", PR: "",
  Attempts: "0", Started: "", Finished: "",
}));

const ledger = `# Sprint ledger: Garageband build sprint

The single source of truth for the sprint. **Only the Chief (orchestrator) and the relief orchestrator edit it**, through \`node sprint/scripts/gb-sprint.mjs set …\`; builders and reviewers report back and never touch it. The concierge only reads it.

- Status: \`ready\` (waiting for its "After" tickets or a free slot) · \`claimed\` · \`in-review\` · \`changes-requested\` · \`blocked\` · \`done\` (merged into the sprint branch, or probe finished) · \`dropped\`
- Lane \`probe\`: the Chief runs it itself with delegate_task; no pull request.
- Times are IST (UTC+05:30). Size: S under 2 hours of agent time, M about half a day.
- Repos: ${Object.entries(REPOS).map(([k, r]) => `\`${k}\` = ${r.name} (${r.base})`).join(", ")}. Track B tickets (B*) live in \`studio\`.
- Priority order: ${Object.entries(PRIORITY).sort((a, b) => a[1] - b[1]).map(([p, n]) => `${p}=${n}`).join(", ")} (lower first).

<!-- ledger:start -->
${renderTable(rows)}
<!-- ledger:end -->

## Notes
`;
mkdirSync(join(factory, "tickets"), { recursive: true });
for (const d of ["briefs", "handoffs", "reports", "research", "retros"]) mkdirSync(join(factory, d), { recursive: true });
writeFileSync(join(factory, "ledger.md"), ledger);

let made = 0;
for (const t of TICKETS) {
  const f = join(factory, "tickets", `${t.id}.md`);
  if (existsSync(f)) continue;
  const repo = REPOS[t.repo];
  writeFileSync(f, `# ${t.id}: ${t.title}

- Phase: ${t.phase} · Lane: ${t.lane} · Size: ${t.size}
- Repo: ${repo.name} at \`${repo.path}\`, branch from \`${repo.base}\`, ticket branch \`t/${t.id.toLowerCase()}-<slug>\`
- After: ${t.after.join(", ") || "nothing"}
- Touch only: ${t.touch.map((p) => `\`${p}\``).join(", ")}

## What and why
${t.goal}

## Acceptance criteria
${t.ac.map((a, i) => `- AC${i + 1}: ${a}`).join("\n")}

## Pointers
${t.notes.length ? t.notes.map((n) => `- ${n}`).join("\n") : "- None beyond AGENTS.md and sprint/SPRINT.md."}

## Blockers

## Attempt log
`);
  made++;
}
console.log(`ledger: ${rows.length} tickets · ticket files written: ${made}`);
