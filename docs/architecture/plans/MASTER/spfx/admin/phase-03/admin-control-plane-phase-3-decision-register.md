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

## Cross-references

- [Phase 3 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md)
- [API surface and route catalog](./admin-control-plane-api-surface-and-route-catalog.md)
- [Service factory and container plan](./admin-control-plane-service-factory-and-container-plan.md)
- [Phase 2 run model](../phase-02/admin-control-plane-run-model.md)
- [Phase 2 decision register](../phase-02/admin-control-plane-phase-2-decision-register.md)
