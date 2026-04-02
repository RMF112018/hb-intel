# Prompt 03 — Admin Service Container and Factory Foundation

## Objective

Create the generalized admin control-plane service container and service-factory foundation that later routes and adapter execution will depend on.

## Context efficiency rule

Do **not** re-read files that are still in your active context or memory unless they changed or this prompt explicitly requires a fresh comparison.

## Required repo-truth context

Read the smallest authoritative set necessary, including:

- the Phase 3 inventory and host-strategy docs created earlier in this phase
- the minimal existing backend service-factory/container files needed to verify current repo patterns
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- any existing backend DI/service resolution README or conventions docs if present

## Scope of work

1. Identify the correct service-container pattern already used by the repo.
2. Create a scoped service container / service factory for the admin control plane.
3. Define which services belong in this container at Phase 3, such as:
   - auth / identity resolution helpers,
   - run-launch and run-query services,
   - adapter registry resolution,
   - orchestration bridge services,
   - config lookup services,
   - validation services,
   - repair-command helpers.
4. Define which services remain out of scope until later phases.
5. Ensure this factory can coexist with current project-setup and legacy service factories without hidden coupling.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-3/admin-control-plane-service-factory-and-container-plan.md`

Implement the corresponding service-container / factory foundation in repo.

The doc must include:
- service inventory,
- eager vs lazy service guidance,
- excluded services and why,
- container ownership boundaries,
- and expected consumers.

## Implementation requirements

- Follow the repo’s existing service-factory style instead of inventing a parallel DI doctrine.
- Keep service definitions small, explicit, and host-scoped.
- Prefer composition of current provisioning/runtime helpers where appropriate over logic duplication.
- Do not make `@hbc/features-admin` or SPFx code the place where privileged service resolution happens.

## Documentation requirements

- Update backend documentation where needed so the new service-container pattern is discoverable.
- Cross-link the doc to the host/composition-root plan.

## Validation requirements

- Validate container construction, import/export integrity, and startup wiring.
- Add or update focused tests if the repo already tests host/service-container boundaries.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one clear admin service container/factory foundation,
- host-level backend code can resolve the services it needs for generalized admin routes,
- and the placement does not violate current host-boundary doctrine.

## No-go boundaries

- Do not implement every domain service in full detail.
- Do not duplicate existing provisioning services without a documented reason.
- Do not create a giant catch-all service container with unclear ownership.
