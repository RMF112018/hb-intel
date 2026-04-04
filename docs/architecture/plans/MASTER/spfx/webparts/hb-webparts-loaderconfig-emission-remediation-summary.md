# hb-webparts LoaderConfig Emission Remediation Summary

## Root cause

The authoritative multi-manifest emission logic in `tools/build-spfx-package.ts` previously used a real webpart component identity as the shared shell base module identity (`0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0`).

This made non-base webparts depend on another real webpart ID for runtime module resolution, violating neutral loader contract expectations and creating fragile coupling.

## Authoritative source of the emission defect

- `tools/build-spfx-package.ts`
  - shell compiled identity inherited from a real webpart manifest ID
  - per-webpart shims depended on that real webpart module identity
  - base manifest selection depended on compiled manifest ordering behavior

## Remediation applied

- Introduced a dedicated neutral shared shell manifest ID for `hb-webparts`:
  - `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e`
- Shell compile for `hb-webparts` now uses the neutral ID (shell-only identity, not a homepage webpart ID).
- Base runtime module identity is derived deterministically from neutral shell ID + compiled version:
  - `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`
- After cloning/recomposition, the neutral compiled manifest is removed before `package-solution` so no extra toolbox registration is introduced.
- Every emitted webpart manifest now uses:
  - `entryModuleId = <webpart-id>_<version>`
  - `scriptResources` including:
    - SPFx component dependencies
    - neutral shared shell module key mapping to `shell-web-part_*.js`
    - per-webpart shim mapping to `shell-entry-<webpart-id>.js`
- Every per-webpart shim depends on neutral shell identity, not on another webpart ID.

## Files changed

- `tools/build-spfx-package.ts`
- `apps/hb-webparts/config/package-solution.json`
- `docs/architecture/plans/MASTER/spfx/webparts/00_Implementation_Summary.md`
- `docs/architecture/plans/MASTER/spfx/webparts/README.md`
- `docs/architecture/plans/MASTER/spfx/webparts/hb-webparts-loaderconfig-emission-remediation-summary.md`
- `docs/architecture/plans/MASTER/spfx/webparts/hb-webparts-loaderconfig-emission-verification.md`

## Old vs new packaged behavior

### `entryModuleId`
- Old: per-webpart entries resolved through a shared base tied to a real webpart ID.
- New: every webpart has its own `entryModuleId` (`<webpart-id>_1.0.0`) and resolves through a neutral shared shell dependency.

### `scriptResources`
- Old: base dependency identity was a real webpart module ID.
- New: base dependency identity is neutral shell module ID `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`.

## Rebuild path used

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`
- `npx tsx tools/build-spfx-package.ts --domain hb-webparts`

## Packaged verification highlights

- Rebuilt artifact: `dist/sppkg/hb-webparts.sppkg`
- Toolbox manifests remain separately emitted for intended webparts.
- Packaged neutral shell asset defines:
  - `define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)`
- Packaged per-webpart shim assets define `<webpart-id>_1.0.0` and depend only on neutral shell module ID.
- Representative webparts no longer reference another webpart ID as shared base shell dependency.
- Version bump applied:
  - `solution.version`: `1.0.0.11`
  - `feature.version`: `1.0.0.11`

## Secondary warnings

`Card` composition warnings remain separate follow-up work and are not part of this loader metadata remediation scope.

## Remaining risks

- Browser runtime rendering proof in a live SharePoint page was not executed in this environment; package-level evidence confirms neutral identity and canonical loader contract emission, but page runtime should still be validated in tenant upload smoke test.
- `BACKEND_MODE` remains unset by default in local packaging unless explicitly provided by CI/CD.
