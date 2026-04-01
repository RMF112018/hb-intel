# Prompt-04 — Phase 9: Production Cutover and Rollback Preparation

## Objective

Produce the production cutover and rollback package for the Accounting app and connected provisioning workflow.

## Instructions

You are working inside the live repository.

Do not re-read files that are still within your current context or memory.

Use repo truth plus the prior Phase 9 outputs to define the exact release-day procedure.

This prompt must result in a practical, step-ordered cutover and rollback artifact.

## Focus areas

- release-day sequencing
- dependency/order of operations
- cutover gates
- manual checkpoints
- rollback criteria
- rollback sequence
- evidence and communications
- ownership at each step

## Deliverables

Create or update:
- `docs/architecture/release/phase-9-production-cutover-and-rollback-checklist.md`

The checklist must include:
1. Pre-cutover prerequisites
2. Go / no-go gate
3. Cutover sequence
4. Validation checkpoints during cutover
5. Immediate rollback triggers
6. Rollback steps
7. Communication steps
8. Owner matrix
9. Final cutover completion criteria

## Acceptance criteria

- The cutover path is sequenced and practical.
- Rollback is explicit, not hand-waved.
- There is a clear stop/go checkpoint.
- The artifact is usable by a release lead or technical owner.
