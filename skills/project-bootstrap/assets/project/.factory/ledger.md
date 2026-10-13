# Factory ledger

The single source of truth for who is doing what, on the `factory-state` branch. Every agent pulls it before starting and commits + pushes it when they start, block or finish (see AGENTS.md section 2). One row per ticket.

Status values: `ready` · `claimed` · `in-review` · `changes-requested` · `blocked` · `done` · `dropped`

| Ticket | Title | Status | Owner (model) | Branch / PR | Attempts | Escalation | Updated |
|---|---|---|---|---|---|---|---|

## Rules
- **Claim before you start**: pull, set status `claimed` and your model name, commit and push. Never work on a ticket someone else has claimed.
- **Attempts** counts failed rounds (AGENTS.md section 8). After 3, report `BLOCKED` and the ticket moves to a stronger model. After 5, the orchestrator stops and rethinks it.
- **Blocked** rows must name the blocker in the ticket file's `## Blockers` section.
- Only the orchestrator marks a ticket `done` (after the founder merges its PR) or `dropped` (with a reason).

## Backlog (not yet ready)
| Item | Source | Severity / priority | Notes |
|---|---|---|---|
