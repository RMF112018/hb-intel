# SF02 — `@hbc/bic-next-move`: Universal Ball-In-Court & Next Move Ownership

**Plan Version:** 1.0
**Date:** 2026-03-08
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-02-Shared-Feature-BIC-Next-Move.md`
**Priority Tier:** 1 — Foundation (must exist before any domain module)
**Estimated Effort:** 3–4 sprint-weeks
**ADR Required:** `docs/architecture/adr/0011-bic-next-move-platform-primitive.md`

---

## Purpose

`@hbc/bic-next-move` is the platform-wide accountability primitive that answers the single most critical question in construction management: **"Who owns the next move on this item?"**

Every actionable item in every HB Intel module — scorecards, pursuits, permit log entries, constraints, PMP approval cycles — renders BIC ownership state through this package. It extends Procore's Ball-In-Court concept beyond its current per-tool inconsistency into a cross-platform primitive that no competitor currently provides.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Urgency tier calculation | Fixed platform defaults (`watch < 3 business days`, `immediate = overdue or due today`) with optional per-config threshold override |
| D-02 | Cross-module item registry | Runtime self-registration via `registerBicModule()` + `BIC_MODULE_MANIFEST` typed manifest + dev-mode guard for missing/mistyped registrations |
| D-03 | BIC transfer detection & notification triggering | Hybrid: hook-level diff detection on mount + explicit `recordBicTransfer()` for background transitions + deduplication guard |
| D-04 | Null / unowned state handling | `⚠️ Unassigned` amber warning badge; urgency tier forced to `immediate`; prominent callout in `HbcBicDetail` |
| D-05 | Complexity mode integration | Three distinct tiers (Essential / Standard / Expert) + optional `forceVariant` prop override per component instance |
| D-06 | `useBicMyItems` query strategy | Client-side fan-out via `Promise.allSettled` now; `BIC_AGGREGATION_MODE` feature flag for future server-side aggregation; migration path documented |
| D-07 | Caching & staleness strategy | `useBicNextMove` = 60s stale; `useBicMyItems` = 3-min stale + refetch on window focus; `immediate`-tier items = 45s polling override by consumer |
| D-08 | Ownership transfer history depth | Optional `resolveTransferHistory?: (item: T) => IBicTransfer[]` in config; Expert mode renders collapsible history; absent resolver silently omits section |
| D-09 | Cross-module navigation in blocked banner | Router-agnostic `onNavigate?: (href: string) => void` callback; plain `<a>` fallback when absent; dev-mode warning for missing `onNavigate` in PWA context |
| D-10 | Testing fixtures & module author support | `@hbc/bic-next-move/testing` sub-path exports `MockBicItem`, `createMockBicConfig()`, `mockBicStates`, `createMockBicOwner()`; zero production bundle impact |

---

## Package Directory Structure

```
packages/bic-next-move/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                          # Main barrel export
│   ├── types/
│   │   ├── IBicNextMove.ts               # IBicNextMoveConfig<T>, IBicOwner, IBicNextMoveState, IBicTransfer
│   │   └── index.ts
│   ├── constants/
│   │   ├── urgencyThresholds.ts          # D-01: default watch/immediate thresholds
│   │   └── manifest.ts                   # D-02: BIC_MODULE_MANIFEST + BIC_AGGREGATION_MODE
│   ├── registry/
│   │   ├── BicModuleRegistry.ts          # D-02: registerBicModule(), getRegistry()
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useBicNextMove.ts             # D-01, D-03, D-07: resolves IBicNextMoveState
│   │   ├── useBicMyItems.ts              # D-06, D-07: cross-module feed aggregation
│   │   └── index.ts
│   ├── transfer/
│   │   ├── recordBicTransfer.ts          # D-03: explicit transfer registration
│   │   ├── TransferDeduplicator.ts       # D-03: deduplication guard
│   │   └── index.ts
│   └── components/
│       ├── HbcBicBadge.tsx               # D-04, D-05: compact list row badge
│       ├── HbcBicDetail.tsx              # D-05, D-08, D-09: full ownership trail
│       ├── HbcBicBlockedBanner.tsx       # D-04, D-09: blocked state banner
│       └── index.ts
├── testing/
│   ├── index.ts                          # D-10: testing sub-path barrel
│   ├── MockBicItem.ts
│   ├── createMockBicConfig.ts
│   ├── mockBicStates.ts
│   └── createMockBicOwner.ts
└── src/__tests__/
    ├── setup.ts
    ├── useBicNextMove.test.ts
    ├── useBicMyItems.test.ts
    ├── BicModuleRegistry.test.ts
    ├── TransferDeduplicator.test.ts
    ├── HbcBicBadge.test.tsx
    ├── HbcBicDetail.test.tsx
    └── HbcBicBlockedBanner.test.tsx
