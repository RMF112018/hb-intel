# Admin SPFx IT Control Center — Phase 8 Standards Comparison Model

**Prompt:** P8-03 — Standards Snapshot and Comparison Model
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the standards snapshot and comparison model for Phase 8 SharePoint control.

---

## 1. Model purpose

The standards comparison model provides the contract surface that all Phase 8 SharePoint control operations depend on:

- **Drift detection** compares a standards snapshot against live posture and produces drift findings.
- **Preview / dry-run** uses comparison results to generate impact summaries.
- **Repair** uses drift findings to determine what to create or restore.
- **Operator UX** uses area summaries and finding details for display.

The model formalizes what the provisioning saga steps implicitly encode as "correct" site state into an inspectable, versionable, and comparable contract.

---

## 2. Contract surfaces

All contracts live in `packages/models/src/admin-control-plane/ISharePointControl.ts` and are barrel-exported from `index.ts`.

### Enums and type aliases

| Type | Purpose |
|------|---------|
| `SharePointStandardsArea` | 9-value enum mapping to provisioning step expectations + package/API posture |
| `SharePointDriftSeverity` | `'critical' \| 'warning' \| 'info'` — same model as `IAppBindingDriftFinding` |
| `SharePointComparisonOutcome` | `'compliant' \| 'drifted' \| 'unknown' \| 'error'` |

### Managed asset identification

| Interface | Purpose |
|-----------|---------|
| `ISharePointManagedAsset` | Identifies an HB Intel-managed site by project ID, number, name, URL, existence, and provisioning date |

### Standards snapshot

| Interface | Purpose |
|-----------|---------|
| `ISharePointStandardsExpectation` | Single expected-state rule: area, ID, label, expected value, repairable flag |
| `ISharePointStandardsSnapshot` | Point-in-time snapshot: version, source, expectations list, area counts |

### Observed posture

| Interface | Purpose |
|-----------|---------|
| `ISharePointPostureObservation` | Single live-state observation: area, expectation ID, presence, observed value, metadata |
| `ISharePointPostureSnapshot` | Complete live posture: asset, timestamp, observations, uninspectable areas |

### Drift findings and comparison

| Interface | Purpose |
|-----------|---------|
| `ISharePointDriftFinding` | Single drift finding: area, expectation ID, expected/observed, severity, message, repairable flag |
| `ISharePointAreaComparisonSummary` | Per-area operator summary: outcome, expectations checked/passed, drift/repairable counts |
| `ISharePointComparisonResult` | Full comparison result combining asset, outcome, area summaries, findings, and uninspectable areas |

### Action keys

| Constant / Type | Purpose |
|----------------|---------|
| `SHAREPOINT_CONTROL_ACTION_KEYS` | 4 well-known action keys: `detect-drift`, `preview-repair`, `apply-repair`, `check` |
| `SharePointControlActionKey` | Union type of the action key values |

---

## 3. Provenance / versioning behavior

### Standards source

In Phase 8, all standards are `source: 'code-default'` — derived from the provisioning saga step definitions:

| Standards area | Provisioning source |
|---------------|-------------------|
| SiteExistence | Step 1 — deterministic URL from project metadata |
| DocumentLibraries | Step 2 — CORE_LIBRARIES list |
| TemplateFiles | Step 3 — TEMPLATE_FILE_MANIFEST |
| DataLists | Step 4 — core + workflow-family list definitions |
| WebParts | Step 5 — `HB_INTEL_SPFX_APP_ID` in app catalog |
| SecurityGroups | Step 6 — three-group naming convention |
| HubAssociation | Step 7 — `SHAREPOINT_HUB_SITE_ID` |
| AppCatalogPosture | Package presence via app catalog API |
| ApiAccessPosture | API permission grant status |

### Version tracking

- Each snapshot carries a `version` string (e.g., `'code-default-v1'`).
- The `IAdminStandardsReference` from `IAdminAudit.ts` links runs to the standards version used.
- The `IAdminConfigSnapshotReference` provides additional traceability for the config state at comparison time.

