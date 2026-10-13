---
name: tdd-slice
description: "Use when implementing any ticket, feature, bug fix or behaviour change in code. Confirms what to test, writes a failing test first, makes it pass with the least code, refactors, keeps the diff surgical, commits one ticket per branch, and refuses to report done without fresh pasted test, typecheck and lint output."
license: MIT
metadata:
  stack: garageband
  phase: build
  verified: "2026-10-13"
---

# TDD slice

The test is the proof. Code without a failing-then-passing test is a guess.

## 0. Start
Read the brief, `AGENTS.md`, the files it points to. Update the ledger (`claimed`). Create the branch named in the brief. Run the test suite once to see the baseline is green; if it isn't, report `BLOCKED` with the output rather than building on a broken base.

## 1. Decide what to test
From the acceptance criteria, list the behaviours and *where* each is best tested (the seam): a pure function, an API route, a component, a browser flow. Test behaviour through public interfaces, not internals. If the brief is unclear about expected behaviour, stop and report `NEEDS_CONTEXT`.

## 2. Red → Green → Refactor, one behaviour at a time
1. **Red**: write one test for one behaviour. Run it. Paste the failure. It must fail *for the right reason* (the behaviour is missing, not a typo or import error).
2. **Green**: write the least code that makes it pass. Run it. Paste the pass.
3. **Refactor**: tidy only what you just wrote, with tests staying green.
Repeat for the next behaviour.

**Bug fixes**: first a test that reproduces the bug and fails. Then fix. The test stays forever.

## 3. Bad tests (don't write these)
- Tests that recompute the expected value with the same logic as the code.
- Tests that only check a mock was called.
- Snapshot tests of whole pages as the only check.
- Tests that pass before the code exists.

## 4. Keep the diff surgical
`git diff` before committing. Every changed line must trace to the ticket. Revert drive-by formatting, renames and "improvements". Remove only imports or functions your change orphaned.

## 5. Evidence gate (before saying done)
Run, fresh, now — not from memory or an earlier run:
- the tests (full suite, not only yours),
- typecheck,
- lint,
- `node scripts/slop-lint.mjs` if UI files changed.
Paste the summary lines in the report. If anything is red, you're not done.

## 6. Commit and report
- Commit with a clear message (`feat(harvest): log photo on batch (T-014)`); stage named files, never `git add -A` blindly.
- Push the branch, open a PR with owner-pr-summary.
- Ledger: `in-review`. Report in the brief's STATUS format.

## Excuses
| Thought | Instead |
|---|---|
| "Too simple to test." | Then the test takes a minute. Write it. |
| "I'll write tests after." | They'll pass by design. Test first. |
| "The old tests were already failing." | Report it as BLOCKED; don't add to the pile. |
| "I tested it manually." | Paste automated evidence. |
