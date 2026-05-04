# Exhaustive Target Architecture — Phase 14 Approvals / Checkpoints

## Product Definition

**Approvals / Checkpoints** is a PCC-native module that coordinates review, decision, acknowledgement, waiver/override by reason, escalation, and gate control across PCC modules. It gives each user a governed queue of decision prompts while preserving module ownership of the underlying source records.

## User-Facing Name

`Approvals / Checkpoints`

## Surface and Work Center

| Attribute                         | Locked Decision                                              |
| --------------------------------- | ------------------------------------------------------------ |
| Phase / Wave                      | Phase 14 / Wave 14                                           |
| PCC MVP surface                   | `approvals`                                                  |
| Primary work center affinity      | `action-center`                                              |
| Architecture posture              | SharePoint/SPFx-first, read-model-first, command-model-gated |
| Runtime posture                   | Fixture/mock/read-model-first before live mutation           |
| External writeback                | Blocked                                                      |
| Power Automate runtime dependency | Blocked for MVP                                              |
| HBI authority                     | None                                                         |

## Architecture Thesis

Phase 14 is a **control-plane module over source-module workflow records**. It owns the approval/checkpoint record, route, step, decision, audit event, queue view, and decision history. It does not own the underlying workflow record unless that record is itself a PCC-native approval/checkpoint record.

## Source-of-Record Boundaries

| Record Family                                 | Owner                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| `ApprovalRequest`                             | PCC Phase 14                                                                |
| `ApprovalPolicy`                              | PCC Phase 14                                                                |
| `ApprovalRoute` / `ApprovalStep`              | PCC Phase 14                                                                |
| `ApprovalParticipant`                         | PCC Phase 14                                                                |
| `ApprovalDecision`                            | PCC Phase 14                                                                |
| `CheckpointDefinition` / `CheckpointInstance` | PCC Phase 14                                                                |
| `CheckpointEvidenceLink`                      | PCC Phase 14 reference record; linked evidence content remains source-owned |
| `CheckpointSourceReference`                   | PCC Phase 14 reference record; source item remains source-module owned      |
| `CheckpointAuditEvent`                        | PCC Phase 14                                                                |
| Underlying readiness item                     | Owning readiness module                                                     |
| Underlying buyout item                        | Buyout Log                                                                  |
| Underlying estimating snapshot                | Wave 13G Estimating Workbench                                               |
| Procore-native objects                        | Procore                                                                     |
| Sage accounting fields                        | Sage                                                                        |
| SharePoint documents/files                    | SharePoint/Document Control                                                 |
| HBI summary/citation records                  | HBI grounding layer, no decision authority                                  |

## Core Capabilities

1. Queue assigned approvals/checkpoints by user, role, project, source module, priority, due date, and escalation state.
2. Show source context and evidence without duplicating ownership.
3. Enforce role/action permission rules.
4. Support single, sequential, parallel-all, parallel-any, advisory, acknowledgement, escalation, and admin-verification routing.
5. Record decisions with required reason/evidence/comment fields.
6. Publish decision outcomes back to source modules through lineage-preserving events.
7. Create/update/resolve Priority Actions.
8. Feed Project Readiness gate posture.
9. Support Wave 13G estimating freeze/handoff checkpoints.
10. Preserve business audit and security/compliance audit separation.
11. Keep HBI in citation/summarization mode only.
12. Operate safely under SharePoint list scale, accessibility, and permission constraints.

## Checkpoint Families

