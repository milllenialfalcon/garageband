# Running Garageband in T3 Code

[T3 Code](https://github.com/pingdotgg/t3code) is a control panel for the coding tools already installed on your computer (Claude Code, Codex, OpenCode and others). It doesn't have its own skill system yet; each thread is run by one of those tools, so **Garageband is installed into the tools, and T3 Code is where you run and watch the work.**

## One-time setup

1. **Install the tools T3 Code will drive** and log in: `claude auth login`, `codex login`, `opencode auth login`.
2. **Install Garageband into them:**
   - Claude Code: `/plugin marketplace add milllenialfalcon/Garageband`, then `/plugin install garageband@garageband` (run once in a normal Claude Code session).
   - Codex and OpenCode: `curl -fsSL https://raw.githubusercontent.com/milllenialfalcon/Garageband/main/install.sh | bash`
3. **Check each tool sees it.** Start one thread per provider in T3 Code and ask: "Which Garageband skills can you see?" Each should list the 37 skills. If one doesn't, that tool isn't reading its skills folder through T3 Code; tell it to read `~/.agents/skills/garageband/SKILL.md` directly and report the issue.

## Per project

1. **Bootstrap** the repo once (in a Claude thread: "use the project-bootstrap skill"). It then runs **team-setup**, which asks which tool and model does which job and saves it in `TEAM.md`. You can also answer the same questions in T3 Code's terminal: `node scripts/gb-team.mjs --setup`.
2. **Add T3 Code project actions** (project settings → actions):

| Action | Command | When |
|---|---|---|
| Setup worktree | `bash scripts/gb-worktree-setup.sh && npm install` | Automatically when a new worktree is created |
| Test | `npm test` | On demand |
| Slop lint | `node scripts/slop-lint.mjs` | On demand |
| Factory pull | `git -C .factory pull --rebase` | On demand |
| Team | `node scripts/gb-team.mjs` | On demand: who builds and reviews each lane |

The **Setup worktree** action matters. T3 Code can start each thread in its own git worktree, a separate copy of the project folder. Without the action, that copy can't see the shared ledger in `.factory/`. The script links it in.

## Thread layout

`TEAM.md` decides the models. Run `node scripts/gb-team.mjs` (add it as a T3 project action called "Team") to see exactly which provider and model to pick for each thread. With a split team it looks like this:

| Thread | Provider · model (from TEAM.md) | Where it runs | Mode | First message |
|---|---|---|---|---|
| **Orchestrator** (one per project, long-lived) | orchestrator role, e.g. Claude · Opus | Main folder (local, no worktree) | Plan mode for specs; supervised | "Use the garageband skill. <your request>" |
| **Frontend ticket** (one per ticket) | frontend lane, e.g. Codex | New worktree | Full access | "Read .factory/briefs/T-013.md and follow it exactly." |
| **Backend ticket** (one per ticket) | backend lane, e.g. Claude · Sonnet | New worktree | Full access is fine: git and CI guards still apply | "Read .factory/briefs/T-012.md and follow it exactly." |
| **Heavy ticket** (one per ticket) | heavy lane, e.g. OpenCode · DeepSeek | New worktree | Full access | "Read .factory/briefs/T-014.md and follow it exactly." |
| **Reviewer** | the lane's reviewer (never the builder's model) | The PR branch's worktree | Supervised | "Use doubt-review on this branch against T-012. Don't read the author's notes." |
| **Checker** (reader tests, research checks, triage) | checker role | Main folder | Supervised | "Use verify-research on .factory/research/<file>." |

Every brief has a **Run in** line naming the provider and model, so you never have to remember the table.

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
- **Quota.** Roles on the same subscription share an allowance (`pool` in TEAM.md). If Opus orchestrates and Claude also builds backend, both spend the Claude plan; model-router shifts clear backend work to the heavy lane when it runs low.
- **Fresh threads beat long ones.** Start a new thread per ticket rather than reusing an old one; the brief carries all the context.
- **T3 Code is early software.** If a provider misbehaves inside T3 Code, run the same thread in that tool directly; Garageband works the same there.
