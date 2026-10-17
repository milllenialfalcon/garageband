# Garageband build sprint

**Dates:** Friday 16 October to Friday 23 October 2026 (IST). **Goal:** build the Now and Next phases of the Garageband build plan, Track A and Track B in parallel, unattended, using the Claude, Codex and OpenCode Go plans as fully as is safe.

## Scope (54 tickets, seeded in `.factory/ledger.md`)

| Priority | Phases | Repo |
|---|---|---|
| 1 | A0 Prove the core · C1 Station contracts · B0 Fork foundation | Garageband · Garageband · Studio |
| 2 | A1 One-command setup · A2 Orchestrator skill | Garageband |
| 3 | C2 Line file · B1 Skills once · B2 Hermes provider | Garageband · Studio · Studio |
| 4–5 | B4 Live factory board · B6 Safety and cost | Studio |

Ticket files: `.factory/tickets/<id>.md`. Starting list: `sprint/tickets.src.mjs`. Later phases (A3, B3, B5, B7–B10) are out of scope; if everything above finishes early, the Chief plans A3 (pilot) as a spec only.

## Who runs what

| Thread | Model | Job | File |
|---|---|---|---|
| **Chief** | Claude · Opus 5.5 | Runs the line: dispatch, merges into sprint branches, ledger; writes specs and runs probes | `sprint/ORCHESTRATOR.md` |
| **Relief** | Codex · GPT-6 Luna (hourly watchdog) and GPT-6.1 Sol (only when needed) | Keeps the line moving while Claude's allowance is resting | `sprint/RELIEF.md` |
| **Concierge** | OpenCode (free) · GLM 5.3 Flash | Answers the founder's questions and ETAs; mirrors status to Trello. Read-only. | `sprint/CONCIERGE.md` |
| **Workers** | Through Hermes: DeepSeek V4.1 Flash and MiMo V2.6 Flash (Go); Kimi K3 (Go) and Gemini 4 Argon (Gemini AI Pro) for big-context and rescue builds | Build every ticket from a brief | brief in the task |
| **Leads** | Claude · Sonnet 5.5 (backend), Codex · GPT-6.1 Sol (frontend) | Write briefs for their lane and review the work; build only as a last resort | `sprint/TEAM.md` |
| **Support** | Claude Haiku (clerk), GPT-6 Luna (gatekeeper), GLM 5.3 Flash (heavy reviews), GPT-6 Astra (risky and final reviews), Gemini 4 Argon (screenshot checks), Muse Spark 1.3 (research checks), free DeepSeek and GLM (research) | See TEAM.md "Who does what" | `sprint/TEAM.md` |

## Repos and branches
- **Garageband** (`/workspace/garageband`, github.com/milllenialfalcon/Garageband): tickets branch from `sprint/track-a` and merge back into it.
- **Garageband Studio** (`/workspace/garageband-studio`, created by B0-01 as a private repo, not a GitHub fork): tickets branch from `sprint/track-b`. Upstream T3 Code at its latest stable tag lives on `upstream/stable`. There is no `main` until the founder makes one.
- **Factory state** (`/workspace/garageband/.factory`, branch `factory-state`): ledger, tickets, briefs, reports, handoffs, needs-you list, inbox and the Chief's task records for both repos.
- Ticket branches: `t/<id>-<slug>` (lowercase), for example `t/a1-01-doctor`.

## Founder pre-approvals for this sprint (given 16 Oct)
1. The Chief or the relief orchestrator may merge a ticket PR into `sprint/track-a` or `sprint/track-b` once a reviewer of a different model has posted `VERDICT: APPROVE` and CI is green, using `sprint/scripts/gb-merge.sh` only.
2. B0-01 may create the private repo `milllenialfalcon/garageband-studio` and register it in T3.
3. The Chief may launch the relief and concierge threads, schedule its own heartbeats, and launch ticket threads in either project.
4. Everything else in AGENTS.md "Founder Calls" still waits for the founder, as a needs-you item.

## Needs-you list (`.factory/needs-you.md`)
Never wait on the founder. When something needs him, add `- [ ] <date> <what> · default if no answer: <what we do meanwhile>` and keep working on everything else. The concierge shows the list and mirrors it to Trello. Items already known:
- App name for the fork (working name: Garageband Studio).
- Make Garageband Studio public, which gives unlimited free CI minutes (default: stays private, Windows builds manual only).
- Publish garageband-t3 to npm (at sprint end).
- Merge `sprint/track-a` into `main`, and create Studio's `main` from `sprint/track-b` (at sprint end).

## Quota pacing (all plans)
Read live numbers with `node sprint/scripts/gb-quota.mjs` once A0-06 lands; until then, use rate-limit errors and the founder's numbers below.

| Plan | Target | Hard stop | When paused |
|---|---|---|---|
| Claude ($20) | Briefs, reviews and coordination only; no building unless escalated | Weekly use 85% → only the Chief's light coordination; at 92% hand everything to Relief until the weekly reset | Relief runs the line; risky tickets wait |
| Codex ($20) | Sol: frontend briefs and reviews, relief orchestrator. Luna: gates and the watchdog, cheap. Astra: 2 risky reviews and the final review only. No building unless escalated | Weekly use 85% → frontend briefs and reviews move to Claude Sonnet, and gates to Haiku | Claude Sonnet writes frontend briefs and reviews |
| OpenCode Go ($10) | All building, through Hermes. DeepSeek, MiMo and GLM are very cheap; Kimi K3 costs more, so it's used only for rescue builds. About 10% of the monthly allowance per day (77% left on 16 Oct over 8 days); behind pace → run more DeepSeek and MiMo workers at once; ahead of pace → fewer | Monthly use 97% | Building moves to Gemini 4 Argon while AI Pro has room; otherwise it pauses and leads write the next briefs |
| Gemini AI Pro | Big-context builds, frontend screenshot checks, rescue builds; use it daily, since its limits reset daily | Its daily limit | Big-context tickets go to DeepSeek on Go; screenshot checks are skipped |
| OpenCode free (DeepSeek, GLM; 200k context) | Research, reader tests, the Concierge. No secrets in prompts | Rate limits | Research waits; the Concierge falls back to GLM on Go |

**Who spends what:** DeepSeek on OpenCode Go does all the building, so OpenCode Go carries most of the load. Claude and Codex spend only on short jobs: briefs, reviews, and the Chief's coordination. That keeps both subscriptions available for thinking.

Concurrency at most: Go 4 builders (DeepSeek, MiMo, Kimi) plus the GLM reviewer and the Muse Spark checker; Gemini 2 tasks; Claude 2 tasks (briefs, reviews, clerk work; the Chief's own turns also use Claude); Codex 2 (Sol briefs and reviews, Luna gates, Astra reviews); free models 2 research tasks plus the Concierge. A rate-limit error pauses that plan until the reset time in the error, then the line resumes by itself.

## Definition of done
A ticket is done when its PR is merged into its sprint branch (chief-lane tickets without a PR: when their output is written). The sprint is done when every priority 1–3 ticket is done or dropped with a reason, or at 23 October 22:00 IST, whichever comes first. Then the Chief writes `.factory/reports/sprint-final.md`, opens the PR from `sprint/track-a` to `main` for the founder, adds the needs-you item to create Studio's `main`, and stops its heartbeat.
