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

### Do NOT run `npm run dev` and `npm run build` at the same time

Both write the generated route types (`.next/dev/types/routes.d.ts` and
`.next/types/routes.d.ts`) and the concurrent writes leave a duplicated/garbled tail in
them. `next build`'s typecheck then dies with a parse error *inside* `.next/…`
(`Unexpected keyword or identifier`, `';' expected`) — it is not your code.

Fix: stop the dev server, `Remove-Item -Recurse .next`, rebuild. A dev server started
while a build is in flight will re-corrupt it, so make sure nothing restarts it.

### Lint always fails — that is the baseline

`npm run lint` reports **19 errors / 118 warnings** and exits 1 before you touch anything,
across: `OnBoardingDataContext` (8× `no-explicit-any`), `UsersContext`, `LoginModal`,
`WhyWelvors`, `eventSection`, `IntroVideo`, `DateNow`, `events/[id]`, `lib/htmlRenderHelpers`.
It is not wired into `next build`, so a green build proves nothing about lint.

**Judge your work by the delta, not the exit code.** Run `npx eslint <your dirs>` and confirm
you added nothing new; do not go fixing the baseline.

### `tsc` baseline — clean (verified 2026-10-23)

`npx tsc --noEmit` exits 0 with no output. The three errors this section used to list
(`LoginPhone.tsx:210` TS2322, `PaymentButton.tsx:66` TS2717, `:166` TS7006) are gone —
checked both before and after the 2026-10-23 chat change. **A clean delta now means zero
errors**; anything new is yours.

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
- **Other balances now sync the same way:** `applyResourceCredit(bucket, amount)` (same
  context) optimistically bumps `roses` / `compliments` / `boosts` / `datePlans` and
  reconciles against raw server values (`serverResourceBalanceRef`), so the home sidebar
  updates in the same tick as the success toast. Wired into the four purchase success
  paths: `RosesMain` (`roses`), `ComplimentsMain` (`compliments`), `DatePlansMain`
  (`datePlans`), `MyBoostsMain` (`boosts` for the BOOST tab; SUPER just calls
  `refetchBalances` because `my-balances` exposes one `boosts` bucket).
- **Feed `package` badge:** `HomeMain.tsx` maps `package.name` → icon
  (FREE/PREMIUM 🔥, VIP 👑, VIP ELITE 💠) top-right of the card. Raw `UserProfile.package`
  is typed in `UsersContext.tsx` and mapped in `mapUserToProfile`; `mapMyProfile`,
  `mockData`, and `admirerToProfile` default it to FREE.

## Session log (newest first)

### 2026-10-23 — chat: socket.io wired in (join / send / receive)
- `lib/chat/socket.ts` (user-authored, left untouched) owns a module singleton:
  `connectChatSocket(token)` / `disconnectChatSocket()`, events `conversation:join`,
  `message:send`, `message:receive`. `socket.io-client` was already in `package.json`.
- `app/context/ChatContext.tsx` — new "REALTIME" block in `ChatConversationsProvider`
  (the only consumer; it sits in `app/layout.tsx`, so one connection per session):
  connect on mount when `getClientToken()` is set, join the open conversation's room on
  every `activeConversationId` change, and `mergeLiveMessage` on `message:receive`.
  Socket rows are a subset of the REST `Message` — `fromSocketMessage()` fills the rest
  with `null` so they render through the same mapper. Also exposes `sendMessage(content)`
  (emits + appends an optimistic bubble, reconciled by a `pendingSends` FIFO keyed
  `${conversationId}|${content}`) and `socketConnected`. Incoming rows also bump the
  conversation list (preview to top; unread++ only when the thread is not open).
- `useChatMessages` / `useChatThread` now pass `sendMessage` + `socketConnected` through;
  `app/app/chats/page.tsx` and `app/app/mobile/MobileChatSection.tsx` wire `onSend`.
- **Open / follow-ups:** assumes the server echoes `message:receive` back to the sender —
  if it only broadcasts to the counterpart, the optimistic bubble never gets a real id
  and should be reconciled by a refetch instead. `messageType` is `"TEXT"` only per the
  current `socket.ts`. No `conversation:leave`, no read receipts, no typing events yet
  (user has more events to provide). Verified: `npx tsc --noEmit` 0, eslint delta 0
  (ChatContext baseline is the 4 pre-existing `react-hooks/refs` errors), `npm run build` green.

### 2026-10-23 — build: dev/build race on generated route types
- `npm run build` died in the TypeScript phase with parse errors *inside*
  `.next/dev/types/routes.d.ts` (garbage at the end of the generated file) — nothing in
  `app/` was wrong. Cause: `npm run dev` was running (and was restarted mid-build); dev
  and build both write `.next/**/types/routes.d.ts` and the writes interleave.
- Fix: stop this project's node processes, `Remove-Item -Recurse .next`, `npm run build`
  → green. Added the "do not run dev + build together" note under Commands.
- **Open:** the user's dev server had to be stopped to get a clean build — they need to
  restart `npm run dev` themselves when they want it back.

### 2026-10-23 — chat: non-text messages hidden behind a glittering placeholder
- `app/app/shared/chatMessages.ts`: `lockRichMessages()` + `RICH_LABELS` wrap the
  `mapApiMessages()` call inside `useChatThread`, so anything that is not `kind: "text"`
  becomes a `LockedMessage`. The rich mapping (rose/gift/image/event/compliment cards)
  still runs — its output is swapped before the thread sees it, so nothing was deleted.
  Note: compliments arrive as `messageType: "TEXT"` + a `compliment` object, so they land
  as `kind: "compliment"` and are locked too.
- `app/app/desktop/ChatMain.tsx`: added `LockedMessage` to the `ChatMessage` union and
  `LockedBubble` (twinkling `SparkleIcon`, sweeping sheen, gradient-shimmer line
  "Open the Welvors app to view this message", time + read receipt) — rendered from the
  message map right after `text`. Keyframes `chat-glitter` / `chat-sheen` / `chat-spark`
  and a `prefers-reduced-motion` off-switch live in the component's existing `<style>`.
- `app/app/panels/ChatSideBar.tsx`: `StatusRow` preview follows the same rule; the
  DATE_CONFIRMED / GIFT branches were replaced by a `.msg-locked` gradient line
  (`msg-glitter` keyframe added to the list's `<style>`).
- **Open / follow-ups:** `ChatMain`'s rich card components and `DEFAULT_MESSAGES` are now
  unreachable for API data (still render for the bare default prop) — decide keep/delete
  on a cleanup pass. Verified: `npx tsc --noEmit` 0 errors, `npx eslint` on the three
  touched files = the same 10 baseline warnings, `npm run build` green. No tests.

### 2026-10-23 — balance badges + instant balances after purchase
- Added `applyResourceCredit` + `serverResourceBalanceRef` to `UserProfileDataContext.tsx`
  so roses/compliments/boosts/date-plans update the sidebar instantly after Razorpay
  succeeds, mirroring the wallet top-up path.
- Wired it into `RosesMain`, `ComplimentsMain`, `DatePlansMain`, `MyBoostsMain`.
- Added `package` to raw `UserProfile` and all `Profile` mappers (this fixed the
  `Profile.package is missing` tsc errors left by the earlier package-badge work).
- **Open:** SUPER-boost purchases only refetch balances (no optimistic bump) pending a
  confirmed `my-balances.boosts` semantic for super boosts. No tests.

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
