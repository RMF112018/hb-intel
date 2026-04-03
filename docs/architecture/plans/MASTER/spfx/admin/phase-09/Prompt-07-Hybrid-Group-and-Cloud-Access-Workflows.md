# Prompt-07 — Hybrid Group and Cloud Access Workflows

## Objective

Implement the Phase 9 backend workflows for **group administration and cloud-side access handling** through the privileged backend, with explicit source-of-authority routing.

This prompt must expand beyond provisioning-era Entra group setup without collapsing all groups into a Graph-only model.


## Hard gate

Treat the following as mandatory for this prompt and all later prompts:

After the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

This prompt must therefore drive the repo toward:

- UI-managed setup, testing, rotation, and maintenance of required backend connections,
- secure backend custody/resolution of secrets and credentials,
- explicit operator-visible preflight checks for any external prerequisite the app cannot create itself,
- and documentation that distinguishes allowed admin-page approvals from prohibited code-edit setup.

Standard Microsoft admin approval pages are allowed where unavoidable. Code interaction is not.


## Important execution rules

- Do not re-read files still in active context unless necessary.
- Preserve existing provisioning-era group functionality while generalizing cleanly.
- Implement only the actions approved by Prompt-03.
- Keep dangerous edge cases explicit and constrained.
- Do not treat AD-synced groups, cloud-only groups, and rollout-critical access groups as the same thing.
- Do not assume a required connector exists just because the code path compiles.

## Scope

Implement the approved backend workflows, expected to include some combination of:

- lookup / search / read group with authority classification
- create group
- update group properties
- add members
- remove members
- delete group
- rollout-critical group normalization / access setup
- cloud-side access / membership follow-on actions approved by the action catalog

## Required implementation outcomes

### A. Backend entry points / routing

Add or extend the backend endpoints/functions for group and access actions with explicit source-of-authority routing and connection-readiness preflight.

### B. Group workflow execution

Use the expanded service boundaries rather than raw calls scattered across handlers.

### C. Membership handling

Support phase-approved membership operations with validation, clean error behavior, and source-of-authority checks.

### D. Existing provisioning compatibility

Do not break the current provisioning-era use of Entra groups. Preserve or refactor it safely.

### E. Audit / evidence behavior

Every action must produce phase-appropriate audit metadata and normalized results, including source-of-authority and downstream state where relevant.

### F. Constrained handling

For role-assignable, highly privileged, unsupported, cloud-only, or otherwise sensitive scenarios:

- apply the authority/risk/action matrix,
- fail or defer clearly,
- do not pretend full support exists if it does not.

## Documentation requirement

Create if useful:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-group-and-access-workflow-notes.md`

Update any direct backend guidance touched by the implementation.

## Validation

Run focused backend tests covering:

- group create/read/update/delete behavior as implemented
- add/remove member behavior
- source-of-authority routing
- connector-preflight / missing-configuration failures
- provisioning compatibility
- error normalization
- audit metadata generation
- cloud-side follow-on actions if implemented

## Completion condition

Stop when the approved group / access workflows are implemented and tested.
Do not build the frontend lane in this prompt.


## No-code setup rule

If a workflow is blocked by missing connector setup, stale credentials, missing certificate references, unresolved backend secret material, or other connection issues, the workflow must return actionable metadata that sends the operator to the governed connection-management UI or to an explicit external admin prerequisite. It must not require code edits to proceed.
