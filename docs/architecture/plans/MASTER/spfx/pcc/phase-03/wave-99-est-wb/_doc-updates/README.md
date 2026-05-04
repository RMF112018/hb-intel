# PCC Estimating Workbench — Developer Documentation Update Package

Generated: 2026-05-04

## Purpose

This package instructs a local code agent working in `/Users/bobbyfetting/hb-intel` to update PCC documentation so the **Estimating Workbench** is developer-ready for MVP implementation.

The package uses the attached unified lifecycle documentation-update package as the structural template. It is documentation-only and converts the approved target architecture into build contracts: SharePoint list schemas, SPFx surface placement, read models, commands, state machines, validation rules, role/action permissions, grid/formula behavior, Commercial and Multifamily template contracts, HB cost-code posture, template migration mapping, handoff schema, dependency-package evaluation, and acceptance gates.

## Resolved Decisions

- MVP: **Yes** — Estimating Workbench is an MVP scope amendment.
- First implementation: **SharePoint/SPFx**.
- Mounting: existing PCC **Project Readiness** surface; no new top-level PCC shell route in MVP.
- Storage: central SharePoint/PCC estimating data lists with project-site projection; this is a unified PCC data substrate, not a departmental workspace.
- Cost-code hierarchy: MVP uses **internal HB cost codes**; Sage mapping follows in a future phase.
- Day-one templates: **Commercial** and **Multifamily**.
- Workbook import: **template migration only**; active project workbook import is deferred.
- Runtime posture: no implementation, no package install, no lockfile mutation, no tenant mutation, no source-system writeback.

## Package Structure

```text
pcc_estimating_workbench_developer_documentation_update_package/
  README.md
  00_Repo_Truth_Context.md
  01_Research_Source_Summary.md
  02_Closed_Decisions_Register.md
  03_Comprehensive_Target_Implementation_Architecture.md
  04_Developer_Implementation_Contracts.md
  05_Documentation_Update_Map.md
  06_Live_Integration_And_Security_Gates.md
  07_Dependency_Package_Evaluation.md
  docs/estimating-workbench/
    Estimating_Workbench_Developer_Target_Architecture.md
    Estimating_Workbench_MVP_Scope_Lock.md
    Estimating_Workbench_SPFx_Surface_Contract.md
    Estimating_Workbench_SharePoint_List_Schema.md
    Estimating_Workbench_Read_Model_And_Command_Contract.md
    Estimating_Workbench_State_Machines.md
    Estimating_Workbench_Field_Level_Data_Dictionary.md
    Estimating_Workbench_Validation_Rule_Catalog.md
    Estimating_Workbench_Role_Action_Permission_Matrix.md
    Estimating_Workbench_Grid_And_Formula_Engine_Decision.md
    Estimating_Workbench_Dependency_Package_Evaluation.md
    Estimating_Commercial_Template_Contract.md
    Estimating_Multifamily_Template_Contract.md
    Estimating_HB_Cost_Code_Dictionary_Contract.md
    Estimating_Workbook_Template_Migration_Map.md
    Estimating_To_Downstream_Handoff_Package_Schema.md
    Estimating_Workbench_HBI_Grounding_And_Search_Contract.md
    Estimating_Workbench_Error_Degraded_State_Matrix.md
    Estimating_Workbench_Test_Acceptance_Gates.md
    Estimating_Workbench_Implementation_Roadmap_Update.md
    Estimating_Workbench_Documentation_Closeout_Template.md
  prompts/
    Prompt_01_Repo_Truth_Revalidation.md
    Prompt_02_Governing_Docs_And_Register_Alignment.md
    Prompt_03_Target_Architecture_And_MVP_Scope_Lock.md
    Prompt_04_Developer_Contracts_And_Reference_JSONs.md
    Prompt_05_Template_Cost_Code_Migration_And_Handoff_Contracts.md
    Prompt_06_Dependency_Evaluation_And_Test_Gates.md
    Prompt_07_Roadmap_Closeout_And_Validation.md
    Fresh_Session_Reviewer_Prompt_Estimating_Workbench_Developer_Docs.md
  reference/*.json
```

## Non-Negotiable Guardrails

- Documentation-only package.
- Do not implement runtime source code.
- Do not install dependency packages.
- Do not mutate `package.json`, `pnpm-lock.yaml`, SPFx manifests, CI, deployment files, tenant settings, SharePoint lists, Procore, Sage, Autodesk, BuildingConnected, or HBI services.
- Do not create a departmental estimating silo.
- Do not grant HBI pricing authority or award-recommendation authority.
- Do not import active project workbooks in MVP.
