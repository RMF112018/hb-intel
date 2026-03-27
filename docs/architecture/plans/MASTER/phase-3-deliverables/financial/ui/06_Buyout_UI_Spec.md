# Buyout — UI Specification

## 1. Screen Identity

- **Screen name:** Buyout
- **Module:** Project Hub / Financial
- **Primary route:** `/project-hub/$projectId/financial/buyout`
- **Screen type:** Hybrid procurement / financial interpretation workspace
- **Primary intent:** Give the project team a clear view of buyout status, unresolved scope exposure, commitment readiness, and forecast-period financial implications.

## 2. Why This Page Exists

This page replaces the buyout log as a financial working surface.

It must preserve the hybrid authority boundary:
- external systems may remain authoritative for formal commercial commitment data,
- but Financial owns the internal forecast-period interpretation and exposure layer.

This is a **risk and progress workspace**, not a raw procurement log clone.

## 3. Primary Users

- Project Manager
- Project Executive
- Leadership as readers
- Finance as contextual readers

## 4. Recommended Layout Model

- **`WorkspacePageShell` layout:** `list`
- **Primary wireframe influence:** Concept 2 — posture-aware command surface
- **Secondary influence:** Concept 4 for executive risk visibility

## 5. Region Map

1. `R1` — Buyout Posture Header
2. `R2` — Completion / Exposure Summary Band
3. `R3` — Buyout Lines Grid
4. `R4` — Selected Line / Savings / Risk Panel
5. `R5` — Related Commercial / Workflow Context Rail

## 6. Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Buyout Header                                                           │
│ Period | Status | Exposure | Completion | Commands                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ R2: Summary Band                                                            │
│ Dollar-weighted completion | open exposure | pending commitment | watchlist │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ R3: Buyout Lines Grid                │ R4: Selected Line / Savings / Risk   │
│ scope / package                      │ line status                           │
│ budget basis                         │ forecast implication                  │
│ commitment readiness                 │ savings treatment                     │
│ exposure                             │ notes / issues                        │
├──────────────────────────────────────┴───────────────────────────────────────┤
│ R5: Commercial / Workflow Context Rail                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 7. Major Regions

### R1 — Buyout Posture Header
Must show:
- reporting period context,
- buyout posture,
- total completion,
- unresolved exposure,
- and actions.

Typical actions:
- Update Status
- View Linked Commitment
- Open Related Summary
- View Savings Disposition
- Launch to PWA if deeper workflow is required

### R2 — Completion / Exposure Summary Band
Should show:
- dollar-weighted completion,
- unresolved exposure,
- packages at risk,
- long-lead watch items,
- and commitment readiness warnings.

### R3 — Buyout Lines Grid
Should include:
- trade / package,
- budget basis,
- commitment link state,
- buyout status,
- exposure status,
- financial notes,
- and savings disposition state where relevant.

### R4 — Selected Line / Savings / Risk Panel
Should show:
- selected package summary,
- commitment relationship,
- forecast implication,
- savings treatment,
- unresolved blockers,
- and notes / history.

### R5 — Related Commercial / Workflow Context Rail
Should include:
- linked commitment state,
- related compliance or review items,
- financial implications,
- and downstream impact links.

## 8. Component Inventory

### Governed `@hbc/ui-kit` primitives
- `WorkspacePageShell`
- `HbcCommandBar`
- `HbcDataTable`
- cards / banners / detail panels

### Financial-specific composites
- `BuyoutHeader`
- `BuyoutExposureBand`
- `BuyoutGrid`
- `BuyoutRiskPanel`
- `BuyoutWorkflowContextRail`

## 9. Data Dependencies

- buyout line items,
- buyout status lifecycle,
- savings disposition records,
- linked commitment identifiers / state,
- exposure metrics,
- summary rollups,
- notes and audit events.

## 10. Interaction Model

### PM flow
- review package readiness,
- update internal interpretation,
- identify unresolved exposure,
- see effect on monthly forecast posture.

### PE / reviewer flow
- focus on what remains exposed,
- what savings treatment affects margin,
- and whether escalation is needed.

## 11. State Model Behavior

### Working
- update interpretation and working-state fields,
- escalate when deeper commitment workflow is required.

### Review
- emphasize unresolved exposure and savings implications.

### Approved
- read-only historical interpretation for that period.

## 12. Responsive Behavior

### Desktop
- wide data grid with risk panel.

### Tablet
- grouped cards or narrower table mode.

### Mobile
- package list with expandable line detail.

## 13. Complexity / Progressive Disclosure

### Essential
- top exposure packages and completion summary only.

### Standard
- full package list and key financial implications.

### Expert
- lifecycle nuance, commitment linkage detail, and audit.

## 14. Accessibility Requirements

- lifecycle states text-labeled,
- grid navigation keyboard accessible,
- risk and savings states not color-only,
- PWA escalation actions clearly labeled.

## 15. Key Acceptance Criteria

- A user can tell how bought-out the job really is in dollar-weighted terms.
- A user can see what unresolved buyout exposure still affects the forecast.
- The page preserves hybrid authority boundaries without becoming confusing.
- The page supports escalation when deeper workflows live elsewhere.
