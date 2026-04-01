# Phase 1 — Authoritative Documentation Reconciliation

**Phase:** Phase 1 — Workflow Contract and Boundary Freeze
**Prompt:** Prompt-05
**Date:** 2026-04-01
**Classification:** Reconciliation Record (contract-freeze artifact)
**Depends on:**
- `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`
- `docs/architecture/reviews/phase-1-application-boundary-freeze.md`
- `docs/architecture/reviews/phase-1-validation-audit-evidence-freeze.md`

---

## Documents Updated

| Document | Update | Prompt |
|----------|--------|--------|
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Fixed approve action call shape to include `{ projectNumber }` with `##-###-##` format; updated confirmation from `HbcConfirmDialog` to `HbcModal` with `HbcTextField`; added lifecycle freeze and boundary freeze cross-references | P1-02, P1-03 |
| `docs/reference/provisioning/request-lifecycle.md` | Expanded with auto-trigger behavior, system ownership, role authorization, known UI gap, and Phase 1 freeze reference sections | P1-02 |
| `docs/reference/provisioning/notification-event-matrix.md` | Added staleness notice: recipient resolution section (env-var model) is stale; event types remain accurate | P1-02 |
| `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md` | Added historical-context annotation: state definitions valid, provisioning trigger semantics and service-factory posture superseded | P1-02 |
| `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` | Added boundary freeze cross-reference documenting bounded retry conditions | P1-03 |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Added boundary freeze cross-reference documenting exclusive recovery scope | P1-03 |
| `docs/reference/workflow-experience/setup-notification-registrations.md` | Fixed ambiguous `ready-to-provision` event description from "ready for external setup and provisioning trigger" to "Request approved with `projectNumber`; backend auto-triggers provisioning saga"; fixed Who-Fires-Each entry from "external setup complete, provisioning queued" to "controller approval advances request to `ReadyToProvision`; auto-trigger fires saga" | P1-05 |

---

## Documents Reviewed but Left Unchanged

| Document | Reason |
|----------|--------|
| `docs/architecture/blueprint/current-state-map.md` | Already classifies all relevant docs correctly; authority hierarchy aligns with Phase 1 freeze decisions; no contradictory Project Setup claims found |
| `docs/reference/provisioning/verification-matrix.md` | Accurately reflects current test coverage for all lifecycle paths; no stale claims; happy path, clarification path, failure/recovery path, admin oversight, and ownership all correctly evidenced |
| `docs/reference/developer/project-setup-connected-service-posture.md` | Accurately describes current identity model, CORS posture, config validation tiers, permission gates, and service factory architecture; no contradictory claims; already captures the correct auth posture (managed identity, not env-var authorization) |

---

## Current Authoritative Source List for Later Work

A later implementation agent should consult these sources in this precedence order:

### Lifecycle Semantics

| Priority | Source | Governs |
|----------|--------|---------|
| 1 | Live repo code (`packages/provisioning/src/state-machine.ts`, `backend/functions/src/state-machine.ts`) | State definitions, transitions, role authorization |
| 2 | `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md` | Frozen lifecycle contract: state definitions, trigger explanation, approval action, system ownership |
| 3 | `docs/reference/provisioning/request-lifecycle.md` | Lifecycle reference with auto-trigger, system ownership, role authorization, UI gap |
| 4 | `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md` | Historical lineage only (annotated); trigger semantics superseded |

### Provisioning Trigger Semantics

| Priority | Source | Governs |
|----------|--------|---------|
| 1 | Live repo code (`backend/functions/src/functions/projectRequests/index.ts` lines 351-390) | Auto-trigger implementation, guard conditions, fire-and-forget pattern |
| 2 | `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md` (Section 4) | Frozen trigger explanation: 9-step sequence from approval to terminal |
| 3 | `docs/reference/provisioning/request-lifecycle.md` (Auto-Trigger Behavior section) | Concise reference for auto-trigger behavior |

### Exact Approval Action Contract

| Priority | Source | Governs |
|----------|--------|---------|
| 1 | Live repo code (`apps/accounting/src/pages/ProjectReviewDetailPage.tsx` lines 118-123) | `advanceState(requestId, 'ReadyToProvision', { projectNumber })` |
| 2 | `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md` (Section 5) | Frozen approval contract: call shape, validation, side effects, feedback |
| 3 | `docs/reference/spfx-surfaces/controller-review-surface.md` (API Method Mapping) | Surface-level approve action documentation |

