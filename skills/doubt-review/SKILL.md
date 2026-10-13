---
name: doubt-review
description: "Use to review any pull request, plan, spec or brief before it's accepted. A model other than the author reviews only the artifact and its contract (never the author's reasoning), checks spec compliance and code standards as two separate axes, sweeps for the same bug elsewhere, and returns APPROVE or REQUEST CHANGES with severity-ranked findings. Capped at three rounds."
license: MIT
metadata:
  stack: garageband
  phase: review
  verified: "2026-10-13"
---

# Doubt review

The author's explanation anchors the reviewer. So the reviewer doesn't get it. They get the work and the contract, and one job: find what's wrong.

## Setup
- Reviewer: a different model from the author (model-router). For money, auth, data or schema PRs, a strong model.
- Input: the diff (`git diff main...<branch>`), the ticket and its acceptance criteria, relevant ADRs and the architecture plan contracts, CI results. **Not** the author's PR narrative or chat.
- Prompt to self: "Find problems. Assume there are some." Not "is this good?".

## Axis 1: Spec (does it do what was asked?)
- Each acceptance criterion: met / partly / not, with the test that proves it. A criterion with no test is "not proven".
- Anything built that wasn't asked for (scope creep)?
- Empty, error, loading states and phone width handled as the spec requires?

## Axis 2: Standards (is it built right?)
- Correctness: edge cases, null/undefined, off-by-one, time zones, concurrency, double-submit.
- Security: input validated on the server, authorisation checked on every route, no secrets or personal data in code or logs, safe queries. (Deep pass: security-pass.)
- Tests: meaningful (would fail if the behaviour broke), not tautological; bug fixes have a regression test.
- Simplicity: anything that could be deleted or done with existing code? New dependencies justified?
- Surgical: changes outside the ticket's scope?
- Consistency: glossary terms, existing patterns, DESIGN.md tokens.
- Performance: N+1 queries, unbounded lists, large bundles.

Keep the axes separate in the report. A pass on one never cancels a failure on the other.

## Sideways sweep
For every real bug found, search the codebase for the same pattern. Report siblings, rated by the worst one.

## Output
```
VERDICT: APPROVE | REQUEST CHANGES
Spec axis: 4/5 criteria proven (AC3 has no test)
Standards axis: 1 Critical, 2 Required, 1 Optional

| # | Axis | Severity | File:line | Problem | Suggested fix |
```
Severity: **Critical** (wrong behaviour, security hole, data loss risk, unproven criterion) · **Required** · **Optional** · **Nit**. Any Critical → REQUEST CHANGES. Data loss or authorisation bypass is always Critical.

## Rounds and reconciliation
- Author fixes all Critical and Required in one batch and replies per finding: fixed / disagree (with reason).
- Re-review only the changes and disagreements. Max 3 rounds.
- Classify each finding at the end: was it a real issue, a misread of the contract, a trade-off, or noise. If two rounds produce only noise, stop ("doubt theatre") and approve.
- Unresolved disagreement after round 3 goes to the orchestrator, and to the founder if it's a Founder Call.
