# SF03 — `@hbc/complexity`: Three-Tier Complexity Dial

**Plan Version:** 1.0
**Date:** 2026-03-08
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-03-Shared-Feature-Complexity-Dial.md`
**Priority Tier:** 1 — Foundation (must exist before domain modules render adaptive UI)
**Estimated Effort:** 2–3 sprint-weeks (spec) + retrofit audit scope
**ADR Required:** `docs/architecture/adr/0012-complexity-dial-platform-primitive.md`

---

## Purpose

`@hbc/complexity` is the platform-wide context that answers the question every component must ask before rendering: **"How much information should I show this user right now?"**

Every actionable field, panel, coaching prompt, audit trail, and configuration option in every HB Intel module reads the current complexity tier — Essential, Standard, or Expert — from this shared context and renders accordingly. Without this package, modules make independent density decisions, creating cross-module inconsistency that undermines learnability.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Tier persistence: client-side storage | `localStorage` (PWA) with `sessionStorage` fallback (SPFx). Zero-flash rendering via synchronous cache read on mount. Background API sync updates cache if server value differs. Context detected via `getStorage()` utility. |
| D-02 | Default tier for new users | Role-derived from Azure AD group membership. Config-file mapping (not hardcoded). Fires exactly once — user controls from there. New hires/field staff → Essential; Coordinators/PMs/Estimators/BD → Standard; Directors/VPs/Executives → Expert. |
| D-03 | First-load hydration gap | Optimistic Essential default when no cache exists. Tier always upgrades upward when role-derived value arrives — content reveals, never hides. Returning users see cached tier instantly (no gap). |
| D-04 | `HbcComplexityGate` DOM behavior | Unmount default (clean DOM, correct screen reader behavior, no wasted memory). Optional `keepMounted?: boolean` prop for explicit state-preservation cases. Documented warning against misuse. |
| D-05 | Cross-tab tier synchronization | Instant sync via browser `StorageEvent` listener. All tabs update when tier changes in any tab. No toast. SPFx `sessionStorage` contexts rely on React context propagation via Application Customizer. |
| D-06 | Admin tier override & lock | Soft lock with `lockedBy?: 'admin' \| 'onboarding'` and `lockedUntil?: string` (ISO 8601) fields. `HbcComplexityDial` renders disabled with tooltip when locked. Auto-expires at `lockedUntil`. Admin write surface deferred; `ComplexityProvider` reads and respects fields immediately. |
| D-07 | `showCoaching` lifecycle | Independent boolean preference stored alongside tier. Defaults `true` at Essential init, `false` at Standard/Expert. Auto-sets `false` on tier upgrade from Essential. User toggles independently via settings. `IComplexityContext` exposes `showCoaching` + `setShowCoaching()`. |
| D-08 | Retrofit pattern | Internal default gate + external `complexityMinTier`/`complexityMaxTier` override props. UI Kit components gate themselves with sensible defaults. Consuming modules override per-instance. Retrofit audit produces `docs/reference/ui-kit/complexity-sensitivity.md`. |
| D-09 | Tier change transition animation | CSS fade-in (150ms `opacity: 0 → 1`) on `HbcComplexityGate` for appearing content. Disappearing content unmounts immediately (D-04 consistent). Pure CSS, no animation library. |
| D-10 | Testing utilities for consumers | `@hbc/complexity/testing` sub-path: `ComplexityTestProvider`, `createComplexityWrapper(tier)`, `mockComplexityContext(overrides?)`, `allTiers`. Zero production bundle impact. |

---

## Package Directory Structure

```
packages/complexity/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IComplexity.ts               # ComplexityTier, IComplexityContext, IComplexityAwareProps
│   │   ├── IComplexityPreference.ts     # API payload shape (tier, showCoaching, lockedBy, lockedUntil)
│   │   └── index.ts
│   ├── config/
│   │   └── roleComplexityMap.ts         # D-02: AD group → tier mapping (config file)
│   ├── context/
│   │   ├── ComplexityContext.ts         # React.createContext + default value
│   │   └── ComplexityProvider.tsx       # Root provider: storage, API sync, lock, StorageEvent
│   ├── storage/
│   │   ├── getStorage.ts                # D-01: localStorage vs sessionStorage detection
│   │   ├── complexityStorage.ts         # Read/write tier + showCoaching to storage
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useComplexity.ts             # Access tier, atLeast, is, setTier, showCoaching, setShowCoaching
│   │   ├── useComplexityGate.ts         # Returns boolean for minTier/maxTier conditions
│   │   └── index.ts
│   └── components/
│       ├── HbcComplexityGate.tsx        # D-04, D-09: declarative gate with keepMounted + fade-in
│       ├── HbcComplexityDial.tsx        # D-06: header + settings variants; locked state
│       └── index.ts
├── testing/
│   ├── index.ts                         # D-10: testing sub-path barrel
│   ├── ComplexityTestProvider.tsx
│   ├── createComplexityWrapper.tsx
│   ├── mockComplexityContext.ts
│   └── allTiers.ts
└── src/__tests__/
    ├── setup.ts
    ├── useComplexity.test.ts
    ├── useComplexityGate.test.ts
    ├── ComplexityProvider.test.tsx
    ├── HbcComplexityGate.test.tsx
    └── HbcComplexityDial.test.tsx
