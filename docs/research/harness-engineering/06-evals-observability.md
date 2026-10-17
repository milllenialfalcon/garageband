# 06. Evals & Observability: study for Garageband

Scope: the "Evals & Observability" section of `scratchpad/ahe/README.md` (lines 128-156), i.e. Evaluation Design, Verification & Quality Gates, and Telemetry/Tracing/Performance.

Garageband baseline used for the gap checks: the public repo clone at `scratchpad/ahe-study/src/Garageband` (skills, hooks, CI template, ledger template). The local copy at `/home/claude/garageband` was not diffed against it.

Quotes are short and taken from the page or file named. Anything marked (inferred) is my reading, not something the source states.

---

## Part 1. Resources

### Evaluation Design

**E1. OpenAI, "Testing Agent Skills Systematically with Evals"** (developers.openai.com/blog/eval-skills). Opened via WebFetch.
- Turns one agent run into an eval: "a prompt → a captured run (trace + artifacts) → a small set of checks → a score you can compare over time."
- Run with `codex exec --json`, so each run's stdout is a JSONL event stream (`item.started`, `item.completed`, `turn.completed`). Checks match `command_execution` items and read `usage.input_tokens` / `usage.output_tokens` from `turn.completed`.
- Deterministic checks come first. Examples: did `npm install` run, does `package.json` exist, were commands run in order, command count (catches loops), token budget (catches prompt bloat), `git status --porcelain` clean.
- Rubric grading is a second, read-only agent that returns JSON under `--output-schema` (`overall_pass`, `score` 0-100, `checks[{id,pass,notes}]`). Quote: "deterministic and debuggable" checks come first, with model grading "where rules fall short."
- Prompt set: 10-20 prompts per skill, with `should_trigger` true and false cases, including a negative control.
- Important caveat: the post does not do a with/without-skill comparison. It compares scores across skill versions over time (the page says so).

**E2. OpenHands, "How to Evaluate Agent Skills (And Why You Should)"** (openhands.dev/blog/evaluating-agent-skills). Opened via WebFetch.
- Minimum comparison is no-skill vs. with-skill on the same task. Quote: "Without the no-skill baseline, a passing result says little, since the model might have passed anyway."
- Each condition appears to use 10 attempts (inferred from the 0/10 and 10/10 tables; the article does not say this outright). No statistical test is reported.
- Tasks must be finishable in one run and produce one artifact (for example a `report.json`). Each task has a deterministic verifier (exact structure, filter correctness, arithmetic, sheet names). Deterministic output sort order is specified so it can be checked.
- Results table (from the article): dependency audit 0/10 without the skill vs 10/10 with it (266s / 53 events vs 109s / 22 events). Financial extraction 9/10 vs 10/10 (mostly consistency). Sales pivot 7/10 vs 8/10, and one model regressed in Cloud. The article reports results across five models and warns that aggregates hide per-model differences.
- Order: pass/fail first, then runtime and traces. Traces are used to explain outcomes: unnecessary exploration in no-skill runs, "overconstraint or brittle recovery" in failed skill runs.

