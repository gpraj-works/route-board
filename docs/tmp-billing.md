# TEMP — Razorpay Billing (Deferred Phase 11+)

> Temporary working notes. Phase 11 shipped a **sandbox checkout** (see `docs/plans/phase-11-billing-subscription.md`). This doc is the parking lot for the **real payment gateway work — Razorpay** — that replaces the sandbox confirm flow.

## What already shipped (Phase 11 sandbox)

- Fresh **14-day trial** for every company; `subscription_status` enum `trial` / `active` / `past_due` / `cancelled` / `expired` (migration `0005_company_trial_subscription.sql`).
- `companies` columns: `city`, `state`, `zip_code`, `country` (NOT NULL DEFAULT `'US'`), `trial_started_at`, `trial_ends_at`, reserved `payment_customer_id`, `payment_subscription_id`.
- Full `subscription` module: `GET /status`, `POST /checkout` (sandbox session), `POST /checkout/confirm` (trial → active, **no charge**), `POST /webhook` (**stub**), `PUT /cancel`.
- Whole-app `requireActiveSubscription` gate; frontend `ProtectedRoute` → `/checkout` redirect; `AppHeader` trial badge; registration captures phone/address/city/state/zip/country.
- Single **Professional** plan; no per-plan module gating.

## Parked Razorpay work (not started)

- Razorpay **Orders API** session creation in `POST /subscription/checkout` (replace sandbox) + `checkout.js` embed; success/cancel URL handling on the frontend.
- Real amount capture on the **Professional** plan (`PROFESSIONAL_PLAN` in `subscription.service.ts`, today amount = 0).
- Webhook routing in `POST /subscription/webhook` with **signature verification** → `payment.captured` flips `trial` → `active`; store real `payment_customer_id` / `payment_subscription_id`.
- `past_due` handling, retry / one-click re-payment, expiry → `cancelled`.
- Plan-based module access; upgrade/downgrade; billing portal; invoice email.
- Wire the static homepage pricing tiers (Starter / Growth / Enterprise) to real Razorpay plan IDs.
- Local setup needs: Razorpay test keys + a tunnel (e.g. ngrok) for webhook reachability.

## Status

Sandbox live. Razorpay blocked on product decision + test credentials.