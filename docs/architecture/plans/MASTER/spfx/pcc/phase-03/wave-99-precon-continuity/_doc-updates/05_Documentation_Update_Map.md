# 05 — Documentation Update Map

## Purpose

This map defines where the local agent should update documentation so Preconstruction Continuity aligns with the implemented unified lifecycle layer.

## Approved New / Updated Folder

```text
docs/architecture/blueprint/sp-project-control-center/preconstruction-continuity/
```

## Required Docs Under Approved Folder

```text
Preconstruction_Continuity_Target_Architecture.md
Go_NoGo_Carry_Forward_Target_Architecture.md
Estimating_Kickoff_Target_Architecture.md
Preconstruction_Continuity_System_Of_Record_And_Integration_Model.md
Preconstruction_Continuity_Developer_Implementation_Decisions_And_Contracts.md
Preconstruction_Continuity_Source_Template_Mapping.md
Preconstruction_Continuity_Documentation_Closeout_Template.md
```

## Required Reference JSONs

Recommended location unless repo truth indicates a different local convention:

```text
docs/architecture/blueprint/sp-project-control-center/preconstruction-continuity/reference/
```

Required files:

```text
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

## Governing Docs To Consider For Minimal Cross-Reference Updates

Only update if missing and only with minimal additive language:

```text
docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md
docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

## Governing Cross-Reference Language

Use this or a concise equivalent:

```text
Preconstruction Continuity is governed by the unified lifecycle developer contracts. Go / No-Go carry-forward and Estimating Kickoff context must contribute only permission-filtered lifecycle events, Project Memory, traceability edges, readiness signals, Priority Action candidates, HBI-eligible evidence, and future-reference knowledge. These records must not create separate departmental workspaces or override source systems.
```

## Explicit No-Edit Paths

Do not edit:

```text
docs/architecture/plans/**
packages/**
backend/**
apps/**
.pnpm/**
.github/**
pnpm-lock.yaml
package.json
```

unless the user separately authorizes a later runtime implementation package.