```

---

## Complexity Mode Rendering Matrix (D-05)

| Component | Essential | Standard | Expert |
|---|---|---|---|
| `HbcBicBadge` | Avatar + name only | Avatar + name + urgency dot | Avatar + name + urgency dot + action text (truncated 40 chars) |
| `HbcBicDetail` | Current owner + expected action | + due date + blocked banner if blocked | + previous owner + next owner + escalation owner + collapsible transfer history (D-08) |
| `HbcBicBlockedBanner` | Reason text only | Reason text + blocked-by link (D-09) | Reason text + blocked-by link + escalation path |

`forceVariant` overrides the user's global complexity setting for the specific instance. Required for: SPFx narrow column contexts (pin to `essential`), My Work Feed rows (pin to `standard`).

---

## Urgency Tier Thresholds (D-01)

| Tier | Default Rule | Override Field in Config |
|---|---|---|
| `upcoming` | Due date > 3 business days away | `upcomingThresholdDays?: number` |
| `watch` | Due date ≤ 3 business days away | `watchThresholdDays?: number` |
| `immediate` | Overdue OR due today | Not overridable (always applies) |
| `immediate` | `currentOwner === null` (D-04) | Not overridable |

---

## Module Registration Contract (D-02)

```typescript
// Every domain module calls this at bootstrap
registerBicModule({
  key: 'bd-scorecard',                        // Must appear in BIC_MODULE_MANIFEST
  queryFn: async (userId: string) => IBicRegisteredItem[],
  label: 'Go/No-Go Scorecards',              // Human label for dev-mode warnings
});
```

`BIC_MODULE_MANIFEST` lists all expected module keys. In non-production builds, the registry emits console warnings for:
- Keys registered that are not in the manifest (typo detection)
- Manifest keys that never register within 5 seconds of app bootstrap (forgotten call detection)

---

## Transfer Deduplication Key (D-03)

Transfers are deduplicated on the composite key:
```
`${itemKey}::${fromUserId}::${toUserId}::${Math.floor(Date.now() / 60000)}`
```
The 60-second bucket prevents double-firing when both the hook diff and an explicit `recordBicTransfer()` call detect the same event.

---

## Integration Points

| Package | Integration Detail |
|---|---|
| My Work Feed (PH9b §A) | Consumes `useBicMyItems`; passes `refetchInterval: 45_000` for `immediate`-tier items (D-07) |
| `@hbc/notification-intelligence` | `recordBicTransfer()` calls `notificationIntelligence.registerEvent({ tier: 'immediate', ... })` |
| `@hbc/project-canvas` | Canvas widgets consume `useBicMyItems` filtered by project context |
| `@hbc/workflow-handoff` | Handoff receipt acknowledgment calls `recordBicTransfer()` explicitly (D-03) |
| `@hbc/related-items` | Related items panel renders `<HbcBicBadge forceVariant="compact" />` for each linked record |
| `@hbc/search` | BIC state (`isBlocked`, `isOverdue`, `responsibleParty`) indexed as searchable dimensions |
| `@hbc/complexity` | All three components read complexity context; `forceVariant` overrides per D-05 |

---

## SPFx Constraints

| Component | SPFx Import Rule |
|---|---|
| `HbcBicBadge` | Import from `@hbc/ui-kit/app-shell` only; `forceVariant="essential"` required in narrow column contexts |
| `HbcBicDetail` | Import from full `@hbc/ui-kit`; used in PWA and non-constrained contexts only |
| `HbcBicBlockedBanner` | `onNavigate` omitted in SPFx — plain `<a>` fallback applies (D-09) |
| `useBicNextMove` | Runs entirely client-side from cached item data; no additional API calls at render time |

---

## Effort Estimates

| Task File | Scope | Estimate |
|---|---|---|
| T01 Package Scaffold | Directory, config, barrel stubs | 0.25 sw |
| T02 TypeScript Contracts | All interfaces, constants, manifest | 0.5 sw |
| T03 Module Registry | `registerBicModule`, manifest guard, `useBicMyItems` registry layer | 0.75 sw |
| T04 Hooks | `useBicNextMove`, `useBicMyItems` with full caching/staleness logic | 1.0 sw |
| T05 Components | `HbcBicBadge`, `HbcBicDetail`, `HbcBicBlockedBanner` with all complexity tiers | 1.25 sw |
| T06 Transfer Detection | `recordBicTransfer`, deduplicator, notification-intelligence wiring | 0.5 sw |
| T07 Testing Strategy | Unit tests, testing sub-path, Storybook stories, Playwright E2E | 0.75 sw |
| T08 Deployment | ADR, migration docs, pre-deploy checklist, verification | 0.25 sw |
| **Total** | | **5.25 sprint-weeks** |

> Note: Spec estimated 3–4 sprint-weeks. The additional sprint-week accounts for the D-02 manifest guard, D-03 deduplicator, D-05 three-tier complexity rendering, and D-10 testing sub-path — all decisions made during the interview that add meaningful implementation scope beyond the original estimate.

---

## Implementation Phasing

### Wave 1 — Contracts & Registry (T01 + T02 + T03)
Foundation layer. All types locked, registry operational, manifest guard active. No UI yet. Other packages can begin writing their `registerBicModule()` calls against the stable contract.

### Wave 2 — Hooks (T04)
`useBicNextMove` and `useBicMyItems` operational with full caching and staleness logic. Transfer diff detection active. My Work Feed integration unblocked.

### Wave 3 — Components (T05 + T06)
All three components rendered across all complexity tiers. Transfer detection and notification-intelligence wiring complete. SPFx-ready.

### Wave 4 — Testing, Docs & Deployment (T07 + T08)
Testing sub-path published. ≥95% coverage enforced. ADR and migration docs written. Storybook stories in all states.

---

## Definition of Done

- [ ] `IBicNextMoveConfig<T>` contract defined and exported with all 8 resolver functions + optional `resolveTransferHistory` (D-08) + optional urgency threshold overrides (D-01)
- [ ] `IBicTransfer` interface defined and exported
- [ ] `BIC_MODULE_MANIFEST` typed manifest defined (D-02)
- [ ] `registerBicModule()` operational with dev-mode manifest guard (D-02)
- [ ] `useBicNextMove` resolves full `IBicNextMoveState` including urgency tier, overdue, blocked, unassigned (D-01, D-04)
- [ ] `useBicNextMove` performs hook-level diff detection and fires `recordBicTransfer()` on ownership change (D-03)
- [ ] `recordBicTransfer()` deduplicates on 60-second bucket key (D-03)
- [ ] `recordBicTransfer()` registers `Immediate`-tier event with `@hbc/notification-intelligence` (D-03)
- [ ] `useBicMyItems` fan-out via `Promise.allSettled` with partial-results on module failure (D-06)
- [ ] `BIC_AGGREGATION_MODE` feature flag present and documented (D-06)
- [ ] Staleness strategy: 60s / 3-min / 45s consumer polling applied correctly (D-07)
- [ ] `HbcBicBadge` renders Essential / Standard / Expert tiers; `forceVariant` overrides (D-05)
- [ ] `HbcBicBadge` renders `⚠️ Unassigned` amber state for null owner (D-04)
- [ ] `HbcBicDetail` renders full ownership trail with `showChain`; collapsible transfer history in Expert when resolver present (D-08)
- [ ] `HbcBicBlockedBanner` uses `onNavigate` callback; plain anchor fallback; dev-mode warning (D-09)
- [ ] `@hbc/bic-next-move/testing` sub-path exports all 4 testing utilities (D-10)
- [ ] Unit test coverage ≥95% on all resolver functions and hooks
- [ ] Storybook stories for all three components in: `upcoming`, `watch`, `immediate`, `overdue`, `blocked`, `unassigned`, `with-full-chain` states
- [ ] `docs/how-to/developer/bic-server-aggregation-migration.md` written (D-06)
- [ ] ADR `0011-bic-next-move-platform-primitive.md` written
- [ ] `pnpm turbo run build` passes with zero errors

---

## Task File Index

| File | Contents |
|---|---|
| `SF02-T01-Package-Scaffold.md` | Directory tree, `package.json`, `tsconfig.json`, `vitest.config.ts`, turbo registration, barrel stubs |
| `SF02-T02-TypeScript-Contracts.md` | All interfaces, `IBicTransfer`, urgency threshold constants, `BIC_MODULE_MANIFEST`, `BIC_AGGREGATION_MODE` |
| `SF02-T03-Module-Registry.md` | `BicModuleRegistry.ts`, `registerBicModule()`, manifest guard implementation, `useBicMyItems` registry layer |
| `SF02-T04-Hooks.md` | `useBicNextMove.ts` (full), `useBicMyItems.ts` (full), staleness config, fan-out merge logic |
| `SF02-T05-Components.md` | `HbcBicBadge.tsx`, `HbcBicDetail.tsx`, `HbcBicBlockedBanner.tsx` — all complexity tiers, all states |
| `SF02-T06-Transfer-Detection.md` | `recordBicTransfer.ts`, `TransferDeduplicator.ts`, notification-intelligence wiring |
| `SF02-T07-Testing-Strategy.md` | `testing/` sub-path exports, unit tests, Storybook stories, Playwright E2E scenarios |
| `SF02-T08-Deployment.md` | Pre-deployment checklist, ADR content, migration guide, verification commands |

<!-- IMPLEMENTATION PROGRESS & NOTES
SF02-T01 Package Scaffold: COMPLETE — 2026-03-08
  33 files created, all verifications passed (pnpm ls, typecheck, build, test)
SF02-T02 TypeScript Contracts: COMPLETE — 2026-03-08
  Populated IBicNextMove.ts (all interfaces/types), urgencyThresholds.ts (constants + helpers), manifest.ts (manifest + feature flags)
  Added vite-env.d.ts for import.meta.env support
  Verifications passed: typecheck (zero errors), build (dist/ with .d.ts)
SF02-T03 Module Registry: COMPLETE — 2026-03-08
  Populated BicModuleRegistry.ts — registerBicModule(), getRegistry(), getModuleRegistration(),
  _clearRegistryForTests(), dev-mode manifest guard (D-02), executeBicFanOut (D-06),
  executeServerAggregation stub (D-06). Barrel export already correct from T01.
  Verifications passed: typecheck (zero errors), build (dist/ with .d.ts)
SF02-T04 Hooks: COMPLETE — 2026-03-08
  Populated useBicNextMove.ts — resolveFullBicState (pure) + useBicNextMove hook (D-01, D-03, D-04, D-07)
  Populated useBicMyItems.ts — fan-out via BIC_AGGREGATION_MODE (D-06), 3-min stale + refetch (D-07)
  Updated hooks/index.ts barrel with explicit resolveFullBicState re-export
  Created recordBicTransfer.ts minimal typed stub for T04 compilation (full impl in T06)
  Verifications passed: typecheck (zero errors), build (dist/ with .d.ts)
Next: SF02-T05 Components
-->
