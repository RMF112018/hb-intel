# 05 — Documentation Update Map

Generated: 2026-05-03

## Primary New Documentation Folder

Create:

`docs/architecture/blueprint/sp-project-control-center/future-workstreams/subcontractor-scorecard/`

Recommended new files:

```text
Subcontractor_Scorecard_Target_Architecture.md
Subcontractor_Scorecard_Scope_Lock.md
Subcontractor_Scorecard_System_Of_Record_And_Integration_Model.md
Subcontractor_Scorecard_Developer_Implementation_Decisions_And_Contracts.md
Subcontractor_Scorecard_Workbook_Source_Mapping.md
Subcontractor_Scorecard_Documentation_Closeout_Template.md
```

## Existing Governance Docs To Update

| File | Required Update |
|---|---|
| `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md` | Add definitive Subcontractor Scorecard target architecture summary, correct workbook filename if stale, and reference future-workstream folder. |
| `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md` | Add explicit PCC-native rows for scorecard, template, evidence link, recommendation, risk-control plan, and portfolio summary. |
| `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md` | Add future-workstream / post-MVP module posture; do not alter Phase 3 Waves 8-14 sequencing. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md` | Add note that Subcontractor Scorecard remains Later/Post-MVP and only surfaces approved summaries to MVP surfaces if future implementation allows. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md` | Add future-workstream entry or later module register note; do not mark as current MVP. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md` | Add non-disruptive future-workstream note. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md` | Add future-workstream note outside the active Phase 3 wave table. |

## Explicitly Do Not Update

- `docs/architecture/plans/**` unless separately authorized.
- Runtime code under `apps/**`, `packages/**`, or `backend/**`.
- Package manifests or lockfile.
- SPFx manifests.
- CI/workflows.

## Documentation Consistency Requirements

- Use `Subcontractor Scorecard` as the module name.
- Use `Subcontractor Performance Center` as the work center name.
- Use `subcontractor-performance` as the current work center id.
- Use `docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx` as the authoritative source workbook path.
- Avoid old filename variants like `(1)` or attachment-local names unless documenting historical mismatch.
- Use `Future Workstream / Post-MVP` posture, not a new active Phase 3 wave unless Bobby separately approves a roadmap change.
