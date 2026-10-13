---
name: portfolio-priority
description: "Use when deciding what the factory should work on next across products, features, bugs and maintenance — at the start of each week or cycle, after measure-outcome results, or when the backlog grows. Scores candidates by impact, effort, confidence and strategic fit, places them on an impact-effort matrix, and proposes the next few bets for the founder to pick."
license: MIT
metadata:
  stack: garageband
  phase: decide
  verified: "2026-10-13"
---

# Portfolio priority

A one-person factory can build far more than one person can maintain, sell or support. Choosing well matters more than building fast.

## Candidates
Pull from: open ideas (validate-idea outputs), feature requests grouped by intake-triage, measure-outcome "iterate" items, S2+ bugs, maintenance-sweep debt items, cost-watch savings, and the founder's own list.

## Score each (1–5)
| Factor | Question |
|---|---|
| Impact | How much does this move a product's success metric or the business? |
| Reach | How many users or how much revenue is touched? |
| Confidence | How sure are we, based on evidence (outcomes, requests, data), not hope? |
| Effort | Rough factory time including review, QA and maintenance (1 = hours, 5 = weeks) |
| Fit | Does it serve the founder's current main focus? |

Priority score ≈ (Impact × Reach × Confidence × Fit) ÷ Effort. Use it to sort, not to decide.

## Matrix
Place each on impact vs effort:
- **Quick wins** (high impact, low effort): do first.
- **Big bets** (high impact, high effort): pick at most one at a time; validate first.
- **Fill-ins** (low impact, low effort): only when blocked elsewhere.
- **Money pits** (low impact, high effort): drop, and say so.

S1 bugs and security issues skip the queue entirely.

## Recommend
Propose the next three items with a one-line reason each, what's being said no to, and the expected factory load. Present as a decision-brief; the founder picks. Record the choice in the decision log and add tickets (slice-tickets) for what's chosen.

Limit work in progress: no more than one big bet and two smaller items per product at once.
