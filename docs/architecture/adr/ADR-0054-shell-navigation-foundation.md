# ADR-0054: Shell Navigation Foundation and Ownership Boundary

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.1 (Package and Architecture Foundation)
- **Related Plans:** `docs/architecture/plans/PH5.1-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.1 requires the shell package boundary to be explicitly locked before implementing deeper runtime/status/degraded-mode behavior. The shell must remain one coherent product shell in both PWA and SPFx hosting modes.

## Decision

1. `@hbc/shell` is the exclusive owner of shell composition, shell-status derivation, navigation shell, shell layouts, degraded/recovery shell states, and shell-level stores.
2. `@hbc/shell` consumes auth/session/permission truth from `@hbc/auth`; it does not implement provider/auth sourcing itself.
3. Feature modules may not bypass shell registration and guard contracts.
4. Shell package exports must remain root-barrel based; downstream consumption through deep/internal paths is disallowed.
5. Public exports must include JSDoc and follow Option C per-feature organization (`types.ts`, `constants.ts`, local `index.ts`, one file per major item).

## Consequences

### Positive

- Preserves shell cohesion and predictable governance for navigation/status behavior.
- Prevents feature-level coupling to internal auth/runtime mechanics.
- Supports controlled shell extension through explicit contracts.

### Tradeoffs

- Feature teams lose direct shell internals access and must follow registration seams.
- Additional review effort is required to enforce boundary compliance.

## Traceability

- `docs/architecture/plans/PH5.1-Auth-Shell-Plan.md` §5.1 items 1-5
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` §5.1 + locked Option C decisions
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
