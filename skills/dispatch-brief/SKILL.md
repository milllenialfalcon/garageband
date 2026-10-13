---
name: dispatch-brief
description: "Use before handing any ticket to another model or a fresh session (implementer, frontend model, reviewer, cheaper model). Searches for reusable code first, compiles a self-contained brief with the contract, file pointers, steps, commands, limits and a fixed report format, runs a reader test with a fresh model to catch ambiguity, then claims the ticket in the ledger."
license: MIT
metadata:
  stack: garageband
  phase: handoff
  verified: "2026-10-13"
---

# Dispatch brief

The receiving model starts cold, may be weaker, and can't ask you what you meant. Everything it needs is in the brief or in a file the brief points to.

## 1. Search first (before writing the brief)
Look for what already exists so the implementer reuses instead of rebuilding:
- In the repo: similar components, helpers, types, API routes, tests (search by glossary terms and by file names).
- In the stack: built-in features of the framework, database, auth or UI library.
- Packages: only well-maintained, permissively licensed (MIT, Apache, BSD), widely used. Adding one is a Taste decision; adding a paid service is a Founder Call.
Put findings in the brief's "Reuse before you write" section.

## 2. Write the brief
Copy `.factory/BRIEF_TEMPLATE.md` to `.factory/briefs/T-NNN.md`. Fill every section:
- **Goal**: the user-visible result in two sentences.
- **Contract**: the acceptance criteria verbatim from the spec, the exact interfaces from the architecture plan, and what must not change.
- **Context pointers**: file paths in reading order, with one line on why each matters. Pass paths, not pasted content, except the contract.
- **Steps** with `→ verify:` commands.
- **Commands** for test, typecheck, lint, run.
- **Limits**: branch name, files it may touch, when to stop and report `NEEDS_CONTEXT` or `BLOCKED`.
- **Report format**: the fixed STATUS block.
Frontend tickets also point to `DESIGN.md` and tell the model to load ui-build-rules.

Never include secrets, customer data or production URLs with credentials in a brief.

## 3. Reader test
Give only the brief (and the files it points to) to a fresh, cheap model: "You are about to implement this. Before starting, list every ambiguity, missing piece of information or contradiction. Do not implement." Fix the brief for each real finding and note it in the brief's Reader test section. Skip only for S-sized tickets that touch one file.

## 4. Dispatch
- Update the ledger: status `claimed`, owner model, branch.
- Hand over with one line: "Read `.factory/briefs/T-NNN.md` and follow it exactly. Load the tdd-slice skill."
- When the report comes back, check it has evidence. A `DONE` without pasted output is treated as `NEEDS_CONTEXT`.

## Red flags
| Thought | Instead |
|---|---|
| "They'll figure out the context." | They can't see your conversation. Point to files. |
| "I'll paste the whole spec." | Paste the contract; point to the rest. Long context makes weak models drift. |
| "The reader test is overkill." | It costs pennies and catches most handoff failures. |
