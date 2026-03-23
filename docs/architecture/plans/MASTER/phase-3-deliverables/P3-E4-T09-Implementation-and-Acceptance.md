# P3-E4 — Financial Module: Implementation and Acceptance

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4-T09 |
| **Parent** | [P3-E4 Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T09: Implementation and Acceptance |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: the full implementation guide with staged sub-scopes (FIN.0–FIN.9), package blockers and current status, cross-file follow-up notes, data import and migration strategy, and the complete acceptance gate (AC-FIN-01 through AC-FIN-42).*

---

## 16. Package Blockers

The following blockers affect specific Financial module capabilities. Each is listed with its current status.

### B-FIN-01 — `@hbc/field-annotations` section/block anchor support

**Capability required:** Financial annotation anchors must target section-level and block-level elements (forecast summary sections, GC/GR divisions, cash flow blocks, buyout sections) in addition to classic form-field anchors.

**Status: RESOLVED.** Section/block anchor support was delivered in `@hbc/field-annotations` v0.2.0 via `AnchorType` discriminator (`'field' | 'section' | 'block'`) and `HbcAnnotationAnchor` wrapper component. Financial module implementation may proceed with full annotation targeting.

### B-FIN-02 — `@hbc/my-work-feed` provenance fields for Push-to-Project-Team

**Capability required:** When PER pushes a Financial annotation to the project team, the work queue item must carry full provenance: `originRole: 'portfolio-executive-reviewer'`, `originAnnotationId`, `originReviewRunId`, `pushTimestamp`.

**Status: RESOLVED.** Provenance-carrying work items are supported in `@hbc/my-work-feed` v0.0.37. Financial PER push workflow may proceed.

### B-FIN-03 — P3-F1 report candidate → `PublishedMonthly` version handoff

**Capability required:** When a report run is finalized (P3-F1 `ReportRunStatus: released`), the Financial module must receive an event or callback to transition the `isReportCandidate = true` confirmed version to `PublishedMonthly` and set `publishedAt` + `publishedByRunId`.

**Status: OPEN.** Integration contract not yet defined in P3-F1. This requires a cross-file follow-up in P3-F1 to specify the module snapshot publication handoff event (see §18.1). Implementation of the `PublishedMonthly` promotion path in the Financial module should be structured to accept an event-driven callback; the specific event schema and P3-F1 delivery mechanism are pending P3-F1 resolution.

### B-FIN-04 — Procore API direct integration for `externalSourceLineId`

**Capability required:** For stable external line identity without CSV, the preferred identity path uses the Procore budget line item native `id` field. This requires a direct Procore API integration.

**Status: FUTURE — NOT A CURRENT BLOCKER.** Current CSV import path uses `fallbackCompositeMatchKey` for cross-import identity. The identity model (T02 §2.2) is forward-compatible: when Procore API integration becomes available, `externalSourceLineId` is populated and takes precedence over composite fallback matching. No blocker to Phase 3 Financial module delivery.

---

## 17. Implementation Guide

### 17.0 Stage 7.FIN.0 — Blocker resolution assessment

**Before starting Financial module implementation, confirm:**

1. B-FIN-01 resolved — verify `@hbc/field-annotations` v0.2.0 is available in the workspace; confirm `AnchorType` discriminator is exported correctly.
2. B-FIN-02 resolved — verify `@hbc/my-work-feed` v0.0.37 is available; confirm provenance fields are accepted on work item creation.
3. B-FIN-03 open — design the `PublishedMonthly` promotion handler as an event listener stub; do not block on P3-F1 resolution, but implement the handler so it can be wired when B-FIN-03 is resolved.
4. B-FIN-04 not blocking — implement identity model with `fallbackCompositeMatchKey` as primary path; ensure `externalSourceLineId` field exists in schema and matching logic checks it first when non-null.

**Output:** Blocker assessment written up with statuses confirmed; stub event listener for B-FIN-03 scaffolded.

---

### 17.1 Stage 7.FIN.1 — Data model foundation and cost-code dictionary

**Scope:**
- Define all TypeScript interfaces and types for the Financial module: `IForecastVersion`, `IBudgetLineItem`, `IBudgetLineReconciliationCondition`, `IFinancialForecastSummary`, `IGCGRLine`, `ICashFlowRecord`, `IBuyoutLineItem`, `IBuyoutSavingsDisposition`, `IBuyoutSavingsDispositionItem`, and all supporting enums and union types.
- Implement the cost-code dictionary reference table loader: parse `cost-code-dictionary.csv` at system startup; expose a validation function `isValidCostCode(tier1: string): boolean`.
- Implement `ForecastVersionType`, `ForecastDerivationReason`, `CostType`, `GCGRCategory`, `BuyoutLineStatus`, `BuyoutSavingsDispositionStatus`, `BuyoutSavingsDestination` enumerations.
- Set up database schema for all Financial module tables; ensure `canonicalBudgetLineId` is the primary stable identity field with a project-scoped uniqueness constraint.

**Key decisions to honor:**
- `canonicalBudgetLineId` is stable across imports; `budgetImportRowId` is not.
- `fallbackCompositeMatchKey` must be computed as `lowercase(trim(costCodeTier1) + '|' + trim(costType) + '|' + trim(budgetCode))` — normalize consistently.
- All version-scoped tables include `forecastVersionId` as FK.

**Verification:** TypeScript compilation passes with no type errors on all interface definitions; cost-code dictionary loads without error and validates a sample code correctly.

---

### 17.2 Stage 7.FIN.2 — Budget line identity and import pipeline

**Scope:**
- Implement CSV import parser for Procore_Budget.csv (21-column format): row validation, required field checks, atomic failure-on-any-error behavior.
- Implement identity resolution algorithm per T02 §2.3:
  - Check `externalSourceLineId` first (future-safe path)
  - Fall back to `fallbackCompositeMatchKey` matching
  - Handle ambiguous matches by creating `IBudgetLineReconciliationCondition` records
- Implement new working version derivation on successful import (T03 §3.4, reason: `BudgetImport`)
- Implement `forecastToComplete` default calculation: `max(0, revisedBudget - costExposureToDate)` per line
- Implement `staleBudgetLineCount` tracking on `IForecastVersion`; block confirmation when > 0
- Build PM reconciliation UI: list of pending conditions with merge/create-new resolution actions
- Publish `BudgetImported` and `ReconciliationConditionResolved` spine events

**Key correctness requirements:**
- Identity resolution must be deterministic — same composite key must always produce the same `canonicalBudgetLineId` for the same project line.
- Ambiguous match → reconciliation condition: do NOT silently absorb history. PM must resolve.
- Import is atomic: if any row fails validation, no lines are written and no new version is created.

**Verification:** Import a 200-line CSV; confirm all identity resolution paths (new, match, ambiguous); confirm atomic rollback on validation failure; confirm `staleBudgetLineCount` blocks confirmation.

---

### 17.3 Stage 7.FIN.3 — Forecast ledger versioning and checklist

**Scope:**
- Implement `IForecastVersion` CRUD with lifecycle transitions (Working → ConfirmedInternal → PublishedMonthly / Superseded)
- Implement "Derive New Working Version" action: copy budget lines, GC/GR lines, cash flow records, forecast summary fields; do NOT copy checklist; set `derivedFromVersionId` and `derivationReason`
- Implement confirmation gate: validate all required checklist items complete, summary fields populated, `staleBudgetLineCount = 0`, no undispositioned savings with checklist item unconfirmed
- Implement checklist per version: starts empty; per-item completion with `completedBy` and `completedAt`
- Implement report-candidate designation: set `isReportCandidate = true`; clear on prior holder
- Implement B-FIN-03 stub: `PublishedMonthly` promotion event handler (wires when P3-F1 integration is ready)
- Publish `ForecastVersionConfirmed`, `ForecastVersionDerived`, `ReportCandidateDesignated`, `ForecastVersionPublished` spine events

**Key correctness requirements:**
- Only one `Working` version may exist per project at any time.
- Confirmed versions are fully immutable — no field edits, no status mutations except by the P3-F1 publication callback.
- Checklist is version-scoped: a new working version starts with an empty checklist even if derived from a fully-complete confirmed version.

**Verification:** Full lifecycle test — Working → ConfirmedInternal → report-candidate → (stub) PublishedMonthly; confirm immutability of ConfirmedInternal; confirm checklist starts empty on derivation.

---

### 17.4 Stage 7.FIN.4 — Forecast summary and GC/GR working model

**Scope:**
- Implement `IFinancialForecastSummary` as a version-scoped record (one per version)
- Implement PM-editable fields on working version: `damageClauseLDs`, `approvedDaysExtensions`, `currentContractValue`, `currentContingency`, `expectedContingencyAtCompletion`, `contractType`, `projectType`
- Implement calculated fields: `revisedContractCompletion`, `estimatedCostAtCompletion`, `currentProfit`, `profitMargin`, `expectedContingencyUse` — all recomputed on edit
- Implement `IGCGRLine` CRUD: version-scoped; editable on working version only
- Implement GC/GR aggregation: sum of `gcEstimateAtCompletion` feeds into `gcEstimateAtCompletion` on Forecast Summary
- Implement profit alerts: warn at < 5% margin; critical alert at < 0% margin requiring PE visibility
- Publish `GCGRUpdated` spine event on each GC/GR edit

**Key correctness requirements:**
- Forecast Summary must recompute instantly on any upstream change (budget line edit, GC/GR edit, manual summary field edit).
- Sign conventions per T07 §9 must be correct: `estimatedCostAtCompletion = costExposureToDate + forecastToComplete`; `projectedOverUnder = revisedBudget - EAC` (positive = favorable).

**Verification:** Enter values for all PM-editable fields; verify all derived fields recompute correctly; confirm 10% over-budget warning fires; confirm profit alert fires.

---

### 17.5 Stage 7.FIN.5 — Cash flow working model

**Scope:**
- Implement `ICashFlowRecord` for both actual and forecast record types; version-scoped
- Implement actual records: sourced from accounting system (read-only after recorded); `recordedAt` immutable
- Implement forecast records: PM-editable on working version only (`projectedInflows`, `projectedOutflows`, `confidenceScore`, `notes`)
- Implement cash flow summary aggregate: `peakCashRequirement`, `cashFlowAtRisk`, cumulative series
- Implement A/R aging display model: read-only; daily sync job; display last-sync timestamp and warning on failure
- Implement cumulative cash flow chart with red shading for deficit months
- Implement retention calculation model per T05 §7.4 (configurable rate stored in project settings)
- Publish `CashFlowProjectionUpdated` spine event on each forecast month edit
- Publish health spine metrics: `peakCashRequirement`, `cashFlowAtRisk`

**Verification:** 13 actuals + 18 forecast; confirm actuals are read-only; confirm cumulative calculation is correct; confirm `peakCashRequirement` returns minimum cumulative value.

---

### 17.6 Stage 7.FIN.6 — Buyout sub-domain

**Scope:**
- Implement `IBuyoutLineItem` CRUD: add, edit, status advance
- Implement `ContractExecuted` gate: enforce P3-E12 checklist gate rule (T06 §8.3); API must reject with specific error if gate not satisfied; UI must show error with link to compliance record
- Implement dollar-weighted completion metric: `IBuyoutSummaryMetrics` computed from all non-Void lines
- Implement buyout savings recognition: on `ContractExecuted` transition when `contractAmount < originalBudget`, create `IBuyoutSavingsDisposition` record with `undispositionedAmount = totalSavingsAmount`
- Implement savings disposition workflow: three destinations (`AppliedToForecast`, `HeldInContingency`, `ReleasedToGoverned`); handle each path:
  - `AppliedToForecast`: PM-directed update to `forecastToComplete` on working version (system does not auto-apply)
  - `HeldInContingency`: system increases `currentContingency` on confirmation of disposition
  - `ReleasedToGoverned`: publish `BuyoutSavingsReleased` event; notify PE
- Implement `savingsDispositionStatus` computed from `IBuyoutSavingsDisposition` state
- Implement buyout reconciliation check: compare `totalContractAmount` vs `committedCosts` total; flag if variance > 5%
- Publish `BuyoutLineExecuted` and `BuyoutSavingsDispositioned` spine events
- Publish Work Queue items: `BuyoutOverbudget`, `UndispositionedBuyoutSavings`, `BuyoutComplianceGateBlocked`

**Key correctness requirements:**
- Savings disposition affects forecast state only when PM explicitly applies — the system never silently moves savings into the forecast.
- Dollar-weighted metric uses executed contract value, not budget: `totalContractAmount / totalBudget × 100`.

**Verification:** Full lifecycle: create buyout line → advance to ContractExecuted (with gate check) → confirm savings recognized → disposition each destination → confirm Work Queue items fire and clear appropriately.

---

### 17.7 Stage 7.FIN.7 — `forecastToComplete` editing and budget line UX

**Scope:**
- Implement inline `forecastToComplete` editing on budget line grid (working version only)
- Implement immediate recalculation of `estimatedCostAtCompletion` and `projectedOverUnder` on edit
- Implement edit provenance: `lastEditedBy`, `lastEditedAt`, `priorForecastToComplete` per edit
- Implement 10% over-budget warning: warn when `estimatedCostAtCompletion > revisedBudget × 1.10`; do not block
- Implement `forecastToComplete` >= 0 validation: enforce; display clear error
- Implement budget line grid export (CSV): canonical id, code, description, actuals, committed, exposure, FTC, EAC, over/under, notes
- Publish `BudgetLineOverbudget` Work Queue item when any line `projectedOverUnder < -(10% × revisedBudget)`

**Key correctness requirements:**
- FTC has no lower bound tied to past spend — the PM can enter any value >= 0.
- Prior value must be captured before the new value is written, not after.

**Verification:** Edit FTC below actual spend → confirm system accepts with no lower-bound error; verify `priorForecastToComplete` captures the pre-edit value; verify over-budget warning fires at 10% threshold.

---

### 17.8 Stage 7.FIN.8 — Executive review annotation integration

**Scope:**
- Wire `@hbc/field-annotations` with Financial version-aware anchor model per T08 §15.4
- Implement field-level anchors: `forecastToComplete`, `estimatedCostAtCompletion`, `projectedOverUnder`, `notes` on budget lines; uses `canonicalBudgetLineId` in anchor (not `budgetImportRowId`)
- Implement section-level anchors: cost summary, contingency summary, profit summary, GC/GR totals
- Implement block-level anchors: cash flow month ranges and aggregate blocks; buyout sections
- Implement annotation carry-forward on version derivation per T08 §15.5: resolve or flag unresolvable; create `ICarriedForwardAnnotation` records; surface PM disposition UI before confirmation
- Implement PER access controls: PER may access ConfirmedInternal and PublishedMonthly only; Working version hidden
- Implement annotation push-to-project-team: Work Queue item with provenance fields per B-FIN-02

**Key correctness requirements:**
- Annotation anchors must use `canonicalBudgetLineId` to survive re-imports.
- Carry-forward is a copy — the original annotation on the source version is preserved.
- PM disposition is required for all `Inherited` annotations before version confirmation.

**Verification:** Create annotation on confirmed version; derive new working version; confirm annotation carries forward; confirm `valueChangedFlag` is set when FTC changed; confirm PM can disposition; confirm original annotation preserved on source version.

---

### 17.9 Stage 7.FIN.9 — P3-F1 integration, export, and acceptance validation

**Scope:**
- Wire B-FIN-03 handler once P3-F1 defines the `ReportPublishedEvent`: on event receipt, transition `isReportCandidate = true` version to `PublishedMonthly`, set `publishedAt` and `publishedByRunId`
- Implement Forecast Summary export for P3-F1 module snapshot pull
- Verify all export formats from T08 §13.8 are functional (CSV for each sub-model, snapshot for P3-F1)
- Verify all health spine metrics (T08 §14.2) publish correctly on confirmation events
- Run performance checks: budget CSV import < 10 seconds for 500 lines; UI response < 500ms for forecast edits
- Conduct UAT with 2+ sample projects covering full lifecycle
- Execute integration tests for all key workflows

**Verification:** Full integration test pass; UAT sign-off; performance benchmarks met; all acceptance gate items checked.

---

## 18. Cross-File Follow-Up Notes

The following gaps in sibling documents were identified during the Financial module specification. They are recorded here for the responsible parties to address.

### 18.1 P3-F1 — Module snapshot publication handoff event

P3-F1 defines report generation and publication but does not specify how report publication notifies source modules to finalize their report-candidate version as `PublishedMonthly`. Financial requires this handoff to close the version lifecycle (T03 §3.5). **P3-F1 should define a `ReportPublishedEvent` or equivalent callback with `{ runId, reportingMonth, confirmedSnapshotId }` that modules consuming it can use to promote the relevant confirmed version to `PublishedMonthly`.**

### 18.2 P3-F1 — PER review of confirmed internal versions vs. published-only

P3-F1 §8.5 defines PER report permissions primarily in terms of viewing runs in the run-ledger. It does not explicitly address whether PER may annotate a `ConfirmedInternal` version that is not yet the `PublishedMonthly` version. T08 §15.1 resolves this for the Financial module (PER may annotate any confirmed version). **P3-F1 should align its PER permissions language to match this broader definition.**

### 18.3 P3-D2 / P3-D3 — Separated cost model metrics and buyout savings

The Health spine (P3-D2) and Work Queue (P3-D3) contracts were authored before the separated cost model and buyout savings tracking were defined. **The new metrics in T08 §14.2 (`totalCostExposureToDate`, `totalRealizedBuyoutSavings`, `totalUndispositionedSavings`) and the new Work Queue items in T08 §14.3 (`BudgetReconciliationRequired`, `UndispositionedBuyoutSavings`) should be added to the relevant sections of P3-D2 and P3-D3 as Financial module contributions.**

### 18.4 P3-G1 — Buyout savings disposition lane capability

P3-G1 §4.1 lists the Financial module's SPFx and PWA capabilities. The buyout savings disposition workflow (T06 §8.6) involves modal approval steps that are PWA-native. **SPFx should escalate to PWA for savings disposition. This escalation path should be added to P3-G1 §4.1 as a "Launch-to-PWA" capability for buyout savings disposition.**

---

## 19. Data Import and Migration Strategy

For initial project setup and historical data backfill:

1. **Procore CSV bulk import** (T02 §3.5, T08 §13.1): One-time or recurring import; creates new derived working version each time.
2. **Forecast Summary manual entry**: PM enters forecast summary fields on the initial working version.
3. **GC/GR manual entry**: PM enters GC/GR lines via UI.
4. **Cash flow manual entry or import**: PM enters 18-month forecast manually or via spreadsheet upload.
5. **Buyout log manual entry**: PM populates buyout log incrementally as subcontracts are solicited.
6. **A/R aging sync**: Automated daily sync from accounting system; no manual entry.

No single bulk import of the entire Financial model; data is populated progressively as the project runs. The version ledger begins with the initial working version (`derivationReason: 'InitialSetup'`) and builds from there.

---

## 20. Acceptance Gate

All items must be verified before the Financial module is declared complete for Phase 3 delivery.

### 20.1 Budget line identity and import

- [ ] **AC-FIN-01** — `canonicalBudgetLineId` assigned on first import; survives subsequent re-imports via composite key matching
- [ ] **AC-FIN-02** — `fallbackCompositeMatchKey` computed as `lowercase(costCodeTier1 + '|' + costType + '|' + budgetCode)` consistently across all imports
- [ ] **AC-FIN-03** — Ambiguous composite match creates `BudgetLineReconciliationCondition` record; does NOT silently inherit history
- [ ] **AC-FIN-04** — PM reconciliation UI resolves ambiguous matches via `MergedInto` or `CreatedNew`
- [ ] **AC-FIN-05** — CSV import is atomic: validation failure on any row writes no lines and creates no new version
- [ ] **AC-FIN-06** — `externalSourceLineId` field exists in schema; matching checks it first when non-null (future-safe path)
- [ ] **AC-FIN-07** — Import creates new derived working version; prior working version transitions to Superseded; all prior confirmed versions intact

### 20.2 Budget line working model

- [ ] **AC-FIN-08** — `jobToDateActualCost`, `committedCosts`, and `costExposureToDate` are distinct fields; `costExposureToDate` = actuals + committed (never blended)
- [ ] **AC-FIN-09** — `forecastToComplete` is PM-editable on working version only; confirmed versions are immutable
- [ ] **AC-FIN-10** — `forecastToComplete` validated: must be >= 0; no lower bound tied to past spend
- [ ] **AC-FIN-11** — `estimatedCostAtCompletion` = `costExposureToDate + forecastToComplete`; recomputed immediately on FTC edit
- [ ] **AC-FIN-12** — `projectedOverUnder` = `revisedBudget - estimatedCostAtCompletion`; positive = favorable (under budget)
- [ ] **AC-FIN-13** — 10% over-budget warning fires when EAC > `revisedBudget × 1.10`; does not block the edit
- [ ] **AC-FIN-14** — Edit provenance captured: `lastEditedBy`, `lastEditedAt`, `priorForecastToComplete` on every FTC edit

### 20.3 Forecast ledger versioning

- [ ] **AC-FIN-15** — Only one Working version per project at any time
- [ ] **AC-FIN-16** — Confirmed versions are immutable; no field mutations after `versionType = ConfirmedInternal`
- [ ] **AC-FIN-17** — "Derive New Working Version" copies budget lines, GC/GR lines, cash flow, and summary; checklist is NOT copied; new version starts with empty checklist
- [ ] **AC-FIN-18** — Confirmation gate enforced: all required checklist items complete; `staleBudgetLineCount = 0`; summary fields valid
- [ ] **AC-FIN-19** — At most one `isReportCandidate = true` ConfirmedInternal version per project at any time
- [ ] **AC-FIN-20** — `PublishedMonthly` promotion handler implemented as event-driven callback (B-FIN-03 stub); wires to P3-F1 publication event when B-FIN-03 is resolved
- [ ] **AC-FIN-21** — No "unlock in place" action exists in UI or API

### 20.4 Forecast summary and GC/GR

- [ ] **AC-FIN-22** — Forecast Summary `estimatedCostAtCompletion` = sum of budget line EACs + `gcEstimateAtCompletion` total
- [ ] **AC-FIN-23** — `currentProfit` and `profitMargin` calculated correctly; profit margin < 0% triggers critical alert
- [ ] **AC-FIN-24** — `revisedContractCompletion` = `originalContractCompletion + approvedDaysExtensions` calendar days
- [ ] **AC-FIN-25** — GC/GR lines are version-scoped; editable on working version only; aggregate feeds Forecast Summary

### 20.5 Cash flow model

- [ ] **AC-FIN-26** — 13 actual months (read-only) + 18 forecast months (PM-editable on working version only)
- [ ] **AC-FIN-27** — `cumulativeCashFlow` is a correct running sum from project start
- [ ] **AC-FIN-28** — `peakCashRequirement` = minimum (most negative) value in cumulative series
- [ ] **AC-FIN-29** — A/R aging is read-only; daily sync job; last-sync timestamp displayed; failure warning shown
- [ ] **AC-FIN-30** — Cash flow cumulative chart displays with red shading for deficit months

### 20.6 Buyout sub-domain

- [ ] **AC-FIN-31** — Dollar-weighted completion metric = `sum(contractAmount for ContractExecuted + Complete) / totalBudget × 100`
- [ ] **AC-FIN-32** — `ContractExecuted` gate enforced via P3-E12 checklist; API rejects transition if gate not satisfied; UI shows error with link to compliance record
- [ ] **AC-FIN-33** — Buyout savings recognized immediately on `ContractExecuted` when `contractAmount < originalBudget`; `IBuyoutSavingsDisposition` record created
- [ ] **AC-FIN-34** — Savings disposition workflow: all three destinations implemented; `AppliedToForecast` requires PM action (not auto-applied); `HeldInContingency` updates `currentContingency` on disposition confirmation
- [ ] **AC-FIN-35** — Work Queue item `UndispositionedBuyoutSavings` fires when savings are unresolved
- [ ] **AC-FIN-36** — Buyout reconciliation check: flag when `totalContractAmount` vs `committedCosts` variance > 5%

### 20.7 Platform integration

- [ ] **AC-FIN-37** — All 10 activity spine events from T08 §14.1 publish correctly with correct payload shapes
- [ ] **AC-FIN-38** — All 10 health spine metrics from T08 §14.2 publish on confirmation events
- [ ] **AC-FIN-39** — All 8 work queue item types from T08 §14.3 implemented; each fires under its documented condition

### 20.8 Executive review annotation

- [ ] **AC-FIN-40** — PER may annotate any ConfirmedInternal or PublishedMonthly version; Working version not accessible to PER
- [ ] **AC-FIN-41** — Annotation anchors use `canonicalBudgetLineId` (not `budgetImportRowId`); anchors survive re-imports
- [ ] **AC-FIN-42** — Annotation carry-forward: on derivation, `Inherited` annotations created on new version; `valueChangedFlag` set correctly; PM disposition required before confirmation; original annotation preserved on source version

### 20.9 Quality and integration

- [ ] **AC-FIN-43** — Budget CSV import: < 10 seconds for 500 lines
- [ ] **AC-FIN-44** — Forecast edit UI response: < 500ms per edit
- [ ] **AC-FIN-45** — Unit tests: > 85% code coverage on calculation logic, identity resolution, and lifecycle transitions
- [ ] **AC-FIN-46** — Integration tests: import, identity resolution, versioning, savings disposition workflows all passing
- [ ] **AC-FIN-47** — Integration with Schedule module (milestones, `percentComplete` for A/R aging) verified
- [ ] **AC-FIN-48** — User acceptance testing passed with 2+ sample projects covering full monthly forecast lifecycle

---

*Navigation: [← T08 Platform Integration and Annotation Scope](P3-E4-T08-Platform-Integration-and-Annotation-Scope.md) | [Master Index](P3-E4-Financial-Module-Field-Specification.md)*
