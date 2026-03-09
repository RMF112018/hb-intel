# SF03-T09 — Deployment: `@hbc/complexity`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 through D-10 (all)
**Estimated Effort:** 0.25 sprint-weeks

---

## Objective

Produce the pre-deployment checklist, the ADR documenting all ten locked decisions, the SPFx Application Customizer integration guide, the administrator role-mapping guide, and the blueprint progress comment — completing the `@hbc/complexity` package deliverable.

---

## 3-Line Plan

1. Run the pre-deployment checklist to confirm all prior tasks (T01–T08) meet the Definition of Done.
2. Write `docs/architecture/adr/ADR-0081-complexity-dial-platform-primitive.md` documenting all ten decisions with full context, rationale, and consequences.
3. Publish the SPFx integration guide and the administrator role-mapping guide; insert the blueprint progress comment.

---

## Pre-Deployment Checklist

### Code Quality

- [ ] `pnpm --filter @hbc/complexity typecheck` — zero errors
- [ ] `pnpm --filter @hbc/complexity lint` — zero warnings
- [ ] `pnpm --filter @hbc/complexity build` — zero errors; `dist/` populated
- [ ] `pnpm --filter @hbc/complexity test:coverage` — all four thresholds ≥ 95% (lines, functions, branches, statements)
- [ ] No `any` types outside explicit `// eslint-disable-next-line` with justification comment
- [ ] No direct `localStorage`/`sessionStorage` accesses outside `complexityStorage.ts` and `getStorage.ts`

### Contract Stability

- [ ] `IComplexityContext` shape matches `SF03-T02` specification exactly
- [ ] `IComplexityPreference` shape matches `SF03-T02` specification exactly
- [ ] `COMPLEXITY_STORAGE_KEY = 'hbc::complexity::v1'` — exact string verified in source
- [ ] `COMPLEXITY_OPTIMISTIC_DEFAULT = { tier: 'essential', showCoaching: true }` — exact value verified
- [ ] `@hbc/complexity/testing` sub-path exports `ComplexityTestProvider`, `createComplexityWrapper`, `mockComplexityContext`, `allTiers` — all four confirmed
- [ ] `useComplexity()` returns `tier`, `atLeast`, `is`, `setTier`, `showCoaching`, `setShowCoaching`, `isLocked`, `lockedBy`, `lockedUntil` — all confirmed
- [ ] `useComplexityGate({ minTier?, maxTier? })` returns `boolean` — confirmed

### Documentation

- [ ] `docs/architecture/adr/ADR-0081-complexity-dial-platform-primitive.md` written and merged
- [ ] `docs/reference/ui-kit/complexity-sensitivity.md` published (output of T07)
- [ ] `docs/how-to/administrator/complexity-role-mapping.md` written and merged
- [ ] `docs/how-to/developer/complexity-integration-guide.md` written and merged (SPFx + PWA placement)
- [ ] Blueprint progress comment inserted at end of `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`
- [ ] Foundation Plan progress comment inserted at end of `docs/architecture/plans/hb-intel-foundation-plan.md`

### Integration Verification

- [ ] `ComplexityProvider` wraps `<RouterProvider>` at PWA root — confirmed in `apps/pwa/src/main.tsx`
- [ ] `ComplexityProvider` wraps `<AppShell>` in SPFx Application Customizer — confirmed in `apps/spfx/src/extensions/hbcAppCustomizer/HbcAppCustomizerApplicationCustomizer.ts`
- [ ] `getStorage()` returns `localStorage` when `spfxContext` prop is absent — manual verification
- [ ] `getStorage()` returns `sessionStorage` when `spfxContext` prop is present — manual verification
- [ ] StorageEvent cross-tab sync: open two PWA tabs, change tier in one, confirm instant update in other — manual verification
- [ ] Lock auto-expiry: set `lockedUntil` to 30 seconds from now, confirm dial re-enables at expiry — manual verification
- [ ] New-user flow: clear storage, load app, confirm Essential render → Standard/Expert upgrade after API resolves (D-03)
- [ ] Returning-user flow: set storage key to `standard`, reload app, confirm zero flash at Standard (D-01)

### Storybook

