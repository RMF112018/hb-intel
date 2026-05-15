# Prompt 02A — Replace Static My Dashboard Page Header Copy with Authenticated Personalized Time-of-Day Greeting

## Mandatory operating instruction

**Do not re-read files that are still within your current context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Starting repo posture

Execute this as a focused follow-up to:

- **Prompt 01** commit: `96526c62e6f1f4e9a102fba8c9585398723eaee4`
- **Prompt 02** commit: `37db6d8a4a440be99228f6ca07f9b85aab17b915`

Prompt 02 replaced the old telemetry-heavy hero with a compact static page header:

- eyebrow: `My Dashboard`
- title: `My Work`
- support: `Your personal launch pad for project access and work requiring attention.`

That copy now needs to be corrected. Native SharePoint chrome already renders the **My Dashboard** site title. The application-owned compact header must instead greet the authenticated user personally.

---

# Objective

Update the My Dashboard compact page header so it renders a personalized time-of-day greeting using the authenticated SharePoint user identity:

- `Good morning, Bobby.`
- `Good afternoon, Bobby.`
- `Good evening, Bobby.`

The greeting must follow the same conditional greeting windows and first-name fallback semantics currently used by the HB Central `hbSignatureHero` implementation, while remaining scoped to My Dashboard.

The page header must **not** render:

- `My Dashboard`
- `My Work`
- any static eyebrow/title combination that restates the site name or module name

The compact support sentence from Prompt 02 should remain intact:

> `Your personal launch pad for project access and work requiring attention.`

---

# Repo-truth reference behavior to mirror

Treat the existing HB Central signature hero as the behavioral reference:

## Greeting composition authority

- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
  - Calls `resolveWelcomeMessage(identity, now)`
  - Renders the result as:
    - greeting text
    - first name with terminal period

- `apps/hb-webparts/src/homepage/helpers/welcomeMessage.ts`
  - Produces:
    - `greeting`
    - `firstName`
    - `headline: "${greeting}, ${firstName}."`

## Greeting time windows to mirror exactly

- `apps/hb-webparts/src/homepage/helpers/greeting.ts`

Required windows:

- `03:00:00` through `11:59:59` → `Good morning`
- `12:00:00` through `17:00:59` → `Good afternoon`
- `17:01:00` through `02:59:59` → `Good evening`

The reference implementation evaluates the render-time `Date` via `getHours()` / `getMinutes()` and supports deterministic injection through an optional `now?: Date` seam.

## First-name fallback order to mirror exactly

- `apps/hb-webparts/src/homepage/helpers/identity.ts`

Required fallback order:

1. `preferredName` first token, if available
2. `displayName` first token, if available
3. normalized email local part first token, if available
4. fallback to `there`

For My Dashboard’s current SPFx context, `preferredName` is not presently supplied by the app entry seam. The implementation must support the field in the local helper type for behavioral parity, but production composition will ordinarily supply `displayName` and `email` from the authenticated SharePoint user.

---

# Closed implementation decisions

## Decision 02A-01 — Use behavioral parity, not cross-app imports

Do **not** import helper modules directly from:

- `apps/hb-webparts/src/homepage/helpers/greeting.ts`
- `apps/hb-webparts/src/homepage/helpers/identity.ts`
- `apps/hb-webparts/src/homepage/helpers/welcomeMessage.ts`

Those are app-local implementation files, not shared package APIs.

Instead:

- Create a small **My Dashboard-local pure helper** that mirrors the exact behavior and boundary rules.
- Keep the helper intentionally narrow and named for the page-header greeting context.
- Add tests proving parity behavior.

Do not initiate a cross-package extraction or refactor of `hb-webparts` in Prompt 02A.

## Decision 02A-02 — Header visual structure after this patch

The compact header must render:

1. **Primary greeting title**
   - Example: `Good morning, Bobby.`
2. **Existing support line**
   - `Your personal launch pad for project access and work requiring attention.`

The previous Prompt 02 **eyebrow line must be removed from rendered JSX**. Do not replace it with a different eyebrow.

The header remains compact and uses the Prompt 02 visual container, density markers, and styling posture unless a small CSS adjustment is required due to removal of the eyebrow element.

## Decision 02A-03 — Time basis

Match the current `hbSignatureHero` behavior:

