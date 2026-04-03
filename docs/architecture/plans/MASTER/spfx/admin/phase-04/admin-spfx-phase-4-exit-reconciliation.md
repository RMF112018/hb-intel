# Admin SPFx IT Control Center — Phase 4 Exit Reconciliation

**Prompt:** P4-08 — Validation, Migration Rails, and Exit Reconciliation
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Confirm Phase 4 acceptance criteria are met and document exit readiness.

---

## 1. What was created or updated

### New backend services (Phase 4)

| File | Purpose | Prompt |
|------|---------|--------|
| `services/admin-control-plane/admin-run-store.ts` | `DurableAdminRunStore` — Azure Table Storage run persistence | P4-03 |
| `services/admin-control-plane/admin-audit-store.ts` | `DurableAdminAuditStore` — append-only audit event persistence | P4-03 |
| `services/admin-control-plane/evidence-service.ts` | `DurableAdminEvidenceStore` — evidence metadata with inline/offload boundary | P4-06 |
| `services/admin-control-plane/provisioning-audit-bridge.ts` | `ProvisioningAuditBridge` — saga-to-spine fire-and-forget bridge | P4-04 |

All paths relative to `backend/functions/src/`.

### Modified backend files

| File | Change | Prompt |
|------|--------|--------|
| `hosts/admin-control-plane/service-factory.ts` | Wired durable stores (run, audit, evidence) in production + mock modes | P4-03, P4-06 |
| `functions/adminApi/index.ts` | Added 3 retrieval endpoints (run audit, audit by type, run evidence) | P4-05 |
| `services/admin-control-plane/orchestration-bridge.ts` | Updated mapping functions for provisioning → run envelope | P4-04 |
| `services/admin-control-plane/types.ts` | Added `IAdminEvidenceService` interface | P4-06 |
| `services/admin-control-plane/index.ts` | Barrel exports for new services | P4-03+ |
| `hosts/admin-control-plane/RELEASE-SCOPE.md` | Updated to reflect Phase 4 additions (7 admin domain services) | P4-08 |

### New test files

| File | Purpose | Prompt |
|------|---------|--------|
| `services/admin-control-plane/__tests__/durable-stores.test.ts` | Run + audit store unit tests (13 tests) | P4-03 |
| `services/admin-control-plane/__tests__/evidence-service.test.ts` | Evidence service unit tests (13 tests) | P4-06 |
| `services/admin-control-plane/__tests__/provisioning-audit-bridge.test.ts` | Bridge unit tests (14 tests) | P4-04 |

### Model types (in `packages/models/src/admin-control-plane/`)

| Export | File | Prompt |
|--------|------|--------|
| `IAdminAuditRecord` | `IAdminAudit.ts` | P4-02 |
| `AdminAuditEventType` (enum, 12 values) | `IAdminAudit.ts` | P4-02 |
| `IAdminEvidenceReference` | `IAdminAudit.ts` | P4-02 |
| `AdminEvidenceType` (enum, 9 values) | `IAdminAudit.ts` | P4-02 |
| `EvidenceRetentionClass` (enum, 3 values) | `IAdminAudit.ts` | P4-06 |
| `IAdminConfigSnapshotReference` | `IAdminAudit.ts` | P4-02 |

### Documentation artifacts (9 canonical docs)

| Document | Prompt | Purpose |
|----------|--------|---------|
| [Repo-Truth Audit](admin-spfx-phase-4-repo-truth-audit.md) | P4-01 | Provisioning persistence inventory, gaps, preconditions |
| [Run/Audit/Evidence Baseline](admin-spfx-phase-4-run-audit-evidence-baseline.md) | P4-02 | Canonical concepts, capture dimensions, audit event taxonomy, storage doctrine |
| [Persistence Boundary Matrix](admin-spfx-phase-4-persistence-boundary-matrix.md) | P4-02 | 10-row store ownership and boundary rules |
| [Store Implementation Notes](admin-spfx-phase-4-store-implementation-notes.md) | P4-03 | Table keying, serialization, service factory wiring |
| [Provisioning Bridge](admin-spfx-phase-4-provisioning-bridge.md) | P4-04 | Saga-to-spine event mapping, compatibility surfaces |
| [Retrieval API Contract](admin-spfx-phase-4-retrieval-api-contract.md) | P4-05 | Audit/evidence query endpoints and response shapes |
| [Evidence & Retention Boundaries](admin-spfx-phase-4-evidence-and-retention-boundaries.md) | P4-06 | Inline/offload thresholds, retention classes |
| [Migration & Cutover Notes](admin-spfx-phase-4-migration-and-cutover-notes.md) | P4-08 | Forward-only migration posture, deployment notes |
| [Exit Reconciliation](admin-spfx-phase-4-exit-reconciliation.md) | P4-08 | This document |

