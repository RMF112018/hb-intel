# Phase 7 — Artifact Plan

## 1. Purpose

This document lists every intended Phase 7 output by repo area, with purpose, expected location, and justification. It is the canonical reference for what Phase 7 will produce and where artifacts belong.

All entries are grounded in the Phase 7 gap map (`admin-spfx-phase-7-provisioning-gap-map.md`) and hardening baseline (`admin-spfx-phase-7-provisioning-hardening-baseline.md`).

## 2. Backend / functions

### 2.1 Failure classification function

- **Purpose**: classify errors at saga failure time into `transient`, `structural`, `permissions`, or `repeated` — populating the orphaned `failureClass` field.
- **Location**: `backend/functions/src/functions/provisioningSaga/classify-failure.ts`
- **Why Phase 7**: gap map section 7 confirms `failureClass` is never populated. The admin UI already reads it. Wiring this immediately improves operator failure visibility.

### 2.2 Endpoint health-check probes

- **Purpose**: verify SharePoint and Graph endpoints are reachable before saga launch, catching misconfigured or unreachable endpoints at prerequisite time instead of at Step 1.
- **Location**: `backend/functions/src/functions/provisioningSaga/preflight-health-check.ts`
- **Why Phase 7**: gap map section 6 confirms no runtime health-check of external endpoints exists. Pre-launch failures are cheaper and clearer than mid-saga failures.

### 2.3 Step 6 compensation (Entra group deletion)

- **Purpose**: delete Entra ID security groups created by Step 6 during compensation, preventing orphaned groups on saga failure.
- **Location**: `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts` (add `compensateStep6` export)
- **Consumers**: `saga-orchestrator.ts` compensation chain
- **Why Phase 7**: gap map section 8 confirms Step 6 has no compensation. Orphaned Entra groups are a concrete operational debt.

### 2.4 Step 5 deferral deadline enforcement

- **Purpose**: auto-escalate deferred Step 5 jobs to Failed when they exceed a configurable age threshold (default: 7 days).
- **Location**: `backend/functions/src/functions/timerFullSpec/handler.ts` (modify existing timer handler)
- **Why Phase 7**: gap map section 8 confirms no maximum deferral window exists. Stale deferred jobs can linger indefinitely.

### 2.5 Retry audit logging

- **Purpose**: log the identity (OID) and timestamp of admin-initiated retries in the durable run record.
- **Location**: `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` (modify `retry()` method) and `backend/functions/src/functions/provisioningSaga/index.ts` (pass caller identity to retry)
- **Why Phase 7**: gap map section 8 confirms admin Force Retry has no audit trail.

### 2.6 Evidence payload assembly

- **Purpose**: construct a structured evidence summary (step errors, durations, attempt counts, permission posture) for the admin detail modal.
- **Location**: `backend/functions/src/functions/provisioningSaga/build-evidence-payload.ts`
- **Why Phase 7**: gap map section 7 confirms no aggregated evidence payload exists. Step details are scattered across `stepsJson` fields.

### 2.7 Enriched error context

- **Purpose**: capture structured error codes and categorization for Graph API responses (403/404/409/429) and Step 5 timeouts (App Catalog status, install-attempt details).
- **Location**: step files in `backend/functions/src/functions/provisioningSaga/steps/` (enrich error metadata) and `backend/functions/src/services/graph-service.ts` (structured error wrapping)
- **Why Phase 7**: gap map section 7 confirms Graph errors surface as generic messages and Step 5 timeout context is minimal.

### 2.8 Tests for hardening changes

- **Purpose**: unit tests for failure classification, health-check probes, Step 6 compensation, deferral deadline, evidence payload, and retry audit.
- **Location**: `backend/functions/src/functions/provisioningSaga/__tests__/` (new test files adjacent to existing tests)
- **Why Phase 7**: every behavioral change requires targeted test coverage.

## 3. Packages / provisioning

### 3.1 Evidence payload type

- **Purpose**: define the `IProvisioningEvidence` type for the structured evidence summary exposed through the provisioning API.
- **Location**: `packages/provisioning/src/types/` or via `@hbc/models` if the type is shared beyond provisioning consumers
- **Why Phase 7**: the evidence payload needs a typed contract for the admin detail modal to consume.

### 3.2 Failure classification display updates

- **Purpose**: ensure the provisioning package's display registries and status helpers align with the new failure classification values populated by the backend.
- **Location**: `packages/provisioning/src/` (targeted updates to existing files)
- **Why Phase 7**: the admin UI's failure display depends on correct mapping between backend-assigned `failureClass` values and display labels/badges.

## 4. Apps / admin

### 4.1 Evidence payload rendering in detail modal

- **Purpose**: render the structured evidence summary in the ProvisioningOversightPage detail modal, replacing the current scattered step-field reading.
- **Location**: `apps/admin/src/pages/ProvisioningOversightPage.tsx` (modify detail modal section)
- **Why Phase 7**: gap map section 7 identifies the lack of aggregated evidence as a visibility gap. The detail modal is the natural home.

### 4.2 Conditional recovery guidance

- **Purpose**: show step-aware and failure-class-aware recovery recommendations in the detail modal, beyond static runbook links.
- **Location**: `apps/admin/src/utils/recoveryGuidance.ts` (new) + integration in `ProvisioningOversightPage.tsx`
- **Why Phase 7**: gap map section 8 confirms recovery guidance is display-only with no conditional logic.

