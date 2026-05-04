# Wireframe — Module Integration Panels

## Objective

Show how approval/checkpoint status appears inside source modules without transferring ownership away from those modules.

## Generic Module Panel

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Module Source Item                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Source item details remain owned by source module.                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Approval / Checkpoint Panel                                                  │
│ Active checkpoint: Estimate Freeze Approval                                  │
│ State: pending-review                                                        │
│ Current owner: Chief Estimator                                               │
│ Due: Today                                                                   │
│ Blocks downstream: Buyout Seed                                               │
│ Evidence complete: Yes                                                       │
│ [Open Approval Detail]                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Required Module Panels

- Project Readiness panel.
- Team & Access panel.
- Document Control panel.
- Permit & Inspection panel.
- Responsibility Matrix panel.
- Constraints Log panel.
- Buyout Log panel.
- Estimating Workbench / Wave 13G panel.
- External Systems panel.
- Site Health panel.

## Interaction Rules

- Panel links to Approval Detail.
- Source module remains the editable/viewable source context.
- Phase 14 panel does not mutate source record directly.
- Returned/revision-requested state tells source owner what must change.
- Superseded state links to replacement approval request.

## Acceptance Criteria

- Users can see approval state without leaving source workflow.
- Developers can implement panel consistently across modules.
