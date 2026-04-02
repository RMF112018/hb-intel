# Prompt 02 — Admin Action Catalog, Risk Levels, and Execution Modes

## Objective

Define the canonical admin action vocabulary for the future control plane.

This prompt establishes:
- admin domains,
- action identifiers,
- risk levels,
- execution modes,
- and the semantic rules for when an action is seamless, checkpointed, destructive, or advisory.

## Context efficiency rule

Do **not** re-read files already in active context unless they changed or you need a direct citation for a newly written document.

## Required repo-truth context

Use:
- the Phase 2 prerequisite inventory from Prompt 01
- the end-state target-architecture doc
- any executed Phase 1 domain taxonomy / release-scope docs, if present
- current provisioning/admin repo surfaces only as needed for naming alignment

## Scope of work

1. Define the canonical admin domains, at minimum covering:
   - setup / install / bootstrap
   - validation / readiness
   - provisioning / rollout control
   - SharePoint control
   - Entra control
   - standards / configuration
   - health / observability
   - repair / recovery
2. Define action identifiers and action families.
3. Define risk levels with clear criteria.
4. Define execution modes:
   - seamless
   - checkpointed
   - destructive
   - advisory
5. Define the rules that map action category + risk level to execution mode expectations.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-2/admin-control-plane-action-catalog.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-2/admin-control-plane-phase-2-decision-register.md` (initial Phase 2 entries)

Add pure shared enums/types under:

- `packages/models/src/admin-control-plane/`

At minimum define type surfaces for:
- admin domain key
- admin action key
- admin risk level
- admin execution mode

Export them through the public `@hbc/models` surface.

## Implementation requirements

- Keep this contract surface **type-only**.
- Reuse existing provisioning vocabulary where it fits, but do not let provisioning-specific wording become the only generalized model.
- Make the execution-mode model explicitly compatible with the locked decision that provisioning should stay seamless unless failure handling requires interruption.
- Make it clear that broader risky admin actions may still be checkpointed even when single-admin approval is allowed.

## Documentation requirements

The action catalog must include:
- a domain-to-action table,
- risk-level definitions,
- execution-mode definitions,
- mapping rules,
- examples,
- and explicit non-examples.

The decision register must log why the chosen model belongs in `@hbc/models` and not in `apps/admin` or `@hbc/features-admin`.

## Validation requirements

- Verify public exports are wired correctly.
- Run targeted type checks for `@hbc/models`.
- Confirm no runtime behavior or app-specific implementation leaked into the contract files.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one authoritative action catalog,
- one risk/execution-mode contract surface,
- and the exported shared types compile cleanly.

## No-go boundaries

- Do not define HTTP endpoints yet.
- Do not define run lifecycle yet beyond what is necessary for action semantics.
- Do not add backend route logic.
