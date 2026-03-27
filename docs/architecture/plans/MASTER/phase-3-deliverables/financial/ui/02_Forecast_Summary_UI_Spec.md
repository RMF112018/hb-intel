# Forecast Summary — UI Specification

## 1. Screen Identity

- **Screen name:** Forecast Summary
- **Module:** Project Hub / Financial
- **Primary route:** `/project-hub/$projectId/financial/forecast`
- **Screen type:** Working financial summary surface
- **Primary intent:** Let the PM build and update the official monthly forecast summary while giving reviewers a structured comparison and decision surface.

## 2. Why This Page Exists

This page replaces the summary tab and key decision layer from the current monthly workbook process.

It should unify:
- the financial story of the month,
- current contract / margin posture,
- cost exposure,
- receivable / collection risk interpretation,
- contingency / savings treatment summary,
- and summary-level commentary.

The page must feel like the **working center of gravity** for the monthly packet.

## 3. Primary Users

- Project Manager
- Project Executive
- Leadership / reviewers
- Accounting / Finance as reference readers

## 4. Recommended Layout Model

- **`WorkspacePageShell` layout:** `dashboard`
- **Primary wireframe influence:** Project Hub Concept 1 — Canvas-First Operating Layer
- **Secondary influence:** Concept 2 for action rail and surface preview behavior

## 5. Region Map

1. `R1` — Forecast Header / Version Header
2. `R2` — Summary KPI / Posture Band
3. `R3` — Working Summary Form Zone
4. `R4` — Prior Version / Delta Panel
5. `R5` — Commentary / Exposure Rail

## 6. Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Forecast Header                                                         │
│ Period | Version | State | Custody | Compare | Review Actions              │
├──────────────────────────────────────────────────────────────────────────────┤
│ R2: KPI / Posture Band                                                     │
│ Contract | Profit | Margin | Exposure | Collection Risk | Contingency      │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ R3: Working Summary Form             │ R4: Prior / Delta Panel              │
│ Core summary fields                  │ Changed since prior                  │
│ Financial posture blocks             │ Variance summaries                   │
│ Editable sections                    │ material shifts                      │
├──────────────────────────────────────┴───────────────────────────────────────┤
│ R5: Commentary / Exposure Rail                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 7. Major Regions

### R1 — Forecast Header
Must show:
- reporting period,
- version name / sequence,
- workflow state,
- current custodian,
- compare target,
- major command actions.

Typical actions:
- Save Working Changes
- View Checklist
- Submit for Review
- Return to Working
- Approve
- Open History

### R2 — KPI / Posture Band
Should present a concise set of action-tied KPIs:
- current contract value,
- current profit,
- current profit margin,
- major cost exposure,
- collection / receivable exposure,
- contingency and savings positioning.

These are not decorative metrics. Each should open the relevant detail or supporting panel.

### R3 — Working Summary Form Zone
Should contain:
- editable summary fields,
- structured sections grouped by domain,
- inline validation,
- provenance awareness,
- and field-level notes where needed.

Use sections such as:
- Contract / Revenue
- Cost / Margin
- Exposure / Risk
- Receivables / Cash
- Contingency / Savings
- Executive Summary / Outlook

### R4 — Prior / Delta Panel
Must make it easy to compare:
- current working state vs prior confirmed version,
- changed fields,
- material increases / decreases,
- and whether the changes affect review posture.

This panel should support both “what changed?” and “why it matters.”

### R5 — Commentary / Exposure Rail
Should include:
- PM commentary,
- reviewer notes,
- linked exposure items,
- related GC/GR or cash-flow consequences,
- and reference links to history / audit / related items.

## 8. Component Inventory

### Governed `@hbc/ui-kit` primitives
- `WorkspacePageShell`
- cards / KPI tiles
- form controls
- banners / inline callouts
- tabs or section navigation if needed
- side panels / drawers

### Financial-specific composites
- `ForecastVersionHeader`
- `ForecastKpiBand`
- `ForecastSummarySection`
- `ForecastDeltaPanel`
- `ForecastExposureRail`

## 9. Data Dependencies

- active forecast version,
- forecast summary record,
- prior confirmed version,
- key computed summary values,
- checklist state summary,
- linked exposure records,
- related GC/GR summary,
- related cash-flow summary,
- material exceptions / overrides,
- reviewer comments and annotations.

## 10. Interaction Model

### PM editing flow
- edit sections in-place,
- save working changes,
- compare to prior when needed,
- resolve warnings,
- then route to review.

### Reviewer flow
- enter compare-first mode,
- see changed fields emphasized,
- inspect linked impacts,
- return for revision or approve.

## 11. State Model Behavior

### Working
- editable,
- validation visible,
- unresolved issues surfaced prominently.

### Ready for Review / In Review
- editing reduced or blocked according to custody,
- compare mode emphasized,
- reviewer notes surfaced.

### Approved / Confirmed
- read-only,
- history and publication context emphasized.

### Stale
- show stale banner and changed-source warnings,
- identify which upstream changes matter.

## 12. Responsive Behavior

### Desktop
- split center form + delta panel with persistent commentary rail.

### Tablet
- delta panel collapses into segmented compare mode,
- commentary rail becomes drawer.

### Mobile
- section-by-section stacked editor,
- compare presented as full-screen overlay.

## 13. Complexity / Progressive Disclosure

### Essential
- simplified KPI band,
- minimal required summary fields,
- concise next-step guidance.

### Standard
- full domain sections,
- prior comparison summary,
- linked impacts.

### Expert
- detailed variance and provenance cues,
- deeper override / exception metadata.

## 14. Accessibility Requirements

- field grouping must be semantically clear,
- compare indicators cannot rely on color alone,
- editable vs read-only state must be explicit,
- keyboard path from changed-field summary to the field itself.

## 15. Key Acceptance Criteria

- A PM can understand and update the official monthly summary without opening every downstream page.
- A reviewer can instantly see what changed since the prior approved baseline.
- Approved versions feel immutable and historically reliable.
- Summary KPIs are directly tied to actions or supporting detail.
