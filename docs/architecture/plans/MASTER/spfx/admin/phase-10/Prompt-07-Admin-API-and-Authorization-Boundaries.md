# Prompt-07 — Admin API and Authorization Boundaries

## Objective

Expose the backend standards/config governance functionality through authenticated admin APIs with clear authorization and non-secret boundaries.

## Important execution rules

- Reuse current backend/admin execution patterns where possible.
- Use existing auth/authorization posture; do not create a parallel auth system.
- Do not expose secret or infrastructure-only settings through editable endpoints.
- Keep API contracts explicit and typed.

## Inputs

Use:
- all prior Phase 10 outputs
- current admin/backend auth seams
- current admin app route expectations
- `@hbc/auth` consumer posture already present in the repo

## Required implementation work

Implement typed APIs for:
- read config catalog / schema
- read effective values
- read current published version
- read history
- create/update draft or staged edits (if applicable)
- publish
- revert
- preview diff
- fetch provenance
- fetch run-to-config references where relevant

## Required authorization boundaries

The API layer must clearly enforce:
- who can view
- who can edit
- who can publish
- who can revert
- what categories are view-only
- what categories are never surfaced for editing

If repo auth primitives require permission names or role mappings, define them cleanly and document them.

## Required output artifacts

Add or update:
- backend route/controller/handler files
- typed request/response contracts
- any needed permission constants / gate docs

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-api-and-authz-boundaries.md`

## Validation requirement

Add focused tests for:
- authorized vs unauthorized access
- protected categories rejected for edit
- publish/revert API behavior
- diff/provenance retrieval

## Completion condition

Stop when the admin API layer is usable, typed, permission-gated, and aligned with the hybrid boundary.
