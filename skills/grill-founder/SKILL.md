---
name: grill-founder
description: "Use when a request is vague or under-specified and you need the founder's intent before writing a spec, design or plan — new features, changed requirements, \"build me X\". Interviews the founder in short rounds of numbered plain-English questions, each with a recommended answer they can accept with \"yes\"."
license: MIT
metadata:
  stack: garageband
  phase: define
  verified: "2026-10-13"
---

# Grill the founder

The founder is not an engineer. Your job is to pull out what they want without making them do engineering. Ask about outcomes, users and trade-offs, never about implementation.

## Before asking anything
1. Read `PRODUCT.md`, `docs/glossary.md`, related specs and the ledger.
2. **Look things up instead of asking.** Anything answerable from the repo, the web or existing docs gets researched (by you or a research model, then checked with verify-research). Only ask what only the founder can know.
3. Build a question tree: list the open decisions and which ones depend on others. Ask prerequisites first.

## Each round
- At most **5 numbered questions** per round.
- Each question has: the question in plain English, why it matters in one line, **a recommended answer**, and 2–3 lettered options when there are real alternatives.
- Phrase it so "yes" or "1 yes, 2 b" accepts your recommendations.
- Label each question Mechanical / Taste / Founder Call. Don't ask Mechanical ones; decide them and list them at the end of the round as "Decided for you".

Format:
```
Round 2 of ~3 — scope and users

1. Who uses this first: just your farm staff, or customers too?
   Why it matters: customers need login, privacy and support; staff-only can skip most of that.
   Recommended: a) staff only for v1.   a) staff only  b) customers too  c) both, customers later
2. ...

Decided for you (tell me if any is wrong):
- Works on phones first, because your staff use phones in the field.
- English and Kannada text, from translation files.

Still open after this round: offline use, payments.
```

## Stop when
- Every acceptance criterion you'd write has an answer, or is listed as an explicit assumption.
- Or after 4 rounds. Then list remaining unknowns as assumptions with your recommended default, and move on.

## Output
Append a `## Founder answers` section to the working spec (or create `docs/specs/<slug>.md` from the template) with every answer, every "decided for you" item and every assumption. New terms go into `docs/glossary.md`. Founder Calls also go into `docs/decision-log.md`.

Next: **write-spec**.

## Red flags
| Thought | Instead |
|---|---|
| "I'll ask about the database / framework." | That's yours to decide. Ask about the outcome it serves. |
| "Let me ask everything at once." | Five per round, prerequisites first. |
| "They said 'like Uber for X', that's clear enough." | Ask which one behaviour of Uber they mean. |
| "I'll assume and not mention it." | Every assumption is written down and shown. |
