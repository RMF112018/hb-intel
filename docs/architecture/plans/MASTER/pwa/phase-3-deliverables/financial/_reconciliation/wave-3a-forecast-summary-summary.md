# Wave 3A Forecast Summary — Closure Summary

| Property | Value |
|----------|-------|
| **Date** | 2026-03-29 |
| **Scope** | Forecast Summary repository path, surface wiring, operational hardening (Waves 3A.1–3A.4) |
| **Status** | **Wave 3A complete** |

---

## 1. Objective

Implement the first repository-backed Financial domain service, wire the Forecast Summary surface to consume it, and harden operational posture so the surface behaves as a governed working surface rather than a data form.

---

## 2. Files Inspected

| # | File | Purpose |
|---|------|---------|
| 1 | `packages/features/project-hub/src/financial/services/ForecastSummaryService.ts` | Domain service (198 lines) |
| 2 | `packages/features/project-hub/src/financial/hooks/useForecastSummary.ts` | Surface hook — facade-wired |
| 3 | `packages/features/project-hub/src/financial/hooks/useForecastSummaryPosture.ts` | Posture hook (239 lines) |
| 4 | `packages/features/project-hub/src/financial/ui/ForecastSummaryPage.tsx` | Page component |
| 5 | `packages/data-access/src/ports/IFinancialRepository.ts` | Facade port |
| 6 | `packages/data-access/src/adapters/mock/MockFinancialRepository.ts` | Mock adapter |
| 7 | `packages/data-access/src/factory.ts` | Factory registration |
| 8 | `packages/features/project-hub/src/financial/__tests__/ForecastSummaryService.test.ts` | 12 tests |
| 9 | `packages/features/project-hub/src/financial/__tests__/useForecastSummaryPosture.test.ts` | 9 tests |
| 10 | `FIN-PR1-Financial-Production-Readiness-Maturity-Model.md` | Maturity model |
| 11 | `Financial-Acceptance-and-Release-Readiness-Model.md` | Readiness model |

---

## 3. Files Changed

### Wave 3A.1 — Domain Service (v0.2.88)
- Created `ForecastSummaryService.ts` — load, editField, getFieldsWithValues, getFieldsByGroup
- Created `ForecastSummaryService.test.ts` — 12 tests
- Updated `@hbc/data-access` barrel exports — 14 port-level types added

### Wave 3A.2 — Surface Wiring (v0.2.89)
- Updated `useForecastSummary.ts` — sections/KPIs/version/stale from facade
- Updated `ForecastSummaryPage.tsx` — fixed Griffel CSS shorthands

### Wave 3A.3 — Operational Hardening (v0.2.90)
- Created `useForecastSummaryPosture.ts` — 8 posture states, blockers, warnings
- Created `useForecastSummaryPosture.test.ts` — 9 tests

### Wave 3A.4 — This summary

---

## 4. Runtime/Data-Path Work Completed

| Component | Status | Evidence |
|-----------|--------|----------|
| `ForecastSummaryService.load()` | **Implemented** | Composes `repo.getModulePosture()` + `repo.getCurrentWorkingVersion()` + `repo.getForecastSummary()` |
| `ForecastSummaryService.editField()` | **Implemented** | Validates editability → persists via `repo.updateForecastSummaryField()` → returns cascade-recomputed fields |
| Field registry (28 fields, 8 groups) | **Implemented** | `FORECAST_SUMMARY_FIELD_REGISTRY` with editability, type, and group classification |
| Cascade recomputation map | **Implemented** | 6 editable fields trigger cascading derived field recomputation |
| Factory → MockFinancialRepository path | **Active** | `createFinancialRepository('mock')` → `MockFinancialRepository.getForecastSummary()` |

---

## 5. Surface Wiring Work Completed

| Component | Status | Evidence |
|-----------|--------|----------|
| `useForecastSummary` → facade | **Migrated** | Sections from `ForecastSummaryService.getFieldsWithValues()`, KPIs from facade summary metrics, version/stale from facade posture |
| Save pathway | **Migrated** | `saveChanges()` persists through `ForecastSummaryService.editField()` |
| Section grouping | **Worksheet-aligned** | 8 groups matching worksheet tab structure |
| Griffel CSS | **Fixed** | 3 shorthand violations corrected to longhand |

---

## 6. Operational Hardening Completed

| Posture State | Implemented | Evidence |
|---------------|-------------|----------|
| `editable` | Yes | PM on Working version |
| `view-only` | Yes | ConfirmedInternal, PublishedMonthly, Superseded |
| `blocked` | Yes | Stale budget lines or incomplete checklist |
| `warning` | Yes | Profit margin below 5% threshold |
| `stale` | Yes | `staleBudgetLineCount > 0` |
| `loading` | Yes | While facade query in-flight |
| `error` | Yes | On facade failure |
| `waiting` | Defined but not yet triggered | Requires review custody (not yet implemented) |

