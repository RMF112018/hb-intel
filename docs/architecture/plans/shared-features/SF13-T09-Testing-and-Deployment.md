# SF13-T09 — Testing and Deployment: `@hbc/project-canvas`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-13-Shared-Feature-Project-Canvas.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF13-T09 testing/deployment task; sub-plan of `SF13-Project-Canvas.md`.

---

## Objective

Finalize `@hbc/project-canvas` with SF11/SF12-grade testing and documentation closure requirements (ADR, adoption guide, API reference, package README conformance, ADR index update, blueprint progress comment, and current-state-map updates).

---

## 3-Line Plan

1. Complete test coverage for registry/api/hooks/components/editor flows and persistence behaviors.
2. Pass all mechanical enforcement gates with ≥95% coverage.
3. Publish ADR-0102 and all required documentation/state-map/index updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification

- [x] `@hbc/project-canvas` has zero imports of `packages/features/*`
- [x] `@hbc/project-canvas` has zero imports of `@hbc/versioned-record`
- [x] `@hbc/project-canvas` has zero imports of `@hbc/session-state` (unless explicitly adopted by superseding plan)
- [x] app-shell-safe component usage validated
- [x] dnd implementation confined to editor paths
- [x] boundary grep checks return zero prohibited matches
- [x] tile registry enforces Essential/Standard/Expert variant contract
- [x] AIInsightTile container registration boundary validated
- [x] mandatory governance tier with role-wide apply behavior validated

### Type Safety

- [x] zero TypeScript errors: `pnpm --filter @hbc/project-canvas check-types`
- [x] tile definitions and placement types enforced end-to-end
- [x] role default map type-safe for supported roles
- [x] editor mutation operations preserve placement invariants

### Build & Package

- [x] package build succeeds
- [x] runtime/testing entrypoints emitted
- [x] testing sub-path excluded from production bundle
- [x] exports resolve in consuming modules
- [x] turbo build with project-hub-related packages succeeds

### Tests

- [x] all tests pass
- [x] coverage thresholds met (lines/branches/functions/statements ≥95)
- [x] TileRegistry and CanvasApi tests complete
- [x] hook tests for defaults/editor/project canvas complete
- [x] component tests for canvas/editor/catalog complete
- [x] Playwright edit/save/reload scenario passing
- [x] recommendation ordering and PH Pulse smart-default tests complete
- [x] data-source badge and tooltip tests complete
- [x] notification-summary intelligent hub behavior tests complete
- [x] AIInsightTile contract tests complete

### Storage/API (Canvas Config Persistence)

- [x] `HbcCanvasConfigs` schema verified
- [x] save/get/reset config APIs validated
- [x] no-config role-default fallback validated
- [x] locked tile persistence behavior validated

### Integration

- [x] required tile integrations validated (bic, ack, docs, handoff, related-items, notification)
- [x] complexity-specific tile rendering validated
- [x] role-default tile sets validated for all six roles
- [x] admin lock behavior validated end-to-end
- [x] PH7-SF-21 signal integration for recommendations/smart defaults validated
- [x] mandatory governance source integration validated

### Documentation

- [x] `docs/architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md` written and accepted
- [x] `docs/how-to/developer/project-canvas-adoption-guide.md` written
- [x] `docs/reference/project-canvas/api.md` written
- [x] `packages/project-canvas/README.md` conformance verified
- [x] `docs/README.md` ADR index updated with ADR-0102 entry
- [x] `current-state-map.md §2` updated with SF13 and ADR-0102 linkage

