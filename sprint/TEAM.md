---
# Garageband build sprint team. Same format as the project kit's TEAM.md.
# Check:  node skills/project-bootstrap/assets/project/scripts/gb-team.mjs --check --file sprint/TEAM.md
# DeepSeek builds every lane; Claude and Codex lead and review their areas, so their
# allowances go on thinking and reviewing, not typing.
version: 1
status: configured
roles:
  orchestrator:   # Chief: plans, writes specs, runs probes, merges, keeps the ledger
    tool: claude
    model: claude-opus-5-5
    pool: claude
  frontend:       # frontend lead: writes frontend briefs, reviews frontend work
    tool: codex
    model: gpt-6.1-sol
    pool: codex
  backend:        # backend lead: writes backend and risky briefs, reviews that work
    tool: claude
    model: claude-sonnet-5-5
    pool: claude
  heavy:          # the worker: builds every ticket from a lead's brief
    tool: hermes
    model: deepseek-v4.1-flash
    pool: opencode
  checker:        # reviews heavy-lane work, reader tests, research checks
    tool: opencode
    model: kimi-k3
    pool: opencode
  researcher:     # scouting only; never trusted until a checker verifies it
    tool: opencode
    model: muse-spark-1.3
    pool: free
lanes:
  frontend:
    author: heavy
    reviewer: frontend
  backend:
    author: heavy
    reviewer: backend
  heavy:
    author: heavy
    reviewer: checker
  risky:          # DeepSeek builds; backend lead reviews, and the frontend lead gives a second review
    author: heavy
    reviewer: backend
---

# Sprint team

**DeepSeek is the worker for both Claude and Codex.** Every ticket is built by DeepSeek (through Hermes). Claude leads backend work and Codex leads frontend work: each writes the brief for its tickets, then reviews what DeepSeek built. Claude and Codex build code themselves only when DeepSeek has failed a ticket three times.

| Lane | Brief written by | Built by | Reviewed by |
|---|---|---|---|
| frontend | Codex · GPT-6.1 Sol (frontend lead) | Hermes · DeepSeek V4.1 Flash | Codex · GPT-6.1 Sol |
| backend | Claude · Sonnet 5.5 (backend lead) | Hermes · DeepSeek V4.1 Flash | Claude · Sonnet 5.5 |
| heavy | the Chief, short, from the ticket | Hermes · DeepSeek V4.1 Flash | OpenCode · Kimi K3 |
| risky | Claude · Sonnet 5.5 | Hermes · DeepSeek V4.1 Flash | Claude · Sonnet 5.5, then Codex · GPT-6.1 Sol (both must approve) |
| chief | — | the Chief (Claude · Opus 5.5): probes, specs, repo setup, dogfood run | Codex · GPT-6.1 Sol, when there is a pull request |

The lead writes the brief and reviews the result. That is not self-review, because the lead did not write the code.

## Escalation (when DeepSeek can't finish a ticket)

| Attempts | Who builds |
|---|---|
| 1–3 | DeepSeek, with the reviewer's findings added to the brief each time |
| 4–5 | The lane lead builds it: Claude Sonnet for backend and risky, Codex Sol for frontend, Kimi K3 for heavy. A different model reviews (Codex for Claude's work, Claude for Codex's work, Claude for Kimi's work). |
| after 5 | The Chief rewrites or splits the ticket |

## Bench (extra OpenCode Go models, used on purpose to spread load)

| Model | Used for |
|---|---|
| OpenCode · DeepSeek V4.1 Flash | Second DeepSeek worker when Hermes is busy, and the fallback when Hermes is down |
| OpenCode · MiMo 2.6 | Third worker for test backfills and docs when both DeepSeek workers are busy |
| OpenCode · GLM 5.3 Flash | The Concierge thread; reader tests on briefs before dispatch |
| OpenCode · Gemini 4 Argon | Design second opinion on Track B screens |
| Codex · GPT-6 Luna (low) | Cheap checks for the relief orchestrator |

## When a plan is paused (see SPRINT.md)

| Paused plan | What happens |
|---|---|
| OpenCode Go | Building stops (nothing is moved to Claude or Codex, to save them). Leads use the time to write the next briefs; the Chief writes specs. |
| Claude | Backend and risky reviews wait. Relief (Codex) keeps dispatching and merging frontend and heavy work. |
| Codex | Frontend briefs and reviews move to Claude Sonnet. |

## Resolved model ids (the Chief fills this in on shift 1)

| Name above | Provider instance id | Exact model id | Can run child tasks |
|---|---|---|---|
| | | | |
