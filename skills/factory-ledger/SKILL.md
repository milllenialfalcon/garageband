---
name: factory-ledger
description: "Use at the start and end of every work session and whenever a ticket changes state, so every model in every tool shares one source of truth. Reads and updates .factory/ledger.md, claims tickets before work, tracks attempts and escalations, and writes an end-of-session handoff note. Also use when resuming work or asking \"where are we?\"."
license: MIT
metadata:
  stack: garageband
  phase: handoff
  verified: "2026-10-13"
---

# Factory ledger

Different tools don't share memory. The ledger and handoff notes are the shared memory.

## Start of every session
1. Read `.factory/ledger.md` and the newest file in `.factory/handoffs/`.
2. If resuming a ticket, read its ticket file and brief.
3. Never start a ticket another model has `claimed`. Pick a `ready` ticket whose blockers are `done`.

## While working
- **Claim**: set `claimed`, your model name, branch and today's date before writing code.
- **Blocked**: set `blocked` and write the reason in the ticket file under `## Blockers` (what's missing, what you tried).
- **Review**: set `in-review` when the PR is open; `changes-requested` when a reviewer blocks.
- **Attempts**: add 1 each time a fix round fails review or CI. At 3, stop and hand to model-router for escalation; record it in the Escalation column.
- Only the orchestrator sets `done`, after merge, or `dropped`, with a reason.

Edit only your own rows. Keep the table sorted by ticket number.

## End of every session (even if nothing finished)
Write `.factory/handoffs/<YYYY-MM-DD>-<model>-<slug>.md` from the template: where things stand, what's done, the exact next step, decisions made, gotchas, files to read first, skills to load next. Keep it under a page.

Commit ledger and handoff changes with the work (`chore(ledger): T-NNN claimed`), so every tool sees them after a pull.

## "Where are we?" report for the founder
Count by status, list anything `blocked` or waiting on a Founder Call, list what shipped since the last report, and name the next three tickets. Five to ten lines.
