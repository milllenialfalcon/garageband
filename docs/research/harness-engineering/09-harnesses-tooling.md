# 09. Coding-agent harnesses, browser/MCP tooling, workflow and profile tools

Slice: README.md "Coding-Agent Harnesses" (233-246), "Browser, MCP & Tool Integration" (255-261), "Workflow, Profiles & Asset Management" (262-271).

Conventions:
- Clones are depth-1 under `ahe-study/src/<repo>/`. Paths like `hooks_src/x.js` below are relative to `src/<repo>/`.
- Garageband state was checked in the local repo `/home/claude/garageband` (HEAD 36e6503).
- "Inferred" marks anything read from file names or READMEs only, not from code.
- Nothing was executed. Licences come from the LICENSE file in each clone unless marked otherwise.

## Garageband baseline (for the status column)

- Skills: 37 in `skills/`, including `browser-qa` (Playwright, `with-server.mjs`, `shots.mjs`), `slop-gate`, `ship-gate`, `watch-after-ship`, `cost-watch`, `doubt-review`, `owner-pr-summary`, `model-router`, `dispatch-brief`, `factory-ledger`.
- Install: `install.sh` copies skills to `~/.agents/skills` (Codex, OpenCode) or `~/.claude/skills`. It is copy-only: no lock, pinning or per-host wiring.
- Claude hook: `hooks/guard.sh` on PreToolUse for Bash only. It blocks force push, direct push to main, `reset --hard`, `clean -f`, `branch -D`. Nothing covers Edit/Write.
- Merge: `sprint/scripts/gb-merge.sh` merges only sprint/* bases with green checks and a `VERDICT: APPROVE` comment. The verdict is a comment string, not a typed or fail-closed result.
- Missing: CI auto-fix loop (no pr-watch equivalent), failure circuit breaker, protected-file guard for Edit/Write, per-ticket allowed/forbidden paths, separate default-fail grader, run receipts per agent run, per-provider profile tuning, phone approval/notification.

---

## A. Coding-agent harnesses

### 1. deepagents (LangChain)
- **What:** Python agent harness on LangGraph with middleware for skills, subagents, filesystem, summarisation, permissions and HITL. "Opinionated, extensible, model-agnostic."
- **Key features:**
  - Skills middleware loads SKILL.md files with metadata (license, env requirements, allowed tools): `libs/deepagents/deepagents/middleware/skills.py`.
  - Per-provider and per-model profiles that tune the harness (e.g. `profiles/harness/_anthropic_opus_4_7.py`, `profiles/provider/_openai.py`).
  - Filesystem permissions via `FilesystemPermission` (`middleware/filesystem.py`, around line 367).
  - Hooks spec with trust gate: `libs/code/HOOKS.md`. Project hooks only load after workspace trust. Plugin hooks load on install. Exit code 2 denies PreToolUse. Matchers use wire tool names. `async: true` is rejected.
- **Mechanisms worth copying:** the trust gate for project-scoped hooks (`libs/code/HOOKS.md`, "Project workspace trust"). That is the missing piece for our box and project kit if a repo can ship hooks. Also the per-model profile layer.
- **Garageband status:** partly. We have skills and one hook. No per-model profile layer and no hook trust gate.
- **Destination:** Track B (per-provider profile and hook trust model). Reference only; too heavy to adopt.
- **Licence:** MIT.

### 2. SWE-agent
- **What:** Research coding agent from Princeton. The README says it is superseded by mini-swe-agent, which the authors now recommend.
- **Key features:**
  - Agent-computer interface as tool bundles: `tools/` holds edit, windowed edit, search, submit, review_on_submit_m, web_browser, filemap.
  - Behaviour set per run in YAML: `config/default.yaml`, `config/benchmarks/`.
  - `review_on_submit_m` runs a review step when the agent calls submit.
- **Mechanisms worth copying:** the review-on-submit gate idea (`tools/review_on_submit_m`). Our review station already exists, so this is only a confirmation.
- **Garageband status:** no tool-bundle concept. Not needed.
- **Destination:** reference only.
- **Licence:** MIT.

### 3. Citadel (SethGammon)
- **What:** "Operating layer" for Claude Code and Codex. Routes `/do`, keeps repo-local state, runs hooks, and ships about 50 skills. Pinned release v1.4.4 per README.
- **Key features:**
  - Hook set of 29 Claude Code events, documented in `docs/HOOKS.md`.
  - `hooks_src/protect-files.js`: blocks Edit/Write to protected paths, set in `harness.json` `protectedFiles`.
  - `hooks_src/external-action-gate.js`: invariant blocks on Bash (P-001, P-004) plus a consent gate with a first-encounter prompt.
  - `hooks_src/circuit-breaker.js`: after 3 consecutive tool failures it tells the agent to change approach. After 5 trips in a session it says stop and rethink. Also treats Bash commands over a hang threshold as failures.
  - `hooks_src/cost-tracker.js`: reads a campaign budget from frontmatter and warns at thresholds.
  - `hooks_src/instructions-watch.js`: watches AGENTS.md, CLAUDE.md and rules files for changes.
  - `skills/pr-watch/SKILL.md`: watches CI, reads failure logs, applies targeted fixes, then optionally merges.
  - `skills/qa/SKILL.md`: Playwright browser QA.
  - `skills/merge-review/SKILL.md`: fleet merge ordering and conflict detection.
- **Mechanisms worth copying:** `pr-watch` (CI auto-fix loop, which we lack), `circuit-breaker.js`, `protect-files.js`, `cost-tracker.js` budget-from-frontmatter.
- **Garageband status:** partly. `guard.sh` covers Bash only. No circuit breaker, no protect-files, no pr-watch, no cost cap per campaign (cost-watch is a skill, not a hook).
- **Destination:** pr-watch as a skill; circuit breaker and protect-files as Claude plugin hooks now, and as the Track B guard layer for all providers.
- **Licence:** MIT.
- **Caution:** Citadel writes its own state (`.planning/`, `.claude/harness.json`, its own telemetry) and has about 11,600 lines of docs. Cherry-pick the mechanisms. Do not install it alongside our ledger.

### 4. Harness Evolver (raphaelchristi)
- **What:** Claude Code plugin that evolves an LLM agent's prompts, routing and code using multi-proposer search. Based on Meta-Harness (arXiv 2603.28052, per README).
- **Key features:**
  - Proposers modify code in isolated git worktrees. Winners merge when gates pass.
  - LangSmith is the evaluation backend, with rubric LLM-as-judge.
  - Gates: constraint, efficiency, regression, Pareto, holdout, rate-limit abort, stagnation detection.
  - `hooks/session-start.sh` installs Python deps into a venv on session start.
  - `tools/iteration_gate.py`, `tools/update_config.py`.
- **Mechanisms worth copying:** the holdout and stagnation gates for any future prompt-tuning loop.
- **Garageband status:** no. We have no eval-driven optimisation loop.
- **Destination:** Track B learning loop, later. Needs a LangSmith account, which is an external dependency.
- **Licence:** MIT.

### 5. Ralph Wiggum technique (Geoffrey Huntley, article)
- **What:** Write-up, not a repo: `while :; do cat PROMPT.md | claude-code; done`. Single-task loops driven by a prompt file. Article dated 14 Jul 2025 (modified 19 Feb 2026 per WebFetch).
- **Key features (from WebFetch summary, not verbatim):**
  - File set: `specs/*`, `fix_plan.md` (regenerated often), `PROMPT.md`, `AGENT.md` (build and run notes the agent updates).
  - One task per loop, to protect the context window.
  - Backpressure: run tests for the changed unit, use types and static analysis, commit and tag on success.
  - Search before assuming a feature is missing.
  - Subagents for search and writing. Only one subagent should run build or test for Rust.
- **Mechanisms worth copying:** the "search before assuming missing" rule, and the single-task per ticket rule. Both fit our build prompts and dispatch brief.
- **Garageband status:** partly. Tickets are single-task and the Chief wakes hourly. The search-first rule and an `AGENT.md`-style build-notes file are not explicit.
- **Destination:** project kit (AGENTS.md rules and ticket template) and `dispatch-brief`.
- **Licence:** none stated for the article. Use the ideas, do not copy the text.

### 6. RailWarden (advaith-1212)
- **What:** Deterministic control plane for multi-agent work: frozen work-package contracts, dependency DAG, Git worktrees, validation evidence, integration gates.
- **Key features:**
  - Allowed and forbidden path checks per work package (`src/railwarden/runtime/workflow.py`).
  - Provider failure handling: events, checkpoints, handoff, reassignment or model swap (README).
  - Frozen contracts under `docs/contracts/`. Safety notes in `docs/safety.md`.
  - Skills loader: `src/railwarden/runtime/skills.py`. Hermes profile: `src/railwarden/hermes/profile.py`.
- **Mechanisms worth copying:** per-ticket allowed and forbidden paths, enforced mechanically before merge.
- **Garageband status:** partly. `gb-merge.sh` gates merges but does not enforce path boundaries per ticket.
- **Destination:** pre-push guard and ticket template in the project kit, and the Track B control plane.
- **Licence:** MIT.
- **Not opened:** `docs/safety.md`, `docs/contracts/`, and the runtime code beyond names.

### 7. OpenCode Agent Orchestration Kit (OAK, jcarlosrodicio)
- **What:** OpenCode-native team of specialised agents with explicit handoffs, bounded loops and mechanical contract validation.
- **Key features:**
  - Roles in `opencode/agents/`: scoper, researcher, specifier, designer, developer, debugger, evaluator, evolver, lead, reviewer, plus review_api, review_coordinator, review_quality, review_security, review_tests.
  - `/loop` refuses writes without an approved task contract. Max iterations, exclusive lock, contract hashing, idempotent action IDs (README).
  - `/autonomous` ends at an open PR through `oak deliver` (README).
  - Skills include `doubt-driven-development`, `verification-loop`, `oak-adversarial-review`, `oak-commit`, `oak-runtime-verification`.
  - Mechanical validation of agent, command and routing contracts: `typecheck/v2/`.
- **Mechanisms worth copying:** contract hashing on a loop (a changed contract stops the loop), and splitting review into security, tests, quality and API reviewers.
- **Garageband status:** partly. We have doubt-review and ship-gate. We have no contract hash and no split reviewers.
- **Destination:** skill (review split and loop contract). OpenCode is one of our providers, so the Track B constitution per provider applies.
- **Licence:** Apache-2.0.

### 8. LoopTroop (looptroop-ai)
- **What:** Local-first GUI for long coding work. LLM council plans, then Ralph-style bead loops run in isolated worktrees, then a verification pass hands off to main.
- **Key features (from README and file names; inferred for internals):**
  - Stages: interview, PRD, atomic beads, execution loops, final verification.
  - Per-model profile defaults: `shared/profileDefaults.ts`.
  - Git hook policy: `shared/gitHookPolicy.ts`, `server/git/hookPolicy.ts`, `server/git/hookDiscovery.ts`, `server/phases/executionSetup/hookValidation.ts`. Inferred: discovers the repo's git hooks and validates them before execution.
  - Live logs and artefact review inside the UI.
- **Mechanisms worth copying:** discovering and validating existing git hooks before an unattended run (inferred from file names). Council planning with a different model per stage.
- **Garageband status:** partly. We have a different-model reviewer rule. No council planning and no hook discovery.
- **Destination:** Track B (council planning, hook policy checks before unattended runs). Pre-push guard for the hook-validation idea.
- **Licence:** MIT.
- **Not opened:** the workflow phase code and hook policy code beyond names.

### 9. Agent AFK (griffinwork40)
- **What:** Headless coding-agent runtime with a daemon, Telegram surface, append-only traces and a behaviour predictor.
- **Key features:**
  - `afk trace show` prints an append-only receipt of tool calls, gate decisions, subagent lifecycles and cost (README).
  - `afk whatif` predicts behaviour shifts before a prompt or skill change (README).
  - `afk migrate` imports Claude Code and Codex plugins, skills and MCP servers, live-reading their directories (README).
  - Daemon plus Telegram for phone pings and approval. Background subagents with `mode:'background'`.
  - Built-in orchestrators: `/mint` (spec, research, plan, build, verify, ship), `/review`, `/diagnose`.
  - Dirs: `src/skills/`, `src/telegram/`, `src/improve/`, `docs/headless.md`, `docs/file-checkpoints.md`, `docs/background-processes.md`.
- **Mechanisms worth copying:** the append-only run receipt (`afk trace`), file checkpoints, and the Telegram notify and approve surface.
- **Garageband status:** partly. Trello mirror and factory ledger exist. No phone approval, no per-run receipt.
- **Destination:** Track B (phone approvals, audit log). Candidate for the notification piece.
- **Licence:** Apache-2.0.
- **Caution:** it is its own agent runtime and overlaps T3. Evaluate the trace and notify pieces only.

### 10. completely (23ag1)
- **What:** Claude Code plugin harness. "Done is earned, not asserted." Default-FAIL evaluator in the close path, deterministic write and close gates, Beads task spine.
- **Key features:**
  - Default-FAIL evaluator: a separate grader must pass work before it closes.
  - `cmpl lint`: no-stub and no-downscope contract.
  - Integration gate after each parallel batch. Orphan recovery.
  - Fresh `claude -p` worker per task (`cmpl auto`).
  - Skills: `plugin/skills/{plan,auto,control,init,completely}/SKILL.md`.
  - Incident log in `docs/DONE-IS-EARNED.md`.
- **Mechanisms worth copying:** the default-FAIL close gate and the no-stub lint. Both map to our ship-gate and slop-gate.
- **Garageband status:** partly. ship-gate, slop-gate and doubt-review exist. No default-FAIL grader that runs separately from the builder.
- **Destination:** skill (add a default-FAIL close step to ship-gate). Track B for the close gate.
- **Licence:** MIT.
- **Dependency:** requires Beads (`bd`). Do not adopt the plugin. Copy the concept.

### 11. forge-harness (chrono-meta)
- **What:** Meta-harness for Claude Code. Builds and checks rules, gates and memory for a project before they ship. arXiv 2609.04218 per README.
- **Key features:**
  - Pre-merge gate with a typed verdict: `PASS | PENDING | BLOCKED | ESCALATE`. A PASS counts only if the review actually ran (README).
  - `fh-gate` CLI: `npx --package @chrono-meta/fh-gate fh-gate` reviews the git diff. Also a GitHub Action, Homebrew tap and npm package.
  - Regression guard: a skill that drops its "Done When" section is blocked (demo gif in README).
  - `tracks/` memory per session, updated at session end.
  - Guard scripts: `scripts/destructive_pre_gate.sh`, `scripts/directional_diff_gate.sh`, `scripts/pipe_verdict_guard.sh`, `scripts/universal_guard_check.sh`.
- **Mechanisms worth copying:** the typed verdict that fails closed, and the regression guard for skill files.
- **Garageband status:** partly. slop-gate and ship-gate exist. No typed fail-closed verdict and no skill regression guard.
- **Destination:** CI quality gate in the project kit (adopt fh-gate). `gb-merge.sh` should require PASS, not a comment string.
- **Licence:** MIT.

---

## B. Browser, MCP and tool integration

### 12. browser-harness (browser-use)
- **What:** Lets Claude Code, Codex or Cursor drive the founder's real, logged-in Chrome over CDP.
- **Key features:**
  - Agent writes its own helpers in `agent-workspace/agent_helpers.py`, while `src/browser_harness/` stays protected.
  - MCP server `browser-harness-mcp` over stdio: `src/browser_harness/mcp_cli.py`, `src/mcp_server.py`, `docs/MCP.md`.
  - Recorder and video render: `recorder.py`, `video_render.py`.
  - Interaction notes for dialogs, uploads, downloads, shadow DOM, iframes, cookies, print to PDF: `interaction-skills/`.
  - Domain skills are off by default (`BH_DOMAIN_SKILLS=1`).
  - Claude plugin manifest: `.claude-plugin/plugin.json`.
- **Mechanisms worth copying:** the helper-in-workspace pattern and the interaction-skills library.
- **Garageband status:** partly. `browser-qa` uses Playwright with a local server. It cannot use a logged-in real browser.
- **Destination:** optional backend for `browser-qa` (logged-in and bot-protected flows). Track B browser QA.
- **Licence:** MIT.
- **Security:** it attaches to the founder's real Chrome with every signed-in session. Needs explicit founder consent per use. Keep Playwright for CI.

### 13. Uni-CLI (olo-dot-io)
- **What:** Universal CLI hub: one command interface to websites, desktop apps and MCP via YAML pipelines.
- **Key features (from README; not run):**
  - `unicli search`, `run`, `inspect`, `repair`.
  - `unicli mcp serve` auto-registers one MCP tool per adapter (README).
  - 8-phase self-repair loop: `skills/unicli-repair/`.
  - Per-call cost ledger, sensitive-path deny list (README).
  - Claims 134 sites and 711 YAML pipelines. Not counted.
- **Mechanisms worth copying:** the adapter-to-MCP generation and the sensitive-path deny list.
- **Garageband status:** no.
- **Destination:** Track B tool integration, or a research skill. Not core.
- **Licence:** Apache-2.0.

### 14. OpenAgentRelay (ShakespeareLabs)
- **What:** Exposes a local agent or automation as a keyed capability on a trusted LAN through a `relay` CLI.
- **Key features:** target verification, bounded conversations, JSON output, exit codes (README).
- **Caveats (README):** Alpha. Plain HTTP and a shared key. No TLS, no per-user permissions. Not for the public internet.
- **Garageband status:** no.
- **Destination:** none now. The Concierge idea could use it later, but the security gaps rule it out.
- **Licence:** Apache-2.0.

### 15. BrowserAct skills (browser-act/skills)
- **What:** Collection of site-specific automation skills (social listening, Trustpilot, X, Instagram, Threads, Reddit, Facebook Ads Library, WeChat) on the BrowserAct cloud or local browser control.
- **Key features:** anti-bot handling, multi-account isolation, human handoff (README).
- **Caveats:** the cloud product is paid. Several targets are social platforms, so check terms of service before any use.
- **Garageband status:** no.
- **Destination:** none for the product. Only relevant if we need market research scraping.
- **Licence:** MIT for the skills repo. The BrowserAct service is separate.

---

## C. Workflow, profiles and asset management

### 16. Bring Your AI MCP (unitedideas/bringyour-mcp)
- **What:** Public metadata repo for a hosted MCP endpoint that previews moves of agent-harness context between tools (Claude Code to Codex). The paid CLI runs locally.
- **Key features:** tools `preview_move`, `list_targets`, `quote_lifetime_license`, `start_checkout`, etc. Its `examples/mcp-config-migration/checklist.json` lists config differences (hooks, MCP, instruction files).
- **Mechanisms worth copying:** the migration checklist as a reference for mapping our hooks and MCP config to other providers.
- **Garageband status:** no.
- **Destination:** reference for Track B cross-provider mapping.
- **Licence:** "All rights reserved" in the LICENSE file. Do not adopt or copy code. The product is paid.

### 17. skills.sh (Vercel)
- **What:** Directory and leaderboard for agent skills. Install with `npx skills add <owner/repo>` (WebFetch showed the space missing; the CLI is `vercel-labs/skills`).
- **Key features (WebFetch, not verified):** about 20 supported runtimes including Claude Code, Codex, OpenCode and Cursor. Install-count leaderboard. Security audits section (contents not described).
- **Garageband status:** no.
- **Destination:** discovery only. Do not auto-install third-party skills until each is audited.
- **Licence:** per-skill licence not stated on the site. The CLI repo is vercel-labs/skills (licence not checked).

### 18. stelow (calionauta)
- **What:** Product-workflow skills: Shape Up shaping, adversarial plan critique, architecture alternatives, codebase critique, UX critique.
- **Key features:** `skills/stelow-workflow-plan-critique/references/auto-resolve-rules.md` (auto-resolve rules for critique findings), `checklists.md`, `output-format.md`. `stelow-workflow-shape-up` references. A `cymbal` CLI reference.
- **Mechanisms worth copying:** the auto-resolve rules for plan critique, and the shaping boundaries.
- **Garageband status:** partly. write-spec, architecture-plan, validate-idea, doubt-review and design-critique cover much of it.
- **Destination:** mine ideas into existing skills. Do not install.
- **Licence:** MIT.

### 19. Build A Harness (3IVIS, Aielia)
- **What:** Visual canvas for agent harnesses. Compiles a runtime-neutral FlowSpec to several frameworks. v0.8.0 public alpha per README.
- **Key features:** layer policy and recovery policy in `packages/harness/src/` (`layer-policy.ts`, `recovery-policy.ts`), verification gate nodes, `packages/aielia/src/tool-policy.ts`, ambiguity guard.
- **Garageband status:** no.
- **Destination:** Track B reference for a recovery-policy schema only.
- **Licence:** Apache-2.0. Alpha, so no adoption.

### 20. agent-harness (ar27111994)
- **What:** Lifecycle for coding-agent assets across hosts: `discover -> recommend -> mirror -> stage -> activate -> wire`.
- **Key features:**
  - Authority-ranked discovery with a recommendation policy per host: `discover/recommendation-policy/hosts/claude-code.json`, `codex.json`, `opencode.json`, `cursor.json`, `zed.json`, `copilot-vscode.json`, `pi.json`.
  - Pinned mirrors with bundle locks: `.agent-harness/mirror/bundles/*.lock.json`.
  - Quarantine for risky inputs: `.agent-harness/mirror/quarantine/`.
  - Preview and apply when wiring into a host. Does not install host plugins or run hooks silently (README).
- **Mechanisms worth copying:** pinned bundle locks and quarantine before activation. This is what our copy-only `install.sh` lacks.
- **Garageband status:** partly. `install.sh` copies to two folders and has an uninstall manifest. No lock, no quarantine, no per-host wiring.
- **Destination:** Track B "skills installed once for every provider". Strongest candidate to adopt rather than build.
- **Licence:** MIT.

### 21. codex-profiles (Ducksss)
- **What:** Native macOS menu-bar app and CLI for multiple Codex profiles, using `CODEX_HOME` isolation.
- **Key features:** isolates auth, config, sessions, connectors, plugins and logs per profile. Quota alerts and usage tracking (`macos/CodexProfilesMenu/`).
- **Mechanisms worth copying:** the per-profile `CODEX_HOME` isolation pattern for running several accounts on one box.
- **Garageband status:** no.
- **Destination:** Track B account and profile isolation per provider. Not adoptable on the Linux box.
- **Licence:** MIT.

### 22. AgentPlane (basilisk-labs)
- **What:** Git-native control plane: tasks, policy, verification evidence and closure state stored as reviewable repo artifacts.
- **Key features:**
  - Workflow and config JSON schemas: `packages/spec/schemas/workflow.schema.json`, `config.schema.json`, with examples.
  - Policy gateway and guards: `packages/agentplane/src/shared/policy-gateway.ts`, `shared/guards.ts`.
  - Closure and recovery skill: `skills/agentplane-task-closure-recovery/SKILL.md`.
  - Release and local-dev operator skills.
- **Mechanisms worth copying:** the workflow JSON schema to validate ticket frontmatter, and the closure-recovery procedure.
- **Garageband status:** partly. factory-ledger on a separate branch, ticket templates, gb-merge. No schema validation of ticket frontmatter.
- **Destination:** factory ledger and ticket template in the project kit. Track B audit.
- **Licence:** MIT.

---

## 1. Top 8 recommendations (ranked by value to Garageband)

1. **Add a pr-watch CI auto-fix loop before gb-merge.** Copy the pattern from Citadel `skills/pr-watch/SKILL.md` (MIT): read failing checks, fix, push, cap at 3 attempts (matches our escalation rule), then Needs You. Where: new skill plus a sprint script.
2. **Make the PR verdict typed and fail-closed.** Adopt fh-gate (forge-harness, MIT) in CI, and change `gb-merge.sh` to require PASS, not a `VERDICT: APPROVE` comment string. Where: project kit CI and `sprint/scripts/gb-merge.sh`.
3. **Widen the guard hook.** Add Citadel's protect-files (Edit/Write to ledger, guard and CI files) and circuit-breaker (3 failures: change approach; 5 trips: stop) to `hooks/hooks.json`. Where: Claude plugin now, Track B guard layer for all providers.
4. **Add a default-FAIL close step.** A grader that did not build the change must pass the evidence before ship-gate closes it (idea from completely, MIT, `docs/DONE-IS-EARNED.md`). Where: ship-gate skill.
5. **Replace copy-only installs with lock and quarantine.** Evaluate agent-harness (MIT) for pinned bundles and per-host wiring across Codex, OpenCode and Claude. Where: Track B skill installer.
6. **Per-ticket allowed and forbidden paths, enforced at pre-push.** From RailWarden (MIT) and the AgentPlane workflow schema for validating ticket frontmatter. Where: pre-push guard and ticket template.
7. **Trust gate for project-scoped hooks and per-provider profiles.** From deepagents `libs/code/HOOKS.md` and its profile layer. Needed before the Track B constitution is injected per provider. Where: Track B.
8. **Optional real-Chrome backend for browser-qa.** browser-harness (MIT) with its MCP server, for logged-in and bot-protected flows, with per-use founder consent. Where: browser-qa skill option.

## 2. "Use instead of building" (mature enough, licence checked)

| Project | Licence | Verdict | Why |
|---|---|---|---|
| fh-gate (forge-harness) | MIT | Adopt | npm package, GitHub Action, Homebrew tap, typed verdict. Fits item 2. |
| browser-harness | MIT | Adopt as optional tool | Real-Chrome control with MCP server. Needs consent per use. |
| agent-harness | MIT | Evaluate, then adopt if it covers Codex and OpenCode | Lock, quarantine and per-host wiring. Version and maturity not checked. |
| agent-afk (trace and notify only) | Apache-2.0 | Evaluate | Run receipts and Telegram approval. Do not adopt the whole runtime. |
| Uni-CLI | Apache-2.0 | Evaluate for research only | Claims not verified. |
| Citadel (pr-watch, protect-files, circuit-breaker) | MIT | Copy with attribution | Do not install the whole plugin; it owns its own state. |
| completely | MIT | Copy the concept | Needs Beads. |
| skills.sh | Per-skill, not stated | Discovery only | Audit each skill before install. |
| codex-profiles | MIT | Copy CODEX_HOME idea | macOS-only app. |
| Build A Harness, OpenAgentRelay, SWE-agent | Apache-2.0 / Apache-2.0 / MIT | Do not adopt | Alpha, no TLS, or superseded by mini-swe-agent. |
| bringyour-mcp | All rights reserved | Do not adopt | Paid product, no licence to copy. |
| BrowserAct skills | MIT (repo) | Do not adopt | Paid cloud service; social-platform scraping needs ToS review. |
| Ralph (article) | None stated | Ideas only | Copy the rules, not the text. |

## 3. What could not be opened or verified

- **skills.sh:** WebFetch of the homepage only. Install command rendered with a missing space. No API call, no audit contents, no per-skill licence check.
- **Ralph article:** read through a WebFetch summary, not verbatim. The date comes from the page metadata.
- **Citadel:** read README, docs index, hook table, skill frontmatter, and the circuit-breaker, cost-tracker, protect-files and external-action-gate headers. Did not read `pr-watch` or `qa` in full, and did not verify release v1.4.4.
- **deepagents:** README, HOOKS.md, skills middleware signatures and FilesystemPermission location only. Subagent and permission code paths not read.
- **LoopTroop:** README and file names only. Hook policy internals are inferred.
- **RailWarden:** README only. `docs/safety.md` and `docs/contracts/` not read.
- **OAK:** README, agent and skill file names. Loop and contract-hash behaviour taken from README, not code.
- **agent-afk:** README only. `trace` and `whatif` code not read.
- **completely, forge-harness:** README and file lists. fh-gate behaviour from README, not run. completely's default-FAIL claim is from README and `docs/DONE-IS-EARNED.md` was not opened.
- **harness-evolver:** README and hook script only. The evolve skill and gate tools not read.
- **SWE-agent:** README and config and tools folder names only.
- **browser-harness:** README, SKILL.md and MCP doc head. Not installed or run.
- **Uni-CLI, OpenAgentRelay, BrowserAct, bringyour-mcp, Build A Harness, stelow, agent-harness, codex-profiles, AgentPlane:** README level, plus file names where noted. No code read beyond what is cited.
- **Not run:** no code was executed, per the brief. No licence was verified beyond the LICENSE file header.
- **Outside slice, noted:** `Orkas` (multi-agent section) failed to clone (GitHub clone error). Not studied here.
