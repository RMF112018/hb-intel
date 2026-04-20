# Prompt 12 — Live-State Synchronization and Integration Tests

## Objective

Use the existing provisioning store and SignalR model to complete reliable live-state synchronization, then add integration tests that prove end-to-end continuity across request submission, review, provisioning, and reconciliation.

## Required repo-truth reading

- `packages/provisioning/src/store.ts`
- `packages/provisioning/src/hooks/useProvisioningSignalR.ts`
- `backend/functions/src/functions/signalr/index.ts`
- `apps/estimating/src/pages/RequestDetailPage.tsx`
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`

## Execution instructions

You are acting as a senior implementation agent working directly in the live HB Intel repo.

Perform the work directly in code.

Before changing code:
1. inspect the required repo-truth files,
2. inspect the current implementation files named below,
3. identify the exact contract or wiring mismatch,
4. implement the smallest correct set of changes,
5. validate against the affected surfaces and runtime seams.

Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.

## Implementation scope

- Inspect how live progress events and durable provisioning status are currently merged.
- Harden refresh, reconnect, and terminal-state synchronization behavior using the existing store architecture rather than replacing it.
- Add integration tests around the critical business path.
- Add or update test scaffolding needed to verify approval → provisioning and saga → request reconciliation.

## Required deliverables

- Store / live-state synchronization updates if needed
- Integration tests for the critical workflow path
- A clear list of what is covered and what still requires staging-only validation

## Acceptance criteria

- Live progress events and durable status stay coherent across refresh/reconnect conditions.
- The critical business path is covered by automated tests.
- Timer-driven completion and terminal reconciliation are covered where feasible.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups
