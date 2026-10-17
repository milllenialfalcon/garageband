# 01 · Course study: walkinglabs/learn-harness-engineering (+ two course entries)

Scope: the three repositories listed in `ahe/README.md` lines 44-49:

- A. `walkinglabs/learn-harness-engineering`, clone at commit `38ddcd2` (2026-10-01). Studied A to Z: all 14 English lectures and their `code/` files, all 8 English project handouts, the project starter/solution artifacts under `projects/`, the 4 harness-design pages, the English resources, `skills/harness-creator/`, `tools/audit-harness.sh`.
- B. `Phelan164/codex-howto`, clone at commit `74887e9` (2026-09-29). Read: README, `skills/engineering-loop/` (SKILL.md and all 4 references), `resources/engineering-loop-measurement.md`, `resources/orchestration-decision-matrix.md`, `examples/measurements/` (CSV plus incident smoke doc), `examples/hooks/`, `examples/agents/`, `examples/prompts/`, `knowledge/decisions/review-first-wiki.md`, `skills/maintain-codex-wiki/SKILL.md`, `modules/04` and `modules/10`, module titles.
- C. `hardness1020/awesome-agent-architecture`, clone at commit `c1d4f5c` (2026-09-22). Read: root README, English READMEs of sections 00-23 (full text for 00, 03, 04, 20, 21, 23; failure-mode lists and intros for the rest). Source files under `src/` were not read except where a README quotes them.

Clone roots (all under the scratchpad, cloned with `git clone --depth 1`):

- `LHE` = `/tmp/claude-0/-home-claude/80fb1f52-60ae-56e0-8a79-b145fdd1f249/scratchpad/ahe-study/src/learn-harness-engineering`
- `CH` = `/tmp/claude-0/-home-claude/80fb1f52-60ae-56e0-8a79-b145fdd1f249/scratchpad/ahe-study/src/codex-howto`
- `AAA` = `/tmp/claude-0/-home-claude/80fb1f52-60ae-56e0-8a79-b145fdd1f249/scratchpad/ahe-study/src/awesome-agent-architecture`

Paths in sections 1-3 are written relative to these three roots (for example `LHE/docs/en/lectures/...`). No code from the clones was run.

Reading conventions: "read" means the file was opened in this study. "Secondhand" means the course or repo cites an outside source that I did not open. "Illustrative" means the course itself labels the numbers as teaching examples.

---

## 1. Course map

### 1A. walkinglabs/learn-harness-engineering (LHE)

The course is a 14-lecture reading track plus 8 project handouts. Each lecture has `index.md` and `code/`. Projects 01-06 have starter and solution directories under `LHE/projects/`. Projects 07 and 08 are documentation only in the repo (no `projects/project-07` or `project-08` directories).

**L01. Strong models don't mean reliable execution.** `LHE/docs/en/lectures/lecture-01-why-capable-agents-still-fail/index.md`; `code/failure-signals-checklist.md`, `code/underspecified-task.md`, `code/failure-pattern-demo.ts` (demo not run).
- Five failure layers to attribute every failure to: task spec, context, environment, verification feedback, state management. Fix the layer before swapping the model.
- Defines "verification gap" (agent says done, is not) and "Definition of Done" as commands that can be run.
- Says a root `AGENTS.md` with stack, conventions and verification commands is the highest-return first step.
- Failure-signals checklist: a fresh session should understand what happened "in under five minutes".

**L02. What a harness actually is.** `.../lecture-02-what-a-harness-actually-is/index.md`; `code/harness-components.md`, `code/minimal-harness-loop.ts`.
- Five subsystems: instructions, tools, environment, state, feedback. Feedback is called the highest-ROI subsystem.
- "Controlled variable exclusion": remove one subsystem at a time to rank marginal value. The lecture warns this shows value, not the bottleneck; use failure attribution for that.
- The 20% to 100% success-rate staircase is labelled illustrative.

**L03. The repository as system of record.** `.../lecture-03-why-the-repository-must-become-the-system-of-record/index.md`; `code/repo-knowledge-layout.txt`, `code/system-of-record-checklist.md`, `code/repo-reader.ts`.
- "Knowledge visibility gap": facts that live outside the repo are invisible to the agent.
- Fresh-session test: a brand-new session, given only repo contents, must answer five questions (what is this, how is it organized, how do I run it, how do I verify it, where are we now).
- ACID analogy for agent state: atomic (commit only verified units), consistent (verification predicate), isolated (per-agent progress file or branch), durable (critical facts in git-tracked files).
- Put knowledge next to code (short doc per module directory); update docs in the same change.

**L04. Split instructions across files.** `.../lecture-04-why-one-giant-instruction-file-fails/index.md`; `code/AGENTS-short.md`, `code/anti-patterns.md`, `code/split-vs-monolithic.ts`.
- Entry file of 50-200 lines: overview, first-run commands, at most about 15 hard rules, links to topic docs with an applicability condition.
- Each instruction records its source, when it applies, and when it can expire. Audit and delete regularly.
- Hard rules belong at the top or bottom of a file (lost-in-the-middle, cited to Liu et al. 2023).
- Caveat written into the lecture: a cited ETH Zurich study (secondhand, not opened) reports repository context files did not generally help task success and raised inference cost by over 20%. Lulla et al. (secondhand) report efficiency gains only, not correctness.

**L05. Keeping context alive across sessions.** `.../lecture-05-why-long-running-tasks-lose-continuity/index.md`; `code/session-handoff.md`, `code/continuity-checklist.md`, `code/session-simulator.ts`.
- Compaction keeps "what" and loses "why"; reset plus artifacts keeps "why" if the artifacts hold it.
- Four tools: `PROGRESS.md` (done / in progress / next), `DECISIONS.md` (decision, reason, rejected alternative, constraint), git commits as checkpoints, clock-in and clock-out routines written into `AGENTS.md`.
- Teaching default: if a task needs more than 60% of the window, prepare a handoff.
- Metric named: rebuild cost (target under 3 minutes to an executable state). The 15-to-3-minute figure is illustrative.

**L06. Initialization needs its own phase.** `.../lecture-06-why-initialization-needs-its-own-phase/index.md`; `code/init.sh`, `code/initializer-output-checklist.md`, `code/init-check.ts`.
- First session does no feature code. Output: runnable environment, one passing example test, startup readiness checklist, ordered task list with acceptance commands, a clean git checkpoint.
- Four readiness conditions: can start, can test, can see progress, can pick the next step.
- Note: the `init.sh` in `code/` is a stub (`echo "[init] project-specific startup would go here"`).

**L07. Draw clear task boundaries (WIP = 1).** `.../lecture-07-why-agents-overreach-and-under-finish/index.md`; `code/next-task-template.md`, `code/scope-surface-example.md`, `code/scope-tracker.ts`.
- One task active at a time. Completion evidence is an executable check (example: `curl ... | jq .status == 201`).
- Scope surface: a DAG of work units with four states (not_started, active, blocked, passing).
- Verified completion rate VCR = verified tasks / activated tasks; block new activations while VCR is below 1.0.
- The "C/k reasoning budget" argument and the Steve McConnell scope-creep claim are rhetorical or secondhand; not checked.

**L08. Feature lists are harness primitives.** `.../lecture-08-why-feature-lists-are-harness-primitives/index.md`; `code/feature_list.json`, `code/feature-list-validator.ts`, `code/pass-gate-policy.md`.
- Each feature is a triple: behavior, verification command, state. The harness, not the agent, moves a feature to passing, and only after the command succeeds.
- Pass gate: a feature may go from `passes: false` to `passes: true` only when the workflow was exercised, evidence is recorded, no blocking error occurred on the tested path, and the app is not left broken.
- The prose describes four states; the example JSON uses a `passes` boolean. The validator checks shape and "passes without evidence" but does not enforce the gate. See section 3, "schema conflicts".

**L09. Agents declare victory too early.** `.../lecture-09-why-agents-declare-victory-too-early/index.md`; `code/clean-state-checklist.md`, `code/victory-detector.ts` (simulation).
- Three-layer termination: (1) lint and static checks, (2) runtime behavior (app starts, critical path runs), (3) system-level confirmation (end-to-end flow). Do not advance a layer that failed.
- Unit tests passing is not completion (mocks hide interface mismatches).
- Refactoring before core behavior is verified is banned until verification passes.
- Separate the worker from the checker; a nitpicky independent evaluator beats self-evaluation. Anthropic's 20-minute / $9 solo versus 6-hour / $200 harness comparison is secondhand and the lecture says it is not an equal-budget experiment.
- Agent-facing error messages must include repair steps.

