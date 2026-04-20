# Wave 2 Repository and Composition-Root Summary

| Property | Value |
|----------|-------|
| **Date** | 2026-03-29 |
| **Scope** | Financial repository facade, factory registration, mock adapter, hook migration (Waves 2A–2D) |
| **Status** | **Wave 2 complete** |

---

## 1. Objective

Establish the Financial module's repository boundary in the repo's standard composition-root pattern so downstream Wave 3 capability work can implement real data access without structural redesign.

---

## 2. Files Inspected

| # | File | Purpose |
|---|------|---------|
| 1 | `packages/data-access/src/ports/IFinancialRepository.ts` | Facade port — 40+ methods, 22 port-level types |
| 2 | `packages/data-access/src/ports/index.ts` | Port barrel — exports IFinancialRepository + types |
| 3 | `packages/data-access/src/index.ts` | Main barrel — exports createFinancialRepository |
| 4 | `packages/data-access/src/factory.ts` | Factory — createFinancialRepository() registered |
| 5 | `packages/data-access/src/adapters/mock/MockFinancialRepository.ts` | Mock adapter — 40+ method implementations |
| 6 | `packages/data-access/src/adapters/mock/index.ts` | Mock barrel — exports MockFinancialRepository |
| 7 | `packages/features/project-hub/src/financial/hooks/useFinancialRepository.ts` | Singleton facade provider |
| 8 | `packages/features/project-hub/src/financial/hooks/useFinancialControlCenter.ts` | Migrated to facade posture |
| 9 | `packages/features/project-hub/src/financial/hooks/useChecklistSurface.ts` | Migrated to facade checklist |
| 10 | `packages/features/project-hub/package.json` | @hbc/data-access dependency added |

---

## 3. Files Changed

### Wave 2A — Repository Ports (v0.7.1)
- Created `IFinancialRepository.ts` — canonical facade with 40+ methods across 10 capability groups
- 22 port-level record shapes defined inline (avoids circular dependency with features package)
- Shared result types: `FinancialOperationResult<T>`, `FinancialPagedResult<T>`
- Port-level state enums: `FinancialVersionStatePort`, `FinancialAuthorityRolePort`, `ReviewCustodyStatusPort`, `ReportingPeriodStatusPort`

### Wave 2B — Factory Registration + Mock Adapter (v0.7.2)
- Created `MockFinancialRepository` — 40+ methods returning deterministic mock data
- Registered `createFinancialRepository()` in factory with mock/proxy/sharepoint/api mode support
- Financial is the 12th domain in the standard composition-root pattern

### Wave 2C — Hook Migration (v0.2.86)
- Created `useFinancialRepository` — singleton facade provider memoizing `createFinancialRepository()`
- Migrated `useFinancialControlCenter` — posture fields sourced from `repo.getModulePosture()`
- Migrated `useChecklistSurface` — checklist items sourced from `repo.getChecklist()`
- Added `@hbc/data-access: workspace:*` dependency to features-project-hub

### Wave 2D — Validation (this file)

---

## 4. Repository/Composition-Root Work Completed

| Component | Status | Evidence |
|-----------|--------|----------|
| `IFinancialRepository` facade port | **Created** | `packages/data-access/src/ports/IFinancialRepository.ts` — 40+ methods |
| Factory registration | **Registered** | `createFinancialRepository()` in `factory.ts` |
| Mock adapter | **Implemented** | `MockFinancialRepository` with deterministic data |
| Mock barrel export | **Added** | `adapters/mock/index.ts` |
| Main barrel export | **Added** | `src/index.ts` exports `createFinancialRepository` |
| Singleton provider hook | **Created** | `useFinancialRepository()` in features-project-hub |

---

## 5. Hook/View-Model Seam Migrations Completed

| Hook | Migration Status | Data Source |
|------|-----------------|-------------|
| `useFinancialRepository` | **New** — singleton facade provider | `createFinancialRepository()` |
| `useFinancialControlCenter` | **Migrated** — posture from facade | `repo.getModulePosture()` with inline fallback |
| `useChecklistSurface` | **Migrated** — items from facade | `repo.getChecklist()` with template fallback |

---

## 6. Seams Intentionally Deferred

The following hooks still use inline mock data for their specialized view-model shapes. Each will be migrated individually in Wave 3 as its facade methods are consumed:

| Hook | Current Data Source | Wave 3 Facade Method |
|------|-------------------|---------------------|
| `useBudgetSurface` | Inline mock data | `repo.getBudgetLines()`, `repo.getReconciliationConditions()` |
| `useForecastSummary` | Inline mock data | `repo.getForecastSummary()` |
| `useGCGRSurface` | Inline mock data | `repo.getGCGRLines()`, `repo.getGCGRSummaryRollup()` |
| `useCashFlowSurface` | Inline mock data | `repo.getCashFlowForecasts()`, `repo.getCashFlowSummary()` |
| `useBuyoutSurface` | Inline mock data | `repo.getBuyoutLines()`, `repo.getBuyoutSummaryMetrics()` |
| `useReviewSurface` | Inline mock data | `repo.getReviewCustodyHistory()`, `repo.getCurrentCustodyStatus()` |
| `usePublicationSurface` | Inline mock data | `repo.getPublicationHistory()`, `repo.evaluatePublicationEligibility()` |
| `useHistorySurface` | Inline mock data | `repo.getAuditEvents()` |
| `useFinancialOperationalState` | Inline evaluation | Will wire to facade posture for real blocker/readiness data |
| `useFinancialSessionHistory` | Inline mock data | Will wire to facade audit events |

---

## 7. Confirmation: Wave 2 Did Not Overclaim R4 / Stage 4

Verified:
- `MockFinancialRepository` returns deterministic mock data — no real network/storage/API calls
- No proxy, SharePoint, or API adapter exists for Financial (all throw `AdapterNotImplementedError`)
- FIN-PR1 §3.2 still shows all 10 tools at Stage 3 (Implementation Scaffold)
- ARRM §4 still shows all capabilities at R4: Not started
- No readiness artifact was updated to claim R4

The mock-backed facade improves composition-root integrity and seam quality but does not by itself prove Stage 4 / R4 under FIN-PR1.

---

## 8. Recommended First Wave 3 Prompt

**Wave 3A: Implement real data-backed Budget Import workflow through the Financial facade.**

Scope:
- Replace `MockFinancialRepository` Budget methods with real SharePoint list queries
- Migrate `useBudgetSurface` to consume `repo.getBudgetLines()` and `repo.getReconciliationConditions()`
- Wire budget import session creation through `IBudgetImportRepository`
- Connect the Budget tool page to real project data
- This would be the first capability to truthfully claim R4 (Partially Operational) if a real data path is proven

Alternative first Wave 3 target: Buyout — closest to existing SharePoint list definitions (`financial-list-definitions.ts` has Buyout Log and Buyout Bid Lines).
