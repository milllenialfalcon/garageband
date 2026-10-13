---
name: project-bootstrap
description: "Use when starting a new software project, or adopting Garageband in an existing repo that lacks AGENTS.md, the .factory ledger or the CI quality gate. Installs the project kit (constitution, templates, factory-state ledger, PR template, CI workflow, git guard hook, slop-lint), picks the default stack, creates the app, sets up environments, secrets, error tracking, backups, an accounts register and branch protection, and proves it with a green CI run."
license: MIT
metadata:
  stack: garageband
  phase: setup
  verified: "2026-10-13"
---

# Project bootstrap

One run makes a project professional by default. Every later skill assumes this is done. Run it before anything else in a new repo.

## 0. Prerequisites (check, don't assume)
`git --version` (2.20+), `node --version` (22+), and for GitHub steps `gh auth status`. If something is missing, tell the founder exactly what to install and stop; installing system software is a Founder Call.

## 1. Choose the stack (default unless there's a reason not to)
A boring, popular stack that every model writes well.
- **Web app**: TypeScript, Next.js, Tailwind with shadcn/ui, Postgres (managed: Supabase or Neon), Drizzle or Prisma for schema and migrations, auth from the platform (Supabase Auth, Clerk or Auth.js), never home-made.
- **Payments (India)**: Razorpay; elsewhere Stripe. Card data never touches our servers.
- **Hosting**: Vercel or a similar host with **preview deploys per pull request**.
- **Tests**: Vitest for unit and integration, Playwright for browser tests.
- **Errors**: Sentry (free tier). **Product analytics**: PostHog (free tier), needed by measure-outcome.
- **Uptime**: a free uptime monitor hitting `/api/health`.
- **Translations**: a translation-file library (e.g. next-intl) from day one if `PRODUCT.md` lists more than one language.

Deviating from the default is a Founder Call via decision-brief. Record the choice as ADR-0001 (decision-log) after step 3.

## 2. Create the app (new projects only)
In an **empty** folder, create the app first, because app generators refuse folders that already contain files. For the default stack:
```
npx create-next-app@latest <folder> --ts --tailwind --eslint --app --src-dir --use-npm
```
Then add the npm scripts CI runs: `"typecheck": "tsc --noEmit"`, `"lint": "next lint"` (or `eslint .`), `"test": "vitest run"`, `"e2e": "playwright test"` (browser-qa installs Playwright with the first flow). Existing repos skip this step.

## 3. Install the kit
Run the bundled script from this skill's folder. It never overwrites existing files:
```
bash <this-skill-dir>/scripts/bootstrap.sh <folder>
```
It adds `AGENTS.md` (+ `CLAUDE.md` link), `PRODUCT.md`, `DESIGN.md`, `CHANGELOG.md`, `.env.example`, `.gitignore` entries, `docs/` (spec and ADR templates, decision log, glossary, costs, compliance, accounts register), `.github/` (PR template, `garageband-ci.yml`), `.githooks/pre-push` (switched on for this clone) and `scripts/slop-lint.mjs`.

It also creates **`.factory/` as a separate checkout of the `factory-state` branch**: the ledger, tickets, briefs, handoffs and reports live there, never merge into `main`, and are visible to every tool as soon as they're pushed (see AGENTS.md section 2).

## 4. Fill AGENTS.md section 10
Stack, exact commands (install, dev, test, typecheck, lint, e2e), environment URLs, languages, model roles and the main checkout path. Commit on a branch and open a PR.

## 5. Environments, secrets and accounts
- Three environments: **preview** (per PR, automatic), **staging**, **production**. Production data never used in preview.
- Secrets live only in the host's secret manager and GitHub Actions secrets. Every variable the app reads is listed, without values, in `.env.example`.
- A `/api/health` endpoint that checks the database connection.
- Fill `docs/accounts.md` with the founder: every service, which login owns it, 2FA on, where recovery codes are kept (their password manager, never the repo), who else has access.

## 6. Backups
Turn on automatic daily database backups, with point-in-time recovery if the plan supports it. maintenance-sweep tests a restore monthly.

## 7. Put it on GitHub and protect main
1. Create the GitHub repo (the founder approves its name and visibility), add it as `origin`, push `main`.
2. Share factory state: `git -C .factory push -u origin factory-state`.
3. Protect main: `bash <this-skill-dir>/scripts/bootstrap.sh <folder> --protect` (needs `gh` with admin rights), or by hand in Settings → Branches: require the `quality`, `e2e` and `secrets` checks, block force pushes and deletion.
4. Repos owned by a GitHub organisation: add a free `GITLEAKS_LICENSE` secret (from gitleaks.io) or the `secrets` check fails.

GitHub can't stop an agent that uses the founder's own login from merging. That rule is enforced by AGENTS.md, the Claude Code guard hook and the agents never being asked to merge. Keep merge buttons for the founder.

## 8. Prove it
Open a pull request with a small change (the AGENTS.md section 10 edit is ideal). Done when CI is fully green and a preview deploy URL appears on the PR. Paste the evidence for the founder in plain words.

## Checklist
- [ ] Prerequisites present
- [ ] App created (new projects); npm scripts exist
- [ ] Kit installed; `git config core.hooksPath` prints `.githooks`; `.factory/` is on branch `factory-state`
- [ ] ADR-0001 stack decision; AGENTS.md section 10 filled
- [ ] Preview, staging, production; secrets in the secret manager; `.env.example` complete
- [ ] Sentry, PostHog, uptime monitor, health endpoint
- [ ] Daily backups on; `docs/accounts.md` filled
- [ ] On GitHub; factory-state pushed; branch protection on main
- [ ] Green CI and a preview URL on a test PR
