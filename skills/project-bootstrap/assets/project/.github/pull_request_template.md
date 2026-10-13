## For the founder (plain English)

**What changed:**
<One or two sentences a non-engineer understands.>

**Why:**
Ticket T-<NNN> · Spec: docs/specs/<spec>.md

**How we know it works:**
<Tests added, what they check. Paste the summary line of the test run.>

**What could break:**
- Blast radius: <who or what is affected if this is wrong>
- Door: two-way (easy to undo) | one-way (hard to undo, explain)

**What to check on the preview:**
1. Open <preview URL>/<page>
2. Do <action>, expect <result>

## Checklist (Definition of Done)
- [ ] Acceptance criteria met (list which: AC…)
- [ ] Tests added or updated; a bug fix includes a test that failed before the fix
- [ ] typecheck, lint, tests and slop-gate green in CI
- [ ] Reviewed by a different model than the author (reviewer: …)
- [ ] No secrets, keys or personal data in code or logs
- [ ] Migration has a tested rollback (or: no schema change)
- [ ] Behind a feature flag (or: not needed, because …)
- [ ] Docs, glossary and decision log updated where needed
- [ ] Founder Calls in this PR: none | listed below

## Author / reviewer
- Author model: · Reviewer model:
