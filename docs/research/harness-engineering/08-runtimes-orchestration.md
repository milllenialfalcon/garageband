# 08. Runtimes, sandboxes and multi-agent orchestration

Scope: README.md lines 216-232 (Runtime Foundations, Sandboxes) and 247-254 (Multi-Agent Orchestration). 14 items.

Method: shallow clones (`git clone --depth 1`) into `ahe-study/src/<repo>/`. Paths below are relative to that folder, e.g. `sandbase-harness/src/strategy/pi/session-lease.ts`. Articles were read with WebFetch (a small model summarised them, so quotes are approximate). Nothing was executed. Repo text was treated as data.

Garageband status is based on the public repo (`ahe-study/src/Garageband`) plus CONTEXT.md. The public repo does not contain the sprint ORCHESTRATOR.md, the box configuration or any Track B docs, so every "Garageband has it" rating for those areas is inferred and marked as such.

---

## 1. Per project

### A. Runtime foundations and control layers

**1. Building agents with the Claude Agent SDK** (claude.com blog, article only, no repo)
- What: Anthropic's guide to the SDK's agent loop, tools, MCP, subagents and context compaction.
- Architecture:
  - Loop is "gather context, take action, verify work, repeat".
  - Subagents run in their own context windows and return only relevant output to the orchestrator.
  - Compaction summarises old messages near the context limit.
  - The filesystem is used as context (grep and tail to load only what is needed).
- Mechanisms worth copying: subagent context isolation and "verify step in the loop". Nothing on sessions, hooks, permission modes or sandboxing is on this page, so it cannot back those claims.
- Licence: not stated on the page (SDK licence not checked).

**2. AgentKit** (inngest/agent-kit), `agent-kit/packages/agent-kit/src/`
- What: TypeScript agent toolkit. Durable behaviour comes from Inngest step functions.
- Architecture:
  - `network.ts` runs a stack of scheduled agents. A routing agent calls `select_agent`. Runs are sequential; the source comment defers parallelism.
  - `network.ts` stops the loop at `maxIter` (0 means unlimited).
  - `agent.ts` runs a tool loop with its own `maxIter`, around lines 194 and 369.
  - `model.ts` wraps model calls in `step.ai.infer` when Inngest step tools are present, so a completed call is replayed rather than re-run.
  - `history.ts` defines a History interface: `createThread`, `get`, `appendResults`. Storage is pluggable.
- Mechanisms worth copying:
  - Hard iteration cap per run (`maxIter`, `network.ts` ~L599).
  - Memoised model calls for replay after a crash, `model.ts` ~L53.
  - A thread store interface separate from the run loop, `history.ts`.
- Licence: Apache-2.0 (`agent-kit/LICENSE.md`).
- Caveat: nothing here is durable unless it runs on Inngest. Do not assume durability from the README.

**3. SandBase Harness** (sandbaseai/sandbase-harness, v0.3.8 in its README)
- What: local-first agent runtime with sessions, sandboxes, credential vaults, egress control, audit and a Console.
- Architecture:
  - Sandbox providers: local process, Docker (one container per session), Kubernetes, and self-hosted worker queue.
  - Docker provider builds an `--internal` network plus an external one, with a socat relay sidecar as the only route out (`src/sandbox/docker-provider.ts`). Resource limits go through `--memory` and `--cpus`.
  - Egress proxy enforces a host allowlist for CONNECT tunnels (`src/core/net/egress-proxy.ts`).
  - Credentials carry a network policy, and a limited policy with an unverifiable host is denied (`src/core/credentials/policy.ts`).
  - Pi strategy has a gate extension that asks one question per gated tool call, with no standing grant (`src/strategy/pi/gate-extension.ts`).
- Mechanisms worth copying (with paths):
  - Lease with heartbeat for a session file: exclusive create, 30 s stale window, recovery by atomic rename (`src/strategy/pi/session-lease.ts`).
  - Delegation guard: cycle detection, depth limit of 5, and a roster allowlist (`src/core/orchestrator/agent-orchestrator.ts`, `validateDelegation`).
  - Approval modes: `interactive` by default, and `preauthorized_once` that must never be recorded as a human click (`src/strategy/pi/approval-mode.ts`).
  - Resume refused when the policy fingerprint or workdir has changed, error code `pi_policy_mismatch` (`src/strategy/pi/session-continuity.ts`).
  - Fail-closed local isolation: `require` mode errors instead of degrading to an unwrapped subprocess. Uses bubblewrap on Linux and sandbox-exec on macOS (`src/sandbox/local-isolation.ts`).
  - Memory consolidation as a separate job that writes to a new store by default (`src/core/dreams/dream.ts`, `runner.ts`).
