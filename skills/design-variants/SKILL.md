---
name: design-variants
description: "Use when a key screen (home, main workflow, landing page, dashboard) is being designed for the first time or reworked. The frontend model builds 3 working variants that each differ on one named axis, behind a picker, so the founder chooses by looking rather than by reading descriptions. Losing variants are deleted."
license: MIT
metadata:
  stack: garageband
  phase: design
  verified: "2026-10-13"
---

# Design variants

Non-designers can't judge a description, but they can judge three real screens side by side. This skill turns taste decisions into a quick visual choice.

## When
Only for screens that matter: the first screen users see, the main daily workflow, the landing page. Not for settings pages or forms that follow the system.

## Steps
1. Read `PRODUCT.md`, `DESIGN.md` (tokens are fixed; variants never break them) and the spec.
2. Write a one-sentence identity for the screen: what the user must do or feel here.
3. Choose **3 variants, each changing one named axis** from this list, no two on the same axis:
   - Layout (e.g. list vs board vs map)
   - Hierarchy (what's biggest and first)
   - Density (spacious vs compact)
   - Type treatment (display-led vs content-led)
   - Colour use (restrained vs bold use of the accent)
4. Build each as a real, working page using real-looking data (names and numbers from the domain, not lorem ipsum), at phone and desktop widths, on a `spike/variants-<screen>` branch.
5. Add a simple picker: a small fixed switcher (`?v=a|b|c`) that swaps variants. The switcher is identical across variants so only the design changes.
6. **Squint test** each variant: blur your view (or a 10%-scale screenshot). Can you still see what matters most? If two variants look the same squinted, replace one.
7. Run slop-lint on the branch and fix errors.

## Present
Send the founder the preview link and, for each variant: one line on what it optimises for and one on what it gives up. Recommend one. Ask them to pick, or say "mix A's layout with C's density".

## After the choice
- Record the winner in `DESIGN.md` → Approved variants, and in the decision log (Taste or Founder Call).
- Delete the losing variants and the picker. Port the winner into a normal ticket (slice-tickets) with proper tests. The spike branch is never merged as-is.

## Red flags
- Variants that differ only in colour. That's one axis pretending to be three.
- Fake data that hides real problems (short names, round numbers). Use realistic lengths.
- Keeping all three "for later". Delete the losers.
