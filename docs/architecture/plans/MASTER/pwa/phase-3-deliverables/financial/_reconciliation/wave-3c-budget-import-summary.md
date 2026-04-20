# Wave 3C Budget Import — Closure Summary

| Property | Value |
|----------|-------|
| **Date** | 2026-03-29 |
| **Scope** | Budget Import repository path, surface wiring, operational hardening (Waves 3C.1–3C.4) |
| **Status** | **Wave 3C complete** |

---

## 1. Objective

Implement the third repository-backed Financial domain service for Budget Import, wire the surface to consume it, and harden operational posture including CSV parsing, reconciliation visibility, and downstream stale-state impact assessment.

---

## 2. Files Inspected

| # | File | Purpose |
|---|------|---------|
| 1 | `services/BudgetImportService.ts` | Domain service (234 lines) |
| 2 | `hooks/useBudgetSurface.ts` | Surface hook — facade-wired |
| 3 | `hooks/useBudgetImportPosture.ts` | Posture hook (197 lines) |
| 4 | `ui/BudgetPage.tsx` | Page component (132 lines) |
| 5 | `__tests__/BudgetImportService.test.ts` | 12 tests |
| 6 | `__tests__/useBudgetImportPosture.test.ts` | 9 tests |
| 7 | `data-access/ports/IFinancialRepository.ts` | Facade port |
| 8 | `data-access/adapters/mock/MockFinancialRepository.ts` | Mock adapter |
| 9 | `docs/reference/example/financial/Procore_Budget.csv` | Source shape reference |

---

## 3. Files Changed

### Wave 3C.1 — Domain Service (v0.2.96)
- Created `BudgetImportService.ts` — load, resolveCondition, updateFTC, CSV parser, validator
- Created `BudgetImportService.test.ts` — 12 tests
- Updated `useBudgetSurface.ts` — facade-wired
- Updated `@hbc/data-access` barrel — 4 additional port types exported

### Wave 3C.2 — Surface Wiring (v0.2.97)
- Rewrote `BudgetPage.tsx` — import posture band, enhanced reconciliation messaging, Griffel fixes

### Wave 3C.3 — Operational Hardening (v0.2.98)
- Created `useBudgetImportPosture.ts` — 8 posture states, downstream impact, reconciliation visibility
- Created `useBudgetImportPosture.test.ts` — 9 tests

---

## 4. Runtime/Data-Path Work Completed

| Component | Status | Evidence |
|-----------|--------|----------|
| `BudgetImportService.load()` | **Implemented** | Composes `repo.getModulePosture()` + `repo.getCurrentWorkingVersion()` + `repo.getBudgetLines()` + `repo.getReconciliationConditions()` |
| `BudgetImportService.resolveCondition()` | **Implemented** | Persists via `repo.resolveReconciliationCondition()` |
| `BudgetImportService.updateFTC()` | **Implemented** | Persists via `repo.updateBudgetLineFTC()` |
| `parseProcoreBudgetCsv()` | **Implemented** | Parses 21-column Procore CSV into `ProcreBudgetCsvRow` structs |
| `validateImportRows()` | **Implemented** | Validates required fields + warns on negative amounts |
| Factory → MockFinancialRepository path | **Active** | Budget methods return deterministic mock data |

---

## 5. Surface Wiring Work Completed

| Component | Status | Evidence |
|-----------|--------|----------|
| `useBudgetSurface` → facade | **Migrated** | Sources lines/conditions/posture from `BudgetImportService.load()` |
| `BudgetPage` import posture | **Implemented** | Line count badge, pending reconciliation badge, source attribution |
| Reconciliation banner | **Enhanced** | Confirmation-blocked messaging with pending count |
| Griffel CSS | **Fixed** | 3 shorthand violations corrected |

---

## 6. Operational Hardening Completed

| Posture State | Implemented | Evidence |
|---------------|-------------|----------|
| `actionable` | Yes | PM + Working + not blocked |
| `blocked` | Yes | Non-Working version |
| `warning` | Yes | Non-PM role info |
| `invalid` | Defined | Not yet triggered from real validation |
| `unmatched` | Yes | Pending reconciliation conditions |
| `waiting` | Yes | Read-only fallback |
| `loading` | Yes | While facade query in-flight |
| `error` | Yes | On facade failure |

