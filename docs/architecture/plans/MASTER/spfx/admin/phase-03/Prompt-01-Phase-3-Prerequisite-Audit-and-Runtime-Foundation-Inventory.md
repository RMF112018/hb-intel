# Prompt 01 — Phase 3 Prerequisite Audit and Runtime Foundation Inventory

## Objective

Establish the smallest trustworthy authority set for Phase 3 and produce a repo-truth inventory of the backend runtime foundations that already exist.

This prompt prevents Phase 3 from inventing a new backend architecture that ignores the repo’s current provisioning saga, host-boundary doctrine, or Phase 2 contract outputs.

## Context efficiency rule

Do **not** re-read files that are still in your active context or memory unless they changed or this prompt explicitly requires a fresh comparison.

## Required repo-truth context

Read the smallest authoritative set necessary, including at minimum:

- `docs/architecture/blueprint/current-state-map.md`
- executed Phase 2 admin artifacts, **if they exist in repo**
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- `packages/provisioning/README.md`
- `packages/features/admin/README.md`
- `backend/functions/README.md`, if present
- the minimal backend route/service-factory/orchestration files needed to verify current runtime structure

Inspect nearby code only where needed to verify claims.

## Scope of work

1. Confirm whether the expected Phase 2 admin contract artifacts exist in repo.
2. Inventory the current backend runtime foundations already present in:
   - `backend/functions`
   - `@hbc/provisioning`
   - `apps/admin`
   - `@hbc/features-admin`
3. Identify which current runtime elements are:
   - reusable as-is,
   - reusable but should be generalized,
   - provisioning-specific and should stay that way,
   - missing and must be added in Phase 3.
4. Identify the present composition-root and service-container pattern the repo already uses.
5. Identify concrete Phase 3 blockers if the repo lacks required Phase 2 outputs.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-3/admin-spfx-phase-3-runtime-foundation-inventory.md`

The document must include:
- authority order used,
- whether Phase 2 docs exist and which were used,
- inventory table of current runtime foundations,
- generalize / retain / missing classification,
- explicit Phase 3 runtime gaps,
- explicit host-boundary recommendation grounded in repo truth.

## Implementation requirements

- Treat the project-setup host as proof that scoped domain hosts are already valid repo doctrine.
- Treat provisioning as the main current implementation seam to generalize from.
- Treat `@hbc/features-admin` as observability/intelligence, not privileged execution.
- Do **not** start implementing the runtime foundation in this prompt; inventory and classify only.

## Documentation requirements

Cross-link the inventory doc to:
- the target-architecture doc,
- the executed Phase 2 docs if present,
- the project-setup host manifest,
- the provisioning README,
- and the admin app/operator surface proof points.

## Validation requirements

- Validate every inventory claim against live repo files.
- Use repo search to confirm no major backend runtime area was skipped.
- Keep validation narrow and explicit.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one clear runtime-foundation inventory doc,
- Phase 3 starting conditions are classified against real code,
- and later prompts can proceed without re-arguing what backend foundation already exists.

## No-go boundaries

- Do not add generalized backend runtime code yet.
- Do not rewrite existing provisioning orchestration.
- Do not create target-state-only docs that contradict live repo truth.