**L10. Only a full pipeline run counts.** `.../lecture-10-why-end-to-end-testing-changes-results/index.md`; `code/architecture-rules.md`, `code/review-feedback-to-rule.md`, `code/e2e-runner.ts`.
- Unit-test blind spots: interface mismatch, state propagation, resource lifecycle, environment dependency.
- Architecture rules become executable checks. Example rule: renderer may not touch the filesystem; check is a grep for `require('fs')`.
- Review feedback promotion: a repeated review comment becomes a lint or import rule with remediation text.
- Error message template: what went wrong, WHY, FIX (with a file path and the call to use instead).
- The defect table (5 of 5 caught by E2E) is illustrative.

**L11. Observability inside the harness.** `.../lecture-11-why-observability-belongs-inside-the-harness/index.md`; `code/runtime-logger.ts`, `code/sprint-contract.md`, `code/evaluator-rubric.md`.
- Two layers: runtime observability (logs, traces, health: "what did the system do") and process observability (plans, contracts, rubrics: "why should this be accepted").
- Sprint contract, negotiated before coding: scope, verification standards, exclusions, done-means list.
- Rubric scored 1-5 on named dimensions with evidence (example dimensions: grounding, citation quality, functionality, product coherence).
- Anthropic's three-agent run table ($124.70, 3 h 50 min) is secondhand (the lecture attributes it to an updated Opus 4.6 harness). The lecture also reports the evaluator once talked itself out of real issues and was tuned by reading its logs.

**L12. Leave a clean state every session.** `.../lecture-12-why-every-session-must-leave-a-clean-state/index.md`; `code/cleanup-loop.md`, `code/benchmark-comparison-template.md`, `code/cleanup-scanner.ts`, `code/benchmark-runner.ts`.
- Session completion = verified task AND clean-state check: build passes, tests pass, feature list and progress updated, no debug code or temp artifacts, standard startup path works.
- Dual cleanup: immediate at session end, plus a periodic (weekly) sweep.
- Quality document: per-module grade A-D across dimensions, read by the next session to decide priorities.
- Monthly "harness simplification": disable one component, run a fixed benchmark, keep or delete.
- Merge philosophy under high agent throughput: merge when cost-to-fix is below cost-to-wait (OpenAI, secondhand). The lecture warns this is irresponsible at low throughput.
- The week-1-to-12 degradation table is illustrative.

**L13. Loop engineering.** `.../lecture-13-loop-engineering/index.md` (38 KB); `code/goal-template.md`, `code/maker-prompt.md`, `code/checker-prompt.md`, `code/loop-state-template.md`, `code/index.md`.
- `/goal` = goal + verification method + stop condition. Table of loop types: turn-based, goal-based, time-based (`/loop`), event-driven.
- Six primitives: automations, worktrees, skills, connectors, sub-agents (maker/checker split), external state (markdown on disk).
- Maker/checker separation is called the most important reliability guarantee. The lecture's phrase: "a model is its own output's best defense attorney".
- Karpathy `autoresearch` as the exemplar: a `program.md` written in English describes the methodology; the agent edits one file; every experiment runs a fixed 5-minute budget; keep-if-improved ratchet with `git reset`; results logged to `results.tsv`. The 2.02 h to 1.80 h nanochat figure is sourced to commits; I did not open them.
- Four silent costs: verification debt, comprehension rot, cognitive surrender, token blowout.
- Maturity ladder: L1 goal runner, L2 scheduled single task, L3 multi-agent maker/checker, L4 self-feeding loop, L5 fleet.
- Social-media quotes and the claim that Claude Code `/goal` uses an independent supervisor session are not verified.

**L14. From single loops to graph engineering.** `.../lecture-14-graph-engineering/index.md` (37 KB); `code/maker_checker_graph.py` (LangGraph skeleton, model calls stubbed); `code/index.md`.
- Four stacked layers: prompt, context, loop, graph. A graph is nodes, edges, shared state, routing rules.
- Verify node gets a fresh context and sees only the `code` in shared state, not the implementer's reasoning.
- Five criteria before drawing a graph: independent work units, branch or rollback paths, state worth checkpointing, verifiable nodes, coordination benefit above cost. Scale is not the criterion.
- Graph versus workflow: the difference is what a node is (agent versus deterministic function) and dynamic versus static routing.
- Single loops fail at scale through Goodhart, "blindness upward" (never questions the target), and conflict between loops. Remedy named: anchors (business outcomes, ground truth, human spot checks).
- Orchestration tax: human review attention is the one serial resource.
- Most of this lecture is commentary sourced from social posts, a fact-check blog and vendor pages; the fact-check numbers were not verified.

**Projects (`LHE/docs/en/projects/`, code under `LHE/projects/`).**

- **P01 Prompt-only vs rules-first** (`project-01-baseline-vs-minimal-harness/index.md`; `projects/project-01/starter` vs `solution`). Run protocol: two isolated directories, never both present, no git branches to separate runs (agents see sibling refs), reset feature statuses before the harness run. Metrics: completion, first successful launch, retries, missing items, premature stop.
- **P02 Agent-readable workspace** (`project-02`). Two sessions; expanded `ARCHITECTURE.md`, `PRODUCT.md`, `session-handoff.md` in the solution.
- **P03 Multi-session continuity** (`project-03`). One feature at a time; `init.sh`, `session-handoff.md`, `claude-progress.md`, `clean-state-checklist.md` in the solution.
- **P04 Runtime feedback** (`project-04`). Structured `logger.ts`, `scripts/check-architecture.sh` (grep-based boundary check), seeded chunking bug to fix.
- **P05 Role separation** (`project-05`). Three variants of the same feature (single-role, gen-eval, plan-gen-eval). Revision evidence recorded: initial 2.8/5, then 3.1, then 3.3 for the gen-eval run. One run per variant.
- **P06 Capstone** (`project-06`). Full app, AGENTS.md with layer boundaries and definition of done, `feature_list.json` (15 features, all `pass`), `clean-state-checklist.md` (about 30 items), `scripts/cleanup-scanner.sh`, `scripts/benchmark.sh`, `scripts/check-architecture.sh`. Its own `evaluator-rubric.md` gives 5.0/5 and `quality-document.md` grades every row A; the evaluator is the author. See section 3.
- **P07 Automated loop** (docs only). Three experiments: goal loop from `goal.md`, timer loop with `/loop`, maker-checker loop with `loop-state.md` for at least five rounds. Metrics table.
- **P08 Graph** (docs only). Draw the P07 loop as `graph.md` (nodes, edges, shared state, routing), add parallel fan-out and fan-in, add a rollback edge and a human-approval gate.

**Harness design pages (`LHE/docs/en/harness-designs/`).**
- `claude-code/index.md`: layered CLAUDE.md scopes (org, user, project, local), subdirectory CLAUDE.md loaded on demand, auto memory (first 200 lines or 25 KB), five-layer compaction and append-only `history.jsonl` (from a third-party source analysis of v2.1.88; the page warns it may be outdated), hooks `PreToolUse`, `PostToolUse`, `Stop`.
- `codex/index.md`: AGENTS.md as a roughly 100-line directory page, worktrees for isolation, send only environment deltas, subagents for context isolation.
- `pi/index.md`: minimal core, pluggable compaction strategy, session tree instead of forced summaries, skills loaded on demand for prompt-cache friendliness, let the agent edit its own harness.
- `deepseek/index.md`: plugin core, capability seams, "model-visible means logged", waterfall hooks, append-only logs. The page says the product was released as an August 2026 developer preview; not verified.

**Resources (`LHE/docs/en/resources/`).**
- `templates/`: `AGENTS.md`, `CLAUDE.md`, `claude-progress.md`, `clean-state-checklist.md`, `evaluator-rubric.md`, `feature_list.json` (with `status_legend`, `verification` array, `priority`, `area`, `user_visible_behavior`), `init.sh` (install, verify and start commands as arrays), `quality-document.md`, `session-handoff.md`.
- `reference/method-map.md`: table mapping failure modes to primary fix and supporting artifact (cold start, scope sprawl, premature completion, fragile startup, weak handoff, subjective review).
- `reference/coding-agent-startup-flow.md`: fixed nine-step start (pwd, progress, feature list, git log -5, init, baseline smoke, fix baseline first, pick one feature, work only on it).
- `reference/initializer-agent-playbook.md`, `reference/prompt-calibration.md`.
- `openai-advanced/repo-template/`: `AGENTS.md` as a routing map with a "Working contract" and "Definition of Done"; `docs/PLANS.md` (when a plan is required, active and completed folders, tech-debt tracker); `docs/QUALITY_SCORE.md` (domain and layer grades with verification, legibility, stability columns, benchmark snapshots table); `docs/RELIABILITY.md`, `SECURITY.md`, `FRONTEND.md`.
- `openai-advanced/sops/`: `chrome-devtools-validation-loop.md` (before/after DOM, console and screenshot evidence per UI step), `layered-domain-architecture.md`, `encode-knowledge-into-repo.md`, `observability-feedback-loop.md`.