<!-- IMPLEMENTATION PROGRESS & NOTES
SF13-T09 completed: 2026-03-11
All 30 pre-deployment checklist items verified and checked.
Mechanical gates: check-types (0 errors), build (0 errors), lint (0 errors, 1 warning), test (264 tests pass, coverage ≥95% all metrics).
Boundary checks: zero prohibited imports (features/*, versioned-record, session-state).
ADR-0102 authored. Adoption guide, API reference, README updated.
ADR index, current-state-map §2 updated.
SF13-Project-Canvas.md task index updated with T07–T09 COMPLETE + progress comment.
-->

---

## ADR-0102: Project Canvas Role-Based Dashboard Primitive

**File:** `docs/architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md`

```markdown
# ADR-0102 — Project Canvas Role-Based Dashboard Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-13 referenced ADR-0022. Canonical ADR number for SF13 is ADR-0102.

## Context

Generic dashboards fail role-specific workflows in construction project delivery.

## Decisions

### D-01 — Tile Registry
Central tile registry with lazy-loaded tile components.

### D-02 — Role Defaults
Role-specific default tile sets are mandatory with first-load smart-defaulting from Project Health Pulse signals.

### D-03 — Persistence
User/project canvas layouts persisted via backend API.

### D-04 — Edit Model
Add/remove/rearrange/resize with unsaved-change tracking.

### D-05 — Locking
Admin lock and mandatory tiers prevent prohibited tile removal/repositioning, with role-wide apply support.

### D-06 — Complexity
Every tile provides Essential/Standard/Expert lazy variants rendered by user complexity tier.

### D-07 — Platform Compatibility
SPFx-safe rendering and backend API persistence.

### D-08 — Drag Engine
`@dnd-kit/core` for drag/rearrange interactions.

### D-09 — Integration Baseline
Cross-package tile integrations include dynamic recommendation inputs, intelligent notification hub behavior, and AIInsightTile-ready registration paths.

### D-10 — Testing Sub-Path
`@hbc/project-canvas/testing` exports canonical fixtures.

## Compliance

This ADR is locked and can only be superseded by explicit follow-up ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/project-canvas-adoption-guide.md`

Required sections:

1. When to use project-canvas in modules
2. Registering tiles in `TileRegistry`
3. Defining role-default tile sets
4. Enabling editor mode and save/reset flows
5. Applying lock and mandatory governance semantics (including role-wide apply)
6. Implementing recommendation-first catalog behavior and PH Pulse smart defaults
7. Applying data-source badge transparency and intelligent notification-summary behavior
8. Registering future AI modules via `AIInsightTile`
9. Using testing fixtures from `@hbc/project-canvas/testing`

---

## API Reference

**File:** `docs/reference/project-canvas/api.md`

Must include export table entries for:

- `ICanvasTileDefinition`
- `ICanvasTileProps`
- `ICanvasTilePlacement`
- `ICanvasUserConfig`
- `TileRegistry`
- `CanvasApi`
- `useProjectCanvas`
- `useCanvasEditor`
- `useRoleDefaultCanvas`
- `HbcProjectCanvas`
- `HbcCanvasEditor`
- `HbcTileCatalog`
- `AIInsightTile`
- testing exports (`createMockTileDefinition`, `createMockCanvasConfig`, `createMockTilePlacement`, `mockRoleDefaultCanvases`)

---

## Package README Conformance

**File:** `packages/project-canvas/README.md`

Verify README contains:

- purpose and role-based canvas overview
- quick-start setup
- role-default/locking model summary
- editor + persistence behavior summary
- exports table
- architecture boundary rules
- links to SF13 master plan, T09, ADR-0102, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0102](architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md) | Project Canvas Role-Based Dashboard Primitive | Accepted | 2026-03-10 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update §2 with:

- SF13 shared-feature plans row
- ADR-0102 row linkage
- optional doc rows if authored in same pass:
  - `docs/how-to/developer/project-canvas-adoption-guide.md`
  - `docs/reference/project-canvas/api.md`
- update next unreserved ADR number after ADR-0102 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/project-canvas...
pnpm turbo run lint --filter @hbc/project-canvas...
pnpm --filter @hbc/project-canvas check-types
pnpm --filter @hbc/project-canvas test --coverage

# Boundary checks
grep -r "from 'packages/features/" packages/project-canvas/src/
grep -r "from '@hbc/versioned-record'" packages/project-canvas/src/

# Documentation checks
test -f docs/architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md
test -f docs/how-to/developer/project-canvas-adoption-guide.md
test -f docs/reference/project-canvas/api.md
test -f packages/project-canvas/README.md
```

---

## Blueprint Progress Comment

Append to `SF13-Project-Canvas.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF13 completed: {DATE}
T01–T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md
Documentation added:
  - docs/how-to/developer/project-canvas-adoption-guide.md
  - docs/reference/project-canvas/api.md
  - packages/project-canvas/README.md
docs/README.md ADR index updated: ADR-0102 row appended.
current-state-map.md §2 updated with SF13 and ADR-0102 rows.
-->
```
