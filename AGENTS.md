<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Welvors — dating platform (marketing + member app + 11-step onboarding)

Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, shadcn (`base-nova`).
Backend is a separate service; there are **no Next.js API routes**.

## Commands

```bash
npm run dev              # dev server
npx tsc --noEmit         # typecheck — there is NO "typecheck" script
npx eslint app/onBoarding app/context   # scope lint to what you touched
npm run build            # also typechecks; does NOT run eslint
```

Verify in this order: `npx tsc --noEmit` → `npx eslint <dirs you touched>` → `npm run build`.

### Lint always fails — that is the baseline

`npm run lint` reports **19 errors / 118 warnings** and exits 1 before you touch anything,
across: `OnBoardingDataContext` (8× `no-explicit-any`), `UsersContext`, `LoginModal`,
`WhyWelvors`, `eventSection`, `IntroVideo`, `DateNow`, `events/[id]`, `lib/htmlRenderHelpers`.
It is not wired into `next build`, so a green build proves nothing about lint.

**Judge your work by the delta, not the exit code.** Run `npx eslint <your dirs>` and confirm
you added nothing new; do not go fixing the baseline.

### Known baseline `tsc` errors — do NOT "fix" these

`npx tsc --noEmit` reports exactly these three, always, before you touch anything:
`app/components/endpoints/steps/LoginPhone.tsx:210` (TS2322),
`app/components/ui/PaymentButton.tsx:66` (TS2717) and `:166` (TS7006).
A clean delta means these three and no more.

## Repo facts worth knowing up front

- **`cn` is an npm package.** The house style is `import { cn } from "cn"`, *not*
  `@/lib/utils` (that file is a one-line re-export shadcn expects). Every file in
  `components/ui` and `app/onBoarding` uses the bare `cn` import — follow it.
  If you run shadcn and it emits `@/lib/utils`, rewrite it to match.
- **Route dir casing is load-bearing and inconsistent:** `app/onBoarding`,
  `app/legalSafety`, `app/lauch`, `app/footer`. These are live URLs — never rename
  (the build has a real 301 for `welvors.com`, and `/lauch` is a typo that shipped).
  Import paths must match the on-disk casing exactly; Linux deploys are case-sensitive.
- **No tests exist.** No Jest/Vitest/Playwright/Testing Library, no CI config, no
  `.github/`, no `.env.example`. `stepPayloads.ts` and the validators in
  `stepSchemas.ts` are pure functions and are the only obvious first test targets.
- `.env` has `NEXT_PUBLIC_PRODUCTION_URL` and `NEXT_PUBLIC_MONGODB_URI`. The latter is
  a public var shipped to the browser — never add a real secret as `NEXT_PUBLIC_*`.

## Auth & API

- Base URL comes from `utils/api.ts` (`NEXT_PUBLIC_PRODUCTION_URL`, fallback
  `https://api.welvors.com`). Never hardcode the host.
- Auth header is `authHeader()` in `utils/token.ts`, which reads `welvors_token` **from a
  cookie**. Many pages separately read the same key from `localStorage`/`sessionStorage`
  — those are display/handoff paths. The cookie is what authenticated calls use.
- Every backend call is `axios` + `authHeader()` from a context or step, always client-side.

## Onboarding: where the mistakes live

`app/onBoarding` is an 11-step profile builder split across four files by concern.
This split is not obvious from the names — read before editing.

**Provider order is load-bearing** (`app/onBoarding/layout.tsx:465`):

```
OnboardingProvider    position: stepIndex, next/back/goTo
└─ ProfileProvider        OnBoardingApiContext   — the PATCH calls
   └─ OnBoardingDataProvider   option lists from GETs
      └─ OnboardingFormProvider  data + validation + submit
```

A step never calls `axios`. It reads/writes only its own slice through
`useStepForm(stepId)`, and `submitCurrent` decides what happens.

**Mis-nesting does not throw.** The API contexts fall back to defaults that resolve `null`,
`saveStep` reads that as `!res.success`, and the symptom is *Continue does nothing*.
If a step is stuck, check nesting first.

| File | Owns |
|---|---|
| `onboardingConfig.ts` | `STEPS` registry, `TOTAL_STEPS` |
| `stepSchemas.ts` | field defs, validation, and the **form field names** |
| `stepPayloads.ts` | step data → API request body (the only place naming schemes meet) |
| `context/OnBoardingApiContext.tsx` | PATCH endpoints |
| `context/OnBoardingDataContext.tsx` | GET option lists |
| `context/OnboardingFormContext.tsx` | data store + `saveStep` branches + `submitCurrent` |
| `steps/*.tsx` | order and which control renders — nothing else |

