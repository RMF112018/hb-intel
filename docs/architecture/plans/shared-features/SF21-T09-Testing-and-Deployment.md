# SF21-T09 - Testing and Deployment: Project Health Pulse

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF21-T09 testing/deployment task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Finalize SF21 with SF11-grade closure requirements: full testing gates, ADR template, adoption guide, API reference, README conformance, ADR index updates, blueprint progress comment, and `current-state-map` governance updates.

---

## 3-Line Plan

1. Complete pulse compute/data-quality/UI/portfolio validations at >=95% coverage.
2. Pass mechanical enforcement and architecture boundary gates.
3. Publish ADR-0110 and all required documentation/index/state-map updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification
- [ ] pulse feature remains within `@hbc/features-project-hub`
- [ ] no app-route imports in package runtime
- [ ] compute engine remains deterministic and side-effect free
- [ ] stale/missing exclusion model enforced in all dimensions
- [ ] app-shell-safe components validated for all pulse surfaces
- [ ] boundary grep checks return zero prohibited matches

### Type Safety
- [ ] zero TypeScript errors: `pnpm --filter @hbc/features-project-hub check-types`
- [ ] pulse/dimension/metric contracts stable end-to-end
- [ ] status-band and data-pending contracts stable
- [ ] admin config contracts and validation stable

### Build & Package
- [ ] package build succeeds
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundle
- [ ] exports resolve in project-hub and canvas consumers
- [ ] turbo build with dependencies succeeds

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (lines/branches/functions/statements >=95)
- [ ] dimension and composite compute tests complete
- [ ] stale exclusion and inline-edit tests complete
- [ ] card/detail/tab/portfolio/admin panel tests complete
- [ ] end-to-end stale-edit-to-pulse-update scenario passing

### Storage/API (Pulse Metrics + Admin Config + Manual Entries)
- [ ] metric persistence and freshness metadata validated
- [ ] admin config singleton schema validated
- [ ] manual-entry save path and timestamps validated
- [ ] staleness override behavior validated

### Integration
- [ ] BIC-driven office dimension and recommended action integration validated
- [ ] notification-intelligence escalation path validated
- [ ] auth role/permission gates validated
- [ ] complexity and project-canvas integration behavior validated

### Documentation
- [ ] `docs/architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md` written and accepted
- [ ] `docs/how-to/developer/project-health-pulse-adoption-guide.md` written
- [ ] `docs/reference/project-health-pulse/api.md` written
- [ ] `packages/features/project-hub/README.md` conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0110 entry
- [ ] `current-state-map.md §2` updated with SF21 and ADR-0110 linkage

---

## ADR-0110: Project Health Pulse Multi-Dimension Indicator

**File:** `docs/architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md`

```markdown
# ADR-0110 - Project Health Pulse Multi-Dimension Indicator

**Status:** Accepted
**Date:** 2026-03-11
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-21 referenced ADR-0030-like sequencing. Canonical ADR number for SF21 is ADR-0110.

## Context

Project health requires predictive, multi-dimension scoring with explicit treatment of stale and missing data.

## Decisions

### D-01 - Package Alignment
Implement in `@hbc/features-project-hub`.

### D-02 - Dimension Formula
Use leading 70% + lagging 30% for each dimension.

### D-03 - Composite Weighting
Use admin-configurable dimension weights with validated sums.

### D-04 - Status Model
Use on-track/watch/at-risk/critical/data-pending bands.

### D-05 - Data Quality Rule
Exclude stale/missing metrics and re-normalize remaining contributors.

### D-06 - Inline Edit Policy
Allow permitted users to edit stubbed metrics in detail surfaces.

### D-07 - Complexity Behavior
Essential compact, Standard detail tabs, Expert diagnostics/history/admin links.

### D-08 - Action Recommendation
Expose top recommended action from BIC + notification context.

### D-09 - Portfolio Surface
Provide leadership portfolio table as first-class surface.

### D-10 - Testing Sub-Path
Expose canonical fixtures via `@hbc/features-project-hub/testing`.

## Compliance

This ADR is locked and superseded only by explicit follow-up ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/project-health-pulse-adoption-guide.md`

Required sections:

1. computing and rendering pulse in project views
2. handling stale/missing metrics and inline edits
3. configuring admin weights and thresholds
4. wiring card/detail/tab/portfolio surfaces
5. integrating recommended action flows
6. using fixtures from `@hbc/features-project-hub/testing`

---

## API Reference

**File:** `docs/reference/project-health-pulse/api.md`

Must include export table entries for:

- `HealthStatus`
- `IHealthMetric`
- `IHealthDimension`
- `IProjectHealthWeights`
- `IProjectHealthPulse`
- `IHealthPulseAdminConfig`
- `useProjectHealthPulse`
- `useHealthPulseAdminConfig`
- `ProjectHealthPulseCard`
- `ProjectHealthPulseDetail`
- `HealthDimensionTab`
- `HealthMetricInlineEdit`
- `PortfolioHealthTable`
- testing exports (`createMockProjectHealthPulse`, `createMockHealthDimension`, `createMockHealthMetric`, `mockProjectHealthStates`)

---

## Package README Conformance

**File:** `packages/features/project-hub/README.md`

Verify README contains:

- pulse overview
- quick-start setup
- compute + admin-config architecture summary
- exports table
- boundary rules
- links to SF21 master, T09, ADR-0110, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0110](architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md) | Project Health Pulse Multi-Dimension Indicator | Accepted | 2026-03-11 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update section 2 with:

- SF21 plan-family row
- ADR-0110 row linkage
- optional doc rows (if authored in same pass):
  - `docs/how-to/developer/project-health-pulse-adoption-guide.md`
  - `docs/reference/project-health-pulse/api.md`
- next unreserved ADR number after ADR-0110 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/features-project-hub...
pnpm turbo run lint --filter @hbc/features-project-hub...
pnpm --filter @hbc/features-project-hub check-types
pnpm --filter @hbc/features-project-hub test --coverage

# Boundary checks
rg -n "from 'apps/" packages/features/project-hub/src
rg -n "isStale|isManualEntry|data-pending" packages/features/project-hub/src/health-pulse

# Documentation checks
test -f docs/architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md
test -f docs/how-to/developer/project-health-pulse-adoption-guide.md
test -f docs/reference/project-health-pulse/api.md
test -f packages/features/project-hub/README.md
```

---

## Blueprint Progress Comment

Append to `SF21-Project-Health-Pulse.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF21 completed: {DATE}
T01-T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md
Documentation added:
  - docs/how-to/developer/project-health-pulse-adoption-guide.md
  - docs/reference/project-health-pulse/api.md
  - packages/features/project-hub/README.md
docs/README.md ADR index updated: ADR-0110 row appended.
current-state-map.md section 2 updated with SF21 and ADR-0110 rows.
-->
```
