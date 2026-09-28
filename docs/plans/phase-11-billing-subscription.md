# Plan — Phase 11 Billing & Subscription (Sandbox Checkout)

- Status: **Implemented** (sandbox checkout live; real payments deferred)
- Goal: Deliver a working subscription lifecycle — fresh 14-day trial for every company, whole-app gating when the trial expires, and a checkout that flips a company from `trial` to `active` — without wiring a payment gateway yet. Real charging is deferred to **Razorpay** (see `docs/tmp-billing.md`).
- References: `PLAN.md` §9.1–9.8 + Phase 11 (design sketches), `docs/tmp-billing.md` (Razorpay parking lot), `.agents/skills/whosonsite-db/SKILL.md` + `whosonsite-domain/SKILL.md` (runbook rules).

---

## 1. Scope

| In scope                                                            | Out of scope (deferred — Razorpay)              |
| ------------------------------------------------------------------- | ---------------------------------------------- |
| Fresh **14-day trial** for all companies (existing + seed + new)    | Real Razorpay payment capture                  |
| `subscription_status` enum + companies columns (migration `0005`)   | Razorpay webhook verification / signature check |
| Sandbox checkout: `POST /subscription/checkout` → create session    | Plan-based module access (per-plan gating)     |
| Sandbox confirm: `POST /subscription/checkout/confirm` → `active`   | Upgrade / downgrade flows                      |
| Cancel: `PUT /subscription/cancel` → `cancelled`                    | Billing portal, invoice email                  |
| Whole-app gate `requireActiveSubscription` (routes)                 | One-click re-payment on payment failure        |
| Frontend `ProtectedRoute` redirect → `/checkout`, TrialBadge header | Homepage pricing tiers wired to real plan IDs  |
| Trial badge (days remaining) in `AppHeader`                         | Customer `payment_customer_id` provisioning    |
| Registration captures optional city/state/zipCode/country           |                                               |

### Recorded decisions

| # | Decision | Default |
| - | -------- | ------- |
| D1 | Payment gateway | **Razorpay** (deferred; needs live test keys + tunnel) |
| D2 | Checkout in this phase | **Sandbox** — no real charge; `confirmCheckout` flips trial → active |
| D3 | Existing & seed companies | Backfilled to a fresh 14-day trial in migration `0005` |
| D4 | Plans | Single **Professional** plan; no per-plan module gating yet |
| D5 | Trial only | New companies register in `trial`, not `active` |

---

## 2. Schema & migration

`apps/api/src/infrastructure/database/schema/companies.ts`:

- New `subscription_status` pgEnum: `trial` / `active` / `past_due` / `cancelled` / `expired`, default `trial`, NOT NULL.
- Columns: `city`, `state`, `zip_code`, `country` (`text`, country NOT NULL DEFAULT `'US'`), `trial_started_at` (default now), `trial_ends_at` (default now + 14 days), `payment_customer_id`, `payment_subscription_id` (reserved for Razorpay).
- Migration `0005_company_trial_subscription.sql` (DO-guarded enum + `ADD COLUMN IF NOT EXISTS`), backfills existing rows to a fresh trial. Applied via `pnpm db:migrate`.

Seed (`apps/api/src/infrastructure/database/seed/index.ts`) inserts full address fields + trial window for both companies.

---

## 3. Shared contracts (`@whosonsite/shared`)

- `enums/index.ts`: `SubscriptionStatus` as **const-object + string-literal type** (not TS enum — Drizzle pgEnum returns string unions). `SubscriptionStatusKey` type helper. Usage `SubscriptionStatus.TRIAL` etc.
- `types/index.ts`: `SubscriptionInfo { status, daysRemaining, trialEndsAt?, startedAt?, plan?, requiresCheckout }`, `CompanyDto` += address/city/state/zipCode/country, `AuthResponse.subscription?: SubscriptionInfo`, `RegisterRequest` += optional city/state/zipCode/country.
- `schemas/index.ts`: `registerSchema` += optional `city`/`state`/`zipCode`/`country`.

Shared must be rebuilt (`pnpm run build` in `packages/shared`) before api/web typecheck, since both consume `dist`.

---

## 4. API — subscription module

`apps/api/src/modules/subscription/` (types / repository / service / controller / routes):

| Endpoint | Auth | Guard | Behavior |
| -------- | ---- | ----- | -------- |
| `POST /subscription/webhook` | none (stub) | — | Scored 200; Razorpay hookup later |
| `GET /subscription/status` | authenticate + companyContext | — | Live `SubscriptionInfo` via `computeSubscriptionInfo(company)` |
| `POST /subscription/checkout` | + `BILLING_MANAGE` (owner) + `checkoutLimiter` 20/15min | — | Sandbox session (plan, amount 0, metadata) |
| `POST /subscription/checkout/confirm` | same | — | Sets status `active` |
| `PUT /subscription/cancel` | `BILLING_MANAGE` | — | Sets status `cancelled` |