### Adding a save endpoint — all four edits

1. URL + request type + `updateX` (+ its loading/error state) in `OnBoardingApiContext.tsx`
2. `toXRequest()` in `stepPayloads.ts`
3. A `if (stepId === "...")` branch in `saveStep` (`OnboardingFormContext.tsx`)
4. Wire the fields in `steps/<Step>.tsx`

Steps with a backend today: `basics`, `preference`, `intentions`, `lifestyle`,
`career`, `interests`. The other five validate locally and advance with no request.

### API-driven steps must not keep static options

`intentions`, `lifestyle` and `interests` take their field names **from the API
response** (`question.key`). If `stepSchemas.ts` still declares a field with the same
name and it is required, `validateStepData` looks for a key the step never writes and
**blocks Continue forever** — no error, no request, just a dead button. Clear the
schema entry (see `STEP_SCHEMAS.interests`) and enforce limits in the step itself.

### Continue vs Skip

- `form.submit()` → validate → PATCH → advance.
- `form.skip()` → advance only. **No validation, no PATCH.** The "Skip for now" button
  in `StepFooter` must always be wired to `skip()`, never `submit()`.

### Adding a step

Edit `STEPS` in `onboardingConfig.ts` and `STEP_SCHEMAS`. Array position *is* the step
number, and **`TOTAL_STEPS = 11` is hand-maintained, not derived** — bump it or the
progress bar percentage lies.

## Chrome & styling

- Nav/footer are hidden by pathname in `app/components/ui/ConditionalNavbar.tsx` and
  `ConditionalFooter.tsx`. Both hardcode `/onBoarding` and the `/app` prefix.
  **A new top-level route must be added to both files.**
- Onboarding chrome is a ~300-line inline `<style>` string in `app/onBoarding/layout.tsx`
  driven by CSS custom properties (`--onb-pink`, `--onb-ink`, `--onb-muted`,
  `--onb-line`). It is neither Tailwind nor the `const C = {...}` palette that each
  marketing component declares locally. Match whichever surface you are on.
- shadcn primitives live in root `components/ui/`, aliased `@/components/ui/*`.

## `context.md`

Long-form project overview. **It is partly stale — trust the code over it.** Specifically:
it claims the token lives in `localStorage` (it is a cookie), that
career/intentions/lifestyle have no endpoints (all three have them), and its file list omits
`OnBoardingDataContext`. Use it for orientation, not for facts that have since changed.

---

# WORKING CONTEXT LOG

> **Maintenance protocol (read this first, every session):**
> This section is the project's living memory so a fresh session gets up to speed in
> seconds. **After every task, append/update the log** — add a dated entry under
> "Session log" and correct any fact you proved wrong. Keep entries terse: what changed,
> which files, what is still open. **Trust the code over this file**; if they disagree,
> fix this file.

## Auth & route protection (learned)

- **One route gate exists: `proxy.ts` at the repo root.** Next 16 renamed `middleware.ts`
  → `proxy.ts` (see `node_modules/next/dist/docs/.../proxy.md`). It reads the
  `welvors_token` cookie, runs `isUsableSessionToken()` (`lib/sessionToken.ts` — decodable
  + unexpired JWT, **no signature check**), and redirects to `/?login=1` when unusable.
  - `matcher` currently gates: `/app`, `/app/:path*`, `/onBoarding`, `/onBoarding/:path*`,
    **and `/events/myTickets`**. Add any new member-only route to this array.
  - `booking-confirmation` lives at `app/app/booking-confirmation/[bookingId]/page.tsx`, so
    it is already covered by `/app/:path*` — do **not** add a second entry.
- **There is no auth context/provider.** Do not invent one.
  - `app/components/authState.ts` exports `useAuth()` / `isLoggedIn()` but they check a
    `session` cookie that is **never set** → always `false`. **Dead/misleading — do not use.**
  - The working client flag is a local `useLoggedIn()`: `getClientToken() !== null`, synced
    on `welvors-auth-change` + `storage`. Canonical copy at `app/events/[id]/page.tsx:242`;
    copied into `app/events/page.tsx` (events feed) and used on the myTickets flow.
  - Server truth: `verifySession()` from `lib/sessions.ts`; login writes the cookie via
    `createSession()`. **Nothing dispatches `welvors-auth-change` today**, so a login within
    the same SPA session won't re-sync these hooks until a remount/navigation.
- **Opening the login UI from anywhere:** `document.querySelector("[data-login-trigger]")?.click()`
  (the Navbar owns the `LoginModal`). See `app/components/Header/Header.tsx:310` for the pattern.