| Governance Rule | Enforced | Mechanism |
|----------------|----------|-----------|
| PM-only editability on Working | Yes | `canEdit = versionState === 'Working' && viewerRole === 'pm'` |
| Immutable non-Working versions | Yes | `canEdit = false` for Confirmed/Published/Superseded |
| Checklist blocker | Yes | `checklistCompleted < checklistRequired` |
| Stale-budget blocker | Yes | `staleBudgetLineCount > 0` |
| Confirmation gate | Yes | `canConfirm = canEdit && blockers.length === 0 && confirmationGateCanPass` |
| Derive eligibility | Yes | `canDerive = Confirmed or Published` |

---

## 7. Worksheet Alignment Findings

The Financial Forecast Summary & Checklist.xlsx worksheet informed the following:

| Aspect | Worksheet Influence | Doctrine Override |
|--------|-------------------|-------------------|
| **Section grouping** | 8 field groups match worksheet tab/section structure (Project Info, Schedule, Contract, Cost, Profit, Contingency, GC/GR, Executive Summary) | Field names governed by T04 `IFinancialForecastSummary` |
| **Editable vs derived** | Worksheet distinguishes formula cells from input cells; this maps to `editable: true/false` in the field registry | Editability governed by Financial-ABMC §2 role×state matrix |
| **Checklist proximity** | Worksheet has checklist as an adjacent tab; `useForecastSummaryPosture` exposes checklist progress and blocker link to checklist tool | Confirmation gate rules governed by Financial-LMG §3 |
| **Operator workflow** | Worksheet's top-to-bottom editing flow informed section ordering | Route/context rules governed by FIN-04 |

**No worksheet-vs-doctrine conflicts observed.** The worksheet's field structure aligns with T04 contracts that were already designed from it.

---

## 8. Maturity/Readiness Judgment

### Current evidence

| Evidence Item | Present |
|--------------|---------|
| Repository-backed load path | Yes — `ForecastSummaryService.load()` → `IFinancialRepository.getForecastSummary()` |
| Repository-backed edit path | Yes — `ForecastSummaryService.editField()` → `IFinancialRepository.updateForecastSummaryField()` |
| Posture evaluation from facade | Yes — `useForecastSummaryPosture` sources from facade posture |
| Route-safe context | Yes — hook re-queries on projectId/period change |
| 21 Forecast Summary tests | Yes — 12 service + 9 posture |
| Real non-mock data adapter | **No** — `MockFinancialRepository` returns deterministic mock data |
| Real SharePoint/API persistence | **No** |

### Judgment

**Forecast Summary has advanced to the boundary between Stage 3 (Implementation Scaffold) and Stage 4 (Partially Operational).**

The repository-backed runtime path, domain service, facade-wired hooks, and posture evaluation are all implemented and tested. However, the underlying adapter is `MockFinancialRepository` — no real persistence exists. Under FIN-PR1 Stage 4 definition ("real data access path exists; at least one workflow path uses real data"), Forecast Summary cannot claim Stage 4 until `MockFinancialRepository` is replaced with a real adapter for at least the summary load/edit methods.

**ARRM R4 ("Implementation Complete") requires** `IFinancialRepository` facade to return real project data. The mock adapter does not satisfy this.

**Recommended classification:** Forecast Summary at **Stage 3+ (Implementation Scaffold with repository-backed domain path)** — all runtime seams are in place; advancing to Stage 4 requires only replacing the mock adapter with a real one.

---

## 9. Remaining Blockers

| # | Blocker | Impact | Required For |
|---|---------|--------|-------------|
| 1 | `MockFinancialRepository` — no real adapter | Cannot prove real data flows | Stage 4 / R4 |
| 2 | Commentary/exposure items still mock-sourced | Incomplete surface data | R5 operational completeness |
| 3 | GC/GR invalidation cascade not wired | Forecast Summary `gcgrTotalVariance` field depends on GC/GR tool | Full cross-tool accuracy |
| 4 | Review custody not wired | `waiting` posture state not triggerable | R5 review workflow proof |
| 5 | Confirmation gate G4 not runtime-wired | Can confirm with invalid GC/GR posture | Full confirmation safety |

---

## 10. Recommended Next Prompt

**Wave 3B: GC/GR Forecast — implement the repository-backed GC/GR domain path and surface.**

Rationale:
- GC/GR is the primary upstream dependency for Forecast Summary's `gcgrTotalVariance` field
- GC/GR contracts are complete (Wave 1A: `IGCGRLine`, `IGCGRSummaryRollup`, computors)
- GC/GR facade methods already exist in `IFinancialRepository` (`getGCGRLines`, `getGCGRSummaryRollup`, `updateGCGRLine`)
- Implementing GC/GR unblocks the cross-tool cascade validation needed for Forecast Summary's G4 gate
- The `GCGRPage` UI workspace already exists and just needs facade wiring (same pattern as 3A.2)