**Skills and tools.**
- `LHE/skills/harness-creator/` (SKILL.md, plus `SKILL.md.en` and `SKILL.md.uk`): create, audit and report on harnesses. Scripts: `create-harness.mjs`, `validate-harness.mjs` (scores five subsystems, 0-5 each, from keyword presence in files), `run-benchmark.mjs`, `render-assessment-html.mjs`. Seven reference patterns and 15 gotchas (`references/gotchas.md`). Templates: `agents.md`, `feature-list.json`, `feature-list.schema.json`, `init.sh` (detects npm/pnpm/yarn/bun, python, go, cargo, maven, gradle, dotnet), `progress.md`, `session-handoff.md`.
- `LHE/tools/audit-harness.sh` (543 lines, no Node dependency): CRITICAL and RECOMMENDED checks for L03-L12, each failing check prints a fix sentence. Several checks assume formats no course artifact uses (see section 3).

### 1B. Phelan164/codex-howto (CH)

A Codex-focused engineering guide with installable skills and measured runs. Latest release in the README: v0.6.0; content checked against Codex docs on 2026-07-31.

**Entry points.** `CH/README.md`; decision table: fix one bounded defect (testing and review module), deliver a multi-surface feature (`engineering-loop`), split a large task (orchestration matrix), preserve team know-how (living wiki).

**Modules (`CH/modules/`).** 00 mental model; 01 sandbox and approvals; 02 CLI and surfaces; 03 prompts and plans; 04 AGENTS.md; 05 engineering skills; 06 MCP and tools; 07 testing and review; 08 subagents; 09 orchestration; 10 context and token efficiency; 11 automation, plugins and hooks; 12 troubleshooting; 13 living Codex wiki. Read in full: 04 and 10 only.

**Flagship skill (`CH/skills/engineering-loop/`).**
- `SKILL.md`: baseline first (read AGENTS.md, record done conditions, inspect working tree, trace callers, run the smallest baseline that separates pre-existing failures), then reproduce, add a failing regression test first where practical, one bounded change, classify failures as product, test, environment, assumption or external blocker, run affected consumer checks, review the full diff for contract compliance before quality, fix, rerun.
- `references/loop-contract.md`: task contract fields (goal, user-visible behavior, in scope, out of scope, planned paths, constraints, acceptance criteria, baseline command and result, focused verification, required broader checks, external side effects, judge command, success predicate, optional budgets). Progress ledger fields. Failure classification table. Verification ladder (reproduction, focused test, integration, lint and type, build, critical E2E, combined diff review). Two-pass review gate. Stop decision: continue, blocked, or partial.
- `references/loop-policy.md`: define the judge before building; one causal variable per iteration; "repeating an unchanged command against unchanged code is not an iteration; it is a retry"; stop after two identical failures and reclassify; resumable checkpoint with confirmed facts, failed hypotheses, last judge result, budget used, next evidence-producing action.
- `references/independent-review.md`: a reviewer packet with requested behavior, base and reviewed revision, diff, commands already run, known unverified checks. Keep the builder's conversation and self-review out of the packet. Reviewer is read-only. Builder dispositions each finding as confirmed, rejected with evidence, duplicate or unresolved. Record the reviewed revision; any new edit makes the verdict stale.
- `references/hard-debugging.md`, `references/evidence-example.md`: not read in full.

**Measurement (`CH/resources/engineering-loop-measurement.md`, `CH/examples/measurements/`).**
- Protocol: three variants (no skill, full v0.2.0, lean current) on fresh copies of one commit; rotate variant order; write the hypothesis first; choose one primary quality measure; measure quality before efficiency; record model, reasoning effort, starting commit, tool profile and skill version.
- Metric list: accepted, evidence_complete, regression_before_fix, focused_checks_passed, required_checks_passed, actionable_findings, false_positives, retries, iterations_to_green, first_judge_passed, human_corrections, files_read, files_changed, unexpected_files_changed, scope_expansions, human_checkpoints, elapsed_seconds, total_tokens, total_cost_usd, context_noise_lines.
- Raw data: `engineering-loop-runs.csv`, 6 runs total (3 variants on 2 tasks, one run each). Published result: skills did not reduce tokens on the small backend task (no skill 390,144 tokens was cheapest); on the 2048 game task the lean skill used 380,767 tokens versus 828,446 for no-skill. The protocol itself says one run is not reliability.
- Incident smoke (2026-08-11): qualifies a benchmark before using it: both single and orchestrated methods solved it; the doc is explicit it is "harness qualification, not an efficiency result".

**Orchestration (`CH/resources/orchestration-decision-matrix.md`).** Eight situations mapped to topologies (one agent for small edits; explorer then implementer when exploration output is a dependency; parallel read-only fan-out for review lenses over an immutable diff; sequential contract-first when frontend and backend share an unsettled contract; partitioned parallel with exclusive paths and frozen interfaces; sequential when two tasks touch the same central file; test worker returns a concise summary; production deployment stays human-gated). Seven decision questions; "if answers 2, 4, or 5 are unclear, prefer a sequential plan".

**Hooks, agents, prompts (`CH/examples/`).**
- `hooks/model-routing/routing.yaml`: subagent routing with tiers (easy, medium, difficult), `reviewer_minimum_tier: medium`, `max_escalations_per_task: 1`, `unavailable_model: inherit`, `log_decisions: true`. Marked experimental.
- `hooks/validate-on-stop/hooks.json`: a `Stop` hook runs the repo's validator at end of turn.
- `agents/reviewer.toml`: read-only sandbox, "lead with actionable findings ordered by severity... omit style preferences", no code edits, no remote comments. `explorer.toml`, `test-runner.toml` similar.
- `prompts/scheduled-docs-drift.md`: a recurring read-only check; "run it manually once before scheduling"; "report only claims that can be verified"; "unavailable sources are reported as unavailable, not guessed".
- `templates/measured-task-receipt.md`, `engineering-handoff.md`, `orchestration-run-receipt.md`, `dependency-aware-tickets.md`, `engineering-spec.md`, `edition-manifest.md`.

**Living wiki (`CH/knowledge/`, `CH/skills/maintain-codex-wiki/`).** Review-first Markdown wiki. Decision record `knowledge/decisions/review-first-wiki.md`: committed source registry, deterministic lint, pull-request review, no database or embeddings until measurement shows Markdown search fails. Safeguards: official docs authoritative; community sources are hypotheses; query is read-only by default; capture, ingest, archive and promotion are explicit operations; chat prose and model output are not evidence; scheduled maintenance may report or draft, never merge. Operations: query, capture, ingest, archive, lint, promote.

### 1C. hardness1020/awesome-agent-architecture (AAA)

"Learn how modern AI agents are built around the LLM." 24 sections (`AAA/sections/00-harness-thesis` to `23-evaluation`), each with a README (English plus four translations) and a `src/` with runnable Python demos. Each section uses a four-part lens (opening, mechanism, failure modes, runnable). Companion repos named: learn-agent-memory, learn-deepseek-harness, EvalGrill.

