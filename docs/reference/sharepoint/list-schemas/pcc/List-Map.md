# PCC List Map

**Package purpose:** Complete repo-truth-derived PCC SharePoint list schema map for `docs/reference/sharepoint/list-schemas/pcc/`.

**Status:** Audit-generated draft for developer implementation review.  
**Generated:** 2026-05-05T08:47:59Z  
**Total Required PCC Lists:** 119

## Classification Legend

| Classification               | Meaning                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `contract-derived-required`  | Required by governing PCC architecture / Standard Project Site Template contract.        |
| `model-derived-required`     | Required because a current PCC shared model/interface exposes durable operational state. |
| `tenant-backed-existing`     | Existing HBCentral list to map from, not recreated as PCC storage by default.            |
| `not-a-list-read-model-only` | Explicitly derived/read-only; should not become a SharePoint list.                       |

## Project Identity / Site Profile

|   # | List                          | Storage      | Classification              | File                                                                       |
| --: | ----------------------------- | ------------ | --------------------------- | -------------------------------------------------------------------------- |
|   1 | PCC Project Profile           | Project site | `contract-derived-required` | [`lists/project-profile.md`](lists/project-profile.md)                     |
|   2 | PCC Project Site Manifest     | Project site | `contract-derived-required` | [`lists/project-site-manifest.md`](lists/project-site-manifest.md)         |
|   3 | PCC Project Module Registry   | Project site | `model-derived-required`    | [`lists/project-module-registry.md`](lists/project-module-registry.md)     |
|   4 | PCC Project Source References | Project site | `model-derived-required`    | [`lists/project-source-references.md`](lists/project-source-references.md) |

## Team and Access

|   # | List                    | Storage      | Classification           | File                                                           |
| --: | ----------------------- | ------------ | ------------------------ | -------------------------------------------------------------- |
|   5 | PCC Team Members        | Project site | `model-derived-required` | [`lists/team-members.md`](lists/team-members.md)               |
|   6 | PCC Access Assignments  | Project site | `model-derived-required` | [`lists/access-assignments.md`](lists/access-assignments.md)   |
|   7 | PCC Permission Requests | Project site | `model-derived-required` | [`lists/permission-requests.md`](lists/permission-requests.md) |
|   8 | PCC Role History        | Project site | `model-derived-required` | [`lists/role-history.md`](lists/role-history.md)               |

## Document Control

|   # | List                             | Storage      | Classification           | File                                                                             |
| --: | -------------------------------- | ------------ | ------------------------ | -------------------------------------------------------------------------------- |
|   9 | PCC Document Source Registry     | Project site | `model-derived-required` | [`lists/document-source-registry.md`](lists/document-source-registry.md)         |
|  10 | PCC Document Source Health       | Project site | `model-derived-required` | [`lists/document-source-health.md`](lists/document-source-health.md)             |
|  11 | PCC Document References          | Project site | `model-derived-required` | [`lists/document-references.md`](lists/document-references.md)                   |
|  12 | PCC External Document References | Project site | `model-derived-required` | [`lists/external-document-references.md`](lists/external-document-references.md) |
|  13 | PCC Document Control Actions     | Project site | `model-derived-required` | [`lists/document-control-actions.md`](lists/document-control-actions.md)         |

## External Systems Launch Pad

|   # | List                                 | Storage                     | Classification              | File                                                                                     |
| --: | ------------------------------------ | --------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
|  14 | PCC External System Definitions      | Global / HBCentral registry | `contract-derived-required` | [`lists/external-system-definitions.md`](lists/external-system-definitions.md)           |
|  15 | PCC External URL Policy Registry     | Global / HBCentral registry | `contract-derived-required` | [`lists/external-url-policy-registry.md`](lists/external-url-policy-registry.md)         |
|  16 | PCC Project External Launch Links    | Project site                | `model-derived-required`    | [`lists/project-external-launch-links.md`](lists/project-external-launch-links.md)       |
|  17 | PCC Project External System Mappings | Project site                | `model-derived-required`    | [`lists/project-external-system-mappings.md`](lists/project-external-system-mappings.md) |
|  18 | PCC External Object References       | Project site                | `model-derived-required`    | [`lists/external-object-references.md`](lists/external-object-references.md)             |
|  19 | PCC External Review Items            | Project site                | `model-derived-required`    | [`lists/external-review-items.md`](lists/external-review-items.md)                       |
|  20 | PCC External System Health Snapshots | Project site                | `model-derived-required`    | [`lists/external-system-health-snapshots.md`](lists/external-system-health-snapshots.md) |
|  21 | PCC External System Audit Events     | Project site                | `model-derived-required`    | [`lists/external-system-audit-events.md`](lists/external-system-audit-events.md)         |

