# Prompt-06 — User Administration Workflows

## Objective

Implement the Phase 9 backend workflows for **user administration** through the privileged backend, consistent with the action catalog, risk taxonomy, and Graph service expansion.

## Important execution rules

- Do not re-read files still in active context unless necessary.
- Implement only the user actions approved as “implement now” by Prompt-03.
- Keep risky or highly privileged edge cases explicitly constrained rather than silently half-supporting them.
- Ensure workflow code uses the contract/model layer from Prompt-05 instead of bypassing it.

## Scope

Implement backend user workflows for the approved subset of actions, expected to include some combination of:
- lookup/search/read user
- create user
- update approved user properties
- enable/disable user
- delete user
- rollout-critical access preparation tasks as approved

## Required implementation outcomes

### A. Backend route/entry integration
Add the phase-appropriate backend entry points for user actions following the repo’s existing backend/function pattern.

### B. Request validation + routing
Wire incoming requests through the Phase 9 models/validators.

### C. Graph execution
Use the Graph service methods from Prompt-04 rather than re-implementing raw Graph calls.

### D. Audit/evidence behavior
Each user workflow must capture phase-appropriate audit metadata and result/evidence fields.

### E. Constrained handling for sensitive cases
Where Microsoft role/permission limits or sensitive-target restrictions make an operation unsafe or under-specified:
- fail clearly,
- return actionable operator-facing error metadata,
- and do not silently downgrade or improvise behavior.

## Documentation requirement

Update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-identity-action-catalog.md`
if any action dispositions need precise implementation notes after real code work.

Create if helpful:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-user-workflow-notes.md`

## Validation

Run focused backend tests covering:
- happy path
- validation failures
- permission/unsupported-target failures
- audit payload generation
- deterministic error mapping

## Completion condition

Stop when the approved user-administration backend workflows are working and tested.
Do not implement group workflows or frontend UI here.