- Licence: Apache-2.0.
- Caveat: the docker provider's source does not show `--cap-drop` or seccomp settings (grep only). Check before copying.

**4. DSH Studio** (Moresyl/dsh-studio), desktop shell for DeepSeek Harness
- What: Tauri 2 desktop app that supervises a local `dsh` service and reclaims its child processes.
- Architecture:
  - `src-tauri/src/harness/supervisor.rs` owns start, stop, crash detection and restart.
  - Restart delays: 500 ms, 1 s, 2 s, 5 s, 10 s (`RESTART_DELAYS_MS`). Health probe every 10 s with a 5 s timeout, and 3 misses means the harness is wedged.
  - A wedged harness is ended and then restarted through the same backoff path (`revive()`).
  - `src-tauri/crates/proc-guard/`: Unix puts each child in its own process group and signals the group on drop. Windows uses a Job Object with `KILL_ON_JOB_CLOSE`.
- Mechanisms worth copying: backoff schedule and miss-count health check (`supervisor.rs` lines 29-58); process-tree reclaim (`proc-guard/src/unix.rs`, `windows.rs`). Relevant to T3 and provider CLIs leaving orphan children.
- Licence: MIT.

**5. BitRouter** (bitrouter/bitrouter), Rust model router and BRO orchestrator
- What: local OpenAI-compatible router with routing policy, MCP gateway, guardrails, cost tracking, and a durable thread/turn orchestrator (`bro code`).
- Architecture:
  - `crates/bitrouter-sdk/src/language_model/hooks.rs`: pipeline hooks (PreRequest, Route, Execution, Stream, Observe). `revalidate_context` rejects by default.
  - `crates/bitrouter-orchestrator/src/thread.rs` and `turn.rs`: durable Thread and Turn state machines. Turn statuses include `Queued, Accepted, Running, WaitingForInput, Completed, Failed, Cancelled, Interrupted, RecoveryRequired`. Permission profiles are `ReadOnly`, `Ask`, `AllowEffects`.
  - `store.rs`: store-wide execution owner with a generation number. Claims are `Acquired`, `Blocked` or `Unfenced`. Side effects are recorded as `Completed`, `NotExecuted` or `Unknown`. Accepted inputs are idempotent via `AcceptedKey` (scope, key, fingerprint).
  - `service/ownership.rs`: an old or blocked owner leaves read-only recovery available. The doc comment says fencing "does not prove termination of an abruptly lost owner or replace workspace isolation".
- Mechanisms worth copying:
  - Generation-fenced single writer (`store.rs` OwnerClaim, `service/ownership.rs`).
  - `EffectStatus::Unknown` as a first-class state, so a crash mid-action is not recorded as a failure (`store.rs` ~L232).
  - Idempotent accept keyed by a fingerprint of the request (`store.rs` AcceptedKey).
  - Typed PreRequest and Route hooks as the policy seam (`hooks.rs`).
- Licence: Apache-2.0.
- Caveat: the "cut API cost 40.9%" figure is BitRouter's own study (`benchmarks/`). Not verified.

**6. rust-norion (北极星)**
- What: Rust inference-control prototype (routing, memory, reflection, replay, drift gates). Not a production model kernel.
- Architecture: hierarchy planner (`src/hierarchy/task_planner.rs`), KV and gist memory, and "writer gates" that preview durable changes before applying them (`docs/project-context.md`, `docs/contributor-zone.md`).
- Mechanisms worth copying (as ideas only): preview-then-apply gate for durable writes, with rollback and audit. Maps to Track B B5 (shared memory) and B6.
- Licence: GPL-3.0. Do not copy code into a non-GPL fork. Read for ideas only.
- Caveat: README is Chinese and I only grepped the code.

### B. Sandboxes and execution infrastructure

**7. SWE-ReX** (SWE-agent/SWE-ReX)
- What: sandboxed execution layer for agents, with Docker, Modal, Fargate and Daytona deployments behind one runtime API.
- Architecture (`docs/architecture.md`):
  - A `Deployment` starts a container or remote box and returns a `RemoteRuntime`.
  - Inside the box, a FastAPI server forwards requests to a `LocalRuntime`. Exceptions are transferred back to the caller.
  - `run_in_session` gives persistent shell sessions, so several long-running tools can share one shell.
