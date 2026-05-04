# Estimating Kickoff Target Architecture

## Purpose

Estimating Kickoff converts preconstruction kickoff workbook content into a future PCC-native Project Readiness / Preconstruction workflow module. It structures deliverables, responsibilities, dates, evidence, assumptions, and handoff readiness while preserving source lineage and permission rules.

## Current Posture

Estimating Kickoff remains later-phase. This documentation package does not implement runtime behavior, shell routes, backend routes, SPFx components, model contracts, package changes, or live integrations.

## Unified Lifecycle Alignment

| Lifecycle Contract | Estimating Kickoff Behavior |
|---|---|
| Lifecycle Spine | kickoff scheduled, active, blocked, handoff-ready, accepted events |
| Project Readiness | deliverables, owners, due dates, evidence, blockers, assumption validation |
| Project Memory | kickoff summary, critical assumptions, handoff context, durable decisions |
| Traceability | source workbook rows → deliverables → readiness signals → handoff → operations outcomes |
| Priority Actions | missing owner, overdue deliverable, missing evidence, blocked deliverable, handoff gap |
| HBI | answers only with citations; refuses if deliverables/evidence are restricted or insufficient |
| Audit | assignment changed, evidence linked, status changed, HBI query, citation opened |

## Target UX

- Preconstruction Kickoff Command Center.
- Kickoff Record Detail.
- Deliverables and Assignments Table.
- Key Dates / Bid Calendar Panel.
- Marketing / Proposal / IDS / Estimating / Financial / Schedule / Logistics panels.
- Handoff Readiness Panel.
- Assumption Validation Panel.
- Evidence and Source Lineage Panel.
- Project Memory Contribution Panel.
- Audit History Panel.

## State Machine

```text
not-started -> scheduled -> active -> handoff-ready -> handoff-accepted -> archived
scheduled -> cancelled
active -> blocked
blocked -> active | cancelled
handoff-ready -> returned-for-rework
returned-for-rework -> active
```

## Handoff Readiness Gates

A kickoff record may become `handoff-ready` only when:

- all critical deliverables are complete or waived;
- all critical owners are assigned;
- bid/calendar dates are recorded or waived;
- required evidence links exist or waiver reasons are documented;
- restricted assumptions are classified;
- source-lineage requirements are met;
- unresolved blockers are either closed or explicitly accepted;
- handoff summary exists.

`handoff-accepted` requires a future Approvals / Checkpoints seam and is not implemented by this documentation package.

## Required Deliverable Fields

- `deliverableId`
- `kickoffId`
- `discipline`
- `title`
- `description`
- `sourceTemplateRef`
- `owner`
- `dueDate`
- `status`
- `criticality`
- `evidenceRequirement`
- `evidenceLinks`
- `waiverReason`
- `sourceLineage`
- `readinessImpact`
- `priorityActionReason`
- `projectMemoryContribution`
- `traceabilityEdgeCandidate`
- `hbiEligibility`
- `securityClassification`
- `auditEvents`

## Forbidden Behaviors

- treating assignments as HR/staffing commitments;
- automatic creation of operational responsibilities in Responsibility Matrix without acceptance;
- evidence-binary ownership;
- approval/checkpoint execution;
- external-system writeback;
- legal/accounting determinations;
- source workbook mutation;
- standalone shell route.
