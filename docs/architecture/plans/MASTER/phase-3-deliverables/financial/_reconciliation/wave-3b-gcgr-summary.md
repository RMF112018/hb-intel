# Wave 3B GC/GR Forecast — Closure Summary

| Property | Value |
|----------|-------|
| **Date** | 2026-03-29 |
| **Scope** | GC/GR repository path, surface wiring, operational hardening (Waves 3B.1–3B.4) |
| **Status** | **Wave 3B complete** |

---

## 1. Objective

Implement the second repository-backed Financial domain service for GC/GR Forecast, wire the surface to consume it, and harden operational posture including rollup integrity for the Forecast Summary downstream seam.

---

## 2. Files Inspected

| # | File | Purpose |
|---|------|---------|
| 1 | `services/GCGRService.ts` | Domain service (201 lines) |
| 2 | `hooks/useGCGRSurface.ts` | Surface hook — facade-wired |
| 3 | `hooks/useGCGRPosture.ts` | Posture hook (217 lines) |
| 4 | `ui/GCGRPage.tsx` | Page component (240 lines) |
| 5 | `data-access/ports/IFinancialRepository.ts` | Facade port |
| 6 | `data-access/adapters/mock/MockFinancialRepository.ts` | Mock adapter |
| 7 | `__tests__/GCGRService.test.ts` | 12 tests |
| 8 | `__tests__/useGCGRPosture.test.ts` | 9 tests |
| 9 | `__tests__/t04-contracts.test.ts` | 12 T04 contract tests (shared with Forecast Summary) |

---

## 3. Files Changed

### Wave 3B.1 — Domain Service (v0.2.92)
- Created `GCGRService.ts` — load, editLine, groupByCategory, getGCGRTotalVariance, computeLineVariance
- Created `GCGRService.test.ts` — 12 tests
- Updated `useGCGRSurface.ts` — facade-wired with fallback

### Wave 3B.2 — Surface Wiring (v0.2.93)
- Rewrote `GCGRPage.tsx` — category-grouped layout with subtotals, version posture, immutable banner

### Wave 3B.3 — Operational Hardening (v0.2.94)
- Created `useGCGRPosture.ts` — 7 posture states, rollup integrity, warnings
- Created `useGCGRPosture.test.ts` — 9 tests

---

## 4. Runtime/Data-Path Work Completed

| Component | Status | Evidence |
|-----------|--------|----------|
| `GCGRService.load()` | **Implemented** | Composes `repo.getModulePosture()` + `repo.getCurrentWorkingVersion()` + `repo.getGCGRLines()` + `repo.getGCGRSummaryRollup()` |
| `GCGRService.editLine()` | **Implemented** | Validates → persists via `repo.updateGCGRLine()` → returns updated variance + rollup-affected flag |
| `GCGRService.groupByCategory()` | **Implemented** | Groups lines by GC (01-09) / GR (10-19) / Other (20+) with per-category subtotals |
| `GCGRService.getGCGRTotalVariance()` | **Implemented** | Narrow seam for Forecast Summary's `gcgrTotalVariance` field |
| `GCGRService.computeLineVariance()` | **Implemented** | Local variance computation with zero-budget guard |
| Factory → MockFinancialRepository path | **Active** | `createFinancialRepository('mock')` → GC/GR methods |

---

## 5. Surface Wiring Work Completed

| Component | Status | Evidence |
|-----------|--------|----------|
| `useGCGRSurface` → facade | **Migrated** | Lines and rollup from `GCGRService.load()` with inline mock fallback |
| `GCGRPage` layout | **Rewritten** | Category-grouped sections (GC/GR/Other) with subtotal rows |
| Version posture display | **Implemented** | Badge: Editable/Confirmed/Published/Read-Only + period context |
| Immutable state banner | **Implemented** | "Derive a new Working version to edit" guidance |
| Editable vs derived styling | **Implemented** | `editableCell` (brand tint) vs `derivedCell` (italic/faded) |

---

## 6. Operational Hardening Completed

| Posture State | Implemented | Evidence |
|---------------|-------------|----------|
| `editable` | Yes | PM on Working version |
| `view-only` | Yes | Confirmed/Published/Superseded |
| `blocked` | Yes | Not yet triggered (no stale budget in mock) |
| `warning` | Yes | Over-budget lines + large variance (> 10% of budget) |
| `stale` | Yes | `staleBudgetLineCount > 0` with action link to Budget |
| `loading` | Yes | While facade query in-flight |
| `error` | Yes | On facade failure |

