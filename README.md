# Garageband

**The skill stack for a one-person AI software factory.**

Garageband turns a founder plus a few AI models (Claude, Codex, DeepSeek or any other) into a professional software team. It gives every model the same playbook — 36 skills covering the whole lifecycle from "should this exist?" to "what did we learn?" — and backs the important rules with checks that run in git and CI, so they hold even when a model ignores instructions.

It's built for founders who don't come from software. You decide *what* and *whether*. The factory handles *how*, and asks you only when it matters.

---

## Install

### Claude Code (one command pair)
```
/plugin marketplace add OWNER/garageband
/plugin install garageband@garageband
```
Skills appear as `garageband:<skill>`. The plugin also adds a safety hook that blocks destructive commands and pushes to `main`.

### Codex, OpenCode and other tools (one line)
```
curl -fsSL https://raw.githubusercontent.com/OWNER/garageband/main/install.sh | GB_REPO=OWNER/garageband bash
```
This installs into `~/.agents/skills`, which both Codex and OpenCode read. Alternative: `npx skills add OWNER/garageband`.

Use the plugin for Claude Code and the script for everything else. Installing into `~/.claude/skills` as well would make OpenCode see every skill twice.

### Set up a project (once per repo)
In any tool, ask: **"use the project-bootstrap skill"**, or run directly:
```
bash ~/.agents/skills/project-bootstrap/scripts/bootstrap.sh path/to/repo --protect
```
It adds the project kit without overwriting your files: `AGENTS.md` constitution, `PRODUCT.md`, `DESIGN.md`, spec/ADR/ticket/brief templates, the `.factory/` ledger, PR template, the CI quality gate, a git guard hook and `slop-lint`. `--protect` turns on GitHub branch protection.

---

## Start

Open any session and say **"use the garageband skill"** (Codex: `$garageband`). It reads the project, classifies your request as a **spike**, **bounded** change or **architectural** work, tells you the stages it will run and where it needs you, then starts.

---

## The line

| # | Stage | Skills | Gate |
|---|---|---|---|
| 1 | Should this exist? | `validate-idea` | Founder: build / shrink / don't build |
| 2 | What exactly? | `grill-founder` → `write-spec` | Founder approves spec |
| 3 | Look and feel | `design-system` → `design-variants` | Founder picks a variant |
| 4 | Structure | `architecture-plan` → `decision-log` | Second-model review passes |
| 5 | Setup | `project-bootstrap` | Green CI on a test PR |
| 6 | Break down | `slice-tickets` | Every ticket has a verify step |
| 7 | Hand off | `dispatch-brief`, `factory-ledger`, `model-router` | Reader test finds no ambiguity |
| 8 | Build | `tdd-slice`, `ui-build-rules`, `safe-migration`, `root-cause-debug` | Tests green, evidence pasted |
| 9 | Review | `doubt-review`, `design-critique` | A different model approves |
| 10 | Test | `browser-qa`, `break-ui`, `slop-gate` | CI green |
| 11 | Secure | `security-pass`, `launch-compliance` | No critical findings |
| 12 | Explain | `owner-pr-summary` | Founder understands and merges |
| 13 | Release | `ship-gate` | GO with a tested rollback |
| 14 | Watch | `watch-after-ship` | Metrics within thresholds |
| 15 | Listen | `intake-triage` | Weekly queue approved |
| 16 | Measure | `measure-outcome` | Keep / iterate / kill |
| 17 | Maintain | `maintenance-sweep`, `cost-watch` | Monthly report approved |
| 18 | Choose next | `portfolio-priority` | Next bet picked |
| 19 | Learn | `retro-instincts`, `skill-lab` | Rules updated, skills proven |

Everywhere: `garageband` routes, `decision-brief` frames every choice, `verify-research` checks anything a research model produced.

## All 36 skills

