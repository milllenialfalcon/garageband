# Harness² (google-research/harness2), read 18 October 2026

**What it is:** a research framework from Google Research (paper arXiv:2610.14224, Apache-2.0, Python 3.12) that **improves an agent's harness automatically, task by task, without changing the model.** Repo read at commit 1cfe254 (13 Oct 2026). Nothing was run.

## How it works
- **A harness = 8 editable parts** (its `harness.yaml`): system prompt, guardrails, long-term memory, tool guidance, subagents, skills, scripts, plugins. The executor itself (OpenCode or Codex) is "frozen infrastructure"; only those files change.
- **Task-level recursion, Propose–Probe–Compose:** run the current harness on a task (`k` reference runs), have an editor model *propose* harness edits (general ones and domain-specific ones), *probe* each edit by re-running the same task, then *compose* a refined harness from the behavioural differences between runs. No answer key needed. Parallel mode explores `k` candidates wide; sequential mode refines `k` steps deep.
- **Harnessing-level recursion:** after each task, a reflector saves the adopted harness plus "evidence-supported lessons" (`EXPERIENCE.md`) into a per-domain library with an `INDEX.md`. Later tasks in that domain read only earlier entries.
- **Executors: OpenCode (default) and Codex**, the same tools our factory uses. Harness parts are injected the OpenCode way: prose into AGENTS.md, skills into `.opencode/skills/`, subagents into `.opencode/agent/`, plugins into `.opencode/plugin/*.ts`.
- **Guards worth copying:** `assert_no_grader_verdicts` / `assert_no_leak_paths` keep grading results and answer files out of the editor's context; a budget `Ledger` with `BudgetError` caps rollouts per task; runs resume, and the saved config refuses an incompatible resume.

## Results claimed (vendor-reported, not checked)
One Propose–Probe–Compose step improved **GLM-5 and Gemini 3.5 Flash**, which are cheap models, over their base harnesses: up to +11.5 points on WorkBuddy-Bench, +4.5 on JobBench, +11.8 percentage points partial pass on LAB. Bigger budgets gave more.

## What it means for us
1. **It targets exactly our weak spot.** Our builders are cheap models (DeepSeek, MiMo, GLM) running in OpenCode/Hermes. Tuning *their* harness (the brief format, guardrails, skills, helper scripts) is where gains are cheapest, and Harness² does that automatically.
2. **Our parts map 1:1:** system prompt / AGENTS.md → constitution; guardrails → AGENTS.md section 4 and the guard hook; memory → instincts and B5; skills → Garageband skills; scripts → gb-gate, slop-lint and the like; plugins → hooks; subagents → lanes.
3. **Cost warning:** every probe re-runs the whole task, so one step with `k=3` is about 6–10 executor runs per task. That's acceptable on OpenCode Go Flash models for a weekly tuning batch on replayed past tickets, not on every live ticket.
4. **Licence:** Apache-2.0, so the code can be reused with attribution. Benchmarks and datasets keep their own licences.

## Proposed use (after the sprint, B10 learning loop)
- **Harness profile per lane** in Enigma: store the builder harness as the same 8 parts, versioned, so it can be measured and evolved.
- **Weekly tuning run:** replay 5–10 finished tickets (their brief plus our gb-gate and reviewer as the judge) through Harness² sequential `k=2` on DeepSeek; adopt changes only if skill-lab (C1-07) shows a gain outside the noise band on held-out tickets, then a founder approval.
- **Copy now, cheaply:** the no-leak rule (builders and the editor never see reviewer verdicts or hidden checks) and the per-task rollout budget.
