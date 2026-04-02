# Prompt-03 — Boundary Matrix and Layer Ownership Doctrine

## Objective

Create the canonical **boundary matrix** for the Admin SPFx IT Control Center so later implementation work has an explicit ownership table instead of relying on implied assumptions.

## Important execution rules

- Do **not** re-read files still in current context unless necessary.
- Use the Phase 1 architecture baseline as the controlling input.
- Keep the matrix concrete and execution-relevant.
- Avoid generic enterprise-architecture filler.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-phase-1-architecture-baseline.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-phase-1-repo-truth-verification.md`

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-boundary-matrix.md`

## Required structure

Include at least these sections:

1. **Purpose**
2. **How to use this matrix**
3. **Layer definitions**
4. **Capability ownership matrix**
5. **Package/app ownership notes**
6. **Explicit no-go placements**
7. **Boundary review checklist for future phases**

## Required matrix columns

At minimum:
- Capability / concern
- Primary owner layer
- Supporting layer(s)
- Why it belongs there
- Explicitly not owned by
- Current repo foundation / anchor path
- Later-phase notes (only if needed)

## Capability rows that must be covered

At minimum include rows for:
- setup/install workflow UX
- preflight validation UX
- run launch
- run status and history viewing
- log / audit browsing
- high-risk action initiation
- approval/checkpoint UX
- durable orchestration
- retries
- compensation
- repair decisions
- run persistence
- audit persistence
- Graph-backed Entra changes
- SharePoint ALM / package posture actions
- standards comparison
- standards application / reapplication
- governed configuration resolution
- reusable alert/probe/dashboard behavior
- reusable visual shell components
- per-run evidence traceability

## Package/app ownership notes that must be explicit

Cover these explicitly:
- `apps/admin`
- `packages/features/admin`
- `@hbc/ui-kit`
- `backend/functions`
- provisioning foundations / adapters

## Required no-go statements

Write clear no-go statements such as:
- no privileged Graph write logic in SPFx,
- no durable orchestration inside `apps/admin`,
- no audit-persistence internals in browser code,
- no conversion of `@hbc/features-admin` into a catch-all control-plane package,
- no reusable visual admin components outside `@hbc/ui-kit`.

## Validation

Before finishing:
- check every row for unambiguous ownership,
- remove duplicate rows,
- verify package names and paths,
- ensure the matrix is specific enough that a later code agent can use it during implementation.

## Completion condition

Stop after the boundary matrix is complete.
Do not write the domain taxonomy in this prompt.
