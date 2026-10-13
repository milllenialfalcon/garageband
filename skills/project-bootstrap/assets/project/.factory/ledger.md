# Factory ledger

The single source of truth for who is doing what. Every agent reads it before starting and updates it when they start, block or finish. One row per ticket.

Status values: `ready` · `claimed` · `in-review` · `changes-requested` · `blocked` · `done` · `dropped`

| Ticket | Title | Status | Owner (model) | Branch / PR | Attempts | Escalation | Updated |
|---|---|---|---|---|---|---|---|

## Rules
- **Claim before you start**: set status `claimed` and your model name. Never work on a ticket someone else has claimed.
- **Attempts** counts fix rounds after a failed review or failed checks. At 3 the ticket escalates (see `model-router`).
- **Blocked** rows must name the blocker in the ticket file.
- Only the orchestrator marks a ticket `done`, after the PR is merged.
