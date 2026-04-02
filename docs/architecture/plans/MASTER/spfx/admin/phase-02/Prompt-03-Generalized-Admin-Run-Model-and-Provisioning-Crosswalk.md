# Prompt 03 — Generalized Admin Run Model and Provisioning Crosswalk

## Objective

Define the generalized run model that the future admin control plane will use, then explicitly cross-walk current provisioning lifecycle concepts into that model without breaking current provisioning ownership.

## Context efficiency rule

Do **not** re-read files still in active context unless they changed or you need a fresh check for model compatibility.

## Required repo-truth context

Use:
- Prompt 01 inventory
- Prompt 02 action catalog
- `packages/provisioning/README.md`
- provisioning-related types and status models in `@hbc/models` / `@hbc/provisioning` as needed
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`

## Scope of work

1. Define the generalized admin run envelope, including at minimum:
   - run id
   - action id
   - domain
   - risk level
   - execution mode
   - actor context
   - command input snapshot reference
   - config snapshot reference
   - lifecycle state
   - timestamps
   - current checkpoint / current step references
2. Define run lifecycle states and allowed transitions.
3. Define step result and failure/retry semantics.
4. Define actor/operator fields and correlation identifiers.
5. Produce an explicit crosswalk showing how current provisioning concepts map into the generalized run model.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-2/admin-control-plane-run-model.md`

Create or update pure shared types in:

- `packages/models/src/admin-control-plane/`

At minimum define:
- run envelope interfaces
- lifecycle state enum/type
- step result interface
- actor context interface
- retry / failure summary interfaces
- correlation / linkage fields

Export them through `@hbc/models`.

## Implementation requirements

- The generalized run model must be able to represent:
  - provisioning runs,
  - future setup/bootstrap runs,
  - validation-only runs,
  - repair runs,
  - destructive actions,
  - and advisory/dry-run actions.
- Keep the provisioning crosswalk explicit so future phases do not try to replace current provisioning types in one unsafe step.
- Document whether the generalized model is a superset, wrapper, or translation target for provisioning. Be precise.

## Documentation requirements

The run-model doc must include:
- lifecycle state table,
- transition rules,
- step/result semantics,
- failure/retry semantics,
- provisioning crosswalk table,
- compatibility notes,
- and migration guidance for later phases.

## Validation requirements

- Ensure the new shared types do not introduce circular dependency pressure.
- Run targeted `@hbc/models` type checks.
- Verify no existing provisioning exports were silently broken.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one authoritative generalized run model,
- the provisioning crosswalk is written down,
- and the shared type surface compiles without boundary drift.

## No-go boundaries

- Do not implement stores, APIs, or orchestrator code.
- Do not rewrite current provisioning state-machine behavior.
