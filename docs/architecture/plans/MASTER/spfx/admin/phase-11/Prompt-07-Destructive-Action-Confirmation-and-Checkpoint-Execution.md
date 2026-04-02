# Prompt-07 — Destructive-Action Confirmation and Checkpoint Execution

## Objective

Implement the Phase 11 execution path for destructive or tenant-sensitive actions so they require explicit scoped confirmation and, where the doctrine requires it, checkpointed execution semantics.

## Important execution rules

- Follow the risk classification defined in Prompt-02.
- Use backend enforcement from Prompt-04.
- Use reusable UI patterns from Prompt-06.
- Keep provisioning’s straight-through behavior intact where the locked product doctrine requires it; do not retrofit needless pauses into normal provisioning flow.
- Apply checkpointing to the appropriate non-provisioning high-risk actions or to failure/retry/escalation actions where it improves safety.

## Scope of work

Implement the execution handshake for risky actions, including:
- pre-execution warning display,
- explicit confirmation payload,
- scope confirmation,
- backend validation of confirmation state,
- checkpoint state where required,
- truthful status reporting back to the operator.

If the repo already contains approval/acknowledgment or handoff primitives that can be reused safely, use them.
If not, implement the smallest correct Phase-11-specific seam and document why.

## Deliverables

1. Backend + frontend changes for destructive-action confirmation path
2. Supporting tests
3. Documentation:
   - `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-destructive-action-execution-model.md`

## Required behavior

For risky actions the operator must not be able to execute without:
- seeing the risk classification,
- seeing scope,
- seeing destructive/tenant-sensitive warnings,
- providing the required confirmation,
- and having the backend verify that the required safety steps were satisfied.

## Validation

Run the smallest meaningful checks for touched packages, likely including:
- `@hbc/functions`
- `@hbc/features-admin`
- `@hbc/spfx-admin`

## Completion condition

Stop after destructive-action execution rails, docs, tests, and validation are complete.
