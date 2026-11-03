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
- **Own-profile package badge:** `GET /api/user/onboarding-details` does **not** carry a
  plan, so `mapMyProfile` hardcodes `package: FREE`. The real tier comes from
  `GET /api/user/feed/details/:userId` (`UserFeedDetails.package`); `mergeUserDetails`
  now merges it, and `AppRail` + `MobileProfileSection` call `useUserDetails(profile.id)`
  to pass `pkg` into `ProfileSidebar`.

## Session log (newest first)

### 2026-10-28 — home feed: empty API lifestyle no longer shows Activity/Responds/Trust score
- **Bug:** LIFESTYLE section on HomeMain/ProfileMain showed Activity / Responds / Trust score
  even when `GET /api/user/feed/details/:id` returned `lifestyle: []`. Cause: those three rows
  are not API data — `buildLifestyle()` (`app/app/shared/mapUser.ts:128–147`) synthesises them
  from feed presence fields (`isOnline`/`lastSeen`/`replyTime`/`trust`), and `mergeUserDetails`
  fell back to them whenever the details lifestyle array was empty
  (`lifestyle: detailLifestyle.length ? detailLifestyle : base.lifestyle`).
- **Fix (`app/app/shared/mapUser.ts:568`):** `lifestyle: detailLifestyle` — the details payload
  is now authoritative once loaded; empty array → `lifestyle: []` → the existing `hasLifestyle`
  gate in `ProfileDetailSections.tsx:62` hides the section. Photo-overlay trust/replyTime chips
  (HomeMain.tsx:520–536) are separate and unaffected. `buildLifestyle` kept for the pre-details
  base card (accepted brief flash of the section until details resolve).
- Verified: `npx tsc --noEmit` 0; `npx eslint app/app/shared/mapUser.ts` 0. Build skipped
  (not requested). No tests.

### 2026-10-28 — edit profile: mother tongue single-select + payload fix
- **Bug:** mother tongue on `/app/profile/edit` never persisted. It was wired as the
  one `multi` of the edit-only basics end-to-end (`kind: "multi"`, hydration via
  `resolveOptionIds` → `string[]`, payload `motherTongueId: number[]`), but the
  endpoint takes a **single id** — sending an array failed the PATCH (or was ignored
  server-side), so saves appeared to succeed client-side and changed nothing.
- **Fix (three files):**
  - `app/context/OnBoardingApiContext.tsx`: `EditBasicInfoRequest.motherTongueId`
    `number[] | null` → `number | null`.
  - `app/onBoarding/stepPayloads.ts`: `toEditBasicInfoRequest` now sends
    `motherTongueId: id(data.motherTongue)` (the shared single-id `id()` helper);
    the array-mapping block is gone.
  - `app/app/desktop/ProfileEditMain.tsx`: `EDIT_BASIC_FIELDS` motherTongue
    `kind: "multi"` → `"select"` (SelectField, same as religion/caste);
    `feedExtras` hydrates with `resolveOptionId` (was `resolveOptionIds`, now
    deleted — no other caller); `describeField` multi-branch motherTongue special
    case removed and the select-branch options lookup gained
    `motherTongue → languageOptions` so the closed row still shows the label.
- Verified: `npx tsc --noEmit` 0; eslint on the three files = only pre-existing
  unused-var warnings (13, all baseline). Build skipped (dev server on :3000).
- **Open:** mobile edit profile reuses this component, so it is covered. Old
  profiles that saved a *list* of tongues before this fix hydrate via
  `resolveOptionId`, which matches on the whole stored string — a comma-joined
  "Hindi, English" will not match a single option and reads as unset until the
  user re-picks (acceptable; the backend only ever kept one anyway if it rejected
  arrays). `removeNullValues` still strips `motherTongueId: null`, so "clearing"
  the select cannot be expressed to the endpoint — pre-existing for all six
  edit-basic fields, untouched. No tests.

### 2026-10-28 — edit profile: VIP/VIP-Elite interests single-answer (port of onboarding fix)
- **Bug:** `ProfileEditMain.tsx` still let VIP / VIP Elite interest chips accumulate
  multiple option ids — the `16c5a21` fix only landed in `app/onBoarding/steps/Interests.tsx`.
  Zero `vip|elite` matches existed in the edit-profile file.
