# Admin SPFx IT Control Center — App-Binding Store and Retrieval API

**Prompt:** P6A-04 — Backend App-Binding Store and Retrieval API  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Document where bindings are stored, how they are keyed, how target apps retrieve them, how publication and supersession work, and why this is Phase 6A-appropriate rather than a full Phase 10 registry.

---

## 1. Where bindings are stored

Bindings are stored in Azure Table Storage, following the same persistence patterns established by Phase 4 (`DurableAdminRunStore`, `DurableAdminAuditStore`, `DurableAdminEvidenceStore`).

| Attribute | Value |
|-----------|-------|
| **Table name** | `AdminAppBindings` |
| **Storage** | Azure Table Storage (same account as `AdminRuns`, `AdminAuditEvents`, `AdminEvidence`) |
| **Table client** | Obtained via `createAppTableClient()` — supports both Managed Identity (production) and connection string (local dev) |
| **Write mode** | Replace-mode upsert (idempotent, full replacement) |

---

## 2. How bindings are keyed

| Key | Value | Rationale |
|-----|-------|-----------|
| **PartitionKey** | `appId` (e.g., `accounting`, `project-setup`) | Enables per-app queries and natural partitioning |
| **RowKey** | `current` | Always points to the single active binding record per app |

Each managed app has exactly one active binding record. Historical versions are tracked via the `version` counter on the record, not via additional RowKey entries (historical snapshots may be added in Phase 10).

---

## 3. How target apps retrieve bindings

### Current path (unchanged)

Target apps continue to receive binding values at mount time via the SPFx shell webpart's webpack DefinePlugin injection:

```
build-spfx-package.ts → DefinePlugin → ShellWebPart.ts → mount(config) → setRuntimeConfig()
```

This path has no circular dependency and requires no backend call.

### Admin console path (new)

The Admin operator console retrieves binding status via new API endpoints:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/admin/apps/{appId}/binding` | Get binding for a specific app |
| `GET` | `/api/admin/apps/bindings` | List all app bindings |

These endpoints require delegated scope and admin role, consistent with existing admin API endpoints.

### Future target-app path (deferred)

A direct target-app runtime resolution API is architecturally possible but not implemented in the minimum slice. Target apps would need an independent resolution channel (not requiring `functionAppUrl`) to avoid circular dependency. This is deferred to later maturity.

---

## 4. How publication works

### Publication triggers

| Trigger | Endpoint | Actor |
|---------|----------|-------|
| Install flow completion | `POST /api/admin/apps/{appId}/binding/publish` | Install orchestrator (system) |
| Manual operator publish | `POST /api/admin/apps/{appId}/binding/publish` | Admin user |
| Binding repair | `POST /api/admin/apps/{appId}/binding/repair` | Admin user |

### Publication behavior

1. If no binding exists for the app, a new record is created with `version: 1` and `status: Active`.
2. If a binding exists, the record is replaced with an incremented `version` and updated values.
3. Publication records the actor context (`publishedBy`) and source (`publishSource`).
4. Verification metadata is reset on publication (`lastVerifiedAt: null`, `lastVerificationResult: null`).

### Validation

The publish endpoint validates:
- `appId` is present
- `functionAppUrl` is a non-empty string
- `apiAudience` is a non-empty string

### Serialization

Complex fields (`publishedBy`) are JSON-serialized with a `Json` suffix following the `DurableAdminRunStore` pattern. Nullable string fields use the empty-string-to-null convention.

---

## 5. How verification works

Verification compares the published binding record to expected structural validity.

| Endpoint | Method |
|----------|--------|
| `/api/admin/apps/{appId}/binding/verify` | `POST` |

### Current checks (P6A-04)

| Check | Field | Severity if failed |
|-------|-------|--------------------|
| Function App URL is non-empty | `functionAppUrl` | Critical |
| API audience is non-empty | `apiAudience` | Critical |

### Future checks (P6A-07)

Full infrastructure probes (HTTP health checks to the Function App, Graph lookups for the app registration) will be added in Prompt 07 when the verification service is implemented.

### Verification outcome

- `passed` — all checks passed; binding status updated to `Active`
- `drifted` — one or more checks failed; binding status updated to `Drifted`
- `inconclusive` — no binding record exists; no status change

---

## 6. How repair works

| Endpoint | Method |
|----------|--------|
| `/api/admin/apps/{appId}/binding/repair` | `POST` |

Repair accepts corrected values (any field may be `null` to keep the existing value). It:

1. Reads the existing binding (throws if not configured)
2. Merges corrected values over existing
3. Increments the version
4. Sets status to `Active`
5. Resets verification metadata
6. Records the actor and source as `manual-repair`

---

## 7. Service interface

The binding service is exposed as `IAdminAppBindingService` in the service container:

```typescript
interface IAdminAppBindingService {
  getBinding(appId: string): Promise<IAppBindingRecord | null>;
  listBindings(): Promise<readonly IAppBindingRecord[]>;
  publishBinding(request: IAppBindingPublishRequest, actor: IAdminActorContext): Promise<IAppBindingPublishResult>;
  verifyBinding(appId: string): Promise<IAppBindingVerificationResult>;
  repairBinding(request: IAppBindingRepairRequest, actor: IAdminActorContext): Promise<IAppBindingRepairResult>;
}
```

Implementations:
- **Production:** `DurableAdminAppBindingStore` (Azure Table Storage)
- **Test/mock:** `MockAdminAppBindingStore` (in-memory Map)

---

## 8. Why this is Phase 6A-appropriate

This implementation is intentionally narrow:

| What it provides | What Phase 10 will add |
|------------------|------------------------|
| Per-app binding with 4 fields | Generalized per-domain config with arbitrary fields |
| Single `AdminAppBindings` table | Unified configuration registry |
| `IAdminAppBindingService` | Full `IAdminConfigService` implementation |
| 5 binding-specific API endpoints | Generalized config API |
| Structural verification checks | Full infrastructure probe verification |

The implementation uses the same persistence patterns, service interfaces, and API conventions as the existing admin control plane. Phase 10 can subsume or extend it without breaking existing consumers.

---

## 9. Cross-references

| Document | Purpose |
|----------|---------|
| `phase-6a-app-binding/admin-spfx-app-binding-architecture.md` | Architecture slice — binding record model and API surface design |
| `phase-6a-app-binding/admin-spfx-app-binding-contract-slice.md` | Shared contract surface — types used by this implementation |
| `phase-6a-app-binding/admin-spfx-app-binding-gap-audit.md` | Gap audit — gaps G1-G3 closed by this implementation |
