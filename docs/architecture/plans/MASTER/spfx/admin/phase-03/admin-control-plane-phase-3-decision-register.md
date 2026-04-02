# Admin Control Plane — Phase 3 Decision Register

**Phase:** Phase 3 — Privileged Backend Foundation  
**Status:** Active (updated per prompt)  
**Date:** 2026-04-02

---

## Decisions

### P3-D01 — In-memory run store for Phase 3

**Decision:** Use an in-memory `Map<string, IAdminRunEnvelope>` for run persistence during Phase 3. Replace with Table Storage in Phase 4.

**Rationale:** Phase 3 focuses on establishing the backend foundation and API surface. Durable persistence is a Phase 4 deliverable. The in-memory store provides a working run lifecycle for development, testing, and handler integration without coupling Phase 3 to storage schema decisions.

**Impact:** Run data is lost on process restart. Acceptable for Phase 3 development. Phase 4 must implement `IAdminRunService` backed by Table Storage.

---

### P3-D02 — Default execution mode and risk level on launch

**Decision:** Default to `AdminExecutionMode.Seamless` and `AdminRiskLevel.Low` for all runs launched during Phase 3. Proper resolution from the action catalog is deferred to P3-06 (adapter registry).

**Rationale:** The action catalog and adapter registry (P3-06) are not yet implemented when the run service is created (P3-05). Hardcoding defaults avoids introducing a circular dependency between run launch and adapter resolution.

**Impact:** All runs appear as seamless/low-risk during Phase 3. P3-06 must wire action catalog lookup into the launch flow.

---

### P3-D03 — Domain field defaults to opaque value until action catalog exists

**Decision:** The `domain` field on `IAdminRunEnvelope` defaults to a placeholder value during Phase 3 until the action catalog (P3-06) provides domain resolution from `actionKey`.

**Rationale:** The `AdminDomain` enum value should be derived from the action key's domain prefix. Without the action catalog, this resolution cannot be performed correctly.

**Impact:** Domain-based filtering in `listRuns` will not return meaningful results until P3-06.

---

### P3-D04 — Admin API routes are admin-control-plane-only (not monolithic)

**Decision:** The `adminApi` route family is registered only in the admin-control-plane host composition root. It is intentionally NOT added to the monolithic host.

**Rationale:** Admin API routes belong exclusively to the admin control plane domain boundary. Adding them to the monolithic host would violate the domain-host pattern (ADR-0124) and create unintended coupling. The monolithic host continues to serve only the original 19 route families.

**Impact:** Admin API endpoints are only accessible through the admin-control-plane host deployment. This is the intended deployment model.

---

### P3-D05 — Provisioning compatibility is additive, not wrapping

**Decision:** The admin API surface is additive alongside existing provisioning endpoints. Admin runs do not wrap or proxy provisioning endpoints. The orchestration bridge (P3-07) will connect admin runs to provisioning execution as a separate dispatch concern.

**Rationale:** Wrapping provisioning endpoints would create fragile coupling and break the existing `ProvisioningOversightPage` which directly calls provisioning-specific endpoints. The admin API provides a parallel generalized surface that later phases can migrate consumers to.

**Impact:** During Phase 3, `ProvisioningOversightPage` continues to use `createProvisioningApiClient` from `@hbc/provisioning` unchanged. No client-side changes needed in `apps/admin`.

---

### P3-D06 — Cancel and retry validate run state before acting

**Decision:** `cancelRun` requires the run to be in a cancellable status (Pending, Validating, Running, AwaitingApproval). `retryRun` requires the run to be in Failed status. Both throw on invalid state.

**Rationale:** State validation prevents impossible transitions and produces clear error messages. This matches the Phase 2 run model state machine.

**Impact:** Handlers must catch service errors and return appropriate HTTP error responses.

---

### P3-D07 — Orchestration bridge delegates via HTTP, not cross-host service call

**Decision:** The provisioning bridge adapter does not directly call `SagaOrchestrator.execute()`. Instead, it acknowledges the invocation and delegates actual saga execution to the project-setup host through existing provisioning HTTP endpoints.

**Rationale:** The saga requires `IProjectSetupServiceContainer` (project-setup host). The admin control plane host has `IAdminControlPlaneServiceContainer`. Cross-host service container access is intentionally prevented by the domain-host doctrine (ADR-0124). Real saga invocation goes through the existing provisioning HTTP endpoints.

**Impact:** The bridge is an acknowledgment/mapping layer, not a direct invocation layer. This keeps provisioning ownership intact and prevents hidden coupling between hosts.

---

### P3-D08 — Provisioning status mapping uses correlationId as runId

**Decision:** When mapping provisioning runs to admin run envelopes, `correlationId` becomes `runId` and `parentCorrelationId` becomes `parentRunId`.

**Rationale:** The provisioning saga uses `correlationId` as the unique run identifier (partition: projectId, row: correlationId). This maps directly to the admin run model's `runId`/`parentRunId` retry chain concept.

**Impact:** Admin run history for provisioning can be correlated with existing provisioning status records in Table Storage.

---

### P3-D09 — Provisioning runs are always Seamless execution mode, Medium risk

**Decision:** All provisioning runs mapped through the bridge use `AdminExecutionMode.Seamless` and `AdminRiskLevel.Medium`.

**Rationale:** The provisioning saga runs straight through unless failure occurs (locked decision #4 from end-state plan). Medium risk reflects that provisioning creates real SharePoint sites and Entra groups.

**Impact:** Consistent with Phase 2 run model expectations for provisioning domain.

---

### P3-D10 — current-state-map updated only for landed implementation

**Decision:** Update `current-state-map.md` only for actual implemented changes: the admin-control-plane host, its route families, and the Phase 3 plan library classification. No target-state claims.

**Rationale:** The current-state-map is present-truth authority. Updating it with Phase 4+ aspirations would violate its purpose.

**Impact:** Future phases must update current-state-map when their implementation lands — not when planned.

---

### P3-D11 — ProvisioningOversightPage and @hbc/provisioning unchanged

**Decision:** Phase 3 does not modify `apps/admin/src/pages/ProvisioningOversightPage.tsx`, `@hbc/provisioning`, or `@hbc/features-admin`. These consumers continue using provisioning-specific endpoints unchanged.

**Rationale:** The admin API is additive (P3-D05). Migration of existing consumers to the generalized admin API is a Phase 5 concern.

**Impact:** Two parallel backend surfaces exist: provisioning-specific (project-setup host) and generalized admin (admin-control-plane host). This is intentional and temporary.

---

## Cross-references

- [Phase 3 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md)
- [API surface and route catalog](./admin-control-plane-api-surface-and-route-catalog.md)
- [Service factory and container plan](./admin-control-plane-service-factory-and-container-plan.md)
- [Adapter registry and routing foundation](./admin-control-plane-adapter-registry-and-routing-foundation.md)
- [Orchestration bridge plan](./admin-control-plane-orchestration-bridge-plan.md)
- [Authz, config, and operational safety plan](./admin-control-plane-authz-config-and-operational-safety-plan.md)
- [Runtime foundation inventory](./admin-spfx-phase-3-runtime-foundation-inventory.md)
- [Host and composition-root plan](./admin-control-plane-host-and-composition-root-plan.md)
- [Phase 2 run model](../phase-02/admin-control-plane-run-model.md)
- [Phase 2 decision register](../phase-02/admin-control-plane-phase-2-decision-register.md)