**E3. OpenAI, "Agent evals"** (platform.openai.com/docs/guides/agent-evals, redirects to developers.openai.com/api/docs/guides/agent-evals). Opened via WebFetch.
- Key concepts: traces (one run's model calls, tool calls, guardrails, handoffs), graders that score traces "with structured criteria," datasets and eval runs for repeatability.
- Process: start with traces while debugging, then move to datasets and eval runs once "good" is defined.
- Thin page. Evals and grader details live in other guides that I did not open.

**E4. OpenAI, "Evaluation best practices"** (developers.openai.com/api/docs/guides/evaluation-best-practices). Opened via WebFetch.
- Build datasets from production data, expert examples, logs, and synthetic data, and avoid sets that "don't faithfully reproduce production traffic patterns."
- Grader guidance: metric-based graders are fast but miss nuance. Human graders need a scorecard, examples of each score level, and consensus. LLM-as-judge needs checks for position and verbosity bias, pairwise or pass/fail, and validation against human labels "before scaling up."
- "Score each architecture layer separately": instruction following, functional correctness, tool selection, argument precision, handoff accuracy.
- "Log everything" during development so logs can be mined for eval cases.

**E5. OpenAI, "Trace grading"** (platform.openai.com/docs/guides/trace-grading, redirects to developers.openai.com/api/docs/guides/trace-grading). Opened via WebFetch.
- Trace grading means assigning structured scores or labels to a whole trace so you can "find errors at scale."
- The page is a dashboard walkthrough (Logs > Traces > Grade all). It does not cover grader types, rubric detail, span-vs-trace scope, or cost. Treat this one as thin (inferred from the page content).

**E6. Inspect AI** (inspect.aisi.org.uk). Opened via WebFetch (docs site only, not the repo).
- Primitives: Task = dataset + solver + scorer, registered with `@task`. Solver is a single `generate()` or a full tool-using agent. Scorers can be text comparison or model grading.
- Sandbox per task (Docker, Kubernetes, Modal, and others), with custom and MCP tools and built-in bash, python, and browser tools.
- Results are viewed with `inspect view`. The page does not describe the log format, epochs, or repeat handling. Repetition shown is `react(attempts=3)`, which is per-agent retry, not dataset-wide repeats.
- Not opened: the repo or log-format docs.

**E7. Anthropic, "Demystifying evals for AI agents"** (anthropic.com/engineering/demystifying-evals-for-ai-agents). Opened via WebFetch.
- Vocabulary: task, trial, grader, transcript (trace), outcome (final environment state, not the agent's claim), suite. Quote: outcome is "the final state of the environment… rather than what the agent claims."
- Grader tradeoffs: code-based are "fast, cheap, objective, reproducible" but brittle. Model-based are flexible but non-deterministic and need calibration. Human graders are the gold standard but slow.
- pass@k (at least one success in k) vs pass^k (all k succeed). Quote: at a 75% per-trial rate, pass^3 is about 42%. Use pass^k for anything customer-facing or repeated.
- Balanced sets: test both "should happen" and "should not happen" cases. "One-sided evals produce one-sided agents."
- "Reading transcripts" from many trials is how you find out whether a failure is a real agent mistake or a grader rejecting a valid solution. "Failures should seem fair."
- Start with 20-50 tasks drawn from real failures, not hundreds. If a task fails 0% across many trials, suspect the task first.

**E8. LangChain, "Evaluating Deep Agents: Our Learnings"** (langchain.com/blog/evaluating-deep-agents-our-learnings, redirected). Opened via WebFetch.
- Three levels: single-step (one decision point; "Regressions often occur at individual decision points"), full-turn (trajectory plus final response plus artifacts), and multi-turn (conditional checks that stop early, so the test is not hardcoded to every branch).
- Single-step tests are the cheap unit tests. Full-turn tests are the end-to-end checks.
- Reproducibility: fresh clean environment per test (for example a temp dir per case), recorded API responses replayed (vcr or a proxy), and LLM-as-judge only for fuzzy checks.
- Judge outputs are logged as named booleans (for example `memory_updated`).

### Verification & Quality Gates

**V1. Thoughtworks / Fowler, "Assessing internal quality while coding with an agent"** (martinfowler.com/articles/exploring-gen-ai/ccmenu-quality.html). Opened via WebFetch.
- The fetch shows a manual workflow: the author pasted compiler errors back into the agent by hand, used git as a rollback when a direction went wrong, and reviewed diffs directly.
- The README's description ("moving quality checks into the loop") does not match what the fetch returned. Either the summary missed in-loop automation or the article does not make that point. I did not verify which.
- Failure modes worth copying into our checks: an agent-made `apiToken ?? ""` convention that the author called "not idiomatic"; an unnecessary cache the agent "couldn't explain why"; a phantom GitHub-only feature built for GitLab; and duplicated URL logic that missed the base-URL override used by tests.
- Lesson: "the generated code worked" but added complexity and subtle issues. A reviewer with domain experience caught it.

**V2. Better Harness (QoderAI)** (github.com/QoderAI/better-harness). Cloned to `scratchpad/ahe-study/src/better-harness` (commit 840ff54, 2026-10-13). Read: README, `models/agent-work-loop.md` (the evaluation model), `references/loop-engineering/loop-state-ledger.md`, `references/loop-engineering/learning-loop-research-basis.md`, and `references/session-evidence/session-usage-efficiency.md` (partly). Did not run it.
- The core rule: "Passing a current check proves that the intervention was exercised; only a comparable later result can prove that the loop improved." The README puts it as: "The static final frame… shows recorded trends, not causal proof of improvement."
- Evidence ladder: `Present` → `Wired` → `Exercised` → `Outcome-supported`, with score ceilings of 74 / 84 / 94 / 100. A configured capability "is not observed use." A ceiling is a cap, not a score formula.
- Change Validation (three checks): **Relevant Verification** (the final material change must be mapped to the smallest project check that covers it, and run after the last edit; "a broad unrelated suite or older result does not pass"); **Failure Diagnosis and Repair** (reproduce, localize, hypothesize, repair at the smallest owner); **Post-repair Revalidation** (the same check must run again on the repaired final state). Failure, edit, then pass is a "repair candidate" until reproduction and diagnosis are also retained.
- Learning-loop stages from `learning-loop-research-basis.md`: "evaluate: A held-out or paired comparison decides whether the artifact is kept." Maintenance: "Prune by measured utility, not by age."
- Ledger rules: a state ledger is needed when "the loop compares results across runs," and it should store "references to evidence instead of raw private transcripts." The ledger holds status, attempts, evidence refs, validation result, stop condition, and stop evidence.
- Longitudinal validation: a comparable baseline, a primary metric, a guardrail, a later window, and a stop/revert rule.

**V3. OpenHands, "Learning to Verify AI-Generated Code"** (openhands.dev/blog/20260305-learning-to-verify-ai-generated-code). Opened via WebFetch.
- Layered stack. Layer 1 (introduced): a small trajectory critic that scores the whole run in "sub-second to ~1s." Layer 2 (promised, not detailed): patch-level checks for repo conventions and footguns.
- Critic training: production traces, not benchmarks. Each segment gets 24 "trace-observable" rubric features (for example misunderstood intent, scope creep). Sparse outcome labels: code survival (about 4%) and PR merge (about 6%).
- Results: AUC about 0.45-0.48 when trained on benchmark data only. AUC 0.58 with PR-merge supervision and 0.69 with code-survival supervision. Best@8 on mixed-outcome SWE-bench: 57.9% random vs 73.8% critic. Early stopping averages 1.35 attempts vs 8.0.
- Uses: continue/stop/refine decisions, best-of-N reranking, early stop when a score clears a threshold.
- Cost: qualitative only. Free in the OpenHands CLI with its own provider.
- Relevance: the idea is a cheap per-run score that gates retries. Our equivalent would be a deterministic score, not a trained model.

**V4. LangChain, "Improving Deep Agents with harness engineering"** (redirected to langchain.com/blog/improving-deep-agents-with-harness-engineering). Opened via WebFetch.
- Harness changed, model fixed (gpt-5.2-codex). Terminal Bench 2.0 (89 tasks, Harbor, Daytona): 52.8% to 66.5%, moving from outside the top 30 to the top 5. Number of trials not stated.
- Harness changes: build-verify-fix system prompt; a PreCompletionChecklist middleware that intercepts exit and forces a verification pass against the spec; LocalContext middleware that maps directories and tools at startup; "testability" prompting; time-budget warnings; LoopDetection (per-file edit counts, then "reconsider the approach").
- Reasoning sandwich (xhigh / high / xhigh): 53.9% at xhigh only (timeouts), 63.6% at high only, 66.5% sandwich. More reasoning can "burn over 2x more tokens/time."
- Trace analysis is packaged as a reusable skill: fetch experiment traces, spawn parallel error-analysis agents, synthesize, then make targeted changes. Warns of "task-specific overfitting."
- Quote: "Harnesses should be tuned per model. Claude did worse because the improvement loop wasn't run for it."

**V5. Gap check against Garageband for this section.** Covered in Part 2.

### Telemetry, Tracing & Performance

**T1. OpenTelemetry GenAI semantic conventions** (opentelemetry.io/docs/specs/semconv/gen-ai/). The site page has moved to github.com/open-telemetry/semantic-conventions-genai. I cloned that repo to `scratchpad/ahe-study/src/semantic-conventions-genai` and grepped the docs. Did not read end to end.
- Files present: `gen-ai-agent-spans.md`, `gen-ai-spans.md`, `gen-ai-events.md`, `gen-ai-metrics.md`, `gen-ai-token-metrics.md`, `gen-ai-exceptions.md`, `mcp.md`, plus provider files.
- Span name `invoke_agent` is used in the agent spans doc. Token attributes are `gen_ai.usage.input_tokens` (and output counterpart).
- Content attributes are opt-in: `gen_ai.input.messages`, `gen_ai.output.messages`, `gen_ai.system_instructions`, `gen_ai.tool.definitions`, and `gen_ai.prompt.variable` are all marked `Opt-In`. Status badges on those rows read "development."
- Relevance: use these field names in the ledger and trace records so that other tools can read them later. Keep content off by default.
- Not verified: the full attribute list for agent and tool spans, and the metric names beyond the token metric.

**T2. AgentOps** (github.com/AgentOps-AI/agentops). Cloned to `scratchpad/ahe-study/src/agentops` (commit f8e907b, 2026-06-25). Read README and grepped `agentops/semconv` and `agentops/config.py`.
- Hosted by default: the config defaults to `https://api.agentops.ai`, with a self-host option documented in `app/README.md`. Our default must not send traces to a hosted endpoint.
- Semconv is partly pre-GenAI. Prompt content uses `gen_ai.prompt.{i}.content` and `gen_ai.completion.{i}.id`. I did not confirm whether content capture is on by default in the SDK (not verified).
- Decorators (`@session`, `@agent`, `@operation`, `@tool`, `@workflow`) build a span tree. Useful model for nesting: session → workflow → agent → tool.
- Cost tracking across providers is advertised but I did not inspect its pricing code.

**T3. agenttrace** (github.com/luoyuctl/agenttrace). Cloned to `scratchpad/ahe-study/src/agenttrace` (commit 15ed07f). Read README, `docs/PRIVACY.md`, `docs/guides/ci-integration.md`, and ROADMAP lines.
- Local-first TUI and reports for agent session logs (Claude Code, Codex, Hermes, OpenCode, Cursor exports, and others). Reports cost, tokens, time, and slow-run diagnosis.
- Honest capability levels per session: `Detailed`, `Aggregate`, or `Limited`. Quote from README: "so missing event-level evidence is never presented as a complete trace."
- Privacy-safe steps: tool-step metadata and durations, with "no prompt, response, result, or tool-argument body is stored in steps."
- CI gate: `agenttrace --overview --fail-under-health 80 --fail-on-critical --max-tool-fail-rate 15` exits with code 2 on failure. Baseline comparison: `--baseline agenttrace-baseline.json --baseline-max-duration-delta-pct 10 --baseline-max-cost-delta-pct 15 --baseline-max-token-delta-pct 20`.
- Recommended rollout: keep the job non-blocking with `|| true` while collecting evidence, then turn on the blocking flags once the output matches what the team cares about.
- Pricing comes from LiteLLM community metadata via `--update-pricing`. Estimated costs, not provider billing.
- Health score formula not inspected.

**T4. flameox** (github.com/morluto/flameox). Cloned to `scratchpad/ahe-study/src/flameox` (commit c7ea167). Read README and `docs/investigations.md`. Did not run it.
- Mostly about profiling and benchmarks, so only the claim discipline is relevant: "Profiles guide exploration but do not establish causality or performance improvement."
- Confirmatory claim needs: representative workload, a declared metric and estimand, compatible identities, preserved samples, a practical threshold (not only statistical significance), and a semantic oracle. "within_threshold does not establish equivalence."
- Experiment design: cases in blocks, a seed, paired comparison within blocks, and failed or oracle-invalid pairs excluded and reported as limitations. Fewer than three eligible pairs gives a descriptive estimate with no CI.
- Observed vs derived vs inferred claims are kept separate in every result.

**T5. ax** (github.com/Necmttn/ax). Cloned to `scratchpad/ahe-study/src/ax` (commit fca259c). Read README, `skills/retro/SKILL.md`, `docs/superpowers/specs/2026-06-12-improve-loop-v2-design.md`.
- The retro loop: accepted proposals become experiments with checkpoints at +3, +10, and +30 sessions. Quote from the spec: "Post-accept, the checkpoint system's *measured* `opportunities/addressed/ratio` replaces the estimate."
- Verdict set: `adopted`, `ignored`, `regressed`, `partial`, `no_longer_needed`. The algorithm suggests a verdict from measured use; the user locks it. `no_longer_needed` is never suggested automatically.
- Honesty rule: every estimate carries a `basis` and a `confidence` tier, "never a naked number."
- Caveat (inferred): the measured ratio is "addressed opportunities" (observed use), not a with/without comparison. It shows the rule was used, not that it caused the change.

**T6. Anthropic, "Quantifying infrastructure noise in agentic coding evals"** (anthropic.com/engineering/infrastructure-noise). Opened via WebFetch.
- Terminal-Bench 2.0: the gap between most- and least-resourced setups was 6 pp (p < 0.01). Infra error rate: 5.8% at strict 1x enforcement, 2.1% at 3x, 0.5% uncapped.
- Between 1x and 3x, success was within noise (p = 0.40). Above that, uncapped runs gained about 6 pp (p < 0.01).
- Recommendations: set a guaranteed allocation plus a separate hard ceiling, not one pinned value. Report the exact multiplier. Treat resource config as "a first-class experimental variable, documented like prompt format or sampling temperature."
- Statistics: binomial CIs already span 1-2 pp. "Treat leaderboard differences below 3 pp with skepticism until the eval configuration is documented and matched."
- Relevance: our runs use the same models across different CLIs, quota states, and times. Infra noise belongs in run metadata.

---

## Part 2. Ideas, Garageband status, and recommended change

Status key: **Yes** = present in repo as described. **Partly** = present but missing a piece. **No** = absent.

### Evaluation design

| # | Idea (source) | Garageband today | Recommended change |
|---|---|---|---|
| I-1 | No-skill baseline on every skill test, so a pass means something (OpenHands E2) | **Yes, partly.** `skill-lab` step 2 runs each task "once with the skill available, once without" in fresh sessions. Gap: the "without" condition is not required to strip the constitution (`AGENTS.md` / `CLAUDE.md`) or the skill from context, so the baseline may leak rules. (inferred from the skill text) | Add to skill-lab: "without" run must disable the skill and confirm the constitution is absent or masked. Record that check per run. |
| I-2 | Enough runs per condition, and report consistency (pass^k, OpenHands E2 / Anthropic E7) | **No.** skill-lab uses one run per task per condition. Its example decision table is 7/8 vs 5/8, which at n=8 is within noise (inferred, binomial standard error about 0.17 at 7/8). | Change skill-lab to k >= 5 runs per condition per model. Report pass counts plus pass^k (all k succeed). Decide only when the gap clears a practical threshold (for example 20 pp) and the runs are paired. Sprint ticket. |
| I-3 | Deterministic checks first, rubric grading second (OpenAI E1, E4) | **Partly.** skill-lab grading is rubric-by-model ("grader model… scores each output against the rubric"). Deterministic CI gates exist (`garageband-ci.yml`, `slop-lint.mjs`), but skill-lab does not use them. | Split every skill rubric into (a) machine checks run over the transcript and file tree (ordered commands, test-before-edit, fresh test output present, diff limited to ticket files) and (b) the model rubric for anything left. Only (b) needs the blind grader. |
| I-4 | One artifact per task, with a verifier that returns pass/fail (OpenHands E2) | **Partly.** `tdd-slice` and `ship-gate` require tests, but skill-lab tasks are free-form prompts in `.factory/skill-lab/<skill>/tasks.md`. | Require each skill-lab task to name one output file and one verifier command, as in the OpenHands example. |
| I-5 | Balanced sets: include "should not trigger" and "should not do X" cases (OpenAI E1 negative control, Anthropic E7) | **Yes.** skill-lab step 4 has 5 should-trigger and 5 should-not-trigger prompts. | Keep. Add: a "tempted to skip" task per skill (already advised in step 1) must be graded on the skipping behaviour, not on the final answer. |
| I-6 | Grade outcomes, not paths; check the environment state, not the agent's claim (Anthropic E7) | **Partly.** `slop-gate` and CI check the code, not claims. doubt-review reviews the artifact only (good). skill-lab rubric items like "wrote a failing test before code" grade the path, not the result. | Pair each path check with an outcome check where possible (test passes after the change, not only "wrote a test first"). |
| I-7 | Calibrate the grader against humans or known-answer items (OpenAI E4, Anthropic E7 "read transcripts") | **No.** doubt-review and skill-lab graders are never calibrated. Nothing tests whether the reviewer finds planted bugs. | Build a seeded-defect set: 10 small diffs with known bugs (some clean). Run every reviewer model on it before it reviews real PRs, and record recall and false-positive rate in `TEAM.md`. Use the same set when a model is changed. Sprint ticket. |
| I-8 | Read failing transcripts before blaming the agent or the task ("failures should seem fair") (Anthropic E7, LangChain V4) | **Partly.** retro-instincts step 1 reads ledger rows, reviews, and CI failures, not the transcripts. | Add to retro-instincts: for every ticket with attempts >= 2, read the transcript summary and label each failure as agent error, bad ticket, grader error, or infra error. Only the first two feed instincts. |
| I-9 | Start small: 20-50 tasks from real failures (Anthropic E7) | **Partly.** Skill tests are 3-5 tasks. | Seed skill-lab task sets from the ledger's failed rows and from the escalations, which are real failures. |
| I-10 | Score each layer separately: tool selection, arguments, handoffs (OpenAI E4, LangChain E8) | **No.** Model routing outcomes are recorded only as attempts and escalation. | In the ledger, record per row: which model built, which reviewed, attempts, first-pass result, and whether the reviewer's findings were valid. Enough to score the router, not only the ticket. |

### Verification & quality gates

| # | Idea (source) | Garageband today | Recommended change |
|---|---|---|---|
| V-1 | Map each material change to the smallest check that covers it, run it after the last edit, and re-run the same check after a repair (Better Harness V2) | **Partly.** `tdd-slice` writes tests first; CI runs the full `typecheck / lint / test / e2e` set for every PR. Nothing ties a ticket's acceptance criterion to a named test ID, and nothing requires the re-run after a repair to be recorded. | Add an `acceptance → test ID` line to each ticket. The author must paste the command and the result of that targeted test on the final commit. Doubt-review checks that the IDs exist. Sprint ticket. |
| V-2 | A cheap, deterministic gate that runs first, before expensive review (OpenHands V3 early stop; OpenAI E1 order) | **Yes, partly.** CI runs `slop-lint` and `gb-team --check` cheaply. The Claude Code `guard.sh` runs on every Bash call. The expensive step (doubt-review by a second model) runs whether or not CI passed (inferred from `doubt-review` text). | Make CI green a precondition for requesting an LLM review. Saves quota on PRs that fail a machine check. Small change in `ship-gate` / `doubt-review`. |
| V-3 | Failure reproduction before repair: reproduce, localize, hypothesize, repair (Better Harness V2) | **Partly.** `root-cause-debug` exists and is listed in the stack. Escalation (3 then 5 attempts) moves work to stronger models but does not require a reproduction artifact. | Require the failing command output saved to the ticket before any repair attempt; `attempts` increments only if the reproduction exists. Stops "guess and retry" loops that burn quota. |
| V-4 | Loop detection on repeated edits to one file, with a "reconsider" nudge (LangChain V4) | **No.** Escalation is by attempt count only. | Add a per-ticket "files touched per attempt" count to the ledger. A file edited in 3+ attempts triggers the root-cause-debug step before attempt 4. |
| V-5 | Verification pass before exit, against the spec (LangChain V4 PreCompletionChecklist) | **Partly.** `ship-gate` and `doubt-review` do this after the PR exists, not inside the build session. | Ask the builder to write a pre-exit checklist (acceptance criteria, each with the test ID) into the handoff before it stops. Cheap, no new tooling. |
| V-6 | A repeated, identical passing check does not prove a later change works (Better Harness V2) | **Partly.** The CI cache and re-runs are not tracked. | Tie the test evidence to the commit SHA in the ledger; re-run on any new commit. Already implied by the PR flow; make it explicit in `ship-gate`. |
| V-7 | Guardrails block but do not record (guard.sh) | **No.** `guard.sh` exits 2 with a message. There is no record of what was blocked, or how often. | Log each block to an append-only file (command, rule, ticket if known, model, timestamp). Repeated blocks become retro-instinct evidence. Track B audit log. Cheap. |

### Telemetry, tracing & performance

| # | Idea (source) | Garageband today | Recommended change |
|---|---|---|---|
| T-1 | Trace per run, with token and time counts per model call (OpenAI E1 JSONL, OTel T1) | **No.** Provider CLIs write their own session logs, but Garageband does not capture or index them. | Each factory run writes its provider JSONL (or equivalent) to `.factory/traces/<ticket>/<attempt>/`, with a small index row. Track B: store this in the audit log per provider, which the plan already calls for. Do not store prompt bodies in the index. |
| T-2 | Cost and tokens per ticket, not per month (agenttrace T3, cost-watch) | **No.** `cost-watch` reads the monthly bill. `model-router` reads quota by pool. No per-ticket cost, so model choice cannot be judged on cost per accepted change. | Add `tokens_in`, `tokens_out`, `est_cost`, `wall_min` columns to `.factory/ledger.md`. cost-watch and model-router read them. Track B: spend caps and the circuit breaker use the same fields. Sprint ticket. |
| T-3 | Honest capability level per trace: Detailed / Aggregate / Limited (agenttrace T3) | **No.** | When a provider gives no per-call usage, mark the row `Limited`. Never fill tokens with a guess. Matters because providers differ (inferred). |
| T-4 | Use portable field names so the traces outlive the tool (OTel T1) | **No.** | Name ledger/trace fields after GenAI conventions where a match exists (`gen_ai.usage.input_tokens`, `gen_ai.request.model`, `gen_ai.operation.name`), so agenttrace or ax can read the logs later without a converter. Recommendation only; I did not verify full attribute lists. |
| T-5 | Content off by default (OTel T1 opt-in attributes; agenttrace PRIVACY) | **Partly.** `AGENTS.md` and the stack handle secrets (guard.sh blocks `.env` piping). No written rule for traces. | Write in `AGENTS.md`: traces store metadata and tool-call names; prompt and tool-output bodies are off by default and never leave the machine. Do not use a hosted tracer by default (AgentOps's default endpoint is hosted). |
| T-6 | Local reader for cost and health spikes, with CI thresholds (agenttrace T3, ax T5) | **No.** | Optional: run agenttrace locally on the factory traces, then gate on `--fail-under-health` and `--max-tool-fail-rate` in a non-blocking job first (their own rollout advice). Low priority until T-1 and T-2 exist. |
| T-7 | Experiment checkpoints after N comparable events, then a verdict (ax T5) | **No.** The learning rule in `retro-instincts` (confidence 0.7 needs "the action proved to prevent a repeat") has no measurement behind it. | Intervention ledger. For each promoted instinct or skill edit, write the baseline (first-pass rate, attempts per ticket, cost per ticket for that family), then check again at +3, +10, +30 tickets. Verdicts: adopted, ignored, regressed, partial, no_longer_needed. Track B: a panel on the board. |
| T-8 | Separate observed use from measured effect (Better Harness V2 "configured is not observed"; ax caveat) | **No.** | In the instinct record, keep two fields: "was it used" (observed in trace) and "did the outcome change" (comparable later result). A rule can be used without helping. |
| T-9 | Infra-noise metadata on every eval run (Anthropic T6) | **No.** skill-lab runs do not record CLI version, model ID, time, quota state, or concurrency. | Store `{cli_version, model_id, date, quota_pool_remaining, concurrency}` with every skill-lab run. Compare only runs with matching metadata. Record infra errors separately from agent failures. |
| T-10 | Context pressure and long-session degradation as measured signals (agenttrace context pressure; ax) | **Partly.** `model-router` says "trim context at about 75%" and "start a fresh session" as advice. Nothing measures it. | Record context size at handoff in the ledger. Use it in retro to check whether the 75% rule holds. |
| T-11 | Profile and experiment claims need declared metric, threshold, and oracle (flameox T4) | **No**, but this is a discipline rather than a feature. | Use in `measure-outcome` and skill-lab: each decision names the metric, the practical threshold, and the test that proves correctness. Already close in `measure-outcome`. |

---

## Part 3. Top 8 recommendations, ranked by value

1. **Rebuild skill-lab around paired runs** (I-1, I-2, I-3, T-9): k >= 5 runs per condition, no-skill runs with the constitution stripped, machine checks over transcripts before any model grading, pass^k and a practical threshold in the decision table. This is the one that answers "does this change help." Sprint ticket.
2. **Capture every run's trace, tokens, cost and time into the ledger** (T-1, T-2, T-3): the base for every other measurement, and for model-router and cost-watch. Track B: per-provider audit log. Sprint ticket.
3. **Calibrate the reviewers with a seeded-defect set** (I-7, I-10): 10 diffs with known bugs, run on every reviewer model before it reviews real PRs. Record recall and false positives in `TEAM.md`. Sprint ticket.
4. **Intervention ledger for instincts and skill edits** (T-7, T-8): baseline, then checkpoints at +3, +10, +30 tickets, with verdicts. Turns the 0.7 confidence rule in retro-instincts into something measured. Track B: a board panel.
5. **Targeted verification per acceptance criterion** (V-1, V-2, V-6): each criterion mapped to a test ID, run on the final commit, and CI green before any LLM review is requested. Saves quota and matches the "relevant check" standard.
6. **Log every guard block** (V-7): append-only, with rule, command, model, ticket. Blocks that repeat become instinct candidates. Track B audit log. Small.
7. **Reproduce before repairing, and detect loops** (V-3, V-4): require saved failing output before each repair attempt, and trigger root-cause-debug when the same file is edited in three attempts.
8. **Read failed transcripts in retro, and label each failure** (I-8, I-9): agent error, bad ticket, grader error, or infra error. Seed skill-lab tasks from real failures. Cheap, no tooling.

---

## Part 4. What I could not open or verify

- **skill-lab as the founder runs it.** I read the public clone at `scratchpad/ahe-study/src/Garageband/skills/skill-lab/SKILL.md`. The local copy under `/home/claude/garageband` and any `.factory/skill-lab/` results were not read, so any real results in use are unknown.
- **OpenTelemetry GenAI.** Site page moved. I read the cloned repo only by grep, not end to end. Full agent and tool span attribute lists and metric names are unverified.
- **AgentOps.** Read README and semconv by grep only. Did not confirm whether prompt content is captured by default in the SDK, or how its cost tracking computes prices.
- **Inspect AI.** Read the docs site only. Log format, epochs, and reproducibility details unverified.
- **OpenAI "Trace grading" and "Agent evals."** Both pages are thin in the fetched text. Grader types, scoring scope (trace vs span), and cost are not covered there.
- **OpenAI "Testing agent skills systematically."** The post does not show the verifier code or the full JSONL schema. The `codex exec --json` event names are from the post's text.
- **Fowler CCMenu article.** The fetch did not show in-loop automation, which the README claims. Unresolved.
- **LangChain numbers.** Trial counts for the Terminal Bench run were not stated. The per-model results and variance are not in the post.
- **OpenHands learning-to-verify.** Blog only. Critic model weights, code, and the layer 2 patch checks were not available. Results are the blog's own.
- **Better Harness.** Read the evaluation model and reference docs. Did not run the CLI or read the host adapters. Repo commit 840ff54.
- **agenttrace health score, ax metrics, flameox claims.** Read the docs and specs, not the implementations. Did not run any of them.
- **Track B features.** "Board," "audit log," "spend caps," and "circuit breaker" are taken from `CONTEXT.md`. I did not inspect any design docs for Track B.
- **No code from any clone was run.** All clones were read as data only.
