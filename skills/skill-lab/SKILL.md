---
name: skill-lab
description: "Use when adding, editing or doubting any skill in the stack, or when moving to a new model, to prove the skill actually changes that model's behaviour. Runs the same test tasks with and without the skill on each model in use (e.g. Claude, Codex, DeepSeek), grades outputs blind against a rubric, checks the skill triggers when it should, and keeps, fixes or drops it."
license: MIT
metadata:
  stack: garageband
  phase: learn
  verified: "2026-10-13"
---

# Skill lab

A skill that reads well isn't the same as a skill that works, especially on cheaper models. Test it like code.

## 1. Define the test
For the skill under test, write 3–5 realistic task prompts in `.factory/skill-lab/<skill>/tasks.md`, including at least one where the model is tempted to skip the skill's discipline (e.g. "quick fix, no need for tests").
Write a rubric of 4–8 pass/fail checks taken from the skill's own rules (e.g. "wrote a failing test before code", "pasted fresh test output", "diff touches only ticket files").

## 2. Run with and without
For each model tier in use, run each task twice in fresh sessions: once with the skill available, once without. Save outputs (transcript summary, diff, files) under `.factory/skill-lab/<skill>/<model>/<with|without>/<task>/`. Use a scratch branch or copy of the repo; never run tests against shared databases.

## 3. Grade blind
A grader model that didn't run the tasks scores each output against the rubric without knowing which run had the skill. Record pass counts per check.

## 4. Check triggering
Write 5 prompts that should trigger the skill and 5 that shouldn't. Note whether each model loaded it. If it under-triggers, rewrite the description: start with "Use when…", front-load trigger words, describe situations rather than summarising the steps. If it over-triggers, narrow the situations.

## 5. Decide
```
Skill: tdd-slice
Model        with   without   triggered
Claude       7/8    5/8       5/5
Codex        6/8    3/8       4/5
DeepSeek     5/8    2/8       2/5  ← description fix needed
Decision: keep; rewrite description; add rationalisation row for "quick fix".
```
- Clear improvement → keep.
- No improvement on a model → shorten or rewrite for that model, or don't rely on it there (move the rule into CI if it matters).
- Worse → drop or revert.
Update the skill's `verified` date and record the result in `.factory/skill-lab/results.md`.

## Writing rules for skills (apply when fixing one)
- Keep SKILL.md short; move long reference material into a `references/` file the skill points to.
- Name the excuses a model will make and rebut them in a table.
- Concrete outputs (exact formats) beat advice.
- Anything critical should also exist as a machine check if possible.
