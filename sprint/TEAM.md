---
# Garageband build sprint team. Same format as the project kit's TEAM.md (six roles, four lanes);
# the full roster below adds the extra models. Check:
#   node skills/project-bootstrap/assets/project/scripts/gb-team.mjs --check --file sprint/TEAM.md
version: 1
status: configured
roles:
  orchestrator:   # the Chief: decisions, specs, merges
    tool: claude
    model: claude-opus-5-5
    pool: claude
  frontend:       # frontend lead: frontend briefs and reviews
    tool: codex
    model: gpt-6.1-sol
    pool: codex
  backend:        # backend lead: backend and risky briefs and reviews
    tool: claude
    model: claude-sonnet-5-5
    pool: claude
  heavy:          # the worker: builds every ticket
    tool: hermes
    model: deepseek-v4.1-flash
    pool: go
  checker:        # reviews heavy-lane work
    tool: hermes
    model: glm-5.3-flash
    pool: go
  researcher:     # research on the free OpenCode models (200k context); untrusted until verified
    tool: opencode
    model: deepseek-v4.1-flash
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
  risky:          # DeepSeek builds; backend lead reviews, then GPT-6 Astra gives a second review
    author: heavy
    reviewer: backend
---

# Sprint team

The rule: **use the cheapest model that can do the job well, and spend the expensive ones on judgement, not typing.** DeepSeek builds everything; Claude and Codex lead, check and decide.

## Plans

| Plan | How it's paid | Models |
|---|---|---|
| **Claude** ($20) | Shared 5-hour and weekly limits | Opus 5.5 (most capable, most expensive), Sonnet 5.5, Haiku 5.5 (cheapest) |
| **Codex** ($20) | Shared 5-hour and weekly limits | GPT-6 Astra (most capable, about 5× Sol), GPT-6.1 Sol (everyday), GPT-6 Luna (about 1/20 of Sol) |
| **OpenCode Go** ($10, through Hermes) | Monthly allowance, about 10% a day | DeepSeek V4.1 Flash, MiMo V2.6 Flash, GLM 5.3 Flash (all very cheap), Muse Spark 1.3, Gemini 4 Argon (top-tier reasoning, about Sol's price, 1M-token context) |
| **OpenCode free** (T3's OpenCode provider) | Free; 200k-token context | DeepSeek V4.1 Flash, GLM 5.3 Flash |

## Who does what

| Job | Model | Plan | Why this model |
|---|---|---|---|
| **Chief**: priorities, specs, `chief`-lane tickets, merge decisions | Claude Opus 5.5 | Claude | Best judgement; kept to short turns |
| **Clerk**: reads finished threads and summarises them for the Chief, writes heavy-lane briefs | Claude Haiku 5.5 | Claude | Keeps Opus's context small and cheap |
| **Backend lead**: backend and risky briefs, backend reviews | Claude Sonnet 5.5 | Claude | Strong design and review at a mid price |
| **Frontend lead**: frontend briefs and reviews | GPT-6.1 Sol | Codex | Strong UI judgement; Codex's everyday tier |
| **Gatekeeper**: checks every PR before a lead sees it (CI green, only allowed files touched, tests added, evidence pasted, STATUS present) and bounces obvious failures straight back to DeepSeek | GPT-6 Luna | Codex | Very cheap; saves Sonnet and Sol for real reviews |
| **Main worker**: builds every ticket | DeepSeek V4.1 Flash (Hermes) | Go | Cheap, good at code from a precise brief |
| **Second worker**: tests, docs, test backfills, and builds when DeepSeek is busy | MiMo V2.6 Flash (Hermes) | Go | Cheapest output tokens |
| **Heavy-lane reviewer**, and reader tests on M-size briefs | GLM 5.3 Flash (Hermes) | Go | Cheap and a different model from DeepSeek |
| **Big-context worker**: tickets that must read a whole codebase (T3 source: A2-01, B0-02, B2-02) | Gemini 4 Argon (Hermes) | Go | 1M-token context and strong reasoning |
| **Rescue builder**: attempt 4 when DeepSeek fails three times | Gemini 4 Argon (Hermes) | Go | Stronger model, still off the Claude and Codex plans |
| **Second reviewer on risky tickets** (B1-02, B6-03), and the final sprint review | GPT-6 Astra | Codex | The most careful reviewer; used only where a mistake costs most |
| **Last-resort builder**: attempt 5 | The lane lead (Sonnet for backend and risky, Sol for frontend) | Claude / Codex | Only after DeepSeek and Gemini have both failed |
| **Researcher**: web and doc research, first drafts of research notes | DeepSeek V4.1 Flash and GLM 5.3 Flash (free) | Free | Free; 200k context is enough for research |
| **Research checker**: verifies research before anyone uses it | Muse Spark 1.3 (Hermes) | Go | A different model from the researchers; cheap |
| **Concierge**: answers your questions, Trello mirror | GLM 5.3 Flash (free) | Free | Reads small files; fallback GLM 5.3 Flash on Go |
| **Relief watchdog**: hourly check that the Chief is alive | GPT-6 Luna | Codex | Cheap hourly check |
| **Relief orchestrator**: runs the line while Claude rests | GPT-6.1 Sol | Codex | Launched by the watchdog only when needed |

## Lanes

| Lane | Brief by | Built by | Gatekeeper | Reviewed by |
|---|---|---|---|---|
| frontend | Sol | DeepSeek (or MiMo) | Luna | Sol |
| backend | Sonnet | DeepSeek (or MiMo) | Luna | Sonnet |
| heavy | Haiku | DeepSeek or MiMo (Gemini Argon for big-context tickets) | Luna | GLM 5.3 Flash |
| risky | Sonnet | DeepSeek | Luna | Sonnet, then Astra (both must approve) |
| chief | — | Opus (probes, specs, repo setup, dogfood) | — | Sol, when there is a PR |

## Escalation

| Attempts | Builder |
|---|---|
| 1–3 | DeepSeek, with the findings added to the brief (if the brief was the problem, its author fixes the brief first) |
| 4 | Gemini 4 Argon |
| 5 | The lane lead: Sonnet (backend, risky, heavy) or Sol (frontend), reviewed by the other plan's lead |
| after 5 | The Chief rewrites or splits the ticket |

## Rules
- **Context limits.** The free models have 200k tokens: research only, never a job that must read a large codebase. Big-context jobs go to Gemini 4 Argon.
- **No secrets to free models.** Free tiers may keep what you send. Research prompts contain no keys, tokens or private data.
- **A reviewer is never the model that built the work.** A lead reviewing work built from its own brief is fine: it wrote no code.
- **When a plan pauses:** Go paused → building stops, and leads and the Chief write the next briefs and specs. Claude paused → the Luna watchdog launches the Sol relief orchestrator; backend reviews wait, and frontend and heavy work carries on. Codex paused → frontend briefs and reviews go to Sonnet; Haiku does the gatekeeper checks.

## Resolved model ids (the Chief fills this in on shift 1)

| Name above | Provider instance id | Exact model id | Can run child tasks |
|---|---|---|---|
| | | | |