- **00 Harness thesis.** The model decides; the harness gives tools, state, limits. "More harness is not better": every layer has a maintenance cost and a model-generation tie; re-evaluate each layer on model change. Compares Claude Code with mini-swe-agent (about 150 lines total harness).
- **01 Agent loop.** Call model, run tools, append results, repeat. Failure modes: no stop condition, context overflow, partial tool failure must still return a tool result, lost pairs.
- **02 Tool runtime.** Unknown tool name returns an error result; schema drift; unsafe parallelism (default serial); catalog overflow (defer full schemas); oversized results persist to disk and return a preview and a path; overlapping tool descriptions.
- **03 Permission and sandbox** (read in full). Pure `decide()` returns allow, ask or deny from tool, mode and rules; plan mode denies edits until approved; gate runs in dispatch before execution; denials return as tool results. Failure modes include string deny-lists being bypassed by shell variants (parse the command structure instead), gating the route not just the destination (drop-and-rebuild), default-open egress, approval fatigue, silent denial inside subagents, exfiltration across individually approved calls, poisoned memory.
- **04 Hooks** (read in full). `PreToolUse` can block or rewrite arguments; `PostToolUse` observes. Hooks can tighten permission results but must not loosen them. Waterfall dispatch in deepseek-harness: each hook can decide or call `next()`. Example: lint on write, diagnostics appended to the tool result. Failure modes: stop hook that loops (track that it is already active), hook config changing mid-session (snapshot at start), slow hooks (timeouts), flooding diagnostics (check only the changed file, cap output).
- **05 Planning and todos.** Keep one item in progress; skip todos for trivial work; plan-mode enter and exit must be validated; flat todo lists disappear with context.
- **06 Subagents.** Child summaries lose detail (ask children to write findings to disk); recursion needs a depth limit or no `Agent` tool in child registries; each child gets its own turn and token limit; children still pass the permission gate; track background children as task records.
- **07 Skills.** Trigger-shaped descriptions; keep the catalog small; skill bodies lost after compaction; path traversal (scope reads to the skills directory); forked skills lose live context; third-party skills are untrusted instructions.
- **08 Context management.** Persist large results before stubbing; compaction retry cap; do not split tool_use from tool_result; freeze stub strings to protect cache prefix.
- **09 Memory.** Do not save what grep, git or source can answer; stale memory needs age metadata; cap injected memories; consolidate duplicates; extraction near run end; poisoned memory is untrusted.
- **10 System prompt.** Volatile text late in the prompt; generate tool text from the live enabled set; one resolver for prompt overrides.
- **11 Error recovery.** Bound each recovery path; respect retry-after; stop when one reactive compaction fails; surface failure after recovery is exhausted; detect "stuck without an error" by fingerprinting repeated tool-plus-args.
- **12 Task system.** Disk-backed tasks; claim races (lock the claim); dependency cycles; orphaned in-progress tasks cleared on worker exit; skip bad records safely.
- **13 Background execution.** Detect interactive prompts that stall a background command; route completions through one queue; after a timeout, query state before retrying (idempotency key); batched notifications need numbering; concurrency limits.
- **14 Scheduling.** Double-fire guard (track last fired minute); deterministic jitter; durable local schedules only survive restart; validate cron on create; "let the prompt decide what is worth sending" to avoid heartbeat alert fatigue.
- **15 Worktree isolation.** Validate slugs before path joins; keep dirty worktrees on remove; context-local cwd for concurrent subagents; sweep only known ephemeral worktrees; tell forked children to re-read files.
- **16 Coordination.** Lock read-modify-write on inboxes; queue messages rather than blocking sends; bubble permission requests to the lead; send a packet to other agents (task, acceptance criteria, confirmed facts, artifact paths).
- **17 Protocols.** Request then confirm handshake instead of hard kill; timeouts for pending requests; check reply type matches request type; duplicate replies are no-ops; lock "first winner" in fan-out stops.
- **18 Autonomy.** Claim inside a file lock; check shutdown before regular messages; skip tasks with unresolved dependencies; reclaim a task when its progress file has gone stale ("undetected stall").
- **19 MCP, plugins, channels.** Namespacing against name collisions; tool-list bloat; stale tool pool after mid-session connect; reconnect and re-auth; `readOnlyHint` is over-trusted; description poisoning.
- **20 Observability** (read in full). Fire-and-forget event emitter that never raises; buffer until a sink attaches; sampling; allowlist scrubbing (only `SAFE_FIELDS` leave); per-model cost rollup; failure modes: telemetry on the hot path, sensitive data in logs, flat stream with no trace or parent id, cost drift hidden by session totals, eval set drift from production.
- **21 Loop engineering** (read in full). Four nested loops: agent, verification, event, improvement. Verification loop code `verified_run(task, worker, checker, budget)` with feedback into retry and escalation when the budget is spent; checker is a fresh-context agent; rubric fixed outside the loop. Verdict split into outcome, process and quality. Maturity: L1 report, L2 assisted, L3 unattended; promote one level at a time. Where to put a learned lesson: fact in a doc, behavior in prompt or skill, procedure in a program, weights last. Change contract for self-editing harness: failing traces and frequency, root cause, intended improvement, undo plan; no contract, no patch; editable region declared; gates outside it. Online run records evidence only; separate offline learner validates and releases. Compiled workflow: capture, parameterize, validate before and after each step, replay, invalidate on the first failed check.
- **22 Graph engineering.** Model as router is costly and variable; probability read as proof; agent-writable evidence can change a gate; thresholds fitted once and never refit; over-graphing; checking node with no FAIL edge.
- **23 Evaluation** (read in full). Environment with reset (deep copy of the initial state per episode), atomic tools, logged calls with legality flag. Simulated user releases one fact per turn. Grade: outcome checks on final state, must-say checks on transcript, veto items with zero tolerance. Metrics: pass@k (can it), pass^k (is it reliable, for regression gates), best@k for graded scales. Worked numbers: at 60% single-run success, pass@5 is about 99% and pass^5 about 8%. Judge rules: rubric items self-contained and weighted with vetoes; judges prefer longer answers and the first candidate; use a different model family and swap order; calibrate on a gold set. Noise band: standard error about sqrt(p(1-p)/n), so 70% on 100 tasks is about 4.6 points; repeat 3-5 runs and report the spread. Dataset rules: verifiable, tiered, human-checked, contamination defended (canary strings, withheld answers, parameterized templates).

---

## 2. Concrete mechanisms worth copying

Quoted briefly, with source path. These are the items that are literal artifacts, not commentary.

**M1. Definition of Done as a list of commands.** `LHE/docs/en/lectures/lecture-01-.../index.md`: "Completion criteria: New endpoint GET /api/search?q=xxx; Supports pagination...; All new code passes pytest; Type checking passes (mypy --strict)".

**M2. Entry file as router, with rules that carry source, applicability and expiry.** `LHE/docs/en/lectures/lecture-04-.../index.md` (Instruction architecture) and `LHE/docs/en/resources/openai-advanced/repo-template/AGENTS.md` (Routing Map, Working Contract, End Of Session). The second is the most complete AGENTS.md shape in the course.

**M3. Clock-in and clock-out routines in the instruction file.** `LHE/docs/en/lectures/lecture-05-.../index.md`: "At session start: read PROGRESS.md; read DECISIONS.md; run make check; continue from Next Steps. Before session end: update PROGRESS.md; run make check; commit".

**M4. Handoff with three fixed headings.** `LHE/docs/en/lectures/lecture-05-.../code/session-handoff.md`: "Completed / Broken or Unverified / Next Best Step". Richer version: `LHE/skills/harness-creator/templates/session-handoff.md` (Current objective, verification evidence table with check, command, result, notes, next session startup, recommended next step).

**M5. Fresh-session test.** `LHE/docs/en/lectures/lecture-03-.../index.md`: five questions with a mapping of each question to the file that should answer it.

**M6. Feature object with state gate.** `LHE/docs/en/lectures/lecture-08-.../code/feature_list.json` (entry with `verification` array of steps) and `LHE/docs/en/lectures/lecture-08-.../code/pass-gate-policy.md` ("A feature may only move from passes: false to passes: true when: the expected workflow has been exercised; the evidence of success is recorded; no blocking error...").

**M7. Feature object with status legend and rules.** `LHE/docs/en/resources/templates/feature_list.json`: `rules` block (`single_active_feature`, `passing_requires_evidence`, `do_not_skip_verification`) and `status_legend` (not_started, in_progress, blocked, passing).

**M8. Verification-command runner that discovers the stack.** `LHE/skills/harness-creator/templates/init.sh`: detects package manager from lockfile, runs `check`, `lint`, `test`, `build` only if the script exists; python path runs pytest with exit code 5 (no tests) treated as pass for fresh projects.

**M9. Architecture boundary check as a shell script.** `LHE/projects/project-06/solution/scripts/check-architecture.sh` (greps renderer for `fs|path|os|child_process` imports, services for `electron` imports and `ipcMain|BrowserWindow`, services and main for `react` imports; prints PASS or VIOLATION and exits non-zero). Also `LHE/projects/project-04/solution/scripts/check-architecture.sh`.

**M10. Agent-facing failure message: WHAT, WHY, FIX.** `LHE/docs/en/lectures/lecture-10-.../index.md`: "ERROR: Found direct import of 'fs' in src/renderer/App.tsx:12 / WHY: Renderer process has no access to Node.js APIs for security / FIX: Move file operations to src/preload/file-ops.ts and call via window.api.readFile()".

**M11. Sprint contract.** `LHE/docs/en/lectures/lecture-11-.../code/sprint-contract.md` (Sprint goal; Done means: user asks, app answers, at least one citation shown, clicking citation opens source). Full form: `LHE/projects/project-05/solution/plan-gen-eval/sprint-contract.md` (scope in/out, roles, ten numbered acceptance criteria, verification plan, sprint log).

**M12. Evaluator rubric with 1-5 dimensions and evidence.** `LHE/docs/en/lectures/lecture-11-.../code/evaluator-rubric.md`. Stronger anchored form (A-D per dimension with observable conditions): `LHE/docs/en/lectures/lecture-11-.../index.md` rubric table ("All tests pass / Main flow passes / Partial pass / Build fails").

**M13. Checker prompt with mandatory output fields.** `LHE/docs/en/lectures/lecture-13-.../code/checker-prompt.md`: "Your goal is to find problems, not say nice things... Not finding problems is your failure"; each issue needs description, file and line, evidence, severity; closing verdict is Pass, Fail or Minor issues acceptable.

