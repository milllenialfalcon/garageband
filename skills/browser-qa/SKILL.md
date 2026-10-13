---
name: browser-qa
description: "Use after a ticket with user-facing behaviour is built, and before release, to test real user flows in a browser. Turns acceptance criteria into Playwright tests, checks every screen at four widths, accessibility, page speed and console errors, requires each regression test to fail first, and stops itself after two reverts or fifty fixes."
license: MIT
metadata:
  stack: garageband
  phase: test
  verified: "2026-10-13"
---

# Browser QA

Unit tests prove pieces work. Browser QA proves the user can actually do the thing.

## Helpers (in this skill's `scripts/` folder; run with `--help` first, don't read the source)
- `with-server.mjs`: starts the app, waits until it responds, runs a command, then stops the app. Use it instead of managing servers yourself.
  `node <skill>/scripts/with-server.mjs --cmd "npm run dev" --url http://localhost:3000 -- npx playwright test`
- `shots.mjs`: screenshots pages at 375, 768, 1024 and 1440 px into `.factory/reports/shots/`.
  `node <skill>/scripts/shots.mjs http://localhost:3000/ http://localhost:3000/harvest/new`

If Playwright isn't installed: `npm i -D @playwright/test && npx playwright install chromium` (this is Mechanical; just do it and add an `e2e` script: `"e2e": "playwright test"`).

## Steps
1. **Flows from criteria**: one Playwright test per acceptance criterion that a user performs (`e2e/<feature>.spec.ts`). Use roles and labels to find elements (`getByRole('button', { name: 'Save batch' })`), never CSS classes. Wait for visible results, never fixed sleeps.
2. **States**: cover empty, error (mock a failing API) and slow loading for each main screen.
3. **Widths**: run the main flow at 375 and 1440 px (Playwright projects); take shots at all four widths for design-critique.
4. **Accessibility**: add `@axe-core/playwright` and fail on serious or critical violations on each main page. Check keyboard-only completion of the main flow.
5. **Console and network**: fail the test on uncaught console errors or failed requests during the flow.
6. **Speed**: on the main page, measure Largest Contentful Paint (how long until the main content shows) with the browser's Performance API inside the Playwright test, and assert it is under the architecture plan's budget, so CI fails when a change makes the page slow. Record total JavaScript size in the report.

## Fixing what QA finds
- Each bug: first a test that fails because of it (show the failure), then the fix, then the pass.
- For each regression test, write one line: what it protects, when it fails, why existing tests didn't catch it. If an existing test already covers it, don't add a duplicate.
- **Brakes**: review progress every 5 fixes. Stop and report if you've reverted twice, edited a file unrelated to the bug, or reached 50 fixes.

## Output
`.factory/reports/qa-<ticket-or-release>.md`: flows tested (pass/fail), accessibility result, speed numbers vs budget, bugs found and fixed with test names, open issues. CI's `e2e` job runs the suite on every PR.
