---
name: owner-pr-summary
description: "Use when opening or updating any pull request in a Garageband project. Writes the PR description for a non-engineer founder — what changed, why, proof it works, what could break and exactly what to click on the preview — following the repo's PR template."
license: MIT
metadata:
  stack: garageband
  phase: review
  verified: "2026-10-13"
---

# Owner PR summary

The founder approves outcomes, not code. The PR description is how they decide. If they can't understand it in one minute, it isn't finished.

## Write it from evidence
1. Read the ticket, the spec's acceptance criteria and the actual diff (`git diff main...HEAD --stat` then the diff).
2. Run the checks. Use the real summary lines from test, typecheck and lint output. Never write "tests pass" without pasting the line.
3. Fill `.github/pull_request_template.md` completely.

## The founder section
- **What changed**: one or two sentences, user-visible terms. "Staff can now mark a harvest batch as dispatched" — not "added PATCH /batches/:id".
- **Why**: ticket and spec links.
- **How we know it works**: which tests were added and what each proves, in plain words, plus the pasted summary line.
- **What could break**: blast radius (who is affected if this is wrong) and door (two-way or one-way, with why).
- **What to check on the preview**: 2–5 numbered click steps with the expected result. These must be things a non-engineer can do in a browser.

## Merge danger
Flag clearly at the top with ⚠️ if the PR touches money, auth, personal data, database schema, environment config or deletes anything. Those need the founder's explicit "approved", not just a merge.

## Keep it honest
- List anything not done, any skipped acceptance criterion and any concerns, in plain words (not status codes).
- If CI is red, say so first and don't request review.

## Example
```
What changed: Farm staff can now upload a photo when logging a harvest batch.
Why: T-014, spec harvest-log AC3.
How we know it works: 4 tests added — photo saves, oversized photo is rejected with a clear message,
works without a photo, photo shows on the batch page. "Tests: 38 passed, 0 failed".
What could break: only the harvest log page. Two-way door (feature flag `harvest_photos`).
Check on the preview:
1. Open /harvest/new, log a batch with a phone photo → it appears on the batch page.
2. Try a 30 MB photo → you see "Photo too large, max 10 MB".
```
