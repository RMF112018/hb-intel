# Prompt 01 — Phase 2 Prerequisite Audit and Contract Inventory

## Objective

Establish the smallest trustworthy authority set for Phase 2 and produce a repo-truth inventory of the contract-like surfaces that already exist.

This prompt is the guardrail against inventing a generalized admin control-plane contract model that ignores existing provisioning, admin-intelligence, or backend host boundaries.

## Context efficiency rule

Do **not** re-read files that are still in your active context or memory unless they changed or this prompt explicitly requires a fresh comparison.

## Required repo-truth context

Read the smallest authoritative set necessary, including at minimum:

- `docs/architecture/blueprint/current-state-map.md`
- the executed Phase 1 admin baseline artifacts, **if they exist in repo**
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- `packages/provisioning/README.md`
- `packages/features/admin/README.md`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`

Inspect nearby code only where needed to verify claims.

## Scope of work

1. Confirm whether the expected Phase 1 admin baseline artifacts exist in repo.
2. Inventory the current contract-like surfaces already present in:
   - `@hbc/provisioning`
   - `@hbc/features-admin`
   - `@hbc/models`
   - `backend/functions`
   - `apps/admin`
3. Identify which current concepts are:
   - reusable as-is,
   - reusable with renaming or normalization,
   - provisioning-specific and should stay that way,
   - missing and must be defined in Phase 2.
4. Identify any obvious collision risks between:
   - admin-intelligence,
   - generalized control-plane contracts,
   - provisioning lifecycle contracts,
   - domain-host boundaries.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-2/admin-spfx-phase-2-prereq-and-contract-inventory.md`

The document must include:
- authority order used,
- whether Phase 1 docs exist and which were used,
- inventory table of existing contract-like surfaces,
- reuse / normalize / retain / missing classification,
- explicit gaps Phase 2 must close.

## Implementation requirements

- Treat provisioning as the primary current implementation pattern to generalize from.
- Treat `@hbc/features-admin` as admin-intelligence only unless repo truth proves otherwise.
- Treat the project-setup domain host as evidence that future admin control-plane contracts must support scoped domain-host composition roots.
- Do **not** define final Phase 2 contracts in this prompt; only inventory and classify.

## Documentation requirements

Cross-link the inventory doc to:
- the target-architecture doc,
- the relevant Phase 1 baseline docs if present,
- `packages/provisioning/README.md`,
- `packages/features/admin/README.md`,
- the project-setup host release-scope manifest.

## Validation requirements

- Validate every inventory claim against live repo files.
- Use repo search to ensure no major contract-bearing area was skipped.
- Keep validation narrow and explicit.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one clear prerequisite and contract inventory doc,
- the likely Phase 2 work items are classified against real repo surfaces,
- and later prompts can proceed without re-arguing where the starting point is.

## No-go boundaries

- Do not add generalized runtime code.
- Do not create shared types yet unless a tiny placeholder is required for documentation parity, in which case document why.
- Do not rewrite current provisioning ownership.
