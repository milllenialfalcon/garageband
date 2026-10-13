# Dispatch brief: T-<NNN> <title>

> You are starting cold. Everything you need is here or in the files linked. Do not rely on any earlier conversation. Read `AGENTS.md` first.

## Your role
<Implementer | Frontend implementer | Reviewer> for one ticket. Model: <name>.

## Goal
<The user-visible result, in two sentences.>

## Contract (what "correct" means)
- Acceptance criteria:
  - AC<n>: Given … when … then …
- Interfaces you must match (types, endpoints, components):
  - `<path>`: <signature or shape>
- Must not change: <files, public APIs, DESIGN.md tokens>

## Context pointers (read these, in this order)
1. `AGENTS.md`
2. `docs/specs/<spec>.md` (sections …)
3. `<file path>` (why it matters)
4. `DESIGN.md` (frontend tickets only)

## Reuse before you write
Already exists, use it: <existing helpers, components, packages found by search-first>.
Don't add: <packages or patterns to avoid>.

## Steps
1. <step> → verify: `<command>`
2. <step> → verify: `<command>`

## Commands
- test: `…` · typecheck: `…` · lint: `…` · run locally: `…`

## Limits
- Branch: `t-<nnn>-<slug>` · touch only: `<paths>`
- Stop and report `NEEDS_CONTEXT` instead of guessing about: <list>
- Stop and report `BLOCKED` after 3 failed attempts at the same problem.

## Report back in this exact shape
```
STATUS: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
BRANCH:
FILES CHANGED:
EVIDENCE: (paste test, typecheck and lint output)
CONCERNS / QUESTIONS:
```

## Reader test (filled in by a fresh model before dispatch)
- Ambiguities found:
- Resolved by:
