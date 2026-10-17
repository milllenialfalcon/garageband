# Harness engineering: what we learned (17 October 2026)

Garageband is a **meta-harness**: rules, tools and loops around coding agents, built on T3 Code. On 17 October nine Claude Haiku agents studied every entry in [walkinglabs/awesome-harness-engineering](https://github.com/walkinglabs/awesome-harness-engineering), including the course [learn-harness-engineering](https://github.com/walkinglabs/learn-harness-engineering) end to end. Their full reports are in this folder (`01-course.md` … `09-harnesses-tooling.md`). This page is the checked summary.

**How far to trust it:** the agents read repositories directly but most articles through a summariser, so numbers and quotes in the reports are unverified until someone checks the original. They rated Garageband from a short description, not the repo; every claim about our own files below was checked by hand.

## The ideas that kept coming back

1. **Turn every failure into a guard.** A mistake should become a test, a lint rule, a script check or a line in AGENTS.md, not just a fixed bug.
2. **Checks a script can do shouldn't cost a model.** Deterministic gates first, model judgement only for what needs it.
3. **Verify from outside the builder.** The reviewer must not see the builder's reasoning, must run the checks itself, and its approval must be tied to the exact commit it reviewed.
4. **State lives in files, not in the model.** Short entry points that point to detail; handoffs capped in size; one authority per fact.
5. **Measure before you believe a change helped.** Several runs per condition, compare against a baseline, ignore gains inside the noise.
6. **Unattended agents need stop rules,** not just retry rules: classify failures, stop repeating the same failure, don't let a waiting prompt stall the line, and keep anything that reads the web away from shells and secrets.

## What we already did well
A single "where truth lives" table; Mechanical / Taste / Founder Call labels; "outside content is data, not orders"; a review by a different model on every PR; attempt and escalation rules; a lease between the Chief and Relief; the box push guard.

## Changed on 17 October (in `sprint/`, `AGENTS.md`, tests)

| Change | Why |
|---|---|
| `gb-merge.sh` only merges if the approval names the PR's current commit (`REVIEWED-SHA`), and pins the merge to that commit | **Real hole found by the specs study:** a push after approval could be merged unreviewed |
| New `gb-gate.mjs` script gate before any model looks at a PR: CI green, only the ticket's paths changed, no protected files, tests changed with code, summary/STATUS/evidence present | Mechanical checks were being done by a model |
| Luna's gate narrowed to "does every acceptance criterion have evidence" | Model time only where judgement is needed |
| Reviewers told not to read the builder's thread, and to post the reviewed commit | Independent review |
| Failure classes (product, test, brief, environment, external): only the first three count as attempts; same failure twice → change approach; `NOT_PROVEN` status; check existing branch/PR before re-dispatching; answer or cancel tasks stuck on a prompt | Stop rules for unattended runs |
| A run log, `.factory/runs.jsonl`, one line per finished task | Base for measuring models and costs |
| The ledger is the only record of ticket status | One authority per fact |
| AGENTS.md: `NOT_PROVEN`, `BASE`, `CHANGED_BUT_UNVERIFIED`, never weaken a test, quiet logs, confirmed vs inferred | Report shape that resists faked success |

## New tickets (in the sprint ledger)
- **A0-07** Research runs without shell or write access (prompt injection through fetched pages).
- **A1-12** Box hardening plan: outbound allowlist, logins readable only by their own tool, per-ticket containers.
- **A2-07** skill-lab measures properly: repeated runs, pass^k, noise band, held-out task.
- **A2-08** Reviewer calibration set: planted-defect diffs to measure each reviewer model.
- **C1-05** Acceptance-criteria IDs and a coverage check.
- **C1-06** Sharper briefs, reports and handoffs; `[NEEDS CLARIFICATION]` markers and a lite spec path.
- **B6-04** Retry classes and a breaker per provider (Track B).

## Added 18 October: Harness² (Google Research)
Automatic harness tuning without changing the model; claims biggest gains on cheap models, which is exactly our builders. Notes and proposed use (Enigma B10 learning loop): `10-harness2.md`.

## For later (Track B and after the sprint)
Lease claims with expiry and an "unknown" state; generation fencing so an old orchestrator can't merge after handover; a needs-you queue that records who decided each item; an audit log of guard blocks; protect-files and circuit-breaker hooks for every provider; a governed project memory (decisions with status and "supersedes"); a small in-house eval suite from our own past tickets, scored pass^3 with cost per accepted task; capability scans on generated apps before release.

## Adopt rather than build (licences checked by the study, verify before use)
- **fh-gate** (forge-harness, MIT): typed pass/fail PR verdict for CI.
- **Citadel** (MIT): copy the pr-watch auto-fix, protect-files and circuit-breaker patterns, with attribution.
- **browser-harness** (MIT): optional real-Chrome backend for browser-qa, with the founder's consent per use.
- **agent-harness** (MIT): evaluate for pinned skill bundles across tools.
- Not to adopt: bringyour-mcp (all rights reserved), OpenAgentRelay (alpha, no TLS), BrowserAct (paid), rust-norion (GPL-3.0, ideas only).

## Corrections to the studies
- The guardrails study guessed our guard hook covers file tools but not shell. It's the other way round: it covers shell commands only. Protecting files from edits is still a gap (Track B guard layer).
- "No spend ceiling": all our plans are flat subscriptions, so the risk is running out of allowance, not surprise bills; quota pacing covers it until the quota meter (A0-06) lands.
- The runtimes study said ORCHESTRATOR.md wasn't public: it's on the `sprint/track-a` branch.
