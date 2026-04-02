# Admin SPFx IT Control Center — Phase 4 Retrieval API Contract

**Prompt:** P4-05 — Audit Retrieval APIs and Query Contracts  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Define the retrieval/query layer for run history, audit events, and evidence references.

---

## 1. Generalized read endpoints

### New endpoints (P4-05)

| Method | Route | Handler | Purpose | Auth |
|--------|-------|---------|---------|------|
| GET | `/api/admin/runs/{runId}/audit` | `adminListRunAuditEvents` | List audit events for a specific run | `requireDelegatedScope` |
| GET | `/api/admin/audit` | `adminListAuditEvents` | List audit events filtered by event type | `requireDelegatedScope` |
| GET | `/api/admin/runs/{runId}/evidence` | `adminGetRunEvidence` | Get evidence manifest for a run | `requireDelegatedScope` |

### Existing endpoints (Phase 3, unchanged)

| Method | Route | Handler | Purpose |
|--------|-------|---------|---------|
| GET | `/api/admin/runs` | `adminListRuns` | List run history |
| GET | `/api/admin/runs/{runId}` | `adminGetRun` | Get run detail |

Total admin API endpoints: **13** (10 from Phase 3 + 3 new in Phase 4).

---

## 2. Response shapes

### Audit events for a run

```typescript
// GET /api/admin/runs/{runId}/audit
{
  items: IAdminAuditRecord[],    // Chronological order
  pagination: { total, page: 1, pageSize, totalPages: 1 },
  requestId: string
}
```

### Audit events by type

```typescript
// GET /api/admin/audit?eventType=run.started&since=2026-04-01&limit=50
{
  items: IAdminAuditRecord[],    // Filtered by eventType, optionally since timestamp
  pagination: { total, page: 1, pageSize, totalPages: 1 },
  requestId: string
}
```

**Required query parameter:** `eventType` (from `AdminAuditEventType` enum)  
**Optional query parameters:** `since` (ISO 8601 timestamp), `limit` (max results)

### Evidence manifest

```typescript
// GET /api/admin/runs/{runId}/evidence
{
  data: {
    runId: string,
    evidenceRefs: IAdminEvidenceReference[],
    total: number
  },
  requestId: string    // via successResponse() envelope
}
```

Phase 4 evidence references are extracted from audit event `evidenceRef` fields. Phase 6 adds a dedicated evidence metadata store.

---

## 3. Compatibility posture

| Concern | Status |
|---------|--------|
| Existing provisioning endpoints | **Unchanged** — all `/api/provision-project-site/*` and `/api/project-setup-requests/*` routes remain |
| `ProvisioningOversightPage` | **Unchanged** — continues using `createProvisioningApiClient` from `@hbc/provisioning` |
| `@hbc/provisioning` API client | **Unchanged** — no modifications to package exports |
| `@hbc/features-admin` | **Unchanged** — no modifications |
| Future convergence | Phase 5 will migrate operator console reads to generalized admin API |

---

## 4. Expected operator-review use cases

| Use case | Endpoint | Notes |
|----------|----------|-------|
| "Show me the history of this run" | `GET /admin/runs/{runId}/audit` | Chronological audit trail for a single run |
| "What failed recently?" | `GET /admin/audit?eventType=run.failed&since=...` | Cross-run failure query |
| "Who approved this checkpoint?" | `GET /admin/runs/{runId}/audit` | Filter for CheckpointDecided events in the result |
| "What evidence exists for this run?" | `GET /admin/runs/{runId}/evidence` | Evidence manifest from audit event references |
| "Show all admin overrides" | `GET /admin/audit?eventType=config.modified` | Cross-run override visibility |

---

## Cross-references

- [Phase 4 baseline](./admin-spfx-phase-4-run-audit-evidence-baseline.md)
- [Phase 4 provisioning bridge](./admin-spfx-phase-4-provisioning-bridge.md)
- [Phase 4 store implementation notes](./admin-spfx-phase-4-store-implementation-notes.md)
- [Phase 3 API surface catalog](../phase-03/admin-control-plane-api-surface-and-route-catalog.md)
- [`adminApi/index.ts`](../../../../../backend/functions/src/functions/adminApi/index.ts)
- [RELEASE-SCOPE.md](../../../../../backend/functions/src/hosts/admin-control-plane/RELEASE-SCOPE.md)
