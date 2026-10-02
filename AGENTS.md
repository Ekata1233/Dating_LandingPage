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
