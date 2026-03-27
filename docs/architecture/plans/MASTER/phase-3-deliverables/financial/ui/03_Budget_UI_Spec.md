# Budget — UI Specification

## 1. Screen Identity

- **Screen name:** Budget
- **Module:** Project Hub / Financial
- **Primary route:** `/project-hub/$projectId/financial/budget`
- **Screen type:** Source-governed budget snapshot and FTC working surface
- **Primary intent:** Provide a controlled way to inspect the locked period snapshot, compare against fresher source data, and manage allowed FTC working-state edits without corrupting source-of-truth boundaries.

## 2. Why This Page Exists

This page replaces the “budget export + working spreadsheet interpretation” part of the current process.

It must make three things unmistakable:
1. what came from the authoritative source,
2. what belongs to the period-locked snapshot,
3. and what belongs to the internal working forecast layer.

This page must **not** look or behave like a freeform spreadsheet editor.

## 3. Primary Users

- Project Manager
- Project Executive
- Accounting / Finance
- Leadership as readers
- MOE as governance reviewer when needed

## 4. Recommended Layout Model

- **`WorkspacePageShell` layout:** `list`
- **Primary wireframe influence:** Project Hub Concept 2 — command-oriented control surface
- **Secondary influence:** Concept 1 for surface-specific drill behavior

## 5. Region Map

1. `R1` — Budget Snapshot Header
2. `R2` — Source / Freshness / Diff Banner Zone
3. `R3` — Budget Lines Grid
4. `R4` — Selected Line / Impact Panel
5. `R5` — Import / Reconciliation / Activity Panel

## 6. Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Snapshot Header                                                         │
│ Active Snapshot | Source Batch | Locked At | Refresh Status | Commands      │
├──────────────────────────────────────────────────────────────────────────────┤
│ R2: Freshness / Diff / Source Warnings                                      │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ R3: Budget Lines Grid                │ R4: Selected Line / Impact Panel     │
│ Cost code                            │ Source values                         │
│ Description                          │ Snapshot values                       │
│ Budget                               │ FTC / EAC effect                      │
│ Actual                               │ Variance effect                       │
│ FTC                                  │ linked changes                        │
│ EAC                                  │ history / notes                       │
└──────────────────────────────────────┴───────────────────────────────────────┘
```

## 7. Major Regions

### R1 — Budget Snapshot Header
Must show:
- active snapshot identity,
- source import batch,
- lock timestamp,
- current refresh state,
- whether a fresher source exists,
- and allowed actions.

Typical actions:
- Refresh Snapshot
- View Import Details
- View Reconciliation
- Export
- Open Related Summary

### R2 — Source / Freshness / Diff Banner Zone
Must communicate:
- whether the source is newer than the locked snapshot,
- whether the current forecast is stale,
- whether reconciliation issues exist,
- and what downstream impact a refresh would trigger.

This is a critical trust layer.

### R3 — Budget Lines Grid
Use `HbcDataTable` or a governed table composite.

Columns should include:
- cost code,
- cost description,
- revised budget,
- actual / cost-to-date,
- forecast-to-complete,
- estimated cost at completion,
- projected over / under,
- refresh / reconciliation flags.

The table should support:
- search,
- sorting,
- saved views,
- sticky headers,
- and grouped filters.

### R4 — Selected Line / Impact Panel
Must show:
- authoritative source value,
- locked snapshot value,
- working FTC,
- computed EAC,
- computed over / under,
- linked change history,
- and where this line affects Summary / GCGR / Cash Flow / Health.

This panel should make causality clear.

### R5 — Import / Reconciliation / Activity Panel
Should hold:
- import batch details,
- reconciliation warnings,
- data lineage notes,
- recent edits,
- and audit events.

## 8. Component Inventory

### Governed `@hbc/ui-kit` primitives
- `WorkspacePageShell`
- `HbcCommandBar`
- `HbcDataTable`
- banners / badges
- tabs / drawers / details panels

### Financial-specific composites
- `BudgetSnapshotHeader`
- `BudgetFreshnessBanner`
- `BudgetDiffInspector`
- `BudgetLineImpactPanel`
- `BudgetImportActivityPanel`

## 9. Data Dependencies

- budget snapshot record,
- source import batch metadata,
- budget line records,
- source-vs-snapshot diff summary,
- FTC working-state values,
- computed EAC / over-under values,
- reconciliation issues,
- recent edits and audit events.

## 10. Interaction Model

### Default behavior
- table loads using the locked budget snapshot,
- freshness state is visible immediately,
- user can inspect a line and understand both source and forecast implications.

### Refresh behavior
- refresh is explicit and never automatic mid-period,
- refresh must show downstream consequences before confirmation,
- refresh should be blocked when policy / custody disallows it.

### Line selection behavior
- selecting a line updates impact panel,
- line impact panel should expose all relevant downstream effects.

## 11. State Model Behavior

### Working in PM custody
- refresh allowed where policy permits,
- FTC editing allowed,
- reconciliation warnings actionable.

### Review state
- editing restricted,
- diff and trust cues emphasized.

### Approved / Closed
- read-only,
- source traceability remains visible,
- no silent refresh path.

## 12. Responsive Behavior

### Desktop
- wide grid with right-side impact panel.

### Tablet
- impact panel becomes bottom drawer,
- grid remains primary.

### Mobile
- list-card hybrid or narrower column mode,
- line detail opens a dedicated sheet.

## 13. Complexity / Progressive Disclosure

### Essential
- key columns only,
- simplified impact summary.

### Standard
- full financial columns,
- reconciliation cues,
- panelized detail.

### Expert
- import lineage, diff rules, audit and override nuance.

## 14. Accessibility Requirements

- full table header association,
- row/line selection announced clearly,
- editable FTC cells must expose validation messages accessibly,
- warnings and state changes cannot be color-only.

## 15. Key Acceptance Criteria

- A PM can understand exactly what budget basis the current forecast is using.
- A user can tell whether a fresher source exists and what a refresh would affect.
- Source, snapshot, and working-state layers remain visually and conceptually distinct.
- The page behaves like a governed financial surface, not a generic spreadsheet clone.
