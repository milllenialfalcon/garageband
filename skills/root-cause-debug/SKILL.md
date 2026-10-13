---
name: root-cause-debug
description: "Use when something is broken, flaky, slow or behaving unexpectedly — a failing test, a production error, a bug report, a CI failure — before attempting any fix. Reproduces the problem first, narrows to the root cause with evidence, fixes it with a regression test, and stops to escalate after three failed fix attempts."
license: MIT
metadata:
  stack: garageband
  phase: build
  verified: "2026-10-13"
---

# Root-cause debugging

No fixes without a cause. Guess-and-patch creates two bugs from one.

## 1. Reproduce
Get a reliable way to make it happen: a failing test, a script, or exact steps. Write down expected vs actual. If you can't reproduce it, gather more evidence (logs, Sentry event, browser console, network requests, the exact input) before changing anything. Redact secrets and personal data in anything you paste.

## 2. Narrow
- What changed? Check recent commits (`git log`, `git bisect` for regressions), dependency updates, config and environment.
- Where does it go wrong? Trace data from input to failure. Add temporary logging at boundaries rather than guessing.
- Form one hypothesis at a time, and a quick test that would prove it wrong.

## 3. Fix
- Write a test that fails because of the bug (tdd-slice).
- Fix the cause, not the symptom. Don't widen try/catch, add retries or sleep calls to hide it.
- Look for the same pattern elsewhere (search the codebase for siblings of the bug) and list them; fix in scope or open tickets.
- Remove temporary logging.

## 4. The three-strikes rule
If three fix attempts have failed, stop. The diagnosis is wrong, or the design is. Write up: symptom, reproduction, what you tried and what each attempt showed. Report `BLOCKED` and escalate via model-router (AGENTS.md section 8). Don't try a fourth patch.

## 5. Report
```
Cause: <one sentence, plain English>
Evidence: <what proved it>
Fix: <what changed>
Regression test: <name>
Same pattern elsewhere: <list or none>
```
For production incidents, also feed this into watch-after-ship's postmortem.