`computeSubscriptionInfo` is the single source of truth used by both the subscription endpoints and the auth login/refresh/me path. It evaluates `requiresCheckout` = trial expired OR status not in `active`.

Auth changes: `register` seeds the company with trial window + `country ?? 'US'` and returns `subscription`; `login` / `refresh` / `me` include `subscription`.

### Whole-app gate

`apps/api/src/middleware/subscription-guard.ts` exports a composed middleware array:

```ts
export const requireActiveSubscription = [authenticate, companyContext, enforceSubscription]
```

Mounted in `routes/index.ts` AFTER `/auth`, `/subscription`, `/public`:

```ts
apiRouter.use('/subscription', subscriptionRouter)
apiRouter.use(requireActiveSubscription)
```

Blocked requests return 403 with code `TRIAL_EXPIRED` (trial, expired) or `SUBSCRIPTION_REQUIRED`, details `{ requiresCheckout: true }`. The frontend uses that to steer users to `/checkout`.

---

## 5. Web

- `store/slices/authSlice.ts`: `subscription` state; `setSubscription` reducer; bootstrap/login/register/logout capture it from auth responses.
- `components/auth/AuthContext.tsx`: exposes `subscription`, `requiresCheckout`, `refreshSubscription()` (fetches `/subscription/status`).
- `components/auth/ProtectedRoute.tsx`: when `requiresCheckout`, redirects to `/checkout` (except `/checkout` and `/subscription`).
- `pages/Subscription.tsx`: live status — plan summary, status badges, trial countdown, owner cancel flow (ConfirmDialog) with `requiresCheckout` renewal gate.
- `pages/Checkout.tsx`: sandbox order summary (Professional plan) + confirm; non-owner sees a "contact owner" alert.
- `components/layout/AppHeader.tsx`: subscription badge — trial (days remaining, blue), active (green), requires-checkout (red, click → `/checkout`).
- `components/auth/RegisterForm.tsx`: adds optional City / State / ZIP / Country inputs on top of the existing phone/address/AddressPicker.
- i18n: `billing.*` key block expanded in `en.ts` + `ta.ts`.

---

## 6. Tests & verification

- `apps/api/test/integration/subscription.test.ts` (8 tests): trial status shape, protected route reachable during trial, expired trial → 403 `TRIAL_EXPIRED` (test backdates both `trialStartedAt` and `trialEndsAt`), sandbox checkout creates session, confirm → `active` + access restored, cancel → `cancelled` + 403 `SUBSCRIPTION_REQUIRED`, non-owner 403 on checkout, unauth webhook 200.
- `apps/web/src/test/components/RouteGuards.test.tsx`: +2 tests for `/checkout` redirect and `/checkout` allow-list.
- Full runs: `pnpm typecheck` (0 errors, 3 packages) and `pnpm test` (api + web) green.

---

## 7. Files touched (primary)

| Action | File |
| ------ | ---- |
| Edit | `packages/shared/src/enums/index.ts`, `types/index.ts`, `schemas/index.ts` |
| Edit | `apps/api/src/infrastructure/database/schema/companies.ts`, `seed/index.ts` |
| Add | `apps/api/src/infrastructure/database/migrations/0005_company_trial_subscription.sql` + `_journal.json` entry |
| Add | `apps/api/src/modules/subscription/*` (5 files), `apps/api/src/middleware/subscription-guard.ts` |
| Edit | `apps/api/src/routes/index.ts`, `modules/auth/{auth.service,auth.controller,auth.types}.ts` |
| Add | `apps/api/test/integration/subscription.test.ts` |
| Edit | `apps/web/src/{store/slices/authSlice.ts,app/app.tsx}`, `components/auth/{AuthContext,api,ProtectedRoute}.tsx`, `components/layout/AppHeader.tsx`, `components/auth/RegisterForm.tsx`, `app/i18n/resources/{en,ta}.ts` |
| Add | `apps/web/src/pages/Checkout.tsx`; Edit `apps/web/src/pages/Subscription.tsx` |
| Edit | `apps/web/src/test/components/RouteGuards.test.tsx` |

---

## 8. Deferred to Razorpay (`docs/tmp-billing.md`)

- Real checkout session creation with Razorpay Orders API + checkout.js.
- Webhook signature verification (`POST /subscription/webhook`) → status transitions on `payment.captured`.
- Storing real `payment_customer_id` / `payment_subscription_id`; refunds; retry on `past_due`.
- Plan-based module access, upgrade/downgrade, billing portal, invoice email.
- Wire homepage pricing tiers to real plan IDs.