- Mechanisms worth copying:
  - Token auth on the in-box API. `--auth-token` is required (`src/swerex/server.py`, `authenticate` middleware).
  - Exception transfer so the caller can handle errors from the remote side (`src/swerex/runtime/remote.py`, `_handle_transfer_exception`).
  - Deployment abstraction with `--rm` containers (`src/swerex/deployment/docker.py`).
- Licence: MIT.
- Fit: we already have Docker. Copy the pattern (auth token, persistent sessions, typed exceptions), not the dependency.

**8. Harbor** (harbor-framework/harbor), evaluation harness for agents
- What: runs many agent trials in sandboxes, with retries, job-level resume and per-phase network policy.
- Architecture:
  - `src/harbor/trial/trial.py` `Trial.run`: `_prepare`, then `_run`, then `_recover_outputs` on error or cancel, then `_finalize`. Output recovery is done even when a trial is cancelled.
  - `src/harbor/trial/queue.py`: `asyncio.Semaphore(n_concurrent)` plus per-agent-pool semaphores. Retry config has `include_exceptions`, `exclude_exceptions`, and exponential backoff capped at `max_wait_sec`.
  - `src/harbor/job.py` writes a job lock (`src/harbor/models/job/lock.py`). Resume reconciles against it and refuses to resume a job that was "resumed with a different config".
  - `src/harbor/trial/network_policy.py`: network mode per phase (public or allowlist), with validation of mode changes between phases.
  - `src/harbor/environments/`: one interface over many sandbox providers (Docker, E2B, Modal, Daytona and others).
- Mechanisms worth copying: config fingerprint lock with refuse-on-drift resume; typed retry classes; per-phase network policy (setup can reach the network, the agent run cannot).
- Licence: Apache-2.0.

**9. Mitos** (mitos-run/mitos)
- What: Firecracker microVM sandboxes restored from memory snapshots, with copy-on-write fork into N siblings.
- Architecture (from the GitHub README via WebFetch; repo could not be cloned):
  - Each sandbox is its own KVM microVM. Pods are not the isolation boundary.
  - Declarative CRDs (`SandboxPool`, `Sandbox`, `Workspace`). Kubernetes-based. A standalone `sandbox-server` exists.
  - `fork` branches a warm VM so several attempts start from the same ready state.
- Mechanisms worth copying: "fork a warm state and explore N attempts" as a future pattern for parallel retries. Not for now.
- Licence: Apache-2.0 (per the README).
- Caveat: README says "Do not run untrusted code in production yet" and the project is pre-1.0 with no external security review. Watch item only.

### C. Multi-agent orchestration

**10. Anthropic: How we built our multi-agent research system** (article)
- What: Anthropic's write-up of a lead-agent plus subagents research system.
- Architecture:
  - Lead agent plans, spawns 3 to 5 subagents in parallel, synthesises results, and decides whether to go again. A CitationAgent attributes claims at the end.
  - Lead saves its plan to external memory because context can be truncated past about 200k tokens.
  - Subagents return findings by default. An appendix pattern has them store outputs externally and return only references.
- Mechanisms worth copying:
  - Delegation brief with four required parts: objective, output format, tools and sources to use, and task boundaries. Vague briefs caused duplicated work.
  - Scaling rules: 1 agent with 3 to 10 tool calls for simple lookups, 2 to 4 subagents for comparisons, more than 10 for complex work.
  - Resume from the point of failure with checkpoints, rather than restart. Restart was judged too costly.
  - Pass references to stored artifacts, not the content (reduces information loss).
  - Tool descriptions revised from observed failures (reported 40% faster completion).
- Caveats: the authors report about 15x the tokens of a chat. Evaluation was about 20 representative queries with an LLM judge plus human review.

**11. Orkas** (Orkas-AI/Orkas), local-first desktop multi-agent app
- What: a "Commander" agent plans a goal, dispatches specialist agents (nine built in), and tracks shared files and tasks.
- Architecture:
  - `src/main/util/locks.ts`: per-session mutex and a global semaphore of 10 LLM calls. Keyed mutexes are reference-counted and removed when unused.
  - `src/main/model/core-agent/task-budget-provider.ts`: per-task token budget. Calls already issued finish; later calls are refused.
  - `src/main/model/core-agent/task-file-ownership.ts`: `CreationSnapshot` records which files a task created by comparing before and after listings. An omitted file is not treated as proof of absence.
  - `src/main/features/reflection-orchestrator.ts`: reflection after tasks, which feeds per-agent memory.
