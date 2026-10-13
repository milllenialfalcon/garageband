---
name: write-spec
description: "Use after the founder's intent is known (validate-idea and grill-founder done) to write a spec with testable Given/When/Then acceptance criteria, a not-doing list, boundaries, a success metric with tracking events, and rollout plan. No build work starts without an approved spec."
license: MIT
metadata:
  stack: garageband
  phase: define
  verified: "2026-10-13"
---

# Write the spec

A spec is the contract every later model works against. If it's vague, every model fills the gap differently.

## Inputs
`PRODUCT.md`, the grill-founder answers, `docs/glossary.md`, related specs and ADRs.

## Steps
1. Copy `docs/specs/_TEMPLATE.md` to `docs/specs/<slug>.md`.
2. **Problem and goal**: two to four sentences. Success metric with target, timeframe and the **tracking events** needed to measure it (event name, when it fires, properties). measure-outcome depends on this.
3. **Acceptance criteria**: Given / When / Then, one behaviour each, observable from outside the code. Include for every screen: empty, loading and error states; 375px phone width; slow network; and translated text if `PRODUCT.md` lists more than one language.
4. **Not doing**: at least three items. This is what stops scope creep in implementers.
5. **Boundaries**: Always / Ask first / Never specific to this feature.
6. **Open questions**: each labelled Mechanical / Taste / Founder Call. Resolve Mechanical and Taste yourself; Founder Calls go through decision-brief.
7. **Rollout**: feature flag name and a rollback that takes under five minutes.

## Quality bar for each acceptance criterion
- Testable: a test or a browser check could fail it.
- Specific: numbers instead of adjectives ("loads in under 2 s on 4G", not "fast").
- One behaviour per criterion.
- Uses glossary terms.

Bad: "Users can easily manage batches." Good: "Given a logged-in staff member, when they mark batch B-12 as dispatched, then its status shows Dispatched and the dispatch time within 2 seconds."

## Reader test (before approval)
Give the spec, and only the spec, to a fresh, cheap model: "List anything ambiguous, contradictory or missing. Don't suggest features." Fix what it finds, or record it as an assumption.

## Approval
Send the founder a summary: goal, metric, 3–7 headline criteria in plain English, not-doing list, any Founder Calls. Status becomes `approved` only on their explicit yes.

Next: design-system (if there's UI and no DESIGN.md yet) → architecture-plan → slice-tickets.

## Red flags
| Thought | Instead |
|---|---|
| "The criteria are obvious." | Write them anyway; implementers start cold. |
| "Edge cases can come later." | Empty, error, loading and phone width are part of v1. |
| "We'll figure out the metric after launch." | No metric, no way to know if it worked. |
