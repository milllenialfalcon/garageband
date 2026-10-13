# Instincts

Learned rules from retros, managed by `retro-instincts`. A rule moves into AGENTS.md, a skill or a CI check only when it reaches confidence 0.7 and the founder approves; it is then marked `promoted` (0.9).

Allowed triggers (closed list, so rules stay specific): `on-frontend-ticket` · `on-backend-ticket` · `on-schema-change` · `on-new-dependency` · `on-auth-or-payments` · `on-review` · `on-dispatch` · `on-research` · `on-release` · `on-bug-fix` · `on-design-change` · `on-copy-change`

| ID | Trigger | Action (one sentence) | Evidence (incident links) | Incidents | Confidence | Status |
|---|---|---|---|---|---|---|

## Confidence scale (the only definition; skills refer here)
- **0.3**: seen in one incident.
- **0.5**: seen in two separate incidents.
- **0.7**: seen in two or more incidents, and applying the action was shown to prevent a repeat. Eligible for promotion.
- **0.9**: promoted (founder approved; now lives in AGENTS.md, a skill or a CI check).
- Lower it one step when the founder or a reviewer says the rule was wrong. Retire it if it hasn't triggered in three months.

Status: `candidate` (0.3–0.5) · `active` (0.7) · `promoted` (0.9) · `retired`.