- [ ] All six `HbcComplexityGate` stories render in Storybook without console errors
- [ ] All six `HbcComplexityDial` stories render in Storybook without console errors
- [ ] Locked dial story shows tooltip with expiry date when `lockedUntil` is set (D-06)
- [ ] `showCoaching` toggle story correctly toggles state (D-07)
- [ ] CSS fade-in visible at 150ms on tier upgrade in `HbcComplexityGate` stories (D-09)

### Turborepo Build

- [ ] `pnpm turbo run build` — zero errors across full workspace
- [ ] `pnpm turbo run typecheck` — zero errors across full workspace
- [ ] `pnpm turbo run test` — all tests pass
- [ ] `node -e "import('@hbc/complexity/testing').then(m => console.log(Object.keys(m)))"` — prints `['ComplexityTestProvider', 'createComplexityWrapper', 'mockComplexityContext', 'allTiers']`

### Retrofit Confirmation (D-08)

- [ ] At least 5 `@hbc/ui-kit` components updated with `complexityMinTier` default gates (T07 output)
- [ ] `docs/reference/ui-kit/complexity-sensitivity.md` lists all retrofitted components with their defaults
- [ ] `HbcAuditTrailPanel` gates to `expert` by default — confirmed
- [ ] `HbcDataTable` advanced filters gate to `expert` by default — confirmed
- [ ] `HbcFormField` complexity-sensitive mode gates to `standard` by default — confirmed
- [ ] `HbcStatusTimeline` gates to `standard` by default — confirmed
- [ ] `HbcPermissionMatrix` gates to `expert` by default — confirmed
- [ ] `HbcCoachingCallout` gates to essential-only (suppressed at Standard+) and respects `showCoaching` — confirmed

---

## ADR: `docs/architecture/adr/ADR-0081-complexity-dial-platform-primitive.md`

