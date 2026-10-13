---
# Design tokens. Machine-readable: slop-gate checks code against these.
version: 1
dials:            # 1-10, set by the founder
  variance: 4     # 1 = calm and conventional, 10 = bold and unusual
  motion: 3       # 1 = still, 10 = lively
  density: 5      # 1 = airy, 10 = dense
mode_default: light   # light | dark | both (decided on purpose, never by habit)
colors:
  bg: "#FFFFFF"
  surface: "#F6F6F4"
  text: "#1C1C1A"
  text-muted: "#5E5E58"
  primary: "#2F5D50"
  primary-text: "#FFFFFF"
  accent: "#C8892B"
  danger: "#B3261E"
  success: "#2E7D32"
  border: "#E2E2DC"
fonts:
  display: "Fraunces"
  body: "Inter Tight"
  mono: "JetBrains Mono"
type_scale: [12, 14, 16, 18, 22, 28, 36, 48]
spacing: [4, 8, 12, 16, 24, 32, 48, 64]
radius: [0, 6, 12]
breakpoints: [375, 768, 1024, 1440]
motion:
  fast: 120ms
  base: 200ms
  slow: 300ms
  ease_out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease_in_out: "cubic-bezier(0.77, 0, 0.175, 1)"
component_libraries: []   # chosen in design-system, e.g. [shadcn/ui, sonner, cmdk]
---

# DESIGN.md

> Placeholder values above. `design-system` replaces them for each product. Changing this file after approval is a Founder Call.

## Direction
<Two or three sentences: what this product should feel like and why, grounded in who uses it.>

## Rules
- Colour: use only the tokens above. Text contrast is at least 4.5:1 (3:1 for large text).
- Type: two families at most. Body line length 60–75 characters.
- Spacing: only values from the spacing scale.
- Motion: purpose first (see `ui-build-rules`). Everything respects reduced-motion settings.
- Components: use the chosen libraries; never hand-roll a dropdown, dialog, toast or date picker.

## Page overrides
Pages that deviate from the master go in `docs/design/pages/<page>.md`. Each override says what changes and why.

## Approved variants
| Screen | Chosen variant | Date | Notes |
|---|---|---|---|
