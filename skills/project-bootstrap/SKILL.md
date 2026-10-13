---
name: project-bootstrap
description: "Use when starting a new software project, or adopting Garageband in an existing repo that lacks AGENTS.md, the .factory ledger or the CI quality gate. Installs the project kit (constitution, templates, ledger, PR template, CI workflow, git guard hook, slop-lint), picks the default stack, sets up environments, secrets, error tracking, backups and branch protection, and proves it with a green CI run."
license: MIT
metadata:
  stack: garageband
  phase: setup
  verified: "2026-10-13"
---

# Project bootstrap

One run makes a project professional by default. Every later skill assumes this is done.

## 1. Install the kit
Run the bundled script from this skill's folder (it never overwrites existing files):
```
bash <this-skill-dir>/scripts/bootstrap.sh <repo-dir>
```
It adds: `AGENTS.md` (+ `CLAUDE.md` link), `PRODUCT.md`, `DESIGN.md`, `docs/` (spec and ADR templates, decision log, glossary), `.factory/` (ledger, ticket, brief and handoff templates, instincts), `.github/` (PR template, `garageband-ci.yml`), `.githooks/pre-push` (switched on via `core.hooksPath`) and `scripts/slop-lint.mjs`.

## 2. Choose the stack (default unless there's a reason not to)
A boring, popular stack that every model writes well. Record it as ADR-0001 with decision-log.
- **Web app**: TypeScript, Next.js, Tailwind with shadcn/ui, Postgres (managed: Supabase or Neon), Drizzle or Prisma for the schema and migrations, Auth from the platform (Supabase Auth, Clerk or Auth.js) — never home-made.
- **Payments (India)**: Razorpay; elsewhere Stripe. Card data never touches our servers.
- **Hosting**: Vercel or a similar host with **preview deploys per pull request**.
- **Tests**: Vitest for unit/integration, Playwright for browser tests.
- **Errors**: Sentry (free tier). **Product analytics**: PostHog (free tier) — needed by measure-outcome.
- **Uptime**: a free uptime monitor hitting `/api/health`.
- **Translations**: a translation-file library (e.g. next-intl) from day one if more than one language.

Deviating from the default is a Founder Call via decision-brief.

## 3. Fill AGENTS.md section 8
Stack, the exact commands (install, dev, test, typecheck, lint, e2e), environment URLs, languages and model roles. Add the matching npm scripts to `package.json` so CI runs them: `typecheck`, `lint`, `test`, `e2e`.

## 4. Environments and secrets
- Three environments: **preview** (per PR, automatic), **staging**, **production**. Production data never used in preview.
- Secrets live only in the host's secret manager and GitHub Actions secrets. Add `.env*` to `.gitignore` and commit a `.env.example` with names but no values.
- A `/api/health` endpoint that checks the database connection.

## 5. Backups
Turn on automatic daily database backups with point-in-time recovery if the plan supports it. maintenance-sweep tests a restore monthly.

## 6. Protect main
After the repo is on GitHub: `bash <this-skill-dir>/scripts/bootstrap.sh <repo-dir> --protect` (needs the `gh` CLI with admin rights), or set it by hand: require the `quality` and `secrets` checks, no force pushes, no deletion. Only the founder merges.

## 7. Prove it
Open a pull request with a trivial change (e.g. the README). Done when CI is fully green and a preview deploy URL appears on the PR. Paste the evidence for the founder.

## Checklist
- [ ] Kit installed, hooks on (`git config core.hooksPath` prints `.githooks`)
- [ ] ADR-0001 stack decision
- [ ] AGENTS.md section 8 filled; npm scripts exist
- [ ] Preview, staging, production; secrets in secret manager; `.env.example`
- [ ] Sentry, PostHog, uptime monitor, health endpoint
- [ ] Daily backups on
- [ ] Branch protection on main
- [ ] Green CI and a preview URL on a test PR
