# GC/GR — UI Specification

## 1. Screen Identity

- **Screen name:** GC/GR
- **Module:** Project Hub / Financial
- **Primary route:** `/project-hub/$projectId/financial/gcgr`
- **Screen type:** Periodized working forecast model
- **Primary intent:** Provide a structured GC/GR working model that replaces the macro-enabled workbook and feeds summary-level posture automatically.

## 2. Why This Page Exists

This page replaces the GC/GR forecast workbook and the manual transcription of results into the monthly packet.

It must support:
- working revisions,
- periodized projections,
- variance insight,
- commentary,
- and direct trace to the Summary surface.

This page must feel like a **real model workspace**, not a summary widget.

## 3. Primary Users

- Project Manager
- Project Executive
- Leadership as reader
- Finance as contextual reader

## 4. Recommended Layout Model

- **`WorkspacePageShell` layout:** `list`
- **Primary wireframe influence:** Concept 1 — canvas-like working surface
- **Secondary influence:** Concept 2 for command / review behavior

## 5. Region Map

1. `R1` — GC/GR Version Header
2. `R2` — Variance / Roll-Up Band
3. `R3` — GC/GR Working Grid
4. `R4` — Selected Line / Assumptions Panel
5. `R5` — Summary Feed / Related Impact Panel

## 6. Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: GC/GR Header                                                            │
│ Period | Version | State | Compare | Commands                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ R2: Variance / Roll-Up Band                                                 │
│ Projected Revenue | Projected Cost | Variance | Margin Effect | Risk Flags  │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ R3: Working Grid                     │ R4: Selected Line / Assumptions       │
│ Category / line item                 │ line history                           │
│ budget basis                         │ assumptions                            │
│ projection fields                    │ notes                                  │
│ variance                             │ compare to prior                       │
├──────────────────────────────────────┴───────────────────────────────────────┤
│ R5: Summary Feed / Related Impact                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 7. Major Regions

### R1 — GC/GR Version Header
Must show:
- reporting period,
- version identity,
- workflow state,
- compare target,
- and major actions.

Typical actions:
- Save Changes
- Compare to Prior
- Open Summary
- View Review Notes
- Submit / Return / Approve based on state

### R2 — Variance / Roll-Up Band
Should show a concise, meaningful summary of:
- total projected revenue,
- total projected cost,
- gross variance,
- margin effect,
- and material warning flags.

Each item should be traceable to the underlying line drivers.

### R3 — GC/GR Working Grid
Must support:
- line-level editability in working mode,
- category grouping,
- sort / filter / search,
- compare-to-prior highlighting,
- and clear distinction between derived and editable values.

### R4 — Selected Line / Assumptions Panel
Should show:
- current line definition,
- assumptions,
- comments,
- previous period values,
- linked changes,
- and why the line matters.

### R5 — Summary Feed / Related Impact Panel
Must show:
- how the GC/GR state affects Forecast Summary,
- whether material changes have not yet been explained in commentary,
- and links to related financial posture changes.

## 8. Component Inventory

### Governed `@hbc/ui-kit` primitives
- `WorkspacePageShell`
- `HbcCommandBar`
- `HbcDataTable`
- cards / banners / side panels

### Financial-specific composites
- `GCGRHeader`
- `GCGRRollupBand`
- `GCGRLineEditorGrid`
- `GCGRAssumptionsPanel`
- `GCGRSummaryImpactPanel`

## 9. Data Dependencies

- GC/GR line records,
- category definitions,
- computed variance results,
- prior version comparison data,
- line notes / assumptions,
- linked summary effects,
- review notes and audit events.

## 10. Interaction Model

### PM working flow
- edit line assumptions or projected values,
- watch roll-up band update,
- inspect summary impact,
- add rationale where necessary.

### Reviewer flow
- compare to prior,
- inspect changed lines,
- evaluate whether explanation and posture are adequate.

## 11. State Model Behavior

### Working
- line editing enabled,
- compare highlighting optional,
- unresolved rationale warnings visible.

### In Review
- editing reduced / blocked,
- compare and notes emphasized.

### Approved
- read-only,
- linked to approved summary artifact.

## 12. Responsive Behavior

### Desktop
- grid-first workspace with secondary side panel.

### Tablet
- assumptions panel becomes bottom or overlay sheet.

### Mobile
- grouped line-list with line-detail editor overlay.

## 13. Complexity / Progressive Disclosure

### Essential
- grouped totals and highest-impact lines only.

### Standard
- full working grid with relevant compare cues.

### Expert
- full variance nuance, assumptions history, and audit.

## 14. Accessibility Requirements

- clear row/line focus handling,
- editable cells accessible by keyboard,
- compare state not conveyed only by color,
- grouped rows announced meaningfully.

## 15. Key Acceptance Criteria

- A PM can use this page as a real replacement for the GC/GR workbook.
- A reviewer can immediately identify material line changes.
- The effect on the monthly Summary is visible without manual reconciliation.
- The page never feels like a dead-end table disconnected from the rest of the module.