- **Fix (`app/app/desktop/ProfileEditMain.tsx`):** added module-local `isSingleAnswer(field)`
  (same `/vip|elite/i` match on label/name as onboarding, after `asList` ~line 437) and the
  interests `MultiField` `onChange` now does `setField(field.name, single ? v.slice(-1) : v)`
  (~line 3106). Chips UI unchanged; a new pick replaces instead of joining. Save path
  (`toInterestsRequests`) untouched — it already serialises whatever the field holds.
- Verified: `npx tsc --noEmit` 0; `npx eslint app/app/desktop/ProfileEditMain.tsx` = the same
  10 pre-existing unused-var warnings, 0 errors, nothing new. Build skipped (dev server
  listening :3000, PID 14060).
- **Open:** hydration (`answersToStepData` → `stepDataFromDetails`) still seeds an *array*
  for any `isMulti` question, so a VIP answer saved before the fix hydrates as a
  multi-element array (chips + budget count) until re-picked — same residual quirk as
  onboarding; fix only constrains new writes. Mobile edit profile reuses this component
  (`MobileEditProfileSection` → `ProfileEditCard`), so it is covered. No tests.

### 2026-10-28 — admirers sidebar refresh after like (provider-order fix)
- **Bug:** liking on the home feed never updated the admirers sidebar. `swipe()` in
  `UsersContext.tsx` already called `await refetchAdmirersSent()` after a successful swipe,
  but it resolved the **default** `useUserProfileData()` context (a no-op async fn) because
  `UsersProvider` was an *ancestor* of `UserProfileDataProvider` in `app/layout.tsx` —
  the documented "mis-nesting does not throw" failure mode.
- **Fix:**
  - `app/layout.tsx`: hoisted `<UserProfileDataProvider>` so it wraps `<UsersProvider>`
    (new order inside `<main>`: ActiveSection → ChatConversations → AccountSettings →
    UserProfileData → Users → Legal → Event → Payment). Verified safe: the only
    cross-provider consumer was `UsersContext.tsx` (`useUserProfileData`); no provider
    component consumes a sibling context. All other `useUserProfileData` call sites are
    page-level (below every provider).
  - `app/context/UsersContext.tsx`: `swipe()` now destructures
    `refetchAdmirersSent, refetchAdmirersReceived`; on **LIKE** success it refetches
    `sent`, and additionally `received` when `data.isMatch` (mutual like lands there).
    PASS no longer triggers a pointless sent-refetch. Both refetchers added to the
    `swipe` dep array (they are stable: deps chain is `useCallback([])`).
  - `app/app/panels/AdmirersSidebar.tsx`: removed a vestigial empty `useEffect` (and the
    now-unused `useEffect` import) — the sidebar reads `admirersSent` from context and
    re-renders when it updates; no effect needed.
- Verified: `npx tsc --noEmit` 0; eslint delta **−1 warning / 0 new problems** (stash+lint:
  baseline 6 problems = 3 errors + 3 warnings → with change 5 = 3 errors + 2 warnings; the
  missing-deps warning on `swipe` is gone). Build skipped (dev server on :3000, PID 13296).
- **Open:** `HomeMain.tsx:238–240` still discards the `SwipeResult` (no match toast);
  `admirersSent` refetch is one POST + one GET per like — fine at feed cadence, but a batch
  or debounce would be needed if likes become frequent. `AdmirersMain.tsx` reads the same
  context fields so the `/app/admirers` main pane also goes live with the fix. No tests.

### 2026-10-27 — chat: centered day headings; home feed: limit-growth pagination
- **Chat day headings** (both surfaces — `MobileChatSection` renders the same `ChatMain`):
  - `app/app/shared/chatMessages.ts`: new `localDayKey` / `dayKeyOf` / `formatDayHeading`
    ("Today" / "Yesterday" / `12 Oct 2026`, `en-IN`); `useChatThread`'s memo now stamps every
    row with a local `dayKey` via an id→key map **after** `lockRichMessages` — no mapper
    restructure, socket/optimistic rows included (same `createdAt`).
  - `app/app/desktop/ChatMain.tsx`: `dayKey?: string` on all four render interfaces; new
    `DayHeading` (centered grey pill, `U()`/`C` palette); the thread loop wraps each bubble
    in a keyed `Fragment` and renders the heading when `dayKey` differs from the previous
    message. `DEFAULT_MESSAGES` carry no `dayKey` → demo thread shows no headings.
