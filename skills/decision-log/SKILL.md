---
name: decision-log
description: "Use when a structural or lasting decision is made (stack, data model, vendor, architecture, design system, policy) to write an Architecture Decision Record, update the decision log and glossary, and keep every model using the same words and the same past decisions. Also use to answer \"why did we do it this way?\"."
license: MIT
metadata:
  stack: garageband
  phase: architect
  verified: "2026-10-13"
---

# Decision log

Models don't remember last month. Files do. This keeps decisions and vocabulary in the repo so every session starts from the same truth.

## Write an ADR when
A decision is hard to reverse, affects several features, costs money, or someone will later ask "why?". Examples: stack, database, auth provider, payment provider, hosting, data model shape, design system, a security policy.

## Steps
1. Copy `docs/adr/_TEMPLATE.md` to `docs/adr/NNNN-<slug>.md` (next number, four digits).
2. Fill: context (facts only), options with cost and trade-offs, the decision, **why in plain English** (two or three sentences the founder could repeat), consequences, when to revisit.
3. Set door (one-way / two-way) and who decided. One-way decisions require the founder's yes (decision-brief) before status becomes `accepted`.
4. Add a row to `docs/decision-log.md`.
5. If a decision replaces an older one, set the old ADR to `superseded by ADR-NNNN`. Never delete ADRs.

## Glossary
When a new domain concept appears (in a spec, a conversation or code), add it to `docs/glossary.md` before it's used: the term, what it means, what it's not, and its name in code. If two words are being used for one thing, pick one, record it, and fix the other in specs.

## Answering "why?"
Search `docs/adr/` and `docs/decision-log.md` first. Quote the decision and its date. If nothing is recorded, say so and offer to write the ADR now from what the code shows.