```markdown
# ADR-0012 — Complexity Dial as Platform Primitive

**Status:** Accepted
**Date:** 2026-03-08
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Superseded By:** None
**Related ADRs:** ADR-0001 (monorepo structure), ADR-0011 (BIC Next Move platform primitive)

---

## Context

Every HB Intel module must answer the same question before rendering any UI element:
**"How much information should I show this user right now?"**

Without a shared answer, each module makes independent density decisions. Field staff
using six modules simultaneously would encounter six different information densities —
some overwhelming, some too sparse — destroying the coherent, learnable experience
that HB Intel promises.

The platform requires a single, authoritative, cross-module context that:
- Applies a consistent three-tier density model (Essential / Standard / Expert)
- Persists the user's tier choice across sessions and browser tabs
- Derives a sensible initial tier from the user's role at first launch
- Locks the tier during onboarding or admin-directed workflows
- Exposes a declarative gating API so any module can show/hide content with one line

This ADR documents the ten decisions that define `@hbc/complexity` — the React package
that implements this platform primitive.

---

## Decision 1 (D-01) — Tier Persistence: Client-Side Storage

**Decision:** Use `localStorage` in the PWA context and `sessionStorage` as a fallback
for SPFx. A `getStorage()` utility selects the correct store at runtime by inspecting
whether a `spfxContext` prop is present on `ComplexityProvider`. An in-memory fallback
activates when both stores are unavailable (private browsing, iframe sandboxes).

**Rejected alternatives:**
- *URL parameter*: Exposes tier in every link; breaks on navigation.
- *Cookie*: Server round-trip on every request; not cross-tab without JS event bridge.
- *Server session only*: Requires network on every render; eliminates zero-flash guarantee.

**Consequences:**
- Zero-flash rendering for returning users: cached tier is read synchronously before
  first React render, so the component tree initialises at the correct tier.
- Cross-tab synchronisation is possible in the PWA via browser `StorageEvent`.
- SPFx webparts on the same page share context through the Application Customizer
  React tree (no cross-tab events needed; webparts are co-located in the same tab).
- Storage corruption (manual edits, version mismatch) is handled by `readPreference()`,
  which validates the tier value and returns `null` on parse failure, triggering the
  optimistic default (D-03).

---

## Decision 2 (D-02) — Default Tier: Role-Derived from Azure AD Groups

**Decision:** New users receive an initial tier derived from their Azure AD group
membership, looked up against `src/config/roleComplexityMap.ts`. The mapping is a
config file (not hardcoded logic) so non-developers can update group assignments via
a PR. Derivation fires exactly once per new user — the returned tier is persisted to
the API and storage, and the user controls their tier from that point forward.

| AD Group / Attribute | Initial Tier |
|---|---|
| `HBC-NewHire` (< 90 days) | `essential` |
| `HBC-FieldStaff` | `essential` |
| `HBC-Reviewer` | `essential` |
| `HBC-ProjectCoordinator` | `standard` |
| `HBC-Admin` | `standard` |
| `HBC-ProjectManager` | `standard` |
| `HBC-Estimator` | `standard` |
| `HBC-BusinessDevelopment` | `standard` |
| `HBC-Director` | `expert` |
| `HBC-VP` | `expert` |
| `HBC-Executive` | `expert` |
| *(no match — fallback)* | `standard` |

**Rejected alternatives:**
- *Always Essential for all new users*: Forces experienced users (Directors, VPs) to
  immediately upgrade — wasted friction and a poor first impression.
- *Always Standard*: Under-serves new hires and field staff who need guided onboarding.
- *Hardcoded role logic*: Requires code deploy to update group assignments; config file
  approach allows HR/operations team to propose changes via standard PR process.

**Consequences:**
- `deriveInitialTierFromADGroups()` calls `/api/users/me/groups` and applies
  `deriveInitialTier()` from `roleComplexityMap.ts`.
- API responds 404 for new users → provider derives tier → PATCHes
  `/api/users/me/preferences` → updates context.
- Returning users (200 response) use stored preference; derivation does not re-run.

---

## Decision 3 (D-03) — First-Load Hydration Gap: Optimistic Essential Default

**Decision:** When no cached preference exists (brand-new user, cleared storage), render
immediately at `{ tier: 'essential', showCoaching: true }`. When the API responds with
the role-derived tier, the tier only ever *upgrades* (Essential → Standard/Expert). It
never downgrades. Content reveals — it never disappears mid-render.

**Rejected alternatives:**
- *Loading spinner*: Introduces flash of loading state for every new user; worse UX
  than rendering immediately at Essential.
- *Null / skeleton state*: Ambiguous to module authors; complicates gating API.
- *Block render until API*: Unacceptable latency; violates zero-flash requirement.
- *Optimistic Standard (not Essential)*: If a field staff user's role-derived tier is
  Essential, content would disappear when tier corrects — violates additive-only rule.

**Consequences:**
- `ComplexityProvider` initialises `useState` synchronously from `readPreference() ??
  COMPLEXITY_OPTIMISTIC_DEFAULT` — no async wait on first render.
- `setTier()` in the background API callback only upgrades: if `derivedTier` rank ≤
  current rank, the call is skipped.
- Returning users never experience the optimistic default — they have a cached tier.

---

## Decision 4 (D-04) — `HbcComplexityGate` DOM Behaviour: Unmount Default

**Decision:** `HbcComplexityGate` unmounts children by default when the gate is closed.
An optional `keepMounted?: boolean` prop preserves the DOM subtree (hidden via
`aria-hidden="true"` + `display: none`) for cases where child component state must
survive tier changes.

**Rejected alternatives:**
- *Always keep mounted*: Wastes memory; pollutes DOM with hidden content; screen readers
  encounter hidden interactive elements unless `aria-hidden` is rigorously applied.
- *Always unmount*: Loses scroll position, form state, and video playback in the small
  number of cases where preservation is genuinely needed.
- *`visibility: hidden` instead of unmount*: Still occupies layout space; worse than
  `display: none` for accessibility.

**Consequences:**
- Default (unmount): Clean DOM, correct screen reader behaviour, zero memory leak risk.
- `keepMounted` path: `aria-hidden="true"` + `style={{ display: 'none' }}` applied;
  documented warning in JSDoc against casual use.
- Module authors must explicitly opt in to `keepMounted` — friction is intentional.

---

## Decision 5 (D-05) — Cross-Tab Tier Synchronisation: StorageEvent

**Decision:** `ComplexityProvider` attaches a `storage` event listener in PWA contexts.
When the user changes their tier in any tab, the `writePreference()` call updates
`localStorage`, which fires `StorageEvent` in all other same-origin tabs. All tabs
update their context state instantly with no toast or confirmation.

In SPFx contexts (`spfxContext` prop present), the StorageEvent listener is skipped
because all webparts on the page share the same Application Customizer React tree.

**Rejected alternatives:**
- *BroadcastChannel API*: Equivalent power but lower browser support; StorageEvent is
  universally available in all supported browsers.
- *Polling localStorage*: Adds unnecessary interval timers; StorageEvent is push-based.
- *No cross-tab sync*: User changes tier in Tab A; Tab B remains stale — jarring and
  confusing if both tabs display complexity-gated content.

**Consequences:**
- `useEffect` in `ComplexityProvider` registers `window.addEventListener('storage', ...)`
  and returns cleanup `removeEventListener`.
- Handler checks `event.key === COMPLEXITY_STORAGE_KEY` before processing.
- SPFx webparts co-located on the same page share context through React propagation;
  no StorageEvent bridging required.

---

## Decision 6 (D-06) — Admin Tier Override: Soft Lock with Auto-Expiry

**Decision:** Admin and onboarding systems can lock a user's tier using two fields on
`IComplexityPreference`:
- `lockedBy?: 'admin' | 'onboarding'` — identifies the locking authority
- `lockedUntil?: string` — ISO 8601 timestamp; lock auto-expires when `Date.now() >
  lockedUntil`; absent means permanent until admin clears

When locked, `HbcComplexityDial` renders disabled with a tooltip explaining the lock
and its expiry. `ComplexityProvider` polls every 60 seconds for lock expiry and clears
expired locks from storage automatically.

Admin write surface (the admin UI to set/clear locks) is deferred to a later phase.
`ComplexityProvider` reads and respects lock fields immediately.

**Rejected alternatives:**
- *Hard lock (no user override ever)*: Requires admin action to unlock; locks persist
  after onboarding is complete unless manually cleared — operational burden.
- *No locking*: Onboarding flows that require Essential tier cannot enforce it.
- *Server-enforced lock (reject API PATCH)*: Correct for security but insufficient for
  UX — UI must also disable the dial to prevent confusing 403 responses.

**Consequences:**
- `isPreferenceLocked()` pure function checks both `lockedBy` presence and `lockedUntil`
  timestamp — used in provider state derivation and in `setTier()` guard.
- `setTier()` is a no-op when locked (logs dev-mode warning).
- `buildLockedTooltip()` in `HbcComplexityDial` includes formatted expiry date when
  `lockedUntil` is present.
- 60-second polling `useEffect` checks `isPreferenceLocked()` on interval; clears
  expired lock fields from storage and updates context state.

---

## Decision 7 (D-07) — `showCoaching` as Independent Preference

**Decision:** `showCoaching` is a standalone boolean preference stored alongside `tier`
in the `hbc::complexity::v1` storage key. Defaults: `true` when initialised at
Essential, `false` when initialised at Standard or Expert. When a user upgrades from
Essential to a higher tier, `showCoaching` is auto-set to `false` (they have demonstrated
competence). Users can toggle it independently at any time.

`IComplexityContext` exposes `showCoaching` (boolean) and `setShowCoaching(value: boolean)`
so any component can read and control coaching visibility.

**Rejected alternatives:**
- *Coaching tied to tier*: Cannot show coaching to an Expert-tier user who wants it;
  cannot suppress coaching for an Essential-tier user who finds it patronising.
- *Coaching always on at Essential, always off at Standard+*: Ignores user agency;
  field veterans start at Essential and immediately want coaching off.
- *Separate storage key*: Increases storage reads and complicates migration; single
  versioned key is simpler.

**Consequences:**
- `setTier()` in `ComplexityProvider` auto-sets `showCoaching: false` when upgrading
  from Essential to Standard or Expert.
- `setShowCoaching()` persists to storage and updates context in a single operation.
- `PH9b Progressive Coaching` reads `showCoaching` from `useComplexity()` — zero
  coupling to tier value.

---

## Decision 8 (D-08) — Retrofit Pattern: Internal Default Gate + External Override Props

**Decision:** Existing `@hbc/ui-kit` components that are complexity-sensitive self-gate
using `useComplexityGate({ minTier: <sensibleDefault> })` internally. They accept two
new optional props — `complexityMinTier` and `complexityMaxTier` — that allow consuming
modules to override the default gate per-instance.

An authoritative sensitivity table is published at
`docs/reference/ui-kit/complexity-sensitivity.md`, mapping each UI Kit component to its
default complexity gate and override behaviour.

**Rejected alternatives:**
- *No retrofit — modules gate externally only*: Each module must independently wrap every
  UI Kit component with `<HbcComplexityGate>`, producing inconsistent defaults and
  duplicated gate logic across dozens of consumers.
- *Gate configuration via theme/context*: Too implicit; hard to discover; breaks when
  a module intentionally needs a different gate.
- *Per-component gate config file*: Overkill; props are sufficient and more discoverable.

**Consequences:**
- Phase 7 retrofits: `HbcAuditTrailPanel` (expert), `HbcDataTable` filters (expert),
  `HbcFormField` complexity-sensitive (standard), `HbcStatusTimeline` (standard),
  `HbcPermissionMatrix` (expert), `HbcCoachingCallout` (essential max).
- Consuming modules pass `complexityMinTier="standard"` to override a component's
  Expert default for a specific instance without touching the component source.
- Sensitivity table is updated via PR whenever a new component is retrofitted.

---

## Decision 9 (D-09) — Tier Change Transition: CSS Fade-In for Appearing Content

**Decision:** When `HbcComplexityGate` opens (content becomes visible), it applies a
150ms `opacity: 0 → 1` CSS fade-in via `@keyframes hbc-complexity-fade-in`. When the
gate closes, content unmounts immediately (no animation) for consistency with D-04.

**Rejected alternatives:**
- *No animation*: Abrupt content appearance is jarring when a user upgrades their tier.
- *JavaScript animation library (Framer Motion, React Spring)*: Adds bundle weight for
  a single, simple transition; pure CSS is sufficient.
- *Fade-out on disappearing content*: Contradicts D-04 (unmount default); animating
  before unmount requires deferring unmount via `onAnimationEnd`, adding complexity
  and a brief period where hidden content is still in the DOM.
- *Slide animation*: More visually disruptive than fade; fade is subtle and professional.

**Consequences:**
- `HbcComplexityGate` tracks `isEntering` state: set to `true` on gate open, cleared
  after 150ms via `setTimeout`. CSS class `.hbc-complexity-gate--entering` applies the
  `hbc-complexity-fade-in` animation.
- `prevOpenRef` prevents triggering entering animation on initial mount.
- Zero dependency on animation libraries — pure CSS injected via styled component or
  global stylesheet import.

---

## Decision 10 (D-10) — Testing Utilities: `@hbc/complexity/testing` Sub-Path

**Decision:** Publish testing utilities at `@hbc/complexity/testing` — a separate
package.json `exports` entry that is excluded from the production bundle. Exports four
utilities:
- `ComplexityTestProvider` — props-driven provider (no storage reads, no API calls)
- `createComplexityWrapper(tier)` — returns a Testing Library `wrapper` option function
- `mockComplexityContext(overrides?)` — vi.fn() stubs for all context methods
- `allTiers` — `['essential', 'standard', 'expert'] as const`

**Rejected alternatives:**
- *Ship mocks in the main bundle*: Increases production bundle size with test-only code.
- *Each consumer writes its own mocks*: Duplicate mock implementations drift from the
  real contract; bugs in mocks produce false-positive tests.
- *Global test setup in each consuming package*: Requires every consumer to configure
  providers independently; error-prone and verbose.

**Consequences:**
- `testing/` directory is excluded from `tsconfig.json` `include` (avoids type leakage)
  but included in `package.json` `files` array.
- `vitest.config.ts` alias resolves `@hbc/complexity/testing` to `./testing/index.ts`
  in all packages that depend on `@hbc/complexity`.
- `ComplexityTestProvider` accepts `_testPreference` prop that bypasses storage/API
  and sets context directly — guaranteed deterministic test state.

---

## Summary of Consequences

| Concern | Outcome |
|---|---|
| Production bundle impact | Testing utilities excluded via sub-path; zero impact |
| Zero-flash rendering | Synchronous storage read on mount; confirmed for returning users |
| New user experience | Optimistic Essential → role-derived upgrade; always additive |
| Cross-tab consistency | StorageEvent synchronises all PWA tabs instantly |
| SPFx isolation | sessionStorage fallback; Application Customizer React tree shares context |
| Admin control | Soft lock with auto-expiry; admin write surface deferred |
| Coaching flexibility | Independent `showCoaching` preference decoupled from tier |
| Retrofit disruption | Zero breaking changes to `@hbc/ui-kit`; default gates are backward-compatible |
| Transition UX | Subtle 150ms fade on content appearance; unmount is instant |
| Consumer testing | One-line wrapper factory; zero mock drift risk |
```

