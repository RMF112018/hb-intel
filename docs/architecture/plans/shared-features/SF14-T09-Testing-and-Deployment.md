<!-- DIFF-SUMMARY: Corrected ADR target to /0103 path; removed conflicting dependency prohibitions; aligned closure checklist with locked DoD/integrations -->

# SF14-T09 — Testing and Deployment: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF14-T09 testing/deployment task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Finalize `@hbc/related-items` with SF11-grade documentation/deployment closure requirements (ADR template, adoption guide, API reference, README conformance, ADR index update, blueprint progress comment, and current-state-map updates).

---

## 3-Line Plan

1. Complete testing for registry/api/hooks/components and integration paths.
2. Pass all mechanical enforcement gates with ≥95% coverage.
3. Publish ADR-0103 and all required documentation/state-map/index updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification

- [ ] `@hbc/related-items` has zero imports of `packages/features/*`
- [ ] app-shell-safe component usage validated
- [ ] cross-module lookups routed via backend API only
- [ ] boundary grep checks return zero prohibited matches
- [ ] `@hbc/versioned-record` integration present for version chips/governance history
- [ ] offline cache path present via `@hbc/session-state` + `@hbc/sharepoint-docs`

### Type Safety

- [ ] zero TypeScript errors: `pnpm --filter @hbc/related-items check-types`
- [ ] relationship definitions and directions enforced end-to-end
- [ ] governance metadata (`relationshipPriority`, `resolverStrategy`, `roleRelevanceMap`) typed and validated
- [ ] related-item summary type contract stable with `versionChip` and `aiConfidence`

### Build & Package

- [ ] package build succeeds
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundle
- [ ] exports resolve in consuming modules
- [ ] turbo build with BD/Estimating/Project Hub packages succeeds

### Tests

- [ ] all tests pass
- [ ] coverage thresholds met (lines/branches/functions/statements ≥95)
- [ ] registry/api tests complete
- [ ] hook tests for grouping/filtering/priority logic complete
- [ ] panel/card/tile component tests complete
- [ ] relationship navigation E2E scenario passing

### Storage/API (Relationship Summary Lookup)

- [ ] batched `/api/related-items/summaries` Azure Function route validated
- [ ] no-config/no-related graceful handling validated
- [ ] bidirectional relationships return expected group sets
- [ ] role visibility filtering validated
- [ ] AI hook suggestion group payload shape validated

### Integration

- [ ] BD↔Estimating relationship registrations validated
- [ ] Estimating↔Project relationship registrations validated
- [ ] project-canvas `HbcRelatedItemsTile` top-3 + overlay integration validated
- [ ] optional BIC state display integration validated
- [ ] governance-admin actions emit to `@hbc/activity-timeline`

### Documentation

- [ ] `docs/architecture/adr/0103-related-items-unified-work-graph.md` written and accepted
- [ ] `docs/how-to/developer/related-items-adoption-guide.md` written
- [ ] `docs/reference/related-items/api.md` written
- [ ] `packages/related-items/README.md` conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0103 entry
- [ ] `current-state-map.md §2` updated with SF14 and ADR-0103 linkage

---

## ADR-0103: Related Items Unified Work Graph Primitive

**File:** `docs/architecture/adr/0103-related-items-unified-work-graph.md`

```markdown
# ADR-0103 — Related Items Unified Work Graph Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None

## Context

Cross-module relationships are critical to record context but are currently siloed and non-discoverable in a consistent UI surface.

## Decisions

### D-01 — Relationship Registry
Use module-registered relationship definitions with `registerBidirectionalPair()`.

### D-02 — Direction Model
Use fixed relationship-direction union values.

### D-03 — ID Resolution Strategy
Resolve related IDs via module-local resolver functions with governance metadata.

### D-04 — API Model
Fetch related-item summaries via batched backend route.

### D-05 — UI Model
Render grouped relationship panel with item cards and version chips.

### D-06 — Visibility Model
Support role-gated relationship visibility and role-aware empty states.

### D-07 — Complexity Behavior
Hide panel in Essential; show progressively richer info in Standard/Expert including AI group.

### D-08 — Canvas Integration
Expose panel as project-canvas tile with compact top-3 + overlay.

### D-09 — Bidirectional Baseline
Require bidirectional relationship registration for key lifecycle links.

### D-10 — Testing Sub-Path
Expose canonical fixtures from `@hbc/related-items/testing`.

## Compliance

This ADR is locked and can only be superseded by explicit follow-up ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/related-items-adoption-guide.md`

