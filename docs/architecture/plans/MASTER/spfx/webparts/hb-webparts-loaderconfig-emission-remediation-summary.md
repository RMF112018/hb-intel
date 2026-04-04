# hb-webparts LoaderConfig Emission Remediation Summary

## Root cause

The authoritative multi-webpart manifest composition step in `tools/build-spfx-package.ts` cloned one compiled shell manifest and reused its `entryModuleId` (`0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0`) for every emitted hb-webparts webpart manifest.

That caused unrelated webparts (for example `HB Hero Banner` and `Project / Portfolio Spotlight`) to request the first-webpart module identity at runtime. The packaged `scriptResources` map was likewise shared and only exposed the first-webpart module key, so per-webpart loader contracts were not emitted correctly.

## Authoritative source of the emission defect

- `tools/build-spfx-package.ts`
  - multi-manifest cloning logic set `loaderConfig.entryModuleId` to a single shared compiled ID for all target manifests
  - multi-manifest cloning logic wrote the same `scriptResources` object for all target manifests

## Remediation applied

- Keep the compiled shell asset as the base runtime module (`shell-web-part_66a8874d87ce501231b6.js` defining `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0`).
- Generate one per-webpart AMD shim asset for each non-base webpart in `tools/spfx-shell/release/assets/`:
  - module ID: `<webpart-id>_1.0.0`
  - module body: forwards to base compiled shell module ID.
- Emit per-webpart manifest loader contracts:
  - `entryModuleId` is now `<that-webpart-id>_1.0.0`
  - `scriptResources` always includes the base shell module mapping
  - `scriptResources` also includes that webpart's shim module mapping when the webpart is not the base shell module ID

## Files changed

- `tools/build-spfx-package.ts`
- `apps/hb-webparts/config/package-solution.json`
- `docs/architecture/plans/MASTER/spfx/webparts/00_Implementation_Summary.md`
- `docs/architecture/plans/MASTER/spfx/webparts/README.md`
- `docs/architecture/plans/MASTER/spfx/webparts/hb-webparts-loaderconfig-emission-remediation-summary.md`
- `docs/architecture/plans/MASTER/spfx/webparts/hb-webparts-loaderconfig-emission-verification.md`

## Old vs new packaged behavior

### `entryModuleId`
- Old: all representative webparts used `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0`
- New:
  - Company Pulse: `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0`
  - HB Hero Banner: `39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0`
  - Project / Portfolio Spotlight: `8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0`
  - Priority Actions Rail: `b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0`

### `scriptResources`
- Old: representative webparts reused one runtime module key (`0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0`) and one shell path mapping.
- New:
  - base shell module key is preserved for shared shell runtime
  - each non-base webpart includes an additional per-webpart shim key mapped to `shell-entry-<webpart-id>.js`

## Rebuild path used

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`
- `npx tsx tools/build-spfx-package.ts --domain hb-webparts`

## Packaged verification highlights

- Rebuilt artifact: `dist/sppkg/hb-webparts.sppkg`
- Toolbox manifests remain separately emitted (`WebPart_<id>.xml` for all intended webparts).
- Packaged `ClientSideAssets` now include per-webpart shim files (`shell-entry-*.js`) plus the shared shell asset.
- Representative webparts no longer reuse `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` as `entryModuleId` unless they are the base webpart.
- Version bump applied:
  - `solution.version`: `1.0.0.10`
  - `feature.version`: `1.0.0.10`

## Why RequireJS should now resolve correctly

Each packaged webpart now requests its own module identity via `entryModuleId`, and the package contains a script resource path that defines that exact module identity (either directly via shared base module for Company Pulse, or via per-webpart shim module for other webparts). This eliminates the prior cross-webpart shared-ID mismatch.

## Secondary warnings

`Card` composition warnings are outside loader metadata emission scope and should be tracked as follow-up UX/component conformance work only.

## Remaining risks

- The base compiled shell module identity is still anchored to the compiled base manifest ID/version. If that selection strategy changes, shim generation must continue deriving identities from compiled output (not hardcoded values).
- `BACKEND_MODE` remains unset by default in local packaging unless explicitly provided in CI/CD.