### Forward compatibility with Phase 10

The `source` field on both `ISharePointStandardsSnapshot` and `IAdminStandardsReference` supports `'live-override'` and `'merged'` for Phase 10 configuration governance. Phase 8 only uses `'code-default'`.

---

## 4. Comparison rules

### Matching

Each `ISharePointStandardsExpectation` is matched to an `ISharePointPostureObservation` by `area` + `expectationId`.

### Drift classification

| Condition | Outcome | Severity |
|-----------|---------|----------|
| Expected item exists and matches | Compliant | — |
| Expected item missing entirely | Drifted | `critical` |
| Expected item exists but value differs | Drifted | `warning` |
| Area could not be inspected | Unknown | — (reported in `uninspectableAreas`) |
| Inspection failed with error | Error | — (reported in outcome) |

### Area rollup

An area is:
- `compliant` if all expectations in that area passed,
- `drifted` if any expectation in that area produced a drift finding,
- `unknown` if the area was uninspectable,
- `error` if the inspection failed for that area.

### Overall rollup

The overall `ISharePointComparisonResult.outcome` is:
- `compliant` if all areas are compliant,
- `drifted` if any area is drifted (even if others are compliant),
- `unknown` if any area is unknown and none are drifted,
- `error` if any area errored and none are drifted.

### Repair eligibility

A drift finding is `repairable: true` only if it corresponds to an idempotent-create operation within the Phase 8 active boundary (see P8-02 baseline section 8.3). Findings that require destructive operations, schema migration, or tenant-admin consent are `repairable: false`.

---

## 5. Limitations / future-extension notes

| Limitation | Phase 8 state | Future extension |
|-----------|---------------|-----------------|
| Standards source is code-default only | Derived from provisioning step definitions | Phase 10 adds live-override and merged sources |
| No partial-match scoring | Binary present/absent or match/mismatch | Later phases may add weighted scoring |
| No cross-site comparison aggregation | Each site compared independently | Later phases may add fleet-wide dashboards |
| Data list schema comparison is presence-only | Checks list existence and field count | Later phases may compare individual field types |
| Template file comparison is presence-only | Checks file existence, not content hash | Later phases may add content versioning |
| Security group comparison checks existence only | Checks group exists in Entra by name | Later phases may compare membership posture |
| No live-admin standards editing UX | Standards are code-embedded | Phase 10 adds operator-editable standards |

---

## 6. Validation strategy

### Verified

| Check | Command | Result |
|-------|---------|--------|
| Models typecheck | `pnpm --filter @hbc/models check-types` | **Pass** |
| Backend typecheck | `pnpm --filter @hbc/functions check-types` | **Pass** |
| Admin lint | `pnpm --filter @hbc/spfx-admin lint` | **Pass** |
| Admin build | `pnpm --filter @hbc/spfx-admin build` | **Pass** — tsc + vite, built in 2.92s |

### What is not run

| Check | Reason |
|-------|--------|
| Backend tests | No backend service code changed — contract-only addition |
| Admin tests | No frontend code changed |
| E2E tests | Not applicable |

### Why this set

`@hbc/models` was touched (new file + barrel export update). Verified that the new contracts compile cleanly and that downstream consumers (`@hbc/functions`, `@hbc/spfx-admin`) are unaffected. The change is purely additive — no existing types were modified.

---

## Cross-references

- [Phase 8 Control Baseline](admin-spfx-phase-8-sharepoint-control-baseline.md) — managed-asset boundary and active/advisory split
- [Phase 8 Repo-Truth Audit](admin-spfx-phase-8-repo-truth-audit.md) — existing foundations
- Contract code: `packages/models/src/admin-control-plane/ISharePointControl.ts`
- Barrel exports: `packages/models/src/admin-control-plane/index.ts`
- Pattern reference: `packages/models/src/admin-control-plane/IAppBinding.ts` — drift finding model
- Pattern reference: `packages/models/src/admin-control-plane/IAdminAudit.ts` — standards reference, evidence types
