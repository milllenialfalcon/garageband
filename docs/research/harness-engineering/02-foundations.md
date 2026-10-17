# Foundations study (README.md lines 50-65)

Scope: the 12 live links in the "Foundations" section of `/tmp/claude-0/-home-claude/80fb1f52-60ae-56e0-8a79-b145fdd1f249/scratchpad/ahe/README.md`. Line 52 is a commented-out survey (403), listed under "not opened" below.

Method and caveats:
- 11 web resources were read with WebFetch. WebFetch returns a model-written summary, so any text in quotation marks from those pages is a summarizer quote, not verified verbatim. Those quotes are marked **[fetch-quote]**.
- 1 GitHub repo (mseeks/many-hands-engineering) was shallow-cloned to `/tmp/claude-0/-home-claude/80fb1f52-60ae-56e0-8a79-b145fdd1f249/scratchpad/ahe-study/src/many-hands-engineering`. I read its Typst source (`many-hands-engineering.typ`), not the PDF. Quotes from it are verbatim and marked **[src]**.
- No code was run from any clone.
- Garageband status verdicts come from `CONTEXT.md` only, as instructed. I did not clone the Garageband repo, so "partly" often means "a station or file with a related name exists". Verify before acting.
- Idea IDs (R1.1 etc.) are used in Section 2.

---

## 1. Per resource

### R1. OpenAI, "Harness engineering: leveraging Codex in an agent-first world"
URL: https://openai.com/index/harness-engineering/
What: Field report on building an internal product with Codex, with engineers steering through environments and feedback loops rather than writing code. "Humans steer. Agents execute." **[fetch-quote]**

- R1.1 When the agent struggles, ask what capability is missing and encode it in the repo. Early failures were environmental, not model failures. **[fetch-quote]**
- R1.2 AGENTS.md is about 100 lines and works as a table of contents, with a `docs/` system of record (`design-docs/` with verification status, `exec-plans/active|completed/` plus `tech-debt-tracker.md`, `product-specs/`, `references/`, `generated/`) and root files (`ARCHITECTURE.md`, `QUALITY_SCORE.md`, `RELIABILITY.md`, `SECURITY.md`). A single big file was rejected because it crowds out context, goes stale, and is hard to check mechanically. **[fetch-quote]**
- R1.3 Layer order per domain (Types, Config, Repo, Service, Runtime, UI) enforced by custom linters and structural tests. Lint error messages "inject remediation instructions into agent context." **[fetch-quote]**
- R1.4 Each git worktree boots its own app instance. The agent drives the UI through Chrome DevTools Protocol, records video of failures and fixes, and runs per-worktree logs/metrics/traces (LogQL, PromQL, TraceQL). Performance prompts are concrete, e.g. "ensure service startup completes in under 800ms." **[fetch-quote]**
- R1.5 Entropy is handled with "golden principles" in the repo and background agents that scan for deviations and open small refactor PRs, most reviewable in under a minute and auto-merged. A recurring doc-gardening agent opens fix-up PRs for stale docs. "pay it down continuously in small increments." **[fetch-quote]**
- R1.6 Minimal blocking gates, short-lived PRs, flaky tests rerun rather than block. A self-review loop runs until agent reviewers are satisfied, and humans escalate only when judgment is needed. **[fetch-quote]**

### R2. Anthropic, "Effective harnesses for long-running agents"
URL: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
What: A two-prompt harness (initializer session, then coding sessions) that builds an app across many context windows.

- R2.1 The initializer creates `init.sh`, a progress log (`claude-progress.txt`), an initial git commit, and a feature list in JSON with 200+ entries. Each entry has `category`, `description`, ordered `steps`, and `passes: false`. Coding agents may change only `passes`. JSON was chosen because models overwrite Markdown inappropriately. **[fetch-quote]** "It is unacceptable to remove or edit tests..."
- R2.2 One feature per session. Commit to git with descriptive messages and progress notes so bad changes can be reverted. **[fetch-quote]**
- R2.3 Session startup routine: `pwd`; read git log and progress file; pick the highest-priority failing feature; run `init.sh`; run one basic end-to-end check before new work. **[fetch-quote]**
- R2.4 Mark a feature passing only after browser self-verification (Puppeteer MCP). Unit tests and curl checks were not enough. **[fetch-quote]**
- R2.5 Failure modes named: premature project victory, undocumented half-built state, premature feature completion, time lost working out how to run the app. **[fetch-quote]**