| Governance Rule | Enforced | Mechanism |
|----------------|----------|-----------|
| PM-only editability on Working | Yes | `canEdit = versionState === 'Working' && viewerRole === 'pm'` |
| Immutable non-Working versions | Yes | `canEdit = false` + immutable banner for Confirmed/Published/Superseded |
| Stale-budget dependency | Yes | Blocker with action link to Budget tool |
| Over-budget warning | Yes | Division count in warning message |
| Large variance warning | Yes | > 10% of total budget with Forecast Summary impact note |

---

## 7. Worksheet Alignment Findings

The GC-GR Forecast.xlsm worksheet informed the following:

| Aspect | Worksheet Influence | Doctrine Override |
|--------|-------------------|-------------------|
| **Division grouping** | 3 categories (GC/GR/Other) matching worksheet's row hierarchy | Division-to-category mapping convention (01-09/10-19/20+) |
| **Subtotal rows** | Per-category subtotals for budget/forecast/variance match worksheet pattern | Subtotals computed from facade rollup data, not UI-only |
| **Column order** | Div, Description, Budget, Forecast, Variance, % matches worksheet columns | Field names governed by T04 `IGCGRLine` |
| **Editable indicator** | ✎ marker on Forecast column when Working matches worksheet's input-cell convention | Editability governed by Financial-ABMC §2 |
| **Over-budget coloring** | Red for over-budget, green for under-budget matches worksheet conditional formatting | Colors from `HBC_STATUS_COLORS` in @hbc/ui-kit |

**No worksheet-vs-doctrine conflicts observed.**

---

## 8. Rollup Integrity Findings

| Aspect | Status | Evidence |
|--------|--------|----------|
| `totalVariance` exposed | Yes | `GCGRService.getGCGRTotalVariance()` returns `rollup.totalVariance` |
| Consistency check | Yes | `useGCGRPosture` validates `computedVariance === rollup.totalVariance` within 0.01 tolerance |
| Category subtotals | Yes | `groupByCategory()` computes per-category budget/forecast/variance |
| Forecast Summary seam | Yes | `totalVariance` value feeds `IFinancialForecastSummary.gcgrTotalVariance` |
| Cross-tool cascade | **Partial** | Rollup seam defined and exposed; Forecast Summary G4 gate not yet runtime-wired |

---

## 9. Maturity/Readiness Judgment

### Current evidence

| Evidence Item | Present |
|--------------|---------|
| Repository-backed load path | Yes — `GCGRService.load()` → `IFinancialRepository.getGCGRLines()` + `getGCGRSummaryRollup()` |
| Repository-backed edit path | Yes — `GCGRService.editLine()` → `IFinancialRepository.updateGCGRLine()` |
| Category grouping with rollup | Yes — `groupByCategory()` with subtotals |
| Posture evaluation from facade | Yes — `useGCGRPosture` with 7 states |
| Forecast Summary rollup seam | Yes — `getGCGRTotalVariance()` |
| Route-safe context | Yes — hook re-queries on projectId/period change |
| 21 GC/GR-specific tests | Yes — 12 service + 9 posture |
| Real non-mock data adapter | **No** — MockFinancialRepository |
| Real SharePoint/API persistence | **No** |

### Judgment

**GC/GR has advanced to Stage 3+ (Implementation Scaffold with repository-backed domain path)** — matching Forecast Summary's assessment from Wave 3A.

All runtime seams are in place: domain service, facade-wired hooks, category-grouped surface, posture evaluation, and Forecast Summary rollup seam. Advancing to Stage 4 requires replacing `MockFinancialRepository` with a real adapter.

---

## 10. Remaining Blockers

| # | Blocker | Impact | Required For |
|---|---------|--------|-------------|
| 1 | `MockFinancialRepository` — no real adapter | Cannot prove real data flows | Stage 4 / R4 |
| 2 | Inline line editing UI not wired | Edit persistence is in service but no input fields in page | Full operational editing surface |
| 3 | Forecast Summary G4 gate not runtime-wired | Confirmation can proceed with invalid GC/GR posture | Full cross-tool confirmation safety |
| 4 | Forecast Summary cascade invalidation | Editing GC/GR doesn't yet trigger summary recomputation in real-time | Cross-tool accuracy |

---

## 11. Recommended Next Prompt

**Wave 3C: Remaining Financial capability domain services — Budget Import, Cash Flow, Buyout, Checklist.**

Rationale:
- Forecast Summary (3A) and GC/GR (3B) are now both at Stage 3+ with domain services, facade-wired hooks, and posture evaluation
- The same pattern (domain service + hook migration + posture hook) can be applied to the remaining 5 capabilities in parallel
- Budget Import and Buyout are closest to real data (SharePoint lists already provisioned in `financial-list-definitions.ts`)
- Cash Flow and Checklist have existing hooks that just need facade wiring
- Completing all capabilities at Stage 3+ positions the module for a unified real-adapter push to Stage 4