- Resolve greeting from a `Date` object via hour/minute bucket logic.
- Provide an optional `now?: Date` prop seam for deterministic tests.
- Default runtime behavior uses `new Date()`.

Do **not** add:
- REST calls,
- Graph calls,
- SharePoint regional-setting lookups,
- async timezone resolution,
- polling or timers

in Prompt 02A.

This prompt is parity-oriented with the existing `hbSignatureHero` conditional greeting implementation.

## Decision 02A-04 — Authenticated user source

Use the authenticated SPFx user context already passed into My Dashboard from `mount.tsx` → `MyDashboardApp` → `MyWorkShell`.

Update the currently narrow My Dashboard local prop typing so the header composition can read:

- `spfxContext.pageContext.user.displayName`
- `spfxContext.pageContext.user.email`
- `spfxContext.pageContext.user.loginName`

Prefer aligning the local type seam with the existing exported auth contract if repo truth permits without dependency churn:

- `@hbc/auth` already exports `ISpfxPageContext`

However:
- Do not reshape the mount contract.
- Do not change auth bootstrap behavior.
- Do not introduce backend/API coupling for greeting composition.

## Decision 02A-05 — Support copy remains static

Keep the Prompt 02 support sentence exactly:

> `Your personal launch pad for project access and work requiring attention.`

Do not rewrite it in this patch.

---

# Files to inspect

At minimum inspect:

## My Dashboard post-Prompt-02 header path

- `apps/my-dashboard/src/shell/MyWorkHeroBand.tsx`
- `apps/my-dashboard/src/shell/MyWorkHeroBand.module.css`
- `apps/my-dashboard/src/shell/MyWorkHeroBand.test.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.test.tsx`
- `apps/my-dashboard/src/MyDashboardApp.tsx`
- `apps/my-dashboard/src/mount.tsx`

## Behavioral reference only — do not modify

- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- `apps/hb-webparts/src/homepage/helpers/welcomeMessage.ts`
- `apps/hb-webparts/src/homepage/helpers/greeting.ts`
- `apps/hb-webparts/src/homepage/helpers/identity.ts`

## Existing shared type reference

- `packages/auth/src/types.ts`
- `packages/auth/src/index.ts`

---

# Required implementation

## 1. Add a My Dashboard-local pure greeting helper

Create:

- `apps/my-dashboard/src/shell/myWorkPageHeaderWelcome.ts`

This helper should export a narrow, deterministic API equivalent in behavior to the HB Central signature hero helper chain.

Recommended shape:

```ts
export type MyWorkPageHeaderGreeting =
  | 'Good morning'
  | 'Good afternoon'
  | 'Good evening';

export interface MyWorkPageHeaderIdentityInput {
  readonly preferredName?: string;
  readonly displayName?: string;
  readonly email?: string;
}

export interface MyWorkPageHeaderWelcomeMessage {
  readonly greeting: MyWorkPageHeaderGreeting;
  readonly firstName: string;
  readonly headline: string;
}

export function resolveMyWorkPageHeaderFirstName(
  identity: MyWorkPageHeaderIdentityInput,
): string;

export function resolveMyWorkPageHeaderGreetingForTime(
  hour24: number,
  minute: number,
): MyWorkPageHeaderGreeting;

export function resolveMyWorkPageHeaderGreetingAt(
  now: Date,
): MyWorkPageHeaderGreeting;

export function resolveMyWorkPageHeaderWelcomeMessage(
  identity: MyWorkPageHeaderIdentityInput,
  now: Date,
): MyWorkPageHeaderWelcomeMessage;
```

Behavior must match the HB Signature Hero reference exactly:

### Greeting windows

- 03:00 → morning begins
- 12:00 → afternoon begins
- 17:01 → evening begins
- 00:00 / overnight → evening

### First-name fallback order

1. preferred name first token
2. display name first token
3. normalized email-local-part first token
4. `there`

### Headline format

```ts
`${greeting}, ${firstName}.`
```

---

## 2. Update `MyWorkHeroBand.tsx`

Prompt 02 produced a static copy-driven page header. Replace that title layer with the personalized greeting.

### Required prop changes

Update `MyWorkHeroBandProps` to include:

```ts
readonly identity?: MyWorkPageHeaderIdentityInput;
readonly now?: Date;
```

Retain:

