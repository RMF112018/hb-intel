# Wave 14 Required Fields, Statuses, and Contracts

## Required Primary Records

- `ApprovalRequest`
- `ApprovalPolicy`
- `ApprovalPolicyVersion`
- `ApprovalRoute`
- `ApprovalStep`
- `ApprovalParticipant`
- `ApprovalDecision`
- `CheckpointDefinition`
- `CheckpointInstance`
- `CheckpointEvidenceLink`
- `CheckpointSourceReference`
- `CheckpointAuditEvent`
- `ApprovalPriorityActionLink`

## Required States

`draft`, `requested`, `pending-review`, `in-review`, `revision-requested`, `approved`, `rejected-returned`, `deferred`, `waived`, `overridden`, `escalated`, `cancelled`, `superseded`, `expired`, `execution-pending`, `manually-closed`, `archived`

## Terminal States

`approved`, `rejected-returned`, `deferred`, `waived`, `overridden`, `cancelled`, `superseded`, `expired`, `manually-closed`, `archived`

## Required Approval Modes

- `single-approver`
- `sequential`
- `parallel-all`
- `parallel-any`
- `advisory-review`
- `acknowledgement-only`
- `escalation-review`
- `admin-verification`

## Required Decision Actions

- `approve`
- `reject-return`
- `request-revision`
- `acknowledge`
- `defer`
- `waive-with-reason`
- `override-with-reason`
- `escalate`
- `cancel`
- `supersede`
- `manual-close`

## Required Validation Rules

- actor must be authenticated;
- actor role/persona must be authorized for action;
- state transition must be legal;
- route-mode completion rule must pass;
- required fields must be present;
- reason code must belong to action family;
- evidence requirements must be satisfied;
- stale source must block terminal decision;
- supersession must preserve lineage;
- HBI cannot be actor;
- no external writeback may be generated;
- no tenant mutation may be generated.

## Required Read Model Families

- `ApprovalQueueReadModel`
- `MyApprovalsReadModel`
- `ApprovalDetailReadModel`
- `CheckpointRegistryReadModel`
- `DecisionHistoryReadModel`
- `EscalationQueueReadModel`
- `AdminVerificationQueueReadModel`
- `ApprovalPolicyReadModel`
- `ApprovalAnalyticsReadModel`

## Required UX Screens

1. Approvals Home
2. My Approvals
3. Approval Detail
4. Checkpoint Registry
5. Decision History
6. Escalation Queue
7. Admin Verification Queue
8. Module Integration Panels

## Required Priority Actions Rules

- create/update when checkpoint is `pending-review`, escalated, overdue, `execution-pending`, assigned to current role/user, or returned for revision;
- dedupe active actions by `projectId|approvalRequestId|currentStepId|actionType`;
- resolve/suppress on terminal, superseded, expired, manually-closed, or no-longer-current step.