| Family                              | Description                                             | Examples                                                                        | Required Special Handling                                  |
| ----------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Access / Security Approval          | Reviews project/site access and permission requests     | access request, external user request, permission template                      | security-sensitive redaction; IT execution-pending handoff |
| Workflow Item Review                | Reviews module-owned workflow items                     | readiness item, permit, responsibility exception, constraint, buyout item       | source module callback                                     |
| Readiness Gate Checkpoint           | Controls phase/stage readiness gates                    | startup, preconstruction, construction readiness, closeout, warranty transition | blocker-first; evidence/freshness validation               |
| Handoff / Freeze Checkpoint         | Freezes or hands off a package/snapshot                 | estimate freeze, buyout package handoff, budget seed                            | snapshot/version immutability                              |
| Exception / Waiver / Override       | Allows controlled exception handling                    | validation override, readiness deferral, permit exception                       | reason, evidence, elevated authority                       |
| External-System Mapping Correction  | Reviews mapping issues                                  | Procore/Sage/Document Control mapping                                           | no external writeback; mapping authority only              |
| Site Health / Repair Request Review | Reviews health findings/repair requests                 | drift finding, repair intake                                                    | admin verification; no automated repair                    |
| Executive Escalation                | Elevates high-risk/high-cost/high-sensitivity decisions | executive override, high-impact readiness exception                             | leadership visibility and redaction                        |
| Technical / Admin Checkpoint        | Technical governance review                             | integration exception, package guard, schema exception                          | PCC Admin / IT / Integration Admin authority               |
| Estimating Workbench Checkpoint     | Wave 13G estimating controls                            | estimate baseline freeze, handoff preview, cost-code exception                  | Wave 13G feature authority plus Phase 14 queue semantics   |

## Approval Modes

| Mode                   | Completion Rule                                                       | Primary Use                                               |
| ---------------------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| `single-approver`      | One authorized approver terminal decision resolves the step           | PM/PE decision                                            |
| `sequential`           | Steps open in order; each required step must resolve                  | estimate freeze → leadership approval → handoff           |
| `parallel-all`         | All required approvers must decide; policy defines rejection behavior | readiness gate requiring operations + accounting + safety |
| `parallel-any`         | First authorized terminal decision resolves step                      | admin verification pool                                   |
| `advisory-review`      | Collect comments/recommendations; cannot approve or waive             | bid leveling review                                       |
| `acknowledgement-only` | Confirms awareness; not approval authority                            | handoff acknowledgement                                   |
| `escalation-review`    | Executive/admin escalation lane                                       | overdue/high-risk decisions                               |
| `admin-verification`   | Technical/governance verification before execution or closure         | site health, access, mappings                             |

## Read Model / Command Model Boundary

### Read Models

- `ApprovalQueueReadModel`
- `MyApprovalsReadModel`
- `ApprovalDetailReadModel`
- `CheckpointRegistryReadModel`
- `DecisionHistoryReadModel`
- `EscalationQueueReadModel`
- `AdminVerificationQueueReadModel`
- `ApprovalPolicyReadModel`
- `ApprovalAnalyticsReadModel`

### Command Models

Command models are documented for future implementation but blocked from MVP runtime execution unless a later prompt authorizes backend command routes.

- `SubmitApprovalDecisionCommand`
- `RequestRevisionCommand`
- `DeferCheckpointCommand`
- `WaiveCheckpointCommand`
- `OverrideCheckpointCommand`
- `EscalateCheckpointCommand`
- `CancelCheckpointCommand`
- `SupersedeCheckpointCommand`
- `ManualCloseCheckpointCommand`
- `AcknowledgeCheckpointCommand`
- `AdminVerifyCheckpointCommand`

### Boundary Rule

SPFx may render read models and collect user intent. Actual decision mutation must eventually pass through a backend command boundary that validates state, role, route mode, required fields, source freshness, evidence, and guardrails. Direct SPFx-to-list decision mutation is blocked for MVP.

## Implementation Sequencing

1. Documentation authority and cross-reference update.
2. Shared model contracts and fixtures.
3. State-machine transition validator.
4. Read-model contracts and mock provider.
5. SPFx queue/detail/read-only UX.
6. Guardrail tests and accessibility coverage.
7. Command model design but no write execution.
8. Future gated backend command implementation.
9. Future controlled non-production tenant validation.
10. Future production rollout approval.

## Guardrails

- No direct SPFx-to-Procore.
- No Procore writeback.
- No Sage writeback.
- No Power Automate runtime dependency.
- No tenant mutation.
- No package/lockfile mutation.
- No HBI decision authority.
- No item-level unique permission strategy by default.
- No automated approval based on HBI output.
- No source record ownership transfer from source modules to Phase 14.
