# Prompt 04 — Authenticated Admin API Surface and Route Registration

## Objective

Implement the generalized authenticated admin API surface and route-registration skeleton required for the operator console to interact with the privileged backend foundation.

## Context efficiency rule

Do **not** re-read files that are still in your active context or memory unless they changed or this prompt explicitly requires a fresh comparison.

## Required repo-truth context

Read the smallest authoritative set necessary, including:

- the Phase 2 API contract catalog, if present in repo
- the Phase 3 host and service-factory docs created earlier in this phase
- the minimal current backend route registration/auth middleware files needed to align with repo patterns
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`

## Scope of work

1. Add the generalized authenticated admin API route families needed for Phase 3, covering at minimum:
   - launch run,
   - get run status,
   - list run history,
   - retry run,
   - initiate repair,
   - execute validation,
   - read configuration / standards snapshots as allowed in this phase.
2. Align handler names, route structure, and DTO mapping with the Phase 2 contract model.
3. Ensure all routes use the repo’s shared authentication / authorization middleware pattern.
4. Keep route families scoped to the new admin-control-plane host/composition root where appropriate.
5. Add the minimal client seam updates in `apps/admin` only if needed to consume new route names or DTOs.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-3/admin-control-plane-api-surface-and-route-catalog.md`

Implement the corresponding route registration and handler skeletons in repo.

The doc must include:
- route table,
- auth requirement per route,
- expected request/response DTOs,
- ownership notes,
- and route-to-service mapping.

## Implementation requirements

- Keep routes thin and delegate execution to services / orchestration bridges.
- Use consistent naming between docs, handlers, and DTOs.
- Preserve existing provisioning route behavior unless the generalized route layer intentionally wraps or references it.
- Avoid generic “do everything” endpoints that weaken auditability.

## Documentation requirements

- Update backend README or route catalog docs if new endpoints become part of the supported backend surface.
- Note any current temporary compatibility shims explicitly.

## Validation requirements

- Validate auth middleware wiring, route registration, and handler export integrity.
- Add narrow tests for request shape and permission behavior where the repo already supports them.

## Acceptance / completion conditions

This prompt is complete when:
- generalized authenticated admin routes exist in repo,
- they are discoverable in docs,
- and later prompts can implement route behavior without reworking route registration.

## No-go boundaries

- Do not build full later-phase domain behavior behind these routes.
- Do not bypass shared auth middleware.
- Do not couple route handlers directly to UI assumptions from `apps/admin`.
