# Admin SPFx IT Control Center — Phase 8 Drift Detection Workflow

**Prompt:** P8-04 — Drift Detection and Normalization Workflows
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the backend drift detection workflow for SharePoint control.

---

## 1. Workflow steps

The drift detection workflow executes in 5 sequential steps:

1. **Resolve standards** — `resolveCodeDefaultStandards(asset)` builds a `ISharePointStandardsSnapshot` from provisioning step definitions. In Phase 8 this is always `code-default-v1`.

2. **Collect posture** — A posture collector callback inspects the live SharePoint site and returns an `ISharePointPostureSnapshot` with observations and uninspectable areas. The collector is injected to keep the comparison engine testable without live infrastructure.

3. **Compare** — `comparePostureToStandards()` matches each standards expectation to a posture observation by `area:expectationId` key. Missing or mismatched observations produce `ISharePointDriftFinding` entries with severity classification.

4. **Record audit** — An audit event is recorded with domain `AdminDomain.SharePointControl` and action key `sharepoint-control:standards:detect-drift`.

5. **Capture evidence** — The drift report is persisted as `AdminEvidenceType.DriftReport` evidence for operator review and later preview/repair consumption.

---

## 2. Adapter responsibilities

### Standards resolver

The resolver (`resolveCodeDefaultStandards`) derives expectations from:

| Standards area | Source | Expectations |
|---------------|--------|-------------|
| SiteExistence | Step 1 — deterministic URL | 1 (site exists) |
| DocumentLibraries | Step 2 — `CORE_LIBRARIES` config | 3 (Project Documents, Drawings, Specifications) |
| TemplateFiles | Step 3 — area-level presence | 1 (at least one file present) |
| DataLists | Step 4 — area-level presence | 1 (core lists present) |
| WebParts | Step 5 — app catalog | 1 (HB Intel SPFx package) |
| SecurityGroups | Step 6 — three-group model | 3 (Leaders, Team, Viewers) |
| HubAssociation | Step 7 — hub site ID | 1 (associated) |
| AppCatalogPosture | Package presence | 1 (present and deployed) |
| ApiAccessPosture | Permission grants | 1 (approved) |

Total: 13 expectations across 9 areas.

### Posture collector

The collector is a callback `(asset) => Promise<ISharePointPostureSnapshot>`. In production this will use `SharePointService` and `GraphService` with Managed Identity tokens. In tests it returns mock observations.

### Comparison engine

`comparePostureToStandards` is a pure function that:
- Matches observations to expectations by `area:expectationId`
- Classifies missing items as `critical` severity
- Classifies present-but-absent items as `critical` severity
- Classifies value mismatches as `warning` severity
- Skips uninspectable areas (marked `unknown`)
- Produces per-area summaries with outcome, counts, and repairable tallies

---

## 3. Run / evidence behavior

### Audit events

| Condition | Event type | Domain |
|-----------|-----------|--------|
| All areas compliant | `StandardsApplied` | `SharePointControl` |
| Any drift detected | `BindingDriftDetected` | `SharePointControl` |

Audit writes are fire-and-forget (non-blocking, errors logged but don't fail the workflow).

### Evidence capture

| Evidence type | Content | Storage |
|--------------|---------|---------|
| `DriftReport` | Asset, outcome, standards version, area summaries, all findings | Inline (< 32 KB threshold) |

Evidence locator format: `inline://sharepoint-drift/{projectId}/{timestamp}`

### Run integration

The drift detection workflow currently operates without a formal admin run envelope. It produces a `ISharePointComparisonResult` that can be consumed by preview/repair flows. Full run-envelope integration (creating an `IAdminRunEnvelope` with `AdminDomain.SharePointControl`) will be added in Prompt-06 (repair flows) when orchestration requires step tracking.

---

## 4. Failure handling expectations

| Failure mode | Handling |
|-------------|---------|
| Posture collector throws | Error propagates to caller — no partial result |
| Uninspectable area (permission denied, timeout) | Area marked in `uninspectableAreas` — treated as `unknown` outcome, not `error` |
| Audit write fails | Swallowed (fire-and-forget) — drift result still returned |
| Evidence write fails | Swallowed (fire-and-forget) — drift result still returned |
| Site does not exist | `SiteExistence` area produces critical finding; other areas may be uninspectable |

---

## 5. Current limitations

| Limitation | Phase 8 state | Future extension |
|-----------|---------------|-----------------|
| Standards are code-default only | Derived from provisioning step definitions | Phase 10 adds live-override governance |
| Template files checked at area level only | "At least one present" | Later phases enumerate individual files |
| Data lists checked at area level only | "Core lists present" | Later phases enumerate individual lists and fields |
| No live HTTP health probes | Format/presence checks only | Requires deployed infrastructure |
| No run envelope integration | Standalone workflow returning comparison result | Prompt-06 adds full orchestrated run |
| Posture collector not yet wired to real SharePoint | Injected callback pattern | Later prompts implement real PnPjs collector |

---

## Validation

### Verified

| Check | Command | Result |
|-------|---------|--------|
| Models typecheck | `pnpm --filter @hbc/models check-types` | **Pass** |
| Models build | `pnpm --filter @hbc/models build` | **Pass** |
| Backend typecheck | `pnpm --filter @hbc/functions check-types` | **Pass** |
| Backend tests | `pnpm --filter @hbc/functions test` | **Pass** — 1364 passed, 3 skipped |
| New test suite | `sharepoint-drift-service.test.ts` | **Pass** — 19 tests |

### New test coverage

| Test group | Tests | Coverage |
|-----------|-------|----------|
| resolveCodeDefaultStandards | 7 | Version, source, all 9 areas, library expectations, security groups, repairable flags, areaCounts |
| comparePostureToStandards | 4 | Compliant posture, missing items, present-but-absent, value mismatches, uninspectable areas |
| buildComparisonResult | 3 | Compliant outcome, drifted outcome, unknown outcome, area summary count |
| runSharePointDriftDetection | 3 | End-to-end compliant, end-to-end drifted, audit/evidence invocation |

### Not run

| Check | Reason |
|-------|--------|
| Admin lint/build | No frontend changes |
| E2E tests | Not applicable |
| Live SharePoint integration | Requires deployed environment |

---

## Cross-references

- [Phase 8 Control Baseline](admin-spfx-phase-8-sharepoint-control-baseline.md) — managed-asset boundary
- [Standards Comparison Model](admin-spfx-phase-8-standards-comparison-model.md) — contract surfaces
- Service code: `backend/functions/src/services/admin-control-plane/sharepoint-drift-service.ts`
- Test code: `backend/functions/src/services/admin-control-plane/__tests__/sharepoint-drift-service.test.ts`
- Pattern reference: `backend/functions/src/services/admin-control-plane/binding-verification-service.ts`
- Standards source: `backend/functions/src/config/core-libraries.ts`
