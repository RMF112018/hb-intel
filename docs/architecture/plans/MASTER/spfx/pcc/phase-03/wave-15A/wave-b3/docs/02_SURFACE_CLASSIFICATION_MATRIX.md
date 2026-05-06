# 02 — Surface Classification Matrix

## Objective

Define the target classification for all current PCC route surfaces and embedded card regions.

The agent must verify actual current files with `rg "<PccDashboardCard" apps/project-control-center/src` and apply these rules to every card element found.

## Global Classification Rules

| Card Type | Tier | Region | Notes |
|---|---|---|---|
| Ready route command card | `tier1` | `command` | Must carry `dataActiveSurfacePanel` and `headingLevel={2}`. |
| Loading route card | `state` | `state` | Must carry the active-panel marker if it replaces route command content. |
| Error route card | `state` | `state` | Must carry the active-panel marker if it replaces route command content. |
| Missing setup card | `state` | `state` | Must use honest state copy. |
| Restricted/unauthorized card | `state` | `state` | Must not look like operational content. |
| Operational queue/list/workbench | `tier2` | `operational` | Active work-support content. |
| Dense record/detail panel | `tier2` | `detail` | Use for inspection-heavy content. |
| Reference/policy/source info | `tier3` | `reference` | Supporting context only. |
| Deferred seam/future placeholder | `tier3` or `state` | `deferred` | Must never default to operational. |
| Compact side context | `tier3` | `rail` | Use with `footprint="rail"` where applicable. |

## Project Home

Primary files:

- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx`
- all other `apps/project-control-center/src/surfaces/projectHome/*.tsx`

Target mapping:

| Component Pattern | Target |
|---|---|
| Project Intelligence Header | `footprint="hero"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, active panel `project-home`. |
| Priority Actions | `footprint="wide"`, `tier="tier2"`, `region="operational"`. |
| Missing Configurations | `footprint="standard"`, `tier="state"`, `region="state"`. |
| Site Health Summary | `tier="tier2"`, `region="operational"` unless display-only summary becomes `reference`. |
| Approvals & Checkpoints | `tier="tier2"`, `region="operational"`. |
| Project Readiness | `tier="tier2"`, `region="operational"` or `detail` if dense. |
| Document Control Center | `tier="tier2"`, `region="operational"` for active document posture. |
| External Platforms | `tier="tier3"`, `region="reference"` or `deferred` depending on launch behavior. |
| Team Snapshot | `tier="tier3"`, `region="reference"` or `rail`. |
| Recent Activity | `tier="tier3"`, `region="reference"` or `detail`. |
| Unified Lifecycle Timeline | `tier="tier2"`, `region="detail"`. |
| Project Memory | `tier="tier3"`, `region="reference"` or `detail`. |
| Project Lens | `tier="tier3"`, `region="reference"` or `rail`. |
| Related Records | `tier="tier3"`, `region="reference"`. |
| Ask HBI | `tier="tier2"`, `region="detail"` while it has meaningful detail UX; idle state content may be `state`. |
| Procore Snapshot | `tier="tier3"`, `region="reference"` unless it contains active operational warnings. |

Do not change read-model cardinality: fixture path remains 10 cards; read-model path remains the current expected count unless existing code has changed.

## Team & Access

Primary files:

- `PccTeamAccessHeaderCard.tsx`
- `PccTeamAccessLaneShell.tsx`
- `PccTeamViewerLaneCard.tsx`
- `PccPermissionRequestLaneCard.tsx`
- `PccAccessManagerLaneCard.tsx`

Target mapping:

| Component Pattern | Target |
|---|---|
| Team & Access Center header | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, active panel `team-and-access`. |
| Restricted access-manager actions | `footprint="wide"`, `tier="state"`, `region="state"`. |
| Team Viewer Lane / Project Team Map | `footprint="wide"`, `tier="tier2"`, `region="operational"`. |
| Permission Request lane | `tier="tier2"`, `region="operational"`. |
| Access Manager lane | `tier="tier2"`, `region="operational"` if it is active manager workflow; `state` if restricted/unavailable. |

## Documents

Primary files:

- `PccDocumentsHeaderCard.tsx`
- `PccDocumentControlLaneCard.tsx`
- `PccDocumentControlPermissionsCard.tsx`
- `PccDocumentControlReviewsCard.tsx`

Target mapping:

| Component Pattern | Target |
|---|---|
| HB Document Control Center header | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, active panel `documents`. |
| Project Record lane | `footprint="wide"`, `tier="tier2"`, `region="operational"`. |
| My Project Files lane | `footprint="standard"`, `tier="tier2"`, `region="operational"`. |
| External Systems lane | `footprint="standard"`, `tier="tier3"`, `region="deferred"`. |
| Permissions card | `tier="tier3"`, `region="reference"` unless it is an active review queue. |
| Reviews card | `tier="tier2"`, `region="operational"` if pending review content is meaningful; otherwise `tier3/reference` or `state`. |

## Project Readiness

Primary files:

- `PccProjectReadinessSurface.tsx`
- `PccProjectReadinessUnifiedLifecycleSection.tsx`
- `PccPermitInspectionControlCenterRegions.tsx`
- embedded responsibility/constraints/buyout region files

Target mapping:

| Component Pattern | Target |
|---|---|
| Ready readiness hero | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, active panel `project-readiness`. |
| Loading/error readiness hero | `footprint="full"`, `tier="state"`, `region="state"`, active panel `project-readiness`. |
| Lifecycle gate map | `tier="tier2"`, `region="detail"` or `operational`. |
| Blockers and exceptions | `tier="tier2"`, `region="operational"`; do not preserve Tier 1 unless product strategy explicitly makes blockers the route command. |
| Domain posture | `tier="tier2"`, `region="detail"`. |
| Ownership/accountability | `tier="tier2"`, `region="operational"`. |
| Priority Actions eligibility | `tier="tier2"`, `region="operational"`. |
| Evidence/source health | `tier="tier2"` or `tier3`, `region="detail"` or `reference` depending on density. |
| Downstream modules | `tier="tier3"`, `region="reference"`. |
| Procore source confidence | `tier="tier3"`, `region="reference"` or `state` if degraded. |
| Permit & Inspection active regions | `tier="tier2"`, `region="operational"` or `detail`. |
| Responsibility Matrix operational regions | `tier="tier2"`, `region="detail"` or `operational`. |
| Constraints Log operational regions | `tier="tier2"`, `region="operational"` or `detail`. |
| Buyout Log operational regions | `tier="tier2"`, `region="operational"` or `detail`. |
| Any placeholder/deferred seam | `tier="tier3"` or `state`, `region="deferred"`. |

## Approvals

Primary file:

- `PccApprovalsSurface.tsx`

Target mapping:

| Component Pattern | Target |
|---|---|
| Loading/error route card | `footprint="full"`, `tier="state"`, `region="state"`, active panel `approvals`. |
| Approvals home | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, active panel `approvals`. |
| Approval queue | `footprint="wide"`, `tier="tier2"`, `region="operational"`. |
| My approvals | `footprint="wide"`, `tier="tier2"`, `region="operational"`. |
| Registry | `tier="tier2"`, `region="detail"` if used for active checkpoint inspection; otherwise `tier3/reference`. |
| Escalation queue | `tier="tier2"`, `region="operational"`. |
| Admin verification queue | `tier="tier2"`, `region="operational"`. |
| Approval policy summary | `tier="tier3"`, `region="reference"`. |
| Source-module integration | `tier="tier3"`, `region="reference"`. |
| Decision history seam | `tier="tier3"`, `region="deferred"`. |
| Lineage seam | `tier="tier3"`, `region="deferred"`. |
| HBI boundary | `tier="tier3"`, `region="reference"`. |

## External Platforms

Primary files:

- `PccExternalSystemsSurface.tsx`
- `PccExternalSystemsLaunchPadHeaderCard.tsx`
- all `PccExternalSystems*Card.tsx`

Target mapping:

| Component Pattern | Target |
|---|---|
| Loading/error route card | `footprint="full"`, `tier="state"`, `region="state"`, active panel `external-systems`. |
| Launch Pad header | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, active panel `external-systems`. |
| Launch Pad summary | `tier="tier2"`, `region="operational"` or `detail`. |
| Project launch links | `tier="tier2"`, `region="operational"` if reviewing current links; `deferred` only for disabled/future behavior. |
| Custom link review queue | `tier="tier2"`, `region="operational"`. |
| Procore configuration/status | `tier="tier3"`, `region="reference"` or `state` if repair/setup issue. |
| Registry | `tier="tier3"`, `region="reference"`. |
| Mapping status | `tier="tier2"`, `region="detail"` if current mapping workbench; otherwise `tier3/reference`. |
| Source health | `tier="tier3"`, `region="reference"` or `state` if degraded. |
| Audit history | `tier="tier3"`, `region="reference"`. |
| HBI lineage | `tier="tier3"`, `region="reference"`. |

## Control Center Settings

Primary file:

- `PccControlCenterSettingsSurface.tsx`

Target mapping:

| Component Pattern | Target |
|---|---|
| Settings header | already correct: `tier1/command`, active panel `control-center-settings`. |
| Settings lanes | `tier2/detail`. |
| Items needing setup | `state/state`. |

Verify through tests.

## Site Health

Primary files:

- `PccSiteHealthOverviewCard.tsx`
- `PccSiteHealthChecksCard.tsx`
- `PccSiteHealthDriftCard.tsx`
- `PccSiteHealthRepairRequestsCard.tsx`
- `PccSiteHealthProcoreSyncRepairCard.tsx`

Target mapping:

| Component Pattern | Target |
|---|---|
| Site Health overview | already correct: `tier1/command`, active panel `site-health`. |
| Checks | `tier2/operational`. |
| Drift Indicators | `tier2/detail` or `tier2/operational`. |
| Repair Requests | `state/state` if placeholder; `tier2/operational` only if meaningful workflow exists. |
| Procore Sync / Repair | `tier3/reference`, `state/state`, or `deferred` depending on current behavior. Do not default operational unless active. |

## Acceptance Criteria

For every rendered route:

- no `[data-pcc-card-tier-source="default"]`;
- no `[data-pcc-card-region-source="resolved"]` unless an explicit exception is documented and tested;
- exactly one `[data-pcc-active-surface-panel]`;
- active panel carrier is either `tier1/command` or `state/state`;
- no deferred/reference/state content resolves as operational by default.
