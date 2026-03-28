# Financial Repo-Truth Reconciliation Summary

| Property | Value |
|----------|-------|
| **Date** | 2026-03-28 |
| **Scope** | Documentation-only reconciliation |
| **Trigger** | Financial module documentation drift from actual implementation state |
| **Classification** | Repo-truth correction — no runtime code changes |

---

## 1. Files Inspected

### Implementation surfaces
- `apps/pwa/src/router/projectHubRouting.ts` — Financial section registry
- `apps/pwa/src/pages/ProjectHubPage.tsx` — FinancialControlCenter rendering
- `apps/pwa/src/router/workspace-routes.ts` — Route definitions
- `apps/pwa/src/hooks/useProjectHubContext.ts` — Project context resolution
- `packages/features/project-hub/src/financial/` — Full Financial module (UI, hooks, business logic, types, tests)
- `packages/features/project-hub/src/financial/hooks/` — All 5 view-ready hooks
- `packages/features/project-hub/src/financial/ui/` — All 29 UI components
- `packages/features/project-hub/src/spfx-lane/` — SPFx lane infrastructure
- `packages/project-canvas/src/tiles/` — Canvas tile definitions
- `backend/functions/src/config/financial-list-definitions.ts` — SharePoint list definitions
- Global search for `IFinancialRepository` and `MockFinancialRepository` — **neither file exists**

