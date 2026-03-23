# P3-E4 — Financial Module: Platform Integration and Annotation Scope

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4-T08 |
| **Parent** | [P3-E4 Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T08: Platform Integration and Annotation Scope |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: required module capabilities, activity spine events, health spine metrics, work queue items, executive review annotation scope, annotation anchor model, and annotation carry-forward on version derivation. See [T09](P3-E4-T09-Implementation-and-Acceptance.md) for the implementation guide and full acceptance gate.*

---

## 13. Required Capabilities

### 13.1 CSV budget import

- File upload via UI: "Upload Budget CSV"
- Parser reads Procore_Budget.csv format (21 columns)
- Validates each row; rejects import atomically on any validation failure
- Identity resolution per T02 §2.3 with reconciliation conditions for ambiguous matches
- Creates new derived working version per T03 §3.4; does not modify any existing version
- Feedback: version created, lines matched/new/reconciliation-pending counts

### 13.2 Financial forecast summary editing

- PM-editable fields (working version only): `contractType`, `projectType`, `damageClauseLDs`, `approvedDaysExtensions`, `currentContractValue`, `currentContingency`, `expectedContingencyAtCompletion`
- All other fields are read-only
- Edits trigger recalculation of dependent fields
- Editing blocked on confirmed versions; PM must derive a new working version

### 13.3 Forecast version management

- Version list view: shows all versions (Working, ConfirmedInternal, PublishedMonthly, Superseded) with version number, type, confirmed/published date, report-candidate flag
- "Confirm Version" action: validates all confirmation requirements (T03 §3.5), confirms working version to ConfirmedInternal
- "Designate Report Candidate" action: sets `isReportCandidate = true` on a ConfirmedInternal version
- "Derive New Working Version" action: PM can derive a new working version from any ConfirmedInternal version; prior working version (if any) transitions to Superseded
- No "unlock in place" action exists

### 13.4 GC/GR working model editing

- Grid view: rows = divisions; columns = GC/GR categories
- Editable fields (working version only): `gcEstimateAtCompletion`, `grEstimateAtCompletion`, `notes`
- System calculates variances; changes propagate immediately to Forecast Summary

### 13.5 Cash flow model editing

- Table view: 13 actuals (read-only) + 18 forecast (editable in working version only)
- Editable fields: `projectedInflows`, `projectedOutflows`, `confidenceScore`, `notes`
- Graph view: cumulative cash flow line chart with red shading for deficit months

### 13.6 Buyout log management

- Table view: all buyout lines with Division, Description, Vendor, Contract Amount, Original Budget, Over/Under, Savings, Disposition Status, Procurement Status
- PM actions: add, edit, advance status (subject to gate rules in T06 §8.3)
- Savings disposition workflow per T06 §8.6
- Dollar-weighted completion metric prominent in summary bar
- Bulk status update for multiple lines

### 13.7 Forecast checklist completion

- Per-version checklist; starts empty on each new working version
- PM checks items; group completion summaries displayed
- "Confirm Version" button enabled only when all required items complete

### 13.8 Export capabilities

- Budget Line Items: CSV export (canonical id, code, description, actuals, committed, exposure, FTC, EAC, over/under, notes)
- Forecast Summary: single-page summary for inclusion in report snapshot
- GC/GR: CSV by division/category
- Cash Flow: CSV (13 actuals + 18 forecast)
- Buyout Log: CSV with all columns, savings, and disposition status
- PDF export: routed through P3-F1 generation pipeline as report snapshot; Financial does not generate standalone PDFs

---

## 14. Spine Publication Events

### 14.1 Activity spine events

| Event | Trigger | Payload | Purpose |
|-------|---------|---------|---------|
| `BudgetImported` | CSV import succeeds | `{ importBatchId, lineCount, newVersionId, derivedFromVersionId, reconciliationConditionCount, projectId, importedAt }` | Log and audit all budget changes |
| `ForecastVersionConfirmed` | PM confirms working version | `{ forecastVersionId, versionNumber, projectId, confirmedAt, confirmedBy }` | Mark new confirmed snapshot |
| `ForecastVersionDerived` | New working version derived | `{ newVersionId, sourceVersionId, derivationReason, projectId, derivedAt }` | Track derivation lineage |
| `ReportCandidateDesignated` | PM sets report-candidate | `{ forecastVersionId, projectId, designatedAt, designatedBy }` | Identify version selected for reporting |
| `ForecastVersionPublished` | Report publication finalizes version | `{ forecastVersionId, reportingMonth, runId, projectId, publishedAt }` | Record official published version |
| `GCGRUpdated` | PM edits GC/GR estimate | `{ forecastVersionId, divisionCode, categoryCode, priorValue, newValue, editedBy, editedAt, projectId }` | Audit GC/GR changes |
| `BuyoutLineExecuted` | Buyout line status → ContractExecuted | `{ buyoutLineId, projectId, vendorName, contractAmount, savingsAmount, executedAt }` | Alert team subcontract finalized; flag savings if present |
| `BuyoutSavingsDispositioned` | PM completes savings disposition | `{ buyoutLineId, projectId, destination, amount, dispositionedBy, dispositionedAt }` | Track savings treatment |
| `CashFlowProjectionUpdated` | PM edits cash flow month | `{ forecastVersionId, projectId, month, inflows, outflows, netFlow, updatedAt }` | Track projection updates |
| `ReconciliationConditionResolved` | PM resolves ambiguous line match | `{ conditionId, projectId, resolution, resolvedCanonicalLineId, resolvedBy, resolvedAt }` | Audit identity resolution |

### 14.2 Health spine metrics

| Metric | Type | Updated | Purpose |
|--------|------|---------|---------|
| `projectedOverUnder` | number (USD) | On forecast confirmation | Primary cost health indicator; sign: positive = favorable |
| `profitMargin` | percentage | On forecast confirmation | Trend indicator; alert if < 5% |
| `estimatedCostAtCompletion` | number (USD) | On forecast confirmation | Total project cost forecast |
| `totalCostExposureToDate` | number (USD) | On import/confirmation | Combined actuals + commitments |
| `percentBuyoutCompleteDollarWeighted` | percentage | On buyout line execution | Dollar-weighted procurement progress |
| `totalRealizedBuyoutSavings` | number (USD) | On buyout execution | Savings recognized to date |
| `totalUndispositionedSavings` | number (USD) | On savings event | Savings awaiting PM action |
| `peakCashRequirement` | number (USD) | On cash flow confirmation | Working capital need |
| `cashFlowAtRisk` | number (USD) | On cash flow confirmation | Cumulative deficit risk |
| `buyoutToCommittedCostsReconciliation` | variance % | On buyout execution or import | Acceptable if < 5% variance |

### 14.3 Work queue items

| Item Type | Condition | Assigned To | Actionable |
|-----------|-----------|-------------|------------|
| `BudgetReconciliationRequired` | Any `BudgetLineReconciliationCondition` is `Pending` | PM | Resolve ambiguous line matches |
| `ForecastChecklistIncomplete` | Working version checklist < 100% required items | PM | Complete checklist and confirm |
| `BudgetLineOverbudget` | `projectedOverUnder < -(10% × revisedBudget)` | PM | Raise forecast or change order |
| `NegativeProfitForecast` | `currentProfit < 0` on confirmed version | PM + PE | Review and mitigation plan |
| `CashFlowDeficit` | Any month with `projectedNetCashFlow < 0` | PM | Secure working capital |
| `BuyoutOverbudget` | Buyout line `overUnder > 0` | PM | Negotiate or raise change order |
| `UndispositionedBuyoutSavings` | `IBuyoutSavingsDisposition.undispositionedAmount > 0` | PM | Disposition savings |
| `BuyoutComplianceGateBlocked` | Status transition to `ContractExecuted` blocked by Subcontract Compliance gate | PM | Complete subcontract compliance checklist |

---

## 15. Executive Review Annotation Scope

Per P3-E1 §9.1 and P3-E2 §3.4, the Financial module is a review-capable surface. Portfolio Executive Reviewers may place annotations on **any confirmed Financial version** within their governed scope. Annotations are review-layer only and never become a mutation path for Financial source-of-truth records.

### 15.1 Reviewable versions

PER may annotate any `ConfirmedInternal` or `PublishedMonthly` version. PER does **not** have access to `Working` versions — the PM's working draft state is never visible to PER.

### 15.2 Annotation targets

PER annotations may be placed on the following anchor types (requires `@hbc/field-annotations` section/block anchor support):

- Budget line item field-level anchors: `forecastToComplete`, `estimatedCostAtCompletion`, `projectedOverUnder`, `notes`
- Forecast Summary section-level anchors: cost summary, contingency summary, profit summary
- GC/GR section-level and line-level anchors
- Cash flow block-level anchors (by month range or aggregate)
- Buyout section-level and line-level anchors

### 15.3 Annotation isolation

| Rule | Description |
|------|-------------|
| **Isolation** | Annotations are stored exclusively in `@hbc/field-annotations`; no annotation data is written to any Financial source-of-truth record |
| **No mutation** | No annotation may trigger a write, edit, or validation override of any Financial record |
| **Visibility** | Restricted to the review circle before PER explicitly pushes to the project team per P3-D3 |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13 |

### 15.4 Version-aware annotation anchors

Annotation anchors must include the forecast version to ensure stability across the version ledger:

```typescript
interface IFinancialAnnotationAnchor {
  forecastVersionId: string;       // Which confirmed version this annotation targets
  anchorType: 'field' | 'section' | 'block';
  canonicalBudgetLineId?: string;  // For line-level anchors; uses canonical (stable) ID
  fieldKey?: string;               // For field-level anchors (e.g., 'forecastToComplete')
  sectionKey?: string;             // For section-level anchors (e.g., 'contingency-summary')
  blockKey?: string;               // For block-level anchors (e.g., 'cash-flow-q2-2026')
}
```

Using `canonicalBudgetLineId` (not `budgetImportRowId`) ensures annotations survive re-imports and remain valid across version derivations.

### 15.5 Annotation carry-forward on version derivation

When a new working version is derived from a confirmed version that has open PER annotations:

1. For each open annotation on the source confirmed version, the system checks whether the anchor resolves on the new version:
   - `(forecastVersionId=new, canonicalBudgetLineId=same, fieldKey=same)` — if the canonical line and field still exist in the new version, the anchor resolves.
   - If the anchor does not resolve (line removed, key no longer exists), an `AnchorUnresolvable` carry-forward record is created.

2. For resolved anchors, a **carried-forward annotation** is created on the new version:
   ```typescript
   interface ICarriedForwardAnnotation {
     newAnnotationId: string;         // New UUID on the derived version
     sourceAnnotationId: string;      // Original annotation ID on source version
     sourceForecastVersionId: string;
     targetForecastVersionId: string;
     inheritanceStatus: 'Inherited';  // Starting state
     pmDispositionStatus: 'Pending';  // PM must disposition
     valueChangedFlag: boolean;       // True if the annotated value changed materially between versions
   }
   ```

3. **The original annotation remains on the original confirmed version.** It is not moved. The original version's annotation record is preserved for audit.

4. **PM disposition requirement:** For each `Inherited` carried-forward annotation, PM must disposition it before or at version confirmation:

   | PM Disposition | Meaning |
   |----------------|---------|
   | `Addressed` | PM has acted on the annotation concern in this new version |
   | `StillApplicable` | The concern still applies; PM has not yet addressed it |
   | `NeedsReviewerAttention` | PM wants to escalate back to PER for review |

5. **Value-change flag:** If the annotated field value changed materially between the source version and the new version, the system sets `valueChangedFlag = true` on the carry-forward record and suggests `Addressed` as the disposition — but does not auto-resolve. PM confirms the disposition explicitly.

6. **Unresolvable anchors:** For `AnchorUnresolvable` carry-forwards (line was removed), PM is notified but no disposition is required — the annotation is archived as unresolvable against the new version.

### 15.6 PER permissions on Financial

| Action | Permitted | Rules |
|--------|-----------|-------|
| View any confirmed Financial version | **Yes** | Within department scope; working version not visible |
| Annotate confirmed Financial versions | **Yes** | Via `@hbc/field-annotations` review layer; no mutation of Financial records |
| Push annotation to project team | **Yes** | Via P3-D3 §13 Push-to-Project-Team; creates work queue item |
| Generate reviewer-generated report run | **Yes** | Against the latest confirmed PM-owned snapshot per P3-F1 §8.6 |
| View report-candidate designation | **Yes** | Read-only |
| Edit Financial working state | **No** | PER has no access to working versions |
| Confirm a Financial version | **No** | Confirmation is PM/PE-owned exclusively |
| Approve or release a report | **Project-policy governed** | Per-family authority governed by central project-governance policy record per P3-F1 §14 |

### 15.7 Annotation workflow

1. PER views a `ConfirmedInternal` or `PublishedMonthly` version.
2. PER opens annotation panel; selects field, section, or block anchor.
3. PER types annotation; saved to `@hbc/field-annotations` with anchor metadata per §15.4.
4. PM receives Work Queue item: "New annotation on Financial version [N] by [PER name]."
5. PM views annotation in context; responds via annotation reply interface.
6. If PM derives a new working version, open annotations carry forward per §15.5.
7. PM dispositions carried-forward annotations before confirming the new version.

---

*Navigation: [← T07 Business Rules and Calculations](P3-E4-T07-Business-Rules-and-Calculations.md) | [Master Index](P3-E4-Financial-Module-Field-Specification.md) | [T09 Implementation and Acceptance →](P3-E4-T09-Implementation-and-Acceptance.md)*
