---
name: ui-build-rules
description: "Use before writing or changing any user interface code — components, pages, styles, animations or UI copy. The craft floor every frontend change must meet: DESIGN.md tokens only, approved component libraries, states, accessibility, responsive rules, when and how to animate, and UI copy rules."
license: MIT
metadata:
  stack: garageband
  phase: build
  verified: "2026-10-13"
---

# UI build rules

Load before any UI edit. These are the floor; DESIGN.md sets the style above it.

## Tokens and components
- Colours, fonts, spacing, radius and motion values come only from `DESIGN.md`. No new hex values or fonts in code. slop-gate checks this.
- Use the component libraries listed in `DESIGN.md`. Never hand-roll a dialog, dropdown, select, toast, tooltip, date picker or command menu.
- Respect the screen's mode from `PRODUCT.md` (Operate screens: calm, dense, almost no motion).

## Every screen has all its states
Default, loading (skeleton matching the final layout, not a spinner in the middle of nowhere), empty (says what to do next), error (says what happened and how to fix it), partial data, and very long content.

## Accessibility (non-negotiable)
- Text contrast at least 4.5:1, large text 3:1.
- Visible focus style on everything focusable. Never `outline: none` without a replacement.
- Every input has a label. Every image has alt text. Buttons are `<button>`, links are `<a>`.
- Touch targets at least 44×44 px. Inputs at least 16 px font size so phones don't zoom.
- Never disable pinch zoom.
- Headings in order (h1 → h2 → h3), one h1 per page.
- Everything works by keyboard. Dialogs trap and return focus.

## Responsive
Design at 375 px first, then 768, 1024, 1440. Use `100dvh` for full-height app shells. Respect safe areas on phones. Hover effects only for devices that support hover: `@media (hover: hover) and (pointer: fine)`.

## Motion: decide *whether* before *how*
1. **Frequency**: actions done 100+ times a day or from the keyboard get no animation. Tens of times a day: barely visible. Rare moments (first run, success after a big task) may delight.
2. **Purpose**: name it — feedback, showing where something came from or went, state change, avoiding a jarring jump. No purpose, no animation.
3. **How**: only animate `transform` and `opacity`. Entering and exiting: ease-out. Moving on screen: ease-in-out. Never ease-in for UI. Durations: press 100–160 ms, tooltip 125–200 ms, dropdown 150–250 ms, dialog 200–300 ms. UI stays under 300 ms.
4. Never animate from `scale(0)`; start around `scale(0.95)` with opacity 0. Popovers grow from their trigger. Exit mirrors entry.
5. Animations must be interruptible and never block input.
6. `prefers-reduced-motion`: keep fades and colour changes, remove movement.

## UI copy
- Plain words, active verbs. Say what the button does: "Save batch", not "Submit".
- The same word for the same thing everywhere (check `docs/glossary.md`). If the button says "Archive", the toast says "Archived".
- Errors say what happened and what to do, without blaming or apologising: "Photo is over 10 MB. Choose a smaller one."
- No marketing buzzwords in product UI.
- All user-facing text comes from translation files when `PRODUCT.md` lists more than one language. Never concatenate translated fragments. Use locale-aware number, currency and date formatting (e.g. `Intl.NumberFormat('en-IN')` for lakh/crore).

## Before you say done
Run `node scripts/slop-lint.mjs` and fix errors. Check the page at 375 px and 1440 px. Then hand off to browser-qa and design-critique.
