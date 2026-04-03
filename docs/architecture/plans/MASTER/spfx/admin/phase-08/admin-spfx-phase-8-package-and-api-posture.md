# Admin SPFx IT Control Center — Phase 8 Package and API Posture

**Prompt:** P8-07 — App Catalog and API Posture Validation Lane
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the posture validation surfaces for SharePoint rollout dependencies.

---

## 1. Posture categories covered

### App Catalog (4 checks)

| Check ID | Label | Severity | Description |
|----------|-------|----------|-------------|
| `catalog:tenantCatalogExists` | Tenant app catalog site exists | Critical | Validates that the tenant-level app catalog site is reachable |
| `catalog:hbIntelPackagePresent` | HB Intel SPFx package present | Critical | Validates that the HB Intel .sppkg is uploaded to the catalog |
| `catalog:hbIntelPackageDeployed` | HB Intel SPFx package deployed | Warning | Validates that the package is deployed tenant-wide |
| `catalog:hbIntelPackageVersion` | HB Intel SPFx package version current | Info | Validates that the latest version is in the catalog |

### API Access (4 checks)

| Check ID | Label | Severity | Description |
|----------|-------|----------|-------------|
| `api:graphSitesSelected` | Graph Sites.Selected permission | Critical | Required for site-level access via managed identity |
| `api:graphGroupReadWriteAll` | Graph Group.ReadWrite.All permission | Critical | Required for Entra security group management |
| `api:sharepointFullControl` | SharePoint Sites.FullControl.All permission | Warning | Required for SharePoint API access approval |
| `api:managedIdentityConfigured` | Managed identity configured | Critical | Required for all backend privileged operations |

---

## 2. In-scope vs advisory-only

All 8 posture checks are **advisory-only** in Phase 8. None trigger automatic remediation.

| Category | In-scope action | Advisory action |
|----------|----------------|-----------------|
| App catalog | — | Operator uploads/deploys package manually |
| API access | — | Operator grants consent in Entra/SharePoint admin centers |

Rationale: App catalog deployment requires ALM workflow beyond Phase 8 scope. API access permission grants require tenant-admin consent that cannot be automated by the backend.

---

## 3. Data collection path(s)

Posture data is collected via an injected `PostureCollector` callback:

```
PostureCollector(checkId, category) → { status, detail }
```

| Status | Meaning |
|--------|---------|
| `healthy` | Check passed — dependency is in expected state |
| `degraded` | Partial issue — dependency exists but not fully operational |
| `missing` | Not found — dependency is absent |
| `unknown` | Check failed — could not determine status |

In production, collectors will call:
- **SharePoint ALM APIs** for app catalog checks (package presence, deployment status)
- **Graph API** for API access checks (permission grants, app registration state)
- **Azure environment variables** for managed identity configuration

In tests, collectors return mock outcomes for deterministic verification.

---

## 4. Output shape / severity model

### Finding shape

```typescript
interface IPostureCheckFinding {
  category: 'app-catalog' | 'api-access';
  checkId: string;
  label: string;
  status: 'healthy' | 'degraded' | 'missing' | 'unknown';
  severity: 'critical' | 'warning' | 'info';
  detail: string;
  advisoryOnly: boolean;
  recommendedAction: string | null;  // null when healthy
}
```

### Overall health rollup

| Condition | Overall health |
|-----------|---------------|
| All checks healthy | `healthy` |
| Any missing | `unhealthy` |
| Any degraded or unknown (none missing) | `degraded` |
| No findings | `unknown` |

### Severity behavior

- Healthy checks → severity downgraded to `info`, `recommendedAction` cleared
- Unhealthy checks → severity from catalog definition, `recommendedAction` populated
- Check errors (thrown exceptions) → `unknown` status, `warning` severity, error detail preserved

---

## 5. Current constraints

| Constraint | Phase 8 state | Future extension |
|-----------|---------------|-----------------|
| All checks advisory-only | No auto-remediation | Later phases may add ALM deployment and consent workflows |
| Collectors not yet wired to live APIs | Injectable callback pattern | Later prompts implement real SharePoint/Graph collectors |
| No version comparison logic | Presence check only for package version | Later phases may compare semantic versions |
| No permission scope enumeration | Checks named permissions only | Later phases may enumerate all granted scopes |
| No cross-tenant posture | Single-tenant checks only | Not planned for multi-tenant |
| No historical posture tracking | Point-in-time validation only | Later phases may add posture trend analysis |
| No integration with prelaunch validation | Standalone posture checks | Later phases may feed posture into provisioning prelaunch |

---

## Validation

### Verified

| Check | Command | Result |
|-------|---------|--------|
| Backend typecheck | `pnpm --filter @hbc/functions check-types` | **Pass** |
| Backend tests | `pnpm --filter @hbc/functions test` | **Pass** — 1410 passed, 3 skipped |
| New test suite | `sharepoint-posture-service.test.ts` | **Pass** — 18 tests |

### Test coverage

| Test group | Tests | Coverage |
|-----------|-------|----------|
| POSTURE_CHECK_CATALOG | 5 | Categories present, check counts, advisory-only flag, recommended actions, unique IDs |
| executePostureChecks | 6 | All healthy, all missing, thrown errors, healthy clears action, unhealthy populates action, advisory flag |
| buildPostureValidationResult | 4 | Healthy rollup, unhealthy rollup, degraded rollup, category counts |
| runPostureValidation | 3 | Complete result, mixed posture, audit/evidence invocation |

### Not run

| Check | Reason |
|-------|--------|
| Models build | No model changes |
| Admin lint/build | No frontend changes |

---

## Cross-references

- [Phase 8 Control Baseline](admin-spfx-phase-8-sharepoint-control-baseline.md) — active vs advisory boundary (section 4)
- [Phase 8 Repo-Truth Audit](admin-spfx-phase-8-repo-truth-audit.md) — adapter descriptors (section 3.5)
- Service code: `backend/functions/src/services/admin-control-plane/sharepoint-posture-service.ts`
- Test code: `backend/functions/src/services/admin-control-plane/__tests__/sharepoint-posture-service.test.ts`
- Adapter descriptors: `backend/functions/src/services/admin-control-plane/adapters.ts` — `SHAREPOINT_ALM_ADAPTER`, `SHAREPOINT_API_ACCESS_ADAPTER`