## Project Readiness

|   # | List                         | Storage      | Classification           | File                                                                     |
| --: | ---------------------------- | ------------ | ------------------------ | ------------------------------------------------------------------------ |
|  22 | PCC Readiness Items          | Project site | `model-derived-required` | [`lists/readiness-items.md`](lists/readiness-items.md)                   |
|  23 | PCC Readiness Gates          | Project site | `model-derived-required` | [`lists/readiness-gates.md`](lists/readiness-gates.md)                   |
|  24 | PCC Readiness Evidence Links | Project site | `model-derived-required` | [`lists/readiness-evidence-links.md`](lists/readiness-evidence-links.md) |
|  25 | PCC Readiness Review History | Project site | `model-derived-required` | [`lists/readiness-review-history.md`](lists/readiness-review-history.md) |

## Lifecycle Readiness

|   # | List                                     | Storage                     | Classification           | File                                                                                             |
| --: | ---------------------------------------- | --------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------ |
|  26 | PCC Lifecycle Readiness Template Library | Global / HBCentral registry | `model-derived-required` | [`lists/lifecycle-readiness-template-library.md`](lists/lifecycle-readiness-template-library.md) |
|  27 | PCC Lifecycle Readiness Project Items    | Project site                | `model-derived-required` | [`lists/lifecycle-readiness-project-items.md`](lists/lifecycle-readiness-project-items.md)       |
|  28 | PCC Lifecycle External References        | Project site                | `model-derived-required` | [`lists/lifecycle-external-references.md`](lists/lifecycle-external-references.md)               |
|  29 | PCC Lifecycle Evidence Links             | Project site                | `model-derived-required` | [`lists/lifecycle-evidence-links.md`](lists/lifecycle-evidence-links.md)                         |

## Permit & Inspection Control Center

|   # | List                                 | Storage      | Classification           | File                                                                                     |
| --: | ------------------------------------ | ------------ | ------------------------ | ---------------------------------------------------------------------------------------- |
|  30 | PCC AHJ Jurisdiction Profiles        | Project site | `model-derived-required` | [`lists/ahj-jurisdiction-profiles.md`](lists/ahj-jurisdiction-profiles.md)               |
|  31 | PCC Permit Records                   | Project site | `model-derived-required` | [`lists/permit-records.md`](lists/permit-records.md)                                     |
|  32 | PCC Inspection Records               | Project site | `model-derived-required` | [`lists/inspection-records.md`](lists/inspection-records.md)                             |
|  33 | PCC Reinspection Lineage             | Project site | `model-derived-required` | [`lists/reinspection-lineage.md`](lists/reinspection-lineage.md)                         |
|  34 | PCC Permit Inspection Fee Exposure   | Project site | `model-derived-required` | [`lists/permit-inspection-fee-exposure.md`](lists/permit-inspection-fee-exposure.md)     |
|  35 | PCC Permit Inspection Evidence Links | Project site | `model-derived-required` | [`lists/permit-inspection-evidence-links.md`](lists/permit-inspection-evidence-links.md) |
|  36 | PCC Permit Inspection Audit Events   | Project site | `model-derived-required` | [`lists/permit-inspection-audit-events.md`](lists/permit-inspection-audit-events.md)     |

## Responsibility Matrix

