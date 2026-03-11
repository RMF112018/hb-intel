# SF20-T09 - Testing and Deployment: BD Heritage & Strategic Intelligence

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF20-T09 testing/deployment task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Finalize SF20 with SF11-grade closure requirements: full test completion, ADR template, adoption guide, API reference, README conformance, ADR index updates, blueprint progress comment, and `current-state-map` governance updates.

---

## 3-Line Plan

1. Complete heritage/intelligence lifecycle tests and cross-module validation at >=95% coverage.
2. Pass mechanical gates and architecture boundary checks.
3. Publish ADR-0109 and all required documentation/index/state-map updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification
- [ ] heritage/intelligence remains within `@hbc/features-business-development`
- [ ] no app-route imports in package runtime
- [ ] heritage panel enforces read-only data model
- [ ] approval authority resolved via admin policy APIs
- [ ] app-shell-safe components validated for all surfaces
- [ ] boundary grep checks return zero prohibited matches

### Type Safety
- [ ] zero TypeScript errors: `pnpm --filter @hbc/features-business-development check-types`
- [ ] heritage/intelligence contracts stable end-to-end
- [ ] approval action/queue contracts stable
- [ ] status transition contract (`pending -> approved/rejected`) stable

### Build & Package
- [ ] package build succeeds
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundle
- [ ] exports resolve in BD/Estimating/Project Hub consumers
- [ ] turbo build with dependencies succeeds

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (lines/branches/functions/statements >=95)
- [ ] permission and approval lifecycle tests complete
- [ ] hook transition tests complete
- [ ] panel/feed/form/queue component tests complete
- [ ] end-to-end contributor->approver->approved scenario passing

### Storage/API (Heritage + Intelligence + Approval + Indexing)
- [ ] handoff snapshot heritage sourcing validated
- [ ] intelligence entry persistence and versioning validated
- [ ] approval queue semantics validated
- [ ] approved-only indexing behavior validated

### Integration
- [ ] workflow-handoff heritage source integration validated
- [ ] acknowledgment + admin approval authority integration validated
- [ ] notification-intelligence event routing validated
- [ ] search/project-canvas/complexity integration behavior validated

### Documentation
- [ ] `docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md` written and accepted
- [ ] `docs/how-to/developer/bd-heritage-strategic-intelligence-adoption-guide.md` written
- [ ] `docs/reference/bd-heritage-strategic-intelligence/api.md` written
- [ ] `packages/features/business-development/README.md` conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0109 entry
- [ ] `current-state-map.md §2` updated with SF20 and ADR-0109 linkage

---

## ADR-0109: BD Heritage Panel & Living Strategic Intelligence

**File:** `docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md`

```markdown
# ADR-0109 - BD Heritage Panel and Living Strategic Intelligence

**Status:** Accepted
**Date:** 2026-03-11
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-20 referenced ADR-0029. Canonical ADR number for SF20 is ADR-0109.

## Context

BD context is lost at handoff, and strategic intelligence is not persistently governed or reused across modules.

## Decisions

### D-01 - Package Alignment
Implement within `@hbc/features-business-development`.

### D-02 - Heritage Source
Source heritage data from handoff snapshot and scorecard version references.

### D-03 - Read-Only Panel
Treat heritage panel as immutable context view.

### D-04 - Intelligence Lifecycle
Use submit -> pending-approval -> approved/rejected.

### D-05 - Contributor Permissions
Allow any project-permissioned user to submit entries.

### D-06 - Approval Authority
Resolve approvers from Admin-configured approval authority policies.

### D-07 - Complexity Behavior
Essential minimal, Standard visible context/feed, Expert full feed/history.

### D-08 - Cross-Module Surfaces
Expose stable contracts to BD, Estimating, Project Hub, and Project Canvas.

### D-09 - Search Indexing
Index approved entries only.

### D-10 - Testing Sub-Path
Expose canonical fixtures via `@hbc/features-business-development/testing`.

## Compliance

This ADR is locked and superseded only by explicit follow-up ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/bd-heritage-strategic-intelligence-adoption-guide.md`

Required sections:

1. rendering BD heritage panel from handoff context
2. submitting and revising strategic intelligence entries
3. configuring and operating approval queue workflows
4. integrating feed and queue across module surfaces
5. enforcing approved-only indexing visibility
6. using fixtures from `@hbc/features-business-development/testing`

---

## API Reference

**File:** `docs/reference/bd-heritage-strategic-intelligence/api.md`

Must include export table entries for:

- `IBdHeritageData`
- `IStrategicIntelligenceEntry`
- `IntelligenceEntryType`
- `IStrategicIntelligenceApprovalAction`
- `IStrategicIntelligenceApprovalQueueItem`
- `useBdHeritage`
- `useStrategicIntelligence`
- `useIntelligenceApprovalQueue`
- `BdHeritagePanel`
- `StrategicIntelligenceFeed`
- `IntelligenceEntryForm`
- `IntelligenceApprovalQueue`
- testing exports (`createMockBdHeritageData`, `createMockStrategicIntelligenceEntry`, `createMockIntelligenceApprovalItem`, `mockStrategicIntelligenceStates`)

---

## Package README Conformance

**File:** `packages/features/business-development/README.md`

Verify README contains:

- heritage/intelligence overview
- quick-start setup
- data source + approval architecture summary
- exports table
- boundary rules
- links to SF20 master, T09, ADR-0109, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0109](architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md) | BD Heritage Panel and Living Strategic Intelligence | Accepted | 2026-03-11 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update section 2 with:

- SF20 plan-family row
- ADR-0109 row linkage
- optional doc rows (if authored in same pass):
  - `docs/how-to/developer/bd-heritage-strategic-intelligence-adoption-guide.md`
  - `docs/reference/bd-heritage-strategic-intelligence/api.md`
- next unreserved ADR number after ADR-0109 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/features-business-development...
pnpm turbo run lint --filter @hbc/features-business-development...
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-business-development test --coverage

# Boundary checks
rg -n "from 'apps/" packages/features/business-development/src
rg -n "approvalStatus|pending-approval|approved|rejected" packages/features/business-development/src/heritage-intelligence

# Documentation checks
test -f docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md
test -f docs/how-to/developer/bd-heritage-strategic-intelligence-adoption-guide.md
test -f docs/reference/bd-heritage-strategic-intelligence/api.md
test -f packages/features/business-development/README.md
```

---

## Blueprint Progress Comment

Append to `SF20-BD-Heritage-Panel.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF20 completed: {DATE}
T01-T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md
Documentation added:
  - docs/how-to/developer/bd-heritage-strategic-intelligence-adoption-guide.md
  - docs/reference/bd-heritage-strategic-intelligence/api.md
  - packages/features/business-development/README.md
docs/README.md ADR index updated: ADR-0109 row appended.
current-state-map.md section 2 updated with SF20 and ADR-0109 rows.
-->
```
