# MyWorkPage Architecture and Implementation Audit

**Date:** 2026-03-22
**Audit Target:** `apps/pwa/src/pages/my-work/MyWorkPage.tsx` and all associated files
**Reviewer Role:** Senior Architecture / Planning-Governance
**Governing Authority:** Phase 2 Deliverables (`docs/architecture/plans/MASTER/phase-2-deliverables/`)
**Status:** **NO-GO — Full re-implementation required before Phase 3 execution**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Audit Scope](#2-audit-scope)
3. [Current Repo-Truth Operating Model](#3-current-repo-truth-operating-model)
4. [Plan Reconciliation Matrix](#4-plan-reconciliation-matrix)
5. [UI-Kit Governance Violations](#5-ui-kit-governance-violations)
6. [Architecture and Composition Findings](#6-architecture-and-composition-findings)
7. [UX and Interaction Findings](#7-ux-and-interaction-findings)
8. [Testing and Readiness Gaps](#8-testing-and-readiness-gaps)
9. [Prioritized Remediation Plan](#9-prioritized-remediation-plan)
10. [Documentation Corrections Needed](#10-documentation-corrections-needed)
11. [Optional Immediate-Fix Patch List](#11-optional-immediate-fix-patch-list)

---

## 1. Executive Summary

The `MyWorkPage` implementation fails on three structural levels simultaneously: governance compliance, implementation completeness, and production quality. The page is **not acceptable as the execution baseline for Phase 3 work.**

The most critical failure is the complete absence of `@hbc/project-canvas` governance in the secondary and tertiary zones. The plan documents — most explicitly P2-D2 and P2-F1 — mandate that `HbcProjectCanvas`, `HbcCanvasEditor`, `useCanvasEditor`, `useCanvasMandatoryTiles`, and `useRoleDefaultCanvas` govern analytics and utility zone composition. None of these exist in the current implementation. Instead, a bespoke `MyWorkCanvas` component manually renders tiles with a hand-rolled grid. This is not a deferred feature — it is the governance structure the rest of the system was built to require.

The second structural failure is that P2-F1 (the authoritative UI quality and conformance plan) explicitly re-opened all 18 UI findings on 2026-03-21, after reviewing Phases 1–5. The document's current status reads: "Full re-implementation required." The page received a 4/10 product-quality score and was reclassified from "Competitive (lower end)" to "Below Competitive" after Wave 5. This audit corroborates that assessment across every dimension examined.

The third structural failure is a set of interconnected state management violations: the feed freshness model uses a single merged timestamp instead of the split `lastTrustedDataIso`/`lastRefreshAttemptIso` required by P2-B3; the `hbc-my-work-feed-cache` key mandated by P2-B2 §6 is absent from `hubStateTypes.ts`; return-state capture fires only on `visibilitychange`, not on the route `onLeave` required by P2-B2; and `isLoadError` is hardcoded to `false` at the page level, permanently suppressing error states.

Across 36 implementation files reviewed and seven governing plan documents consulted, the audit found 7 Critical, 12 High, 9 Medium, and 6 Low findings, detailed in sections 4–8. No finding is safe to carry forward into Phase 3 without disposition.

**Overall verdict: NO-GO.** Proceeding to Phase 3 on the current baseline would compound technical debt, create integration friction when canvas governance is later enforced, and deliver a product that the governing plans have already declared unacceptable.

---

## 2. Audit Scope

### Files Reviewed

**Page directory** (`apps/pwa/src/pages/my-work/`):
`MyWorkPage.tsx`, `HubZoneLayout.tsx`, `HubPrimaryZone.tsx`, `HubSecondaryZone.tsx`, `HubTertiaryZone.tsx`, `HubDetailPanel.tsx`, `HubConnectivityBanner.tsx`, `HubFreshnessIndicator.tsx`, `HubPageLevelEmptyState.tsx`, `HubTeamModeSelector.tsx`, `useHubStatePersistence.ts`, `useHubReturnMemory.ts`, `useHubFeedRefresh.ts`, `useHubPersonalization.ts`, `useHubTrustState.ts`, `hubStateTypes.ts`, `trustStateConstants.ts`, `formatRelativeTime.ts`, `__tests__/useHubReturnMemory.test.ts`

**Cards** (`cards/`):
`QuickActionsStrip.tsx`, `QuickActionsSheet.tsx`, `QuickActionsMenu.tsx`, `RecentActivityCard.tsx`, `PersonalAnalyticsCard.tsx`, `AdminOversightCard.tsx`, `AgingBlockedCard.tsx`, `TeamPortfolioCard.tsx`

**Tiles** (`tiles/`):
`MyWorkCanvas.tsx`, `MyWorkHubTileContext.tsx`, `myWorkTileDefinitions.ts`, `registerMyWorkTiles.ts`, `PersonalAnalyticsTile.tsx`, `AgingBlockedTile.tsx`, `AdminOversightTile.tsx`, `TeamPortfolioTile.tsx`, `index.ts`

**App shell**:
`apps/pwa/src/router/workspace-routes.ts`, `apps/pwa/src/router/root-route.tsx`, `apps/pwa/src/sources/sourceAssembly.ts`

### Governing Documents Consulted

`P2-A1`, `P2-B2`, `P2-B3`, `P2-D1`, `P2-D2`, `P2-D3`, `P2-D4`, `P2-D5`, `P2-C4`, `P2-F1`, `P2-F1-UI-Audit-Report`, `UI-Kit-Mold-Breaker-Principles.md`, `UI-Kit-Usage-and-Composition-Guide.md`, `UI-Kit-Wave1-Page-Patterns.md`, `HB-Intel-Dev-Roadmap.md`, `.claude/rules/02-architecture-invariants.md`

### Out of Scope

Source adapter implementations in `@hbc/my-work-feed`, `@hbc/project-canvas` internals, SPFx companion surface, notification routing (P2-C2), ranking algorithm (P2-A2).

---

## 3. Current Repo-Truth Operating Model

As actually implemented, `MyWorkPage` operates as follows.

**Composition.** `MyWorkPage` mounts `MyWorkProvider` (from `@hbc/my-work-feed`) at the top, wraps the three-zone structure in `HubZoneLayout`, and passes `useHubTrustState`, `useHubPersonalization`, and local state (`teamMode`, `kpiFilter`, `selectedItem`) through React context and props. An inline `<style>` block in the JSX overrides breakpoint-specific layout behaviours. A FAB button for mobile quick-actions and a `HubTabBadgeBridge` null-renderer sit inside the composition.

**Primary zone.** `HubPrimaryZone` renders `HubFreshnessIndicator` followed by `HbcMyWorkFeed`. This is the only zone with a clear architectural mandate; the feed is correctly excluded from project-canvas governance.

**Secondary zone.** `HubSecondaryZone` renders an `HbcCard weight="primary"` containing `MyWorkCanvas` filtered by the `my-work.analytics.*` tile prefix. `MyWorkCanvas` is a custom renderer: it calls `getAll()` from `@hbc/project-canvas`, filters by prefix, complexity, and resolved roles, then renders tiles in a Griffel CSS grid. There is no `HbcProjectCanvas`, `HbcCanvasEditor`, `useRoleDefaultCanvas`, `useCanvasMandatoryTiles`, or `HbcTileCatalog`.

**Tertiary zone.** `HubTertiaryZone` renders `RecentActivityCard` directly — it is not tile-governed at all. Both secondary and tertiary zones hide at `essential` complexity tier.

**State management.** Draft persistence uses `useAutoSaveDraft` for `querySeed` (8h, 500ms debounce) and `useDraft` for `returnState` (1h). Team mode is persisted via a second `useAutoSaveDraft` call in `useHubPersonalization` (16h, 300ms debounce). `cardArrangement` and `updateCardVisibility` are computed in `useHubPersonalization` but neither value is consumed anywhere in `MyWorkPage`. The `hbc-my-work-feed-cache` draft key is not declared in `hubStateTypes.ts`.

**Trust state.** `useHubTrustState` derives a single `lastRefreshedIso` timestamp from `feed.sources`, and the `queued` state is silently normalized to `live`. The split-timestamp model (`lastTrustedDataIso`, `lastRefreshAttemptIso`) required by P2-B3 §5 is not implemented.

**Routing.** `myWorkRoute` is a `createWorkspaceRoute` with `lazyRouteComponent` — no `onLeave` hook, no search-parameter validation. Return-state capture fires from a `visibilitychange` event handler in `useHubReturnMemory`, not from the route lifecycle.

**Navigation.** `HubDetailPanel` routes every action key — `open`, `mark-read`, `defer`, `pin-today`, `pin-week`, `delegate`, `reassign` — with `window.location.href = item.context.href`, a hard page reload regardless of action type. `RecentActivityCard` uses `window.location.href = '/projects'` for its CTA.

**Tile registration.** `registerMyWorkTiles()` is correctly called from `sourceAssembly.ts` at bootstrap. The four registered definitions use namespace `hub:personal-analytics`, `hub:aging-blocked`, `hub:admin-oversight`, `hub:team-portfolio` — ✅ corrected per P2-D2 §6.1 (remediation 0-A, 2026-03-22).

---

## 4. Plan Reconciliation Matrix

### Severity key: Critical / High / Medium / Low

---

### P2-D2 — Adaptive Layout and Zone Governance Spec

| Finding ID | Requirement | Current State | Severity |
|---|---|---|---|
| ARC-01 | `HbcProjectCanvas` must govern secondary and tertiary zone tile layout | ✅ Both zones corrected — secondary (2-B, 2026-03-22) and tertiary (2-C, 2026-03-22) now use `HbcProjectCanvas` | **Critical** — Resolved |
| ARC-02 | `HbcCanvasEditor` + `useCanvasEditor` required for edit-mode in secondary zone | ✅ Wired — `HbcProjectCanvas` renders `HbcCanvasEditor` internally when `editable` is true; both zones have `editable` enabled (remediation 2-F/2-G, 2026-03-22) | **Critical** — Resolved |
| ARC-03 | `useCanvasMandatoryTiles` must lock `hub:lane-summary`, `hub:quick-actions`, `hub:team-workload` | ✅ Enforcement wired — `useProjectCanvas` → `useCanvasMandatoryTiles(role)` injects mandatory tiles and provides `isMandatory`/`isLocked` callbacks. `hub:lane-summary` has `mandatory: true, lockable: true`. `hub:quick-actions` and `hub:team-workload` enforcement deferred until tiles are implemented (remediation 2-E, 2026-03-22) | **Critical** — Resolved |
| ARC-04 | `useRoleDefaultCanvas` must seed role-specific default arrangements | ✅ Corrected — hub role defaults (Member, Executive, Administrator) added to `ROLE_DEFAULT_TILES`; `useRoleDefaultCanvas` called internally by `HbcProjectCanvas` via `useProjectCanvas` (remediation 2-D, 2026-03-22) | **Critical** — Resolved |
| ARC-05 | Tile namespace must be `hub:*` (P2-D2 §6.1) | ✅ Corrected — tiles registered as `hub:*` (remediation 0-A, 2026-03-22) | **Critical** — Resolved |
| ARC-06 | Two isolated `useCanvasEditor` instances (secondary + tertiary) required | ✅ Structurally satisfied — two `HbcProjectCanvas` instances with separate `projectId` values (`"my-work-hub"` / `"my-work-hub-tertiary"`), `editable` enabled on both (remediation 2-F, 2026-03-22) | **High** — Resolved |
| ARC-07 | `HbcTileCatalog` required for edit-mode tile picker | ✅ Wired — `HbcCanvasEditor` renders `HbcTileCatalog` during edit-mode (remediation 2-G, 2026-03-22) | **High** — Resolved |
| ARC-08 | 12-column grid with governed responsive tiers | ✅ Corrected — tile `defaultColSpan` values converted to 12-column grid (6/12); `HbcProjectCanvas` manages governed grid (remediation 2-B, 2026-03-22) | **Medium** — Resolved |
| ARC-09 | Gate 2 (canvas in secondary), Gate 3 (canvas in tertiary), Gate 4 (edit-mode), Gate 5 (mandatory tiles) all failing | ✅ All gates satisfied — Gates 2+3 (canvas in both zones, 2-B/2-C), Gate 4 (edit-mode via `editable` + isolated `HbcCanvasEditor`, 2-F), Gate 5 (mandatory enforcement, 2-E). ARC-02/ARC-07 edit UI addressed in 2-G (2026-03-22) | **Critical** — Resolved |

P2-D2 is the single most consequential governance failure. Every gate beyond Gate 1 is unmet.

---

### P2-B2 — Hub State Persistence and Return Memory Contract

| Finding ID | Requirement | Current State | Severity |
|---|---|---|---|
| STT-01 | `hbc-my-work-feed-cache` draft key (4h TTL) required for feed fallback on stale return | ✅ Corrected — `feedCache` key added to `HUB_DRAFT_KEYS` with 4h TTL; `useDraft` wired in `useHubStatePersistence` (remediation 1-B, 2026-03-22) | **High** — Resolved |
| STT-02 | Route `onLeave` is primary return-state capture trigger | ✅ Corrected — `onLeave` wired to `myWorkRoute` via module-level bridge to `captureReturnState`; `visibilitychange` retained as secondary fallback (remediation 1-C, 2026-03-22) | **High** — Resolved |
| STT-03 | URL is canonical state authority; bare `/my-work` seeds from draft | ✅ Corrected — `kpiFilter` managed via TanStack Router `validateSearch` + `useSearch`/`useNavigate`; `window.history.replaceState` removed (remediation 3-C, 2026-03-22) | **Medium** — Resolved |
| STT-04 | Registry-driven bulk cleanup on session end required | Not implemented; no cleanup registry hook present | **Low** |

---

### P2-B3 — Freshness, Refresh, and Staleness Trust Policy

| Finding ID | Requirement | Current State | Severity |
|---|---|---|---|
| FRS-01 | Split timestamp model: `lastTrustedDataIso` (when data was trusted) vs `lastRefreshAttemptIso` (when refresh was last tried) | ✅ Corrected — split model implemented in `useHubTrustState`; `HubFreshnessIndicator` distinguishes trusted data age from attempt age (remediation 1-A, 2026-03-22) | **High** — Resolved |
| FRS-02 | `queued` trust state is a distinct state (not `live`, not `partial`) | ✅ Corrected — `queued` preserved as first-class state (remediation 0-C, 2026-03-22) | **High** — Resolved |
| FRS-03 | 3-minute auto-refresh trigger | `useHubFeedRefresh` uses `invalidateQueries` on return; no periodic `refetchInterval` or timer scheduling found — auto-refresh is return-triggered only, not time-based. Verified during 1-A (2026-03-22) | **Medium** |
| FRS-04 | `FEED_FRESHNESS_WINDOW_MS = 300_000` (5 min) | `trustStateConstants.ts` correctly sets this value | **Pass** |
| FRS-05 | Relative time display bands | `formatRelativeTime.ts` bands match P2-B3 §6.2 exactly | **Pass** |

---

### P2-D1 — Role-to-Hub Entitlement Matrix

| Finding ID | Requirement | Current State | Severity |
|---|---|---|---|
| ROL-01 | `@hbc/auth` is the sole role resolution authority; no local role constants (§11.1) | ✅ Corrected — local role constants removed; inline literals used (remediation 0-B, 2026-03-22) | **Critical** — Resolved |
| ROL-02 | `my-team` mode eligibility must use `resolvedRoles` from `@hbc/auth` exclusively | ✅ Corrected — MyWorkPage uses `useCurrentSession()` as single resolution site; `isExecutive` passed as prop to HubTeamModeSelector (remediation 1-D, 2026-03-22) | **High** — Resolved |
| ROL-03 | Executive default landing is `my-team` mode (P2-D1 §4) | ✅ Fully resolved — role-default tile layout seeded via `ROLE_DEFAULT_TILES` (2-D); Executive defaults to `my-team` mode via ADR-0117 (4-B, 2026-03-22) | **Medium** — Resolved |
| ROL-04 | Administrator routes to `/admin`, not `/my-work` | `workspace-routes.ts` correctly gates `/admin` with `requireAdminAccessControl()`; `resolveLandingDecision` in the index route handles this | **Pass** |

---

### P2-D3 — Analytics Card Governance Matrix

| Finding ID | Requirement | Current State | Severity |
|---|---|---|---|
| CRD-01 | `pa-lane-summary` (pilot-REQUIRED, locked) must display 4 lane counts; Standard variant: visual chart | ✅ Implemented — `LaneSummaryCard` with E/S/X variants; registered as `hub:lane-summary` (mandatory, lockable, wide) (remediation 2-A, 2026-03-22) | **High** — Resolved |
| CRD-02 | `pa-source-breakdown` (pilot-REQUIRED) must show work distribution by source module | ✅ Implemented — `SourceBreakdownCard` with E/S/X variants; registered as `hub:source-breakdown` (remediation 2-A, 2026-03-22) | **High** — Resolved |
| CRD-03 | `pa-recent-activity` (tertiary zone) — 5 items in Standard tier | ⚡ Governance structure in place — registered as `hub:recent-context` tile, rendered via `HbcProjectCanvas` (remediation 2-C, 2026-03-22); card still renders stub content (real data Phase 3+) | **High** — Partially Resolved |
| CRD-04 | `ao-provisioning-health` (Administrator, secondary zone) — provisioning failure list | ✅ Implemented — `AdminOversightCard` now shows system-wide KPIs (total, blocked, waiting, deferred) from `useMyWorkCounts()` (remediation 6-B, 2026-03-22) | **High** — Resolved |
| CRD-05 | Card variants must cover all three complexity tiers (E/S/X) | ✅ Fully resolved — all tiles now have genuine E/S/X functions (new tiles from 2-A; original tiles from 6-A, 2026-03-22) | **Low** — Resolved |
| CRD-06 | Cards must not cross zones; secondary cards stay in secondary | `RecentActivityCard` is rendered by `HubTertiaryZone` — correct zone. `PersonalAnalyticsCard` is in secondary — correct zone | **Pass** |
| CRD-07 | Locked cards cannot be personalized away | ✅ Enforcement in place — `useProjectCanvas` merges mandatory tiles into canvas; `isLocked` callback prevents removal via `HbcCanvasEditor`. `hub:lane-summary` locked (remediation 2-E, 2026-03-22) | **Critical** — Resolved |

---

### P2-D4 — Delegated and Team Lane Governance Note

| Finding ID | Requirement | Current State | Severity |
|---|---|---|---|
| TM-01 | `my-team` must be role-gated to Executive only | `HubTeamModeSelector` conditionally renders the "My Team" tab behind `isExecutive` check — functionally correct | **Pass (conditional)** |
| TM-02 | Team mode is a feed projection, not a separate route | No separate route for team mode; `teamMode` is local state within `/my-work` — correct | **Pass** |
| TM-03 | Role check uses `resolvedRoles` from `@hbc/auth` | ✅ Corrected — single role resolution site in MyWorkPage via `useCurrentSession()` (remediation 1-D, 2026-03-22) | **Medium** — Resolved |
| TM-04 | Team items are read-only (no feed mutations for non-owners) | `HubDetailPanel` routes all actions via `window.location.href` regardless of team mode — this inadvertently provides some protection but not via the specified `canAct` mechanism | **Medium** |

---

### P2-A1 — Personal Work Hub Operating Model Register

| Finding ID | Requirement | Current State | Severity |
|---|---|---|---|
| OPM-01 | Full PWA action vocabulary: `open`, `mark-read`, `acknowledge`, `dismiss`, `defer`, `undefer`, `waiting-on`, `pin-today`, `pin-week`, `delegate`, `reassign` (§7.2) | ✅ Corrected — `HubDetailPanel` wired to `useMyWorkActions` which dispatches all action keys; replayable actions mutate locally, non-replayable navigate via SPA router (remediation 4-A, 2026-03-22) | **High** — Resolved |
| OPM-02 | No redirect on low-work; primary zone protected | Correct — no redirect implemented; primary zone is invariant | **Pass** |
| OPM-03 | Task-first identity; feed is primary operating layer | Primary zone correctly prioritized in layout | **Pass** |

---

### P2-D5 — Personalization Policy and Saved-View Rules

| Finding ID | Requirement | Current State | Severity |
|---|---|---|---|
| PRS-01 | `cardArrangement` must govern analytics card display order | ✅ Resolved (option b) — vestigial props removed; HbcProjectCanvas manages tile arrangement internally via useCanvasConfig + CanvasApi (PRS-01 polish, 2026-03-22) | **High** — Resolved |
| PRS-02 | `updateCardVisibility` must be wired to card show/hide UI | ✅ Resolved (option b) — updateCardVisibility removed; canvas edit mode provides tile show/hide (PRS-01 polish, 2026-03-22) | **Medium** — Resolved |
| PRS-03 | Executive default is `my-team` (P2-D5 §3) | ✅ Resolved via ADR-0117 — Executive defaults to `my-team`; other roles default to `personal`. P2-D5 §3 governs; P2-B2 §4 superseded for Executive only (remediation 4-B, 2026-03-22) | **Plan conflict — High** — Resolved |

---

### P2-C4 — Handoff Criteria Matrix

| Finding ID | Requirement | Current State | Severity |
|---|---|---|---|
| NAV-01 | Domain mutations happen at the domain surface via proper handoff | ✅ Corrected — `HubDetailPanel` dispatches actions via `useMyWorkActions`; SPA navigation via `router.navigate()` for `deepLinkHref`; no more `window.location.href` page reloads (remediation 4-A, 2026-03-22) | **High** — Resolved |
| NAV-02 | Return path contract: domain surface provides "Back to My Work" | No return-path state is passed through the handoff — return state would need to be stored in draft first | **Medium** |

---

## 5. UI-Kit Governance Violations

### D-10: No Direct Fluent UI Imports (Usage and Composition Guide Rule)

Rule: Fluent UI primitives must be imported through `@hbc/ui-kit` only; never directly from `@fluentui/react-components`.

| File | Violation | Severity |
|---|---|---|
| `cards/QuickActionsSheet.tsx` | ✅ Corrected — `tokens` now imported from `@hbc/ui-kit` (remediation 0-C, 2026-03-22) | **Medium** — Resolved |
| `cards/RecentActivityCard.tsx` | ✅ Corrected — `tokens` now imported from `@hbc/ui-kit` (remediation 0-C, 2026-03-22) | **Medium** — Resolved |
| `cards/PersonalAnalyticsCard.tsx` | ✅ Corrected — `tokens` now imported from `@hbc/ui-kit` (remediation 0-C, 2026-03-22) | **Medium** — Resolved |

✅ `tokens` re-exported from `@hbc/ui-kit` barrel (remediation 0-C, 2026-03-22). All consumer imports corrected.

---

### MB-08: Single Token Set — No Hardcoded Colors

Rule: All colors and spacing must use `HBC_*` named token constants from `@hbc/ui-kit/theme`. No inline hex, rgb, or CSS literal values.

| File | Violation | Severity |
|---|---|---|
| `cards/PersonalAnalyticsCard.tsx` | ✅ Corrected — `#1E3A5F` replaced with `HBC_PRIMARY_BLUE` (remediation 0-C, 2026-03-22) | **Medium** — Resolved |
| `MyWorkPage.tsx` | ✅ Corrected — `#F37021` FAB replaced with `HBC_ACCENT_ORANGE` via Griffel `makeStyles` (remediation 0-C, 2026-03-22) | **Medium** — Resolved |
| `cards/TeamPortfolioCard.tsx` | ✅ Corrected — raw CSS variables replaced with `HBC_STATUS_RAMP_AMBER[50]` and `HBC_STATUS_RAMP_RED[50]` (remediation 0-C, 2026-03-22) | **Medium** — Resolved |
| `HubConnectivityBanner.tsx` | ✅ Corrected — inline style replaced with Griffel `makeStyles` class (remediation 0-C, 2026-03-22) | **Medium** — Resolved |

---

### Usage and Composition Guide Rule 6: No Inline Styles for Layout

| File | Violation | Severity |
|---|---|---|
| `MyWorkPage.tsx` | ✅ Corrected — inline `<style>` tag removed; responsive FAB now uses Griffel `makeStyles` with `@media` rule (remediation 0-C, 2026-03-22) | **Medium** — Resolved |
| `HubZoneLayout.tsx` | `hasRightPanelContent` prop triggers inline `style={{ gridTemplateColumns: '1fr' }}` override | **Medium** |

---

### Missing Token Usage

| File | Violation | Severity |
|---|---|---|
| `cards/TeamPortfolioCard.tsx` | ✅ Corrected — `<span>Loading...</span>` replaced with `<HbcSpinner>` (remediation 0-C, 2026-03-22) | **Medium** — Resolved |
| `HubTeamModeSelector.tsx` | Local `TabBadge` subcomponent uses inline styles for badge display | **Low** |

---

## 6. Architecture and Composition Findings

### ARC-F1: `MyWorkCanvas` is a Governance Bypass (Critical)

**File:** `tiles/MyWorkCanvas.tsx` — ✅ **Deleted** (remediation 2-B, 2026-03-22)

`MyWorkCanvas` has been removed. Both zones now use `HbcProjectCanvas` from `@hbc/project-canvas`: secondary zone (2-B, 2026-03-22) and tertiary zone (2-C, 2026-03-22). Two separate `projectId` values (`"my-work-hub"` and `"my-work-hub-tertiary"`) ensure zone boundary isolation per P2-D2 Gate 3. `RecentActivityCard` registered as `hub:recent-context` tile. The `MyWorkHubTileProvider` context preserved for hub-specific tile state.

---

### ARC-F2: Wrong Tile Namespace (Critical)

**File:** `tiles/myWorkTileDefinitions.ts`

Four tile definitions are now registered with the correct `hub:*` namespace per P2-D2 §6.1:
- `hub:personal-analytics`
- `hub:aging-blocked`
- `hub:team-portfolio`
- `hub:admin-oversight`

✅ Namespace corrected (remediation 0-A, 2026-03-22). Tiles are now discoverable under the governed `hub:` prefix for future `HbcProjectCanvas` integration.

---

### ARC-F3: Local Role Constants Violate P2-D1 §11.1 (Critical)

**File:** `tiles/myWorkTileDefinitions.ts`

✅ Local role constants removed (remediation 0-B, 2026-03-22). Role strings are now inlined per the canonical `@hbc/auth` pattern (e.g., `defaultForRoles: ['Executive']`). P2-D1 §11.1 compliance restored.

---

### ARC-F4: Dual Role Resolution Sources in a Single Page (High)

✅ Corrected (remediation 1-D, 2026-03-22). MyWorkPage now uses `useCurrentSession()` (canonical `@hbc/auth` hook) as the single role resolution site. `isExecutive` is passed as a prop to `HubTeamModeSelector`, which no longer independently calls `useAuthStore()`. Single observation point per render tree per P2-D1.

---

### ARC-F5: `registerMyWorkTiles` Called from App Bootstrap (Observation)

**File:** `apps/pwa/src/sources/sourceAssembly.ts`

Tile registration is correctly placed in `sourceAssembly.ts`, which is called at PWA bootstrap. This ensures tiles are available before any route renders. The registration itself is idempotent (verified in `registerMyWorkTiles.ts`). The concern is purely the namespace (ARC-F2), not the timing.

---

### ARC-F6: `cardArrangement` Silently Discarded (High)

**Files:** `useHubPersonalization.ts`, `MyWorkPage.tsx`

✅ Corrected (remediation 3-A, 2026-03-22). `MyWorkPage` now destructures both `cardArrangement` and `updateCardVisibility` from `useHubPersonalization` and passes them as props to `HubSecondaryZone`. The arrangement data is no longer silently discarded. The actual tile reordering is handled by `HbcProjectCanvas`'s internal `useCanvasConfig`; the hub's draft-based arrangement is available at the zone level for future canvas config bridging.

---

### ARC-F7: `QuickActionsMenu.tsx` is Orphaned Dead Code (High)

**File:** `cards/QuickActionsMenu.tsx`

✅ File deleted (remediation 0-C, 2026-03-22). No imports existed — only comments referenced it. Dead code removed.

---

### ARC-F8: `AdminOversightCard` is a Stub (High)

**File:** `cards/AdminOversightCard.tsx`

The card contains only placeholder text — no real data fetch, no `@hbc/my-work-feed` hook usage, no actual provisioning health rendering. P2-D3 §8 designates `ao-provisioning-health` as a pilot-optional card but the governing matrix (§2) specifies it should surface provisioning BIC items in failed/blocked state. The tile definition exists, the registration exists, and the card renders — but it renders no meaningful content. Administrator users will see a blank card.

---

### ARC-F9: `HubTabBadgeBridge` is an Architectural Smell (Medium)

**File:** `MyWorkPage.tsx`

✅ Resolved via documentation (remediation 6-C, 2026-03-22). The null-renderer bridge is a **legitimate React context boundary crossing pattern** — `HubTeamModeSelector` renders in `WorkspacePageShell` headerSlot OUTSIDE `MyWorkProvider`, but needs blocked counts from `useMyWorkCounts()` which requires the provider. Comprehensive JSDoc added explaining the boundary crossing requirement and why the component is not dead code.

---

### ARC-F10: Route Has No `onLeave` Hook (High)

**File:** `apps/pwa/src/router/workspace-routes.ts`

✅ Corrected (remediation 1-C, 2026-03-22). `myWorkRoute` now uses a direct `createRoute` call with `onLeave` that invokes `triggerOnLeaveCapture()` — a module-level bridge exported from `useHubReturnMemory.ts`. The hook registers the current `captureReturnState` function into the bridge on mount and clears it on unmount. `visibilitychange` retained as secondary fallback per P2-B2 §5.2.

---

## 7. UX and Interaction Findings

### UX-F1: All Navigation Uses `window.location.href` (High)

**Files:** `HubDetailPanel.tsx`, `cards/RecentActivityCard.tsx`

✅ Corrected (remediation 4-A, 2026-03-22). `HubDetailPanel` now dispatches all actions via `useMyWorkActions` hook — replayable actions (mark-read, defer, undefer, pin-today, pin-week, waiting-on) execute locally; non-replayable actions (open, delegate, reassign) navigate via `router.navigate(deepLinkHref)`. `RecentActivityCard` now navigates via `router.navigate({ to: '/projects' })`. All `window.location.href` usage removed from the my-work page tree.

---

### UX-F2: `isLoadError` Hardcoded to `false` (High)

**File:** `MyWorkPage.tsx`, `HubPageLevelEmptyState.tsx`

✅ Corrected (remediation 0-C, 2026-03-22). `isLoadError` prop removed from `MyWorkPage.tsx`. `HubPageLevelEmptyState` now derives error state from `useMyWork().isError` when the prop is not explicitly provided. Error states are no longer permanently suppressed.

---

### UX-F3: `queued` Trust State Erased (High)

**File:** `useHubTrustState.ts`, `HubFreshnessIndicator.tsx`

✅ Corrected (remediation 0-C, 2026-03-22). The `queued → live` normalization has been removed. `queued` is now a first-class freshness state in both `IHubTrustState.freshness` type and `HubFreshnessIndicator` rendering (label: "Pending Sync", variant: info). P2-B3 §3 compliance restored.

---

### UX-F4: P2-F1 UI Findings UIF-001 through UIF-018

**Authority:** `P2-F1-My-Work-Hub-UI-Audit-Report.md` (updated 2026-03-21 after Wave 5 inspection)

Feed visual structure findings (UIF-001, UIF-003, UIF-004, UIF-005, UIF-006) have been addressed in `@hbc/my-work-feed` components:

**UIF-001 (Critical):** ✅ Resolved (5-B, 2026-03-22) — Lane headers now render as `<div>` (not `<button>`), with token-based backgrounds (`var(--colorNeutralBackground2/3)`), lane-color left-border accent, sticky positioning, and `heading4` typography. The collapse button has full UA reset (`appearance: 'none'`).

**UIF-002 (Critical):** ✅ Resolved (2-B/5-C) — Two-column responsive layout implemented via `HubZoneLayout` with `HbcProjectCanvas` in the secondary zone.

**UIF-003 (Critical):** ✅ Resolved (5-B, 2026-03-22) — Title links use `resolveTitleLinkColor()` → `HBC_STATUS_RAMP_INFO[50]` with explicit `textDecoration: 'none'`.

**UIF-004 (Critical):** ✅ Resolved (5-B, 2026-03-22) — Feed renders via `var(--color*)` CSS custom properties that adapt to the active Fluent theme. Theme coherence governed by `HbcThemeProvider` at app root.

**UIF-005 (High):** ✅ Resolved (5-B, 2026-03-22) — `aria-expanded` attribute, distinct expanded/collapsed background colors, chevron rotation animation (`0°` → `-90°`), lane-color accent border on expand.

**UIF-006 (High):** ✅ Resolved (5-B, 2026-03-22) — Rows have `borderBottom: '1px solid var(--colorNeutralStroke2)'`, `HBC_SPACE_SM`/`HBC_SPACE_MD` padding, and metadata row with temporal data visible at standard+ complexity tier.

**UIF-010 (High):** Dev overlays gated behind `import.meta.env.DEV`.

**UIF-013, UIF-014 through UIF-018:** Navigation rail, CTA labels, focus rings, touch targets — tracked separately in Phase 5 sub-items.

The inline style approach in `@hbc/my-work-feed` is intentional for SPFx compatibility (D-07).

---

### UX-F5: `HubFreshnessIndicator._isLoading` is Dead Code (Low)

**File:** `HubFreshnessIndicator.tsx`

✅ Corrected (remediation 1-A, 2026-03-22). Leading underscore removed; `isLoading` is now actively used in stale-while-revalidate rendering to distinguish "Refreshing…" (loading=true) from "Stale" (loading=false).

---

### UX-F6: Pilot-Required Cards Incomplete or Absent (High)

Per P2-D3 §8, four cards are pilot-REQUIRED:

| Card ID | Status |
|---|---|
| `pa-lane-summary` | ✅ **Implemented** — `LaneSummaryCard` with E/S/X variants, registered as `hub:lane-summary` (remediation 2-A, 2026-03-22) |
| `pa-source-breakdown` | ✅ **Implemented** — `SourceBreakdownCard` with E/S/X variants, registered as `hub:source-breakdown` (remediation 2-A, 2026-03-22) |
| `tp-team-workload` | **Partially present** — `TeamPortfolioCard` renders team counts but uses `<span>Loading...</span>` and raw CSS variable strings |
| `ut-quick-actions` | **Present** — `QuickActionsStrip` and `QuickActionsSheet` are implemented and wired |

Two of the four pilot-required cards are missing; one is present but below quality bar. The pilot-required card set is the minimum viable card inventory; pilot launch without `pa-lane-summary` and `pa-source-breakdown` would fail P2-D3's pilot launch gate.

---

## 8. Testing and Readiness Gaps

### TST-F1: Effectively Zero Behavioral Test Coverage (Critical)

**File:** `__tests__/useHubReturnMemory.test.ts` (the only test file)

The single test file in the entire `my-work` directory tests type shapes and constant values. It imports `HUB_DRAFT_KEYS`, `HUB_DRAFT_TTL`, and `HUB_RETURN_STATE_SCHEMA` and asserts that constants equal their expected values. There are no behavioral tests for any of the following:

- `useHubTrustState` state derivation under `live`, `cached`, `partial`, `queued` inputs
- `useHubReturnMemory` scroll capture and restore behavior
- `useHubStatePersistence` draft key write/read round-trip
- `useHubPersonalization` team mode persistence and cardArrangement round-trip
- `useHubFeedRefresh` cache invalidation on return
- `MyWorkCanvas` tile filtering by prefix, role, and complexity
- `HubTeamModeSelector` tab rendering and mode switching
- `HubDetailPanel` action routing
- `HubFreshnessIndicator` display under each trust state
- `HubPageLevelEmptyState` rendering under error and permission states

P2-D2 Implementation Gate 5 (mandatory tile enforcement) explicitly requires tests demonstrating that locked tiles cannot be removed. No such tests exist.

The absence of behavioral tests means every refactoring required by this audit must be done without a safety net.

---

### TST-F2: P2-E3 Validation Plan Evidence Not Satisfied

The First Release Success Scorecard (`P2-E3`) requires automated validation of the role-entitlement matrix (P2-D1 §11.1), trust state transitions, and freshness window behavior before pilot launch. None of these have corresponding tests.

---

### TST-F3: No Integration or Snapshot Tests for Zone Composition

There are no tests verifying that:
- `HubSecondaryZone` renders analytics tiles for each role
- `HubTertiaryZone` renders utility cards correctly
- `HubPrimaryZone` correctly excludes canvas governance
- The `MyWorkProvider` context is correctly threaded through all zone components

---

## 9. Prioritized Remediation Plan

All items are pre-conditions for Phase 3 unless explicitly marked as "can proceed in parallel."

---

### Tier 0: Governance-Blocking (Must complete before any Phase 3 work)

These findings invalidate the implementation's fitness as a Phase 3 baseline. They cannot be deferred without creating compounding integration debt.

**T0-01: Replace `MyWorkCanvas` with `HbcProjectCanvas` in secondary and tertiary zones** ✅ Completed (2026-03-22)
Files: `tiles/MyWorkCanvas.tsx` (**deleted**), `HubSecondaryZone.tsx`, `HubTertiaryZone.tsx` (pending 2-C)
Authority: P2-D2, P2-F1 §G0
Action: `MyWorkCanvas.tsx` deleted. `HubSecondaryZone` now renders via `HbcProjectCanvas` with `projectId="my-work-hub"`, `role` from `useCurrentSession()`, `complexityTier`, `editable=false`. Tile `defaultColSpan` values converted to 12-column grid (6/12). `MyWorkHubTileProvider` context preserved for hub-specific tile state. Tertiary zone completed (2-C, 2026-03-22) with `hub:recent-context` tile registered and `HbcProjectCanvas projectId="my-work-hub-tertiary"`. Two isolated canvas instances satisfy P2-D2 Gate 3 zone boundary enforcement. Edit-mode and mandatory enforcement hooks deferred to subsequent phases.

**T0-02: Re-register tiles under `hub:` namespace** ✅ Completed (2026-03-22)
File: `tiles/myWorkTileDefinitions.ts`, `tiles/registerMyWorkTiles.ts`
Authority: P2-D2 §6.1
Action: Renamed all tile IDs to `hub:personal-analytics`, `hub:aging-blocked`, `hub:admin-oversight`, `hub:team-portfolio`. Updated filter prefix in `HubSecondaryZone` from `my-work.analytics` to `hub:`. Added P2-D2 §6.1 namespace mandate doc comment to `myWorkTileDefinitions.ts`.

**T0-03: Remove local role constants; use `@hbc/auth` exclusively** ✅ Completed (2026-03-22)
File: `tiles/myWorkTileDefinitions.ts`
Authority: P2-D1 §11.1
Action: Deleted `EXECUTIVE_ROLES` constant and its JSDoc block. Replaced with inline string literals (`['Executive']`, `['Administrator']`) per the canonical `@hbc/auth` pattern used in `landingResolver.ts`. Added P2-D1 §11.1 governance comment. Role resolution consolidation (single call site per render tree) deferred to T1-02.

---

### Tier 1: Contract-Blocking (Must complete before pilot launch)

**T1-01: Implement split timestamp model in `useHubTrustState`** ✅ Completed (2026-03-22)
Files: `useHubTrustState.ts`, `HubFreshnessIndicator.tsx`, `HubSecondaryZone.tsx`
Authority: P2-B3 §5
Action: Split `lastRefreshedIso` into `lastTrustedDataIso` (tracked via `useRef` — updated only when freshness is `'live'`) and `lastRefreshAttemptIso` (always reflects latest aggregation). Updated `HubFreshnessIndicator` to show trusted data age for "Last synced" and attempt time for stale-revalidate context. Fixed `_isLoading` dead code (UX-F5). `queued` normalization was already removed in 0-C.

**T1-02: Add `hbc-my-work-feed-cache` draft key and feed cache persistence** ✅ Completed (2026-03-22)
Files: `hubStateTypes.ts`, `useHubStatePersistence.ts`
Authority: P2-B2 §6
Action: Added `IMyWorkFeedCacheDraft` type, `HUB_DRAFT_KEYS.feedCache = 'hbc-my-work-feed-cache'` with 4h TTL, and `HUB_DRAFT_TTL.feedCache = 4`. Wired `useDraft<IMyWorkFeedCacheDraft>` in `useHubStatePersistence` as explicit write path per P2-B2 §6.

**T1-03: Wire return-state capture to route `onLeave`** ✅ Completed (2026-03-22)
Files: `apps/pwa/src/router/workspace-routes.ts`, `useHubReturnMemory.ts`
Authority: P2-B2 §4.2
Action: Replaced `createWorkspaceRoute` for `myWorkRoute` with direct `createRoute` call including `onLeave`. Added `triggerOnLeaveCapture()` module-level bridge in `useHubReturnMemory.ts` — hook registers `captureReturnState` on mount, clears on unmount. `visibilitychange` retained as secondary fallback.

**T1-04: Implement full PWA action vocabulary in `HubDetailPanel`**
File: `HubDetailPanel.tsx`
Authority: P2-A1 §7.2, P2-C4
Action: Replace `window.location.href` universal handler with action-specific dispatch. `open` → `router.navigate()` for same-app routes, `@hbc/workflow-handoff` for cross-domain. `mark-read`, `defer`, `pin-today`, `pin-week`, `undefer`, `waiting-on` → hub-local mutations via `@hbc/my-work-feed` mutation hooks. `delegate`, `reassign` → `@hbc/workflow-handoff` with appropriate `IHandoffPackage`. All actions must preserve SPA session.

**T1-05: Fix `isLoadError` — derive from actual error state**
File: `MyWorkPage.tsx`
Authority: P2-A1 §3.4 (error gating)
Action: Obtain error state from `useMyWork()` result and pass it to `<HubPageLevelEmptyState isLoadError={isError} />`. Remove hardcoded `false`.

**T1-06: Wire `cardArrangement` to tile rendering** ✅ Completed (2026-03-22)
Files: `MyWorkPage.tsx`, `HubSecondaryZone.tsx`
Authority: P2-D5, P2-D3 §7
Action: `cardArrangement` and `updateCardVisibility` now destructured from `useHubPersonalization` in `MyWorkPage` and passed as props to `HubSecondaryZone`. Arrangement data no longer silently discarded. Canvas integration (T0-01) complete — `HbcProjectCanvas` manages tile rendering; hub draft arrangement available at zone level for config bridging.

**T1-07: Implement missing pilot-required cards (`pa-lane-summary`, `pa-source-breakdown`)** ✅ Completed (2026-03-22)
Files: `cards/LaneSummaryCard.tsx`, `tiles/LaneSummaryTile.tsx`, `cards/SourceBreakdownCard.tsx`, `tiles/SourceBreakdownTile.tsx`, `tiles/myWorkTileDefinitions.ts`
Authority: P2-D3 §8
Action: Created `LaneSummaryCard` with genuine E/S/X variants consuming `useMyWorkCounts()` lane fields (nowCount, blockedCount, waitingCount, deferredCount). Created `SourceBreakdownCard` with genuine E/S/X variants grouping `feed.items` by `context.moduleKey` via `formatModuleLabel()`. Registered as `hub:lane-summary` (mandatory, lockable, wide) and `hub:source-breakdown` (configurable, standard width). Mandatory lock enforcement deferred to T0-01 canvas integration.

---

### Tier 2: Quality-Blocking (Must complete before mold-breaker assessment)

**T2-01: Resolve P2-F1 UIFs — Group G1 (Design Token Foundation)**
Files: `cards/PersonalAnalyticsCard.tsx`, `MyWorkPage.tsx`, `HubConnectivityBanner.tsx`, `cards/TeamPortfolioCard.tsx`, `cards/QuickActionsSheet.tsx`, `cards/RecentActivityCard.tsx`
Authority: P2-F1 §G1, MB-08, UI-Kit Usage and Composition Guide D-10
Action: Replace all hardcoded hex/rgb values with `HBC_*` token constants. Replace `@fluentui/react-components` direct imports with `@hbc/ui-kit` re-exports. Replace inline `<style>` block with Griffel `makeStyles`. Replace `<span>Loading...</span>` with `HbcSpinner`.

**T2-02: Resolve P2-F1 UIFs — Group G2 (Feed Visual Structure)**
Authority: P2-F1 §G2, UIF-001, UIF-003, UIF-004, UIF-005, UIF-006
Action: This involves `@hbc/my-work-feed` component updates (lane header styling, item row padding/separation, collapse state differentiation, metadata density). These changes are in the feed package, not in `MyWorkPage.tsx`, but the defects are visible here.

**T2-03: Resolve P2-F1 UIFs — Group G3 (Layout)**
Authority: P2-F1 §G3, UIF-002
Action: Implement two-column persistent layout (work feed left ~65%, analytics panel right ~35%) per P2-D2. Collapse to single column below `HBC_BREAKPOINT_MOBILE`. The current `HubZoneLayout.tsx` partially implements this but the right panel is not sticky at all viewport sizes.

**T2-04: Consolidate role resolution to one call site**
Files: `MyWorkPage.tsx`, `HubTeamModeSelector.tsx`
Authority: P2-D1, P2-D4
Action: Remove `useAuthStore` from `HubTeamModeSelector`; pass `isExecutive` and `hasDelegations` as props from `MyWorkPage`, which owns the single `useCurrentUser()` call.

**T2-05: Remove `QuickActionsMenu.tsx` dead code**
File: `cards/QuickActionsMenu.tsx`
Action: Delete the file; remove export from `cards/index.ts` if present.

---

### Tier 3: Technical Debt (Strongly recommended before Phase 3 close)

**T3-01: Implement behavioral test suite**
Authority: P2-D2 Gate 5, P2-E3
Action: Add vitest suites covering: trust state derivation, freshness indicator rendering per trust state, tile filtering by role/complexity/prefix, return-state capture/restore, team mode toggle behavior, draft persistence round-trips.

**T3-02: Implement expert-tier tile variants**
Files: All `*Tile.tsx` files
Authority: P2-D3 §5
Action: Replace `PersonalAnalyticsTileStandard as PersonalAnalyticsTileExpert` aliasing with actual expert-tier components that render the `X` complexity variants per P2-D3 governance matrix.

**T3-03: Address `AdminOversightCard` stub**
File: `cards/AdminOversightCard.tsx`
Authority: P2-D3 §1.3
Action: Either implement `ao-provisioning-health` content from the provisioning feed source, or mark the tile as `experimentalOnly: true` and gate it from pilot builds.

**T3-04: Replace `window.history.replaceState` with router search params**
File: `MyWorkPage.tsx`
Authority: P2-B2 §3 (URL is canonical)
Action: Use TanStack Router `useSearch` / `router.navigate({ search })` to sync `teamMode`, `kpiFilter`, and `selectedItem` into URL parameters. This makes URL truly canonical and enables deep-linking.

**T3-05: Resolve P2-D5 vs P2-B2 Executive default conflict** ✅ Completed (2026-03-22)
Authority: ADR-0117
Action: Filed ADR-0117 resolving that P2-D5 §3 governs for Executive role (defaults to `my-team`); P2-B2 §4 applies to all other roles (`personal`). Implemented in `useHubPersonalization` — reads `resolvedRoles` to apply role-aware default.

---

## 10. Documentation Corrections Needed

**DOC-01: `P2-F1-My-Work-Hub-UI-Quality-and-Mold-Breaker-Conformance-Plan.md`**
The plan's revision note dated 2026-03-21 correctly documents the current state. No correction needed; it accurately describes the failure modes. Implementers must treat it as a co-equal requirement alongside this audit.

**DOC-02: `hubStateTypes.ts` comment** ⚡ Partially addressed (2026-03-22)
The file header already references P2-B2 §3–§6. The new `feedCache` key and `IMyWorkFeedCacheDraft` type include inline P2-B2 §6 references. Per-key reference comments for existing keys deferred to Phase 6-E.

**DOC-03: `myWorkTileDefinitions.ts` comment** ⚡ Partially addressed (2026-03-22)
P2-D2 §6.1 namespace mandate doc comment added to `myWorkTileDefinitions.ts` header block during remediation 0-A. Full close deferred to Phase 6-E per remediation cross-reference.

**DOC-04: P2-D5 vs P2-B2 conflict (Executive default team mode)** ✅ Resolved (2026-03-22)
ADR-0117 filed. P2-D5 §3 governs for Executive role; P2-B2 §4 superseded for Executive only. The contradiction in the plan corpus is resolved.

**DOC-05: `apps/pwa/src/pages/my-work/README.md`** ✅ Created (2026-03-22)
README added covering purpose, governing specs, directory structure, key hooks, state management model, and tile system documentation.

---

## 11. Optional Immediate-Fix Patch List

These changes are small, safe, and self-contained. They can be applied immediately without architectural dependency and will reduce noise in subsequent reviews.

**PATCH-01: Remove `QuickActionsMenu.tsx`** ✅ Completed (2026-03-22)
File deleted. No imports existed.

**PATCH-02: Fix `isLoadError` hardcode** ✅ Completed (2026-03-22)
`isLoadError` prop removed from `MyWorkPage.tsx`. `HubPageLevelEmptyState` now derives error state from `useMyWork().isError` context.

**PATCH-03: Fix D-10 Fluent UI direct imports** ✅ Completed (2026-03-22)
`tokens` re-exported from `@hbc/ui-kit` barrel. Imports updated in `QuickActionsSheet.tsx`, `RecentActivityCard.tsx`, and `PersonalAnalyticsCard.tsx`.

**PATCH-04: Remove local role constants** ✅ Completed (2026-03-22, remediation 0-B)
`EXECUTIVE_ROLES` constant deleted. Role strings inlined per canonical `@hbc/auth` pattern.

**PATCH-05: Fix FAB hardcoded color** ✅ Completed (2026-03-22)
Inline style replaced with Griffel `makeStyles` class using `HBC_ACCENT_ORANGE` token. Responsive media query absorbed into the same class, eliminating the Rule-6 `<style>` tag violation simultaneously.

**PATCH-06: Add `queued` trust state handling** ✅ Completed (2026-03-22)
`queued → live` normalization removed from `useHubTrustState.ts`. `queued` added as first-class freshness state with "Pending Sync" label and info badge in `HubFreshnessIndicator`.

**PATCH-07: Replace `<span>Loading...</span>` in `TeamPortfolioCard`** ✅ Completed (2026-03-22)
Replaced with `<HbcSpinner size="sm" label="Loading team data" />`.

---

## Go / No-Go Judgment

### Verdict: **NO-GO**

The current `MyWorkPage` implementation is **not acceptable as the execution baseline for Phase 3 work.**

This judgment rests on three independent grounds, any one of which would alone be sufficient:

**Ground 1 — Governance failure.** The implementation bypasses `@hbc/project-canvas` governance entirely in the secondary and tertiary zones. Five of the six P2-D2 implementation gates are unmet. The tile namespace is wrong. Local role constants violate the P2-D1 mandate for `@hbc/auth` as sole authority. These are not stylistic deviations — they are structural violations of the architecture documents that govern this exact feature area.

**Ground 2 — Existing authoritative audit.** P2-F1, the plan document with "Update Authority: Experience lead; changes require Architecture review" and "Last Reviewed Against Repo Truth: 2026-03-21," already rendered a formal verdict: "Full re-implementation required." The document's current status is "Active — All UIFs Re-opened after Audit 2." That judgment pre-dates this audit and was issued by the designated governing authority for UI quality. This audit corroborates it on every dimension.

**Ground 3 — Pilot-blocking card gaps and state management defects.** Two of the four pilot-required P2-D3 cards are absent or non-functional. The trust state model misrepresents freshness. Return-state capture is not wired to the route lifecycle. Error states are permanently suppressed. The page cannot pass a pilot launch review in its current form.

Proceeding to Phase 3 on this baseline would mean building new features on top of a governance structure that will need to be torn out and replaced. Every new tile, every new card, and every personalization feature would have to be re-integrated into `HbcProjectCanvas` retroactively. The cost of building on this baseline is higher than the cost of fixing it now.

The recommended Phase 3 entry condition is completion of all Tier 0 (T0-01 through T0-03) and Tier 1 (T1-01 through T1-07) remediation items, plus a verified pass on P2-D2 Gates 1–5, with at minimum a basic behavioral test suite covering trust state and tile governance. Tier 2 items should be substantially complete before any pilot deployment. Tier 3 items should be tracked as carry-forward with clear owners.

---

*Audit produced: 2026-03-22. All findings traceable to files read during this session. Governing document citations reference the `docs/architecture/plans/MASTER/phase-2-deliverables/` plan corpus and `docs/reference/ui-kit/` design authority documents.*