### 4.3 Retry audit trail display

- **Purpose**: show who initiated each retry attempt in the detail modal's retry history.
- **Location**: `apps/admin/src/pages/ProvisioningOversightPage.tsx` (modify retry history section)
- **Why Phase 7**: audit trail visibility is the UI side of backend artifact 2.5.

### 4.4 Dead code removal — SetupLanePage

- **Purpose**: remove `apps/admin/src/pages/SetupLanePage.tsx` which is unreferenced dead code superseded by `SetupWizardPage.tsx`.
- **Location**: delete `apps/admin/src/pages/SetupLanePage.tsx`
- **Why Phase 7**: gap map section 4 confirms this file is dead code. Prompt 09 (route/UI corrections) is the natural prompt for this cleanup.

### 4.5 README lane count correction

- **Purpose**: update `apps/admin/README.md` to reflect the actual active lane count (5+ real pages, not 3).
- **Location**: `apps/admin/README.md`
- **Why Phase 7**: gap map section 9 confirms this documentation drift. Prompt 10 is the natural prompt for this update.

## 5. Docs / runbooks

### 5.1 Provisioning operator runbook

- **Purpose**: document the hardened provisioning flow for operators — normal-path expectations, failure-class meanings, retry/escalation procedures, Step 5 deferral behavior, and when to escalate beyond the admin console.
- **Location**: `docs/how-to/operator/provisioning-runbook.md`
- **Why Phase 7**: gap map section 9 confirms docs are thin relative to Phase 7 needs. Operators need actionable guidance for the hardened flow.

### 5.2 Backend README updates

- **Purpose**: update `backend/functions/README.md` to document permission model diagnostics, failure classification, health-check probes, and evidence payload behavior.
- **Location**: `backend/functions/README.md`
- **Why Phase 7**: gap map section 9 confirms the backend README does not document permission model diagnostic behavior added in earlier phases.

### 5.3 Provisioning package README updates

- **Purpose**: update `packages/provisioning/README.md` to reflect Phase 7 additions (evidence type, failure classification alignment).
- **Location**: `packages/provisioning/README.md`
- **Why Phase 7**: gap map section 9 confirms the provisioning README is stale relative to newer exports.

### 5.4 Phase 7 implementation record

- **Purpose**: document what Phase 7 actually delivered, decisions made, and residual items for later phases.
- **Location**: `docs/architecture/plans/MASTER/spfx/admin/phase-07/admin-spfx-phase-7-implementation-record.md`
- **Why Phase 7**: standard phase closure artifact.

## 6. Tests / validation

### 6.1 Backend unit tests

- **Scope**: failure classification logic, health-check probes, Step 6 compensation, deferral deadline, evidence payload construction, retry audit fields.
- **Location**: `backend/functions/src/functions/provisioningSaga/__tests__/`
- **Why Phase 7**: every Phase 7 behavioral change needs test coverage.

### 6.2 Admin UI test updates

- **Scope**: update ProvisioningOversightPage tests to cover evidence payload rendering, conditional recovery guidance, and retry audit display.
- **Location**: `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- **Why Phase 7**: UI behavior changes require test updates.

### 6.3 End-to-end validation evidence

- **Scope**: demonstrate straight-through normal run remains streamlined and failure cases produce classified, evidence-rich results.
- **Location**: validation output in phase implementation record
- **Why Phase 7**: Phase 7 acceptance criteria require proof that normal runs are not degraded and failure visibility is improved.

## 7. No-go boundaries

Phase 7 must **not**:

- **Replace the provisioning model wholesale**: the 7-step saga, Table Storage persistence, and compensation chain are preserved. Phase 7 hardens — it does not redesign.
- **Complete all observability architecture**: in-memory alert/probe stores, deferred monitors, deferred probes, SMTP relay, and durable webhook delivery are Phase 12 scope. Phase 7 improves provisioning-specific diagnostics only.
- **Implement broad SharePoint governance**: ValidationLanePage and SharePointLanePage scaffold content is Phase 8. Phase 7 does not populate these lanes.
- **Pull privileged execution into SPFx**: the target architecture requires backend-owned orchestration, retry, compensation, and platform operations. SPFx observes, triggers, and manages — it never executes.
- **Blur into Phase 11 destructive-action safety**: recovery visibility improvements must not introduce the destructive-action safety framework.
- **Implement ErrorLogPage or approval persistence**: both are SF17-T05 deferred scope.

## 8. Prompt-to-artifact mapping

| Prompt | Primary artifacts |
|--------|------------------|
| P7-01 | Gap map (complete) |
| P7-02 | Hardening baseline + artifact plan (this document, complete) |
| P7-03 | Health-check probes, prerequisite validation hardening |
| P7-04 | Failure classification function, Step 6 compensation, Step 5 deferral deadline |
| P7-05 | Recovery guidance, retry audit logging |
| P7-06 | Evidence payload assembly, enriched error context, diagnostics telemetry |
| P7-07 | Install/bootstrap and Entra readiness integration |
| P7-08 | Provisioning package and client surface alignment |
| P7-09 | SPFx route/UI corrections (dead code removal, scaffold improvements) |
| P7-10 | Docs, runbooks, README updates, validation reconciliation |