```

---

## Role-to-Tier Mapping (D-02)

Stored in `src/config/roleComplexityMap.ts` as a config object — not hardcoded logic. Editable by non-developers via a PR to the config file.

| Azure AD Group / Entra Attribute | Initial Tier |
|---|---|
| `HBC-NewHire` (< 90 days via `employeeHireDate`) | `essential` |
| `HBC-FieldStaff` | `essential` |
| `HBC-Reviewer` (external, occasional) | `essential` |
| `HBC-ProjectCoordinator` | `standard` |
| `HBC-Admin` | `standard` |
| `HBC-ProjectManager` | `standard` |
| `HBC-Estimator` | `standard` |
| `HBC-BusinessDevelopment` | `standard` |
| `HBC-Director` | `expert` |
| `HBC-VP` | `expert` |
| `HBC-Executive` | `expert` |
| *(no matching group — fallback)* | `standard` |

---

## Storage Key Schema (D-01)

All stored under a single JSON-serialized key:

```
Storage key: "hbc::complexity::v1"
Value: { tier: ComplexityTier, showCoaching: boolean, lockedBy?: string, lockedUntil?: string }
```

Versioned key (`v1`) allows future migrations without collision.

---

## Preference API Shape (D-06, D-07)

```typescript
// GET/PATCH /api/users/me/preferences  (relevant fields)
interface IComplexityPreference {
  tier: ComplexityTier;
  showCoaching: boolean;
  lockedBy?: 'admin' | 'onboarding';
  lockedUntil?: string; // ISO 8601 — lock auto-expires when Date.now() > lockedUntil
}
```

---

## Hydration Flow (D-01, D-02, D-03)

```
App mount
│
├── Read "hbc::complexity::v1" from storage (synchronous)
│   ├── HIT → render immediately at cached tier (zero flash)
│   └── MISS → render at 'essential' (D-03 optimistic default)
│
└── Background: GET /api/users/me/preferences
    ├── Returns stored preference → update context if differs from cache
    └── Returns 404 (new user) → derive tier from AD groups
        ├── Map AD groups → tier (D-02 role map)
        ├── PATCH /api/users/me/preferences { tier, showCoaching }
        └── Update context (upgrade from 'essential' if needed — D-03)
```

---

## Lock Expiry Logic (D-06)

```typescript
function isLocked(pref: IComplexityPreference): boolean {
  if (!pref.lockedBy) return false;
  if (!pref.lockedUntil) return true; // permanent lock until admin clears
  return new Date(pref.lockedUntil) > new Date();
}
```

Checked on every context render and on `StorageEvent` receipt. Expired locks are cleared from storage silently.

---

## Integration Points

| Package | Integration Detail |
|---|---|
| `@hbc/bic-next-move` | `HbcBicBadge` reads `useComplexity()` for variant; `forceVariant` overrides (SF02-D05) |
| `@hbc/sharepoint-docs` | `HbcDocumentAttachment` gates SharePoint path + migration status to Standard+/Expert |
| `@hbc/notification-intelligence` | Digest-only in Essential; full priority tiers Standard; config panel Expert |
| `@hbc/ui-kit` | Retrofit: `complexityMinTier`/`complexityMaxTier` props added to 5+ components (D-08) |
| PH9b Progressive Coaching | Reads `showCoaching` boolean from `useComplexity()` (D-07) |
| SPFx Application Customizer | `ComplexityProvider` at customizer level — shared across all webparts on page |
| PWA App Root | `<ComplexityProvider>` wraps `<RouterProvider>` at app root |

---

## SPFx Placement

```typescript
// apps/spfx/src/extensions/hbcAppCustomizer/HbcAppCustomizerApplicationCustomizer.ts
import { ComplexityProvider } from '@hbc/complexity';

