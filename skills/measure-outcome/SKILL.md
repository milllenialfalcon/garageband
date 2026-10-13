---
name: measure-outcome
description: "Use two to six weeks after a feature or product reaches full rollout, or when the founder asks \"is this working?\". Pulls the success metric defined in the spec from the analytics and database, compares it to the target, looks at who is and isn't using it, and recommends keep, iterate or kill as a decision brief."
license: MIT
metadata:
  stack: garageband
  phase: measure
  verified: "2026-10-13"
---

# Measure outcome

Shipping isn't the goal; changing something for users is. This closes the loop from validate-idea.

## Inputs
The spec's goal, success metric, target, timeframe and tracking events; `PRODUCT.md` kill signal; the analytics tool and database (read-only).

## Steps
1. **Get the numbers** with real queries, saved to files and computed in code, not estimated. Metric value now vs target vs before launch.
2. **Adoption funnel**: of users who could use it, how many saw it → tried it → completed it → came back. Where's the biggest drop?
3. **Segments**: which users or sites use it most and least (by role, device, language, region).
4. **Qualitative**: related feedback from intake-triage; a handful of actual sessions or records.
5. **Data quality check**: are events firing correctly? A metric of zero is often broken tracking, not zero usage. Verify before concluding.
6. **Cost**: monthly running cost of the feature (from cost-watch) against the value.

## Recommend one
- **Keep**: target met. Remove the feature flag; move on.
- **Iterate**: real signal but below target. Name the single biggest drop-off and one change to test.
- **Kill**: at or below the kill signal with good tracking. Propose removal (it saves maintenance), with how to tell affected users.

Present as a decision-brief with a small chart (metric over time vs target).

## Output
`.factory/reports/outcome-<feature>-<date>.md` and an update to the spec's status (`shipped` → `kept` / `iterating` / `killed`). Results feed portfolio-priority.
