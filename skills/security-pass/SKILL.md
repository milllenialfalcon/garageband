---
name: security-pass
description: "Use for any pull request touching authentication, authorisation, payments, personal data, file uploads, external APIs, secrets, environment config or database permission rules, and before any release that includes such changes. Runs a focused threat check (who could abuse this and how), an OWASP-style checklist, secrets and dependency review, and returns GO or NO-GO with any Critical finding blocking."
license: MIT
metadata:
  stack: garageband
  phase: secure
  verified: "2026-10-13"
---

# Security pass

Solo founders get breached through the boring things: a missing permission check, a leaked key, an unvalidated upload. This checks the boring things every time.

## 1. Threat sketch (five minutes)
For the change: what's valuable here (money, personal data, admin powers, other users' data)? Who might abuse it (a curious user, a competitor, a bot, a former employee)? What's the easiest abuse? Write three lines.

## 2. Checklist
**Access**
- [ ] Every server route/action checks *authentication* and *authorisation* (this user may act on *this* record), not just that someone is logged in.
- [ ] Database row-level rules enforce the same; tested with a second user who must be refused.
- [ ] Admin functions separated and protected.

**Input and output**
- [ ] All input validated on the server with a schema (types, lengths, ranges, formats).
- [ ] Queries parameterised (ORM or prepared statements); no string-built SQL.
- [ ] Output escaped; no raw HTML from users rendered.
- [ ] File uploads: type and size checked server-side, stored outside the web root or in object storage, never executed, served with safe headers.

**Secrets and data**
- [ ] No secrets in code, logs, error messages, client bundles or briefs. Public env vars contain nothing sensitive.
- [ ] Personal data: only what the spec needs; marked in the plan; not in analytics events or logs.
- [ ] Passwords never stored by us (platform auth handles it).

**Abuse**
- [ ] Rate limits on login, signup, password reset, OTP, uploads and any expensive or paid API call.
- [ ] Payments: amounts computed server-side; webhooks verified by signature; idempotent processing.
- [ ] CSRF protection on state-changing requests; secure, httpOnly, sameSite cookies.

**Dependencies and config**
- [ ] `npm audit` has no high/critical; new dependencies are maintained and permissively licensed.
- [ ] Security headers set (Content-Security-Policy, HSTS, X-Content-Type-Options, frame protection).
- [ ] Error pages don't leak stack traces in production.

## 3. Prove the important ones
Write tests for the authorisation rules (user B can't read or change user A's record) and for input validation on new endpoints. These are the highest-value tests in the codebase.

## 4. Verdict
```
SECURITY: GO | NO-GO
Critical: … (blocks)   Required: … (fix before release)   Optional: …
```
Severity names follow AGENTS.md section 7. Any Critical → NO-GO. A suspected leaked secret → rotate it immediately (Founder Call for the account), then fix. Never just delete it from the latest commit.
