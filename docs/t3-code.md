# Running Garageband in T3 Code

[T3 Code](https://github.com/pingdotgg/t3code) is a control panel for the coding tools already installed on your computer (Claude Code, Codex, OpenCode and others). It doesn't have its own skill system yet; each thread is run by one of those tools, so **Garageband is installed into the tools, and T3 Code is where you run and watch the work.**

## One-time setup

1. **Install the tools T3 Code will drive** and log in: `claude auth login`, `codex login`, `opencode auth login`.
2. **Install Garageband into them:**
   - Claude Code: `/plugin marketplace add milllenialfalcon/Garageband`, then `/plugin install garageband@garageband` (run once in a normal Claude Code session).
   - Codex and OpenCode: `curl -fsSL https://raw.githubusercontent.com/milllenialfalcon/Garageband/main/install.sh | bash`
3. **Check each tool sees it.** Start one thread per provider in T3 Code and ask: "Which Garageband skills can you see?" Each should list the 36 skills. If one doesn't, that tool isn't reading its skills folder through T3 Code; tell it to read `~/.agents/skills/garageband/SKILL.md` directly and report the issue.

## Per project

1. **Bootstrap** the repo once (in a Claude thread: "use the project-bootstrap skill").
2. **Add T3 Code project actions** (project settings → actions):

| Action | Command | When |
|---|---|---|
| Setup worktree | `bash scripts/gb-worktree-setup.sh && npm install` | Automatically when a new worktree is created |
| Test | `npm test` | On demand |
| Slop lint | `node scripts/slop-lint.mjs` | On demand |
| Factory pull | `git -C .factory pull --rebase` | On demand |

The **Setup worktree** action matters. T3 Code can start each thread in its own git worktree, a separate copy of the project folder. Without the action, that copy can't see the shared ledger in `.factory/`. The script links it in.

## Thread layout

One thread per role. Pick the provider and model in T3 Code's model selector.

| Thread | Provider · model | Where it runs | Mode | First message |
|---|---|---|---|---|
| **Orchestrator** (one per project, long-lived) | Claude · Opus | Main folder (local, no worktree) | Plan mode for specs; supervised | "Use the garageband skill. <your request>" |
| **Backend ticket** (one per ticket) | OpenCode · DeepSeek | New worktree | Full access is fine: git and CI guards still apply | "Read .factory/briefs/T-012.md and follow it exactly. Use the tdd-slice skill." |
| **Frontend ticket** (one per ticket) | Codex · GPT | New worktree | Full access | "Read .factory/briefs/T-013.md and follow it exactly. Use ui-build-rules and tdd-slice." |
| **Reviewer** | A different provider from the author (e.g. Claude Haiku or Codex low) | The PR branch's worktree | Supervised | "Use doubt-review on this branch against T-012. Don't read the author's notes." |
| **Checker** (reader tests, research checks, triage) | Claude · Haiku or Codex low | Main folder | Supervised | "Use verify-research on .factory/research/<file>." |

## A ticket, start to finish

1. **Orchestrator thread:** idea → spec → plan → tickets → briefs. It claims each ticket in the ledger and tells you which thread to open for it.
2. **Open a ticket thread** with the provider named in the brief, in a new worktree. Paste the first message from the table. The worktree action links `.factory/`.
3. The implementer builds with tests and reports `DONE` with evidence.
4. **Review:** use T3 Code's diff view to see what changed, then open a reviewer thread on the same branch.
5. **Ship the branch:** use T3 Code's "Commit, Push & Create PR". GitHub fills the PR from Garageband's template. Ask the implementer for the founder summary (owner-pr-summary) and paste it in if the template is empty.
6. **You merge on GitHub** once CI is green and the summary makes sense. Agents never merge.
7. **Orchestrator thread:** "PR for T-012 is merged." It marks the ticket done and dispatches the next.

## Things to know

- **Guards by tool.** The git pre-push guard and CI protect every provider. The extra Claude Code safety hook only runs in Claude threads.
- **Quota.** Keep the Opus thread for thinking: specs, plans, briefs, risky reviews. Bulk building goes to OpenCode/DeepSeek threads (model-router).
- **Fresh threads beat long ones.** Start a new thread per ticket rather than reusing an old one; the brief carries all the context.
- **T3 Code is early software.** If a provider misbehaves inside T3 Code, run the same thread in that tool directly; Garageband works the same there.
