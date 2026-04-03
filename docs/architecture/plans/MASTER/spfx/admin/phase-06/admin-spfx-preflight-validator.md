# Admin SPFx IT Control Center — Preflight Validation Engine

**Prompt:** P6-04 — Backend Preflight Validation Engine
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document what the preflight engine validates, how severity is determined, and how the SPFx UI should consume results.

---

## 1. What is validated

The preflight engine runs 9 checks across 6 categories:

| # | Check ID | Category | Label | Blocking | Severity |
|---|----------|----------|-------|----------|----------|
| 1 | `environment-config-complete` | `backend-config` | Core environment configuration | Yes | Critical |
| 2 | `azure-subscription-accessible` | `auth-identity` | Azure managed identity configuration | Yes | Critical |
| 3 | `graph-api-permissions` | `auth-identity` | Graph API permissions | Yes | Critical |
| 4 | `sharepoint-tenant-reachable` | `sharepoint` | SharePoint tenant URL | Yes | Critical |
| 5 | `app-catalog-configured` | `sharepoint` | SharePoint app catalog | Yes | Critical |
| 6 | `spfx-app-package-available` | `sharepoint` | SPFx app package identifier | No | Warning |
| 7 | `entra-app-registration-prereqs` | `graph-entra` | Entra app registration prerequisites | Yes | Critical |
| 8 | `table-storage-accessible` | `persistence` | Azure Table Storage endpoint | Yes | Critical |
| 9 | `resource-group-reachable` | `install-compatibility` | Adapter mode for install execution | No | Warning/Info |

---

## 2. How blockers vs warnings are decided

| Severity | Blocking | Rule |
|----------|----------|------|
| `critical` | Yes | The check validates a resource or permission that the install run **cannot proceed without**. A critical failure means the install will certainly fail. |
| `warning` | No | The check validates a resource that is **useful but not essential** for all install steps, or that can be provided during the install (e.g., SPFx package upload). |
| `info` | No | The check provides operational context (e.g., adapter mode) without indicating a problem. |

**Overall readiness:** `ready = true` only when **all blocking checks pass**. Non-blocking warnings do not prevent launch.

---

## 3. What remains intentionally observational

| Item | Why observational |
|------|------------------|
| Adapter mode (`mock` vs `proxy`) | Mock mode is valid for development — the preflight reports it but does not block |
| SPFx app package ID | The package may be uploaded during the install step (step 3.7) — absence is a warning, not a blocker |
| SignalR connection | Install uses polling, not SignalR — not checked in preflight |
| Notification recipients | CONTROLLER_UPNS/ADMIN_UPNS affect notifications, not install execution |

---

## 4. How the SPFx UI should consume results

### API call

```typescript
POST /api/admin/preflight
Body: { actionKey: 'setup-install:bootstrap:full-install', commandInput: {} }
Response: { ready: boolean, checks: IAdminPreflightCheck[] }
```

### Display guidance

1. **Group checks by `category`** — render category headers (Backend Config, Auth & Identity, SharePoint, Graph & Entra, Persistence, Install Compatibility)
2. **Show pass/fail badge per check** — green check for passed, red X for failed blocking, yellow triangle for failed warning
3. **Show `label` and `message`** — label is the heading, message is the detail
4. **Show `recommendedAction`** for failed checks — this is the operator-actionable guidance
5. **Show `resolvableByCheckpoint` indicator** — when true, the operator knows a manual checkpoint during install may resolve this
6. **Gate the "Launch Install" button** on `ready === true` — disable when any blocking check fails
7. **Allow "Run Preflight Again"** — the operator should be able to re-run after fixing config

### Evidence

Preflight results are captured as evidence (`AdminEvidenceType.PreviewResult`) by the install orchestration service when the install run launches. The SPFx UI does not need to persist results — the backend handles durable storage.

---

## 5. Implementation location

| File | Purpose |
|------|---------|
| `backend/functions/src/services/admin-control-plane/preflight-service.ts` | `AdminPreflightService` — real implementation |
| `backend/functions/src/services/admin-control-plane/stubs.ts` | `StubAdminPreflightService` — mock/test stub (preserved for `isMock` mode) |
| `backend/functions/src/hosts/admin-control-plane/service-factory.ts` | Wires `AdminPreflightService` in proxy mode, `StubAdminPreflightService` in mock mode |
| `backend/functions/src/services/admin-control-plane/__tests__/preflight-service.test.ts` | Unit tests (9 check stability, severity, blocking behavior, recommended actions) |

---

## Cross-references

- [Install/Bootstrap Architecture](admin-spfx-install-bootstrap-architecture.md) — layer responsibilities
- [Install/Bootstrap Step Model](admin-spfx-install-bootstrap-step-model.md) — step family 2 (preflight validation)
- [Install Contract Slice](admin-spfx-install-contract-slice.md) — `InstallPreflightCheckId` enum, `IAdminPreflightCheck` type