- **Home feed pagination** (user asked to "change the api url and change limit" as few
  cards remain → limit-growth, not cursor):
  - `app/context/UsersContext.tsx`: `USERS_URL` is now limit-free (`FEED_PAGE_SIZE = 50`
    appended per call); `loadMore()` re-requests `?limit=lastLimit+50`, appends with by-id
    dedupe, flips `hasMore=false` when the server answers with fewer rows than asked (handles
    exhaustion, server caps, and a backend that ignores `limit`); shared `requestId`
    newest-wins + `loadMorePending` ref guard. `useUsersData()` now exposes
    `hasMore`/`loadMore` (default context updated too — that was the one tsc error).
  - `app/app/desktop/HomeMain.tsx`: `deckKey` reset now distinguishes **append vs replace**
    (prefix check over `lastDeck.split("|")`) so a top-up never rewinds `current` to 0 —
    this was the critical gotcha (old code rewound on every array change); top-up effect
    fires `loadMore()` when `profiles.length - current <= 5` (`FEED_TOP_UP_REMAINING`),
    guarded by `status === "success"` + `hasMore` + no `profilesProp`. Silent, no UI.
- Verified: `npx tsc --noEmit` 0; eslint delta **0** by stash+lint (both with and without
  my changes: 28 problems = 4 errors / 24 warnings, identical identifiers — so ChatMain's
  real baseline is **14 warnings**, not the 11 the older entries claimed; UsersContext's 3
  errors and HomeMain's 11 warnings are all pre-existing). Build skipped (dev on :3000,
  PID 3248).
- **Open:** `nextCursor` (typed in `UsersApiResponse`) is still unused — if the backend
  supports `?cursor=`, switch `loadMore` to it; limit-growth re-sends the whole prefix each
  time (dedupe absorbs it) but is what the request literally asked for and needs no cursor
  support. If the backend rejects `limit>50`, loadMore stops itself via the short-answer
  check. Deck still wraps modulo — top-up fires *before* exhaustion so the wrap stays
  invisible while cards exist. Chat has no scroll anchoring for "Load earlier messages"
  (pre-existing snap-to-bottom quirk; separators inherit it). No tests.

### 2026-10-27 — mobile admirers: Accept/Reject behind bottom nav (slot-height + fluid wiring)
- **Bug:** on `/app/admirers` mobile, the received-profile deck buttons (`absolute bottom-8`
  Reject/Accept) rendered behind the fixed bottom nav. Root cause: `AdmirersMain`'s profile
  roots were `h-screen` (100vh) inside the mobile slot, whose height is `100dvh − navH`
  (Screen mobile slot is `flex-1` above the `md:hidden` bottom strip) — the buttons fell past
  the slot's `overflow-hidden` clip line. The `fluid` plumbing was also half-built:
  `admirers/page.tsx` already passes `fluid` → `MobileAdmirerSection` declared it but dropped
  it, so `ProfileMain` stayed `h-screen`-sized and its card bottom/name overlay could clip too.
