# PH7.9 — Project Hub: Financial Forecasting

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build the Financial Forecasting module: Procore budget CSV/Excel upload that seeds the baseline, a native Financial Summary Sheet, GC/GR Forecast (per cost code, monthly), and Cash Flow Schedule. Modernizes the current 4-file manual process without changing how information is presented.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A digital replacement for the 4 manually maintained financial files (Procore budget PDF, Financial Forecast Summary & Checklist.xlsx, GC-GR Forecast.xlsm, HB Draw Schedule - Cash Flow.xlsx) that is more accurate, easier to maintain, and presents data in the same format the team is familiar with.

---

## Prerequisites

- PH7.1, PH7.2 complete.
- Uploaded reference files analyzed: `Financial Forecast Summary & Checklist.xlsx`, `GC-GR Forecast.xlsm`, `HB Draw Schedule -Cash Flow.xlsx`, `Procore budget report.pdf`.
- SharePoint lists: `FinancialForecastSummaries`, `GcGrForecastLineItems`, `CashFlowRows`, `ForecastChecklistItems` (schemas in PH7.15).
- Azure Blob Storage available for file upload (or SharePoint document library as fallback).

---

## 7.9.1 — Procore Budget Upload

Route: `/project-hub/:projectId/financial` (landing page)

The first action a PM must take is uploading the Procore budget to seed the baseline. This upload is shared between Financial Forecasting (baseline budget) and Buyout Log (original budget per CSI division).

**API:**
- `POST /api/project-hub/projects/:projectId/procore-budget-upload` → multipart/form-data (CSV or Excel file)
- `GET /api/project-hub/projects/:projectId/procore-budget` → `IProcoreBudgetLineItem[]`

**Upload Component:**

```typescript
// apps/project-hub/src/pages/financial/ProcoreBudgetUpload.tsx

/**
 * Displayed on the Financial landing page when no baseline budget exists.
 * Also accessible from the Buyout Log page header.
 *
 * Accepts: .csv or .xlsx files exported from Procore Budget Summary.
 * Expected columns (from analyzed Procore budget report.pdf):
 *   Cost Code | Description | Division | Original Budget Amount |
 *   Approved Budget Changes | Revised Budget
 *
 * Parsing steps:
 * 1. Detect file type (CSV vs XLSX by extension).
 * 2. Parse header row to map column positions (flexible — Procore export headers may vary).
 * 3. Map to IProcoreBudgetLineItem[].
 * 4. Display parsed rows in a preview table before confirming import.
 * 5. On confirm: POST to API → saves to SharePoint + seeds:
 *    - FinancialForecastSummary.originalBudget (sum of all original budget amounts)
 *    - GcGrForecastLineItems (one row per cost code)
 *    - BuyoutLogEntries.originalBudget (per CSI division, summed from cost codes)
 */
```

**Upload validation:**
- File must have at least one cost code row.
- Cost code column must be present.
- Original Budget Amount must be numeric.
- Show row-level validation errors in the preview table (red row highlight + error message).
- "Re-upload" button available at any time to replace the baseline (requires confirmation: "This will update the baseline budget for Financial Forecasting and Buyout Log. Actual/projected figures entered since the last import will not be affected.").

---

## 7.9.2 — Financial Summary Page

Route: `/project-hub/:projectId/financial/summary`

**API:**
- `GET /api/project-hub/projects/:projectId/financial-summary` → `IFinancialForecastSummary`
- `PUT /api/project-hub/projects/:projectId/financial-summary` → update (all editable fields)

Matches the uploaded `Financial Forecast Summary & Checklist.xlsx` — Summary Sheet tab exactly.

**Page layout:**

*Header Section:*
- Period Ending (month selector — sets `forecastPeriodEnding`)
- Prepared By (auto-filled from current user)
- "Save" button

*Schedule Status card:*
- Scheduled Completion (date — from project setup, editable here if needed)
- Projected Completion (date — PM enters best estimate)
- Schedule Variance (days) — calculated: `projectedCompletion - scheduledCompletion`
- Color coded: green (on time or early), red (delayed)

*Financial Status card (matching Summary Sheet layout):*
| Row | Field | Amount |
|---|---|---|
| Original Contract | originalContractAmount | currency |
| Approved Change Orders | approvedChangeOrders | currency |
| Current Contract | currentContractAmount | calculated |
| | | |
| Original Budget | originalBudget | from Procore upload (read-only) |
| Current Budget | currentBudget | editable |
| Projected Cost at Completion | projectedCostAtCompletion | editable |
| Projected Profit | projectedProfit | calculated |
| Projected Profit % | projectedProfitPercent | calculated |