---

## SPFx Application Customizer Integration Guide

Published at `docs/how-to/developer/complexity-integration-guide.md`:

```markdown
# How-To: Integrate `@hbc/complexity` in SPFx

## Prerequisites

- `@hbc/complexity` registered in `packages/complexity/` and built (`pnpm turbo run build`)
- SPFx Application Customizer at
  `apps/spfx/src/extensions/hbcAppCustomizer/HbcAppCustomizerApplicationCustomizer.ts`

## Step 1 — Add dependency

In `apps/spfx/package.json`:

​```json
"dependencies": {
  "@hbc/complexity": "workspace:*"
}
​```

Then: `pnpm install`

## Step 2 — Wrap AppShell in ComplexityProvider

​```typescript
// HbcAppCustomizerApplicationCustomizer.ts
import { ComplexityProvider } from '@hbc/complexity';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export default class HbcAppCustomizerApplicationCustomizer
  extends BaseApplicationCustomizer<IHbcAppCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
      PlaceholderName.Top
    );
    if (this._topPlaceholder) {
      ReactDOM.render(
        <ComplexityProvider spfxContext={this.context}>
          <AppShell />
        </ComplexityProvider>,
        this._topPlaceholder.domElement
      );
    }
    return Promise.resolve();
  }

  protected onDispose(): void {
    if (this._topPlaceholder?.domElement) {
      ReactDOM.unmountComponentAtNode(this._topPlaceholder.domElement);
    }
  }
}
​```

## Step 3 — Verify storage selection

`ComplexityProvider` detects the `spfxContext` prop and uses `sessionStorage` (D-01).
Run in browser console after load:

​```javascript
sessionStorage.getItem('hbc::complexity::v1');
// Expected: '{"tier":"standard","showCoaching":false}' (or similar)
localStorage.getItem('hbc::complexity::v1');
// Expected: null (SPFx should not write to localStorage)
​```

## Step 4 — Verify context sharing across webparts

All webparts rendered within `<AppShell>` automatically inherit the `ComplexityProvider`
context. Verify by rendering `HbcComplexityDial` in two separate webparts and confirming
that changing tier in one updates the other instantly (React context propagation).

## Cross-tab behaviour in SPFx

SPFx uses `sessionStorage` (tab-scoped). Cross-tab sync via `StorageEvent` does not
apply. If a user opens the SharePoint page in two tabs, each tab maintains independent
tier state. This is acceptable per D-05: SPFx contexts rely on React context propagation
within the Application Customizer, not cross-tab sync.

## PWA integration (reference)

In `apps/pwa/src/main.tsx`:

​```typescript
import { ComplexityProvider } from '@hbc/complexity';
import { RouterProvider } from '@tanstack/react-router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ComplexityProvider>
      <RouterProvider router={router} />
    </ComplexityProvider>
  </React.StrictMode>
);
​```

No `spfxContext` prop — provider detects PWA context and uses `localStorage` + `StorageEvent`.
```

