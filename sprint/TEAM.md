---
# Garageband build sprint team. Same format as the project kit's TEAM.md.
# Check:  node skills/project-bootstrap/assets/project/scripts/gb-team.mjs --check --strict --file sprint/TEAM.md
# Model names are the ones you use in T3. On its first shift the orchestrator resolves
# each to the exact id T3 reports (orchestrator_capabilities) and records it in the table below.
version: 1
status: configured
roles:
  orchestrator:   # Chief: plans, slices, writes briefs, builds risky tickets, final calls
    tool: claude
    model: claude-opus-5-5
    pool: claude
  frontend:       # UI tickets (Track B board and screens, installer UX)
    tool: codex
    model: gpt-6.1-sol
    pool: codex
  backend:        # server, scripts and integration tickets that need judgement
    tool: claude
    model: claude-sonnet-5-5
    pool: claude
  heavy:          # big but clear: scaffolding, registration edits, test backfills, docs
    tool: hermes
    model: deepseek-v4.1-flash
    pool: opencode
  checker:        # reviews heavy and frontend work, reader tests, research checks
    tool: opencode
    model: kimi-k3
    pool: opencode
  researcher:     # scouting only; never trusted until a checker verifies it
    tool: opencode
    model: muse-spark-1.3
    pool: free
lanes:
  frontend:
    author: frontend
    reviewer: checker
  backend:
    author: backend
    reviewer: frontend
  heavy:
    author: heavy
    reviewer: checker
  risky:
    author: orchestrator
    reviewer: frontend
---

# Sprint team

Who builds and who reviews each kind of ticket in the Garageband build sprint. Reviews always come from a different model than the builder.

| Lane | Builder | Reviewer |
|---|---|---|
| frontend | Codex · GPT-6.1 Sol | OpenCode · Kimi K3 |
| backend | Claude · Sonnet 5.5 | Codex · GPT-6.1 Sol |
| heavy | Hermes · DeepSeek V4.1 Flash | OpenCode · Kimi K3 |
| risky | Claude · Opus 5.5 (the Chief) | Codex · GPT-6.1 Sol |

## Bench (extra models, used to spread load and burn the OpenCode Go allowance on purpose)

| Model | Used for |
|---|---|
| OpenCode · GLM 5.3 Flash | The concierge thread; reader tests on every brief before dispatch |
| OpenCode · MiMo 2.6 | Second heavy builder when Hermes is busy; test backfills |
| OpenCode · Gemini 4 Argon | Design second opinion on Track B screens; second reviewer on risky tickets |
| OpenCode · DeepSeek V4.1 Flash | Heavy-lane fallback when the Hermes provider is down |
| Codex · GPT-6 Luna (low) | Relief orchestrator's cheap checks; checker fallback when OpenCode Go is paused |

## Fallbacks (when a pool is paused, see QUOTA.md)

| Paused pool | Work moves to |
|---|---|
| claude | backend → Codex · GPT-6.1 Sol (reviewer becomes Kimi K3); risky tickets wait; the relief orchestrator (RELIEF.md) keeps the line moving |
| codex | frontend → Claude · Sonnet (reviewer Kimi K3); backend reviews → Kimi K3 |
| opencode | heavy → Claude · Sonnet if Claude has room, otherwise waits; checker → Codex · GPT-6 Luna |

## Resolved model ids (the orchestrator fills this in on shift 1)

| Name above | Provider instance id | Exact model id | Can run child tasks |
|---|---|---|---|
| | | | |
