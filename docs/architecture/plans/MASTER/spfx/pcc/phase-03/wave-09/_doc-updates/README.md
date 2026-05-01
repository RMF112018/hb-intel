# PCC Phase 3 Wave 9 Documentation Update Prompt Package

## Purpose

This package instructs a local code agent to update the `hb-intel` Project Control Center Phase 3 / Wave 9 planning, blueprint, roadmap, and implementation documentation so Wave 9 is no longer defined as a narrow `Job Startup Checklist` replacement.

Wave 9 should be redefined as a flagship lifecycle-readiness module:

```text
Project Lifecycle Readiness Center
```

The module uses the exact checklist-definition files saved in the repo at:

```text
/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/
```

Those checklist-definition files should include the extracted startup, safety, and closeout checklist items and the machine-readable item library generated from the source PDFs.

## Primary Outcome

The local agent should produce a documentation-only update that:

1. Replaces the Wave 9 target from `Job Startup Checklist` / simple startup checklist to `Project Lifecycle Readiness Center`.
2. Adds a complete target architecture file for the module.
3. Updates governing PCC roadmap and blueprint references so Wave 9 is consistently described as a lifecycle readiness, risk, evidence, accountability, and phase-gate module.
4. Uses the exact extracted checklist items from the saved checklist-definition files as the default item library basis.
5. Preserves source traceability back to the startup, safety, and closeout checklist PDFs.
6. Aligns with Wave 8 as the shared Project Readiness Module Framework dependency.
7. Keeps implementation bounded to documentation/planning updates unless a later prompt explicitly authorizes code.

## Package Files

| File | Purpose |
|---|---|
| `00_Execution_Instructions.md` | Global local-agent execution rules, scope, allowed paths, forbidden changes, and validation expectations. |
| `01_Target_Architecture_Project_Lifecycle_Readiness_Center.md` | Complete target architecture file to add to the repo, subject to repo-truth alignment. |
| `02_Document_Update_Map.md` | Exact governing docs to inspect and recommended updates for each. |
| `03_Checklist_Definition_File_Requirements.md` | Instructions for consuming the saved checklist-definition files and preserving exact item traceability. |
| `04_Prompt_01_Repo_Truth_And_Checklist_Audit.md` | First executable prompt: audit only, no writes. |
| `05_Prompt_02_Update_Governing_Blueprint_And_Roadmap.md` | Second executable prompt: update governing PCC docs for the new Wave 9 definition. |
| `06_Prompt_03_Add_Target_Architecture_File.md` | Third executable prompt: add the detailed target architecture file. |
| `07_Prompt_04_Add_Item_Library_Crosswalk_Documentation.md` | Fourth executable prompt: document exact checklist item library, classification, and source traceability. |
| `08_Prompt_05_Add_Role_Evidence_Scoring_And_UX_Details.md` | Fifth executable prompt: add or refine role/action, evidence, scoring, status, exception, and UX sections. |
| `09_Prompt_06_Validation_Closeout_And_Commit.md` | Sixth executable prompt: validate, close out, and commit. |
| `10_Reviewer_Prompt.md` | Fresh-session review prompt for independent validation. |

## Expected Commit Summary

```text
docs(pcc): redefine wave 9 lifecycle readiness architecture
```

## Expected Commit Description

```text
Redefines Phase 3 Wave 9 from a narrow Job Startup Checklist module into the Project Lifecycle Readiness Center target architecture.

Updates PCC planning, blueprint, roadmap, and Wave 9 documentation to incorporate startup, safety, and closeout checklist item libraries as lifecycle readiness controls with source traceability, role/action rules, evidence requirements, readiness scoring, phase activation, priority action linkage, approvals/checkpoints posture, audit history, and flagship UX direction.

Documentation-only. No source code, package changes, lockfile changes, runtime integrations, tenant mutation, SPFx package/deployment work, live Graph/Procore/SharePoint/Document Crunch/Adobe Sign operations, or provisioning execution are introduced.

No readiness runtime implementation, SPFx behavior change, backend route, ProjectRole taxonomy change, dependency change, manifest change, lockfile change, tenant mutation, or external-system mutation is introduced.
```
