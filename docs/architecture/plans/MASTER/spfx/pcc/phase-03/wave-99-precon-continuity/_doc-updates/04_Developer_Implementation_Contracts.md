# 04 — Developer Implementation Contracts

## Non-Negotiable Contracts

1. Preconstruction Continuity is a unified lifecycle carry-forward layer, not a standalone route or departmental workspace.
2. Go / No-Go is not a standalone PCC MVP module.
3. Go / No-Go source decision records are immutable after final decision.
4. PCC owns the read-only carry-forward projection, Project Memory contribution, traceability edges, and display posture, not the upstream source decision workflow.
5. Estimating Kickoff remains later-phase and should become a structured Project Readiness / Preconstruction workflow module only through a future approved implementation sequence.
6. Source templates provide field inventory, seed taxonomy, scoring criteria, source references, and evidence; they are not target UI contracts.
7. All source-derived values require source lineage.
8. Sensitive committee, executive, pursuit, pricing, margin, strategy, and client comments require visibility classification.
9. Priority Actions are candidates only; they do not execute external changes.
10. Document Control owns evidence file binding; PCC workflow records store evidence links, lineage, and classifications.
11. No Procore/Sage/CRM/Unanet/Autodesk/BuildingConnected/Power Automate/Graph/SharePoint REST/PnP writeback exists in this package.
12. Handoff readiness is derived from explicit gates, evidence, and source-backed status, not free-text status alone.
13. Estimating Kickoff assignments are workflow responsibilities, not HR/staffing commitments.
14. HBI must use grounded citations or refusal and may not expose restricted content.
15. No future-reference knowledge may be shown cross-project without permission, security, and reuse posture.

## Required Alignment To Unified Lifecycle Developer Contracts

Every future implementation must align to:

| Contract | Preconstruction Continuity Requirement |
|---|---|
| Bounded Context And Ownership Map | distinguish source-owned BD/CRM/workbook records, PCC-native future workflow records, and PCC-derived memory/traceability records |
| Route Taxonomy And Forbidden Routes | prohibit standalone preconstruction/go-no-go/estimating shell routes unless future taxonomy changes |
| Record State Machines | use closed transition rules for pursuit carry-forward, kickoff, memory, traceability, HBI response, and audit events |
| Field-Level Data Dictionary | classify source lineage, evidence, visibility, mutability, HBI readability, and cross-project reuse |
| Permission Redaction Resolution Algorithm | apply full/summary-safe/masked/withheld/refusal/degraded behavior |
| HBI Retrieval Citation And Refusal Contract | citation required for answers; refusal for insufficient/restricted evidence |
| Source-System Integration Contracts | future-gated, backend-mediated, read-only integration posture |
| Audit Event Model | audit sensitive record view, HBI query, redaction, citation open, source link launch, memory validation |
| Error / Degraded State Matrix | standard loading/empty/stale/source-unavailable/permission-restricted behavior |
| Module Onboarding Template | Estimating Kickoff must complete template before implementation |
| Test Acceptance Gates | future code prompts must include model/backend/SPFx/security/guard tests |
| Live Integration Readiness Gates | no live integrations until tenant/security/legal/HBI gates pass |

## Required Read Models For Future Implementation

```ts
PccPreconstructionContinuitySummaryReadModel
PccPursuitDecisionCarryForwardReadModel
PccPursuitContextSnapshotReadModel
PccEstimatingKickoffReadModel
PccEstimatingKickoffDeliverableReadModel
PccPreconstructionReadinessSignalReadModel
PccPreconstructionPriorityActionCandidate
PccPreconstructionSourceLineage
PccPreconstructionVisibilityClassification
PccPreconstructionProjectMemoryContribution
PccPreconstructionTraceabilityEdge
PccPreconstructionHbiEvidenceDescriptor
PccPreconstructionAuditEvent
```

## Required State Machines

### PursuitDecisionCarryForward

```text
source-draft -> source-under-review -> source-final-go -> projected-to-pcc -> accepted-carry-forward -> superseded | archived
source-draft -> source-final-no-go -> archived-source-only
```

Rules:

- PCC projection requires final GO source record.
- Projection is immutable except supersession by source-backed replacement.
- NO-GO records are not projected to active project PCC unless future authorized archive/reference policy allows summary-safe use.

### EstimatingKickoffRecord

```text
not-started -> scheduled -> active -> handoff-ready -> handoff-accepted -> archived
scheduled -> cancelled
active -> blocked
blocked -> active | cancelled
handoff-ready -> returned-for-rework
returned-for-rework -> active
```

Rules:

- `handoff-ready` requires all critical deliverables assigned or waived with reason.
- `handoff-accepted` requires future approval/checkpoint seam, not this docs package.
- Assignments are workflow responsibilities only.

### PreconstructionTraceabilityEdge

```text
candidate -> probable -> verified -> superseded | archived
candidate -> rejected
```

Rules:

- `verified` requires evidence and source lineage.
- Cross-project reuse edges require classification and permission.

### PreconstructionProjectMemoryContribution

```text
candidate -> accepted -> validated -> superseded | archived
candidate -> rejected
accepted -> converted-to-action
```

Rules:

- Accepted memory requires source lineage or approved manual context.
- Restricted memory may be invisible to HBI and normal role lenses.

## Required Future Tests

- source-lineage required for every source-derived field;
- Go / No-Go immutable-field tests;
- visibility suppression tests for sensitive comments;
- kickoff deliverable state-transition tests;
- handoff-readiness gate tests;
- Project Memory contribution tests;
- traceability edge confidence/state tests;
- HBI citation/refusal tests;
- Priority Action reason-code and dedupe-key tests;
- source template mapping JSON validation;
- no external writeback tests;
- no direct SPFx-to-external-system tests;
- no workbook mutation tests;
- no staffing/legal/accounting guarantee tests;
- fixture safety tests;
- accessibility and responsive layout checks for future SPFx surfaces.

## Reference JSONs

- `reference/preconstruction_continuity_data_contract.json`
- `reference/gng_carry_forward_data_contract.json`
- `reference/estimating_kickoff_data_contract.json`
- `reference/preconstruction_visibility_matrix.json`
- `reference/preconstruction_state_machine.json`
- `reference/priority_action_reason_codes.json`
- `reference/source_template_field_map_requirements.json`
- `reference/fixture_scenarios.json`
- `reference/source_research_urls.json`
- `reference/source_template_extraction_snapshot.json`
