---
name: factory-ledger
description: "Use at the start and end of every work session and whenever a ticket changes state, so every model in every tool shares one source of truth. Reads and updates .factory/ledger.md on the factory-state branch, claims tickets before work, tracks attempts and escalations, and writes an end-of-session handoff note. Also use when resuming work or asking \"where are we?\"."
license: MIT
metadata:
  stack: garageband
  phase: handoff
  verified: "2026-10-13"
---

# Factory ledger

Different tools don't share memory. The ledger and handoff notes are the shared memory.

## How factory state works
`.factory/` is a separate checkout (a git worktree) of the `factory-state` branch. It never merges into `main`, so claims and status are visible to every tool the moment they're pushed, without waiting for a pull request.
- Pull: `git -C .factory pull --rebase` (skip if no remote yet).
- Save: `git -C .factory add -A && git -C .factory commit -m "factory: <what>" && git -C .factory push`.
- Working in another checkout? Use the main checkout's `.factory/` (path in your brief and AGENTS.md section 10).
- If `.factory/` is missing, run project-bootstrap.

## Start of every session
1. Pull factory state, then read `.factory/ledger.md` and the newest file in `.factory/handoffs/`.
2. If resuming a ticket, read its ticket file and brief.
3. Never start a ticket another model has `claimed`. Pick a `ready` ticket whose blockers are `done`.

## While working
- **Claim**: pull, set `claimed`, your model name, branch and today's date, then save (commit and push) **before** writing code. If the push is rejected because someone else changed the ledger, pull and check the ticket is still unclaimed.
- **Blocked**: set `blocked` and write the reason in the ticket file under `## Blockers` (what's missing, what you tried).
- **Review**: set `in-review` when the PR is open; `changes-requested` when a reviewer blocks.
- **Attempts**: add 1 each time a fix round fails review or CI. Follow AGENTS.md section 8: after 3, report `BLOCKED` and model-router moves the ticket to a stronger model; after 5, the orchestrator stops and rethinks. Record each move in the Escalation column.
- Only the orchestrator sets `done` (after the founder merges the PR) or `dropped` (with a reason).

Edit only your own rows. Keep the table sorted by ticket number.

## End of every session (even if nothing finished)
Write `.factory/handoffs/<YYYY-MM-DD>-<model>-<slug>.md` from the template: where things stand, what's done, the exact next step, decisions made, gotchas, files to read first, skills to load next. Keep it under a page.

Save ledger and handoff changes to `factory-state` right away (never inside a feature branch), so every tool sees them after a pull.

## "Where are we?" report for the founder
Count by status, list anything `blocked` or waiting on a Founder Call, list what shipped since the last report, and name the next three tickets. Five to ten lines.
