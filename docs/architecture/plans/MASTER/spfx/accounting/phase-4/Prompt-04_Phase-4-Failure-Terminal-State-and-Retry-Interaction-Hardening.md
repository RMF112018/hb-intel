# Prompt-04 — Phase 4 Failure, Terminal State, and Retry Interaction Hardening

## Objective

Make failure, terminal state, retry, escalation, archive, acknowledgment, timer-follow-on, and override interactions coherent across the provisioning status model, request lifecycle, and operator surfaces.

Use the earlier Phase 4 findings and contract outputs.

## Working Rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, minimal edits unless broader restructuring is required by the prompt.
- Preserve package and app boundaries unless the prompt explicitly directs otherwise.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently change business semantics established in earlier phases. If you detect a contradiction, document it and resolve it deliberately.

## Implementation Goals

Using the earlier Phase 4 findings, harden the system so that:

- failure states are explicit and non-ambiguous
- terminal states are deterministic
- retry behavior does not create contradictory run or status state
- timer Step 5 follow-on behavior remains coherent
- escalation markers are compatible with the durable status model
- archive and acknowledgment behavior are deliberate and documented
- manual override behavior is deliberate and documented
- request lifecycle and provisioning status do not drift apart after failure, completion, retry, archive, or override

## Required Work

Review and harden, as applicable:

- failure-state semantics
- completed / base-complete / web-parts-pending / deferred-follow-on semantics
- retry and new-correlation run behavior
- escalation marker behavior
- archive behavior
- escalation acknowledgment behavior
- force-state override behavior
- timer Step 5 terminal behavior
- request reconciliation after each mutation path
- related docs and runbook material

## Required Files and Areas

- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/timerFullSpec/handler.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- related provisioning docs and maintenance/runbook docs

## Deliverables

1. Implement the required code changes.
2. Update the relevant docs and runbooks.
3. Write an implementation report at:

`docs/architecture/reviews/phase-4-failure-terminal-and-retry-interaction-report.md`

## Verification

Provide evidence for:

- failure transition behavior
- retry behavior
- escalation behavior
- archive behavior
- acknowledgment behavior
- force-state override behavior
- timer Step 5 success/failure behavior
- request / status consistency after each
- direct Admin compatibility after each

## Additional Hard Requirement

Your report must explicitly answer:

- which mutations create a new run
- which mutations edit the latest run in place
- which mutations must reconcile request state
- which mutations currently do not reconcile request state unless you change them in this prompt

## Completion Standard

This prompt is complete only when a later operator or implementation agent can explain, from repo truth, how every terminal and recovery path affects both durable status and the linked request record.
