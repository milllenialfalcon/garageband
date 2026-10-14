---
# Garageband team: which AI tool and model does which job. Machine-readable.
# Fill it in with the team-setup skill, or in a terminal:  node scripts/gb-team.mjs --setup
# Check it any time:  node scripts/gb-team.mjs --check     See the routing:  node scripts/gb-team.mjs
version: 1
status: unconfigured   # becomes "configured" after setup
roles:
  orchestrator:   # thinks: validate, spec, architecture, tickets, briefs, final calls
    tool: claude
    model: ""
    pool: claude
  frontend:       # builds user interface tickets
    tool: codex
    model: ""
    pool: codex
  backend:        # builds server, data and integration tickets
    tool: claude
    model: ""
    pool: claude
  heavy:          # does large, low-ambiguity work: scaffolding, test backfills, refactors, bulk fixes
    tool: opencode
    model: ""
    pool: opencode
  checker:        # reader tests, research checks, routine reviews, triage
    tool: codex
    model: ""
    pool: codex
  researcher:     # broad research; output untrusted until verified
    tool: opencode
    model: ""
    pool: free
lanes:            # who builds each kind of ticket, and who reviews it (never the same model)
  frontend:
    author: frontend
    reviewer: backend
  backend:
    author: backend
    reviewer: checker
  heavy:
    author: heavy
    reviewer: checker
  risky:          # auth, payments, permissions, database structure, security, anything one-way
    author: orchestrator
    reviewer: frontend
---

# TEAM.md

> Owned by the founder. Changing who does what is a Taste decision; log it in `docs/decision-log.md`.

## Lane rules (how tickets are sorted)

| Lane | Goes here when the ticket is mainly… | Examples |
|---|---|---|
| **frontend** | What users see and touch | Screens, components, styling, forms, client-side state, UI copy |
| **backend** | Server logic that needs judgement | APIs, business rules, data access, integrations, background jobs |
| **heavy** | Big but clear: lots of typing, little deciding | Scaffolding from a pattern, backfilling tests, mechanical refactors, fixing many lint errors, dependency upgrades, data scripts, docs |
| **risky** | Anything where a mistake costs money, data or trust | Auth, payments, permissions, database structure changes, security fixes, anything one-way |

Tie-breakers: if it touches money, data or access, it's **risky**. If the work is unclear, it's **backend** (or frontend), not heavy. Heavy tickets must come with a pattern to follow (an example file or exact steps) in the brief.

## Shared allowances

Roles with the same `pool` draw on the same subscription allowance. When a pool runs low, model-router moves work off it first (heavy work moves to the heavy lane; the orchestrator keeps only thinking work).

## Notes
<Anything about this team that agents should know, e.g. "DeepSeek is weak at CSS; keep it off frontend tickets".>
