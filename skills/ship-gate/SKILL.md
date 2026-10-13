---
name: ship-gate
description: "Use when a feature or set of merged changes is ready to go to production. Runs the go/no-go checklist, requires a tested rollback plan and feature flag, writes release notes and changelog from merged PRs, promotes preview → staging → production in stages, and hands over to watch-after-ship."
license: MIT
metadata:
  stack: garageband
  phase: release
  verified: "2026-10-13"
---

# Ship gate

Shipping is a decision, not a side effect of merging. Default answer is NO-GO until every item is true.

## 1. Go / no-go checklist
- [ ] All tickets for the release are `done` in the ledger; their PRs merged with green CI.
- [ ] Spec acceptance criteria all proven (coverage table in the spec).
- [ ] browser-qa report green on staging; design-critique approved for UI changes.
- [ ] security-pass GO for anything touching auth, money, data or config.
- [ ] launch-compliance done if this is a first launch or adds payments/accounts/personal data.
- [ ] Migrations applied to staging with safe-migration; backup restore point noted for production.
- [ ] New features behind a flag (with an owner and a removal date within a month of full rollout).
- [ ] Tracking events from the spec fire on staging (check the analytics tool).
- [ ] Error tracking and uptime monitor cover the new paths.
- [ ] **Rollback plan written and tested**: flag off (target under 1 minute), redeploy previous version (under 5 minutes), database restore (under 15 minutes, last resort).

Any unchecked item → NO-GO with the reason. A critical finding from any reviewer → NO-GO.

## 2. Release notes
From merged PRs' owner summaries:
- `CHANGELOG.md` entry (date, version, Added / Changed / Fixed).
- User-facing notes in plain language (what's new, what changed for them), translated if the product is multilingual.

## 3. Staged rollout
1. Deploy to production with the flag **off**. Smoke-test the health endpoint and one main flow.
2. Turn the flag on for internal users or the founder only. Check for an hour of real use.
3. Small rollout (e.g. 10% of users, or one farm/site/team) for 24–48 hours.
4. Full rollout.
At each step use watch-after-ship's thresholds. Breach → flag off first, investigate second.

Small products with very few users may go internal → 100%, but never skip the internal step.

## 4. Tell users (for anything users will notice)
- Help text, onboarding or a short guide updated for the change (translated if multilingual).
- An announcement drafted for the founder to send (in-app message, email or WhatsApp): what's new, why it helps, where to find it. Nothing is sent without the founder's approval.
- Support is ready: the founder knows what changed and the likely questions; intake-triage watches for feedback in the first week.
- First public launch: a simple launch plan (who hears first, which channels, what we'll measure) as a decision brief.

## 5. Founder sign-off
Send: what's shipping (from release notes), the checklist result, the rollback plan, rollout steps and timing. Production deploy only after an explicit "go".

Then: watch-after-ship.
