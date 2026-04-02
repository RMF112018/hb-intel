# Prompt 06 — Adapter Registry and Execution Routing Foundation

## Objective

Implement the adapter registry and normalized execution-routing foundation that the generalized admin backend will use to invoke privileged platform operations.

## Context efficiency rule

Do **not** re-read files that are still in your active context or memory unless they changed or this prompt explicitly requires a fresh comparison.

## Required repo-truth context

Read the smallest authoritative set necessary, including:

- the Phase 2 adapter-registry contract, if present in repo
- the Phase 3 host / service-container / handler docs created earlier in this phase
- the minimal current adapter or service files needed to verify existing Graph, SharePoint, validation, and provisioning execution seams

## Scope of work

1. Create the generalized adapter registry foundation for the admin control plane.
2. Implement normalized adapter-resolution and execution-routing behavior.
3. Define the Phase 3 adapter set at the skeleton level, such as:
   - provisioning bridge adapter / execution target,
   - validation adapter,
   - configuration/standards lookup adapter,
   - placeholder rails for install/bootstrap, SharePoint control, and Entra control without pretending those domains are complete.
4. Ensure adapter invocation returns normalized result envelopes suitable for later audit/evidence work.
5. Keep adapter-specific platform logic isolated from route handlers.

## Required outputs

Create or update:

- `docs/architecture/plans/MASTER/spfx/admin/phase-3/admin-control-plane-adapter-registry-and-routing-foundation.md`

Implement the corresponding adapter registry and routing foundation in repo.

The doc must include:
- adapter registry model,
- current adapter set,
- normalized invocation / result model,
- boundary notes,
- and deferred adapter domains.

## Implementation requirements

- Keep adapters platform-specific and route handlers platform-agnostic.
- Prefer registry-based resolution over scattered `if/else` routing growth.
- Reuse proven current backend helpers where reasonable instead of copying logic.
- Make the adapter set explicit and inspectable.

## Documentation requirements

- Record which adapters are real in Phase 3 and which are placeholder rails only.
- Cross-link the registry doc to the Phase 2 adapter contract.

## Validation requirements

- Validate adapter registration, resolution, and normalized result typing.
- Add focused tests if the repo already supports service/adapter execution tests.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has a generalized adapter registry and execution-routing foundation,
- handlers can invoke adapters through one consistent seam,
- and later phases can add new admin domains without inventing a new backend routing model.

## No-go boundaries

- Do not fully implement all later-phase adapters.
- Do not let route handlers talk directly to Graph/SharePoint/Bicep services in an ad hoc way.
- Do not hide execution routing decisions inside UI-facing code.