### Governance and plan documents
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-G1-Lane-Capability-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FRM-05-Repo-Truth-Gaps-and-Implementation-Readiness.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FRC-00-Financial-Replacement-Crosswalk.md`

---

## 2. Files Changed

| # | File | Change Summary |
|---|------|---------------|
| 1 | `current-state-map.md` | Added Financial module current-state annotation with accurate maturity classification |
| 2 | `04_Phase-3_Project-Hub-and-Project-Context-Plan.md` | Replaced "are live" with "are present"; added mock-data qualifiers at lines 42, 983; added Financial-specific maturity note to reconciliation note 2 |
| 3 | `phase-3-deliverables/README.md` | Added repo-truth maturity note after T09 closure clarifying contract-level vs operational |
| 4 | `P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md` | Replaced "no production implementations beyond reference examples" with accurate description of contract-level + UI scaffold maturity |
| 5 | `P3-G1-Lane-Capability-Matrix.md` | Changed "Module pages — None" to "Financial only"; corrected Financial PWA/SPFx lane depth from "Full"/"Broad" to "Partially implemented"/"Architecturally defined"; added target-state note to §4.1 |
| 6 | `P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md` | Added repo-truth note to §8.1 Financial navigation matrix marking it as target-state |
| 7 | `FRM-05-Repo-Truth-Gaps-and-Implementation-Readiness.md` | Changed "PWA Financial route/page family — Blocking" to "Partially resolved"; rewrote §3.3 gap to acknowledge existing UI while noting remaining gaps |
| 8 | `FRC-00-Financial-Replacement-Crosswalk.md` | Corrected IFinancialRepository and MockFinancialRepository status from "Implemented"/"Complete" to "Does not exist" |
| 9 | `P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md` | Added repo-truth context annotation before Financial Governance verification items |

---

## 3. Corrected Drift Items

### 3.1 UNDERSTATED claims corrected

| ID | File | Previous Claim | Correction | Evidence |
|----|------|----------------|------------|----------|
| U1 | P3-E2 §13.4 | "Financial...have no production implementations beyond reference examples" | Financial has 29 UI components, 12+ business logic subdomains, 1,979 test lines, and a rendering PWA route | `packages/features/project-hub/src/financial/ui/index.ts` (29 exports), `src/financial/__tests__/` (19 test files), `projectHubRouting.ts:73` |
| U2 | FRM-05 §1.2 | "PWA Financial route/page family — Blocking" | Route exists and renders FinancialControlCenter with 5 sub-surfaces (mock data) | `projectHubRouting.ts:73`, `ProjectHubPage.tsx:388` |
| U3 | FRM-05 §3.3 | "No dedicated Financial module surfaces exist yet" | Sub-surfaces exist as UI components within FinancialControlCenter via state-based navigation | `FinancialControlCenter.tsx` renders ForecastSummaryPage, BudgetPage, CashFlowPage, BuyoutPage via `surfaceMode` state |
| U4 | P3-G1 §1.1 | "Module pages — None" | Financial route exists and renders | `projectHubRouting.ts:73`, `ProjectHubPage.tsx:388` |

### 3.2 OVERCLAIMED statements corrected

| ID | File | Previous Claim | Correction | Evidence |
|----|------|----------------|------------|----------|
| O1 | Phase 3 Plan line 42 | "contract-level implementations...are live" | Changed to "are present" with mock-data qualifier | All 5 hooks (`useFinancialControlCenter.ts`, `useForecastSummary.ts`, `useBudgetSurface.ts`, `useCashFlowSurface.ts`, `useBuyoutSurface.ts`) return hardcoded mock data; zero HTTP/API calls |
| O2 | Phase 3 Plan line 983 | "substantial Phase 3 module implementation already landed" | Added "mock-only data access" qualifier for Financial | Same evidence as O1 |
| O3 | P3-G1 §3 | Financial PWA: "Full — first-class working surface" | Changed to "Partially implemented — UI scaffold with mock data" | No real data access; state-based navigation only |
| O4 | P3-G1 §3 | Financial SPFx: "Broad — operational surface" | Changed to "Architecturally defined — infrastructure stubs" | `spfx-lane/constants.ts` defines module maps but no data-connected SPFx web parts exist |
| O5 | FRC-00 §4.6 | "`IFinancialRepository` port — Implemented, NOT registered in factory" | File does not exist | Glob search `**/IFinancialRepository*` returns zero results; grep finds references only in docs and hook comments |
| O6 | FRC-00 §4.6 | "`MockFinancialRepository` — Complete" | File does not exist | Glob search `**/MockFinancialRepository*` returns zero results |

### 3.3 AMBIGUOUS language clarified

| ID | File | Issue | Resolution |
|----|------|-------|------------|
| A1 | Phase 3 Plan reconciliation note 2 | Did not distinguish contract-level from operational for Financial | Added Financial-specific maturity note explicitly defining what "contract-level" includes and excludes |
| A2 | P3-G1 §4.1 | Financial capability table reads as current state but is target-state | Added repo-truth note before table marking all capabilities as target-state requirements |
| A3 | P3-G2 §8.1 | Financial navigation matrix reads as current state but is target-state | Added repo-truth note before table marking navigation patterns as target-state |
| A4 | P3-H1 §6.1 governance verification | Unchecked items lack explicit current-state context | Added repo-truth context annotation describing actual implementation state |

---

## 4. Evidence Basis

### Verified present-state facts

| Fact | Evidence Location |
|------|------------------|
| Financial route registered and rendering | `apps/pwa/src/router/projectHubRouting.ts:73` — `{ slug: 'financial', label: 'Financial' }` |
| FinancialControlCenter renders in PWA | `apps/pwa/src/pages/ProjectHubPage.tsx:388` — conditional render when `financialSection` is truthy |
| 29 UI components exist | `packages/features/project-hub/src/financial/ui/index.ts` barrel exports |
| 12+ business logic subdomains | `packages/features/project-hub/src/financial/index.ts` — 96 exports across 14 subdomain re-exports |
| 1,979 test lines / 19 files | `packages/features/project-hub/src/financial/__tests__/` directory |
| All hooks return mock data | Hook files contain no `fetch`, `axios`, or repository calls; docstrings reference future `IFinancialRepository` wiring |
| IFinancialRepository does not exist | `Glob('**/IFinancialRepository*')` returns zero results |
| MockFinancialRepository does not exist | `Glob('**/MockFinancialRepository*')` returns zero results |
| Sub-tool navigation is state-based | `FinancialControlCenter.tsx` uses `useState<FinancialSurfaceMode>('control-center')` |
| Project context is durable | `useProjectHubContext.ts` reconciles route params with Zustand store; `projectId` persists in URL |
| 5 SharePoint list definitions | `backend/functions/src/config/financial-list-definitions.ts` |
| SPFx lane is infrastructure stubs | `packages/features/project-hub/src/spfx-lane/constants.ts` defines module maps; no data-connected web parts |

---

## 5. Remaining Non-Reconciliation Gaps

These issues were discovered during reconciliation but are intentionally **not** resolved in this pass because they require future implementation or doctrine work, not documentation wording corrections.

| # | Gap | Type | Why Not Resolved Here |
|---|-----|------|-----------------------|
| 1 | `IFinancialRepository` port interface needs to be created | Implementation | Requires code creation, not doc correction |
| 2 | Repository factory registration needed | Implementation | Requires runtime wiring |
| 3 | URL-routed sub-tool navigation needed (replace `useState` `surfaceMode` with route params) | Implementation | Requires router changes in `projectHubRouting.ts` and `ProjectHubPage.tsx` |
| 4 | Real data adapter implementations needed for all 5 view hooks | Implementation | Requires `IFinancialRepository` + backend integration |
| 5 | Spine adapters need real data connections (Activity, Work Queue, Related Items, Health) | Implementation | Requires adapter implementations across shared packages |
| 6 | SPFx Financial lane needs data-connected surfaces | Implementation | Requires SPFx web part development |
| 7 | T04 source contracts (`IFinancialForecastSummary`, `IGCGRLine`) still pending | Implementation | Documented in T09 closure; requires contract authoring |
| 8 | GC/GR sub-surface UI component not yet created | Implementation | Only 4 of 5 planned sub-surfaces have UI components |
| 9 | Financial Governance verification items (P3-H1 §6.1) remain unchecked | Acceptance | Require operational evidence, not doc wording changes |
| 10 | FRM-05 §3.3 gap priority remains Critical — gap description was revised to acknowledge existing UI scaffold but blocking conditions (mock data, no URL routing, no data access) persist | No action needed | Priority correctly reflects remaining blocking conditions |
| 11 | BIP-05 and FVC-05 "incomplete operational shell" assessments remain accurate | No action needed | Correctly describe current state |
| 12 | Financial doctrine files (FIN-01 through FIN-04, SOTL, governance specs) are target-state and need no current-state correction | No action needed | Target-state doctrine is appropriately separated |

---

## 6. Reconciliation Outcome

The repo now accurately communicates:

1. **What the Financial module currently does** — renders a UI scaffold with 29 components and mock data at a registered PWA route, backed by 12+ business logic subdomains with comprehensive tests
2. **What is architecturally defined but not yet operational** — SPFx Financial lane, cross-lane handoff, spine data connections
3. **What is partially implemented** — PWA route (wired), sub-tool navigation (state-based not URL-routed), UI components (complete but mock-data-only)
4. **What remains target-state only** — URL-routed sub-tools, `IFinancialRepository` data access layer, real data fetching/persistence, operational Financial CRUD
5. **Where current posture differs from plan** — the plan's "Full"/"Broad" lane depth is target-state; current PWA is "partially implemented" and SPFx is "architecturally defined"
