---
name: slop-gate
description: "Use when setting up or running the automatic design and accessibility check, when a frontend PR fails it, or when deciding whether a flagged pattern is deliberate. Runs the deterministic slop-lint (no AI involved) against DESIGN.md tokens and known AI-template tells, explains each finding, and covers the optional Impeccable detector."
license: MIT
metadata:
  stack: garageband
  phase: test
  verified: "2026-10-13"
---

# Slop gate

Prose rules depend on each model choosing to follow them. A gate in CI doesn't. This is the one design check every model, in every tool, must pass.

## What runs
`node scripts/slop-lint.mjs` (installed by project-bootstrap; runs in the `quality` CI job).
- **Errors (block merge)**: pinch-zoom disabled, focus outline removed without replacement, images without alt text.
- **Warnings (reviewed in design-critique)**: gradient text, purple/indigo/cyan gradients, uppercase tracked "eyebrow" labels, 01/02/03 section markers, arrows glued to button labels, middle-dot joined meta strings, bouncy easing, `transition: all`, emoji as icons, marketing buzzwords in UI copy, colours not in DESIGN.md, fonts not in DESIGN.md.

Options: `node scripts/slop-lint.mjs src app --json` (machine-readable), `--warn-only` (local exploration). Config in `.slop-lint.json`: `{"ignore": ["path/to/folder"], "disable": ["rule-id"]}`. Ignoring a path or disabling a rule project-wide is a **Founder Call** (AGENTS.md "Ask first"): write a decision brief and log it. Agents never add these to make a check pass.

## When it flags something
1. Read the message; most fixes are mechanical (use a token, add alt text, restore focus style).
2. If the pattern is deliberate and DESIGN.md supports it, add `slop-ok: <reason>` as a comment on that line. The reason is mandatory and reviewers check it.
3. Never weaken the script or CI step to pass. That's in AGENTS.md "Never".

## Optional: Impeccable detector
The open-source Impeccable project ships a deeper detector (dozens of rules on rendered styles). The CI workflow runs it as **advisory** (`continue-on-error`). To make it required:
1. Run `npx impeccable detect` locally on the project and review results.
2. Pin the exact version in the workflow (`npx impeccable@<version> detect`), keep `DO_NOT_TRACK=1`, and check its licence and what it downloads.
3. Remove `continue-on-error`. That's a Taste decision; log it.

## Extending
New repeated design mistakes found in design-critique or retros can become new rules: add a `{ id, level, files, test, msg }` entry in `scripts/slop-lint.mjs` with a test fixture showing a hit and a miss. Prefer warnings; promote to errors only for accessibility and clear defects.
