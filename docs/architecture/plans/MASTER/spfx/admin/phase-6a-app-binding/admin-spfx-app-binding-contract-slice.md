# Admin SPFx IT Control Center — App-Binding Contract Slice

**Prompt:** P6A-03 — Shared App-Binding Contracts and Governance Slice  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Document where the shared app-binding contracts live, why this slice is intentionally minimal, and how it stays forward-compatible with broader Phase 10 config governance.

---

## 1. Where the shared contracts live

All app-binding contracts are in `packages/models/src/admin-control-plane/`:

| File | Content |
|------|---------|
| `IAppBinding.ts` | **New (P6A-03)** — Binding record, status, retrieval response, publication request/result, verification result, drift finding, repair request/result, status summary, action keys |
| `AdminEnums.ts` | **Modified (P6A-03)** — Added `AdminDomain.AppBinding = 'app-binding'` |
| `IAdminAudit.ts` | **Modified (P6A-03)** — Added `BindingPublished`, `BindingVerified`, `BindingDriftDetected`, `BindingRepaired` audit event types |
| `index.ts` | **Modified (P6A-03)** — Added barrel exports for all new types |

---

## 2. Why this slice is intentionally minimal

The existing generalized admin control plane model (Phases 2–4) already provides:

| Need | Existing type | Status |
|------|--------------|--------|
| Run lifecycle | `IAdminRunEnvelope` + `AdminRunStatus` | **Ready** — binding operations may produce runs |
| Actor tracking | `IAdminActorContext` | **Ready** — reused in `IAppBindingRecord.publishedBy` |
| Audit trail | `IAdminAuditRecord` + `AdminAuditEventType` | **Extended** — 4 new binding event types added |
| Evidence capture | `IAdminEvidenceReference` + `AdminEvidenceType` | **Ready** — binding evidence follows existing patterns |
| Action keys | `AdminActionKey` pattern | **Extended** — `APP_BINDING_ACTION_KEYS` follows `INSTALL_ACTION_KEYS` pattern |

Phase 6A adds **only** the binding-specific vocabulary that the generalized model cannot provide:

| New type | Purpose |
|----------|---------|
| `AppBindingStatus` enum (6 values) | Durable binding posture states |
| `BackendMode` type | Shared runtime mode union (extracted from per-app duplication) |
| `IAppBindingRecord` interface | Per-app binding record with 4 binding fields + metadata |
| `IAppBindingRetrievalResponse` interface | Target-app resolution payload (binding fields + diagnostics) |
| `IAppBindingPublishRequest` / `IAppBindingPublishResult` | Publication request/response pair |
| `IAppBindingVerificationResult` / `IAppBindingDriftFinding` | Verification result with per-field drift findings |
| `IAppBindingRepairRequest` / `IAppBindingRepairResult` | Operator-confirmed repair request/response pair |
| `IAppBindingStatusSummary` interface | Binding posture summary for Admin UX dashboards |
| `APP_BINDING_ACTION_KEYS` const | Well-known action keys for binding operations |

---

## 3. Binding status vocabulary

| Status | Meaning | Typical transition from |
|--------|---------|------------------------|
| `NotConfigured` | No binding record exists for this managed app | Initial state |
| `PendingPublication` | Binding publication has been requested but not yet completed | NotConfigured, Error |
| `Active` | Binding is published and either verified or awaiting first verification | PendingPublication, Drifted (after repair) |
| `Drifted` | Verification detected a mismatch between published binding and live state | Active |
| `Superseded` | Binding has been replaced by Phase 10 config governance | Any |
| `Error` | Binding publication or verification encountered an infrastructure error | Any |

---

## 4. Binding fields

The binding contract carries exactly 4 runtime fields matching the `IRuntimeConfig` shape already implemented in both Accounting (`apps/accounting/src/config/runtimeConfig.ts`) and Project Setup (`apps/estimating/src/config/runtimeConfig.ts`):

| Field | Type | Purpose |
|-------|------|---------|
| `functionAppUrl` | `string` | Azure Function App base URL |
| `apiAudience` | `string` | API audience URI for SPFx token acquisition |
| `backendMode` | `BackendMode` | Runtime backend mode (`'production'` or `'ui-review'`) |
| `allowBackendModeSwitch` | `boolean` | Whether the target app may switch modes at runtime |

The `BackendMode` type is now shared rather than duplicated per app.

---

## 5. How this stays forward-compatible with Phase 10

| Phase 6A provides | Phase 10 will add |
|--------------------|-------------------|
| Per-app binding records with 4 fields | Generalized per-domain config records with arbitrary fields |
| Dedicated `AppBindingStatus` enum | May extend or generalize into broader config status model |
| `IAppBindingRecord` with fixed schema | Phase 10 may add extensible field maps |
| 4 binding audit event types | Generalized config change audit events |
| `APP_BINDING_ACTION_KEYS` | Broader config governance action keys |

### Forward-compatibility contract

The binding contracts are designed so Phase 10 can:
- Read existing `IAppBindingRecord` instances without schema breaks
- Extend the record with additional fields (interface is open for extension)
- Subsume binding events into a broader config audit model
- Wrap or proxy the binding service behind a generalized config service

Phase 6A does **not**:
- Hardcode assumptions about binding being the only config concern
- Use naming that conflicts with the broader `IAdminConfigService` interface
- Introduce a general-purpose configuration DSL
- Put backend-only sensitive internals into browser-facing types

---

## 6. Cross-references

| Document | Purpose |
|----------|---------|
| `phase-6a-app-binding/admin-spfx-app-binding-architecture.md` | Architecture slice — binding record model and API surface |
| `phase-6a-app-binding/admin-spfx-app-binding-resolution-lifecycle.md` | Binding lifecycle stages |
| `phase-6a-app-binding/admin-spfx-app-binding-gap-audit.md` | Gap audit — gaps G1-G9 that these contracts address |
| `phase-06/admin-spfx-install-contract-slice.md` | Phase 6 contract slice — pattern this slice follows |