**M14. Goal template with commands, hands-off list and stop conditions.** `LHE/docs/en/lectures/lecture-13-.../code/goal-template.md`: acceptance criteria as shell commands (`npm test`, `npm run lint`, `npx tsc --noEmit`, coverage threshold); "Hands off" list (entry file, schema migrations, dependency versions, CI config); stop conditions: max 20 turns, no progress for 3 consecutive rounds, blocking issue needing human action; "If stuck for more than 2 rounds, switch approach or simplify".

**M15. Loop state file with round log and blocker list.** `LHE/docs/en/lectures/lecture-13-.../code/loop-state-template.md` (per-round: what the maker did, verification result, issues, next plan, human intervention needed; cumulative stats table; blocker list).

**M16. Ratchet loop with fixed budget and keep-or-revert.** `LHE/docs/en/lectures/lecture-13-.../index.md`, section "The Nine-Step Ratchet Loop" (read program, survey state, hypothesis, modify, snapshot commit, run with fixed 5-minute wall clock, evaluate, keep or `git reset HEAD~1`, log to results.tsv).

**M17. Session-exit checklist.** `LHE/docs/en/lectures/lecture-12-.../index.md` section 1: build passes, tests pass, feature list updated, no debug code (console.log, debugger, TODO), standard startup path available.

**M18. Quality grade per module.** `LHE/docs/en/lectures/lecture-12-.../index.md` section 3 (Verification passing, Agent understandable, Test stability, Architecture boundaries, Code conventions, each with a grade). Repo template: `LHE/docs/en/resources/openai-advanced/repo-template/docs/QUALITY_SCORE.md`.

**M19. Plan lifecycle.** `LHE/docs/en/resources/openai-advanced/repo-template/docs/PLANS.md`: create a plan when work spans sessions, multiple subsystems, or has rollout risk; active and completed folders; tech-debt tracker; "One active plan should have one clearly owned current step".

**M20. Chrome DevTools validation loop (UI).** `LHE/docs/en/resources/openai-advanced/sops/chrome-devtools-validation-loop.md`: BEFORE snapshot (DOM, console, screenshot), trigger exactly one path, record runtime events, AFTER snapshot, re-run the same path and compare evidence; clean criteria include "console noise is understood or cleared" and "rerunning gives the same result".

**M21. Harness scoring rubric (five subsystems).** `LHE/skills/harness-creator/scripts/lib/harness-utils.mjs` `scoreHarness()`: each subsystem has five keyword or structure checks, score = max(1, round(passed/5 * 5)); bottleneck = lowest subsystem unless all are 5. Caveat: presence checks, not behavior; see section 3.

**M22. Gotchas that are real engineering rules.** `LHE/skills/harness-creator/references/gotchas.md`: #5 classify concurrency per call, not per tool; #6 permission evaluation must not cache results; #8 "Fork children must not fork" (enforce single-level delegation); #9 invalidate caches at every mutation point; #10 trust gate at hook dispatch, not per hook; #11 two-phase eviction (clean disk at terminal state, memory after parent is notified); #12 front-load trigger words in skill descriptions (about 150 characters); #13 "default permission is allow" unless configured, override for sensitive tools (`defaultPermission: 'ask'`); #15 sweep orphaned topic files.

**M23. Engineering loop SKILL.md.** `CH/skills/engineering-loop/SKILL.md`: "Establish the baseline" (5 steps), "Run the loop" (9 steps incl. failing regression test first, classify failures, review full diff first for task-contract compliance then code quality), stop conditions ("After two identical failures, stop blind retries and reclassify"; "Never make a failing check pass by weakening assertions, deleting coverage, hiding errors, or silently changing acceptance criteria"; no production query, deploy, migrate, merge or publish without explicit authorization).

**M24. Loop contract field list.** `CH/skills/engineering-loop/references/loop-contract.md` (task contract block with goal, in scope, out of scope, planned paths, constraints, acceptance, baseline command and result, focused verification, required broader checks, side effects, judge command, success predicate, budgets; plan-change procedure with five steps).

**M25. Verification ladder.** `CH/skills/engineering-loop/references/loop-contract.md`: reproduction, focused unit or component, affected integration or contract, lint and type, build, critical E2E or browser, final combined-diff review. "Moving up the ladder does not replace a failed lower-level check."

**M26. Reviewer packet.** `CH/skills/engineering-loop/references/independent-review.md`: packet fields (requested behavior, applicable repo instructions, base revision, reviewed revision, diff and source access, commands already run with actual outcomes, known unverified checks, review scope and budget). "Keep the builder's conversation, self-review, proposed verdict, and preferred conclusions out of the packet."

**M27. Loop checkpoint.** `CH/skills/engineering-loop/references/loop-policy.md` "Resumable checkpoint": confirmed facts; failed hypotheses (do not retry without new evidence); last judge command and result; current diff or checkpoint; budget used and remaining; next evidence-producing action.

**M28. Measurement CSV schema.** `CH/examples/measurements/engineering-loop-runs.csv`: header `task_id,variant,run_id,model,reasoning_effort,starting_commit,tool_profile,skill_version,accepted,evidence_complete,regression_before_fix,focused_checks_passed,required_checks_passed,actionable_findings,false_positives,retries,human_corrections,elapsed_seconds,total_tokens,total_cost_usd,context_noise_lines,notes`.

**M29. Reviewer subagent definition.** `CH/examples/agents/reviewer.toml`: `sandbox_mode = "read-only"`; developer instructions "Lead with actionable findings ordered by severity... include a tight location, failing scenario, impact, evidence, and fix direction... Do not modify code or post remote comments."

**M30. Routing policy with escalation cap.** `CH/examples/hooks/model-routing/routing.yaml`: tiers easy, medium, difficult; `reviewer_minimum_tier: medium`; `max_escalations_per_task: 1`; `unavailable_model: inherit`; `log_decisions: true`.

**M31. Read-only scheduled check.** `CH/examples/prompts/scheduled-docs-drift.md` (quoted in 1B).

**M32. Review-first knowledge rules.** `CH/knowledge/decisions/review-first-wiki.md` "Safeguards" list (quoted in 1B).

**M33. Orchestration decision questions.** `CH/resources/orchestration-decision-matrix.md`: "Can each write worker own an exclusive path? Is the interface between workers already stable?... If answers 2, 4, or 5 are unclear, prefer a sequential plan."

**M34. Proportionality rule for multi-agent.** `CH/modules/10-context-and-token-efficiency/README.md`: "Multi-agent work usually consumes more total tokens than a comparable single-agent run. Use it to reduce elapsed time, isolate noisy investigation, or improve specialist coverage—not as a token-saving shortcut."

**M35. Verified-run loop.** `AAA/sections/21-loop-engineering/README.md` code block `verified_run(task, worker, checker, budget=2)`: attempt loop bounded by `range(budget)`, separate checker verdict per attempt, verdict reason fed into next prompt, returns `{ok: False}` as escalation signal.

**M36. Verdict split.** `AAA/sections/21-loop-engineering/README.md` "New: the verification loop": outcome (state left behind, checked by code), process (tool calls followed rules), quality (rubric with the failing line named). "Outcome passed and process failed means the run got lucky. Process passed and outcome failed means the rules are wrong."

**M37. Change contract for a self-editing harness.** `AAA/sections/21-loop-engineering/README.md` "Editing the harness": four items (which traces failed and how often, root cause, what the change should improve, how to undo it); "No contract, no patch"; code the loop may edit is declared up front; permissions, budgets and gates sit outside that region.

**M38. Where to put a lesson.** `AAA/sections/21-loop-engineering/README.md` "Routing a learned change": fact to knowledge doc; repeated behavior to prompt or skill; procedure to program; weights last. Gates for prompt edits: write from repeated failure, say when it applies, check on near cases and a holdout set, ship to part of traffic first, keep rollback ready.

**M39. Online run versus offline learner.** `AAA/sections/21-loop-engineering/README.md` "Online run, offline learner": "The online loop runs the task and records what happened. It does not draw lessons, promote skills, or edit the prompt." Read two numbers: updating health and benefit.

**M40. Compiled workflow lifecycle.** `AAA/sections/21-loop-engineering/README.md` "From tool user to tool creator": capture, parameterize, validate on reset, replay, invalidate on one failed check.

**M41. Permission gate function.** `AAA/sections/03-permission-sandbox/README.md` `decide(tool, mode, allow_rules) -> allow | ask | deny`; default ask; `ACCEPT_EDITS` pre-approves a class; `approver` defaults to False.

**M42. Pre and post hooks in dispatch.** `AAA/sections/04-hooks/README.md`: `PreToolUse` runs before the permission gate and can block or rewrite; `PostToolUse` runs after a successful tool call. "Hooks can tighten the permission result, but they should not loosen it."

