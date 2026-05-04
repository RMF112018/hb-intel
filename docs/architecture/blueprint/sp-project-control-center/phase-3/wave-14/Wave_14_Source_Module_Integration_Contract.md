# Wave 14 Source Module Integration Contract

## Integration Doctrine

Phase 14 overlays approval/checkpoint governance across PCC source modules while preserving source-module ownership of underlying workflow records.

## Ownership and Routing Contract

- Source modules own source records and module lifecycle behavior.
- Phase 14 owns checkpoint queue, routing-step semantics, decision semantics, audit-event semantics, and decision history.
- Integration preserves source lineage, stale-source posture, supersession lineage, and policy-version traceability.

## Source-Ownership Integration Matrix

| Source Module                      | Source Owner                           | Phase 14-Owned Checkpoint Semantics                                     | Checkpoint Trigger                                                                                                | Stale/Supersession Behavior                                                              | Priority Actions Behavior                                                          | Prohibited Writeback/Mutation                                                          |
| ---------------------------------- | -------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------- | ---------------------------- |
| Team & Access                      | Team & Access module                   | access/security queue + admin verification decision trail               | access request, permission template request, external-user request                                                | stale actor/role mapping blocks terminal decision; supersede on role template remap      | create pending-review actions; resolve on terminal/execution closure               | no tenant/group/Graph mutation from Phase 14                                           |
| Document Control                   | Document Control module                | evidence sufficiency and source-mapping checkpoint semantics            | document review exception, evidence freshness issue, mapping exception                                            | stale evidence requires revalidation; supersede when source artifact version changes     | dedupe by request/step; suppress duplicate queue visibility                        | no document/file content writeback                                                     |
| Project Lifecycle Readiness Center | Wave 9 lifecycle-readiness module      | readiness gate checkpoint and authority decision trail                  | startup/readiness/closeout/warranty gate prompt                                                                   | stale-source blocks gate approval; supersede when lifecycle item version changes         | create gate-blocker actions; resolve on approved/waived/overridden/deferred        | no duplicate readiness ownership                                                       |
| Permit & Inspection Control Center | Wave 10 permit/inspection module       | waiver/exception checkpoint semantics and audit trail                   | permit exception, inspection exception, AHJ-related review                                                        | stale permit/inspection source requires revalidation; supersede on source version change | create exception actions; escalate overdue gate reviews                            | no AHJ/system execution writeback                                                      |
| Responsibility Matrix              | Wave 11 responsibility module          | exception/escalation checkpoint semantics                               | owner exception, RACI dispute, authority clarification                                                            | stale assignment/state requires revalidation; supersede on matrix item revision          | create dispute/escalation actions; resolve on terminal decision                    | no legal obligation creation or external legal writeback                               |
| Constraints Log                    | Wave 12 constraints module             | deferral/waiver/override checkpoint semantics                           | constraint release review, delay/change exposure decision                                                         | stale source blocks terminal decision; supersede on constraint version change            | create blocker actions; resolve/suppress based on deferral/waiver/override outcome | no claims-engine or external-system writeback                                          |
| Buyout Log                         | Wave 13 buyout module                  | handoff/freeze checkpoint semantics                                     | buyout package review, commitment handoff, buyout seed checkpoint                                                 | stale buyout source blocks approval; supersede on package version changes                | create handoff actions; resolve at terminal or superseded state                    | no procurement execution writeback                                                     |
| Estimating Workbench / Wave 13G    | Wave 13G estimating feature authority  | queue/routing/decision semantics for checkpointed estimating prompts    | freeze, baseline, handoff, validation override, buyout seed, template-admin approval, cost-code mapping exception | stale estimate snapshot blocks decision; supersede on snapshot replacement               | create estimating checkpoint actions with strict dedupe by request/step/type       | no reassignment of estimating feature ownership; no pricing/award authority automation |
| External Systems                   | External Systems module + mapping refs | mapping-correction checkpoint semantics                                 | mapping correction request, launch/mapping issue review                                                           | stale mapping refs require revalidation; supersede on mapping model replacement          | create mapping correction actions; resolve after decision or manual close          | no Procore/Sage/DocCrunch/AdobeSign writeback                                          |
| Site Health                        | Site Health module                     | repair-request review and admin-verification semantics                  | drift finding repair request, admin verification queue item                                                       | stale finding state blocks closure; supersede on replaced finding                        | create execution-pending/admin review actions; resolve on manual close             | no automated repair mutation                                                           |
| Priority Actions                   | Priority Actions module (render owner) | checkpoint-to-action linking + dedupe contract                          | checkpoint enters pending-review, escalated, execution-pending, overdue, revision-requested                       | stale/superseded checkpoints suppress or resolve linked actions                          | deterministic dedupe `projectId                                                    | approvalRequestId                                                                      | currentStepId | actionType`; resolve on terminal/superseded/expired/manual-close | no source ownership transfer |
| Project Readiness (Rollup)         | Project Readiness rollup owner         | readiness impact reference semantics tied to checkpoint outcomes        | gate-affecting checkpoint transition                                                                              | stale source/evidence blocks gate unblock; supersession rebinds rollup reference         | create readiness blocker actions; resolve/unblock on valid terminal outcomes       | no duplicated readiness source ownership                                               |
| Executive Oversight                | Executive Oversight surface owner      | escalation checkpoint visibility and executive decision audit semantics | high-risk/high-cost/disputed escalation                                                                           | stale source requires revalidation before executive terminal action                      | create escalation actions; suppress duplicates if already in executive queue       | no source-system writeback                                                             |
| Admin Review Surfaces              | Admin review surface owner             | admin verification and technical-governance checkpoint semantics        | technical/admin verification prompts                                                                              | stale source blocks verification closure; supersede if source replaced                   | create admin verification actions; resolve on manual close/terminal state          | no tenant/security mutation execution by Phase 14                                      |

## Priority Actions Contract

### Create

Create/update a Priority Action when a checkpoint is `pending-review`, escalated, overdue, `execution-pending`, assigned to current role/user, or returned for revision.

### Dedupe

- One active action per `projectId|approvalRequestId|currentStepId|actionType`.
- One active escalation action per escalation context.
- Suppress duplicate actions when the same checkpoint is already visible in the relevant queue.

### Resolve/Suppress

Resolve or suppress linked Priority Actions on terminal state, superseded state, expired state, manual-close state, or when the referenced step is no longer current.

## Project Readiness Gate Behavior

A readiness gate cannot be approved when unresolved critical blockers, missing required evidence, stale source data, missing waiver/override reason, missing downstream target, or insufficient actor authority exists.

## Guardrails

- No Procore/Sage/Power Automate writeback.
- No tenant/list/group/security mutation.
- No runtime command execution authorized by this document.
- Source ownership remains with source modules.
