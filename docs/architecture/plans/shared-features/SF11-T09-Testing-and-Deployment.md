# SF11-T09 — Testing and Deployment: `@hbc/smart-empty-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-11-Shared-Feature-Smart-Empty-State.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.2 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF11-T09 testing/deployment task; sub-plan of `SF11-Smart-Empty-State.md`.

---

## Objective

Finalize `@hbc/smart-empty-state` with full test coverage and deployment gates, then publish all required documentation deliverables following SF09-T09 documentation rigor (ADR, adoption guide, API reference, package README, ADR index updates, blueprint progress comment, and current-state-map updates).

---

## 3-Line Plan

1. Complete and verify all testing assets: unit, component, Storybook, and Playwright empty-state flows.
2. Run all mechanical enforcement gates with ≥95% coverage and zero boundary/type/build failures.
3. Publish ADR-0100 and all required docs, including state-map and ADR index updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification

- [ ] `@hbc/smart-empty-state` has zero imports of `@hbc/notification-intelligence`
- [ ] `@hbc/smart-empty-state` has zero imports of `@hbc/versioned-record`
- [ ] `@hbc/smart-empty-state` has zero imports of `@hbc/bic-next-move`
- [ ] `@hbc/smart-empty-state` has zero imports of `packages/features/*`
- [ ] SPFx-safe component usage verified (`@hbc/ui-kit/app-shell` compatibility)
- [ ] Boundary grep checks pass (zero prohibited matches)

### Type Safety

- [ ] Zero TypeScript errors: `pnpm --filter @hbc/smart-empty-state check-types`
- [ ] `IEmptyStateContext` propagates through hooks/components without `any`
- [ ] `ISmartEmptyStateConfig.resolve` return type strictly enforced
- [ ] `IEmptyStateVisitStore` adapter contract satisfied in both default and injected paths

### Build & Package

- [ ] Build succeeds: `pnpm --filter @hbc/smart-empty-state build`
- [ ] Both entry points emitted: `dist/index.js`, `dist/testing/index.js`
- [ ] `testing/` sub-path excluded from production bundle
- [ ] Package exports resolve correctly in consuming modules
- [ ] Turbo build with consuming feature packages passes

### Tests

- [ ] All package tests pass: `pnpm --filter @hbc/smart-empty-state test`
- [ ] Coverage thresholds met: lines/branches/functions/statements ≥95
- [ ] Classification precedence tested with overlapping flags
- [ ] Visit store fallback tested (storage unavailable path)
- [ ] Hook tests validate first-visit lifecycle and stable resolution output
- [ ] Component tests validate 5 classifications × 2 variants × complexity behavior

### Storage / API (SF11 persistence surface)

- [ ] Browser storage key format verified: `hbc::empty-state::visited::{module}::{view}`
- [ ] Storage read/write errors handled without runtime crash
- [ ] In-memory fallback path tested and documented
- [ ] SPFx-hosted behavior validated (no storage hard failure)

### Integration

- [ ] BD reference config integrated in module list-view empty state
- [ ] Estimating reference config integrated in module list-view empty state
- [ ] Project Hub reference config integrated in module list-view empty state
- [ ] Admin reference config integrated in module list-view empty state

### Documentation

- [ ] `docs/architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md` written and accepted
- [ ] `docs/how-to/developer/smart-empty-state-adoption-guide.md` written
- [ ] `docs/reference/smart-empty-state/api.md` written
- [ ] `packages/smart-empty-state/README.md` written
- [ ] `docs/README.md` ADR index updated with ADR-0100 entry
- [ ] `current-state-map.md §2` updated with SF11 plan classification row and ADR-0100 linkage

---

## ADR-0100: Smart Empty State Platform Primitive

**File:** `docs/architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md`

