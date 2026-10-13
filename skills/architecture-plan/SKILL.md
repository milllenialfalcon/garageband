---
name: architecture-plan
description: "Use after a spec is approved and before tickets are cut, for any new feature, data, integration, auth or payments work. Designs the data model, API and component contracts, failure cases, security boundaries and the analytics tracking plan, prefers existing services over new code, and gets an independent review from a second model before decisions are recorded."
license: MIT
metadata:
  stack: garageband
  phase: architect
  verified: "2026-10-13"
---

# Architecture plan

Decide the structure once, on paper, where changes are cheap. Implementers then fill in a shape that's already agreed.

## Inputs
Approved spec, `PRODUCT.md`, existing ADRs, `AGENTS.md` stack, the current code (read the relevant folders; don't guess).

## Write `docs/specs/<slug>.plan.md` with
1. **Reuse first**: existing code, packages or hosted services that already solve part of this (search-first, see dispatch-brief). Building is the last option.
2. **Data model**: tables or collections, fields with types, required/optional, relationships, indexes for the queries the spec needs, who can read and write each (row-level rules). Mark personal data fields. Note any change to existing tables — that triggers safe-migration.
3. **Contracts**: API endpoints or server actions with input and output shapes and error responses; key component props. These go into dispatch briefs word for word.
4. **Flows**: a short sequence for each main acceptance criterion (user → UI → server → database → response), including what happens on failure, timeout, retry and double-submit.
5. **Security boundaries**: who is allowed to do what, where input is validated (at the server, always), what's rate-limited, which secrets are used and where they live.
6. **Tracking plan**: every event from the spec's success metric — name (`object_action`, e.g. `batch_dispatched`), when it fires, properties, and where it's sent. No personal data in event properties.
7. **Performance budget**: page load target on a mid-range phone on 4G, largest data set expected in a year.
8. **Risks**: what's hardest, what's one-way, what we're unsure about. Each labelled with decision-brief types.
9. **Diagram**: a Mermaid diagram of components and data flow.

## Rules
- Simplest structure that meets the spec. No microservices, queues, caches or abstraction layers without a measured need.
- Use the platform's built-ins (auth, storage, row-level security, cron) before adding services.
- Name things with `docs/glossary.md` terms.

## Independent review (required)
A different model reviews the plan with only the spec and the plan. Prompt: "Find problems: missing failure cases, security holes, data that can't support the acceptance criteria, over-engineering, anything that will be hard to change later. Don't redesign; list issues with severity." Resolve Critical and High findings; record disagreements.

## Record
- Each structural choice becomes an ADR (decision-log). One-way doors go to the founder via decision-brief.
- Summary for the founder: what we'll build in five plain lines, any Founder Calls, any new monthly costs.

Next: slice-tickets.