- Mechanisms worth copying: global concurrency semaphore; file-ownership snapshot to see what a task really changed; ref-counted keyed locks (avoid unbounded lock maps).
- Licence: MIT.
- Caveat: I sampled four files out of about 590 source files.

**12. Agentlas OS** (agentlas-ai/Agentlas-OS)
- What: specialist-team marketplace and install layer for Claude Code, Codex, Cursor and others.
- Architecture: install scripts, hosts (`claude/`, `codex/`, `cursor/`, and others), `system-agents/` protocols, `schemas/`, memory store schemas, and a verification skill set.
- Mechanisms worth copying: `system-agents/orchestrator-protocol.md`, a short covenant with seven sections:
  - Worker calls go only through the orchestrator. No worker-to-worker calls.
  - Every call carries a fixed handoff brief: task, specialist and why, context, files to inspect, constraints, scope boundary, output contract, acceptance checks, return schema, memory update needed.
  - Every return has findings, output, risks, verification with evidence, and a proposed memory update.
  - Typed failure markers (e.g. `RunnerFailure`). Never rewrite or humanise a machine marker.
  - Synthesis rule: "A staffing selection or a prepared bundle is not proof that a worker ran; only an execution receipt is."
  - Conflicting returns are surfaced as conflicts, not averaged.
  - Stop after the same failure repeats without a changed plan.
  - Workers never write durable memory. They propose updates, curated by a separate curator.
- Licence: Apache-2.0.
- Caveat: the README has an "AI install entry" that tells an agent to run a curl-to-bash installer. I did not run it. Treat as untrusted. I also did not read `skills/memory-ticketing/SKILL.md`, which appeared only in a grep.

**13. Squadron** (mlund01/squadron), declarative multi-agent runtime in Go
- What: HCL-defined missions with tasks, dependencies, routers, budgets, scheduling, human input and resume.
- Architecture:
  - `mission/runner.go` (about 3,600 lines, sampled): `WithResume` (L132) reloads the mission, validates name and state, reloads inputs and route decisions, and continues. Budget tracker cancels the mission context on breach (L415 to 421).
  - `store/sqlite.go` `UpdateTaskStatusCAS` (L108) and `store/postgres.go` (L112): compare-and-swap on task and mission status.
  - `mission/budget.go`: budgets per task and per mission, in tokens or dollars.
  - `scheduler/scheduler.go`: timer-based firing with `max_parallel` per mission.
  - `humaninput/resolve.go`: `ResolveOutcome` distinguishes first resolve, already resolved, and not found.
  - `agent/subtask_tools.go`: the commander must define subtasks as its first action, and cannot redefine them after one completes.
  - `agent/orchestrator.go`: `${secrets.name}` placeholders are injected into tool inputs at call time, so the model never sees the secret.
  - `agent/persistence.go`: structured message parts are saved, so a session can be restored.
- Mechanisms worth copying: CAS status transitions; budget breach that cancels in-flight work; resolve-once human input; secret placeholders injected at call time; per-mission parallelism cap.
- Licence: MIT.

**14. Cowork Forge** (sopaco/cowork-forge), Rust multi-agent SDLC pipeline
- What: staged pipeline (idea, PRD, design, plan, coding, check, delivery) where each stage is an actor-critic loop with human confirmation.
- Architecture:
  - `crates/cowork-core/src/pipeline/stage_executor.rs`: config-driven stage execution. Stages support simple or actor-critic mode. A `goto_stage` signal lets a stage jump with a reason.
  - `crates/cowork-core/src/config_definition/`: agents, stages and flows as JSON, with a validator.
  - `crates/cowork-core/src/persistence/iteration_store.rs`: each iteration saved as JSON on disk.
  - `crates/cowork-core/src/llm/rate_limiter.rs`: token bucket with exponential backoff on 429 (1 s, 4 s, 16 s in the tests).
  - `crates/cowork-core/src/integration/hooks.rs`: pre- and post-stage REST hooks with a 30 s client timeout.