- **Fix:**
  - `app/app/desktop/AdmirersMain.tsx`: both profile roots (locked + unlocked) `h-screen` →
    `h-full` (deck now 32px above the nav); new `fluid?: boolean` prop forwarded to both
    `<ProfileMain fluid={…}>` and used by the loading/error frames
    (`${fluid ? "h-full w-full" : "h-screen"}`, the repo's frameClass pattern).
  - `app/app/mobile/MobileAdmirerSection.tsx`: destructure `fluid = false` and forward it to
    `<AdmirersMain fluid={fluid}>`.
  - Desktop unchanged: desktop slot is 100vh so `h-full` ≡ `h-screen`, and the desktop slot
    passes no `fluid` → card keeps `h-full aspect-[300/520]` framing.
- Verified: `npx tsc --noEmit` 0; `npx eslint` on both files 0. Build skipped (dev server
  listening :3000, PID 23756).
- **Open:** deck (`bottom-8`) overlaps ~28px with `ProfileMain`'s info-text block (`bottom-8
  p-5`) — that is the pre-existing desktop treatment, unchanged by this; `HomeMain` instead
  separates deck vs info (`bottom-4` fluid / `bottom-[3.75rem]`, info `bottom-16`) — revisit
  if QA flags it. Other mains' loading frames and `AdmiererSidebar` still use `h-screen`
  (out of scope). Transient earlier `tsc` failures were the documented torn
  `.next/dev/types/*` dev-write race — self-healed when dev regenerated the files; source
  errors were never present. No tests.

### 2026-10-27 — onboarding card: fully viewport-driven size + scaling
- `app/onBoarding/layout.tsx`: dropped the fixed-px caps that froze the card at a
  design size — `--onb-card-side` is now `min(92vw, 100dvh - 3rem)` (was
  `min(…, 600px)`; the ≤480px override likewise lost its `600px`), and `--onb-u` is
  `max(0.5px, calc(min(1cqw, 1cqh) * 0.12))` (was `clamp(…, 0.72px)` ceiling).
  Card side and all `u()` chrome + Tailwind token overrides now scale with the screen
  the same way `/app` components do (`h-full aspect-[300/520]`, rail `22.6%` +
  `cqw`/`cqh`, no px caps). The 0.5px floor still guards small phones.
- Verified: `npx tsc --noEmit` 0; `npx eslint app/onBoarding` = same baseline
  (1 pre-existing error + 9 warnings in Prompts/Review/Location/stepPayloads, none from
  this change). Build skipped (dev server possibly running).
- **Open:** no upper bound means a very large monitor makes the card (and text) grow
  past the old 600px/0.72px design reference — intentional per the request, but worth a
  visual check; hard `text-[10px]`/`text-[11px]` literals in steps/fields still don't
  scale with the unit (pre-existing).

### 2026-10-26 — profile sidebar: package badge wired to the real plan
- **Bug:** the badge UI and `pkg` prop existed, but both callers passed
  `profile.package.name`, and `mapMyProfile` hardcodes that to `FREE` (the onboarding
  endpoint does not carry a plan) → badge never rendered.
- **Fix:** `AppRail.tsx` + `MobileProfileSection.tsx` now call
  `useUserDetails(profile.id)` (the per-user details endpoint that does ship
  `package`) and pass `details?.package?.name` into `ProfileSidebar`, falling back to the
  existing profile field. `mergeUserDetails` (`mapUser.ts`) also merges
  `details.package`, so `ProfileMain` cards see the plan too.
- Verified: `npx tsc --noEmit` 0; eslint on the touched files = only the pre-existing
  `<img>` warning in `ProfileSidebar.tsx`. Build skipped (dev server running).
- **Open:** assumes `GET /api/user/feed/details/:id` answers for the logged-in user's own
  id (same call `ProfileMain` already makes). FREE correctly renders no package badge.
  `HomeMain`'s `PACKAGE_BADGES` keys `VIP_ELITE`, but its lookup normalises `_` to a
  space, so `VIP ELITE` never matches there — untouched, separate bug.

### 2026-10-26 — chat: tick staging fix (single → grey double → pink double)
- **Bug:** the grey "Delivered" tick never appeared — `message:delivered` was only emitted on live `message:receive` or *together with* `message:read` when the thread opened, so in the offline→online flow the sender's tick jumped ✓ → ✓✓pink.
- **Fix (`app/context/ChatContext.tsx`):** new "COMING ONLINE" effect — while `socketConnected`, ack `message:delivered` for every conversation whose `lastMessage` is the counterpart's and has no `deliveredAt` (fires on page load and every list update; no setState, so no `set-state-in-effect` lint). The existing thread effect stays the "SEEING IT" half (`message:read`); `receiptsSent` dedupes the overlap. Stages now: sent ✓ → receiver online acks ✓✓ grey (`#9aa4b2`) → receiver opens thread → ✓✓ pink.
- Verified: `npx tsc --noEmit` 0; eslint on ChatContext = the same 4 baseline `react-hooks/refs` errors.
- **Open:** still assumes the server relays `message:delivered` to the sender (payload `{conversationId, messageId}`); if the server pushes `message:receive` only to joined rooms, a receiver online with the chat closed only acks on list refresh/page load. No tests.

### 2026-10-26 — chat: presence (`user:online` / `user:offline` / `presence:heartbeat`)
- `lib/chat/socket.ts`: added `PresencePayload` (`userId`, `status: "ONLINE"|"OFFLINE"`, `lastSeenAt`), `user:online`/`user:offline` on `ServerToClientEvents`, `presence:heartbeat` (no payload) on `ClientToServerEvents`, and `PRESENCE_EVENT = "welvors-presence"` — the DOM-bridge name shared with `UsersContext`.
- `app/context/ChatContext.tsx`: new `applyPresence` updates `conversations[].user.isOnline/lastSeenAt` (sidebar avatar dots, "Online (n)" tab count, online filter and the chat header all read it) and re-dispatches on `PRESENCE_EVENT`; registered/unregistered beside the other listeners in the connect effect. New heartbeat effect: immediate ping + every `PRESENCE_HEARTBEAT_MS` (30 s) while `socketConnected` — a reconnect flips it, restarting with an immediate ping.
- `app/context/UsersContext.tsx`: listens on `PRESENCE_EVENT`, flips `isOnline` + `last_active_at`/`lastActiveAt` and recomputes `lastSeen` (local `presenceLabel`, e.g. "Active 5m ago"), so feed/profile Online chips update live.
- **`lastSeenLabel(lastSeenAt)` exported from `ChatSideBar.tsx`** (wraps `formatTimeAgo`); passed from `chats/page.tsx` **and** `MobileChatSection.tsx` — `ChatMain`'s header previously never received `lastSeenLabel`, so it always said "Offline"; now shows "Last seen 5m ago" etc.
- Verified: `npx tsc --noEmit` 0; eslint delta 0 (ChatContext's 4 `react-hooks/refs`, UsersContext's 3, ChatSideBar's 2 `set-state-in-effect` and page.tsx's 2 unused-var warnings are baseline — confirmed by stash+lint). Build skipped again (dev server running).
- **Open:** heartbeat cadence is a guess at the server's Redis TTL (30 s); no `visibilitychange` handling (browsers throttle background tabs to ~1/min, fine unless the TTL is <1 min). Feed bridge assumes `lastSeen` is a display string ("Active … ago") — verify against a real payload. No tests.

### 2026-10-26 — chat: `message:delivered` / `message:read` receipts
- `lib/chat/socket.ts`: added `MessageReceiptPayload` (`conversationId` + `messageId`, optional server-stamped `deliveredAt`/`readAt`). Both events added to `ClientToServerEvents` (per the given spec) **and** `ServerToClientEvents` — the relay back to the sender is what flips its tick. Socket `ChatMessage` gained `deliveredAt?`/`readAt?`.
- `app/context/ChatContext.tsx`: `fromSocketMessage` no longer hardcodes both timestamps to `null`. New `emitReceipt` (deduped per `kind|messageId` by the `receiptsSent` ref; socket.io buffers packets while offline) and `applyReceipt` (stamps the thread row + conversation `lastMessage`). Emits: on `message:receive` of a non-own row → `message:delivered`; a thread effect emits `delivered`+`read` for every counterpart row in the open conversation missing a stamp (fresh history, older pages, live rows) — its deps include `conversations` because the counterpart id comes from it. Server→client `message:delivered`/`message:read` listeners update the sender.
- Ticks: `delivered?: boolean` on all four render types in `ChatMain.tsx`; `mapApiMessages` sets it, `lockRichMessages` copies it; all four footer sites render ✓ → ✓✓ grey `#9aa4b2` (delivered) → ✓✓ pink (read). Gift card's read tick changed grey `#a9a6ae` → pink for consistency.
- Verified: `npx tsc --noEmit` 0; eslint delta 0 on the four touched files (ChatContext's 4 `react-hooks/refs` and ChatMain's 1 `set-state-in-effect` + 11 warnings are baseline — ChatMain confirmed via stash+lint). Build skipped at the user's request (dev server running).
- **Open:** assumes the server relays receipts to the sender — if it only accepts the client→server form, sender ticks only update on refetch. `receiptsSent` grows for one session, never cleared. No tests.

### 2026-10-24 — onboarding: existing prompts data hydration & lookup
- `app/onBoarding/stepPayloads.ts`: Added `flows.PROMPT` extraction to `seed.prompts = { answers }` in `stepDataFromDetails(details)`. Previously, prompts were omitted entirely from central hydration, leaving `form.get("answers")` empty on initial load even when the backend had answers in `onboarding-details`.
- `app/onBoarding/steps/Prompts.tsx`: Switched to `useOnBoardingData()` (matching `Intentions.tsx`, `Lifestyle.tsx`, `Interests.tsx`, `Review.tsx`). Added prompt-question resolution map and effects to synchronize answers from `profileDetails.details?.flows?.PROMPT` and backfill any missing question titles from prompt categories if the API only stored prompt IDs and answers.
- Verified: `npx tsc --noEmit` clean (0 errors).

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
