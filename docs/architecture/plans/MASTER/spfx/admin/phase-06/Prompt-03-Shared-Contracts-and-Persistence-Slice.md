# Prompt-03 — Shared Contracts and Persistence Slice

## Objective

Introduce the smallest correct shared contract and persistence slice required for Phase 6 install/preflight/verification runs.

This prompt should establish the durable shapes that the backend and SPFx need in order to agree on install/bootstrap runs, checkpoint states, preflight results, and post-install verification results.

## Important execution rules

- Do **not** re-read files still in active context unless needed.
- Prefer the existing shared model location in the repo if one is already authoritative.
- If no existing shared location is appropriate, create the smallest new surface that is clearly forward-compatible.
- Do not build the entire generalized future admin platform contract in this prompt.

## Inputs

Use:
- the Phase 6 prerequisite audit
- the Phase 6 architecture / step-model docs
- current shared model/package repo truth

## Required work

### A. Add or extend shared install-domain contracts

Define the smallest correct model set for:
- install run request
- install run summary
- install run detail
- install step status
- checkpoint state
- manual action instruction block
- preflight result set
- preflight finding
- verification result set
- verification finding
- operator action result (`approve`, `reject`, `resume`, `cancel`, `retry` where applicable)

### B. Define install run status vocabulary

Include explicit durable states such as:
- Draft / ReadyToValidate
- ValidationInProgress
- ValidationFailed
- ReadyToInstall
- InstallQueued
- InstallInProgress
- WaitingForCheckpoint
- VerificationInProgress
- Completed
- Failed
- Cancelled

Adjust naming only if repo conventions strongly require it.

### C. Define persistence expectations

Document or implement the minimal storage contract for:
- run header / summary
- step execution detail
- checkpoint payload
- preflight findings
- verification findings
- evidence references / timestamps / operator identity

Use the current repo’s real persistence foundations where possible. Do not invent a wholly separate storage approach if the existing Table/audit pattern can be reused safely.

### D. Add a phase-local contract note
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-install-contract-slice.md`

This doc should explain:
- where the shared contracts live,
- why this slice is intentionally minimal,
- how it stays forward-compatible with broader admin-run generalization.

## File targets

Choose the actual shared code locations based on repo truth. Name them explicitly in the contract-slice doc.

## Required boundaries

- Do not put backend-only internals into browser-facing types.
- Do not overfit the model to only one wizard screen.
- Do not reimplement all future run domains in this prompt.
- Do not bypass durable representation for manual checkpoints.

## Validation

Before finishing:
- ensure the contract location is consistent with repo conventions,
- ensure backend and frontend can both import the shared types cleanly,
- ensure the status vocabulary aligns with the architecture docs,
- add or update focused tests if the repo already tests shared model packages.

## Completion condition

Stop after the shared contracts and contract-slice doc are complete.
Do not implement validator or orchestrator logic in this prompt.
