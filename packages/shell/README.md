# @hbc/shell

Phase 5.1 shell foundation package for HB Intel.

## Ownership Boundary

`@hbc/shell` owns:

- Shell composition and top-level shell layout orchestration
- Shell status derivation and shell-level status surfaces
- Navigation shell and shell-level route/navigation state
- Degraded/recovery shell states and shell-level stores

`@hbc/shell` must not own:

- Auth provider implementation details
- Direct role/permission truth computation
- Runtime-specific auth session sourcing

Those concerns are explicitly owned by `@hbc/auth`.

## Integration Rules (Locked Option C)

- Per-feature organization is required:
  - one file per major item
  - local `types.ts`
  - local `constants.ts`
  - local `index.ts`
- JSDoc is required on public exports.
- Consumers must import only through root public exports.
- Feature modules must not bypass shell registration/auth guard contracts.
- SPFx-specific integrations must remain constrained to approved host seams.

## Traceability

- `docs/architecture/plans/PH5.1-Auth-Shell-Plan.md` §5.1
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` §5.1 locked Option C boundaries
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- `docs/architecture/adr/ADR-0054-shell-navigation-foundation.md`