```markdown
# ADR-0100 — Smart Empty State Platform Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source specification PH7-SF-11 referenced ADR-0020. Per current ADR allocation policy, the canonical ADR for SF11 is ADR-0100.

## Context

Empty states across HB Intel modules are currently inconsistent and often non-actionable, harming first-use learnability and onboarding quality.

## Decisions

### D-01 — Classification Precedence
`loading-failed > permission-empty > filter-empty > first-use > truly-empty`.

### D-02 — Resolver Contract
Modules define content through `ISmartEmptyStateConfig.resolve(context)`.

### D-03 — CTA Model
At most two CTAs plus optional filter-clear action.

### D-04 — First-Visit Persistence
Adapter interface with browser fallback; no hard dependency on `@hbc/session-state`.

### D-05 — Complexity Behavior
Essential shows tip, Standard collapses tip, Expert hides tip.

### D-06 — Variant Model
`full-page` and `inline` variants share classification semantics.

### D-07 — SPFx Compatibility
App-shell-safe components only; no external asset dependency.

### D-08 — Notification Boundary
No package-level dependency on notification-intelligence.

### D-09 — Adoption Baseline
BD/Estimating/Project Hub/Admin provide reference configs.

### D-10 — Testing Sub-Path
`@hbc/smart-empty-state/testing` exposes canonical fixtures and classification states.

## Compliance

This ADR is locked and may be superseded only by a new ADR with explicit rationale.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/smart-empty-state-adoption-guide.md`

Required sections:

1. When to use `@hbc/smart-empty-state`
2. Implementing `ISmartEmptyStateConfig.resolve(context)`
3. Integrating `HbcSmartEmptyState` in a list or dashboard view
4. First-visit persistence strategies (default vs custom adapter)
5. Complexity-specific guidance authoring (Essential/Standard/Expert)
6. Using `@hbc/smart-empty-state/testing` fixtures

---

## API Reference

**File:** `docs/reference/smart-empty-state/api.md`

Publish canonical export table including:

- `EmptyStateClassification`
- `IEmptyStateContext`
- `IEmptyStateAction`
- `IEmptyStateConfig`
- `ISmartEmptyStateConfig`
- `IEmptyStateVisitStore`
- `useFirstVisit`
- `useEmptyState`
- `classifyEmptyState`
- `createEmptyStateVisitStore`
- `HbcSmartEmptyState`
- `HbcEmptyStateIllustration`
- testing exports (`createMockEmptyStateContext`, `createMockEmptyStateConfig`, `mockEmptyStateClassifications`)

---

## Package README

**File:** `packages/smart-empty-state/README.md`

Must include:

- Overview and classification model
- Quick-start usage with `ISmartEmptyStateConfig`
- Complexity behavior table
- Storage adapter behavior notes
- Exports table
- Architecture boundary rules
- Links to SF11 master plan, T07 references, ADR-0100, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0100](architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md) | Smart Empty State Platform Primitive | Accepted | 2026-03-10 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update §2 with:

- SF11 shared-feature plans row (classification + completion/status)
- ADR-0100 row linkage
- If generated during T09, add rows for:
  - `docs/how-to/developer/smart-empty-state-adoption-guide.md`
  - `docs/reference/smart-empty-state/api.md`
- Update “Next unreserved ADR number” after ADR-0100 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/smart-empty-state...
pnpm turbo run lint --filter @hbc/smart-empty-state...
pnpm --filter @hbc/smart-empty-state check-types
pnpm --filter @hbc/smart-empty-state test --coverage

# Boundary checks (must return zero matches)
grep -r "from '@hbc/notification-intelligence'" packages/smart-empty-state/src/
grep -r "from '@hbc/versioned-record'" packages/smart-empty-state/src/
grep -r "from '@hbc/bic-next-move'" packages/smart-empty-state/src/
grep -r "from 'packages/features/" packages/smart-empty-state/src/

# Documentation checks
test -f docs/architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md
test -f docs/how-to/developer/smart-empty-state-adoption-guide.md
test -f docs/reference/smart-empty-state/api.md
test -f packages/smart-empty-state/README.md
```

---

## Blueprint Progress Comment

Append to `SF11-Smart-Empty-State.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF11 completed: {DATE}
T01–T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md
Documentation added:
  - docs/how-to/developer/smart-empty-state-adoption-guide.md
  - docs/reference/smart-empty-state/api.md
  - packages/smart-empty-state/README.md
docs/README.md ADR index updated: ADR-0100 row appended.
current-state-map.md §2 updated with SF11 and ADR-0100 rows.
-->
```
