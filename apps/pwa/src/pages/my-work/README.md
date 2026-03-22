# My Work — Personal Work Hub

The `/my-work` route implements the HB Intel Personal Work Hub: a three-zone adaptive dashboard for individual task management, team oversight, and analytics.

## Governing Specifications

| Document | Scope |
|----------|-------|
| P2-D2 | Adaptive layout, zone governance, tile registration (§6), role defaults (§7), edit-mode gates (§8) |
| P2-D1 | Role-to-hub entitlement matrix, Executive/Member/Administrator card eligibility |
| P2-D3 | Card catalog, tile governance, pilot-required card set (§8) |
| P2-D5 | Personalization — team mode, card arrangement, saved views |
| P2-B2 | Hub state persistence — query-seed, return memory, feed cache |
| P2-B3 | Freshness, trust state, staleness display |
| P2-A1 | Operating model — action vocabulary, no-redirect-on-empty |
| P2-F1 | UI quality and mold-breaker conformance |
| ADR-0117 | Executive defaults to `my-team` mode (resolves P2-D5 §3 vs P2-B2 §4) |

## Directory Structure

```
my-work/
  MyWorkPage.tsx          — Page orchestrator: zones, personalization, state
  HubZoneLayout.tsx       — Responsive three-zone grid (7fr/5fr desktop, 3fr/2fr tablet)
  HubPrimaryZone.tsx      — Primary feed zone (HbcMyWorkFeed)
  HubSecondaryZone.tsx    — Analytics zone (HbcProjectCanvas, "My Analytics")
  HubTertiaryZone.tsx     — Utility zone (HbcProjectCanvas, recent activity)
  HubDetailPanel.tsx      — Master-detail item drawer (UIF-002)
  HubTeamModeSelector.tsx — Team mode tabs (Personal/Delegated/My Team)
  HubConnectivityBanner.tsx — Degraded/offline connectivity display
  HubFreshnessIndicator.tsx — Trust state badge + staleness display
  HubPageLevelEmptyState.tsx — Error/permission empty state
  hubStateTypes.ts        — Draft key types (query-seed, return state, feed cache, etc.)
  trustStateConstants.ts  — Freshness window constant (5 min)
  formatRelativeTime.ts   — Relative timestamp formatter
  useHubTrustState.ts     — Split timestamp model (lastTrustedDataIso / lastRefreshAttemptIso)
  useHubStatePersistence.ts — @hbc/session-state draft persistence wiring
  useHubPersonalization.ts — Team mode persistence
  useHubReturnMemory.ts   — Return-state capture (route onLeave + visibilitychange)
  useHubFeedRefresh.ts    — TanStack Query invalidation on return
  cards/                  — Card components (LaneSummary, SourceBreakdown, etc.)
  tiles/                  — Canvas tile adapters + definitions + registration
  __tests__/              — Unit tests
```

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useHubTrustState` | Derives freshness, connectivity, and staleness from feed result (P2-B3) |
| `useHubStatePersistence` | Wires @hbc/session-state drafts for query-seed, return state, feed cache |
| `useHubPersonalization` | Team mode persistence; Executive default `my-team` (ADR-0117). Card arrangement managed by HbcProjectCanvas internally. |
| `useHubReturnMemory` | Captures scroll/group state on leave; restores on return; triggers feed refresh |
| `useHubFeedRefresh` | Invalidates TanStack Query cache on return from domain surface |

## State Management

- **Feed data**: TanStack Query via `@hbc/my-work-feed` hooks (`useMyWork`, `useMyWorkCounts`)
- **Team mode**: Persisted draft (16h TTL, 300ms debounce) via `useAutoSaveDraft`
- **Query seed**: Persisted draft (8h TTL, 500ms debounce) — lane/mode preferences
- **Return state**: Persisted draft (1h TTL) — scroll position, expanded groups
- **Feed cache**: Explicit write draft (4h TTL) — durable fallback for offline return
- **KPI filter**: TanStack Router search param (`?filter=`) — canonical URL state
- **Trust state**: Derived from feed `healthState` — split timestamp model

## Tile System

Tiles are registered at app bootstrap via `registerMyWorkTiles()` in `sourceAssembly.ts`. All tile keys use the `hub:*` namespace per P2-D2 §6.1. Secondary and tertiary zones render via `HbcProjectCanvas` with separate `projectId` values for zone isolation (P2-D2 Gate 3).

Role-default tile layouts are defined in `ROLE_DEFAULT_TILES` (canvasDefaults.ts) for Member, Executive, and Administrator, with `:tertiary` suffixed keys for tertiary zone isolation.
