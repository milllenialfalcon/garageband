---
name: watch-after-ship
description: "Use for the first 24–48 hours after any production release or rollout step, and whenever an alert, error spike, outage or user report suggests production is broken. Compares error rate, speed, uptime and key flows against the pre-release baseline, turns the feature flag off on a breach, and runs incident handling with a status message and a blameless postmortem."
license: MIT
metadata:
  stack: garageband
  phase: operate
  verified: "2026-10-13"
---

# Watch after ship

Most production problems show up in the first hours. Watching then is cheap; finding out from an angry user is not.

## Baseline (before release)
Record for the last 7 days: error rate (Sentry events per 1,000 sessions or requests), slowest 5% page load or API time (P95), uptime, and the key business number for the feature (e.g. batches logged per day).

## Checks (at 1 h, 4 h, 24 h and 48 h after each rollout step)
| Signal | Proceed | Pause and investigate | Roll back (flag off) |
|---|---|---|---|
| Error rate | within +10% of baseline | +10% to 2× | over 2× or any new error affecting a main flow |
| Speed (slowest 5% of loads, "P95") | within +20% | +20% to +50% | over +50% |
| Uptime / health | all green | one blip | down |
| Key business number | flat or up | down 5–10% | down over 10% or zero |
| User reports | none | one | two or more about the same thing |

Small user counts make percentages noisy: also look at absolute numbers and individual errors.

## On a breach: incident handling
1. **Stop the bleeding**: turn the feature flag off (or redeploy the previous version). Don't debug in production first.
2. **Tell people**: if users were affected, draft a short, honest status message for the founder to send: what happened, who's affected, what's done, when the next update comes. No blame, no jargon.
3. **Diagnose** with root-cause-debug on staging or locally.
4. **Fix** through the normal line (ticket → brief → build → review → ship-gate).
5. **Postmortem** within two days in `.factory/retros/<date>-incident-<slug>.md`: timeline, impact (users, duration, money), root cause, why our gates didn't catch it, actions (each becomes a ticket or a retro-instincts candidate). Blameless: about the system, not the model or person.

Data loss, a security breach or exposed personal data is always a Founder Call immediately, and may carry legal notification duties (see launch-compliance).

## Output
`.factory/reports/watch-<release>.md` with the check table at each interval and the decision taken (proceed / pause / rollback).