|   # | List                                 | Storage                         | Classification           | File                                                                                     |
| --: | ------------------------------------ | ------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
|  37 | PCC Responsibility Template Library  | Global / HBCentral registry     | `model-derived-required` | [`lists/responsibility-template-library.md`](lists/responsibility-template-library.md)   |
|  38 | PCC Responsibility Project Instances | Project site                    | `model-derived-required` | [`lists/responsibility-project-instances.md`](lists/responsibility-project-instances.md) |
|  39 | PCC Responsibility Roles             | Project site or global registry | `model-derived-required` | [`lists/responsibility-roles.md`](lists/responsibility-roles.md)                         |
|  40 | PCC Responsibility Assignments       | Project site                    | `model-derived-required` | [`lists/responsibility-assignments.md`](lists/responsibility-assignments.md)             |
|  41 | PCC Responsibility Exceptions        | Project site                    | `model-derived-required` | [`lists/responsibility-exceptions.md`](lists/responsibility-exceptions.md)               |
|  42 | PCC Responsibility Evidence Links    | Project site                    | `model-derived-required` | [`lists/responsibility-evidence-links.md`](lists/responsibility-evidence-links.md)       |
|  43 | PCC Responsibility Snapshots         | Project site                    | `model-derived-required` | [`lists/responsibility-snapshots.md`](lists/responsibility-snapshots.md)                 |
|  44 | PCC Responsibility Audit Events      | Project site                    | `model-derived-required` | [`lists/responsibility-audit-events.md`](lists/responsibility-audit-events.md)           |

## Constraints Log

|   # | List                              | Storage      | Classification           | File                                                                               |
| --: | --------------------------------- | ------------ | ------------------------ | ---------------------------------------------------------------------------------- |
|  45 | PCC Constraint Risk Items         | Project site | `model-derived-required` | [`lists/constraint-risk-items.md`](lists/constraint-risk-items.md)                 |
|  46 | PCC Constraint Impact Assessments | Project site | `model-derived-required` | [`lists/constraint-impact-assessments.md`](lists/constraint-impact-assessments.md) |
|  47 | PCC Constraint Actions            | Project site | `model-derived-required` | [`lists/constraint-actions.md`](lists/constraint-actions.md)                       |
|  48 | PCC Constraint History            | Project site | `model-derived-required` | [`lists/constraint-history.md`](lists/constraint-history.md)                       |
|  49 | PCC Constraint Snapshots          | Project site | `model-derived-required` | [`lists/constraint-snapshots.md`](lists/constraint-snapshots.md)                   |

## Approvals / Checkpoints

|   # | List                               | Storage                            | Classification           | File                                                                                 |
| --: | ---------------------------------- | ---------------------------------- | ------------------------ | ------------------------------------------------------------------------------------ |
|  50 | PCC Approval Requests              | Project site                       | `model-derived-required` | [`lists/approval-requests.md`](lists/approval-requests.md)                           |
|  51 | PCC Approval Policies              | Global / HBCentral policy registry | `model-derived-required` | [`lists/approval-policies.md`](lists/approval-policies.md)                           |
|  52 | PCC Approval Policy Versions       | Global / HBCentral policy registry | `model-derived-required` | [`lists/approval-policy-versions.md`](lists/approval-policy-versions.md)             |
|  53 | PCC Approval Routes                | Project site                       | `model-derived-required` | [`lists/approval-routes.md`](lists/approval-routes.md)                               |
|  54 | PCC Approval Steps                 | Project site                       | `model-derived-required` | [`lists/approval-steps.md`](lists/approval-steps.md)                                 |
|  55 | PCC Approval Participants          | Project site                       | `model-derived-required` | [`lists/approval-participants.md`](lists/approval-participants.md)                   |
|  56 | PCC Approval Decisions             | Project site                       | `model-derived-required` | [`lists/approval-decisions.md`](lists/approval-decisions.md)                         |
|  57 | PCC Checkpoint Definitions         | Global / HBCentral policy registry | `model-derived-required` | [`lists/checkpoint-definitions.md`](lists/checkpoint-definitions.md)                 |
|  58 | PCC Checkpoint Instances           | Project site                       | `model-derived-required` | [`lists/checkpoint-instances.md`](lists/checkpoint-instances.md)                     |
|  59 | PCC Checkpoint Evidence Links      | Project site                       | `model-derived-required` | [`lists/checkpoint-evidence-links.md`](lists/checkpoint-evidence-links.md)           |
|  60 | PCC Checkpoint Source References   | Project site                       | `model-derived-required` | [`lists/checkpoint-source-references.md`](lists/checkpoint-source-references.md)     |
|  61 | PCC Checkpoint Audit Events        | Project site                       | `model-derived-required` | [`lists/checkpoint-audit-events.md`](lists/checkpoint-audit-events.md)               |
|  62 | PCC Approval Priority Action Links | Project site                       | `model-derived-required` | [`lists/approval-priority-action-links.md`](lists/approval-priority-action-links.md) |

