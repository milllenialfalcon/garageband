---
name: garageband
description: "Use at the start of any software work in a Garageband project — a new idea, feature, bug, design change, release or \"what next?\". Routes the request to the right path (spike, bounded or architectural), the right skills in order, and the right model for each step. Also use when unsure which Garageband skill applies."
license: MIT
metadata:
  stack: garageband
  phase: router
  verified: "2026-10-13"
---

# Garageband router

Garageband is a one-person software factory: a founder who decides *what* and *whether*, and AI models that do the rest through fixed stages and gates. This skill decides where a request enters the line.

## Step 1: Check the project is set up

If the repo has no `AGENTS.md`, `.factory/ledger.md` or `.github/workflows/garageband-ci.yml`, run **project-bootstrap** first. Nothing else works reliably without it.

Read `AGENTS.md`, `PRODUCT.md` and `.factory/ledger.md` before routing.

## Step 2: Classify the request and announce it

Say in one line which path you chose and why. A path can be upgraded later, never downgraded.

| Path | Signs | Route |
|---|---|---|
| **Spike** | Question, experiment, throwaway prototype, "can we…?" | Prototype on a `spike/` branch. Never merged. Ends with a written finding. |
| **Bounded** | Bug fix or small change inside one existing feature, no schema/auth/money change, under a day | write-spec in short form (acceptance criteria written straight into the ticket) → slice-tickets → dispatch-brief → build → review → ship |
| **Architectural** | New product or feature, new data, new integration, auth, payments, anything one-way | The full line below |

When in doubt between two paths, take the bigger one.

## Step 3: The full line

| # | Stage | Skill(s) | Usual model | Gate to pass |
|---|---|---|---|---|
| 0 | Setup (once per project, before anything else) | project-bootstrap | Orchestrator | Kit installed; CI green on a test PR once the app exists |
| 1 | Should this exist? | validate-idea | Orchestrator + founder | Founder says build / don't build |
| 2 | What exactly? | grill-founder → write-spec | Orchestrator | Founder approves spec |
| 3 | Look and feel | design-system → design-variants | Orchestrator, frontend model | Founder picks a variant |
| 4 | Structure | architecture-plan → decision-log | Orchestrator, reviewed by a second model | Review passes; Founder Calls answered |
| 5 | Break down | slice-tickets | Orchestrator | Every ticket has a verify step |
| 6 | Hand off | dispatch-brief, factory-ledger, model-router | Orchestrator | Reader test finds no open ambiguity |
| 7 | Build | tdd-slice, ui-build-rules, safe-migration, root-cause-debug | Implementers | Tests green with evidence |
| 8 | Review | doubt-review, design-critique | A different model | APPROVE |
| 9 | Test | browser-qa, break-ui, slop-gate | Implementer + CI | CI green |
| 10 | Secure | security-pass (risky PRs), launch-compliance (before first launch) | Orchestrator | No critical findings |
| 11 | Explain | owner-pr-summary | Author | Founder understands and merges |
| 12 | Release | ship-gate | Orchestrator | GO, with a rollback plan |
| 13 | Watch | watch-after-ship | Cheap model | Metrics within thresholds |
| 14 | Listen | intake-triage | Cheap model | Queue approved weekly |
| 15 | Measure | measure-outcome | Orchestrator | Founder decides keep / iterate / kill |
| 16 | Maintain | maintenance-sweep, cost-watch | Cheap model | Monthly report approved |
| 17 | Decide what's next | portfolio-priority | Orchestrator + founder | Next bet chosen |
| 18 | Learn | retro-instincts, skill-lab | Orchestrator | Rules updated |

Cross-cutting at every stage: **decision-brief** for any choice, **verify-research** for anything a research model produced, **factory-ledger** for state, **owner-pr-summary** for every PR.

## Step 4: Pick models

Use **model-router**. Default roles (edit in `AGENTS.md` section 10):
- Orchestrator (strongest model): validate, spec, architecture, briefs, risky reviews, final calls.
- Frontend implementer: UI tickets, design variants.
- Backend implementer (cheapest capable model): most build tickets.
- Reviewer: always a different model from the author.
- Researchers (free models): untrusted until verified.

## Step 5: Tell the founder the plan

One short message: the path, the stages you'll run, where you'll need them (Founder Calls and approvals only), and the first step. Then start.

## Red flags
- Starting to code before a path is announced.
- Choosing "bounded" for something that touches money, auth, personal data or the database schema.
- Skipping stage 1 because the founder sounds excited. Excitement is not evidence; validate-idea is quick.
- Running stages from memory instead of from the files in `AGENTS.md` section 2.
