# 02 — Surface Card Inventory Matrix

## Objective

Provide the locked target inventory for every routed PCC surface. Local implementation must use this matrix as the source of truth.

## Global Rules

- Every routed ready surface must have exactly one Tier 1 command card.
- The Tier 1 command card must own `data-pcc-active-surface-panel`.
- Every card must declare `tier` and `region`.
- Cards that are loading/error/unavailable/restricted/missing-config as their primary purpose use `tier='state'`.
- Deferred seam cards use `tier='tier3'` and `region='deferred'`.
- Reference cards use `tier='tier3'` and `region='reference'`.
- Deep inspection cards use `region='detail'`.
- Persistent side-context/lens cards use `region='rail'` and footprint `rail` where suitable.

## Target Inventory

| Surface | Component | Target Title | Footprint | Tier | Region | Heading | Active Panel | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Project Home | PccProjectIntelligenceCard | Project Intelligence Header | hero | tier1 | command | h2 | yes | Route command card; owns project-home active panel. |
| Project Home | PccPriorityActionsCard | Priority Actions | wide | tier2 | operational | h3 | no | Primary operational queue. |
| Project Home | PccMissingConfigurationsCard | Missing Configurations | standard | state | state | h3 | no | Missing setup state card; if no missing items in future, may render tier3 reference state. |
| Project Home | PccSiteHealthSummaryCard | Site Health Summary | standard | tier2 | operational | h3 | no | Operational health summary. |
| Project Home | PccApprovalsCheckpointsCard | Approvals & Checkpoints | standard | tier2 | operational | h3 | no | Approval queue summary. |
| Project Home | PccProjectReadinessCard | Project Readiness | standard | tier2 | operational | h3 | no | Readiness summary. |
| Project Home | PccDocumentControlCard | Document Control Center | wide | tier2 | operational | h3 | no | Document lane summary; replace inline disabled buttons when touched. |
| Project Home | PccExternalSystemsCard | External Platforms | standard | tier3 | reference | h3 | no | External systems metadata summary. |
| Project Home | PccTeamSnapshotCard | Team Snapshot | rail | tier3 | rail | h3 | no | Persistent people/context rail on wide layouts; falls to standard column on phone. |
| Project Home | PccRecentActivityCard | Recent Activity | tall | tier3 | reference | h3 | no | Activity reference stream. |
| Project Home | PccProjectHomeProcoreSnapshotCard | Procore snapshot | standard | tier3 | deferred | h3 | no | Procore source seam; no live link. |
| Project Home | PccProjectHomeUnifiedLifecycleSection / Lifecycle Timeline | Lifecycle Timeline | detail | tier2 | detail | h3 | no | Lifecycle detail preview. |
| Project Home | PccProjectHomeUnifiedLifecycleSection / Project Memory | Project Memory | standard | tier3 | reference | h3 | no | Memory/reference. |
| Project Home | PccProjectHomeUnifiedLifecycleSection / Project Lens | Project Lens | rail | tier3 | rail | h3 | no | Lens context rail. |
| Project Home | PccProjectHomeUnifiedLifecycleSection / Related Records | Related Records | detail | tier3 | detail | h3 | no | Traceability detail reference. |
| Project Home | PccProjectHomeAskHbiSection | Ask HBI — Grounded Project Answers | detail | tier2 | detail | h3 | no | Grounded HBI preview/workbench; no auto mutation. |
| Team & Access | PccTeamAccessHeaderCard | Team & Access Center | full | tier1 | command | h2 | yes | Route command card; add explicit tier1. |
| Team & Access | PccTeamAccessLaneShell / restricted manager actions | Access manager actions | wide | state | state | h3 | no | Restricted state for non-manager personas. |
| Team & Access | PccTeamViewerLaneCard | Project Team Map | wide | tier2 | operational | h3 | no | Team map operational context. |
| Team & Access | PccPermissionRequestLaneCard | Request access | detail | tier2 | detail | h3 | no | Request workbench/deferred submission. |
| Team & Access | PccAccessManagerLaneCard | Assignment and approval | detail | tier2 | detail | h3 | no | Manager workbench; disabled execution retained. |
| Documents | PccDocumentsHeaderCard | HB Document Control Center | full | tier1 | command | h2 | yes | Route command card. |
| Documents | PccDocumentControlLaneCard / Project Record | Project Record | wide | tier2 | operational | h3 | no | Source-of-record lane; visually elevated but not tier1. |
| Documents | PccDocumentControlLaneCard / My Project Files | My Project Files | standard | tier2 | operational | h3 | no | Working-files lane. |
| Documents | PccDocumentControlLaneCard / External Systems | External Systems | standard | tier3 | deferred | h3 | no | External launch visibility only. |
| Documents | PccDocumentControlPermissionsCard | Permissions & Guardrails | detail | tier3 | detail | h3 | no | Governance/detail reference. |
| Documents | PccDocumentControlReviewsCard | Reviews & Approvals | detail | tier2 | detail | h3 | no | Review vocabulary + queue; operational detail. |
| Project Readiness | HeroCard | Project readiness | full | tier1 | command | h2 | yes | Route command card. |
| Project Readiness | Loading/Error hero variants | Project readiness | full | state | state | h2 | yes | State card may own active panel only when ready route is unavailable. |
| Project Readiness | BlockersCard | Blockers and exceptions | full | tier2 | operational | h3 | no | Critical readiness queue. |
| Project Readiness | LifecycleGateMapCard | Project lifecycle map | detail | tier2 | detail | h3 | no | Lifecycle detail map. |
| Project Readiness | DomainGridCard | Domain posture | full | tier2 | operational | h3 | no | Readiness posture grid. |
| Project Readiness | OwnershipAccountabilityCard | Ownership and accountability | wide | tier2 | operational | h3 | no | Ownership queue. |
| Project Readiness | PriorityActionsPreviewCard | Eligible for Priority Actions | wide | tier2 | operational | h3 | no | Priority eligibility. |
| Project Readiness | EvidenceSourceHealthCard | Evidence and source-health posture | detail | tier3 | detail | h3 | no | Evidence/source detail. |
| Project Readiness | DownstreamModulesCard | Downstream modules | standard | tier3 | reference | h3 | no | Reference integration posture. |
| Project Readiness | Permit/Inspection regions | Permit & Inspection Control Center | detail | tier2 | detail | h3 | no | Operational detail submodule. |
| Project Readiness | Responsibility Matrix regions | Responsibility Matrix | detail | tier2 | detail | h3 | no | Operational detail submodule. |
| Project Readiness | Constraints Log regions | Constraints Log | detail | tier2 | detail | h3 | no | Risk/exposure detail submodule. |
| Project Readiness | Buyout Log regions | Buyout Log | detail | tier2 | detail | h3 | no | Buyout control detail submodule. |
| Project Readiness | Procore source confidence | Procore source confidence | standard | tier3 | deferred | h3 | no | Source seam. |
| Approvals | HomeCard | Approvals home | full | tier1 | command | h2 | yes | Route command card. |
| Approvals | Loading/Error variants | Approvals & Checkpoints | full | state | state | h2 | yes | State command only during unavailable route. |
| Approvals | QueueCard | Approval queue | wide | tier2 | operational | h3 | no | Primary approval queue. |
| Approvals | MyApprovalsCard | My approvals | wide | tier2 | operational | h3 | no | User queue. |
| Approvals | EscalationCard | Escalation queue | wide | tier2 | operational | h3 | no | Escalation queue. |
| Approvals | AdminVerificationCard | Admin verification queue | wide | tier2 | operational | h3 | no | Admin queue. |
| Approvals | RegistryCard | Checkpoint registry | detail | tier3 | detail | h3 | no | Registry/detail reference. |
| Approvals | PolicyCard | Approval policy summary | standard | tier3 | reference | h3 | no | Policy reference. |
| Approvals | ModuleIntegrationCard | Source-module integration | standard | tier3 | reference | h3 | no | Module source reference. |
| Approvals | DecisionHistorySeamCard | Decision history | standard | tier3 | deferred | h3 | no | Deferred seam. |
| Approvals | LineageSeamCard | Evidence / lineage seam | standard | tier3 | deferred | h3 | no | Deferred seam. |
| Approvals | HbiBoundaryCard | HBI boundary | standard | tier3 | reference | h3 | no | HBI no-authority boundary. |
| External Systems | PccExternalSystemsLaunchPadHeaderCard | Launch Pad | full | tier1 | command | h2 | yes | Route command card. |
| External Systems | Loading/Error variants | Launch Pad | full | state | state | h2 | yes | State command only while unavailable. |
| External Systems | PccExternalSystemsLaunchPadSummaryCard | Launch summary | wide | tier2 | operational | h3 | no | Composite status summary. |
| External Systems | PccExternalSystemsProjectLinksCard | Project Launch Links | detail | tier2 | detail | h3 | no | Launch-pad workbench; inert launch. |
| External Systems | PccExternalSystemsReviewQueueCard | Custom Link Review Queue | detail | tier2 | detail | h3 | no | Review workbench. |
| External Systems | PccExternalSystemsMappingStatusCard | Mapping Status | wide | tier2 | operational | h3 | no | Mapping operations/status. |
| External Systems | PccExternalSystemsRegistryCard | Registry | standard | tier3 | reference | h3 | no | Registry reference. |
| External Systems | PccExternalSystemsSourceHealthCard | Source Health | standard | tier3 | reference | h3 | no | Source health reference. |
| External Systems | PccExternalSystemsAuditHistoryCard | Audit History | standard | tier3 | reference | h3 | no | Audit reference. |
| External Systems | PccExternalSystemsHbiLineageCard | HBI Lineage | standard | tier3 | reference | h3 | no | HBI/source lineage reference. |
| External Systems | PccExternalSystemsProcoreConfigurationStatusCard | Procore configuration status | standard | tier3 | deferred | h3 | no | Procore seam/reference. |
| Control Center Settings | Overview card | Control Center Settings | full | tier1 | command | h2 | yes | Route command card. |
| Control Center Settings | Scope lanes card | Project / Site / Persona / Integration Scope | detail | tier2 | detail | h3 | no | Settings workbench detail. |
| Control Center Settings | Missing setup card | Items needing setup | wide | state | state | h3 | no | Missing config state. |
| Site Health | PccSiteHealthOverviewCard | Site Health | full | tier1 | command | h2 | yes | Route command card. |
| Site Health | PccSiteHealthChecksCard | Site Health Checks | wide | tier2 | operational | h3 | no | Active health checks. |
| Site Health | PccSiteHealthDriftCard | Site drift | wide | tier2 | operational | h3 | no | Drift status. |
| Site Health | PccSiteHealthRepairRequestsCard | Repair Requests | wide | tier3 | deferred | h3 | no | Repair placeholder; no admin execution. |
| Site Health | PccSiteHealthProcoreSyncRepairCard | Procore sync & repair | standard | tier3 | deferred | h3 | no | Procore source seam; no repair execution. |

## Implementation Notes

- The matrix is intentionally explicit. Do not infer target tiers by looking at card width alone.
- If a component name has drifted, locate the current component by rendered title and route, then apply the same target contract.
- If a card is conditionally rendered by persona or read-model state, the target still applies when the card exists.
- Loading/error route cards may carry `data-pcc-active-surface-panel` as `tier='state'` only because the ready command card is not present.
