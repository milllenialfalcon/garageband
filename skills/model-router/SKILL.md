---
name: model-router
description: "Use when deciding which AI model or tool should do a piece of work, when a model has failed a ticket repeatedly, or when usage quotas are running low. Maps work to model tiers (orchestrator, frontend, implementer, reviewer, researcher, checker), enforces author-is-never-reviewer, runs the escalation ladder after failed attempts, and protects the scarcest quota."
license: MIT
metadata:
  stack: garageband
  phase: handoff
  verified: "2026-10-13"
---

# Model router

Spend the strongest model's quota on thinking and judgement, the cheap models' quota on typing, and never let anyone grade their own work.

## The team comes from TEAM.md
Never route from memory. Read `TEAM.md` (or run `node scripts/gb-team.mjs`) for: the role → tool and model map, each lane's builder and reviewer, and which roles share an allowance (`pool`). If it's missing or unconfigured, run team-setup first.

## Routing table

| Work | Done by (role in TEAM.md) | Reviewed by |
|---|---|---|
| validate-idea, write-spec, architecture-plan, slice-tickets, dispatch briefs | orchestrator | checker (or a second strong model for architecture) |
| Ticket in the **frontend** lane | `lanes.frontend.author` | `lanes.frontend.reviewer`; design-critique by orchestrator or checker |
| Ticket in the **backend** lane | `lanes.backend.author` | `lanes.backend.reviewer` |
| Ticket in the **heavy** lane | `lanes.heavy.author` | `lanes.heavy.reviewer` |
| Ticket in the **risky** lane | `lanes.risky.author` | `lanes.risky.reviewer`, then security-pass |
| Reader tests, verify-research, intake-triage, cost-watch | checker | — |
| Research | researcher | checker via verify-research |

**Hard rule:** the reviewer is a different model from the author whenever one is available, and in every case a fresh session that sees only the artifact and the contract, never the author's reasoning.

## Escalation ladder (AGENTS.md section 8, from the ledger's Attempts column)
1. Attempts 1–3: the same implementer fixes, with the reviewer's findings added to the brief.
2. Attempts 4–5: a stronger model takes over with a **fresh** brief (heavy → backend author; backend or frontend → orchestrator) (the original brief, plus a short summary of what failed and why; not the whole history).
3. After 5, or if two models fail the same way: stop. The orchestrator diagnoses (root-cause-debug) and either rewrites the ticket, splits it, or raises a decision-brief. Repeated failure usually means the ticket or spec is wrong, not the model.

## Quota protection
- Roles with the same `pool` in TEAM.md share one allowance. When the orchestrator's pool is low, move building work off that pool first: backend tickets with a clear pattern go to the heavy lane; the orchestrator keeps only thinking work (specs, briefs, risky reviews). Tell the founder in one line when you do this.
- Before large orchestrator work, check remaining quota. If it's low, do only Founder Calls, architecture and risky reviews with it; push everything else down a tier.
- Batch reviews and briefs rather than many small calls.
- Long sessions degrade. Start a fresh session at a ticket boundary after writing a handoff (factory-ledger), rather than continuing in an overflowing context. Trim context at about 75% full, not 100%.
- Never send secrets, keys, customer data or private code to free research models.

## Record
Note the model on every ledger row and PR. retro-instincts uses this to learn which tiers are reliable for which work.