## Buyout / Procurement

|   # | List                                       | Storage      | Classification           | File                                                                                                 |
| --: | ------------------------------------------ | ------------ | ------------------------ | ---------------------------------------------------------------------------------------------------- |
|  63 | PCC Buyout Packages                        | Project site | `model-derived-required` | [`lists/buyout-packages.md`](lists/buyout-packages.md)                                               |
|  64 | PCC Buyout Scope Lines                     | Project site | `model-derived-required` | [`lists/buyout-scope-lines.md`](lists/buyout-scope-lines.md)                                         |
|  65 | PCC Buyout Budget Allocations              | Project site | `model-derived-required` | [`lists/buyout-budget-allocations.md`](lists/buyout-budget-allocations.md)                           |
|  66 | PCC Buyout Commitment Links                | Project site | `model-derived-required` | [`lists/buyout-commitment-links.md`](lists/buyout-commitment-links.md)                               |
|  67 | PCC Buyout Compliance Requirements         | Project site | `model-derived-required` | [`lists/buyout-compliance-requirements.md`](lists/buyout-compliance-requirements.md)                 |
|  68 | PCC Buyout Procurement Milestones          | Project site | `model-derived-required` | [`lists/buyout-procurement-milestones.md`](lists/buyout-procurement-milestones.md)                   |
|  69 | PCC Buyout Evidence Links                  | Project site | `model-derived-required` | [`lists/buyout-evidence-links.md`](lists/buyout-evidence-links.md)                                   |
|  70 | PCC Buyout Reconciliation Issues           | Project site | `model-derived-required` | [`lists/buyout-reconciliation-issues.md`](lists/buyout-reconciliation-issues.md)                     |
|  71 | PCC Buyout Audit Events                    | Project site | `model-derived-required` | [`lists/buyout-audit-events.md`](lists/buyout-audit-events.md)                                       |
|  72 | PCC Buyout Project Memory Contributions    | Project site | `model-derived-required` | [`lists/buyout-project-memory-contributions.md`](lists/buyout-project-memory-contributions.md)       |
|  73 | PCC Buyout Traceability Edge Contributions | Project site | `model-derived-required` | [`lists/buyout-traceability-edge-contributions.md`](lists/buyout-traceability-edge-contributions.md) |
|  74 | PCC Buyout HBI Eligibility Markers         | Project site | `model-derived-required` | [`lists/buyout-hbi-eligibility-markers.md`](lists/buyout-hbi-eligibility-markers.md)                 |

## Procore Data Layer

|   # | List                              | Storage                            | Classification           | File                                                                               |
| --: | --------------------------------- | ---------------------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
|  75 | PCC Procore Project Mappings      | Project site or HBCentral registry | `model-derived-required` | [`lists/procore-project-mappings.md`](lists/procore-project-mappings.md)           |
|  76 | PCC Procore Subject Area Registry | Global / HBCentral registry        | `model-derived-required` | [`lists/procore-subject-area-registry.md`](lists/procore-subject-area-registry.md) |
|  77 | PCC Procore Source Lineage        | Project site                       | `model-derived-required` | [`lists/procore-source-lineage.md`](lists/procore-source-lineage.md)               |
|  78 | PCC Procore Object Links          | Project site                       | `model-derived-required` | [`lists/procore-object-links.md`](lists/procore-object-links.md)                   |
|  79 | PCC Procore Curated Summaries     | Project site                       | `model-derived-required` | [`lists/procore-curated-summaries.md`](lists/procore-curated-summaries.md)         |
|  80 | PCC Procore Derived Signals       | Project site                       | `model-derived-required` | [`lists/procore-derived-signals.md`](lists/procore-derived-signals.md)             |
|  81 | PCC Procore Sync Health           | Project site                       | `model-derived-required` | [`lists/procore-sync-health.md`](lists/procore-sync-health.md)                     |

