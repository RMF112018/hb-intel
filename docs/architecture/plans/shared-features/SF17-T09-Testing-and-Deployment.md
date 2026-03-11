# SF17-T09 - Testing and Deployment: Admin Intelligence

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-17-Module-Feature-Admin-Intelligence.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF17-T09 testing/deployment task; sub-plan of `SF17-Admin-Intelligence.md`.

---

## Objective

Finalize Admin Intelligence with SF11-grade closure requirements: full testing gates, ADR publication, adoption/reference docs, README conformance, ADR index updates, and `current-state-map` governance updates.

---

## 3-Line Plan

1. Complete monitor/probe/approval/hook/component verification with >=95% coverage.
2. Pass mechanical enforcement gates and integration boundary checks.
3. Publish ADR-0106 and all required documentation/index/state-map updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification
- [ ] admin-intelligence remains in `@hbc/features-admin` boundary
- [ ] no direct feature-app imports into package runtime
- [ ] approval writes only through `ApprovalAuthorityApi`
- [ ] monitor and probe engines are isolated from UI concerns
- [ ] app-shell-safe components only in admin-intelligence surfaces
- [ ] boundary grep checks return zero prohibited matches

### Type Safety
- [ ] zero TypeScript errors: `pnpm --filter @hbc/features-admin check-types`
- [ ] alert contracts stable across monitor/api/hooks/components
- [ ] probe result and snapshot contracts stable
- [ ] approval authority rule and eligibility contracts stable

### Build & Package
- [ ] package build succeeds
- [ ] runtime and testing entrypoints emitted
- [ ] testing sub-path excluded from production bundle
- [ ] exports resolve from `apps/admin` and dependent packages
- [ ] turbo build with admin and acknowledgment surfaces succeeds

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (lines/branches/functions/statements >=95)
- [ ] monitor detection and auto-resolve tests complete
- [ ] probe scheduler retry/degraded tests complete
- [ ] approval eligibility and editor flow tests complete
- [ ] end-to-end admin-intelligence scenario passes

### Storage/API (Alerts, Probes, Approval Policy)
- [ ] alert persistence and acknowledge semantics validated
- [ ] probe snapshot persistence validated
- [ ] 15-minute default probe schedule validated
- [ ] approval authority list schema and audit fields validated

### Integration
- [ ] notification-intelligence routing policy validated
- [ ] acknowledgment approver resolution via authority API validated
- [ ] complexity gating validated across Essential/Standard/Expert
- [ ] versioned-record governance linkage validated where configured

### Documentation
- [ ] `docs/architecture/adr/ADR-0106-admin-intelligence-layer.md` written and accepted
- [ ] `docs/how-to/developer/admin-intelligence-adoption-guide.md` written
- [ ] `docs/reference/admin-intelligence/api.md` written
- [ ] `packages/features/admin/README.md` conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0106 entry
- [ ] `current-state-map.md §2` updated with SF17 and ADR-0106 linkage

---

## ADR-0106: Admin Intelligence Layer

**File:** `docs/architecture/adr/ADR-0106-admin-intelligence-layer.md`

```markdown
# ADR-0106 - Admin Intelligence Layer

**Status:** Accepted
**Date:** 2026-03-11
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-17 referenced ADR-0026. Canonical ADR number for SF17 is ADR-0106.

## Context

Production trust requires proactive admin alerting, verifiable infrastructure truth, and configurable approval authority.

## Decisions

### D-01 - Package Alignment
Admin-intelligence is delivered within `@hbc/features-admin`.

### D-02 - Alert Scope
Use six monitored admin conditions with explicit severity.

### D-03 - Alert Lifecycle
Acknowledge marks seen; resolve only on source-condition clear.

### D-04 - Probe Scheduling
Run implementation-truth probes on a default 15-minute schedule.

### D-05 - Approval Authority Storage
Store approval authority in admin-managed policy records.

### D-06 - Approval Integration
Approval consumers resolve approvers through `ApprovalAuthorityApi`.

### D-07 - Complexity Behavior
Essential badge only; Standard dashboard; Expert full diagnostics and simulation.

### D-08 - Notification Policy
Critical/high immediate; medium/low digest.

### D-09 - Platform Constraints
Use app-shell-safe UI composition.

### D-10 - Testing Sub-Path
Expose canonical fixtures via `@hbc/features-admin/testing`.

## Compliance

This ADR is locked and superseded only by follow-up ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/admin-intelligence-adoption-guide.md`

Required sections:

1. registering and tuning alert monitors
2. implementing and scheduling infrastructure probes
3. integrating badge/dashboard/truth-layer views in admin routes
4. configuring approval authority rules and testing eligibility
5. integrating with acknowledgment and notification-intelligence
6. using fixtures from `@hbc/features-admin/testing`

---

## API Reference

**File:** `docs/reference/admin-intelligence/api.md`

Must include export table entries for:

- `IAdminAlert`
- `IAdminAlertBadge`
- `IInfrastructureProbeResult`
- `IProbeSnapshot`
- `IApprovalAuthorityRule`
- `ApprovalAuthorityApi`
- `useAdminAlerts`
- `useInfrastructureProbes`
- `useApprovalAuthority`
- `AdminAlertBadge`
- `AdminAlertDashboard`
- `ImplementationTruthDashboard`
- `ApprovalAuthorityTable`
- testing exports (`createMockAdminAlert`, `createMockProbeSnapshot`, `createMockApprovalAuthorityRule`, `mockAdminIntelligenceStates`)

---

## Package README Conformance

**File:** `packages/features/admin/README.md`

Verify README contains:

- admin-intelligence overview
- quick-start setup
- monitor/probe/approval architecture summary
- exports table
- boundary rules
- links to SF17 master, T09, ADR-0106, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0106](architecture/adr/ADR-0106-admin-intelligence-layer.md) | Admin Intelligence Layer | Accepted | 2026-03-11 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update section 2 with:

- SF17 plan-family row
- ADR-0106 row linkage
- optional doc rows (if authored in same pass):
  - `docs/how-to/developer/admin-intelligence-adoption-guide.md`
  - `docs/reference/admin-intelligence/api.md`
- next unreserved ADR number after ADR-0106 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/features-admin...
pnpm turbo run lint --filter @hbc/features-admin...
pnpm --filter @hbc/features-admin check-types
pnpm --filter @hbc/features-admin test --coverage

# Boundary checks
rg -n "from 'packages/features/" packages/features/admin/src
rg -n "ApprovalAuthorityApi" packages/features/admin/src

# Documentation checks
test -f docs/architecture/adr/ADR-0106-admin-intelligence-layer.md
test -f docs/how-to/developer/admin-intelligence-adoption-guide.md
test -f docs/reference/admin-intelligence/api.md
test -f packages/features/admin/README.md
```

---

## Blueprint Progress Comment

Append to `SF17-Admin-Intelligence.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF17 completed: {DATE}
T01-T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0106-admin-intelligence-layer.md
Documentation added:
  - docs/how-to/developer/admin-intelligence-adoption-guide.md
  - docs/reference/admin-intelligence/api.md
  - packages/features/admin/README.md
docs/README.md ADR index updated: ADR-0106 row appended.
current-state-map.md section 2 updated with SF17 and ADR-0106 rows.
-->
```
