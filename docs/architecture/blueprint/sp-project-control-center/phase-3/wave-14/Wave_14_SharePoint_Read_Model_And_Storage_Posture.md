# Wave 14 SharePoint Read Model and Storage Posture

## Posture Lock

Phase 14 follows read-model-first, command-model-gated architecture.

- Read models are the active surface contract.
- Command models are future-gated until explicit backend authorization.
- No direct SPFx list mutation contract is introduced here.

## Read Models

Minimum read-model families:

- ApprovalQueueReadModel
- MyApprovalsReadModel
- ApprovalDetailReadModel
- CheckpointRegistryReadModel
- DecisionHistoryReadModel
- EscalationQueueReadModel
- AdminVerificationQueueReadModel
- ApprovalPolicyReadModel
- ApprovalAnalyticsReadModel

## Command-Model Gate

Future command families are documented but blocked for runtime execution in this prompt. Command intent must remain validation-gated by state, role, policy, stale/supersession posture, and evidence requirements.

## SharePoint Storage Candidates

Planned candidate lists:

- PCC Approval Requests
- PCC Approval Steps
- PCC Approval Participants
- PCC Approval Decisions
- PCC Checkpoint Definitions
- PCC Approval Policies
- PCC Checkpoint Evidence Links
- PCC Checkpoint Audit Events
- PCC Approval Comments
- PCC Approval Priority Action Links

No list creation is authorized by this document.

## Required Indexed Columns

- ProjectId
- ApprovalRequestId
- CheckpointInstanceId
- AssignedToPrincipalKey
- AssignedRole
- State
- DueDate
- Priority
- EscalationState
- SourceModule
- CheckpointFamily
- CurrentStepId
- CreatedUtc
- UpdatedUtc
- ArchivedFlag

## Query and Paging Contract

- Never fetch all approval records.
- Every queue read must page.
- Apply server-side filters before client-side shaping.
- Avoid first-order filters on large multi-person/lookup/managed-metadata columns.
- Denormalize display labels for efficient queue rendering.
- Archive terminal records out of active default views.

## Permission Strategy

No default item-level unique permission strategy is allowed for Phase 14 queue security.

Use:

- inherited storage permissions;
- backend read-model filtering;
- role/persona authorization checks;
- field-level redaction;
- audit logging for unauthorized attempts.

Item-level unique permissions are exceptional-case only under separate Document Control/tenant policy, not default queue posture.

## Concurrency and Integrity

Future command execution (when authorized) must include expected-state checks, source version checks, policy version checks, and idempotency semantics to avoid conflicting or stale decisions.

## Scope Guardrails

This document defines storage/query contracts only. It does not implement runtime UI, SPFx source files, TypeScript models, backend routes, SharePoint lists, package/dependency changes, tenant mutation, external-system writeback, deployment, or production rollout.
