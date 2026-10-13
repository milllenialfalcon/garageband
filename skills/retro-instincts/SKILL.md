---
name: retro-instincts
description: "Use after each shipped feature, after any incident, at the end of a week of factory work, or when the same mistake happens twice. Runs a short retrospective from the ledger, reviews, CI failures and postmortems, records learned rules as instincts with evidence and confidence, and promotes only repeatedly confirmed rules into AGENTS.md or new CI checks with founder approval."
license: MIT
metadata:
  stack: garageband
  phase: learn
  verified: "2026-10-13"
---

# Retro and instincts

The factory gets better only if mistakes turn into rules. But rules from a single bad day make the constitution noisy. Instincts are the waiting room.

## 1. Gather evidence (don't rely on memory)
Since the last retro: ledger rows with attempts ≥ 2 or escalations; review findings by severity and by author model; CI failures; design-critique blocks; QA bugs that escaped to production; postmortems; Founder Calls that came too late; time from spec to ship.

## 2. Retro (one page, `.factory/retros/<date>.md`)
- What went well (keep doing).
- What went wrong, as patterns, each with evidence links.
- For each pattern: which gate should have caught it, and why it didn't.
- Which model tiers struggled with which work (feeds model-router).

## 3. Record instincts
Add or update rows in `.factory/instincts.md`. Each instinct:
- **Trigger** from the closed list in that file only (e.g. `on-schema-change`, `on-frontend-ticket`). If none fits, it's too vague to be a rule yet.
- **Action**: one sentence, checkable ("Every list endpoint has a limit and a test for page 2").
- **Evidence**: links to the incidents.
- **Confidence**: use the scale defined in `.factory/instincts.md` (0.3 one incident · 0.5 two incidents · 0.7 two or more and the action proved to prevent a repeat · 0.9 promoted).

## 4. Promote (with founder approval)
An instinct at 0.7:
- If it can be checked by a machine → add a CI check or slop-lint rule (best).
- Else → add one line to AGENTS.md section 3, 4 or 5, or to the relevant skill.
Show the founder: the rule, the evidence and where it'll live. On approval set it to 0.9, `promoted`. Promotion is a Taste decision unless it changes boundaries (then Founder Call). Retire instincts that haven't triggered in three months.

## 5. Improve skills
If a skill was followed and still failed, propose an edit to the skill and test it with skill-lab before adopting it.