// In the customizer's render method:
ReactDOM.render(
  <ComplexityProvider spfxContext={this.context}>
    <AppShell />
  </ComplexityProvider>,
  this._topPlaceholder.domElement
);
```

`spfxContext` prop signals the provider to use `sessionStorage` fallback (D-01) and skip the `StorageEvent` listener (D-05).

---

## Effort Estimates

| Task File | Scope | Estimate |
|---|---|---|
| T01 Package Scaffold | Directory, config, barrel stubs | 0.25 sw |
| T02 TypeScript Contracts | All interfaces, preference shape, role map type | 0.25 sw |
| T03 Context and Provider | `ComplexityContext`, `ComplexityProvider` with full hydration flow | 0.75 sw |
| T04 Hooks | `useComplexity`, `useComplexityGate` | 0.25 sw |
| T05 Components | `HbcComplexityGate` (D-04, D-09), `HbcComplexityDial` (D-06) | 0.75 sw |
| T06 Persistence and Sync | `getStorage`, storage client, `StorageEvent`, role map loader, API client | 0.5 sw |
| T07 Retrofit Audit | Sensitivity table, 5 component retrofits, `complexityMinTier` prop additions | 0.5 sw |
| T08 Testing Strategy | Testing sub-path (D-10), unit tests, Storybook stories, Playwright E2E | 0.5 sw |
| T09 Deployment | ADR, SPFx guide, pre-deploy checklist, verification | 0.25 sw |
| **Total** | | **4.0 sprint-weeks** |

---

## Implementation Phasing

### Wave 1 — Contracts, Storage & Context (T01 + T02 + T06 + T03)
Foundation layer operational. `ComplexityProvider` hydrates from storage, derives role-based tier, syncs cross-tab. All packages that depend on `useComplexity()` can begin integration.

### Wave 2 — Hooks & Gate Component (T04 + T05)
`useComplexity`, `useComplexityGate`, `HbcComplexityGate`, and `HbcComplexityDial` operational. Module authors can begin gating fields.

### Wave 3 — Retrofit Audit (T07)
Existing `@hbc/ui-kit` components updated with default gates. `complexity-sensitivity.md` reference table published. SF01 and SF02 integration verified.

### Wave 4 — Testing, Docs & Deployment (T08 + T09)
Testing sub-path published. ≥95% coverage enforced. ADR and SPFx guide written.

---

## Definition of Done

- [ ] `ComplexityProvider` wraps PWA root and SPFx Application Customizer
- [ ] `getStorage()` correctly returns `localStorage` (PWA) or `sessionStorage` (SPFx) (D-01)
- [ ] Zero-flash rendering confirmed for returning users (cached tier loads synchronously)
- [ ] Role-derived initial tier fires exactly once per new user from config-file mapping (D-02)
- [ ] Optimistic Essential default confirmed for brand-new users — tier always upgrades (D-03)
- [ ] `useComplexity()` returns `tier`, `atLeast`, `is`, `setTier`, `showCoaching`, `setShowCoaching`
- [ ] `useComplexityGate({ minTier, maxTier })` returns correct boolean for all combinations
- [ ] `HbcComplexityGate` unmounts children by default; `keepMounted` prop preserves DOM (D-04)
- [ ] `HbcComplexityGate` CSS fade-in (150ms) on appearing content (D-09)
- [ ] `StorageEvent` listener syncs tier across tabs instantly (D-05)
- [ ] `HbcComplexityDial` header variant renders, persists, disables when locked (D-06)
- [ ] `HbcComplexityDial` settings variant renders with `showCoaching` toggle (D-07)
- [ ] Lock auto-expires at `lockedUntil`; expired locks cleared from storage (D-06)
- [ ] `showCoaching` persisted independently; auto-false on tier upgrade from Essential (D-07)
- [ ] Retrofit audit complete: `docs/reference/ui-kit/complexity-sensitivity.md` published (D-08)
- [ ] At least 5 existing `@hbc/ui-kit` components updated with `complexityMinTier` default gates (D-08)
- [ ] `@hbc/complexity/testing` sub-path exports all 4 utilities (D-10)
- [ ] Unit test coverage ≥95% on `atLeast`, `is`, gate logic, lock expiry, StorageEvent
- [ ] Storybook stories: all three tiers for `HbcComplexityGate` and `HbcComplexityDial`
- [ ] SPFx Application Customizer integration verified
- [ ] ADR `0012-complexity-dial-platform-primitive.md` written
- [ ] `pnpm turbo run build` passes with zero errors

---

## Task File Index

| File | Contents |
|---|---|
| `SF03-T01-Package-Scaffold.md` | Directory tree, `package.json`, `tsconfig.json`, `vitest.config.ts`, barrel stubs | ✅ Done 2026-03-08 |
| `SF03-T02-TypeScript-Contracts.md` | `IComplexity.ts`, `IComplexityPreference.ts`, role map types, storage schema | ✅ Done 2026-03-08 |
| `SF03-T03-Context-and-Provider.md` | `ComplexityContext.ts`, `ComplexityProvider.tsx` (full hydration flow, lock, StorageEvent) |
| `SF03-T04-Hooks.md` | `useComplexity.ts`, `useComplexityGate.ts` — full implementations |
| `SF03-T05-Components.md` | `HbcComplexityGate.tsx` (D-04, D-09), `HbcComplexityDial.tsx` (D-06, header + settings) |
| `SF03-T06-Persistence-and-Sync.md` | `getStorage.ts`, `complexityStorage.ts`, StorageEvent sync, role map loader, API client |
| `SF03-T07-Retrofit-Audit.md` | Sensitivity table, `complexityMinTier` prop pattern, 5 retrofitted components |
| `SF03-T08-Testing-Strategy.md` | `testing/` sub-path, unit tests, Storybook stories, Playwright E2E scenarios |
| `SF03-T09-Deployment.md` | Pre-deployment checklist, ADR content, SPFx guide, verification commands |
