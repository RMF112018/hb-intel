# Financial Control Center — UI Specification

## 1. Screen Identity

- **Screen name:** Financial Control Center
- **Module:** Project Hub / Financial
- **Primary route:** `/project-hub/$projectId/financial`
- **Screen type:** Financial command surface / module root
- **Primary intent:** Let the user understand the active reporting period, custody, data freshness, exposure posture, and next required actions without opening every financial sub-page.

## 2. Why This Page Exists

This page replaces the fragmented “where do I go next?” part of the current monthly financial process.

It should feel like the operating home for the module:
- current period status,
- active version state,
- source freshness,
- pending review / revision / approval,
- major financial posture,
- and direct entry into Summary, Budget, GC/GR, Cash Flow, Buyout, and History.

This page is **not** a decorative KPI dashboard.

## 3. Primary Users

### Project Manager
Needs to know:
- whether the active period is still in PM custody,
- what is stale or incomplete,
- what must be updated before review,
- and what can be submitted next.

### Project Executive
Needs to know:
- whether a review is pending,
- what changed since the prior version,
- what is materially exposed,
- and what requires decision or return for revision.

### Accounting / Finance
Needs to know:
- whether actuals and evidence are current,
- where discrepancies exist,
- and whether billing / cash flow source data is credible.

### Leadership
Needs to know:
- period posture,
- largest exposure,
- version status,
- and whether intervention is required.

### MOE / Governance
Needs to know:
- whether workflow, reopen, override, or stale-state conditions require elevated handling.

## 4. Recommended Layout Model

- **`WorkspacePageShell` layout:** `landing`
- **Primary wireframe influence:** Project Hub Concept 2 — Control Center + Posture-Aware Command Rail
- **Secondary influence:** Concept 1 for action-oriented posture tiles; Concept 4 for executive exposure blocks

## 5. Region Map

1. `R1` — Financial Period Header
2. `R2` — Financial Tool / Posture Rail
3. `R3` — Control Center Core
4. `R4` — Action / Review Rail
5. `R5` — Version / Activity Strip

## 6. Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Period Header                                                           │
│ Project | Active Period | Version | Custody | Freshness | Status | Actions  │
├───────────────────────┬──────────────────────────────────────┬──────────────┤
│ R2: Tool / Posture    │ R3: Control Center Core              │ R4: Action   │
│ Summary               │ Financial narrative                  │ Next action   │
│ Budget                │ Top exposures                        │ Review tasks  │
│ GC/GR                 │ Period readiness                     │ Exceptions    │
│ Cash Flow             │ Changed since prior                  │ Escalations   │
│ Buyout                │ Selected tool preview                │ Notes / refs  │
│ Review                │                                      │               │
│ History               │                                      │               │
├───────────────────────┴──────────────────────────────────────┴──────────────┤
│ R5: Version / Activity Strip                                                │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 7. Major Regions

### R1 — Financial Period Header
Must show:
- project name / number,
- active reporting period,
- working vs confirmed vs stale vs superseded status,
- custody owner,
- freshness indicators for budget / actuals / pay-app evidence,
- last meaningful update,
- primary next action.

Must include command-bar actions such as:
- Continue Working
- Refresh Snapshot
- Submit for Review
- Return for Revision
- Approve
- Reopen
- Open History

Only the highest-valid action should render as the primary CTA.

### R2 — Financial Tool / Posture Rail
Each row represents a financial work surface:
- Forecast Summary
- Budget
- GC/GR
- Cash Flow
- Buyout
- Checklist & Review
- Period History

Each row must show:
- posture state,
- issue / warning count,
- whether the page is editable or review-only,
- and whether deeper action is blocked by another page.

This is not just navigation. It is a live operational board.

### R3 — Control Center Core
The center area should include:
- financial narrative block,
- exposure summary,
- readiness summary,
- key deltas from prior period,
- and selected-page preview.

Default center content:
- overall financial posture,
- top 3 drivers,
- outstanding blockers,
- and next required milestone.

Selected-page preview:
- surface-specific highlights,
- one-sentence explanation,
- top unresolved issue,
- direct “Open Surface” CTA.

### R4 — Action / Review Rail
Should hold:
- current next action,
- review queue state,
- unresolved exceptions,
- annotations / reviewer notes,
- related records,
- and recent escalations.

This rail should update based on selected surface or selected issue.

### R5 — Version / Activity Strip
Must show:
- version transitions,
- stale-state events,
- returned-for-revision events,
- approvals,
- publication,
- and major refreshes or override events.

## 8. Component Inventory

### Governed `@hbc/ui-kit` primitives
- `WorkspacePageShell`
- `HbcCommandBar`
- cards / posture tiles
- banners
- status badges
- panels / drawers
- optional compact table for recent activity

### Financial-specific composite components
- `FinancialPeriodHeader`
- `FinancialToolPostureRail`
- `FinancialReadinessPanel`
- `FinancialChangeSummaryCard`
- `FinancialFreshnessStrip`
- `FinancialSelectedSurfacePreview`

## 9. Data Dependencies

This page should aggregate:
- active reporting period record,
- active forecast version record,
- period custody / workflow state,
- budget snapshot freshness,
- actual-cost freshness,
- pay-app evidence status,
- checklist completion summary,
- material exceptions,
- summary metrics,
- last changed surfaces,
- and recent audit events.

## 10. Interaction Model

### Default landing
- user arrives,
- sees current period and status,
- sees only the most important next action emphasized,
- sees which underlying surface is most at risk or incomplete.

### Tool selection
- clicking a tool row updates the preview in `R3`,
- updates the rail context in `R4`,
- and offers an “Open Surface” action.

### Next action behavior
- primary CTA must route to the right stateful experience, not just the route root.
- Example: “Submit for Review” opens the Review surface with unresolved gate items visible.

## 11. Role-Specific Behavior

### PM
- sees editable-state actions,
- can refresh while the period remains in PM custody,
- sees blockers preventing submission.

### PE
- sees review-only actions when applicable,
- sees compare-to-prior and return-for-revision pathways,
- sees approval controls only when valid.

### Finance
- sees source integrity and evidence warnings more prominently.

### Leadership
- sees concise posture, exposure, and intervention affordances.

### MOE
- sees governance actions only when relevant.

## 12. Responsive Behavior

### Desktop
- 3-column layout with persistent posture rail and action rail.

### Tablet
- left posture rail collapses to icon + label list,
- right rail becomes slide panel,
- center remains dominant.

### Mobile
- not the ideal primary control-center form,
- stack header, next action, posture list, and recent activity.

## 13. Complexity / Progressive Disclosure

### Essential
- show active period, status, custody, next action, top exposure, and blockers.

### Standard
- add tool posture rail detail, prior-period deltas, and recent changes.

### Expert
- add override / stale-state nuance, audit snippets, and deeper source-freshness detail.

## 14. Accessibility Requirements

- all tool-rail items keyboard reachable,
- explicit labels on posture state,
- command bar actions exposed in a predictable order,
- no status conveyed only by color,
- all drawers / modal panels must use focus trapping.

## 15. Key Acceptance Criteria

- A user can identify the active period, custody owner, and workflow state within 3 seconds.
- A user can tell what is stale and why without opening a sub-page.
- A user can identify the single best next action without scanning the full module.
- The page never degenerates into a generic KPI dashboard or a static launcher.
