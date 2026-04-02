# Prompt 05 — Checkpoint, Approval, and External Event Contract

## Objective

Define the generalized contract for pause/resume actions, human-interaction checkpoints, approvals, acknowledgments, and timeout-aware external-event handling.

This prompt exists because the future control plane must support both straight-through runs and checkpointed actions without inventing ad hoc pause semantics per workflow.

## Context efficiency rule

Do **not** re-read files still in active context unless they changed or you need a fresh edge-case check.

## Required repo-truth context

Use:
- the action catalog
- the run model
- the API contract catalog
- provisioning retry/escalation behavior only as compatibility context

## Scope of work

Define the contract model for:
- checkpoint creation
- checkpoint categories
- checkpoint state
- operator decision capture
- timeout / expiry
- escalation / acknowledgment
- resume / reject / cancel semantics
- external-event correlation and deduplication expectations

Model the difference between:
- seamless actions with no checkpoint,
- actions that pause for operator input,
- destructive actions requiring explicit warning + confirmation,
- and advisory actions that never mutate state.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-2/admin-control-plane-checkpoint-and-execution-modes.md`

Create or update shared types in:

- `packages/models/src/admin-control-plane/`

At minimum define:
- checkpoint interface
- checkpoint state enum/type
- checkpoint decision DTO
- approval / acknowledgment DTOs
- timeout / expiry fields
- resume-event / correlation fields

Export them through `@hbc/models`.

## Implementation requirements

- Design for at-least-once event delivery tolerance and operator-safe deduplication semantics.
- Make it explicit that provisioning remains normally seamless and does not inherit unnecessary pauses from this generalized model.
- Make checkpoint decision payloads auditable by design.
- Differentiate checkpoint metadata from broader audit/evidence records while keeping them linkable.

## Documentation requirements

The contract doc must include:
- checkpoint lifecycle,
- event/decision correlation rules,
- timeout and expiry behavior,
- dedupe expectations,
- examples for seamless vs checkpointed vs destructive flows.

## Validation requirements

- Verify shared type exports compile.
- Ensure the checkpoint model is compatible with the run/API contracts already created.
- Confirm no workflow-specific implementation has leaked into the generic model.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one coherent checkpoint/approval contract,
- the types are exported cleanly,
- and the model is safe for later durable-runtime implementation.

## No-go boundaries

- Do not implement actual event listeners or orchestration handlers.
- Do not wire UI modal logic beyond documentation or README notes.