| Skill | What it does |
|---|---|
| **Founder layer** | |
| `garageband` | Entry point. Routes any request to the right path, skills and models |
| `grill-founder` | Rounds of plain-English questions with recommended answers ("yes" accepts) |
| `decision-brief` | Mechanical / Taste / Founder Call; one-way vs two-way door; one-minute briefs |
| `owner-pr-summary` | PR descriptions a non-engineer can approve from |
| **Define** | |
| `validate-idea` | Forcing questions, competitor check, build / shrink / don't-build |
| `write-spec` | Given/When/Then criteria, not-doing list, metric with tracking events |
| **Design** | |
| `design-system` | Screen modes, three founder dials, tokens in `DESIGN.md`, anti-generic check |
| `design-variants` | Three working variants on named axes; founder picks; losers deleted |
| `ui-build-rules` | Craft floor: tokens, components, states, accessibility, motion, copy, i18n |
| `design-critique` | Fresh reviewer, four widths, ten heuristics /40, Block or Approve |
| `break-ui` | Worst-case realistic data, including Indian scripts and number formats |
| **Architect and set up** | |
| `architecture-plan` | Data model, contracts, flows, security, tracking plan; second-model review |
| `decision-log` | ADRs, decision log, glossary |
| `project-bootstrap` | Project kit, default stack, environments, secrets, backups, branch protection |
| **Plan and hand off** | |
| `slice-tickets` | Thin vertical tickets with verify steps, models and dependencies |
| `dispatch-brief` | Search-first, self-contained briefs, reader test, claim in ledger |
| `factory-ledger` | Shared state across tools; claims, attempts, handoff notes |
| `model-router` | Tiers, author ≠ reviewer, escalation ladder, quota protection |
| `verify-research` | Claim-by-claim checking against primary sources |
| **Build** | |
| `tdd-slice` | Failing test first, surgical diff, fresh evidence before "done" |
| `root-cause-debug` | Reproduce, narrow, fix with a regression test; three strikes then escalate |
| `safe-migration` | Expand → migrate → contract, backups, tested rollback |
| **Verify** | |
| `doubt-review` | Artifact-and-contract-only review, two axes, sideways sweep, max 3 rounds |
| `browser-qa` | Playwright flows from criteria, widths, accessibility, speed, QA brakes |
| `slop-gate` | Deterministic design and accessibility checks in CI |
| `security-pass` | Threat sketch, OWASP-style checklist, GO / NO-GO |
| `launch-compliance` | Privacy (incl. India's DPDP Act), terms, payments and tax, licences |
| **Ship and operate** | |
| `ship-gate` | Go/no-go, rollback plan, release notes, staged rollout |
| `watch-after-ship` | Thresholds vs baseline, flag-off on breach, incidents, postmortems |
| `intake-triage` | Feedback and bug reports into labelled tickets; weekly queue |
| `cost-watch` | Monthly running costs, spikes, waste, free-tier headroom |
| `maintenance-sweep` | Dependencies, backup restore test, expiries, flags, tech debt |
| **Measure and learn** | |
| `measure-outcome` | Metric vs target, funnel, keep / iterate / kill |
| `portfolio-priority` | Impact × reach × confidence × fit ÷ effort; next three bets |
| `retro-instincts` | Evidence-based retros; learned rules promoted only when repeated |
| `skill-lab` | With/without tests per model to prove each skill actually works |

## What machines enforce (works with every model)

| Guard | Where | Stops |
|---|---|---|
| Branch protection | GitHub | Merging without green checks, force pushes, deleting `main` |
| `garageband-ci` | GitHub Actions | Failing typecheck, lint, tests, e2e, slop-lint errors, high/critical vulnerabilities, leaked secrets, GPL/AGPL dependencies |
| `.githooks/pre-push` | Every clone | Pushing to `main`, force pushes, obvious secret keys |
| `slop-lint` | Local and CI | Disabled zoom, removed focus outlines, missing alt text; warns on AI-template looks and off-token colours and fonts |
| Plugin guard hook | Claude Code | Destructive shell commands, `reset --hard`, dropping tables, agent-merged PRs |

Prose skills guide; these gates guarantee.

## Multi-model setup

Write your roles in `AGENTS.md` section 8. An example that works well on small budgets:

| Role | Example |
|---|---|
| Orchestrator (thinking, specs, risky review) | Claude (strongest model) |
| Frontend implementer | Codex (GPT) |
| Backend implementer (most tickets) | DeepSeek via OpenCode |
| Checker (reader tests, routine review, triage) | Claude Haiku or a small GPT model |
| Researchers (untrusted until checked) | Free models |

State lives in the repo (`.factory/`, `docs/`), not in any tool's memory, so models can hand work to each other across tools.

## Update and remove
- Claude Code: `/plugin` → update, or `/plugin uninstall garageband@garageband`.
- Other tools: re-run the install line to update; add `--uninstall` to remove.
- Project kit files belong to your project after bootstrap; update them by hand or re-run bootstrap (it never overwrites).

## Status
v0.1.0. Every skill should be proven on your models with `skill-lab` before you rely on it; results differ by model. Not legal advice: `launch-compliance` drafts documents for a lawyer to review.

Credits and influences: see [NOTICE.md](NOTICE.md). Licence: MIT.
