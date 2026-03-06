# ADR-0053: Auth Dual-Mode Foundation and Ownership Boundary

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.1 (Package and Architecture Foundation)
- **Related Plans:** `docs/architecture/plans/PH5.1-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.1 requires locking package boundaries before deeper auth/shell migration work starts. HB Intel must preserve one product experience while supporting dual runtime modes (PWA and SPFx) and controlled non-production overrides.

## Decision

1. `@hbc/auth` is the exclusive owner of provider abstraction, auth adapters, session normalization, auth/session store, permission evaluation helpers, auth guards, and auth hooks.
2. Runtime-specific integrations (PWA MSAL and SPFx context) are allowed only behind `@hbc/auth` adapter seams.
3. Feature modules may not bypass the auth store or permission resolution layer.
4. Auth package exports must remain root-barrel based; downstream consumption through deep/internal paths is disallowed.
5. Public exports must include JSDoc and follow Option C per-feature organization (`types.ts`, `constants.ts`, local `index.ts`, one file per major item).

## Consequences

### Positive

- Preserves centralized session/permission truth.
- Keeps runtime-specific auth mechanics isolated from feature modules.
- Reduces drift risk as auth complexity expands in later Phase 5 steps.

### Tradeoffs

- Some feature teams must refactor existing direct patterns to use auth contracts.
- Boundary enforcement adds upfront documentation and review overhead.

## Traceability

- `docs/architecture/plans/PH5.1-Auth-Shell-Plan.md` §5.1 items 1-5
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` §5.1 + locked Option C decisions
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