- Root layout (`app/layout.tsx`) composes all providers inline — there is **no** `providers.tsx`.
  `MyProfileProvider` (`app/app/shared/useMyProfile.tsx`) is the only token-aware provider;
  it no-ops without a token and exposes `ensure()` to retry after login.

## Events & ticketing subsystem (learned)

- **`app/context/EventContext.tsx`** holds three things:
  1. `EventProvider` / `useEventData()` — the events feed (`GET /api/admin/events/get?eventType=`).
  2. `useEventDetails(id)` — single event (`GET /api/admin/events/details/:id`). Keyed by
     `${id}::${reloadKey}` so stale responses can't clobber the current one.
  3. **`useMyTickets(filter)`** — member tickets (`GET /api/user/event/my-ticket[?status=…]`),
     added by us. Uses `authHeader()`; `filter === "ALL"` omits the query param.
- **My-ticket response shape (verified against the live API):**
  `{ success, message, data: { bookings: MyTicketsBooking[], pagination } }`.
  A **booking** carries `id`, `bookingNumber`, `ticketCount`, `ticketAmount`,
  `discountAmount`, `platformFee`, `gstAmount`, `totalAmount`, `paidAmount`, `status`,
  `createdAt`, `tickets: MyTicket[]`, `event: MyTicketEvent`. A **ticket** carries
  `ticketId`, `ticketType` (`MEN`/`WOMEN`/…), `ticketAmount`, `qrCodeUrl`, `status`.
  Types exported from `EventContext.tsx`: `TicketStatus`, `TicketFilter`, `MyTicketEvent`,
  `MyTicket`, `MyTicketsBooking`, `MyTicketsPagination`, `MyTicketsResult`.
  `useMyTickets` returns `{ bookings, pagination, loading, error, refetch }`.
- **`app/events/myTickets/page.tsx`** (client): booking cards in a 1/2/3-col grid, status
  filter chips + search, loader (MoonLoader, `#C21559`) / error / empty states. Protected by
  `proxy.ts`; "My Ticket" button on the events feed is hidden unless `loggedIn`.
- **Font convention for the events surface:** the filter cards
  (`app/components/ui/filterCard.tsx`) use
  `"Inter", "Helvetica Neue", "Segoe UI", Arial, sans-serif`. The myTickets page now uses the
  same stack everywhere via a local `FONT_STACK` const (page title + card titles use
  `font-extrabold`, no serif). Match this on further events-UI work.
- **Checkout/booking UI:** `components/ui/EventCheckOutModal.tsx` (gender picker + struck
  original price), driven from `app/events/[id]/page.tsx` (`priceView`, `bucketForGender`,
  `selectPrice`, `menOriginalPrice`/`womenOriginalPrice`). Payment success view lives at
  `app/app/booking-confirmation/[bookingId]/page.tsx` (reads `usePaymentSuccess()` from
  `app/context/PaymentContext.tsx`). Note its `EVENT_ROUTE` builds `/app/events/...` which
  does not exist (real path is `/events/...`) — dead link, fix if touched.
- **Wallet top-up:** `applyWalletTopUp(amount)` in `app/context/UserProfileDataContext.tsx`
  does an optimistic bump + reconcile pulls; the sidebar reads
  `balances.wallet.formattedBalance` so it updates instantly. Success path in
  `app/app/home/myBalances/mywallet/addMoney/page.tsx`.

## Session log (newest first)

### 2026-10-22 — myTickets: font consistency, auth gating, types
- `EventContext.tsx`: `useMyTickets` + types added; response mapped to
  `data.bookings` + `pagination` (was assumed flat — corrected against live response).
- `app/events/myTickets/page.tsx`: rewritten around `bookings` (was static `TICKETS`, then
  transiently a flat ticket list); cards show ticket-type/ticket-count chips + booking number.
- `proxy.ts`: added `/events/myTickets` to the matcher. `booking-confirmation` left as-is
  (already under `/app/:path*`).
- `app/events/page.tsx`: added local `useLoggedIn()`; "My Ticket" button now members-only.
- `app/events/myTickets/page.tsx`: switched all fonts to the `FONT_STACK` (Inter) used by
  the filter cards; headings de-serif'd to `font-extrabold`; removed `font-mono` chip.
- **Open / follow-ups:** no tests exist. `welvors-auth-change` is never dispatched on real
  login (button won't appear until remount). `booking-confirmation` `EVENT_ROUTE` is a dead
  `/app/events/...` link. Baseline `tsc` errors (see Commands section) are pre-existing.