```ts
readonly mode: MyWorkResponsiveMode;
readonly ariaLabel?: string;
```

### Required copy changes

Delete the static Prompt 02 exports:

- `MY_WORK_PAGE_HEADER_EYEBROW`
- `MY_WORK_PAGE_HEADER_TITLE`

Retain the support string export, but rename only if necessary for clarity. The preferred outcome is to keep the existing support export if tests already rely on it.

Do not render any eyebrow element.

### Required render behavior

Use:

```ts
const welcome = resolveMyWorkPageHeaderWelcomeMessage(identity ?? {}, now ?? new Date());
```

Render:

```tsx
<h2
  className={styles.title}
  data-my-work-page-header-greeting=""
>
  {welcome.headline}
</h2>
```

Keep:

```tsx
<p
  className={styles.support}
  data-my-work-page-header-support=""
>
  {MY_WORK_PAGE_HEADER_SUPPORT}
</p>
```

### Required DOM marker changes

The Prompt 02 root markers remain:

- `data-my-work-page-header`
- `data-my-work-page-header-density`

Replace child markers:

- remove: `data-my-work-page-header-eyebrow`
- remove: `data-my-work-page-header-title`
- add: `data-my-work-page-header-greeting`

The compact header remains a region with the same default aria-label unless tests show a better correction is required. The default label may remain:

- `My Work page header`

Do not reintroduce hero markers or telemetry/governance markers.

---

## 3. Update `MyWorkHeroBand.module.css`

Prompt 02 introduced:

- `.pageHeader`
- `.identity`
- `.eyebrow`
- `.title`
- `.support`

Update the CSS to remove unused `.eyebrow` styling after the JSX no longer renders an eyebrow element.

Keep:

- `.pageHeader`
- `.identity`
- `.title`
- `.support`
- density behavior
- left accent rail / compact static-header posture from Prompt 02

Adjust vertical spacing only if the removed eyebrow leaves an awkward gap. Do not expand the header vertically.

Do not:
- add new colors,
- add new raw rgba shadows,
- introduce a new elevation model,
- turn the header into a large flagship hero.

---

## 4. Thread authenticated user identity into the page header

### `MyWorkShell.tsx`

The shell currently accepts `spfxContext` but intentionally does not use it after Prompt 02.

Use it now to assemble the page-header identity input:

```ts
const pageHeaderIdentity = {
  displayName: spfxContext?.pageContext.user.displayName,
  email: spfxContext?.pageContext.user.email,
};
```

Then render:

```tsx
<MyWorkHeroBand mode={mode} identity={pageHeaderIdentity} />
```

The header must fall back truthfully to:

- `Good morning, there.`
- `Good afternoon, there.`
- `Good evening, there.`

when identity data is unavailable in fixture/test contexts.

### Prop typing

The current My Dashboard shell/app prop shape only requires `loginName`. Expand that local type seam so `displayName` and `email` are legal and accurately modeled.

Preferred implementation path:
- use or align with `ISpfxPageContext` from `@hbc/auth` if this fits cleanly,
- otherwise define a local narrowed type with `displayName`, `email`, and `loginName`.

Do not alter `mount()`’s overall call signature.

---

## 5. Update `MyDashboardApp.tsx` typing if needed

If `MyWorkShellProps` is expanded, update `MyDashboardAppProps` so its `spfxContext` shape remains compatible.

Do not change the app’s data/provider composition.

---

# Required tests

## A. Add helper unit tests

Create:

- `apps/my-dashboard/src/shell/myWorkPageHeaderWelcome.test.ts`

Test all of the following.

### Greeting boundary tests

- `02:59` → `Good evening`
- `03:00` → `Good morning`
- `11:59` → `Good morning`
- `12:00` → `Good afternoon`
- `17:00` → `Good afternoon`
- `17:01` → `Good evening`
- `00:00` → `Good evening`

### Name resolution tests

- preferred name wins over display name/email
- display name wins over email
- email local part normalizes:
  - `bobby.fetting@example.com` → `bobby`
  - hyphen/underscore are handled consistently with the HB hero helper behavior
- missing identity falls back to `there`

### Headline test

Assert:

```ts
Good morning, Bobby.
```

is formatted exactly from the welcome-message resolver.

---

## B. Update `MyWorkHeroBand.test.tsx`

Rewrite Prompt 02’s static title tests to assert personalized greeting behavior.