Required sections:

1. When to use related-items panel
2. Registering relationships with `RelationshipRegistry.registerBidirectionalPair`
3. Designing `resolveRelatedIds` and `buildTargetUrl`
4. Applying governance metadata, role visibility, and complexity behavior
5. Embedding `HbcRelatedItemsPanel` and `HbcRelatedItemsTile` in detail/canvas flows
6. Using testing fixtures from `@hbc/related-items/testing`

---

## API Reference

**File:** `docs/reference/related-items/api.md`

Must include export table entries for:

- `RelationshipDirection`
- `IGovernanceMetadata`
- `IRelationshipDefinition`
- `IRelatedItem`
- `RelationshipRegistry` (including `registerBidirectionalPair` and `registerAISuggestionHook`)
- `RelatedItemsApi`
- `useRelatedItems`
- `HbcRelatedItemsPanel`
- `HbcRelatedItemCard`
- `HbcRelatedItemsTile`
- testing exports (`createMockRelationshipDefinition`, `createMockRelatedItem`, `createMockSourceRecord`, `mockRelationshipDirections`)

---

## Package README Conformance

**File:** `packages/related-items/README.md`

Verify README contains:

- purpose and unified-work-graph overview
- quick-start setup
- registry + batched API + panel/tile behavior summary
- role visibility and complexity summary
- exports table
- architecture boundary rules
- links to SF14 master plan, T09, ADR-0103, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0103](architecture/adr/0103-related-items-unified-work-graph.md) | Related Items Unified Work Graph Primitive | Accepted | 2026-03-10 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update §2 with:

- SF14 shared-feature plans row
- ADR-0103 row linkage
- optional doc rows if authored in same pass:
  - `docs/how-to/developer/related-items-adoption-guide.md`
  - `docs/reference/related-items/api.md`
- update next unreserved ADR number after ADR-0103 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/related-items...
pnpm turbo run lint --filter @hbc/related-items...
pnpm --filter @hbc/related-items check-types
pnpm --filter @hbc/related-items test --coverage

# Boundary checks
grep -r "from 'packages/features/" packages/related-items/src/

# Documentation checks
test -f docs/architecture/adr/0103-related-items-unified-work-graph.md
test -f docs/how-to/developer/related-items-adoption-guide.md
test -f docs/reference/related-items/api.md
test -f packages/related-items/README.md
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF14-T09 completed: 2026-03-11
ADR created: docs/architecture/adr/0103-related-items-unified-work-graph.md
Documentation added:
  - docs/how-to/developer/related-items-adoption-guide.md
  - docs/reference/related-items/api.md
  - packages/related-items/README.md (updated with full T09 content)
docs/README.md ADR index updated: ADR-0103 row appended.
current-state-map.md §2 updated: SF14 → Historical Foundational; ADR-0103 note removed; adoption-guide and api.md rows added.
All four mechanical enforcement gates passed:
  - check-types: zero errors
  - build: zero errors
  - lint: zero errors (4 warnings)
  - test: 103 tests, 96.03% branches, 99.51% statements, 100% functions
Boundary check: zero prohibited feature imports.
-->

---

## Blueprint Progress Comment

Append to `SF14-Related-Items.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF14 completed: {DATE}
T01–T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/0103-related-items-unified-work-graph.md
Documentation added:
  - docs/how-to/developer/related-items-adoption-guide.md
  - docs/reference/related-items/api.md
  - packages/related-items/README.md
docs/README.md ADR index updated: ADR-0103 row appended.
current-state-map.md §2 updated with SF14 and ADR-0103 rows.
-->
```
