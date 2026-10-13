---
name: design-system
description: "Use once per product, before any UI is built, or when DESIGN.md is missing or being reworked. Classifies each screen's mode, sets three founder dials (variance, motion, density), proposes colours, fonts, spacing and component libraries grounded in the product's users, checks the plan against generic AI-default looks, and writes DESIGN.md tokens that slop-gate enforces."
license: MIT
metadata:
  stack: garageband
  phase: design
  verified: "2026-10-13"
---

# Design system

Goal: a design that fits *this* product and its users, written as tokens machines can check. Not a trend, not a template.

## 1. Ground it in the product
Read `PRODUCT.md`. Write down: who uses it, on what device, in what conditions (sunlight, gloves, slow network, older users, first-time smartphone users), how often, and the feeling the product should give. Let that world drive choices. A farm logging tool used outdoors on cheap phones needs high contrast, big touch targets and density; a property brochure site needs atmosphere and photography.

## 2. Classify screens by mode
Fill the mode table in `PRODUCT.md`: **Persuade** (expressive, one call to action), **Operate** (calm, dense, nearly no motion), **Read** (typography first), **Experience** (motion is the product). Modes decide how much the rules can bend.

## 3. Founder dials
Ask the founder to set three numbers from 1 to 10 (offer a recommendation for each):
- **Variance**: 1 calm and conventional ↔ 10 bold and unusual
- **Motion**: 1 still ↔ 10 lively
- **Density**: 1 airy ↔ 10 dense

## 4. Write the plan before any tokens
- Light or dark default, chosen on purpose for the users' conditions.
- 4–6 named colours with hex values and their job (background, surface, text, primary, accent, danger). Check text contrast is at least 4.5:1 (3:1 for large text); show the ratios.
- Two type families at most, with roles (display, body). Include scripts for every language in `PRODUCT.md` (e.g. Devanagari, Kannada); pick families that support them or pair a matching one.
- Type scale, spacing scale, radius set, breakpoints (375, 768, 1024, 1440).
- Motion durations and easing within the motion dial (see ui-build-rules).
- Component libraries (accessible, maintained). Default for React: shadcn/ui on Radix or Base UI, Sonner for toasts, cmdk for command menus, a date picker from the same family. Never hand-roll dialogs, dropdowns, toasts or date pickers.
- An ASCII wireframe of the most important screen.

If the `ui-ux-pro-max` skill is installed, you may use its design-system generator for a starting point, then apply the steps below to it.

## 5. Check against the generic default
Ask: "What would any AI produce for a similar product?" Then make sure this plan isn't that. Avoid by default (allowed only if the product truly calls for it, with a written reason):
- Purple, indigo or cyan gradients; gradient text; glassmorphism; glow effects.
- Warm cream background with terracotta and a serif by reflex; near-black with one acid accent by reflex.
- Inter or Roboto everywhere with no type hierarchy.
- Identical rounded cards with one soft shadow, icon tiles above every heading, tiny uppercase "eyebrow" labels, 01/02/03 section numbers, big-number hero with gradient.
- Emoji as icons; arrows glued to button labels.

Write what changed after this check, in one or two lines.

## 6. Write DESIGN.md
Replace the frontmatter tokens in `DESIGN.md` and write the Direction and Rules sections. Page-specific deviations go in `docs/design/pages/<page>.md`.

## 7. Approve
Present to the founder: the direction in two sentences, a colour/type sample (render a simple HTML page if possible), and the dials. Approval is a Founder Call; afterwards, any change to `DESIGN.md` is too.

Next: design-variants for the key screens.