- Mechanisms worth copying: critic loop with a goto escape; token bucket with backoff; stage hooks for external checks.
- Licence: MIT.
- Caveats: `hooks.rs` header says "retry logic" but grep found no retry code. `runtime_security.rs` is a regex denylist plus a package-manager allowlist, which is a safety net and not a boundary.

---

## 2. Mechanisms mapped to Garageband

Status key: **yes** = Garageband has it. **partly** = some form exists. **no** = absent. "(inferred)" = based on CONTEXT.md, not on repo files.

Target key: **ORCH** = sprint ORCHESTRATOR.md. **Box** = Docker factory box. **B4** board, **B5** shared memory, **B6** safety, **B7** automation.

| # | Mechanism | Source (repo/path) | Garageband today | Target |
|---|---|---|---|---|
| 1 | Claim by ledger push, rejected if someone else changed it | Garageband `skills/factory-ledger/SKILL.md` (optimistic lock via git push) | **yes** (public skill) | keep |
| 2 | Claim lease with heartbeat and expiry, stale-claim sweeper | Sandbase `src/strategy/pi/session-lease.ts` | **no**: a claim with no `done` or `blocked` stays claimed after a crash | Box sweeper + B4 (show stale) |
| 3 | Crash state `Unknown` (effect may or may not have happened), check git and PR before re-dispatch | BitRouter `crates/bitrouter-orchestrator/src/store.rs` `EffectStatus` | **no** (only BLOCKED, NEEDS_CONTEXT, DONE, attempt counter) | ORCH (rule) + B4 (state) |
| 4 | Generation-fenced single writer for sprint-branch merges, so a stale Chief or Relief cannot write | BitRouter `store.rs` `OwnerClaim`, `service/ownership.rs` | **no** (inferred: Chief and Relief both merge) | Box + B6 |
| 5 | Idempotent dispatch keyed by (ticket, attempt, hour) to stop duplicate hourly wakes | BitRouter `store.rs` `AcceptedKey` | **no** (inferred) | Box / B7 |
| 6 | Config fingerprint lock; refuse resume if AGENTS.md, TEAM.md or policy changed without a record | Harbor `src/harbor/models/job/lock.py`, `job.py`; Sandbase `session-continuity.ts` | **no** | Box startup check |
| 7 | Typed status vocabulary and failure markers, never prose-only | Agentlas `system-agents/orchestrator-protocol.md` section 4 | **partly** (STATUS block in `dispatch-brief`) | ORCH |
| 8 | Receipt rule: preparation is not execution; DONE needs pasted evidence | Agentlas protocol section 5 | **partly** (`dispatch-brief` treats DONE without output as NEEDS_CONTEXT) | ORCH (state it as a general rule) |
| 9 | Fixed handoff brief sections (scope boundary, return schema, memory update needed) | Agentlas protocol section 2; Anthropic article | **partly** (`dispatch-brief` has contract, file pointers, limits, report format; no return schema or memory-update field) | ORCH (add fields) |
| 10 | Brief file scope enforced mechanically: PR diff checked against the brief's allowed paths | Orkas `task-file-ownership.ts` (snapshot idea) | **no** (brief says "files it may touch"; nothing checks it) | Box CI / pre-push + B6 |
| 11 | Worker-to-worker calls forbidden; all routing through the orchestrator | Agentlas protocol section 1 | **yes** (inferred from CONTEXT: Chief delegates) | ORCH (write it down) |
| 12 | Workers never write durable memory; they propose updates, curator merges | Agentlas protocol section 3 | **partly** (factory-ledger: each tool edits only its own rows) | B5 |
| 13 | Shared memory written as a new copy, not in place, with a human gate on promotion | Sandbase `src/core/dreams/dream.ts` (default writes to a new store); rust-norion writer gates | **no** | B5 |
| 14 | Per-ticket container with `--internal` network and proxy-only egress, plus CPU and memory limits | Sandbase `src/sandbox/docker-provider.ts`, `src/core/net/egress-proxy.ts` | **no** (inferred: one box container runs all CLIs, per CONTEXT) | Box (largest change) |
| 15 | Fail closed when a boundary tool is missing (`require` mode) | Sandbase `src/sandbox/local-isolation.ts` | **no** (inferred) | Box startup |
| 16 | Phase-scoped network policy (setup may fetch; agent run may not, unless allowlisted) | Harbor `src/harbor/trial/network_policy.py` | **no** (inferred) | Box |
| 17 | Credentials carry a host allowlist; unverifiable host is denied | Sandbase `src/core/credentials/policy.ts` | **no** (T3 has `request_secret`; host scoping not seen) | B6 |
| 18 | Secret placeholders resolved at call time, so the model never sees the value | Squadron `agent/orchestrator.go` (`secretInjector`) | **partly** (inferred: T3 `request_secret`) | B6 |
| 19 | Approval decisions labelled by source; automatic answers never recorded as a founder click | Sandbase `src/strategy/pi/approval-mode.ts` | **partly** (guard.sh blocks and asks for a Founder Call; no record of source) | B4 + B6 |
| 20 | One question per gated action; no standing grant from one answer | Sandbase `src/strategy/pi/gate-extension.ts` | **yes** (Founder Call is per action in practice) | keep |
| 21 | Needs-you queue with resolve-once semantics (first, already resolved, not found) | Squadron `humaninput/resolve.go` | **no** (Founder Calls are text in tickets) | B4 |
| 22 | Budget breach cancels in-flight dispatches, not just refuses new ones | Squadron `mission/budget.go`, `runner.go` L415-421 (Orkas `task-budget-provider.ts` only refuses later calls) | **partly** (`cost-watch` skill; spend caps planned in Track B) | B6 |
| 23 | Circuit breaker on repeated failure of one provider | BitRouter failover and Harbor retry classes; DSH health miss limit | **partly** (escalation after 3 and 5 attempts, per ticket only) | B6 |
| 24 | Per-ticket attempt cap plus run-level iteration cap (`maxIter`) | AgentKit `packages/agent-kit/src/network.ts` | **yes** (3 and 5 attempts, `factory-ledger`) | keep, add per-hour cap |
| 25 | Concurrency caps: global LLM semaphore, per-provider pool, per-mission max parallel | Orkas `src/main/util/locks.ts`; Harbor `trial/queue.py`; Squadron `scheduler/scheduler.go` | **partly** (hourly wake spreads load; TEAM.md `pool` shares a quota, no cap) | Box / B7 |
| 26 | Retry with exception include and exclude lists, exponential backoff | Harbor `src/harbor/trial/queue.py` `RetryConfig`; cowork `rate_limiter.rs` | **no** | B7 |
| 27 | Restart with backoff, health probe with miss limit, kill process tree on exit | DSH `src-tauri/src/harness/supervisor.rs`, `crates/proc-guard/` | **no** (inferred: box entrypoint) | Box entrypoint |
| 28 | Checkpoint and resume from the failure point, rather than restart | Anthropic article; Squadron `WithResume`; BitRouter RecoveryRequired | **partly** (handoff notes and ledger; not machine-readable) | B7 |
| 29 | Structured turn states (Queued, Running, WaitingForInput, Recovery) | BitRouter `turn.rs` `TurnStatus` | **partly** (ledger statuses: claimed, blocked, in-review, changes-requested, done) | B4 (state machine) |
| 30 | Learning routing policy with publish and revert, from outcomes | BitRouter (self-reported 40.9% cost cut) | **partly** (`model-router` is static tiers) | B7 (later) |
| 31 | Session-level memory consolidation job | Sandbase `src/core/dreams/`; Garageband `retro-instincts` | **partly** (`retro-instincts`, `instincts.md`) | B5 |
| 32 | Stage jump with reason, and per-stage actor-critic | Cowork Forge `pipeline/stage_executor.rs` | **partly** (critic in `doubt-review`; no goto) | ORCH (optional) |
| 33 | Config validator for agent, stage and flow definitions | Cowork Forge `config_definition/validator.rs`; Squadron HCL | **no** (skills are plain text) | Low priority |
| 34 | Persistent in-box shell sessions and token-authed API | SWE-ReX `src/swerex/server.py`, `runtime/remote.py` | **no** (inferred) | Box (optional) |
| 35 | Fresh context per ticket with summary-then-handoff | Anthropic article; Agent SDK subagents | **yes** (fresh session per ticket, handoff note) | keep |
| 36 | Copy-on-write fork of a warm sandbox for parallel attempts | Mitos (README) | **no** | watch only |