## Site Health / Repair / Admin Verification

|   # | List                         | Storage      | Classification           | File                                                                     |
| --: | ---------------------------- | ------------ | ------------------------ | ------------------------------------------------------------------------ |
|  82 | PCC Site Health Checks       | Project site | `model-derived-required` | [`lists/site-health-checks.md`](lists/site-health-checks.md)             |
|  83 | PCC Site Health Findings     | Project site | `model-derived-required` | [`lists/site-health-findings.md`](lists/site-health-findings.md)         |
|  84 | PCC Repair Requests          | Project site | `model-derived-required` | [`lists/repair-requests.md`](lists/repair-requests.md)                   |
|  85 | PCC Repair Actions           | Project site | `model-derived-required` | [`lists/repair-actions.md`](lists/repair-actions.md)                     |
|  86 | PCC Admin Verification Items | Project site | `model-derived-required` | [`lists/admin-verification-items.md`](lists/admin-verification-items.md) |

## Priority Actions

|   # | List                             | Storage      | Classification           | File                                                                             |
| --: | -------------------------------- | ------------ | ------------------------ | -------------------------------------------------------------------------------- |
|  87 | PCC Priority Action Sources      | Project site | `model-derived-required` | [`lists/priority-action-sources.md`](lists/priority-action-sources.md)           |
|  88 | PCC Priority Action Candidates   | Project site | `model-derived-required` | [`lists/priority-action-candidates.md`](lists/priority-action-candidates.md)     |
|  89 | PCC Priority Action Suppressions | Project site | `model-derived-required` | [`lists/priority-action-suppressions.md`](lists/priority-action-suppressions.md) |
|  90 | PCC Priority Action Audit Events | Project site | `model-derived-required` | [`lists/priority-action-audit-events.md`](lists/priority-action-audit-events.md) |

## Project Memory / Traceability / HBI Grounding

|   # | List                               | Storage                                      | Classification           | File                                                                                 |
| --: | ---------------------------------- | -------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------ |
|  91 | PCC Project Lifecycle Events       | Project site                                 | `model-derived-required` | [`lists/project-lifecycle-events.md`](lists/project-lifecycle-events.md)             |
|  92 | PCC Project Memory Records         | Project site                                 | `model-derived-required` | [`lists/project-memory-records.md`](lists/project-memory-records.md)                 |
|  93 | PCC Project Stage Lenses           | Project site                                 | `model-derived-required` | [`lists/project-stage-lenses.md`](lists/project-stage-lenses.md)                     |
|  94 | PCC Cross Stage Traceability Links | Project site                                 | `model-derived-required` | [`lists/cross-stage-traceability-links.md`](lists/cross-stage-traceability-links.md) |
|  95 | PCC Related Record Clusters        | Project site                                 | `model-derived-required` | [`lists/related-record-clusters.md`](lists/related-record-clusters.md)               |
|  96 | PCC Warranty Trace Records         | Project site                                 | `model-derived-required` | [`lists/warranty-trace-records.md`](lists/warranty-trace-records.md)                 |
|  97 | PCC Cross Project References       | Global / HBCentral knowledge registry        | `model-derived-required` | [`lists/cross-project-references.md`](lists/cross-project-references.md)             |
|  98 | PCC Project Knowledge References   | Global / HBCentral knowledge registry        | `model-derived-required` | [`lists/project-knowledge-references.md`](lists/project-knowledge-references.md)     |
|  99 | PCC HBI Grounding Citations        | Project site or HBCentral depending on scope | `model-derived-required` | [`lists/hbi-grounding-citations.md`](lists/hbi-grounding-citations.md)               |
| 100 | PCC HBI Refusal Events             | Project site or HBCentral depending on scope | `model-derived-required` | [`lists/hbi-refusal-events.md`](lists/hbi-refusal-events.md)                         |

