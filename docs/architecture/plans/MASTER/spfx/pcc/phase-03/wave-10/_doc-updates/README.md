# PCC Phase 3 Wave 10 — Permit & Inspection Control Center Prompt Package

Generated: 2026-05-01

## Purpose

This package instructs a local code agent to update the PCC Phase 3 / Wave 10 documentation from a narrow **Permit Log** posture into a comprehensive, flagship **Permit & Inspection Control Center** target architecture.

This is a documentation-update prompt package. It does not implement runtime code.

## Final Module Direction

**Recommended user-facing module name:** Permit & Inspection Control Center

**Functional description:** A governed project-control surface for permit lifecycle tracking, required inspection readiness, AHJ launcher access, fee exposure, failed/reinspection workflows, evidence-backed closeout, and readiness/schedule-risk escalation.

## Source Inputs

### Uploaded workbook templates

- `docs/reference/example/Permit_Log_Template.xlsx`
- `docs/reference/example/Inspection-Log-Template.xlsx`

The templates are mandatory source references, but they are not guardrails that limit the product. The local agent must preserve workbook source traceability while defining a world-class target architecture.

### Required new field decisions from chat

Permit records must include:

- `revision`
- `applicationValue`
- `permitFee`

Inspection records must include:

- `reInspectionFee`

### Resolved open decisions from chat

- Use one unified surface, not two disconnected submodules.
- PCC is the internal workflow/accountability/readiness/audit source of truth.
- AHJ portals remain the external/legal authority.
- AHJ behavior is launcher-link only.
- Procore is launcher/reference only unless later authorized.
- Permit/inspection closeout requires evidence by default, or an authorized override with reason.
- Failed inspections create structured correction/reinspection workflows.
- Fees are visibility/risk fields in Wave 10; accounting integration is deferred.
- Standard baseline statuses are required, with limited controlled admin configuration.
- Tables are secondary detail views; the primary UX must be exception-first and command-center oriented.

## Package Files

1. `README.md`
2. `00_Repo_Truth_Basis.md`
3. `01_Workbook_Source_Analysis.md`
4. `02_Web_Research_Summary.md`
5. `03_Resolved_Decisions_Register.md`
6. `04_COMPLETE_Target_Architecture_Permit_Inspection_Control_Center.md`
7. `05_Documentation_Update_Roadmap.md`
8. `06_Prompt_01_Repo_Audit_And_Workbook_Traceability.md`
9. `07_Prompt_02_Governing_Docs_Update.md`
10. `08_Prompt_03_Wave10_Target_Architecture_File.md`
11. `09_Prompt_04_Workbook_Mapping_Appendix.md`
12. `10_Prompt_05_Closeout_Validation.md`
13. `11_Reviewer_Prompt.md`

## Suggested Commit Summary

```text
docs(pcc): define wave 10 permit and inspection control center
```

## Suggested Commit Description

```text
Updates Phase 3 Wave 10 planning, blueprint, roadmap, and target architecture documentation to define the unified Permit & Inspection Control Center.

Expands the prior Permit Log posture into a governed permit lifecycle, required inspection readiness, AHJ launcher, fee exposure, failed/reinspection workflow, evidence, audit, Priority Actions, Project Readiness, and Approvals / Checkpoints surface.

Grounds the module in the company permit and inspection log templates while preserving template source traceability. Adds required permit revision, application value, permit fee, and re-inspection fee fields. Documents AHJ launcher-only and no-external-runtime guardrails.

Documentation-only. No source code, package, lockfile, manifest, deployment, tenant, AHJ, Procore, Microsoft Graph, SharePoint mutation, or external-system runtime changes.
```