### R3. Anthropic, "Harness design for long-running application development"
URL: https://www.anthropic.com/engineering/harness-design-long-running-apps
What: Planner, generator, and evaluator agents (GAN-inspired) for full-stack and frontend app generation, with cost and time figures.

- R3.1 Tuning a standalone evaluator to be skeptical is "far more tractable" than making a generator critical of its own work. **[fetch-quote]**
- R3.2 Sprint contracts: before each sprint the generator proposes what "done" means and how to verify it, and the evaluator reviews until both agree. Files are the channel. **[fetch-quote]**
- R3.3 Hard thresholds per criterion. If any one criterion falls below its threshold, the sprint fails. **[fetch-quote]**
- R3.4 Evaluator calibration: few-shot examples with detailed score breakdowns to reduce score drift. Out of the box, Claude "found real issues, then talked itself into approving the work." The QA prompt was tuned by reviewing logs where its judgment diverged from the author's. **[fetch-quote]**
- R3.5 Context resets (fresh agent plus structured handoff) versus compaction. Resets address "context anxiety." With a later model the reset was dropped and automatic compaction kept. **[fetch-quote]**
- R3.6 Each harness component "encodes an assumption about what the model can't do on its own." Stress-test these. Removing one component at a time found what was load-bearing. Guiding principle: "find the simplest solution possible, and only increase complexity when needed." **[fetch-quote]**
- Cost data point: solo run 20 min and $9 with a broken core feature; full harness 6 h and $200 with a working result. **[fetch-quote]**

### R4. LangChain, "The Anatomy of an Agent Harness"
URL: https://www.langchain.com/blog/the-anatomy-of-an-agent-harness (followed from blog.langchain.com redirect)
What: Defines Agent = Model + Harness and lists harness parts.

- R4.1 Harness = "every piece of code, configuration, and execution logic that isn't the model itself." **[fetch-quote]**
- R4.2 Components: system prompts; tools, skills and MCPs (skills use progressive disclosure); bundled infrastructure (filesystem, sandbox, browser); orchestration (subagents, handoffs, routing); hooks and middleware (compaction, continuation, lint checks). **[fetch-quote]**
- R4.3 Context offloading: large tool outputs are cut to head and tail, with the full output written to the filesystem so it can be re-read. **[fetch-quote]**
- R4.4 "Ralph Loop" hook: intercept the model's exit attempt, reinject the original prompt into a clean context, and let the filesystem carry state. **[fetch-quote]**
- R4.5 Verification hook runs a test suite and sends failures back to the model. **[fetch-quote]**

### R5. Thoughtworks (Böckeler), "Harness Engineering"
URL: https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html
What: Framework that splits harness work into guides, sensors, and categories of control.

