# @hbc/shell

Shell orchestration, shell-status, degraded-mode, and host-boundary foundation package for Phase 5.

## Purpose Summary

`@hbc/shell` is the canonical owner of shell composition, shell-state/status arbitration,
navigation shell orchestration, and runtime host boundary enforcement. It consumes
`@hbc/auth` contracts and never re-implements auth truth.

## Architecture Responsibilities

`@hbc/shell` owns:

- Shell core orchestration and shell experience-state resolution.
- Shell layout composition and workspace navigation shell boundaries.
- Shell-status hierarchy and action priority arbitration.
- Degraded-mode and safe recovery shell policy surfaces.
- Redirect-memory orchestration and sign-out cleanup policy.
- Startup timing budgets and release diagnostics surfaces.
- SPFx host boundary validation and normalized host signal seam handling.
- Protected feature registration contract validation/enforcement.

`@hbc/shell` does not own:

- Provider adapter internals or auth identity acquisition.
- Role mapping and permission source-of-truth computation.
- Access override governance workflow decisions.

These concerns are owned by `@hbc/auth`.

## Major Public Contracts

- Shell orchestration: `ShellCore`, `ShellEnvironmentAdapter`, `ShellModeRules`.
- Shell status: `ShellStatusSnapshot`, `SHELL_STATUS_PRIORITY`.
- Degraded/recovery policies: degraded section metadata + recovery contracts.
- SPFx boundary contracts: `SpfxHostBridge`, host signal handlers.
- Protected feature contracts: registration/validation/registry interfaces.
- Startup diagnostics: startup phase, budget, and snapshot contracts.

## Runtime Boundaries

- PWA/SPFx/HB Site Control/dev-override are all host environments for one shell.
- Shell composition authority always remains inside shell rules/adapters.
- SPFx host input is constrained to approved seams (container metadata, identity reference, host signals).

## Integration Rules (Locked Option C)

- Per-feature organization remains required:
  - one file per major item
  - local `types.ts`
  - local `constants.ts`
  - local `index.ts`
- JSDoc is required on public exports.
- Consumers must import through package public barrels.
- Feature modules must not bypass protected feature registration + shell/auth contracts.
- SPFx-specific integrations must remain in documented boundary seams.

## Documentation and Traceability

- Phase plan: `docs/architecture/plans/PH5-Auth-Shell-Plan.md`
- Task plans: `docs/architecture/plans/PH5.5-Auth-Shell-Plan.md` through `PH5.18-Auth-Shell-Plan.md`
- Architecture overview: `docs/architecture/auth-shell-phase5-documentation-overview.md`
- Contracts/reference set: `docs/reference/auth-shell-*.md`
- ADR chain: `docs/architecture/adr/ADR-0054-*.md` through `ADR-0071-*.md`
- Blueprint anchors: `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- Auth integration is guided by alignment markers in `packages/shell/src/ShellCore.tsx` (`D-PH5C-08`).
- Alignment marker standard/reference: `docs/reference/auth/alignment-markers.md`.

## Running Tests

Use the package-local scripts:

- `pnpm test`
- `pnpm test:watch`
- `pnpm test:coverage`

These scripts run through the root Vitest workspace (`vitest.workspace.ts`) and target the
`@hbc/shell` workspace project.

Fallback runner from repo root:

- `bash scripts/test-auth-shell.sh`
- `bash scripts/test-auth-shell.sh --coverage`
