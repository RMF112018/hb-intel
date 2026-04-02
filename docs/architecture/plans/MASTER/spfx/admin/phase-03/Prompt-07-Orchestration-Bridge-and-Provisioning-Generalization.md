# Prompt 07 — Orchestration Bridge and Provisioning Generalization

## Objective

Create the orchestration bridge that connects the generalized admin backend foundation to the repo’s existing provisioning-control-plane implementation without destabilizing provisioning ownership.

## Context efficiency rule

Do **not** re-read files that are still in your active context or memory unless they changed or this prompt explicitly requires a fresh comparison.

## Required repo-truth context

Read the smallest authoritative set necessary, including:

- the Phase 2 run/checkpoint/adapter docs, if present in repo
- the Phase 3 host / handler / adapter docs created earlier in this phase
- the minimal current provisioning orchestration and retry/status files needed to verify current behavior
- `packages/provisioning/README.md`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`

## Scope of work

1. Define and implement the orchestration-bridge seam that allows generalized admin commands to call or represent existing provisioning runtime behavior.
2. Ensure provisioning-backed runs can be surfaced through the generalized admin run model where appropriate.
3. Preserve the current provisioning lifecycle as the current domain implementation rather than forcing a destructive rewrite.
4. Add the minimum generalized orchestration abstraction needed so later admin domains can plug into the same backend substrate.
5. Record exactly what remains provisioning-specific after this bridge lands.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-3/admin-control-plane-orchestration-bridge-plan.md`

Implement the corresponding orchestration-bridge foundation in repo.

The doc must include:
- provisioning-to-generalized-run mapping,
- orchestration bridge responsibilities,
- retained provisioning ownership areas,
- deferred generalization work,
- and later-phase extension notes.

## Implementation requirements

- Generalize by wrapping or bridging current provisioning runtime patterns, not by replacing them blindly.
- Keep the bridge explicit and testable.
- Ensure current admin oversight behavior still has a supported backend path.
- Use clear naming so “bridge” code does not masquerade as already-complete generalized orchestration maturity.

## Documentation requirements

- Update provisioning and backend guidance if the bridge changes where developers should extend runtime behavior.
- Record retained provisioning-specific ownership explicitly.

## Validation requirements

- Validate that current provisioning launch/status/retry/admin actions still function through supported backend seams.
- Add focused tests or compatibility checks where meaningful.

## Acceptance / completion conditions

This prompt is complete when:
- the generalized admin backend can represent or invoke current provisioning runtime behavior through a stable bridge,
- provisioning ownership is still clear,
- and later phases can add non-provisioning admin runs without restarting the backend model.

## No-go boundaries

- Do not fully replace the provisioning saga runtime.
- Do not claim Phase 4 audit/evidence maturity.
- Do not let the bridge become a permanent dumping ground for all future admin behavior.