- R5.1 Guides (feedforward: AGENTS.md, skills, codemods) steer before action. Sensors (feedback: linters, tests, review) observe after action. "Feedback alone yields an agent that repeats mistakes. Feedforward alone yields rules that are never checked." **[fetch-quote]**
- R5.2 Computational controls (deterministic, cheap enough for every change) versus inferential controls (LLM review, slower, costlier, less deterministic). **[fetch-quote]**
- R5.3 Architecture fitness functions, e.g. ArchUnit tests in a pre-commit hook that flag module-boundary violations. **[fetch-quote]**
- R5.4 Timing: fast checks before commit, expensive checks in the pipeline, drift sensors (dead code, dependency scans) and runtime signals (SLO degradation, AI judges sampling) outside the change lifecycle. **[fetch-quote]**
- R5.5 Harnessability: typed languages and clear module boundaries make controls easier. Harness templates reduce agent output variety (citing Ashby's Law). **[fetch-quote]**
- R5.6 Behaviour harness, meaning functional correctness, is the hardest category, and still depends on AI-written tests and manual testing. **[fetch-quote]**

### R6. Anthropic, "Building effective agents"
URL: https://www.anthropic.com/engineering/building-effective-agents
What: Workflow patterns versus agents, and guidance on tool design.

- R6.1 Five workflow patterns: prompt chaining (with programmatic checks between steps), routing, parallelization (sectioning or voting), orchestrator-workers, evaluator-optimizer (works when criteria are clear and feedback measurably helps). **[fetch-quote]**
- R6.2 Start with the simplest solution and add complexity only when it demonstrably helps. Agents compound errors and cost more. **[fetch-quote]**
- R6.3 Put as much effort into the agent-computer interface as into the human one. Tool definitions should include example usage, edge cases, input requirements, and boundaries between tools. Test tools on many inputs and make mistakes harder, e.g. require absolute paths. **[fetch-quote]**
- R6.4 Three principles: keep the design simple, show planning steps, craft the tool interface carefully. **[fetch-quote]**

### R7. HumanLayer, "Skill Issue: Harness Engineering for Coding Agents"
URL: https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents
What: Argues weak agent results are configuration problems, with concrete config practices.

- R7.1 "not a model problem. It's a **configuration problem**." When an agent errs, engineer a fix "such that the agent never makes that mistake again." **[fetch-quote]**
- R7.2 Root AGENTS.md/CLAUDE.md: concise, hand-written, universally applicable, under 60 lines, with progressive disclosure to other docs. The article cites a study that LLM-generated files hurt performance. **[fetch-quote]**
- R7.3 MCP tool descriptions consume context on every turn. Disable unused servers. Prefer a CLI for well-known tools. Wrap big APIs in a lean CLI and document only the commands used. **[fetch-quote]**
- R7.4 Skills: `SKILL.md` loads on activation, bundled files only when `SKILL.md` says so. Skills cannot bundle MCP servers, so ship tools as CLIs or packages. **[fetch-quote]**
- R7.5 Sub-agents as a context firewall. They return condensed answers with `filepath:line` citations. Run the orchestrator on an expensive model and workers on cheap ones. Scope each worker's role, must-not list, return format, and tools. Generic personas ("frontend engineer") were ineffective. **[fetch-quote]**
- R7.6 Stop hook runs formatter and typecheck, is silent on success, and on failure writes to stderr and exits with code 2 to force the agent to keep fixing. **[fetch-quote]**
- R7.7 Back-pressure: swallow passing output and surface only failures. Run test subsets rather than the full suite. **[fetch-quote]**
- R7.8 Instruction budget and the "dumb zone": bigger context windows do not fix retrieval. Start simple, add configuration only after a real failure, and delete what does not help. Pre-installing many skills or MCP servers "just in case" backfired. **[fetch-quote]**

### R8. Inngest, "Your Agent Needs a Harness, Not a Framework"
URL: https://www.inngest.com/blog/your-agent-needs-a-harness-not-a-framework
What: Argues that state, retries, traces, and concurrency belong in the harness as infrastructure.

- R8.1 Each LLM or tool call is a durable step, so completed work survives a crash. Steps retry independently. "one line of configuration" gives one run per session, and a new message cancels and restarts the run. Event history is "an audit trail." **[fetch-quote]**
- R8.2 Context pruning (old tool results soft-trimmed or cleared, last three turns kept), session compaction past a token threshold, and overflow recovery (force-compact and retry without spending an iteration). **[fetch-quote]**
- R8.3 Open problems named: pause/resume for human approval (`waitForEvent`) and mid-run steering. **[fetch-quote]**

### R9. sawinyh, "Greenfield AI, Brownfield AI, and the Vibecode You Just Inherited"
URL: https://sawinyh.com/blog/greenfield-vs-brownfield-ai-codebases
What: Taxonomy of codebases and playbooks for installing guardrails into them.

- R9.1 Three types: AI-first greenfield, true legacy brownfield, vibecode inheritance (about six months old, no tests or linter). The most predictive trait is "whether guardrails exist and are enforced." **[fetch-quote]**
- R9.2 Layered instructions: root `CLAUDE.md`, `.claude/rules/*.md` for domains, and `<module>/CLAUDE.md` for local overrides. **[fetch-quote]**
- R9.3 Ratchets: new files at most 300 lines, and existing files over 300 may only shrink. New silent catches are rejected while existing ones stay. Lint runs on each agent edit. "the code can't get worse, and bug fixes aren't blocked." **[fetch-quote]**
- R9.4 Baselining: one auto-fix commit, then a checked-in baseline file (`.lint-baseline.json` or betterer), with CI failing only when the count grows. Lint changed files only. Hard rules ship as errors, soft rules as warnings and get promoted per module. **[fetch-quote]**
- R9.5 Feature-folder refactor. Pick the first module by git churn (`git log --since=3.months --name-only ...`), production incidents, and questions from new team members. Target layout: thin entry file, `constants.ts`, `errors.ts`, `types.ts`, `validate.ts`, `security.ts`. **[fetch-quote]**

### R10. "Harness Engineering for Language Agents: The Harness Layer as Control, Agency, and Runtime" (preprint)
URL: https://www.preprints.org/manuscript/202603.1756
What: Position paper with a control-agency-runtime (CAR) decomposition, a HarnessCard reporting template, and evaluation recommendations.

- R10.1 Harness H = <C, A, R>. Control = durable artifacts that shape a step before it happens (AGENTS.md, tool descriptions, architecture rules, tests, linters, permission policies). Agency = how the model may act (action substrate, planner-verifier or orchestrator-worker structure, reviewer roles). Runtime = what happens over time (context assembly, memory and compaction, checkpoints, retries, approval flows, budgets, traces, replay). **[fetch-quote]**
- R10.2 HarnessCard required fields: base model, control artifacts, runtime policy, action substrate, execution topology, feedback stack, governance layer, observability, evaluation protocol. Recommended: release artifacts and known limitations. **[fetch-quote]**
- R10.3 Evaluate trajectories and outcomes, not output strings. Report action budgets, retries, checkpoints, graders, and human interventions. Report the "envelope of success" (budget ceilings, side effects, approvals, recoverable or terminal failures). Disclose when the harness, not the model, recovered from a failure. Run layer-aware ablations, changing one layer at a time. **[fetch-quote]**

### R11. Many Hands Engineering (mseeks), `many-hands-engineering.typ`
URL: https://github.com/mseeks/many-hands-engineering (PDF is the linked file; source read from the clone)
What: A handbook one level above a single agent's harness. It covers shared commons, planned vs emergent decisions, approval economics, guardrails, and entropy. Its Part IV says harness engineering is "a critical layer of terrain," and it defers to harness practice where that practice is developed.

- R11.1 Every loop has five stages (Signal, Action, Verification, Commit or revert, Update) and six ingredients: signal, bounded action, verification from an outside reference, reversibility, signal update, authority surface. "Loops that don't close aren't loops; they're fire-and-forget scripts that accumulate debt." **[src]**
- R11.2 Guardrails in four classes: structural ("can this even happen?"), reactive ("did this just happen?"), dynamic ("is the system drifting?"), reflective ("are our guardrails still working?"). Grade each on coverage, latency, blast radius, false-positive rate, and recovery cost. "A review gate with a 95% approval rate is rubber-stamping." **[src]**
- R11.3 Approval economics: gate (which proposals need a human), rate (approval rate per agent per class), budget (human approvals per week). Governing inequality: "Proposals entering gates per week ≤ approval budget × (1 − false-approval tolerance)." Move gates by class based on measured approval rate. **[src]**
- R11.4 Entropy has three fronts: decay (expiring signals, trust grants, and conventions), garbage collection (loops that find doc drift, constraint violations, dead code), and adversarial pressure. Cadence: daily jitter and cache misses, weekly fault injection and mutation tests, monthly red-team and trust review, quarterly removal experiments. "Subtraction reveals what addition concealed." **[src]**
- R11.5 "Trust belongs to a task class in a specific environment. Change the environment, and some trust resets." An action is irreversible "if undoing it costs more than not doing it." **[src]**
- R11.6 Start with one small closed loop end to end (dependency patch loop is the canonical starter). "The platform grows by adding loops, not by making any single loop smarter." **[src]**
- R11.7 Health signature: variety high but bounded, steady flow, escalations rare but real, internal signals correlate with outcomes, commons clean. "When internal signals diverge from external reality, it's the earliest and most important warning." **[src]**

### R12. LangChain, "Agent Frameworks, Runtimes, and Harnesses, Oh My!"
URL: https://www.langchain.com/blog/agent-frameworks-runtimes-and-harnesses-oh-my (followed from redirect)
What: A three-way split of what goes into each layer.

- R12.1 Framework = abstractions ("The main value add they provide is abstractions."). Runtime = durable execution, streaming, human-in-the-loop, persistence ("can power agent frameworks"). Harness = opinionated defaults on top ("batteries included": default prompts, planning tools, filesystem access). The author says the boundaries are blurry. **[fetch-quote]**

---

## 2. Ideas mapped to Garageband

Status key: **Yes** / **Partly** (a related station, file or mechanism exists) / **No** / **Track B** (already planned for the fork). Based on CONTEXT.md only.

Change key: **Skill** (new skill or change to an existing one), **AGENTS** (change to the project constitution), **Ticket** (sprint ticket), **Template** (ticket/handoff/ledger template), **TrackB** (fork feature).

| ID | Idea | Garageband today (CONTEXT.md) | Recommended change | Type |
|---|---|---|---|---|
| R1.1 / R7.1 | Each failure becomes a permanent guard | Partly: learn station, slop-lint; no stated rule that every failure yields a guard | Add "mistake to guard" step to learn and review: each failure must produce a lint rule, test, AGENTS line, or skill edit, logged in the ledger | Skill + AGENTS |
| R1.2 / R7.2 | Short hand-written AGENTS.md as a map, detail in indexed docs | Partly: AGENTS.md constitution exists; length and structure unknown | Audit length; move detail to indexed docs; CI check that every link resolves; no LLM-written AGENTS.md lines without a failure behind them | Ticket + AGENTS |
| R1.3 / R5.1 | Lint messages carry remediation text; guides and sensors labeled | Partly: slop-lint, CI gates | Every custom check prints a fix instruction; AGENTS.md labels each rule as guide (feedforward) or sensor (feedback) and lists guides with no sensor as debt | Ticket + AGENTS |
| R1.4 / R2.4 | Browser validation of UI work before "done" | Partly: test station, Docker factory box | Add a browser-verify step (Playwright in the worktree) to the test station; a screenshot or trace is required evidence | Skill (new: browser-verify) |
| R1.5 / R11.4 | Recurring garbage collection and doc-gardening sweeps | Partly: maintain and watch stations | Hourly Chief wake runs a sweep that opens small cleanup tickets (dead code, stale docs, overdue ratchets); cadence table in maintain | Skill (maintain) + Ticket |
| R1.6 / R6.1 | Self-review loop until reviewers are satisfied; escalate only when judgment is needed | Partly: review station, cross-model review, escalation after 3 attempts | Cap review rounds, then escalate; define what counts as "judgment needed" | Skill (review) |
| R2.1 / R3.3 | Machine-readable acceptance list per ticket; builders may only flip `passes`; tests immutable to builders | No: ticket templates exist; no acceptance file | Add `acceptance.json` per ticket. Builders may only change `passes`. A guard blocks builder edits to the acceptance file and test files | Template + Ticket; TrackB for per-provider enforcement |
| R2.2 | One feature per session, handoff with progress notes | Yes: slices, one ticket per delegate, handoff notes | Handoff must list what was verified and what was not | Template |
| R2.3 / R2.5 | Startup routine (pwd, log, progress, pick, boot, smoke test) and the four named failure modes | Partly: Chief hourly wake; no written routine for builders | New "resume" skill for the Chief and each builder: read ledger tail, pick one ticket, boot, smoke test before new work. Add the four failure modes to the review checklist | Skill (new: resume) + Skill (review) |
| R3.1 | Separate planner, generator, evaluator | Yes: Chief plans, builders build, a different model reviews | None. Write down that the reviewer never sees the builder's self-assessment as evidence | AGENTS (note only) |
| R3.2 / R5 slices | Sprint contract: builder proposes done criteria and verification; reviewer agrees before build | Partly: spec, slice, design stations | Slice station requires a contract block in the ticket (done criteria, exact verify command) reviewed before delegation | Skill (slice) + Template |
| R3.4 / R11.2 | Calibrate the reviewer with graded past examples; measure reviewer drift | No | Build a calibration set of about 10 past PRs with human verdicts. Re-run it when a reviewer model or prompt changes. Track approval rate (rubber-stamp detection) | Skill (new: review-calibration) + Ticket |
| R3.5 / R8.2 | Fresh session per ticket versus compaction; context pruning and overflow recovery | Unknown; no mention in CONTEXT.md | Default to fresh session per ticket. Record overflow failures in the ledger | Ticket; TrackB |
| R3.6 / R7.8 / R11.4 | Stress-test each harness component; remove one at a time; quarterly subtraction experiments | No | Quarterly experiment: disable one skill or rule, run a fixed canary ticket set, keep the removal if quality holds | Skill (maintain) + Ticket |
| R4.2 / R7.3 | Offload large tool output to a file and return head and tail | Unknown | Write full tool output to an artifact file; the Chief receives head, tail, and a path | TrackB |
| R4.4 / R4.5 / R7.6 | Keep working until acceptance passes (exit interception); verification hook returns failures | Partly: Claude Code guard hook exists; hourly wake | Stop hook: if `acceptance.json` still has a `passes: false` entry, re-prompt with the failing item. Stop hook runs typecheck and tests, quiet on success, exit 2 on failure | Ticket (guard hook) + TrackB |
| R5.2 | Split checks into cheap per-change versus expensive pipeline | Partly: CI gates vs AI review | Document which checks run per change and which run in the pipeline | AGENTS |
| R5.3 | Architecture fitness functions as tests | No | For the Garageband skills repo: a structural test that every skill's references resolve and every station is covered | Ticket |
| R5.6 | Behaviour correctness is the hardest category | Partly | Note as a known gap in validate and test stations; rely on acceptance checks | AGENTS (note) |
| R6.2 / R7.8 | Start simple; add a station or skill only after a real failure | No explicit rule | Add the rule to AGENTS.md. Each new skill cites the failure that justified it | AGENTS |
| R6.3 / R7.3 | Tool definitions with examples, edge cases, absolute-path rules; MCP description budget | Partly: T3 orchestration tools (delegate_task etc.) are upstream | Audit the orchestration tool descriptions for example usage and boundaries. Count tokens per provider; disable unused MCP servers per station | TrackB (T3 tools are upstream, so do not edit them directly) |
| R7.4 | Progressive disclosure in skills | Yes: 37 plain-text skills | Check each skill's size; move bulk into bundled reference files loaded on demand | Skill (audit) |
| R7.5 | Sub-agent return format: condensed answer with `file:line` citations; scoped role, must-not, return format | Partly: delegate_task returns status | Standard return block in the handoff template (files changed, lines, verified, not verified) | Template |
| R7.7 | Quiet success; run changed-file subsets | No | Wrap test, lint, and typecheck commands so passing runs print one line and failures print the errors | Ticket (scripts) |
| R8.1 | Durable per-step checkpoints, per-step retry, one run per ticket | Partly: ledger, Trello mirror; no step-level resume | Each delegate run logs step events in the ledger so a crashed run resumes instead of restarting | TrackB |
| R8.3 | Pause and resume for approvals | Track B (phone approvals planned) | Include in the approval design; resume must not re-run completed steps | TrackB |
| R9.1 | Classify the repo (greenfield, brownfield, vibecode) and score guardrail coverage | Partly: validate station | Validate outputs a repo class and a guardrail coverage score; the score sets how much autonomy to allow | Skill (validate) |
| R9.2 | Layered instructions (root, rules directory, per-module) | Partly: root AGENTS.md only, per CONTEXT.md | Add per-area AGENTS.md for the skills repo; project-level overrides for shipped projects | AGENTS; TrackB (per-provider constitution injection) |
| R9.3 / R9.4 | Ratchets and baselines for file size, silent catches, `any` in new code; diff-scoped lint; tiered severity | Partly: CI quality gates, slop-lint | Ratchet in CI: counts can only shrink. Baseline file for existing violations. Lint changed files on each push | Ticket |
| R9.5 | Pick refactor targets by churn and incidents | Partly: maintain station | Maintain ranks hotspots with the git churn command and incident count | Skill (maintain) |
| R10.1 | Control, agency, runtime as a diagnostic lens | No | Use as a checklist when architect or explain writes a plan | Skill (architect) |
| R10.2 / R10.3 | HarnessCard-style manifest per release; report budgets, retries, interventions | No | Ledger fields per run: attempts, cost, retries, human interventions. A manifest per factory release lists models, control files, gates, and budgets | Template + TrackB (release) |
| R11.1 | Each recurring loop declares its six ingredients | Partly: hourly wake, merge, sweep | Each loop skill states signal, bounded action, verifier, revert path, ledger update, and authority | Skill (each loop) |
| R11.3 / R3.6 | Approval rate per provider and task class; gates by class; auto-merge for classes above threshold | No: Chief merges approved PRs; approvals per class not measured | Ledger records approval and rework per provider and class. Start with auto-merge for docs and patch-level dependency bumps only | Template + Ticket; TrackB (measure) |
| R11.5 | Define "irreversible" for this factory | No | Add to AGENTS.md: merge to main, secrets, spend, and deploys are irreversible and need a gate | AGENTS |
| R11.6 | Make one closed loop work end to end before adding more | Yes-ish: 19 stations and a Track B plan | Name the first closed loop explicitly and measure it before adding the next | Ticket |
| R12.1 | Framework / runtime / harness split | Informs Track B scope | Track B is runtime plus harness. Do not rebuild T3's orchestration layer; configure it | TrackB (scope note) |

---

## 3. Cross-cutting principles

1. **Failures are configuration problems, so fix the environment.** Each failure should end in a permanent change to the repo or harness (R1.1, R7.1, R8, Hashimoto's rule quoted in R7.1 and in R11 Part IV). Sources: R1, R7, R11.
2. **Guides and sensors come as a pair.** Feedforward rules alone are never checked; feedback alone repeats mistakes (R5.1). Lint messages that tell the agent how to fix the error are the cheapest bridge (R1.3). Sources: R1, R5, R7.
3. **Keep the map short and push detail into indexed files.** AGENTS.md around 60 to 100 lines, with links (R1.2, R7.2). Progressive disclosure for skills (R7.4, R4.2). Sources: R1, R4, R7, R9.
4. **Each unit of work is one feature or ticket, with state in files outside the model.** Feature lists, progress logs, git history, handoff notes, and ledgers survive context resets (R2, R3.5, R8.1, R10.1). Sources: R2, R3, R8, R10.
5. **Verification comes from outside the generator, and self-approval is the failure mode.** Separate evaluator, calibrated and tuned against human judgment (R3.1, R3.4). Verify through the real UI, not only unit tests (R2.4, R1.4). Sources: R2, R3, R6, R11.
6. **Deterministic checks beat model judgment where possible.** Hooks, ratchets, structural tests, and fitness functions (R5.2, R7.6, R9.3). Model judgment is used for what cannot be checked mechanically (R5.2). Sources: R5, R7, R9, R11.
7. **Keep only what is load-bearing, and test that.** Each component encodes an assumption that goes stale (R3.6). Subtraction experiments reveal hidden dependencies (R11.4). Start simple (R6.2, R7.8). Sources: R3, R6, R7, R11.
8. **Entropy needs a standing, scheduled loop.** Garbage collection, doc-gardening, and ratchets run continuously in small increments (R1.5, R5.4, R11.4). Sources: R1, R5, R9, R11.
9. **Context is a budget, and bigger windows do not fix it.** Sub-agents act as context firewalls, and tool output should be trimmed (R7.5, R7.7, R4.3). Sources: R4, R7, R8.
10. **Trust is scoped to a task class and can be revoked.** Approval rates per class decide where gates sit (R11.3, R11.5). Irreversible actions always get a gate (R11.5). Sources: R10, R11.
11. **Report harness-level results, not just model results.** Budgets, retries, interventions, and the cause of recovery belong in the record (R10.2, R10.3). Sources: R3, R10, R11.
12. **Clean terrain matters more than clever loops.** Build one closed loop at a time (R11.6). Classify the repo first, because guardrail presence predicts success (R9.1). Sources: R9, R11.

---

## 4. Top 8 recommendations for Garageband (ranked by value)

1. **Mistake-to-guard rule.** Each failure must produce a lint rule, test, AGENTS line, or skill edit, logged in the ledger (R1.1, R7.1). Skill change to learn and review, plus AGENTS.md.
2. **Acceptance file per ticket.** A `passes` flag per criterion. Builders can only flip `passes`, and a guard blocks edits to the acceptance file and tests (R2.1). Template plus guard hook.
3. **Reviewer calibration and skill evals.** Calibration set of about 10 past PRs with human verdicts, and a no-skill baseline for each skill (R3.4, R11.2). New skill plus sprint ticket. See also the Evals section of the README, outside this slice.
4. **Resume routine for the Chief and every builder.** Read ledger tail, pick one ticket, boot, smoke test, then work (R2.3). New skill.
5. **Quiet-success back-pressure and a Stop hook.** Print failures only, run changed-file subsets, and re-prompt while acceptance has failing items (R7.6, R7.7, R4.4). Sprint ticket and guard hook change.
6. **Ratcheted CI gates with baseline files.** File size, silent catches, and `any` in new code can only shrink (R9.3, R9.4). Sprint ticket.
7. **Slice contract and handoff return block.** Done criteria and verify command reviewed before delegation, plus a standard return format with file:line evidence (R3.2, R7.5). Slice skill and templates.
8. **Approval rate per provider and task class.** Ledger fields for approval, rework, retries, and interventions. Auto-merge only for classes above a threshold, starting with docs and patch bumps. Quarterly subtraction experiment (R11.3, R3.6, R10.3). Template plus sprint ticket, with TrackB measure later.

---

## 5. What I could not open or verify

- **Line 52 (survey, "Agent Harness for Large Language Model Agents", preprints.org 202604.0428):** commented out in the README with a 403 FIXME. Not opened.
- **All WebFetch quotes** are summarizer output, not verbatim page text. Verify before quoting publicly. Only R11 quotes are verbatim, from source.
- **R1 (OpenAI):** The "~1M lines" and "zero manually written code" claims come from the summary and from Many Hands §4.2, not from the OpenAI page text. Treat as unverified.
- **R2 (Anthropic):** The JSON feature-list example and the exact prompt wording come from the summary. The original prompts were not read.
- **R4 and R12 (LangChain):** The first fetch was redirected from blog.langchain.com to langchain.com. Both pages were then read through the redirect target.
- **R10 (CAR paper):** Only the first 100,000 of 108,385 characters were read. The last 8,385 characters are unread, which may include the compact main-text table (Table 5). The HarnessCard fields come from Appendix B.1.
- **R11 (Many Hands):** I read the Typst source, not the PDF. Read in full: §2.10, §2.11, §2.12, §3.1 to §3.3 (top), §3.6, §3.11, §4.1, §4.2. Not read in detail: §1 (the turn, placement), §2.1 to §2.9, §3.4, §3.5, §3.7 to §3.10, §4.3 to §4.5, the coda. These may contain more usable detail, especially §2.3 (placement) and §3.4 (staged transition).
- **Garageband itself:** I did not clone `milllenialfalcon/Garageband`. All "today" statuses come from CONTEXT.md. Check them against the repo before writing tickets.
- **Not run:** no code from any clone was executed.
