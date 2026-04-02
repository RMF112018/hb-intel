# Prompt-07 — Group Administration Workflows

## Objective

Implement the Phase 9 backend workflows for **group administration** through the privileged backend, expanding beyond provisioning-era group setup into a broader Entra group-management foundation.

## Important execution rules

- Do not re-read files still in active context unless necessary.
- Preserve existing provisioning-era group functionality while generalizing cleanly.
- Implement only the group actions approved by Prompt-03.
- Keep dangerous edge cases explicit and constrained.

## Scope

Implement the approved backend group workflows, expected to include some combination of:
- lookup/search/read group
- create group
- update group properties
- add members
- remove members
- delete group
- rollout-critical group normalization / access setup

## Required implementation outcomes

### A. Backend entry points / routing
Add or extend the backend endpoints/functions for group actions.

### B. Group workflow execution
Use the expanded Graph service rather than raw Graph calls scattered across handlers.

### C. Membership handling
Support phase-approved membership operations with validation and clean error behavior.

### D. Existing provisioning compatibility
Do not break the current provisioning-era use of Entra groups. Preserve or refactor it safely.

### E. Audit/evidence behavior
Every group action must produce phase-appropriate audit metadata and normalized results.

### F. Constrained handling
For role-assignable, highly privileged, unsupported, or otherwise sensitive group scenarios:
- apply the risk/action matrix,
- fail or defer clearly,
- do not pretend full support exists if it does not.

## Documentation requirement

Create if useful:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-group-workflow-notes.md`

Update any direct backend guidance touched by the implementation.

## Validation

Run focused backend tests covering:
- create/read/update/delete group behavior as implemented
- add/remove member behavior
- provisioning compatibility
- error normalization
- audit metadata generation

## Completion condition

Stop when the approved group-administration workflows are implemented and tested.
Do not build the frontend lane in this prompt.