## Workflow / Business Audit / Configuration

|   # | List                                          | Storage                                                                        | Classification              | File                                                                                                       |
| --: | --------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 101 | PCC Workflow Items                            | Project site                                                                   | `model-derived-required`    | [`lists/workflow-items.md`](lists/workflow-items.md)                                                       |
| 102 | PCC Workflow Assignments                      | Project site                                                                   | `model-derived-required`    | [`lists/workflow-assignments.md`](lists/workflow-assignments.md)                                           |
| 103 | PCC Workflow Transitions                      | Project site                                                                   | `model-derived-required`    | [`lists/workflow-transitions.md`](lists/workflow-transitions.md)                                           |
| 104 | PCC Workflow Assignment History               | Project site                                                                   | `model-derived-required`    | [`lists/workflow-assignment-history.md`](lists/workflow-assignment-history.md)                             |
| 105 | PCC Business Audit Events                     | Project site or HBCentral depending on event scope                             | `model-derived-required`    | [`lists/business-audit-events.md`](lists/business-audit-events.md)                                         |
| 106 | PCC Configuration Registry                    | Global / HBCentral defaults only; project overrides in Wave 16 settings family | `contract-derived-required` | [`lists/configuration-registry.md`](lists/configuration-registry.md)                                       |
| 107 | PCC Feature Flags                             | Global / HBCentral defaults only                                               | `model-derived-required`    | [`lists/feature-flags.md`](lists/feature-flags.md)                                                         |
| 108 | PCC Module Flags                              | Global / HBCentral defaults only                                               | `model-derived-required`    | [`lists/module-flags.md`](lists/module-flags.md)                                                           |
| 109 | PCC Schema Version Registry                   | Global / HBCentral                                                             | `contract-derived-required` | [`lists/schema-version-registry.md`](lists/schema-version-registry.md)                                     |
| 110 | PCC Sync Ingestion Runs                       | Global / HBCentral or project site depending on source                         | `contract-derived-required` | [`lists/sync-ingestion-runs.md`](lists/sync-ingestion-runs.md)                                             |
| 111 | PCC Control Center Setting Definitions        | Global / HBCentral policy registry                                             | `contract-derived-required` | [`lists/control-center-setting-definitions.md`](lists/control-center-setting-definitions.md)               |
| 112 | PCC Control Center Setting Policy Rules       | Global / HBCentral policy registry                                             | `contract-derived-required` | [`lists/control-center-setting-policy-rules.md`](lists/control-center-setting-policy-rules.md)             |
| 113 | PCC Control Center Setting Values             | Project site effective settings                                                | `contract-derived-required` | [`lists/control-center-setting-values.md`](lists/control-center-setting-values.md)                         |
| 114 | PCC Control Center Setting Overrides          | Project site approved overrides                                                | `contract-derived-required` | [`lists/control-center-setting-overrides.md`](lists/control-center-setting-overrides.md)                   |
| 115 | PCC Control Center Setting Change Requests    | Project site workflow records                                                  | `model-derived-required`    | [`lists/control-center-setting-change-requests.md`](lists/control-center-setting-change-requests.md)       |
| 116 | PCC Control Center Setting Validation Results | Project site validation records                                                | `model-derived-required`    | [`lists/control-center-setting-validation-results.md`](lists/control-center-setting-validation-results.md) |
| 117 | PCC Control Center Setting Audit Events       | Project site audit log                                                         | `model-derived-required`    | [`lists/control-center-setting-audit-events.md`](lists/control-center-setting-audit-events.md)             |
| 118 | PCC Control Center Setting Dependency Map     | Project site dependency graph cache                                            | `model-derived-required`    | [`lists/control-center-setting-dependency-map.md`](lists/control-center-setting-dependency-map.md)         |
| 119 | PCC Control Center Setting Health Snapshots   | Project site health/status snapshots                                           | `model-derived-required`    | [`lists/control-center-setting-health-snapshots.md`](lists/control-center-setting-health-snapshots.md)     |
