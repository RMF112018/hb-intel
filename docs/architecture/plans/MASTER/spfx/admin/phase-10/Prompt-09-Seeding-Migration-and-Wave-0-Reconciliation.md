# Prompt-09 — Seeding, Migration, and Wave-0 Reconciliation

## Objective

Seed the new live-governed standards/config model from existing repo baselines where appropriate, and reconcile current wave-0 configuration materials to the new hybrid model.

## Important execution rules

- Do not mass-migrate secrets or infrastructure-only settings into the live store.
- Migrate only the bounded categories allowed by the baseline.
- Reconcile drift rather than duplicating contradictory sources.
- Keep a clear record of what remains code/env-only.

## Inputs

Use:
- Prompt-01 drift audit
- Prompt-02 baseline
- Prompt-03 catalog model
- implemented backend/services from Prompts 04–07
- current wave-0 configuration docs and registry

## Required work

Implement:
1. seed/bootstrap logic for initial live-governed config where justified
2. explicit non-migration list for infra-only / secret settings
3. reconciliation updates to existing wave-0 docs
4. any migration notes needed for existing environments

## Required artifacts

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-seeding-and-reconciliation.md`

Update as needed:
- `docs/reference/configuration/wave-0-config-registry.md`
- related configuration docs under `docs/reference/configuration/`
- any current-state references that would otherwise remain materially misleading

## Required content in the new doc

- what was seeded
- what was intentionally not seeded
- why those decisions were made
- how to bootstrap a new environment
- how to reconcile an existing environment
- residual manual steps if any

## Validation requirement

Verify:
- seeded values conform to catalog validation
- no protected/secret category was incorrectly migrated
- docs now reflect the real hybrid model and current code

## Completion condition

Stop when seeding/reconciliation is complete and the repo no longer presents a materially contradictory config story.