Calculated fields use client-side formulas — not stored, computed on render.

*Contingency card:*
- Owner Contingency (original + remaining)
- Contractor Contingency (original + remaining)

*GC Period Ending card:*
- GC Period Ending Date (date)
- GC Period Ending Amount (currency)

*Problems / Exposures section:*
One row per `IForecastExposure` category (10 categories matching Summary Sheet):
Schedule | Budget | Payment | Safety | RFI | Submittals | Buyout | Risk | COs | Permits | Critical Issues

Each category row: Category label | Description (text input) | Amount (currency) | Status (select: Open / Resolved / Monitoring)

*Forecast Checklist tab (13 categories):*
- Tabbed section alongside the Summary form.
- 13 checklist categories (from uploaded Forecast Checklist v1.2): Budget Review, Schedule Status, Subcontractor Buyout, Change Orders, Submittals, RFIs, Pay Applications, Cash Flow, Safety, QC, Permits, Owner Communication, Financial Projections.
- Each category contains checklist items. Per-item completion toggle (checkbox) with auto-fill of completer UPN + timestamp.
- Summary: "X / Y items complete for period {forecastPeriodEnding}."

---

## 7.9.3 — GC/GR Forecast Page

Route: `/project-hub/:projectId/financial/gc-gr-forecast`

Matches the uploaded `GC-GR Forecast.xlsm` — per cost code, monthly budget vs. actual.

**API:**
- `GET /api/project-hub/projects/:projectId/gc-gr-forecast` → `IGcGrForecastLineItem[]`
- `PATCH /api/project-hub/projects/:projectId/gc-gr-forecast/:costCode` → update monthly actuals/projections

**Component — Spreadsheet-Style Table:**

Columns: Cost Code | Description | Original Budget | [Month columns — dynamic, current forecast period] | Proj. Cost at Completion | Variance

Row structure per cost code (matches uploaded GC-GR Forecast):
- Row 1 (Budget): Original budget amount in each month column (represents when budget was expected to be spent)
- Row 2 (Actual/Projected): Actual spend for past months; projected spend for future months
- Diff row (auto-calculated): Budget - Actual/Projected per month

Month columns are generated dynamically based on the project start date and projected completion date.

**Inline editing:**
- Click a cell in the Actual/Projected row to edit the value.
- Past months (before current period ending date): cells labeled "Actual" (blue header)
- Future months: cells labeled "Projected" (gray header)
- Changes auto-save with debounce.

**Column totals row** at bottom: Sum of each column across all cost codes.

**Export:** "Export to Excel" button generates an `.xlsx` file matching the GC-GR Forecast format.

---

## 7.9.4 — Cash Flow Schedule Page

Route: `/project-hub/:projectId/financial/cash-flow`

Matches the uploaded `HB Draw Schedule -Cash Flow.xlsx`.

**API:**
- `GET /api/project-hub/projects/:projectId/cash-flow` → `ICashFlowRow[]`
- `PATCH /api/project-hub/projects/:projectId/cash-flow/:rowId` → update pay app amounts

**Component — Spreadsheet-Style Table:**

Columns: CSI Division | Trade | Subcontractor | Contract Total | Retainage % | [Pay App columns — PA-01, PA-02…] | Total Completed | Balance to Complete

- Rows are seeded from the Buyout Log (one row per CSI division/trade with a subcontractor).
- Pay App columns are added dynamically ("Add Pay App" button appends PA-N column).
- Retainage % is editable per row (typically 10%).
- Pay App amount cells are directly editable.
- "Total Completed" = sum of all pay app amounts for the row.
- "Balance to Complete" = Contract Total - Total Completed.
- Column totals row at bottom.

**Export:** "Export to Excel" button generates `.xlsx` matching the Cash Flow schedule format.

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# Upload: Provide a valid Procore budget CSV. Verify preview shows parsed rows.
# Confirm import. Verify GC/GR Forecast and Buyout Log are both seeded.

# Summary: Update projectedCostAtCompletion. Verify projectedProfit calculates correctly.
# Forecast Checklist: Mark 3 items complete. Verify count updates.

# GC/GR Forecast: Edit an actual cell for a past month. Verify Diff row recalculates.
# Cash Flow: Add a Pay App column. Enter amounts. Verify Balance to Complete updates.
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.10 — Schedule
-->
