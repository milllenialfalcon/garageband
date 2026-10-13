---
name: maintenance-sweep
description: "Use monthly per product, or when the codebase feels slow to change. Updates dependencies safely, clears security advisories, tests a backup restore, checks free-tier and certificate expiries, removes expired feature flags and dead code, ranks technical debt, and checks skills and docs for staleness — producing a short report and small tickets."
license: MIT
metadata:
  stack: garageband
  phase: maintain
  verified: "2026-10-13"
---

# Maintenance sweep

Software rots when nobody's looking. One sweep a month keeps upgrades small and surprises rare.

## Checklist
**Dependencies**
- [ ] `npm outdated` and `npm audit`. Security fixes first.
- [ ] Patch and minor updates in one PR; run the full test and e2e suite.
- [ ] Each major update in its own PR, after reading its migration guide (verify-research), never batched.
- [ ] Remove unused dependencies.

**Data safety**
- [ ] **Restore a backup** into a scratch database and check a few records. A backup never restored is a hope, not a backup.
- [ ] Check backup schedule still running and retention is as intended.

**Expiry dates**
- [ ] Domains, SSL certificates, API keys with expiry, free trials, app store certificates. Anything within 45 days → ticket.

**Feature flags and dead code**
- [ ] Flags fully rolled out for more than a month → remove flag and old code path (ticket).
- [ ] Unused files, routes, components and exports (use a tool like `knip` for TypeScript) → tickets, not drive-by deletion.

**Tech debt**
- [ ] Hotspots: files changed most often in the last month that also have the most bugs or the largest size.
- [ ] Shallow modules: places where callers need to know too much about internals. Propose deepening (one simple interface hiding complexity).
- [ ] Rank by (pain × frequency) ÷ effort; propose the top three as tickets.

**Factory health**
- [ ] Skills, AGENTS.md and docs with a `verified` date older than 90 days → re-check against current tool and library behaviour.
- [ ] CI time; flaky tests (any test that failed then passed without changes) → ticket.

## Output
`.factory/reports/maintenance-<YYYY-MM>.md`: what was updated, restore test result, upcoming expiries, top three debt items, factory health notes. Under one page. Tickets added to the ledger.