---

## 3. Top 8 recommendations (ranked by value for the unattended sprint)

1. **Lease claims with heartbeat and expiry, and add an Unknown state.** A crashed agent currently leaves its ticket claimed forever. Add owner, heartbeat and expiry to each claim. The hourly wake sweeps stale claims into `Unknown`, and re-dispatch happens only after git and PR state are checked. Sources: Sandbase `session-lease.ts`, BitRouter `store.rs` `EffectStatus`. Target: Box, B4.
2. **Put the typed-status and receipt rules into ORCHESTRATOR.md.** Failure markers are typed, preparation is not execution, and DONE needs pasted evidence. Quick win with no code. Source: Agentlas `orchestrator-protocol.md` sections 4 and 5. Target: ORCH.
3. **Fence sprint-branch merges with a generation number.** When Relief takes over from the Chief, the old owner must not be able to merge. Source: BitRouter `OwnerClaim` and `ownership.rs`. Target: Box, B6.
4. **Give each ticket its own container with proxy-only egress.** Use an internal network, an allowlisted proxy, CPU and memory limits, and fail closed when a boundary tool is missing. This is the biggest change, but it is what separates the box from a shared container. Source: Sandbase `docker-provider.ts`, `egress-proxy.ts`, `local-isolation.ts`. Target: Box. Check `--cap-drop` and seccomp, which the reference does not show.
5. **Check the PR diff against the brief's file list in CI.** The brief already names allowed files, but nothing enforces it. Source: Orkas `task-file-ownership.ts`. Target: Box CI and pre-push, B6. Keep `guard.sh` as a safety net only, since it is a regex denylist.
6. **Make a budget breach cancel in-flight work.** Refusing the next call is not enough. Source: Squadron `budget.go` and `runner.go` (cancels the context). Target: B6 spend caps and circuit breaker.
7. **Build a needs-you queue with resolve-once semantics and decision source.** Each Founder Call gets one answer that records who gave it, and automatic answers can never be recorded as a human approval. Sources: Squadron `humaninput/resolve.go`, Sandbase `approval-mode.ts`. Target: B4, B6.
8. **Add retry classes, exponential backoff and per-provider concurrency caps.** Set caps per quota pool from TEAM.md. Sources: Harbor `trial/queue.py` (`RetryConfig` and semaphores), Orkas `locks.ts`, cowork `rate_limiter.rs`. Target: B7, Box.

