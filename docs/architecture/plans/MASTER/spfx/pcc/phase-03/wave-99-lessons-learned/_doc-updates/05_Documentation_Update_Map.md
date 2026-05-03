# 05 — Documentation Update Map

## New Lessons Learned Docs to Create

```text
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/Lessons_Learned_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/Lessons_Learned_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/Lessons_Learned_System_Of_Record_And_Integration_Model.md
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/Lessons_Learned_Developer_Implementation_Decisions_And_Contracts.md
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/Lessons_Learned_Workbook_Source_Mapping.md
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/Lessons_Learned_Documentation_Closeout.md
```

## Reference Files to Create

```text
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/reference/lessons_learned_module_data_contract.json
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/reference/lessons_learned_state_machine.json
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/reference/field_permission_and_redaction_matrix.json
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/reference/lessons_learned_validation_rules.json
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/reference/default_lessons_learned_seed_structure.json
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/reference/workbook_field_mapping_reference.json
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/reference/hbi_lessons_learned_contracts.json
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/reference/metric_dictionary.json
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/reference/fixture_scenarios.json
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/reference/source_research_urls.json
```

## Existing Governing Docs to Update If Repo Truth Confirms Needed

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
```

## Key Alignment Text

> Lessons Learned Center is a future PCC workstream and Later work center that must be documented as a PCC-native lifecycle knowledge and continuous-improvement system. It captures, reviews, publishes, redacts, and routes project knowledge across the full project lifecycle while preserving Procore, Sage, SharePoint/HB Central, and PCC system-of-record boundaries.

## System-of-Record Matrix Addition

Add or update a row establishing:

| Record / Capability | Owner |
|---|---|
| Lessons Learned record, status, classification, review state, publication state, redaction, improvement action, reuse history, HBI summary, and audit trail | PCC |
| RFIs, submittals, punch items, observations, commitments, daily logs, and source-system project records referenced as evidence | Procore or applicable source system |
| Accounting/job-cost truth referenced by a lesson | Sage |
| Evidence files and document binaries | SharePoint / HB Central |

## Roadmap Decision

Do not promote Lessons Learned into current Phase 3 MVP scope unless repo truth already includes an accepted roadmap update. This package documents target architecture and future implementation contracts only.
