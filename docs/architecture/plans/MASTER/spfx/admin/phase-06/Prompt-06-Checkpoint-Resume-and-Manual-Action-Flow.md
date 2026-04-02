# Prompt-06 — Checkpoint, Resume, and Manual-Action Flow

## Objective

Implement explicit checkpoint handling for unavoidable manual or approval-gated actions in the Phase 6 install/bootstrap lane.

## Important execution rules

- Hidden manual steps are not acceptable.
- Checkpoint handling must be durable, reviewable, and operator-guided.
- Keep the backend as the system of record for checkpoint state.

## Inputs

Use:
- the manual-checkpoint policy doc
- shared contracts
- install/bootstrap orchestration
- any existing run status / action APIs already present in the repo

## Required work

### A. Add checkpoint state handling in the backend
Support:
- entering checkpoint state
- recording checkpoint payload and instructions
- approved/resume path
- rejected/cancelled path
- retry/re-enter behavior where appropriate
- durable audit/evidence of who resumed or rejected and when

### B. Add endpoint support
Implement the backend function/API support required for:
- get checkpoint detail
- approve / resume
- reject / cancel
- optionally attach operator note/reason if repo conventions support that

### C. Make operator instructions explicit
For every checkpoint, the backend payload should include a clear operator-facing instruction block such as:
- what needs to happen
- where it needs to happen
- how the operator should confirm it
- what happens next if they resume
- what risk exists if they proceed incorrectly

### D. Add checkpoint lifecycle docs
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-install-checkpoint-lifecycle.md`

This doc should explain:
- checkpoint entry conditions
- payload shape
- operator actions
- resume/reject semantics
- evidence requirements

## Required boundaries

- Do not let SPFx invent checkpoint state client-side.
- Do not store manual instructions only in UI copy.
- Do not allow resume without enough evidence/audit data to reconstruct what happened.

## Validation

Add focused tests for:
- checkpoint transition correctness
- resume behavior
- reject/cancel behavior
- terminal-state safety
- audit/evidence capture

Run only the narrow validation required by the touched surfaces and document it.

## Completion condition

Stop after checkpoint lifecycle behavior exists, is documented, and is validated.
Do not implement post-install verification or frontend UI in this prompt.