**M43. Pass@k and pass^k.** `AAA/sections/23-evaluation/README.md` "Metrics: what k runs are for": pass@k for "can it", pass^k for "is it reliable" (regression gate); the 60%-to-99% and 8% example.

**M44. Noise band.** `AAA/sections/23-evaluation/README.md` "Reading a difference": standard error sqrt(p(1-p)/n); "Two builds, 100 tasks, 70 percent against 73 percent. That is not a result."

**M45. Veto and must-say checks.** `AAA/sections/23-evaluation/README.md` `grade(task, run)`: outcome checks on final state; must-say checks on transcript; veto items zero tolerance ("refunding an order the customer never named, printing a secret, mailing an outsider").

**M46. Telemetry never raises, scrubs by allowlist.** `AAA/sections/20-observability/README.md` `emit()` / `_deliver()`: buffer until sink attaches; sample; `scrub(meta)` keeps only `SAFE_FIELDS`; one bad sink cannot stop the loop.

**M47. Stall detection by progress file age.** `AAA/sections/18-autonomy/README.md` failure mode "Undetected stall": watch when the worker's progress file was last written, then take the task back.

**M48. Repeated tool-plus-args fingerprint.** `AAA/sections/11-error-recovery/README.md` failure mode "Stuck without an error": a call that keeps repeating raises no error, so count repeated fingerprints and stop.

**M49. Heartbeat that stays quiet.** `AAA/sections/14-scheduling/README.md`: "Let the prompt decide what is worth sending and stay silent otherwise"; deterministic jitter for recurring tasks.

**M50. Model-visible means logged.** `LHE/docs/en/harness-designs/deepseek/index.md` ("Designs Worth Adopting" 3). Close in spirit to the trace requirements in `AAA/sections/20-observability/README.md`, though that section does not use this exact phrase. Use as an audit-log rule.

---

## 3. Mapping to Garageband

Garageband status is judged from `CONTEXT.md` only. I did not open the Garageband repo. "Yes" means `CONTEXT.md` names an equivalent; "partly" means a related item is named but the specific mechanism is not; "no" means nothing in `CONTEXT.md` matches. Change types: NEW SKILL, SKILL/AGENTS.md change, SPRINT TICKET, TRACK B (fork feature).