Honourable mention (not in the top 8): refuse to resume a sprint when AGENTS.md or TEAM.md changed without a record (Harbor job lock, row 6).

---

## 4. What I could not open or verify

- **Mitos:** `git clone` failed. I read the GitHub README through WebFetch only. No source reviewed. Performance numbers are the project's own claims.
- **Claude Agent SDK blog and the Anthropic multi-agent article:** WebFetch summaries from a small model. Quotes are approximate. No SDK docs or source were checked, so the session, hook and permission details are unverified.
- **Orkas:** sampled four files out of about 590. The core agent loop and the Commander were not read.
- **Agentlas OS:** read only `system-agents/orchestrator-protocol.md` in full. The hooks that enforce it (`hooks/`, `claude/` plugin) and `skills/memory-ticketing/` were not read. The README contains an agent-directed curl-to-bash installer. I did not run it.
- **Squadron:** `runner.go` (about 3,600 lines) was sampled with grep and line reads. Mission resume was not traced end to end.
- **Sandbase:** the docker provider was read in part. Its README architecture claims were not run. Source does not show `--cap-drop`. The relay and proxy were read at the header level only.
- **Harbor:** `Trial.run` read in full. Queue and job lock read in part. Verifier and per-provider code not read.
- **BitRouter:** orchestrator headers, `store.rs` and `ownership.rs` read in part. `recovery/` not read. The 40.9% cost figure is self-reported.
- **DSH Studio:** supervisor constants and the `revive()` path read. Full `supervise()` loop and Windows job-object code not traced line by line.
- **Cowork Forge:** `stage_executor.rs` (1,542 lines) grepped only. `runtime_security.rs` not tested for bypasses. The `hooks.rs` retry claim is unverified.
- **AgentKit:** the core network loop and model step wrapper read. The Inngest-backed durability path was not run.
- **SWE-ReX:** architecture doc and key files read. Runtime internals not traced.
- **rust-norion:** README (Chinese) and grep only. GPL-3.0, so ideas only.
- **Garageband:** only the public repo was available. Sprint ORCHESTRATOR.md, the box config and Track B docs are not there. Every "inferred" rating depends on CONTEXT.md. Please check rows 2, 4, 5, 6, 14, 15, 16 and 27 against the private box config before acting on them.
- **Nothing was executed.** No tests were run, and no claim here is a runtime result.
