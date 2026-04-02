# Prompt-03 — Identity Action Catalog, Risk Taxonomy, and Permission Matrix

## Objective

Define the action catalog, risk taxonomy, permission matrix, and operator-safety classification for the Entra control lane before implementing the workflows.

This prompt creates the execution blueprint that later backend and UI prompts must follow.

## Important execution rules

- Do not re-read files still in active context unless needed.
- Use official Microsoft guidance principles:
  - least privilege,
  - role-aware operations,
  - sensitivity distinctions for privileged actions,
  - stable API preference.
- Keep the matrix practical and implementation-facing.

## Inputs

Use:
- the completed Phase 9 baseline docs,
- current `graph-service.ts`,
- any repo docs affecting app permissions or admin auth posture.

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-identity-action-catalog.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-risk-taxonomy.md`
3. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-permission-role-and-consent-matrix.md`

## Required action-catalog rows

At minimum define actions for:
- create user
- read/lookup/search user
- update user profile basics
- enable/disable account
- reset / manage identity-sensitive properties only if phase-appropriate
- delete user
- create security group
- read/lookup/search group
- update group properties
- add members
- remove members
- delete group
- grant or normalize rollout-critical group memberships
- rollout-critical access setup actions
- visibility-only actions
- dangerous / constrained actions that require explicit handling or deferral

## Required fields per action

At minimum:
- action name
- domain (user/group/access-setup/etc.)
- rollout-critical or broader-admin classification
- risk tier
- destructive or non-destructive
- checkpoint/preview requirement
- least-privileged Graph permission target
- additional role requirement notes
- audit requirement
- phase disposition (implement now / visibility only / defer)

## Required risk-taxonomy sections

Include:
- routine actions
- elevated actions
- destructive actions
- privileged-admin / role-assignable edge cases
- preview-only / defer-until-safer cases
- operator UX consequences by risk tier

## Required permission matrix sections

Include:
- action-to-Graph-permission mapping
- delegated vs app-only implications if relevant to the repo’s architecture
- Entra role requirements / notes where material
- permissions the phase should avoid unless no narrower option exists
- explicit note on any areas where the repo should document manual IT approval prerequisites

## Implementation rule

The output of this prompt becomes the control document for Prompts 04–09.
Do not proceed with ambiguous action scope.

## Validation

Before finishing:
- ensure every implement-now action has a risk tier and permission target,
- ensure the phase does not casually include high-risk identity operations without rationale,
- ensure the permission matrix is narrower than “just use Directory.ReadWrite.All everywhere” unless a documented necessity truly forces it.

## Completion condition

Stop after the three docs are complete and internally consistent.
