# Sprint ledger: Garageband build sprint

The single source of truth for the sprint. **Only the Chief (orchestrator) and the relief orchestrator edit it**, through `node sprint/scripts/gb-sprint.mjs set …`; builders and reviewers report back and never touch it. The concierge only reads it.

- Status: `ready` (waiting for its "After" tickets or a free slot) · `claimed` · `in-review` · `changes-requested` · `blocked` · `done` (merged into the sprint branch, or chief-lane work finished) · `dropped`
- DeepSeek builds every lane; the lane lead (Claude for backend and risky, Codex for frontend) writes the brief and reviews. Lane `chief`: the Chief does it itself (probes, specs, repo setup).
- Times are IST (UTC+05:30). Size: S under 2 hours of agent time, M about half a day.
- Repos: `gb` = Garageband (sprint/track-a), `enigma` = Enigma (the T3 fork) (sprint/enigma). Enigma tickets (B*) live in `enigma`.
- Priority order: A0=1, B0=1, C1=2, B1=2, B2=2, B4=3, B6=3, C2=4 (lower first).

<!-- ledger:start -->
| Ticket | Phase | Title | Lane | Size | After | Status | Builder | Reviewer | PR | Attempts | Started | Finished |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A0-01 | A0 | Which skills each provider sees inside T3 | chief | S | — | ready |  |  |  | 0 |  |  |
| A0-02 | A0 | Cross-provider delegation with worktrees | chief | S | — | ready |  |  |  | 0 |  |  |
| A0-03 | A0 | Hermes over ACP in the box | chief | S | — | ready |  |  |  | 0 |  |  |
| A0-05 | A0 | A0 test report | heavy | S | A0-01, A0-02, A0-03 | ready |  |  |  | 0 |  |  |
| A0-06 | A0 | Quota meter for every plan | backend | M | — | ready |  |  |  | 0 |  |  |
| A0-07 | A0 | Research runs without shell or write access | chief | S | — | ready |  |  |  | 0 |  |  |
| A0-08 | A0 | Box hardening plan | chief | S | A0-07 | ready |  |  |  | 0 |  |  |
| B0-08 | B0 | T3 reference for agents | heavy | S | B0-01 | ready |  |  |  | 0 |  |  |
| C1-07 | C1 | skill-lab measures properly | backend | M | — | ready |  |  |  | 0 |  |  |
| C1-08 | C1 | Reviewer calibration set | heavy | M | A0-05 | ready |  |  |  | 0 |  |  |
| C1-01 | C1 | Station contracts | chief | M | — | ready |  |  |  | 0 |  |  |
| C1-02 | C1 | Machine-readable station contracts | heavy | S | C1-01 | ready |  |  |  | 0 |  |  |
| C1-03 | C1 | Station metadata on every skill | heavy | S | C1-02 | ready |  |  |  | 0 |  |  |
| C1-04 | C1 | Checkers for station outputs | backend | M | C1-02 | ready |  |  |  | 0 |  |  |
| C1-05 | C1 | Acceptance criteria IDs and coverage check | backend | S | C1-04 | ready |  |  |  | 0 |  |  |
| C1-06 | C1 | Sharper briefs, reports and handoffs | heavy | S | C1-01 | ready |  |  |  | 0 |  |  |
| C2-01 | C2 | Spec: the line file | chief | S | C1-01 | ready |  |  |  | 0 |  |  |
| C2-02 | C2 | gb-line tool | backend | M | C2-01 | ready |  |  |  | 0 |  |  |
| C2-03 | C2 | Router and team setup read the line file | backend | S | C2-02 | ready |  |  |  | 0 |  |  |
| C2-04 | C2 | Bring-your-own skill wrapper | heavy | M | C2-02, C1-04 | ready |  |  |  | 0 |  |  |
| B0-01 | B0 | Create the Enigma repo | chief | S | — | ready |  |  |  | 0 |  |  |
| B0-02 | B0 | Brand survey | heavy | S | B0-01 | ready |  |  |  | 0 |  |  |
| B0-03 | B0 | One brand config, applied | backend | M | B0-02 | ready |  |  |  | 0 |  |  |
| B0-04 | B0 | Pull request CI | backend | S | B0-01 | ready |  |  |  | 0 |  |  |
| B0-05 | B0 | Windows installer built in CI | backend | M | B0-03, B0-04 | ready |  |  |  | 0 |  |  |
| B0-06 | B0 | Stable-release sync job | backend | M | B0-04 | ready |  |  |  | 0 |  |  |
| B0-07 | B0 | Patch list, notices and fork map | heavy | S | B0-03 | ready |  |  |  | 0 |  |  |
| B0-09 | B0 | Enigma works with the T3 phone app | chief | S | B0-03 | ready |  |  |  | 0 |  |  |
| B1-01 | B1 | Skills service in T3's toolset | backend | M | B0-04 | ready |  |  |  | 0 |  |  |
| B1-02 | B1 | Constitution injected for every provider | risky | M | B1-01 | ready |  |  |  | 0 |  |  |
| B1-03 | B1 | Shared skills library linked into every tool | heavy | S | B1-01 | ready |  |  |  | 0 |  |  |
| B1-04 | B1 | Claude threads load user settings and plugins | backend | S | B0-04 | ready |  |  |  | 0 |  |  |
| B1-05 | B1 | Skills settings screen | frontend | S | B1-01, B1-03 | ready |  |  |  | 0 |  |  |
| B2-01 | B2 | Hermes provider package | backend | M | B0-04 | ready |  |  |  | 0 |  |  |
| B2-02 | B2 | Register Hermes everywhere | heavy | M | B2-01 | ready |  |  |  | 0 |  |  |
| B2-03 | B2 | Hermes icon, status and usage | frontend | S | B2-02 | ready |  |  |  | 0 |  |  |
| B2-04 | B2 | Hermes as a delegation target | backend | S | B2-02 | ready |  |  |  | 0 |  |  |
| B4-01 | B4 | Board event layer | backend | M | B0-04 | ready |  |  |  | 0 |  |  |
| B4-02 | B4 | Board screen: kanban by station | frontend | M | B4-01 | ready |  |  |  | 0 |  |  |
| B4-03 | B4 | Live feed, plan bars and context gauge | frontend | M | B4-02 | ready |  |  |  | 0 |  |  |
| B4-04 | B4 | File clashes and stalls | backend | M | B4-01 | ready |  |  |  | 0 |  |  |
| B6-01 | B6 | Spend caps | backend | M | B4-01 | ready |  |  |  | 0 |  |  |
| B6-02 | B6 | Circuit breaker | backend | M | B6-01 | ready |  |  |  | 0 |  |  |
| B6-03 | B6 | Guard layer and audit log for every provider | risky | M | B6-01 | ready |  |  |  | 0 |  |  |
| B6-04 | B6 | Retry classes and a breaker per provider | backend | M | B6-01 | ready |  |  |  | 0 |  |  |
<!-- ledger:end -->

## Notes
