# Documentation Update Roadmap

Generated: 2026-05-02

## Objective

Update PCC Phase 3 / Wave 11 documentation to define the complete Responsibility Matrix target architecture.

## Recommended Sequence

### Step 1 — Repo-Truth Baseline and Contradiction Map

Audit current repo state before edits.

Confirm:

- branch;
- HEAD;
- working tree status;
- recent PCC commits;
- Wave 11 current naming;
- whether Wave 11 implementation has started;
- whether `responsibility-matrix` already exists in `WorkflowModules.ts`;
- whether `wave-11/` docs already exist;
- governing docs that already define Responsibility Matrix;
- governing docs that need more detailed target architecture language.

No edits in this step.

### Step 2 — Workbook Extraction and Source Traceability

Inspect:

```text
docs/reference/example/Responsibility Matrix - Template.xlsx
docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx
```

Confirm:

- PM sheet default item rows;
- Field sheet default item rows;
- owner-contract template/placeholder rows;
- source role columns;
- assignment marks;
- formulas;
- validations/dropdowns;
- hidden rows/columns;
- merged cells;
- conditional formatting;
- workbook metadata;
- default item JSON mapping;
- ambiguous items.

### Step 3 — Governing Blueprint / Roadmap Update

Likely files:

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
```

Only update these where repo truth confirms the need.

### Step 4 — Wave 11 Documentation Package

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Responsibility_Matrix_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Responsibility_Matrix_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Resolved_Decisions_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Workbook_Source_Mapping.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Documentation_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items.json
```

### Step 5 — Closeout

Validate:

- docs are complete;
- no runtime claims;
- no unsafe scope;
- source traceability present;
- web research sources cited in docs;
- workbook mapping aligns to actual repo workbook extraction;
- validation commands passed;
- lockfile unchanged;
- staged file list is correct.

## Recommended Commit Summary

```text
docs(pcc): define wave 11 responsibility matrix architecture
```

## Recommended Commit Description

```text
Defines Phase 3 Wave 11 Responsibility Matrix documentation.

Adds comprehensive target architecture, scope lock, resolved decisions, workbook source mapping, default-item JSON reference, and closeout posture for the Responsibility Matrix module.

Grounds Wave 11 in the company responsibility-matrix workbooks while defining a governed, template-driven, project-instance-based responsibility control system with RACI, owner-contract mapping, decision-rights overlay, assignment lifecycle, handoff, current action owner, workflow steps, evidence links, exceptions, Matrix Health Score, Priority Actions, Project Readiness, Approvals / Checkpoints, and Document Control integration seams.

Documentation-only. No runtime source, package, lockfile, manifest, deployment, tenant, Procore, Sage, Microsoft Graph, SharePoint REST/PnP, AHJ, legal-advice, external-system writeback, or production changes.
```
