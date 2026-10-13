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

## Tiers
Define these in `AGENTS.md` section 8. Example (edit to your own setup):

| Tier | Does | Example |
|---|---|---|
| Orchestrator | validate, spec, architecture, briefs, risky reviews, escalations, final calls | strongest Claude model |
| Frontend | UI tickets, design variants, design fixes | a strong coding model with good UI taste (e.g. a GPT Codex model) |
| Implementer | most backend and glue tickets, tests, refactors from a brief | cheapest capable model (e.g. DeepSeek via OpenCode) |
| Checker | reader tests, research verification, routine reviews, triage | small fast model (e.g. Haiku, a "mini" or "low" model) |
| Researcher | broad web research, option lists | free models — output untrusted until verify-research |

## Routing table

| Work | Primary | Reviewer |
|---|---|---|
| validate-idea, write-spec, architecture-plan | Orchestrator | Checker or a second strong model |
| Schema, auth, payments, security-sensitive code | Orchestrator (or strongest available) | A different strong model |
| UI ticket | Frontend | Checker for code; design-critique by Orchestrator or Checker |
| Backend ticket from a brief | Implementer | Checker (routine) or Orchestrator (risky) |
| Reader test, verify-research, intake-triage, cost-watch | Checker | — |
| Research | Researcher | Checker via verify-research |

**Hard rule:** the reviewer is never the same model as the author, and never sees the author's reasoning, only the artifact and the contract.

## Escalation ladder (from the ledger's Attempts column)
1. Attempts 1–3: the same implementer fixes, with the reviewer's findings added to the brief.
2. Attempts 4–5: a stronger model takes over with a **fresh** brief (the original brief, plus a short summary of what failed and why; not the whole history).
3. After 5, or if two models fail the same way: stop. The orchestrator diagnoses (root-cause-debug) and either rewrites the ticket, splits it, or raises a decision-brief. Repeated failure usually means the ticket or spec is wrong, not the model.

## Quota protection
- Before large orchestrator work, check remaining quota. If it's low, do only Founder Calls, architecture and risky reviews with it; push everything else down a tier.
- Batch reviews and briefs rather than many small calls.
- Long sessions degrade. Start a fresh session at a ticket boundary after writing a handoff (factory-ledger), rather than continuing in an overflowing context. Trim context at about 75% full, not 100%.
- Never send secrets, keys, customer data or private code to free research models.

## Record
Note the model on every ledger row and PR. retro-instincts uses this to learn which tiers are reliable for which work.
