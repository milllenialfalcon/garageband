# Sprint ledger: Garageband build sprint

The single source of truth for the sprint. **Only the Chief (orchestrator) and the relief orchestrator edit it**, through `node sprint/scripts/gb-sprint.mjs set …`; builders and reviewers report back and never touch it. The concierge only reads it.

- Status: `ready` (waiting for its "After" tickets or a free slot) · `claimed` · `in-review` · `changes-requested` · `blocked` · `done` (merged into the sprint branch, or chief-lane work finished) · `dropped`
- DeepSeek builds every lane; the lane lead (Claude for backend and risky, Codex for frontend) writes the brief and reviews. Lane `chief`: the Chief does it itself (probes, specs, repo setup).
- Times are IST (UTC+05:30). Size: S under 2 hours of agent time, M about half a day.
- Repos: `gb` = Garageband (sprint/track-a), `studio` = Garageband Studio (fork) (sprint/track-b). Track B tickets (B*) live in `studio`.
- Priority order: A0=1, C1=1, B0=1, A1=2, A2=2, C2=3, B1=3, B2=3, B4=4, B6=5 (lower first).

<!-- ledger:start -->
| Ticket | Phase | Title | Lane | Size | After | Status | Builder | Reviewer | PR | Attempts | Started | Finished |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A0-01 | A0 | Which skills each provider sees inside T3 | chief | S | — | ready |  |  |  | 0 |  |  |
| A0-02 | A0 | Cross-provider delegation with worktrees | chief | S | — | ready |  |  |  | 0 |  |  |
| A0-03 | A0 | Hermes over ACP in the box | chief | S | — | ready |  |  |  | 0 |  |  |
| A0-04 | A0 | How T3 picks up project actions | heavy | S | — | ready |  |  |  | 0 |  |  |
| A0-05 | A0 | A0 test report | heavy | S | A0-01, A0-02, A0-03, A0-04 | ready |  |  |  | 0 |  |  |
| A0-06 | A0 | Quota meter for every plan | backend | M | — | ready |  |  |  | 0 |  |  |
| A0-07 | A0 | Research runs without shell or write access | chief | S | — | ready |  |  |  | 0 |  |  |
| A1-01 | A1 | garageband-t3 package and doctor command | backend | M | — | ready |  |  |  | 0 |  |  |
| A1-02 | A1 | Installers that ask before each install | heavy | M | A1-01 | ready |  |  |  | 0 |  |  |
| A1-03 | A1 | Logins for every tool | backend | S | A1-01 | ready |  |  |  | 0 |  |  |
| A1-04 | A1 | Register Hermes as an ACP agent in T3 | backend | M | A0-03, A1-01 | ready |  |  |  | 0 |  |  |
| A1-05 | A1 | Put skills where every tool sees them | heavy | S | A0-05, A1-01 | ready |  |  |  | 0 |  |  |
| A1-06 | A1 | Team setup from the models T3 offers | backend | M | A1-01 | ready |  |  |  | 0 |  |  |
| A1-07 | A1 | Add the project to T3 with its actions | heavy | S | A0-04, A1-01 | ready |  |  |  | 0 |  |  |
| A1-08 | A1 | Smoke test: every tool lists the skills | backend | S | A1-05 | ready |  |  |  | 0 |  |  |
| A1-09 | A1 | Windows and Linux CI for garageband-t3 | heavy | S | A1-02 | ready |  |  |  | 0 |  |  |
| A1-10 | A1 | Founder docs: setup and troubleshooting | heavy | S | A1-08 | ready |  |  |  | 0 |  |  |
| A1-11 | A1 | garageband-t3 ready to publish | heavy | S | A1-09 | ready |  |  |  | 0 |  |  |
| A1-12 | A1 | Box hardening plan | chief | S | A0-07 | ready |  |  |  | 0 |  |  |
| A2-01 | A2 | T3 reference for agents | heavy | S | A0-05 | ready |  |  |  | 0 |  |  |
| A2-02 | A2 | Spec: t3-orchestrator skill | chief | S | A0-05 | ready |  |  |  | 0 |  |  |
| A2-03 | A2 | Build the t3-orchestrator skill | backend | M | A2-01, A2-02 | ready |  |  |  | 0 |  |  |
| A2-04 | A2 | Build the t3-concierge skill | backend | S | A2-02 | ready |  |  |  | 0 |  |  |
| A2-05 | A2 | Counts, validator and tests for the new skills | heavy | S | A2-03, A2-04 | ready |  |  |  | 0 |  |  |
| A2-06 | A2 | Dogfood: one ticket through the skill, hands-off | chief | S | A2-05 | ready |  |  |  | 0 |  |  |
| A2-07 | A2 | skill-lab measures properly | backend | M | A2-05 | ready |  |  |  | 0 |  |  |
| A2-08 | A2 | Reviewer calibration set | heavy | M | A0-05 | ready |  |  |  | 0 |  |  |
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
| B0-01 | B0 | Create the Garageband Studio repo | chief | S | — | ready |  |  |  | 0 |  |  |
| B0-02 | B0 | Brand survey | heavy | S | B0-01 | ready |  |  |  | 0 |  |  |
| B0-03 | B0 | One brand config, applied | backend | M | B0-02 | ready |  |  |  | 0 |  |  |
| B0-04 | B0 | Pull request CI | backend | S | B0-01 | ready |  |  |  | 0 |  |  |
| B0-05 | B0 | Windows installer built in CI | backend | M | B0-03, B0-04 | ready |  |  |  | 0 |  |  |
| B0-06 | B0 | Stable-release sync job | backend | M | B0-04 | ready |  |  |  | 0 |  |  |
| B0-07 | B0 | Patch list, notices and fork map | heavy | S | B0-03 | ready |  |  |  | 0 |  |  |
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