---

## Administrator Role Mapping Guide

Published at `docs/how-to/administrator/complexity-role-mapping.md`:

```markdown
# How-To: Update the Complexity Tier Role Mapping

## Overview

`@hbc/complexity` derives a new user's initial Complexity Dial tier from their Azure AD
group membership. The mapping is defined in a config file — not hardcoded — so
administrators can propose changes via a standard pull request.

## Mapping file location

​```
packages/complexity/src/config/roleComplexityMap.ts
​```

## Current mapping

| Azure AD Group | Initial Tier |
|---|---|
| `HBC-NewHire` (< 90 days via `employeeHireDate`) | `essential` |
| `HBC-FieldStaff` | `essential` |
| `HBC-Reviewer` | `essential` |
| `HBC-ProjectCoordinator` | `standard` |
| `HBC-Admin` | `standard` |
| `HBC-ProjectManager` | `standard` |
| `HBC-Estimator` | `standard` |
| `HBC-BusinessDevelopment` | `standard` |
| `HBC-Director` | `expert` |
| `HBC-VP` | `expert` |
| `HBC-Executive` | `expert` |
| *(no matching group — fallback)* | `standard` |

## How to add or change a mapping

1. Open `packages/complexity/src/config/roleComplexityMap.ts`.
2. Locate `ROLE_COMPLEXITY_CONFIG.entries` — an array of `IRoleComplexityMapEntry` objects.
3. Add a new entry or update the `tier` field of an existing entry.
4. Submit a pull request with a brief explanation of why the group's default tier changed.
5. After merge, the change takes effect for **new users only** — existing users retain
   their stored preference. If a bulk migration is needed, contact the development team
   to coordinate a preference reset.

## Important notes

- **First-match wins**: Entries are evaluated in order. If a user belongs to multiple
  groups, the first matching entry determines their initial tier.
- **Fallback**: If no entry matches, the user receives `standard`. This fallback is
  intentional — unknown groups should not start at Essential (too restrictive) or Expert
  (potentially overwhelming).
- **New-hire detection**: The `HBC-NewHire` group uses `employeeHireDate` from Azure
  AD profile attributes in addition to group membership. The API endpoint
  `/api/users/me/groups` returns enriched group data including this attribute.
- **This mapping fires once**: After the initial tier is written to the user's preference
  record via `PATCH /api/users/me/preferences`, it is not re-derived on subsequent
  logins. Role changes in Azure AD do not automatically update stored complexity
  preferences.

## Locking a group to a specific tier

Admins can lock individual users via the `lockedBy` / `lockedUntil` fields in the
preference API (D-06). Group-level locks are not currently supported — the lock
mechanism operates on individual user preference records only.
```

