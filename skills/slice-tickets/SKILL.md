---
name: slice-tickets
description: "Use after the spec and architecture plan are approved, to break the work into small vertical tickets (each a thin end-to-end slice under half a day) with acceptance criteria, verify steps, dependencies, risk level and an assigned model, then add them to the factory ledger. Also use for a bounded change that needs only one or two tickets."
license: MIT
metadata:
  stack: garageband
  phase: plan
  verified: "2026-10-13"
---

# Slice tickets

Small tickets are what make cheap models reliable. A model can hold half a day of work in its head; it can't hold a week.

## Rules for a good ticket
- **Vertical**: a thin slice through every layer it needs (data → server → UI → test) that produces something visible or testable. Not "build all the database tables" then "build all the API".
- **Small**: S (under 2 hours) or M (half a day). Bigger means split it.
- **Independent**: mergeable on its own, behind a flag if incomplete for users.
- **Verifiable**: every step ends `→ verify: <command or observable result>`.
- **Traceable**: names the acceptance criteria it covers. Every criterion in the spec is covered by at least one ticket.

## Order
1. **Tracer bullet first**: the thinnest possible path through the whole feature (one field, one screen, saved and shown), so integration problems appear on day one.
2. Then widen: more fields, validation, states, edge cases.
3. Schema changes get their own ticket using safe-migration, before tickets that depend on them.
4. Risky tickets (money, auth, personal data, schema) are marked and need a Founder Call before merge.

## Assign models (see model-router)
- Frontend-heavy → frontend implementer. Backend and glue → backend implementer. Schema, auth, payments, tricky concurrency → orchestrator or the strongest available.
- Reviewer is always a different model from the implementer.
- Mark each ticket **AFK** (agent can finish alone) or **HITL** (needs the founder at a step, e.g. an API key, a choice).

## Output
- One file per ticket: `.factory/tickets/T-NNN-<slug>.md` from `.factory/TICKET_TEMPLATE.md`. Save factory state (factory-ledger).
- One row per ticket in `.factory/ledger.md` with status `ready`, plus blocked-by links.
- A coverage table at the bottom of the spec: acceptance criterion → ticket(s).
- A short note for the founder: number of tickets, rough total time, what's HITL and when they'll be needed.

## Red flags
- A ticket whose verify step is "looks good".
- A ticket titled "set up X" with no user-visible or testable result.
- More than ~12 tickets for one spec: the spec is probably two specs.
