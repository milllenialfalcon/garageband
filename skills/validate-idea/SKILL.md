---
name: validate-idea
description: "Use before speccing or building any new product, app or major feature, to decide whether it should exist. Runs forcing questions about the user, the problem, today's workaround and the smallest version worth shipping, checks competitors, and ends in a build / shrink / don't build recommendation recorded in PRODUCT.md."
license: MIT
metadata:
  stack: garageband
  phase: discover
  verified: "2026-10-13"
---

# Validate the idea

The cheapest software is the software you don't build. This takes 20–40 minutes and can save weeks.

## 1. Six forcing questions (ask the founder, grill-founder style, with recommended answers)
1. **Who exactly?** One specific person or role you could name and call this week.
2. **What do they do today?** The current workaround (spreadsheet, WhatsApp, paper, a competitor, nothing).
3. **What does that cost them?** Time, money, mistakes, risk. A number if possible.
4. **What evidence do we have?** Conversations, their complaints, your own repeated pain, data. "I think" is not evidence.
5. **Smallest version that would change their week?** One job, done well.
6. **How will we know it worked?** One success metric, a target and a timeframe, plus a kill signal.

## 2. Research (delegate to research models, then verify-research)
- 3–5 existing alternatives: what they do, price, what users complain about.
- Can an existing tool (a spreadsheet, a no-code tool, a SaaS product) do 80% of this today? If yes, that's often the answer for v1.
- Any regulatory or platform constraint (payments, data, app stores, agriculture or property rules in the region).

## 3. Score

| Factor | 1 (weak) – 5 (strong) | Note |
|---|---|---|
| Pain is real and frequent | | |
| Evidence beyond our opinion | | |
| Today's workaround is costly | | |
| Small v1 exists | | |
| We can reach these users | | |
| Fits the founder's other bets | | |

## 4. Recommend one of
- **Build**: score mostly 4–5. Proceed to grill-founder and write-spec.
- **Shrink**: real pain but v1 too big. Propose the smaller version.
- **Use an existing tool**: name it and how to set it up.
- **Don't build (yet)**: name what evidence would change the answer and the cheapest way to get it (5 user calls, a landing page, a manual pilot).

Present as a **decision-brief** (it's a Founder Call).

## Output
Fill or update `PRODUCT.md` (One line, Who it's for, Problem, Smallest version, Not doing, Success metric). Log the decision in `docs/decision-log.md`.

## Red flags
- Skipping this because "it's just a quick app". Quick apps still need maintenance, hosting and support.
- Success metric that can't be measured ("people love it").
- A v1 with more than one core job.