### Required positive assertions

- with identity `{ displayName: 'Bobby Fetting', email: 'bfetting@example.com' }` and a morning `now`, renders:
  - `Good morning, Bobby.`
- with same identity and afternoon `now`, renders:
  - `Good afternoon, Bobby.`
- with same identity and evening `now`, renders:
  - `Good evening, Bobby.`

### Required fallback assertion

- with no identity supplied, renders:
  - `Good morning, there.`
  - or the corresponding deterministic daypart based on injected `now`

### Required marker assertions

- root marker remains `data-my-work-page-header`
- density marker remains `data-my-work-page-header-density`
- greeting marker exists:
  - `data-my-work-page-header-greeting`
- old static Prompt 02 markers are absent:
  - no `data-my-work-page-header-eyebrow`
  - no `data-my-work-page-header-title`

### Required negative copy assertions

The header text must not contain:

- `My Dashboard`
- `My Work`

Retain Prompt 02’s negative assertions preventing reintroduction of:
- old hero markers,
- telemetry strip phrases,
- governance lane phrases,
- developer-facing TODO/mock/placeholder text.

---

## C. Update `MyWorkShell.test.tsx`

Update page-header composition assertions so they validate the actual shell integration path, not just the isolated header component.

### Required assertions

Render `MyWorkShell` with an SPFx-context fixture containing:

```ts
pageContext: {
  user: {
    displayName: 'Bobby Fetting',
    email: 'bfetting@example.com',
    loginName: 'bfetting@example.com',
    // include any additional fields necessary if the selected type requires them
  }
}
```

Use deterministic time control if needed.

Assert that shell-level composition renders:

- `Good morning, Bobby.` for a morning timestamp

And assert that:
- the support copy remains unchanged,
- no `My Dashboard` / `My Work` copy appears within the application-owned page header subtree.

Do not broaden shell tests into My Projects / Adobe work.

---

# Required validation

Run in this order:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test --run MyWorkHeroBand MyWorkShell myWorkPageHeaderWelcome
pnpm --filter @hbc/spfx-my-dashboard test
pnpm exec prettier --check <changed files>
```

If Prettier reformats any file:
1. apply the formatting,
2. rerun the targeted tests,
3. rerun check-types if TypeScript source changed,
4. then rerun the full app test suite if needed to preserve the final validation order.

Do not use `npx` fallbacks for `pnpm exec`.

---

# Files expected to change

Expected implementation files:

- `apps/my-dashboard/src/shell/MyWorkHeroBand.tsx`
- `apps/my-dashboard/src/shell/MyWorkHeroBand.module.css`
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/MyDashboardApp.tsx` — only if prop typing requires alignment

Expected new files:

- `apps/my-dashboard/src/shell/myWorkPageHeaderWelcome.ts`
- `apps/my-dashboard/src/shell/myWorkPageHeaderWelcome.test.ts`

Expected test updates:

- `apps/my-dashboard/src/shell/MyWorkHeroBand.test.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.test.tsx`

No other file churn is expected unless required to keep type exports or fixtures accurate.

---

# Explicit non-goals

Do not:

- modify `hbSignatureHero` or its helper files,
- add a cross-package shared greeting extraction,
- alter Prompt 03 Adobe consolidation scope,
- alter Prompt 04 My Projects scope,
- alter Prompt 05 bento choreography,
- alter Prompt 06 cleanup/documentation sweep,
- alter Prompt 07 package/version/evidence posture,
- reintroduce telemetry, governance copy, or routed-module behavior into the page header,
- turn the compact My Dashboard header into a full branded hero.

---

# Exit criteria

Return a concise closure report with:

1. **Implementation Decision** — PASS / PARTIAL / BLOCKED
2. **Prompt Objective**
3. **Repo Truth Confirmed Before Edit**
4. **Files Changed**
5. **Behavior Delivered**
6. **Tests Added / Updated**
7. **Validation Performed**
8. **Residual Risks or Follow-Ups**

The delivered behavior is acceptable only if:

- the application-owned compact header greets the authenticated user personally,
- the greeting windows match the existing HB Signature Hero semantics,
- the first name resolves with the same fallback order,
- the header contains no `My Dashboard` or `My Work` title text,
- the Prompt 02 compact visual posture remains intact,
- all validation commands pass.