---

## Blueprint Progress Comment

Insert at end of `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 2 — Shared Package: @hbc/complexity
Completed: 2026-03-08

Task files produced:
  docs/architecture/plans/shared-features/SF03-Complexity-Dial.md
  docs/architecture/plans/shared-features/SF03-T01-Package-Scaffold.md
  docs/architecture/plans/shared-features/SF03-T02-TypeScript-Contracts.md
  docs/architecture/plans/shared-features/SF03-T03-Context-and-Provider.md
  docs/architecture/plans/shared-features/SF03-T04-Hooks.md
  docs/architecture/plans/shared-features/SF03-T05-Components.md
  docs/architecture/plans/shared-features/SF03-T06-Persistence-and-Sync.md
  docs/architecture/plans/shared-features/SF03-T07-Retrofit-Audit.md
  docs/architecture/plans/shared-features/SF03-T08-Testing-Strategy.md
  docs/architecture/plans/shared-features/SF03-T09-Deployment.md

Documentation added:
  docs/architecture/adr/ADR-0081-complexity-dial-platform-primitive.md
  docs/how-to/developer/complexity-integration-guide.md
  docs/how-to/administrator/complexity-role-mapping.md
  docs/reference/ui-kit/complexity-sensitivity.md (produced by T07)

All 10 decisions locked (D-01 through D-10).
Estimated effort: 4.0 sprint-weeks.
Next: SF04 or Phase 3 (dev-harness) per Foundation Plan sequencing.
-->
```

