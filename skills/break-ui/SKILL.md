---
name: break-ui
description: "Use after a UI component or page works with normal data, before review, to find layout and behaviour failures by feeding it realistic worst-case data — very long names, huge numbers, empty lists, other scripts like Hindi or Kannada, slow networks and errors — behind a dev-only toggle, then reporting each break with cause and fix."
license: MIT
metadata:
  stack: garageband
  phase: test
  verified: "2026-10-13"
---

# Break the UI

Demo data is always short and tidy. Real data isn't. This finds the breaks before users do, without needing a designer's eye.

## Worst-case catalogue
Use plausible values from the real domain or the schema's limits, never random gibberish.

| Category | Examples |
|---|---|
| Long text | The longest real name you can find; a 200-character title; a word with no spaces (URL, email, ID) |
| Scripts | Hindi (Devanagari) and Kannada strings, which are taller and wider than English; mixed English + local script; right-to-left if supported |
| Numbers | 0, 1, negative, 12,34,56,789 (lakh/crore grouping), many decimals, ₹ amounts with paise, percentages over 100 |
| Counts | Empty list; one item; 10,000 items; exactly the page size and one more |
| Dates | Today, 31 Dec, 29 Feb, far past, far future, different time zones |
| Media | Missing image, tiny image, huge image, portrait vs landscape, slow-loading image |
| States | Loading for 10 seconds; network error; server 500; permission denied; offline; session expired mid-action |
| Input | Paste of 5,000 characters; emoji; leading and trailing spaces; double-click on submit |
| Device | 320 px wide, 200% browser zoom, landscape phone, keyboard only |

## Steps
1. Add a dev-only switch (e.g. `?stress=long`, or a fixture set used only in development and tests). It must never ship enabled in production.
2. Run each relevant category against the component. Screenshot what breaks.
3. For each break, record symptom → likely cause → fix.
4. Fix in the same ticket if it's in scope; otherwise create tickets.
5. Turn the most important cases into permanent tests (component or Playwright) so they stay fixed.

## Output
```
| Case | Symptom | Cause | Fix | Test added |
|---|---|---|---|---|
| Kannada farm name | Text clipped in card header | fixed height + overflow hidden | min-height, line-clamp 2 with title tooltip | yes |
```

Common fixes: `min-width: 0` on flex children, `overflow-wrap: anywhere` for unbroken strings, line clamping with the full text available, `tabular-nums` for number columns, locale-aware formatting, skeletons sized like real content, disabling submit while pending.
