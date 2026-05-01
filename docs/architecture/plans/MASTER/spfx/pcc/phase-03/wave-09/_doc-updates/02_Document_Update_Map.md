# 02 — Document Update Map

## Objective

Use this map to update the Wave 9 planning, blueprint, roadmap, and related PCC documentation so Wave 9 aligns with the Project Lifecycle Readiness Center target architecture.

## Required Inspection Paths

Inspect these files before writing:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/
```

If a file does not exist, record that fact and continue with repo-truth alternatives.

## Checklist Definition Source Directory

Read and use:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/
```

Expected source artifacts may include:

- consolidated Markdown documentation update package;
- startup checklist item file;
- safety checklist item file;
- closeout checklist item file;
- default item library CSV;
- default item library JSON;
- local-agent prompt or extraction notes.

## Recommended Doc Updates

### `phase-3/05_Phase_3_Development_Roadmap_Updated.md`

Current likely issue:

- Wave 9 is likely listed as `Job Startup Checklist` with primary output `Item-level startup workflow`.

Required update:

- Rename Wave 9 to `Project Lifecycle Readiness Center`.
- Change primary output to `Lifecycle readiness workflow seeded by startup, safety, and closeout checklist item libraries`.
- Update Milestone 4 language so Wave 9 is the first lifecycle readiness module after Wave 8, not a standalone startup checklist.
- Preserve Wave 8 as the Project Readiness Module Framework dependency.
- Preserve Wave 10 Permit Log, Wave 11 Responsibility Matrix, Wave 12 Constraints Log, Wave 13 Buyout Log, Wave 14 Approvals/Checkpoints unless repo truth says otherwise.

Recommended wording:

```text
| 9 | Project Lifecycle Readiness Center | Lifecycle readiness workflow seeded by startup, safety, and closeout checklist item libraries with evidence, role accountability, readiness gates, source traceability, and Priority Actions integration posture | Module wave |
```

### `phase-3/07_Phase_3_Module_Implementation_Plan.md`

Current likely issue:

- Wave 9 likely says `Build the Job Startup Checklist as the first Project Readiness workflow module`.

Required update:

- Replace the Wave 9 section with the full `Project Lifecycle Readiness Center` definition.
- State that startup, safety, and closeout checklist families become source-seeded lifecycle controls.
- Add code/work categories as target architecture, but label this current update as documentation-only.
- Add exit criteria covering source traceability, item classification, evidence model, scoring, role/action model, UX guardrails, and no-runtime posture.

### `HB_Project_Control_Center_Target_Architecture_Blueprint.md`

Required update areas:

- Project Home rollups: include Lifecycle Readiness / Project Lifecycle Readiness Center.
- Module map: update `Startup Center` / readiness references so Wave 9 is not just startup.
- Reference example documents: ensure startup, safety, and closeout checklist files are listed as seed sources.
- Document Control integration: add evidence relationship for lifecycle readiness items.
- Action Center sources: update startup/closeout/safety readiness language.
- Closeout & Warranty relationship: state closeout-from-day-one readiness exposure.
- Procore posture: clarify Procore is external reference only for this module unless later approved.

### `Project_Control_Center_Development_Roadmap.md`

Required update areas:

- Current roadmap may still use older phase names; update only if relevant and consistent with repo truth.
- If it lists Phase 6 as `Startup / Permits / Inspections / Closeout MVP Modules`, clarify that Wave 9’s target is the lifecycle readiness control plane seeded by startup/safety/closeout items.
- Avoid rewriting unrelated roadmap history.

### `Standard_Project_Site_Template_Contract.md`

Required update areas:

- Only update if it contains module registry, list schema, or checklist source references that are now inconsistent.
- Add or clarify that the lifecycle readiness module uses source-seeded item library definitions with project-instance state and evidence links.
- Do not add implementation schemas that have not been approved.

### `phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md`

Required update areas:

- Add or revise user journey for PM/PX/Superintendent/Safety/Project Accounting using the Lifecycle Readiness Center.
- Emphasize “what needs my attention” / phase gate / evidence / blocker UX.
- Avoid three-tab checklist UX.

### `phase-3/Register_Workflow_Module_Register.md`

Required update areas:

- Update Wave 9 module name and module definition.
- Add startup, safety, closeout as source families or subdomains under the lifecycle readiness module.
- Define integrations with Priority Actions, Approvals/Checkpoints, Document Control, Responsibility Matrix, and Permit Log.

### `phase-3/Register_MVP_Scope.md`

Required update areas:

- Replace any narrow Job Startup Checklist scope with the broader Wave 9 scope.
- Make clear that runtime implementation remains future scoped if only documentation is being updated.

### `phase-3/wave-9/`

Required update/additions:

- Create the Wave 9 target architecture file:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md
```

- Add a Wave 9 documentation-update closeout if repo convention supports it.
- If a `README.md` exists in the Wave 9 folder, update it to point to the new target architecture and checklist-definition source directory.

## Consistency Requirements

After edits, repo docs should consistently state:

- Wave 8 = Project Readiness Module Framework.
- Wave 9 = Project Lifecycle Readiness Center.
- Wave 9 is seeded by startup, safety, and closeout checklist definition files.
- Wave 9 is not a static checklist replacement.
- Wave 9 owns lifecycle readiness state; evidence documents live in HB Document Control Center / SharePoint project record.
- Procore remains external reference/deep-link/import lineage only unless later approved.
- No runtime implementation is claimed by documentation-only changes.
