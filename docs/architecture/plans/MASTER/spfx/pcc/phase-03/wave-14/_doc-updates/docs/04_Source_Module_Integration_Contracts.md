# Source Module Integration Contracts

## Integration Pattern

Phase 14 receives or derives checkpoint prompts from source modules. It records decision workflow and emits lineage-preserving events back to the source module. The source module remains the system of record for its workflow item.

## Event Contract

Phase 14 emits these normalized events:

- `checkpoint.requested`
- `checkpoint.queued`
- `checkpoint.reviewStarted`
- `checkpoint.revisionRequested`
- `checkpoint.approved`
- `checkpoint.rejectedReturned`
- `checkpoint.deferred`
- `checkpoint.waived`
- `checkpoint.overridden`
- `checkpoint.escalated`
- `checkpoint.cancelled`
- `checkpoint.superseded`
- `checkpoint.expired`
- `checkpoint.executionPending`
- `checkpoint.manuallyClosed`
- `checkpoint.archived`

## Source Module Matrix

| Source Module | Checkpoint Sources | Phase 14 Owns | Source Module Retains | Callback Effects |
| --- | --- | --- | --- | --- |
| Team & Access | access requests, permission template requests, external user requests | queue, route, decision, audit | roster, access request source, eventual access execution | execution-pending, admin verification, access approval state |
| Document Control | document review exception, evidence sufficiency, source mapping issue | review checkpoint and decision trail | file/document content and library storage | document review state, evidence link freshness |
| Project Lifecycle Readiness Center | startup/readiness/closeout/warranty gate decisions | gate checkpoint route and decision | lifecycle readiness item and checklist source | readiness gate posture and blocker rollup |
| Permit & Inspection Control Center | permit exception, inspection pass exception, AHJ issue review | approval/waiver/override route | permit/inspection source record | permit/inspection readiness signal |
| Responsibility Matrix | owner exception, RACI dispute, authority clarification | review/approval decision trail | responsibility item and matrix model | responsibility exception status |
| Constraints Log | constraint release, delay/change exposure review, deferral | approval/deferral/override route | constraint/risk/issue source record | constraint readiness impact |
| Buyout Log | buyout package review, commitment handoff, seed approval | handoff checkpoint and route | buyout item and procurement status | buyout readiness/handoff state |
| Estimating Workbench / Wave 13G | estimate freeze, handoff preview, cost-code exception, validation override | checkpoint queue semantics and decision trail | estimating workbook/workbench feature contracts | freeze/handoff approval state |
| External Systems | mapping correction and launch issue review | mapping correction checkpoint | external catalog and mapping source references | mapping review state |
| Site Health | repair request review, drift finding admin verification | admin verification and decision history | site-health finding and repair request intake | repair request review state |
| Priority Actions | approval/checkpoint action links | dedupe, state mapping, action lifecycle | priority action rail rendering | create/update/resolve/suppress |
| Project Readiness | readiness rollups and gate impacts | approval decision and readiness impact reference | readiness scoring/source rollup | gate blocked/unblocked posture |
| Executive Oversight | escalation reviews and high-risk approvals | escalation route and executive decision audit | executive dashboard/rollup | escalation state and executive trace |
| Admin Review Surfaces | technical/admin verification queues | admin checkpoint route and audit | admin control surface display | verification outcome |

## Priority Actions Integration

### Creation Rules

Create or update a Priority Action when:

- a checkpoint enters `pending-review`;
- a checkpoint is assigned to the current user/role;
- a checkpoint is overdue;
- a checkpoint is escalated;
- a checkpoint enters `execution-pending`;
- a source item is returned for revision.

### Deduplication Rules

- One active Priority Action per `approvalRequestId` and `currentStepId`.
- One active escalation Priority Action per `escalationId`.
- Suppress duplicate actions if the same checkpoint is already visible in the current user's `My Approvals` queue.
- Preserve historical links after resolution.
- Use deterministic dedupe key: `projectId|approvalRequestId|currentStepId|actionType`.

### Resolution Rules

Resolve linked Priority Actions when:

- checkpoint reaches terminal state;
- checkpoint is superseded;
- checkpoint expires;
- checkpoint is manually closed;
- assigned step is no longer current.

## Project Readiness Integration

Readiness must separate:

- completion;
- confidence;
- authority;
- exposure.

A readiness gate cannot be approved if:

- unresolved critical blockers remain;
- required evidence is missing;
- source data is stale;
- required waiver/override reason is missing;
- downstream target is missing;
- actor lacks authority.

Waivers/overrides can unblock a gate only when policy allows the specific actor and reason code.

## Wave 13G Estimating Workbench Integration

Wave 13G owns estimating feature architecture. Phase 14 owns approval/checkpoint queue semantics for the following source prompts:

| Estimating Source Prompt | Checkpoint Family | Required Evidence | Primary Decision Authority |
| --- | --- | --- | --- |
| Estimate snapshot review | Workflow Item Review | snapshot ID, version, variance summary | Lead Estimator / Chief Estimator |
| Estimate baseline freeze | Handoff / Freeze | frozen snapshot ID, inclusions/exclusions, approval context | Chief Estimator / Director of Preconstruction |
| Handoff review | Handoff / Freeze | handoff package, downstream target, risk notes | Project Executive / Director of Preconstruction |
| Validation override | Exception / Waiver / Override | failed validation, reason, mitigation | Chief Estimator / PCC Admin if technical |
| Buyout seed approval | Handoff / Freeze | approved estimate baseline, cost-code seed, scope map | Project Executive / Project Accountant |
| Template-admin approval | Technical / Admin | template change summary and affected projects | PCC Admin / Director of Preconstruction |
| Cost-code mapping exception | External-System Mapping Correction | source code, target code, exception reason | Project Accountant / Estimating Leadership |

HBI can summarize estimating context and cite source data. HBI cannot price, recommend award as authority, approve a freeze, approve a buyout seed, waive validation, or override cost-code mapping.

## Site Health and Admin Verification

Site Health repair request review must produce `execution-pending`, not automated repair. Admin/IT/integration roles must verify and close with evidence.

## External System Mapping

External mapping correction checkpoints must record PCC mapping decision context but cannot write to Procore, Sage, Document Crunch, Adobe Sign, or any external system.
