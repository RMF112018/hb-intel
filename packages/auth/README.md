# @hbc/auth

Phase 5.1 authentication foundation package for HB Intel.

## Ownership Boundary

`@hbc/auth` owns:

- Provider abstraction and runtime-specific auth adapters (PWA/SPFx/mock/dev-override)
- Session normalization into HB Intel auth/session contracts
- Auth/session Zustand store and auth-specific selectors/actions
- Permission evaluation helpers and auth guards
- Auth-specific hooks and auth public barrel exports

`@hbc/auth` must not own:

- Shell layout composition
- Shell status UI orchestration
- Feature-level navigation composition

Those concerns are explicitly owned by `@hbc/shell`.

## Integration Rules (Locked Option C)

- Per-feature organization is required:
  - one file per major item
  - local `types.ts`
  - local `constants.ts`
  - local `index.ts`
- JSDoc is required on public exports.
- Consumers must import only through root public exports.
- Feature modules must not bypass auth store/permission resolution contracts.
- SPFx-specific logic must remain behind approved adapters/host seams.

## Traceability

- `docs/architecture/plans/PH5.1-Auth-Shell-Plan.md` §5.1
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` §5.1 locked Option C boundaries
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- `docs/architecture/adr/ADR-0053-auth-dual-mode-foundation.md`
