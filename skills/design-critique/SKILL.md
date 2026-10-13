---
name: design-critique
description: "Use after a UI ticket or design change is built and slop-lint passes, before merge. A fresh-context reviewer (not the author) screenshots the screen at four widths, scores it against ten usability heuristics, checks it against DESIGN.md, motion and copy rules, and returns a Before/After/Why table with an APPROVE or REQUEST CHANGES verdict. One fix round maximum."
license: MIT
metadata:
  stack: garageband
  phase: review
  verified: "2026-10-13"
---

# Design critique

Code review checks the code. This checks what users will see. The author never critiques their own screen.

## Setup
- Reviewer gets only: the preview URL or local run command, the spec's acceptance criteria, `PRODUCT.md` (users, screen mode), `DESIGN.md` and the slop-lint output. Not the author's explanation.
- Take screenshots at 375, 768, 1024 and 1440 px, plus the empty, loading and error states (use browser-qa's helpers). If you can't take screenshots in this environment, say so at the top: `DEGRADED: no screenshots, code-only review`.

## Score: ten usability heuristics (0–4 each, n/a allowed)
1. Users can see what's happening (status, progress, feedback).
2. Words and concepts match the users' world.
3. Easy undo and exit.
4. Consistent with itself and with platform norms.
5. Prevents errors before they happen.
6. Recognition over memory (options visible, not remembered).
7. Fast for frequent users.
8. Minimal: nothing competes with the main task.
9. Errors explained with a fix.
10. Help where needed.

Report the total out of 40 (scaled if some are n/a). Below 28: REQUEST CHANGES.

## Also check
- **DESIGN.md**: tokens, type hierarchy, spacing rhythm, approved variant followed.
- **Mode**: an Operate screen that's decorative, or a Persuade page with three competing calls to action, is a finding.
- **Squint test**: blur the screenshot. Is the most important thing still the most visible?
- **Motion**: frequency and purpose rules from ui-build-rules; reduced motion respected.
- **Copy**: plain, consistent with the glossary, errors explain the fix.
- **Realistic content**: long names, large numbers, other languages don't break layout (break-ui covers this in depth).

## Output (exact shape)
```
VERDICT: APPROVE | REQUEST CHANGES
Score: 31/40   Screens reviewed: 4 widths × 3 states

| # | Severity | Where | Before | After | Why |
|---|---|---|---|---|---|
| 1 | Critical | /harvest/new @375 | Save button below fold | Sticky save bar | Main action hidden on phones |
```
Severity: **Critical** (blocks the task, accessibility failure, broken layout) · **Required** (clear usability or consistency problem) · **Optional** (polish) · **Nit**.

Fix order for the author: remove what shouldn't be there first, then reduce, then fix. Polishing something that should be deleted wastes a round.

## Rounds
Author fixes Critical and Required items in one batch. One re-review. If it still requests changes, escalate to the orchestrator with both reports; don't loop.
