# 04 — Source Module Integration Contracts

## Integration Rule

Site Health consumes and summarizes module-owned signals. It does not duplicate module authority, create writebacks, or bypass the source module's governance.

## Module Integration Matrix

| Source Module | Site Health Contract |
|---|---|
| Project Home | Consumes aggregate health summary and top blocker cards; never owns Site Health findings. |
| Project Readiness | Consumes provisioning/template readiness blockers and unresolved critical findings. |
| Team & Access | Supplies role/access posture; Site Health displays and redacts, never mutates permissions. |
| Document Control | Supplies library posture and document-control dependency status; Site Health does not move/open/copy files. |
| Permit & Inspection Control Center | Supplies permitting/inspection dependency readiness signals; no AHJ writeback. |
| Responsibility Matrix | Supplies accountable owner references for health checks and findings. |
| Constraints Log | May receive derived constraints from critical unresolved health findings only through governed handoff. |
| Buyout Log | May surface procurement/configuration dependency health where project setup affects buyout readiness. |
| Estimating Workbench / Wave 13G | Supplies preconstruction workspace setup readiness and project transition dependencies. |
| Approvals / Checkpoints / Wave 14 | Owns governed approval/checkpoint workflow for repair requests and exceptions. |
| External Systems Launch Pad / Wave 15 | Owns registry, mappings, source-health snapshots, and external audit events consumed by Site Health. |
| Control Center Settings / Wave 16 | Owns settings definitions, values, validation results, change requests, and settings health snapshots. |
| Priority Actions | Displays derived health action candidates; does not own health check authority. |
| Unified Search / HBI | Indexes health evidence and provides grounded explanation, with no mutation authority. |
| Executive Oversight | Consumes portfolio/site risk summaries only; sensitive details redacted. |
| Admin Review Surfaces | May verify technical evidence; no tenant mutation unless a later explicit command package authorizes. |
| Project Memory | Stores narrative traceability and durable finding summaries where approved. |
| Cross-Stage Traceability | Links setup, readiness, external systems, settings, and closeout dependencies. |
| Standard Project Site Template Contract | Primary desired-state authority for project site template compliance. |
| HB Central configuration and project records | Global project/configuration authority; Site Health consumes references and check definitions. |

## Handoff Object: Priority Action Candidate

Required fields:

- `candidateId`
- `projectId`
- `findingId`
- `category`
- `severity`
- `recommendedOwnerPersona`
- `title`
- `summary`
- `dueDatePolicy`
- `sourceEvidenceIds`
- `disabledReason`
- `originatingModule`

## Handoff Object: Wave 14 Checkpoint Candidate

Required fields:

- `checkpointCandidateId`
- `projectId`
- `findingId`
- `checkpointType`
- `approvalReason`
- `evidenceBundleId`
- `requestedByPersona`
- `requiresAdminVerification`
- `blockedReason`
- `noMutationAttestation`

## Integration Rules by Dependency

### Wave 14

Wave 17 may create or document candidates for approval/checkpoint handling. Wave 17 does not approve, reject, execute, or mutate.

### Wave 15

Wave 17 references external-system health snapshots by ID and displays derived source-health findings. It must not duplicate the registry or create external-system mappings.

### Wave 16

Wave 17 references control-center setting health snapshots and validation results. It must not write settings, create setting overrides, or approve setting change requests.

### Team & Access

Wave 17 may show permission posture and team/access alignment, but raw group membership and user identities must follow persona redaction rules.

### Document Control

Wave 17 may show library compliance, missing library findings, storage posture, and threshold/index risks. It does not upload, move, delete, approve, or modify documents.

## Conflict Resolution

If two modules report the same issue:
1. Keep the source module as authority.
2. Site Health creates one normalized finding.
3. Evidence references link to every relevant source.
4. Priority Action candidates deduplicate by `projectId + category + normalizedObjectKey`.
5. HBI explains the aggregation and cites evidence.
