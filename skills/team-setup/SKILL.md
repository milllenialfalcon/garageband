---
name: team-setup
description: "Use when a Garageband project has no configured TEAM.md, when the founder wants to change which AI tool or model does which job, when a new model or subscription is added or dropped, or when routing keeps going wrong. Asks the founder how their models should be split (orchestrator, frontend, backend, heavy work, checker, researcher), who reviews each lane, and which roles share an allowance, then writes and checks TEAM.md so every other skill routes from it."
license: MIT
metadata:
  stack: garageband
  phase: setup
  verified: "2026-10-15"
---

# Team setup

Garageband works with any mix of AI tools. This is where the founder says which mix. Every routing decision later (slice-tickets, dispatch-brief, model-router, reviews) reads `TEAM.md`, so get it right once.

## When to run
- The garageband router runs this automatically if `TEAM.md` is missing or says `status: unconfigured`.
- Whenever the founder adds, drops or swaps a model or subscription.
- After a retro that shows a lane keeps failing on a model.

## 1. Check what's installed (don't ask what you can see)
Run `claude --version`, `codex --version`, `opencode --version` (and any other tool the founder mentions). Note which exist. Read the current `TEAM.md` if there is one.

## 2. Ask the founder (grill-founder style: one round, numbered, recommended answers)

```
Let's set up your team. Reply "yes" to accept all my recommendations, or change any number.

1. Starting point?
   a) Split team: one model orchestrates, Codex does frontend, Claude does backend,
      DeepSeek (via OpenCode) does heavy work   ← recommended for your tools
   b) Claude only   c) Something else (describe it)
2. Orchestrator (plans, writes specs and briefs, makes final calls): Claude · <strongest model>
3. Frontend (screens, components, styling): Codex · <model>
4. Backend (server logic, data, integrations): Claude · <model>
5. Heavy work (big but clear: scaffolding, test backfills, bulk fixes): OpenCode · <DeepSeek model>
6. Checker (reader tests, research checks, routine reviews): <small fast model on another tool>
7. Researcher (untrusted until checked): <free model>
8. Which of these share one subscription? (e.g. Opus and Claude backend both use the Claude plan)
9. Risky work (auth, payments, database structure, security) is built by the orchestrator and
   reviewed by a different strong model (<frontend model>). OK?
```

Ask for **exact model names as each tool shows them** (the founder can copy them from the tool's model picker). Leaving a model blank means "the tool's default".

## 3. Lanes and reviewers (decide, then show)
Recommended defaults, adjusted so **the reviewer is never the same model as the builder**:

| Lane | Built by | Reviewed by |
|---|---|---|
| frontend | frontend | backend (a different tool's model) |
| backend | backend | checker |
| heavy | heavy | checker |
| risky | orchestrator | frontend (strong model on a different tool) |

If two roles use the identical tool and model, pick a different reviewer.

## 4. Write and check
Either fill the frontmatter of `TEAM.md` directly (keep its body: lane rules and notes), setting `status: configured`, or run the same questions in a terminal: `node scripts/gb-team.mjs --setup`. Then:
```
node scripts/gb-team.mjs --check
node scripts/gb-team.mjs
```
`--check` must report 0 errors. Read the warnings to the founder in plain words, especially **shared allowances**: if the orchestrator shares a pool with a building lane, building work spends the orchestrator's thinking budget.

## 5. Confirm and record
Show the founder the routing table from `node scripts/gb-team.mjs` (who builds and reviews each lane, and which provider and model to open a thread with). Commit `TEAM.md` on a branch with a PR (changing it is a Taste decision; log it in the decision log). Also run `bash scripts/gb-worktree-setup.sh` guidance if the founder uses T3 Code (see the repo's T3 Code guide).

## 6. Prove each tool can see Garageband
For each tool in the team, start one session and ask: "Which Garageband skills can you see?" A tool that can't see them gets told to read `~/.agents/skills/garageband/SKILL.md` (Codex, OpenCode) or to install the plugin (Claude Code). Note any tool that fails in `TEAM.md` → Notes.

## Red flags
| Thought | Instead |
|---|---|
| "I'll just guess the models." | Ask; exact names matter because briefs tell the founder which model to open. |
| "Reviewer can be the same model, it's a different session." | Only if no other model exists. Otherwise always a different model. |
| "Heavy lane can take anything big." | Big *and clear*. Ambiguous work goes to backend or frontend; risky work never goes to heavy. |