| Governance Rule | Enforced | Mechanism |
|----------------|----------|-----------|
| PM-only import/edit/resolve | Yes | `canImport`/`canEditFTC`/`canResolveCon` |
| Import blocked on non-Working | Yes | `isImportBlocked` from facade posture |
| Reconciliation blocks confirmation | Yes | Pending conditions → `confirmationBlocked` downstream |
| Non-PM role warning | Yes | Info-level warning for non-PM roles |

---

## 7. CSV Alignment Findings

The Procore_Budget.csv informed the following:

| Aspect | CSV Influence | Doctrine Override |
|--------|-------------|-------------------|
| **Column mapping** | 21 CSV columns mapped to `ProcreBudgetCsvRow` fields (subJob, costCodeTier1-3, costType, budgetCode, amounts) | Field names governed by T02 `IBudgetLineItem` |
| **Identity field** | `budgetCode` column maps to `canonicalBudgetLineId` resolution | Identity resolution algorithm governed by BIP-02 |
| **Amount extraction** | Original Budget, Committed Costs, JTD Costs, FTC, EAC parsed from CSV | Separated cost model governed by T02 §3.2 |
| **Empty row filtering** | Summary/empty rows with blank budget code filtered | Not applicable to governance |
| **Source attribution** | "Procore CSV import" label in import posture band | Source-of-truth governed by PH3-FIN-SOTL §4 |

**No CSV-vs-doctrine conflicts observed.** BIP-02 contracts align with Procore CSV column structure.

---

## 8. Downstream Impact Findings

| Aspect | Status | Evidence |
|--------|--------|----------|
| `confirmationBlocked` | Yes | Pending reconciliation conditions → gate G3 blocked |
| `staleBudgetLineCount` | Yes | Facade-sourced from module posture |
| `forecastImpacted` | Yes | True when stale lines or pending conditions exist |
| Forecast Summary cascade | **Exposed** | `forecastImpacted` flag signals that budget data affects forecast accuracy |
| GC/GR cascade | **Indirect** | Budget staleness may affect GC/GR lines via budget baseline |

The downstream impact assessment in `useBudgetImportPosture` provides the cross-tool stale-state visibility that Forecast Summary and GC/GR posture hooks consume to evaluate their own readiness.

---

## 9. Maturity/Readiness Judgment

### Current evidence

| Evidence Item | Present |
|--------------|---------|
| Repository-backed load path | Yes — `BudgetImportService.load()` → facade methods |
| Repository-backed actions | Yes — `resolveCondition()` and `updateFTC()` via facade |
| CSV parser/validator | Yes — `parseProcoreBudgetCsv()` + `validateImportRows()` |
| Posture evaluation from facade | Yes — `useBudgetImportPosture` with 8 states |
| Downstream impact assessment | Yes — `BudgetImportDownstreamImpact` |
| Route-safe context | Yes — hook re-queries on projectId/period change |
| 21 Budget Import tests | Yes — 12 service + 9 posture |
| Real non-mock data adapter | **No** — MockFinancialRepository |

### Judgment

**Budget Import at Stage 3+ (Implementation Scaffold with repository-backed domain path)** — matching Forecast Summary and GC/GR assessments.

---

## 10. Remaining Blockers

| # | Blocker | Impact | Required For |
|---|---------|--------|-------------|
| 1 | `MockFinancialRepository` — no real adapter | Cannot prove real data flows | Stage 4 / R4 |
| 2 | CSV upload UI not implemented | No file selection or upload mechanism | Full import workflow |
| 3 | Inline reconciliation resolution UI | MergedInto/CreatedNew actions not wired to page | Operational reconciliation |
| 4 | Inline FTC editing per budget line | Edit persistence is in service but no input fields in grid | Full line-level editing |
| 5 | Import session creation not wired | `createImportSession()` not yet in facade | Full import lifecycle |

---

## 11. Recommended Next Prompt

**Wave 3D: Cash Flow, Buyout, and Checklist domain services — complete the remaining 3 capabilities to reach uniform Stage 3+ across all Financial tools.**

Rationale:
- Forecast Summary (3A), GC/GR (3B), and Budget Import (3C) are now all at Stage 3+ with domain services, facade-wired hooks, and posture evaluation
- Cash Flow, Buyout, and Checklist each have existing hooks that need the same pattern: domain service + facade wiring + posture hook
- All three have facade methods already defined in `IFinancialRepository`
- Completing all tools at Stage 3+ positions the full module for unified real-adapter and acceptance work
- Can be done in a single wave since the pattern is now well-established