| # | Idea (source) | Garageband status | Change type | Specific recommendation |
|---|---|---|---|---|
| 1 | Attribute each failure to a harness layer; keep a failure log (LHE L01, L02; CH loop-contract failure classes) | Partly: "escalation after 3 failed attempts"; no failure attribution named | SKILL change (build, review) and ledger field | Add `failure_class` (product, test, environment, assumption, external blocker) to ledger rows; after two identical failures, stop and reclassify; never weaken tests. |
| 2 | Controlled-variable ablation; monthly removal of one harness component (LHE L02, L12; AAA 00) | No | SPRINT TICKET | Monthly ticket: disable one guard, hook or skill on a fixed task slice, keep or delete on measured result. |
| 3 | Repo as system of record; fresh-session test with five questions (LHE L03) | Yes/partly: factory ledger on separate branch, handoff templates | SKILL change (hand off, maintain) | Add the five-question fresh-session check as a gate in the `hand off` station; run once per project repo. |
| 4 | Entry-file routing; each rule carries source, applicability, expiry (LHE L04; openai repo-template AGENTS) | Partly: AGENTS constitution exists; metadata per rule not named | AGENTS.md change | Require a `why / applies when / remove when` line per rule; prune in `maintain`. Do not add rules without a before-after check (ETH caveat, secondhand). |
| 5 | Handoff with Completed / Broken or Unverified / Next Best Step; DECISIONS log (LHE L05; harness-creator session-handoff) | Yes for handoff templates; partly for decision log | SKILL change (hand off) | Add a Decisions section (decision, reason, rejected alternative, constraint) and a Broken-or-Unverified section to the handoff template. |
| 6 | Initializer phase: runnable env, one example test, readiness checklist, ordered tasks (LHE L06, P03; reference/initializer-agent-playbook) | Partly: `setup` and `validate` stations | SKILL change (setup) | `bootstrap` check that fails fast before any sprint wake; checklist of can start, can test, can see progress, can pick next step. |
| 7 | WIP = 1 and verified completion rate, block new activations below 1.0 (LHE L07, audit L07) | Partly: Chief delegates per lane; WIP limit not named | SPRINT TICKET + TRACK B | Cap in-flight tickets per lane (start with 1); report VCR in the factory board; block dispatch when VCR is below 1 in the lane. |
| 8 | Feature as triple (behavior, verification command, state); only the verifier flips to passing (LHE L08) | Partly: tickets, briefs, acceptance criteria exist | TRACK B + SKILL change | One tickets schema with a `verify` command field; agents can request a verify, not set the status. See schema conflict below. |
| 9 | Three-layer termination; do not advance a failed layer (LHE L09; audit L09) | Partly: CI quality gates, slop-lint, pre-push guard | SKILL change (review, test) | Write the layer order into the Definition of Done in the ticket template; layers: static, runtime, end-to-end. |
| 10 | Worker and checker separated; never self-grade (LHE L09, L13; CH independent-review; AAA 21) | Yes: reviews by a different model | Keep; SKILL change (review) | Add packet hygiene: reviewer gets diff, requirements, commands run, known gaps; not the builder's reasoning; record reviewed commit SHA; re-review the delta after fixes. |
| 11 | Builder dispositions each finding: confirmed, rejected with evidence, duplicate, unresolved (CH independent-review) | No (not named) | SKILL change (build, review) | Ledger field per finding with disposition; a finding is closed only with evidence. |
| 12 | Actionable failure messages: WHAT, WHY, FIX (LHE L09, L10; audit) | No (not named) | SKILL change (slop-lint, pre-push guard, CI) | Every block message in guard, slop-lint and CI prints a FIX line with the exact command or file. |
| 13 | Architecture rules as executable grep checks; review feedback promoted to rule (LHE L10, P04, P06 check-architecture.sh) | Partly: slop-lint, CI gates | SKILL change (project kit) | Add `scripts/check-boundaries.sh` template to the project kit; each recurring review comment gets a rule within the same week (learn station). |
| 14 | Sprint contract before coding (scope, done-means, exclusions) (LHE L11, P05 sprint-contract) | Partly: ticket and brief templates | SKILL change (ticket template) | Add "Done means" and "Exclusions" sections to the brief template; reference the contract in the handoff. |
| 15 | Anchored rubric with evidence; the course's own P06 rubric self-scored 5.0/5 (LHE L11, P06) | Partly: slop-lint is a rubric of checks | SKILL change (review) | Keep reviewer scoring anchored and evidence-cited; do not let the builder fill the rubric. Treat any self-scored rubric as a smell. |
| 16 | Session exit: clean-state checklist (build, tests, progress, no debug artifacts, startup path); idempotent scanner (LHE L12; P06 cleanup-scanner) | Partly: pre-push guard, CI | NEW SKILL (or SKILL change to ship/hand off) | One clean-state checklist file in the project kit and an idempotent check script; a session is not complete until it passes. |
| 17 | Quality grade per module (A-D), read by next session (LHE L12; openai QUALITY_SCORE) | No | SKILL change (measure, maintain) | Quality file per repo with module grades and last benchmark snapshot; `maintain` picks the lowest grade first. |
| 18 | Plan lifecycle and tech-debt tracker (openai PLANS.md) | Partly: ledger; plan folder not named | SKILL change (spec, choose next) | Active and completed plan folders plus a tech-debt file; a plan is required when a change spans sessions or more than one subsystem. |
| 19 | Goal loop: acceptance as commands, hands-off list, max turns, no-progress rounds (LHE L13 goal-template; CH loop-policy) | Partly: "escalation after 3 failed attempts" | SKILL change (build) + TRACK B | Add to each long ticket: judge command, success predicate, hands-off paths, max rounds, max no-progress rounds (default 3). |
| 20 | Loop state file with round log and blocker list (LHE L13 loop-state-template; P07) | Partly: factory ledger | SPRINT TICKET | For unattended sprints, one `loop-state.md` per ticket with round, action, verdict, human-needed flag. |
| 21 | Maker-checker prompt templates with mandatory output fields (LHE L13 maker-prompt, checker-prompt) | Partly: reviewer roles exist | SKILL change (review) | Adopt the checker output format (issue, file and line, evidence, severity, verdict) as the review skill's output contract. |
| 22 | Ratchet: keep a change only if the judge improves; otherwise revert (LHE L13 autoresearch) | No | TRACK B (learning loop) | For skill edits: keep only if the held-out score improves, log every attempt to `results.tsv`-style ledger. |
| 23 | Four silent costs: verification debt, comprehension rot, cognitive surrender, token blowout (LHE L13) | No | SKILL change (measure) | Add to the weekly digest: share of tickets accepted without human reading, unexpected files changed, context noise, tokens per ticket. |
| 24 | Maturity levels L1 report, L2 assisted, L3 unattended, promote one step at a time (LHE L13 ladder; AAA 21) | Partly: unattended sprint exists, levels not named | SKILL change (TEAM.md) | Write a maturity level per lane in TEAM.md; promote only after a stated number of clean runs at the current level. |
| 25 | Graph: nodes, edges, shared state, routing; verify node with fresh context; failure edges (LHE L14; AAA 22; CH orchestration matrix) | Partly: station pipeline; Track B "factory board by station" | TRACK B + SKILL change | Write `graph.md` for the station pipeline with explicit FAIL edges (verify to build; missing info to spec); checkpoint state after each station. |
| 26 | Five criteria before a graph is drawn (LHE L14) | No | SKILL change (architect) | Add the five criteria as a check in the architect station; a task scoring below three criteria gets a script, not a graph. |
| 27 | Anchors: pin loops to real outcomes; Goodhart checks (LHE L14) | No | SPRINT TICKET | Add one outcome metric per product (not a factory metric) to the measure station; compare it against factory pass rate monthly. |
| 28 | Orchestration tax: review attention is the serial resource (LHE L14; CH orchestration matrix) | Partly: Concierge; "needs-you queue" in Track B | TRACK B | Needs-you queue sorted by review cost; cap concurrent unreviewed PRs. |
| 29 | Orchestration decision matrix: sequential when two tasks touch the same file; partition with exclusive paths (CH orchestration-decision-matrix) | Partly: Chief delegates | SKILL change (slice, hand off) | Slicer marks any two tickets sharing a file as sequential; each worker owns exclusive paths. |
| 30 | Subagent proportionality: multi-agent costs more tokens (CH module 10) | Partly (inferred from lanes and "one bounded unit per worker"; not stated in CONTEXT.md) | SKILL change (TEAM.md) | Record the rule: multi-worker only for independent units or review coverage; measure tokens per ticket against single-agent baseline. |
| 31 | Routing tiers with reviewer minimum tier, escalation cap of 1, decisions logged (CH routing.yaml) | Partly: TEAM.md says which model builds and reviews each lane | SKILL change (TEAM.md) + TRACK B | Add escalation cap (1 per ticket), reviewer minimum tier, and log every routing decision. |
| 32 | Measurement protocol and CSV schema; quality before efficiency; repeats (CH measurement) | Partly: measure station, factory ledger | NEW SKILL or SKILL change (measure) | Adopt the CSV columns for the ledger; add `unexpected_files_changed`, `scope_expansions`, `human_corrections`, `context_noise_lines`. Report accepted rate before tokens. |
| 33 | Qualify a benchmark before using it (CH incident smoke; AAA 23 dataset rules) | No | SKILL change (measure) | Before any new eval set: check it is solvable by at least two methods and the checker is hardened. |
| 34 | Noise band and pass^k for regression gates (AAA 23) | No | SKILL change (measure) | Report pass^k over 3-5 runs for skill changes; no claimed gain inside sqrt(p(1-p)/n). |
| 35 | Judge bias: different model family, swap order, gold-set calibration (AAA 23) | Partly: reviews by a different model | SKILL change (review, measure) | Calibrate the reviewer on 10-20 labelled past tickets before trusting its verdicts; swap order when comparing two candidates. |
| 36 | Veto items and must-say checks in acceptance (AAA 23) | Partly: guard hook, guard layer named in Track B | SKILL change (ticket) + TRACK B | Add veto list to ticket template: secrets, out-of-scope paths, production touch, external send. |
| 37 | Online run records evidence only; offline learner promotes changes (AAA 21; CH review-first wiki) | Partly: learn station; no separation stated | SKILL change (learn) | Workers append evidence only; `learn` runs offline, validates on holdout, and proposes edits as reviewable diffs. |
| 38 | Change contract for any self-edit: failed traces, root cause, intended change, undo plan; declared editable region (AAA 21) | No | SKILL change (learn, maintain) | No skill or AGENTS.md edit without a contract file; guard and hook files are outside the editable region. |
| 39 | Where a lesson lands: fact to doc, behavior to skill, procedure to program, weights last (AAA 21) | Partly: Garageband has skills and AGENTS.md | SKILL change (learn) | Add this ladder as a rule in the learn skill, with the default "smallest place that can hold it". |
| 40 | Compile repeated successful runs into a checked program (AAA 21 PreAct-style) | No | TRACK B (later) | Only after a repeated task class exists; capture, parameterize, validate before and after each step, invalidate on first failure. |
| 41 | Permission gate: pure allow, ask, deny; default ask (AAA 03; harness-creator gotcha 13) | Partly: Claude Code guard hook | TRACK B (guard layer) | Guard layer with a pure decision function, default ask for destructive actions, and no caching of permission results between calls. |
| 42 | Parse commands, do not string-match; gate the route not only the destination (AAA 03) | No | TRACK B | Guard parses shell structure (flags, `-exec`, redirects) and checks each program; a deny-list of strings is not sufficient. |
| 43 | Egress off by default for workers (AAA 03) | No | TRACK B | Workers get no network egress except an allowlist via proxy. |
| 44 | Pre and post tool hooks; stop-hook re-entry guard; hook timeouts; snapshot hook config (AAA 04) | Partly: Claude Code guard hook, validate on stop | TRACK B + SKILL change | Hook runner with timeout, re-entry flag on Stop, config snapshot at session start, capped diagnostics. |
| 45 | Single-level delegation; children must not fork (harness-creator gotcha 8; AAA 06) | Partly: Chief, Relief, Concierge roles | SKILL change (TEAM.md) + TRACK B | Enforce in the orchestration tool registry that workers cannot call delegate_task; give each child a turn and token limit. |
| 46 | Spend caps, per-task cost, live and on exit (AAA 20; CH routing) | Track B names spend caps | TRACK B | Per-ticket and per-provider caps; cost attributed to ticket, not only to session. |
| 47 | Trace id and parent id on every event; allowlist scrubbing; emit never raises (AAA 20) | Partly: factory ledger, audit log in Track B | TRACK B | Audit log with trace and parent ids; allowlisted fields only so prompts and code do not leak into the board. |
| 48 | Stall detection by progress timestamp; reclaim a task (AAA 18) | Partly: hourly Chief wake, Relief orchestrator | SPRINT TICKET + TRACK B | Store last-progress time per ticket; Chief reclaims tickets with no progress for N cycles. |
| 49 | Repeated-fingerprint stop (AAA 11) | Partly: "escalation after 3 failed attempts" | TRACK B | Fingerprint tool plus arguments; third identical call stops the run and escalates. |
| 50 | Heartbeat stays quiet unless there is news; jitter off the hour (AAA 14; tool guidance) | Partly: hourly Chief wake | SPRINT TICKET | Move the hourly wake off minute zero; send the Chief summary only when something changed. |
| 51 | Claim race: lock claim path; skip blocked tasks; orphan cleanup (AAA 12, 18) | Partly: Trello board mirror; claim semantics not named | TRACK B | Atomic claim in the ledger; skip tickets with unresolved dependencies; clear claims on worker exit. |
| 52 | Interactive prompt stall in background command (AAA 13) | No | TRACK B | Detect prompt-like output in worker logs and kill or rerun non-interactively. |
| 53 | Explicit handshake for shutdown and approvals (AAA 17) | Partly: phone approvals, needs-you queue (Track B) | TRACK B | Approval request and confirm pair; reply type must match request type; duplicate replies are no-ops. |
| 54 | Send a packet to other agents: task, criteria, confirmed facts, artifact paths (AAA 16) | Partly: handoff templates | SKILL change (hand off) | Inter-agent message format uses the four packet fields. |
| 55 | Tool-list bloat and description poisoning; MCP namespacing (AAA 19; AAA 07 third-party skills) | No (not named) | SKILL change (skill catalog) + TRACK B | Audit the installed skill catalog size and descriptions; treat third-party skills as untrusted instructions; scope tool lists per lane. |
| 56 | Front-load trigger words in skill descriptions; keep catalog small (harness-creator gotcha 12; AAA 07) | Unknown: 37 skills named | SKILL change (skill library) | Check each skill description: trigger words in the first 150 characters; retire overlapping skills. |
| 57 | Model-visible means logged (LHE deepseek page; AAA 20) | No | TRACK B | Every prompt and tool result that the model saw is written to the audit log. |
| 58 | Pluggable compaction; session tree (LHE pi page) | No | TRACK B (later) | Only if long-running workers are added; not needed for current CLI-based roles. |
| 59 | Worktree hygiene: keep dirty trees; sweep only ephemeral (AAA 15) | Unknown: worktrees named in Track B | SKILL change | Never remove a dirty worktree; sweep only worktrees the factory created and recorded. |