### Accounting/Admin/Estimating Boundary

| Priority | Source | Governs |
|----------|--------|---------|
| 1 | `docs/architecture/reviews/phase-1-application-boundary-freeze.md` | Frozen boundary model: 4 matrices, per-surface scope, prohibited drift, gap register |
| 2 | `docs/reference/spfx-surfaces/controller-review-surface.md` | Accounting surface actions and routes |
| 3 | `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` | Estimating coordinator bounded retry and escalation |
| 4 | `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Admin exclusive recovery actions |

### Validation Rules

| Priority | Source | Governs |
|----------|--------|---------|
| 1 | Live repo code (`backend/functions/src/functions/projectRequests/index.ts`) | Submission validation (14+ fields), projectNumber format enforcement |
| 2 | `docs/architecture/reviews/phase-1-validation-audit-evidence-freeze.md` | Frozen validation contract: frontend assistive, backend authoritative, approval gate checklist, known gaps |

### Audit/Evidence Expectations

| Priority | Source | Governs |
|----------|--------|---------|
| 1 | Live repo code (`backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`) | Saga audit records, notification dispatch, provisioning status persistence |
| 2 | `docs/architecture/reviews/phase-1-validation-audit-evidence-freeze.md` | Frozen evidence contract: currently persisted vs required, audit trail expectations, identifier/correlation requirements |
| 3 | `docs/reference/provisioning/verification-matrix.md` | Pass/fail evidence for all lifecycle paths |

### Current Auth/Role/Host Posture

| Priority | Source | Governs |
|----------|--------|---------|
| 1 | Live repo code (`backend/functions/src/middleware/auth.ts`, `authorization.ts`) | withAuth wrapper, role checks, ownership, scope, telemetry |
| 2 | `docs/reference/developer/project-setup-connected-service-posture.md` | Connected-service posture: identity model, CORS, config tiers, permission gates |
| 3 | `docs/architecture/reviews/phase-1-validation-audit-evidence-freeze.md` (Section 5) | Role/auth context classification: authorization-critical vs notification-routing-only |

### Project Setup Production-Readiness Posture

| Priority | Source | Governs |
|----------|--------|---------|
| 1 | `docs/reference/developer/project-setup-connected-service-posture.md` | Full production posture: managed identity, CORS, config validation, permission gates, service factory |
| 2 | `docs/architecture/blueprint/current-state-map.md` | Document classification and authority hierarchy |

---

## Document Classification

### Superseded

| Document | Superseded Aspect | Still Useful For | Annotation |
|----------|-------------------|-----------------|------------|
| `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md` | Provisioning trigger semantics (implied manual controller launch); service-factory and auth posture | State definitions, transition rules, `projectNumber` format requirement, SharePoint list schema | Historical-context annotation added (P1-02) |

### Historical but Still Useful as Evidence

| Document | Evidence Value | Risk If Misread | Annotation |
|----------|---------------|-----------------|------------|
| `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md` | Original lifecycle design intent, data model lineage, SharePoint list schema | Trigger semantics could mislead if treated as current | Historical-context annotation added (P1-02) |

### Partially Stale

| Document | Stale Aspect | Current Aspect | Annotation |
|----------|-------------|---------------|------------|
| `docs/reference/provisioning/notification-event-matrix.md` | Recipient Resolution section (env-var model: `CONTROLLER_UPNS`, `ADMIN_UPNS`) | Event types, tier classifications, channel assignments (8-event contract) | Staleness notice added (P1-02) |

### Still Authoritative in Limited Scope

| Document | Authoritative For | Not Authoritative For |
|----------|-------------------|----------------------|
| `docs/reference/provisioning/notification-event-matrix.md` | Event types and tier classifications (original 8) | Recipient resolution method; superseded by 15-event contract in `setup-notification-registrations.md` |
| `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md` | State definitions, transition rules, projectNumber format, SharePoint list schema | Trigger semantics, service-factory posture, auth posture |
| `docs/reference/provisioning/request-lifecycle.md` | Transition rules, auto-trigger, system ownership, role authorization | Historical reference ID (D-PH6-08) in title is lineage, not current authority |

---

## Superseded Statements Removed or Annotated

| Document | Statement | Action | Prompt |
|----------|-----------|--------|--------|
| `controller-review-surface.md` | `advanceState(id, 'ReadyToProvision')` (bare call without projectNumber) | Replaced with `advanceState(id, 'ReadyToProvision', { projectNumber })` | P1-02 |
| `controller-review-surface.md` | Approve confirmation: `HbcConfirmDialog` | Replaced with `HbcModal` with `HbcTextField` for projectNumber | P1-02 |
| `notification-event-matrix.md` | Recipient resolution via `CONTROLLER_UPNS` / `ADMIN_UPNS` env vars | Annotated as stale; cross-referenced to lifecycle freeze and current notification registrations | P1-02 |
| `PH6.8-RequestLifecycle-StateEngine.md` | Implied distinct controller-side launch action post-approval | Annotated as historical; trigger semantics superseded by auto-trigger | P1-02 |
| `setup-notification-registrations.md` | `ready-to-provision` event: "ready for external setup and provisioning trigger" | Replaced with "Request approved with `projectNumber`; backend auto-triggers provisioning saga" | P1-05 |
| `setup-notification-registrations.md` | `ready-to-provision` Who-Fires-Each: "external setup complete, provisioning queued" | Replaced with "controller approval advances request to `ReadyToProvision`; auto-trigger fires saga" | P1-05 |

---

## Remaining Documentation Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| R-01 | `current-state-map.md` classifies `notification-event-matrix.md` as "Living Reference" without noting its partially stale recipient resolution section | Low | The staleness annotation in the doc itself is sufficient; current-state-map classifies the doc family, not individual sections |
| R-02 | `PH6.8` remains in `docs/architecture/plans/` alongside active plans, potentially confusing agent prioritization | Low | Historical-context annotation is present; authority hierarchy rules in CLAUDE.md and freeze docs explicitly deprioritize PH6 plans |
| R-03 | The 15-event notification contract (`setup-notification-registrations.md`) references some events not yet wired in the backend (events 9-15 from G3-T04) | Medium | These events are from the canonical normative plan, not live code; later implementation should verify which are wired vs planned before building on them |
| R-04 | `verification-matrix.md` date (2026-03-15) predates some Phase 1 freeze decisions | Low | The matrix covers Wave 0 closeout verification, which remains valid; Phase 1 freeze is a documentation-reconciliation phase, not a code-change phase |

---

## Verification

### Drift Types Reconciled

| Drift Type | Found In | Resolution |
|-----------|----------|------------|
| Controller later launches provisioning | PH6.8, notification-event-matrix (implicit) | PH6.8 annotated (P1-02); notification-event-matrix annotated (P1-02); setup-notification-registrations fixed (P1-05) |
| Approve action omits projectNumber | controller-review-surface.md (original) | Fixed to include `{ projectNumber }` with format requirement (P1-02) |
| Env-var recipient config treated as authorization | notification-event-matrix.md | Annotated as stale; env vars classified as notification-routing-only in validation-audit-evidence-freeze (P1-04) |
| Contract-valid transition implied as live UI action | No remaining instances found | request-lifecycle.md and boundary-freeze explicitly separate valid transitions from live UI actions |
| Older notification docs useful only as historical evidence | notification-event-matrix.md | Annotated with staleness notice and cross-reference to current canonical source |

### Reconciliation Completeness

All five drift types specified in Prompt-05 have been addressed. The authoritative documentation set is now coherent:

- Lifecycle semantics → frozen in `phase-1-lifecycle-freeze-decision.md`, reflected in `request-lifecycle.md`
- Trigger semantics → frozen in `phase-1-lifecycle-freeze-decision.md`, stale wording fixed in `setup-notification-registrations.md`
- Approval contract → frozen in `phase-1-lifecycle-freeze-decision.md`, reflected in `controller-review-surface.md`
- Boundary model → frozen in `phase-1-application-boundary-freeze.md`, cross-referenced in all three surface docs
- Validation/evidence → frozen in `phase-1-validation-audit-evidence-freeze.md`
- Auth/host posture → documented in `project-setup-connected-service-posture.md`, classified in validation-audit-evidence-freeze
- Stale docs → annotated with explicit scope limitations and cross-references to current authority
