# PCC Preconstruction Continuity — Unified Lifecycle Documentation Update Package

Generated: 2026-05-04

## Purpose

This package adapts the prior **PCC Preconstruction Continuity — Go / No-Go Carry-Forward + Estimating Kickoff Documentation Update Package** so it aligns with the implemented unified lifecycle layer and the new developer-contract corpus.

It is designed for a local code agent working in:

```text
/Users/bobbyfetting/hb-intel
```

## Controlling Architecture

The implemented unified lifecycle layer is now the controlling architecture for this package. The local agent must treat these as authoritative, subject to local repo-truth verification:

```text
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/
docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md
docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
```

Known current baseline from the prior conversation:

```text
HEAD: 58f53d49d59f8c70683725c999e8f55e2bc2dfef
Lockfile MD5: c56df7b79986896624536aab74d609f4
```

The agent must re-run local repo-truth commands before editing because the local repo may have changed.

## What This Package Does

- Repositions **Preconstruction Continuity** as a contributor to the unified lifecycle spine, Project Memory, traceability graph, HBI grounding, role/stage lenses, and future-reference knowledge.
- Keeps **Go / No-Go Carry-Forward** as an upstream BD/Pursuit source-owned decision record with a PCC read-only, role-aware carry-forward projection after GO.
- Keeps **Estimating Kickoff** as a later-phase Project Readiness / Preconstruction workflow module, not a current MVP standalone shell route.
- Requires all source-derived preconstruction data to carry source lineage, permission/redaction posture, audit-event behavior, degraded-state handling, and HBI eligibility/refusal rules.
- Updates the documentation-update prompts so they align with the implemented unified lifecycle developer contracts.
- Preserves source templates as lineage/evidence/seed-taxonomy inputs only. The target PCC experience is not a workbook clone.

## What This Package Does Not Do

- It does not implement runtime source code.
- It does not add backend routes.
- It does not add SPFx screens or shell routes.
- It does not change models, packages, manifests, workflows, lockfiles, tenant settings, or source systems.
- It does not call or mutate Procore, Sage, CRM/Unanet, Autodesk/BuildingConnected, Microsoft Graph, SharePoint REST/PnP, Power Automate, or any external system.
- It does not create SharePoint sites, Procore projects, accounting projects, staffing commitments, legal decisions, approvals, or production deployment artifacts.
- It does not alter, unprotect, overwrite, or destroy source workbooks or PDFs.

## Package Structure

```text
pcc_preconstruction_continuity_unified_lifecycle_documentation_update_package/
  README.md
  00_Repo_Truth_Context.md
  01_Research_Source_Summary.md
  02_Closed_Decisions_Register.md
  03_Enhanced_Target_Architecture.md
  04_Developer_Implementation_Contracts.md
  05_Documentation_Update_Map.md
  06_Source_Template_Mapping_Policy.md
  docs/preconstruction-continuity/
    Preconstruction_Continuity_Target_Architecture.md
    Go_NoGo_Carry_Forward_Target_Architecture.md
    Estimating_Kickoff_Target_Architecture.md
    Preconstruction_Continuity_System_Of_Record_And_Integration_Model.md
    Preconstruction_Continuity_Developer_Implementation_Decisions_And_Contracts.md
    Preconstruction_Continuity_Source_Template_Mapping.md
    Preconstruction_Continuity_Documentation_Closeout_Template.md
  prompts/
    Prompt_01_Repo_Audit_Template_Extraction_And_Source_Truth.md
    Prompt_02_Governing_Docs_Alignment.md
    Prompt_03_Target_Architecture_Documentation.md
    Prompt_04_Developer_Contracts_And_Reference_JSONs.md
    Prompt_05_Source_Template_Mapping_And_Seed_JSON_Finalization.md
    Prompt_06_Closeout_Validation_And_Commit.md
    Fresh_Session_Reviewer_Prompt_Preconstruction_Continuity.md
  reference/
    preconstruction_continuity_data_contract.json
    gng_carry_forward_data_contract.json
    estimating_kickoff_data_contract.json
    preconstruction_visibility_matrix.json
    preconstruction_state_machine.json
    priority_action_reason_codes.json
    source_template_field_map_requirements.json
    fixture_scenarios.json
    source_research_urls.json
    source_template_extraction_snapshot.json
```

## Required Exact Phrase in Every Local-Agent Prompt

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Execution Rule

Run prompts sequentially. Prompt 01 is read-only. Later prompts may edit only explicitly authorized documentation/reference JSON files. If repo truth contradicts this package, stop and report the contradiction before editing.

## Post-Execution Review

After execution and commit, run the fresh-session reviewer prompt included in:

```text
prompts/Fresh_Session_Reviewer_Prompt_Preconstruction_Continuity.md
```