---

## Foundation Plan Progress Comment

Insert under the SF03 entry in `docs/architecture/plans/hb-intel-foundation-plan.md`:

```markdown
<!-- PROGRESS: SF03 @hbc/complexity — Planning complete 2026-03-08.
  All 9 task files written. ADR-0012 authored.
  Implementation begins Wave 1 (T01+T02+T06+T03): contracts, storage, context.
-->
```

---

## Verification Commands

```bash
# 1. Typecheck — zero errors
pnpm --filter @hbc/complexity typecheck

# 2. Lint — zero warnings
pnpm --filter @hbc/complexity lint

# 3. Build — dist/ populated
pnpm --filter @hbc/complexity build

# 4. Tests with coverage — all four thresholds ≥ 95%
pnpm --filter @hbc/complexity test:coverage

# 5. Testing sub-path resolves correctly
node -e "import('@hbc/complexity/testing').then(m => console.log(Object.keys(m)))"
# Expected: [ 'ComplexityTestProvider', 'createComplexityWrapper', 'mockComplexityContext', 'allTiers' ]

# 6. Full workspace build — zero errors
pnpm turbo run build

# 7. Full workspace typecheck
pnpm turbo run typecheck

# 8. Full workspace tests
pnpm turbo run test

# 9. Confirm documentation files exist
ls docs/architecture/adr/ADR-0081-complexity-dial-platform-primitive.md
ls docs/how-to/developer/complexity-integration-guide.md
ls docs/how-to/administrator/complexity-role-mapping.md
ls docs/reference/ui-kit/complexity-sensitivity.md
```
