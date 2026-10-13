---
name: decision-brief
description: "Use whenever a choice comes up during any Garageband stage — technical, design, product or vendor — to classify it as Mechanical, Taste or Founder Call and as a one-way or two-way door, then either decide and log it or present it to the founder as a short plain-English brief with a recommendation."
license: MIT
metadata:
  stack: garageband
  phase: cross-cutting
  verified: "2026-10-13"
---

# Decision brief

Most decisions should never reach the founder. The ones that do must be easy to answer in under a minute.

## 1. Classify

| Type | Test | What you do |
|---|---|---|
| **Mechanical** | There's a conventional right answer (naming, folder layout, which test runner, lint fixes) | Decide silently. Don't log. |
| **Taste** | Reasonable experts could differ, and it's reversible (component structure, copy tone within the voice, library choice between equals) | Decide, add a row to `docs/decision-log.md`, show it at the next gate. |
| **Founder Call** | Money, users, legal, data, security, scope, brand, anything in AGENTS.md "Ask first", or any one-way door | Never decide alone. Write a brief. |

**Door:** two-way = undo in under an hour with no lasting damage. One-way = data loss, money spent, users affected, public commitments, schema changes, vendor lock-in. **Every one-way door is a Founder Call.**

When unattended (AGENTS.md section 9): Taste decisions take your recommended option and are logged; Founder Calls stop that branch of work, everything else continues, and the brief waits for the founder.

## 2. Brief format (Founder Calls)

```
DECISION NEEDED: <question in one line>
Door: one-way | two-way      Deadline: <when it blocks work>

Options
A) <option> — what happens, cost in ₹/time, risk
B) <option> — …
C) Do nothing / defer — …

Recommendation: A, because <one or two sentences in plain English>.
What I need from you: reply "A", "B", "C" or ask a question.
```

Rules: no jargon without a 5-word explanation in brackets; real costs (money, days, risk to users) rather than adjectives; at most three options plus "defer".

## 3. Record

After the founder answers, add a row to `docs/decision-log.md`. If it's a structural decision, also write an ADR with **decision-log**.

## Red flags
- Asking the founder something Mechanical. That spends their attention on nothing.
- A Founder Call buried inside a long message. Each gets its own brief.
- "Recommendation: it depends." Pick one and say what would change your mind.