**Schema conflicts found inside the course (Garageband should pick one).**

Five different feature-list shapes appear across the course artifacts. I checked each file for the key names:

- `LHE/docs/en/lectures/lecture-08-.../code/feature_list.json`: `id`, `category`, `description`, `verification` (array), `passes` (boolean).
- `LHE/projects/project-06/solution/feature_list.json`: `id`, `name`, `description`, `status` (`"pass"`), `evidence`, `testedAt`. No verification command.
- `LHE/skills/harness-creator/templates/feature-list.json`: `id`, `name`, `description`, `dependencies`, `status` (`not-started`, `in-progress`, `blocked`, `done`), `evidence`. No verification field.
- `LHE/docs/en/resources/templates/feature_list.json`: `id`, `priority`, `area`, `title`, `user_visible_behavior`, `status` (`not_started`, `in_progress`, `blocked`, `passing`), `verification` (array).
- Prose in lecture 8: `behavior`, `verification`, `state` (`not_started`, `active`, `blocked`, `passing`).

`LHE/tools/audit-harness.sh` L08 checks for `"behavior"`, `"verification"` and `"state"` keys, and L07 counts `"state":"active"` and `"state":"passing"`. None of the example files above has all three keys, so the course's own capstone would fail its own audit (inferred from key counts, not run). The audit's L09 check also expects `layers` entries with `label`, `cmd` and `repair`, and a `scripts/verify-feature.sh`; no course artifact contains either (checked with grep).

Implication: pick one schema (recommend the one with `verify` as a command string, `status` in four values, `evidence` as a path to a log, and `dependencies`), and make the validator and audit match it before adopting any of the course's checks.

**Other course-internal problems to avoid copying.**

- P06 capstone grades itself 5.0/5 and all quality rows A, with "Evaluator: Automated + Manual Review" written by the same author. This is the exact self-grading failure lecture 9 warns about.
- Lecture 8 says the agent cannot set `passing`, but nothing in the example validator or harness enforces it; the validator only reports.
- The audit script header says it checks "all five harness subsystems (L03-L12)" but the course has 14 lectures; L13 and L14 have no audit checks.
- `validate-harness.mjs` scores by keyword presence (for example, the word "test" in AGENTS.md scores the test-command check). It cannot tell whether a command works. Use it as a smoke test only.
- Most numbers in the lectures are either illustrative (labelled as such) or secondhand. The strongest measured data in the three repos is `CH/examples/measurements/engineering-loop-runs.csv`, which is n = 1 per cell, and the AAA evaluation math (pass@k, noise band), which is arithmetic rather than a result.

---

## 4. Top 10 recommendations for Garageband (ranked by value)

1. Make review independent in practice: fresh-context reviewer packet without builder reasoning, read-only, builder dispositions each finding, record reviewed SHA, re-review the delta after any fix (review skill and TEAM.md; from CH independent-review, AAA 21, LHE L09).
2. Put measurement rules into the measure station: adopt the CH CSV columns, report pass^k over 3-5 repeats, make no gain claim inside the sqrt(p(1-p)/n) noise band, and qualify each new eval set before use (AAA 23; CH measurement protocol).
3. Replace the ticket template with the CH loop contract plus the LHE goal template: runnable acceptance commands, out-of-scope and hands-off paths, judge and success predicate, budgets, max rounds (ticket template and build skill).
4. Add failure classification and a no-weakening rule to the build skill: product, test, environment, assumption or external; stop after two identical failures; never weaken a test to pass (CH loop-contract and SKILL.md).
5. Split the learn station into online evidence and offline promotion, with a change contract and a holdout check before any skill or AGENTS.md edit; use the "smallest place for a lesson" ladder (AAA 21; CH review-first wiki).
6. Add unattended-sprint stall guards: repeated tool-plus-argument fingerprint stop, stale-progress reclaim, no-progress-rounds stop, and single-level delegation enforced in the tool registry (AAA 11, 18; harness-creator gotcha 8; LHE L13).
7. Pick one tickets schema with a `verify` command field where only the verifier moves a ticket to done, and align the audit script to it (course schemas conflict in five ways; section 3).
8. Guard layer for Track B: pure allow, ask or deny decision with default ask for destructive actions, parsed command checks, egress off for workers, hook timeouts, Stop re-entry guard, FIX text on every block message (AAA 03, 04; LHE L09 and L10).
9. Spend and routing caps: per-ticket and per-provider cost caps, one escalation per ticket, reviewer minimum tier, every routing decision logged (CH routing.yaml; AAA 20).
10. Monthly harness ablation plus the five-question fresh-session test on each project repo, with a module quality grade file (LHE L03, L12; AAA 00).

---

## 5. What I could not open or verify

- The Garageband repository itself (`github.com/milllenialfalcon/Garageband`) was not opened. Every Garageband status in section 3 comes from `CONTEXT.md` one-line descriptions. Some "partly" calls may be wrong either way; the owner should check against the skill files.
- No code was run. Statements about what `validate-harness.mjs`, `audit-harness.sh`, `check-architecture.sh`, lecture `.ts` demos or `verify.py` do come from reading the source. I did not run any test, grep check or demo.
- Secondhand citations were not checked against their sources: Anthropic harness articles (20 min / $9 vs 6 h / $200; three-agent $124.70 run; "context anxiety"; Sonnet 4.5 and Opus 4.5 figures), OpenAI harness-engineering post (1,500 PRs, 3.5 PRs per person per day, merge philosophy, Fridays cleanup), ETH Zurich AGENTS.md study (over 20% cost), Lulla et al. (run-time and token numbers), LangChain Terminal Bench figure, Karpathy autoresearch 2.02 h to 1.80 h, Liu et al. lost-in-the-middle, Guo et al. calibration.
- Claude Code behavior claims as stated in the course and in the harness-design page: `/goal` internals, auto-memory 200 lines and 25 KB, permission modes, five-layer compaction, hook events. The Claude Code page itself says its compaction and permission detail comes from a v2.1.88 analysis and may be outdated. I did not check current Claude Code docs.
- Social-media and commentary items in L13 and L14 (tweets, view counts, fact-check numbers, Osmani essays, iii.dev, eigent, Prefect, Jensen Huang interview) were not opened.
- arXiv items named in AAA section 21 and 23 (AHE 2604.25850, Self-Harness 2606.09498, Lin et al. 2605.30621, ACE 2510.04618, PreAct 2606.17929, Alita 2505.20286) were not opened. AHE is the arXiv paper named in AAA section 21 for change contracts and bounded candidate spaces for a harness that edits itself; it may be worth a separate read.
- Course translations (docs/zh, docs/uk, docs/ja and others) were not read. Lecture code files were skimmed, not read in full: `session-simulator.ts`, `repo-reader.ts`, `failure-pattern-demo.ts`, `split-vs-monolithic.ts`, `e2e-runner.ts` (first 1,500 characters), `benchmark-runner.ts`, `cleanup-scanner.ts` (first 1,500 characters), `runtime-logger.ts` (first 1,800 characters), `init-check.ts` (first 3,500 characters), `scope-tracker.ts` (first 2,500 characters), `victory-detector.ts` (first 2,000 characters), `feature-list-validator.ts` (first 4,000 characters), `maker_checker_graph.py` (first 1,500 characters).
- Course project starter and solution source under `LHE/projects/project-0N/*/src` was not read. Only AGENTS.md, feature lists, rubrics, sprint contracts, check scripts and init scripts were read.
- `LHE/tools/audit-harness.sh` was read for L07, L08, L09 and L12 only, plus its header and summary. Its L03-L06, L10 and L11 checks were not read.
- `CH`: `skills/engineering-loop/references/hard-debugging.md` and `evidence-example.md`; `modules/00-09, 11-13`; `labs/` (including the playground rubric, which the protocol says to keep hidden until runs finish); `site/`; `scripts/`; `examples/measurements/gpt-5.6-sol-*.md` full text; `resources/articles/`; other skills (`build-*`, `review-*`, `test-software`, `operate-devops`, `orchestrate-engineering`, `maintain-codex-wiki` scripts). Only README claims about these were used.
- `AAA`: full mechanism text of sections 01, 02, 05-19, 22 was not read (only intros and failure-mode lists); `src/` demos were not read (the READMEs quote the key functions, which were used instead). The translated READMEs were not read.
- Dates: the LHE clone is dated 2026-10-01, CH 2026-09-29, AAA 2026-09-22 (git commit dates). Several CH and LHE references describe events in July and August 2026; I did not verify those events.
- Section 3 "change type" and priority ordering are my judgment, not something the sources state. Value ranking weighs cheapness of the change, the number of sprint runs it protects, and whether the source shows a mechanism (rather than an opinion).
