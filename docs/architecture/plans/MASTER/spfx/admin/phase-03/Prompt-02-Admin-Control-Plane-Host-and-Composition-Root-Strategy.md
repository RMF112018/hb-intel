# Prompt 02 — Admin Control Plane Host and Composition-Root Strategy

## Objective

Define and implement the backend host/composition-root strategy for the generalized admin control plane in a way that aligns with the repo’s current domain-host doctrine.

## Context efficiency rule

Do **not** re-read files that are still in your active context or memory unless they changed or this prompt explicitly requires a fresh comparison.

## Required repo-truth context

Read the smallest authoritative set necessary, including:

- the Phase 3 runtime-foundation inventory created in Prompt 01
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- the minimal backend startup / host-wiring files needed to verify the current host-registration pattern
- relevant ADRs or boundary docs if they directly govern backend host placement

## Scope of work

1. Decide the correct host/composition-root location for the generalized admin backend foundation.
2. Determine whether the repo should introduce a dedicated host such as `backend/functions/src/hosts/admin-control-plane/` or an equivalent naming convention justified by repo truth.
3. Define the in-scope and out-of-scope route families for this host.
4. Define how this host relates to:
   - the legacy monolithic host,
   - the project-setup host,
   - provisioning-specific endpoints,
   - later admin domains such as install/bootstrap, SharePoint control, and Entra control.
5. Implement the minimum host/composition-root scaffolding needed to make later route work coherent.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-3/admin-control-plane-host-and-composition-root-plan.md`

Implement the corresponding host/composition-root scaffolding in repo.

The doc must include:
- chosen host path and rationale,
- route-family scope,
- service-container ownership boundary,
- relationship to existing provisioning runtime,
- deferred route families for later phases,
- and migration/expansion notes.

## Implementation requirements

- Prefer the repo’s proven scoped-host pattern over continued monolithic route growth.
- Keep provisioning-specific route ownership intact unless a route clearly belongs in the generalized admin surface.
- Make the new host/composition root explicit, readable, and testable.
- Avoid creating fake future route families just to make the folder tree look complete.

## Documentation requirements

- Update any backend README or boundary doc that would otherwise contradict the chosen host strategy.
- Add a release-scope manifest for the new host if that is how the repo documents host boundaries.

## Validation requirements

- Validate that route registration / startup wiring includes the new host correctly.
- Validate that no existing route family is accidentally detached.
- Keep validation focused on host composition and startup integrity.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one clear admin-control-plane host/composition-root strategy,
- the host exists in code,
- and later prompts can add routes/services without re-deciding where the backend foundation lives.

## No-go boundaries

- Do not build every later-phase route in this prompt.
- Do not flatten everything into the legacy monolithic host if repo truth supports a scoped host.
- Do not force provisioning endpoints into the new host unless the ownership move is clearly justified and documented.
