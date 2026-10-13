---
name: cost-watch
description: "Use monthly, before adding any paid service, when a bill looks unexpectedly high, or when AI model quotas run short. Lists every running cost per product (hosting, database, storage, email, SMS, APIs, AI models, domains, subscriptions), compares to budget and last month, flags spikes and waste, and proposes savings as decisions."
license: MIT
metadata:
  stack: garageband
  phase: operate
  verified: "2026-10-13"
---

# Cost watch

Cheap stacks drift expensive quietly: a forgotten preview database, an API in a loop, a free tier that ended. This catches it monthly.

## Inventory
Keep `docs/costs.md`: one row per service.

| Service | Product | What it's for | Plan | Monthly cost (₹ or $) | Billing date | Free-tier limit | Owner account | Can cancel? |
|---|---|---|---|---|---|---|---|---|

Include AI model subscriptions and usage-based plans for the factory itself.

## Monthly check
1. Update each cost from the provider's billing page or the founder's statements (the founder can paste figures; never ask for card or bank details).
2. Compare to last month and to the budget in `PRODUCT.md`. Flag any line up more than 20% or any new line.
3. Look for waste: unused projects, idle databases, old preview environments, duplicate tools, paid tiers whose features aren't used, logs or storage growing without limit.
4. Check free-tier headroom: anything above 70% of a free limit gets a warning before it starts billing or stops working.
5. Usage-based APIs: check for loops or missing caching (sudden request spikes), and that rate limits and spending caps are set where the provider allows.
6. Factory quotas: which models hit limits this month, and whether model-router's routing should shift.

## Output
`.factory/reports/costs-<YYYY-MM>.md`: total vs budget, top 5 costs, spikes with likely causes, savings proposals (each with ₹/month saved and risk) as decision-briefs. Adding any new paid service is always a Founder Call.
