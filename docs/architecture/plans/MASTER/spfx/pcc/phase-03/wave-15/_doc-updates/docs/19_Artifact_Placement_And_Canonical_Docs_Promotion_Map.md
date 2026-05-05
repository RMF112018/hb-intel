# 19 — Artifact Placement and Canonical Docs Promotion Map

## Purpose

This document prevents the Wave 15 documentation update package from remaining a standalone reference-only bundle. The local agent must promote, copy, split, or merge every decision, wireframe, schema, JSON artifact, reference note, and developer guidance document into the appropriate canonical repo documentation location.

Architecture decision records should live close to the relevant codebase/docs and in version control so future developers can understand the reason for design choices. The package therefore requires ADR promotion rather than leaving decisions only in the package folder.

## Hard Requirement

Do **not** consider the documentation update complete until every package artifact is accounted for in the closeout as one of:

1. promoted/copied into a canonical repo docs path;
2. merged into an existing canonical repo doc;
3. split into multiple canonical docs/ADRs;
4. intentionally retained as package-only reference with a specific reason.

The local agent must not simply commit this package folder and stop.

## Canonical Placement Table

| Package Artifact | Canonical Destination | Required Action | Required |
|---|---|---|---:|
| `PACKAGE_MANIFEST.md` | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/documentation-update-package/PACKAGE_MANIFEST.md` | retain-package-copy-and-reference-from-wave15-readme | True |
| `README.md` | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/documentation-update-package/README.md` | retain-package-copy-and-reference-from-wave15-readme | True |
| `docs/00_Objective_And_Context.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/README.md` | merge | True |
| `docs/01_Complete_Target_Architecture.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_External_Systems_Launch_Pad_Target_Architecture.md` | copy-or-merge-as-canonical | True |
| `docs/02_Repo_Truth_And_HBCentral_Schema_Audit.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_HBCentral_Schema_Audit.md` | copy-or-merge-as-canonical | True |
| `docs/03_System_Of_Record_And_Source_Lineage.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_System_Of_Record_And_Source_Lineage.md` | copy-or-merge-as-canonical-and-cross-reference-system-of-record-matrix | True |
| `docs/04_Field_Level_Data_Contracts.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Field_Level_Data_Contracts.md` | copy-or-merge-as-canonical | True |
| `docs/05_SharePoint_Storage_And_Indexing_Posture.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_SharePoint_Storage_And_Indexing_Posture.md` | copy-or-merge-as-canonical | True |
| `docs/06_SharePoint_List_Schema_Overview.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/README.md` | copy-or-merge-as-canonical | True |
| `docs/sharepoint-schemas/*.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/` | copy-all | True |
| `docs/07_Route_Read_Model_And_Command_Boundary.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Read_Model_Route_And_Command_Boundary.md` | copy-or-merge-as-canonical-and-update-route-taxonomy | True |
| `docs/08_State_Machines_And_Degraded_States.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_State_Machines_And_Degraded_States.md` | copy-or-merge-as-canonical | True |
| `docs/09_Persona_Role_Action_And_Redaction_Model.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Persona_Role_Action_And_Redaction_Model.md` | copy-or-merge-as-canonical-and-update-persona-docs | True |
| `docs/10_Project_Level_Launcher_Link_Configuration.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Project_Level_Launcher_Link_Configuration.md` | copy-or-merge-as-canonical | True |
| `docs/11_Wave14_PriorityActions_And_Handoff.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Wave14_And_Priority_Actions_Handoff.md` | copy-or-merge-as-canonical-and-cross-reference-wave14 | True |
| `docs/12_UX_Wireframes_And_Interaction_Model.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/README.md` | copy-or-merge-as-canonical | True |
| `docs/wireframes/*.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/` | copy-all | True |
| `docs/13_Security_Secrets_Audit_And_HBI_Guardrails.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Security_Secrets_Audit_And_HBI_Guardrails.md` | copy-or-merge-as-canonical-and-update-source-system-contracts | True |
| `docs/14_Dependency_Package_And_Test_Strategy.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Dependency_Package_And_Test_Strategy.md` | copy-or-merge-as-canonical | True |
| `docs/15_Documentation_Update_Targets.md` | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/Documentation_Update_Targets.md` | copy-or-merge-as-canonical | True |
| `docs/16_Validation_And_Closeout_Requirements.md` | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/Validation_And_Closeout_Requirements.md` | copy-or-merge-as-canonical | True |
| `docs/17_ADRs.md` | `docs/architecture/adr/` | split-into-individual-adrs-or-create-wave15-adr-bundle-with-index | True |
| `docs/18_TODO_NonBlocking_Items.md` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_TODO_NonBlocking_Items.md` | copy-or-merge-as-canonical | True |
| `docs/19_Artifact_Placement_And_Canonical_Docs_Promotion_Map.md` | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/Artifact_Placement_And_Canonical_Docs_Promotion_Map.md` | copy-as-canonical-and-use-as-closeout-checklist | True |
| `artifacts/*.json` | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/` | copy-all-and-validate-json | True |
| `reference/*.md` | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/reference/` | copy-all | True |
| `prompts/*.md` | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/prompts/` | copy-all | True |


## Closeout Evidence Required

The final closeout must include:

- artifact placement table with actual destination paths;
- list of docs created;
- list of docs updated;
- list of artifacts copied;
- list of artifacts merged/split;
- confirmation that only approved TODOs remain;
- confirmation that no runtime/source/package/lockfile mutation occurred;
- validation evidence for JSON and Markdown formatting.

## Approved Package-Only Exceptions

Only the following may remain package-only if explicitly linked from the Wave 15 README:

- the original package manifest;
- the original package README;
- raw generation/reference notes duplicated by canonical docs.

All decisions, wireframes, schemas, role matrices, route/read-model guidance, security/HBI guidance, validation gates, and prompts must be promoted.