---

## 2. Phase 4 acceptance-criteria checklist

Each criterion is drawn from the [Phase 4 Summary Plan](Admin-SPFx-IT-Control-Center-Phase-4-Summary-Plan.md#acceptance-criteria).

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | A canonical generalized admin run/audit/evidence model exists in repo docs | **Met** | `admin-spfx-phase-4-run-audit-evidence-baseline.md`, `admin-spfx-phase-4-persistence-boundary-matrix.md` |
| 2 | Backend services exist for a generalized run store and generalized audit store | **Met** | `DurableAdminRunStore` → `AdminRuns` table; `DurableAdminAuditStore` → `AdminAuditEvents` table |
| 3 | Evidence metadata capture is formalized, including oversized-payload handling policy | **Met** | `DurableAdminEvidenceStore` → `AdminEvidence` table; 32 KB inline threshold (`EVIDENCE_INLINE_MAX_BYTES`); blob locator pattern defined; blob write deferred to Phase 6 |
| 4 | Retrieval/query APIs exist for run history and audit review | **Met** | 3 new endpoints: `GET /runs/{runId}/audit`, `GET /audit`, `GET /runs/{runId}/evidence` |
| 5 | The provisioning saga writes into the generalized spine without breaking current behavior | **Met** | `ProvisioningAuditBridge` fire-and-forget; all provisioning endpoints unchanged |
| 6 | Existing provisioning/admin compatibility surfaces remain functional | **Met** | `ProvisioningStatus` table, `ProvisioningAuditLog` list, provisioning API routes all preserved |
| 7 | Retention and evidence boundaries documented and enforced | **Met** | 3 retention classes (operational / compliance / permanent); `isEvidenceInlineable()` enforces 32 KB threshold; TTL enforcement deferred to Phase 13 |
| 8 | Validation and exit reconciliation confirm end-to-end reviewability | **Met** | This document; validation results below |

---

## 3. Validation results

### Verified

| Check | Command | Result |
|-------|---------|--------|
| Backend typecheck | `pnpm --filter @hbc/functions check-types` | **Pass** |
| Backend tests | `pnpm --filter @hbc/functions test` | **Pass** — 65 files, 1151 passed, 3 skipped |
| Admin app lint | `pnpm --filter @hbc/spfx-admin lint` | **Pass** |
| Admin app build | `pnpm --filter @hbc/spfx-admin build` | **Pass** — tsc --noEmit + vite build |
| Admin app tests | `pnpm --filter @hbc/spfx-admin test` | **Partial** — pre-existing failures in `ProvisioningOversightPage.test.tsx` (TanStack Router mock wrapper issue); all other test files pass |

### Pre-existing failures (not caused by Phase 4)

`ProvisioningOversightPage.test.tsx` fails with `useRouter must be used inside a <RouterProvider>` and `Cannot read properties of null (reading 'isServer')`. This is a TanStack Router test-wrapper compatibility issue in `apps/admin` — the test helper renders the page component without a full `RouterProvider`. Phase 4 made no changes to admin app code or its test infrastructure.

### Not run

| Check | Reason |
|-------|--------|
| Admin app check-types | No `check-types` script; type checking covered by `build` (`tsc --noEmit`) |
| Backend smoke tests | Require Azure Functions runtime and live storage |
| E2E / Playwright | No UI changes in Phase 4 |
| Workspace-wide build | Changes scoped to `backend/functions`, `packages/models`, and documentation |

### Residual risk

| Risk | Assessment |
|------|-----------|
| Durable stores not exercised against live Azure Table Storage | Low — mock-backed unit tests validate serialization, keying, and lifecycle; live integration requires deployment |
| ProvisioningOversightPage test failures | Pre-existing — unrelated to Phase 4; tracked for separate resolution |

---

## 4. Backward-compatibility status

| Surface | Status |
|---------|--------|
| Provisioning saga endpoints (`/api/provisioningSaga/*`) | **Unchanged** |
| Project request endpoints (`/api/projectRequests/*`) | **Unchanged** |
| `ProvisioningStatus` Azure Table | **Unchanged** — continues as authoritative provisioning-specific store |
| `ProvisioningAuditLog` SharePoint list | **Unchanged** — continues as fire-and-forget compatibility write |
| Admin app pages (`apps/admin`) | **Unchanged** — no Phase 4 modifications to admin frontend |
| SignalR progress push | **Unchanged** |
| Shared model types (`@hbc/models`) | **Additive only** — new interfaces and enums; no breaking changes to existing exports |
| Admin API endpoints (Phase 3) | **Unchanged** — all 10 Phase 3 endpoints preserved; 3 new endpoints added |

---

## 5. Residual risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Oversized evidence blob writes not yet implemented | Low | Phase 6 deliverable; `generateBlobLocator()` pattern defined, metadata stored now |
| Retention TTL not enforced at runtime | Low | Phase 13 deliverable; `EvidenceRetentionClass` metadata captured on every evidence record |
| Admin API not yet consumed by SPFx frontend | Low | Phase 5 builds operator console; provisioning oversight continues via existing endpoints |
| Config version snapshotting not yet implemented | Low | Phase 10 deliverable; `IAdminConfigSnapshotReference` field exists in audit model |
| `ProvisioningAuditBridge` fire-and-forget may silently drop events | Low | By design — bridge failures never propagate to saga; `AdminAuditEvents` is supplementary audit spine, not blocking |
| Pre-existing admin app test failures | Low | TanStack Router mock-wrapper issue; unrelated to Phase 4 scope |

---

## 6. Deferred items for later phases

| Item | Target phase | Notes |
|------|-------------|-------|
| Blob storage for oversized evidence payloads (> 32 KB) | Phase 6 | `generateBlobLocator()` pattern ready; blob write implementation deferred |
| SPFx operator console consuming admin API | Phase 5 | Phase 4 retrieval APIs are the primary new backend surfaces Phase 5 will wire |
| Config version snapshotting | Phase 10 | `IAdminConfigSnapshotReference` type exists; capture logic deferred |
| Retention TTL enforcement / purge jobs | Phase 13 | Retention class metadata is captured now; automated purge deferred |
| Risk-level-differentiated authorization | Phase 11 | Admin authz currently uses `requireAdmin()` gate; per-risk-level not yet needed |
| Evidence export contract | Phase 6 | Export format and API deferred alongside blob storage |

---

## 7. Recommended next phase entry point

**Phase 5 — Operator console foundation in SPFx**

Phase 5 should begin by:
1. Auditing the current admin app routes and page structure
2. Building the operator console shell that surfaces generalized admin run history
3. Wiring the Phase 4 retrieval APIs (`/runs/{runId}/audit`, `/audit`, `/runs/{runId}/evidence`) into frontend views
4. Establishing the run-oriented workflow navigation model described in the end-state plan

The Phase 4 durable stores and retrieval APIs provide the backend foundation Phase 5 needs to make admin runs reviewable from the SPFx operator console.

---

## Contradiction sweep results

The following drift items were identified and corrected during P4-08:

| Item | Location | Issue | Fix |
|------|----------|-------|-----|
| Admin domain service count | `RELEASE-SCOPE.md` | Listed 6 eager services; actual factory has 7 (evidence service added in P4-06) | Updated to 7 eager; added `evidenceService` to list |
| Phase reference | `RELEASE-SCOPE.md` | Referenced only Phase 3 | Updated to Phase 3 + Phase 4 |
| Boundary test coverage | `admin-control-plane-host-boundary.test.ts` | `requiredAdminServices` and `requiredProperties` arrays missing `IAdminEvidenceService` / `evidenceService` | Added to both arrays |
| Current-state-map doc count | `current-state-map.md` | Phase 4 listed as 7 canonical docs | Updated to 9 (adding migration notes + exit reconciliation) |

No contradictions were found across the 7 existing Phase 4 canonical docs — table names, endpoint counts, service names, and compatibility statements are internally consistent.
