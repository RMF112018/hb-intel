# Cash Flow — UI Specification

## 1. Screen Identity

- **Screen name:** Cash Flow
- **Module:** Project Hub / Financial
- **Primary route:** `/project-hub/$projectId/financial/cash-flow`
- **Screen type:** Actual-and-forecast financial timing workspace
- **Primary intent:** Provide a governed, evidence-aware cash flow working model that combines actual months, projected months, cumulative trends, and collection-risk context.

## 2. Why This Page Exists

This page replaces the cash flow / draw schedule workbook and the manual interpretation of pay-app evidence and aging exposure.

It must clearly distinguish:
- evidence-backed actual months,
- projected future months,
- collection / receivable context,
- and what is assumption-driven vs fact-driven.

## 3. Primary Users

- Project Manager
- Accounting / Finance
- Project Executive
- Leadership as reader

## 4. Recommended Layout Model

- **`WorkspacePageShell` layout:** `dashboard`
- **Primary wireframe influence:** Concept 1 for center working model
- **Secondary influence:** Concept 4 for exposure visualization and intervention context

## 5. Region Map

1. `R1` — Cash Flow Header / Evidence Header
2. `R2` — Timing / Exposure KPI Band
3. `R3` — Monthly Actual + Forecast Grid
4. `R4` — Cumulative Trend / Chart Zone
5. `R5` — A/R and Evidence Rail

## 6. Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Cash Flow Header                                                        │
│ Period | Version | Evidence Status | State | Commands                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ R2: KPI Band                                                                │
│ Cash Position | Forecast Collections | Variance | Aging Risk | Watch Flags  │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ R3: Monthly Grid                     │ R4: Cumulative Trend / Chart         │
│ Actual months                        │ cumulative curve                      │
│ Forecast months                      │ actual vs forecast trend              │
│ assumptions                          │ look-ahead risk markers               │
├──────────────────────────────────────┴───────────────────────────────────────┤
│ R5: A/R + Evidence Rail                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 7. Major Regions

### R1 — Cash Flow Header / Evidence Header
Must show:
- period and version,
- whether actual months are evidence-backed,
- whether any manual correction exists,
- workflow state,
- and command actions.

Typical actions:
- Save Forecast
- View Evidence
- Add Manual Correction
- Compare to Prior
- Open Summary

### R2 — Timing / Exposure KPI Band
Should show:
- current cash position,
- near-term collection expectation,
- variance vs prior,
- aging exposure,
- and watch flags.

These metrics should lead to detail, not just decorate the page.

### R3 — Monthly Actual + Forecast Grid
Must show:
- months in sequence,
- actual billed / actual cash data where available,
- forecast months for the horizon,
- assumption notes where relevant,
- and visible distinction between actual and projected rows.

### R4 — Cumulative Trend / Chart Zone
Must visualize:
- cumulative cash flow,
- forecast vs actual movement,
- trend inflection points,
- and high-risk months.

### R5 — A/R and Evidence Rail
Should show:
- aging overview,
- retainage / outstanding watch items,
- evidence package status,
- manual correction notices,
- and links to related records or notes.

## 8. Component Inventory

### Governed `@hbc/ui-kit` primitives
- `WorkspacePageShell`
- KPI cards
- chart container
- table/grid surface
- banners / panels

### Financial-specific composites
- `CashFlowHeader`
- `CashFlowEvidenceBanner`
- `CashFlowMonthlyGrid`
- `CashFlowTrendPanel`
- `CashFlowEvidenceRail`

## 9. Data Dependencies

- cash flow actual records,
- cash flow forecast records,
- AR aging records,
- evidence package metadata,
- manual correction records,
- summary metrics,
- prior version comparison data.

## 10. Interaction Model

### PM flow
- update projected months,
- understand cumulative effect,
- attach or inspect assumptions,
- and ensure the cash story aligns to the Summary.

### Finance flow
- verify actuals,
- inspect aging and exceptions,
- understand whether manual correction has occurred.

### Reviewer flow
- focus on timing credibility and risk.

## 11. State Model Behavior

### Working
- projected months editable,
- evidence and assumptions both visible.

### Review
- actual-vs-forecast differences emphasized,
- manual correction notices prominent.

### Approved
- read-only period record,
- historical trust preserved.

## 12. Responsive Behavior

### Desktop
- grid + chart visible simultaneously.

### Tablet
- chart collapses below grid,
- rail becomes drawer.

### Mobile
- summary cards first,
- month detail in expandable list.

## 13. Complexity / Progressive Disclosure

### Essential
- show top-level timing posture and flagged months only.

### Standard
- show full monthly grid and cumulative chart.

### Expert
- show evidence lineage, correction audit, and detailed aging nuance.

## 14. Accessibility Requirements

- chart cannot be sole source of meaning,
- grid headings and month labels must be accessible,
- actual vs forecast must be explicit in text and structure,
- correction notices must announce clearly.

## 15. Key Acceptance Criteria

- A user can distinguish actual evidence-backed months from projected months immediately.
- A reviewer can identify near-term timing risk without manual spreadsheet analysis.
- The page supports both explanation and action.
- The cash-flow model remains tightly connected to the rest of the Financial module.
