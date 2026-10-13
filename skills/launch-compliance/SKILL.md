---
name: launch-compliance
description: "Use before a product's first public launch, before adding payments, accounts or personal data collection to an existing product, before publishing to an app store, and yearly. Covers privacy policy and terms, consent and data rights (including India's DPDP Act), open-source licence compliance, payments and tax invoicing, accessibility and app-store rules, producing a checklist and the draft documents for legal review."
license: MIT
metadata:
  stack: garageband
  phase: secure
  verified: "2026-10-13"
---

# Launch compliance

Not legal advice. This makes sure nothing obvious is missing and drafts the documents a lawyer can then review quickly and cheaply. Laws change; verify current rules with verify-research before relying on any item, using primary sources only: the law's official text and the regulator's website (in India, e.g. the Ministry of Electronics and IT for the DPDP Act, and the GST portal), and the payment provider's own documentation.

## 1. Inventory (from PRODUCT.md and the architecture plan)
- What personal data is collected, why, where it's stored (region), who processes it (hosting, analytics, email, payments), how long it's kept.
- Who the users are (consumers, businesses, children?) and which countries.
- Money flows: payments, subscriptions, refunds, invoices.

## 2. Privacy and data protection
- [ ] Privacy policy in plain language: what, why, who receives it, retention, rights, contact.
- [ ] For users in India, the DPDP Act: notice before collection, consent that's specific and withdrawable, a way to access, correct and erase data, a grievance contact, breach handling. Check current rules and any notified rules.
- [ ] For users in the EU/UK: GDPR basics (lawful basis, data processing agreements with vendors, cookie consent for non-essential cookies).
- [ ] Data processing agreements in place with vendors who handle personal data.
- [ ] Account deletion works and actually deletes or anonymises data (test it).
- [ ] No children's data unless deliberately designed for it with the extra rules.

## 3. Terms and policies
- [ ] Terms of service: what the product does and doesn't promise, acceptable use, liability limits, governing law.
- [ ] Refund and cancellation policy if anything is sold (payment providers often require it).
- [ ] Contact details and business identity visible.

## 4. Payments and tax
- [ ] Payment provider (e.g. Razorpay, Stripe) account verified; required website pages present.
- [ ] Invoices meet tax rules (e.g. GST registration, invoice format) where applicable; prices shown with tax treatment.
- [ ] Subscription renewals notified as required; cancellation easy.

## 5. Open-source licences
- [ ] List dependency licences (`npx license-checker --summary` or similar). Flag GPL, AGPL, SSPL or unknown licences for review.
- [ ] Required attributions included (a licences page or file).
- [ ] Fonts, icons and images licensed for commercial use.

## 6. Accounts and continuity
- [ ] `docs/accounts.md` complete: every service, owning login, 2FA on, recovery codes in the founder's password manager, billing owner.
- [ ] Someone trusted could take over in an emergency (where the instructions are, outside the repo).

## 7. Accessibility and platforms
- [ ] Main flows pass browser-qa's accessibility checks (aim for WCAG 2.2 AA).
- [ ] App stores (if mobile): privacy labels, account deletion in-app, payment rules for digital goods.

## Output
- `docs/compliance.md`: the checklist with status and links.
- Drafts: `docs/legal/privacy-policy.md`, `docs/legal/terms.md`, `docs/legal/refunds.md` marked **DRAFT, needs legal review**.
- A decision-brief listing anything that needs a lawyer or an account action by the founder.
