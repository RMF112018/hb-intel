# hb-webparts Packaging Remediation Summary

## Root cause

`apps/hb-webparts` contained multiple source manifests, but the authoritative packager (`tools/build-spfx-package.ts`) selected only the first manifest (`manifests[0]`) and wrote only one shell manifest into `tools/spfx-shell`. As a result, `gulp package-solution --ship` generated a single deployable webpart registration in `hb-webparts.sppkg`.

## Why the old architecture collapsed to one webpart

- Runtime path was a single shell webpart loading one bundle and mounting `ReferenceHomepageComposition` directly.
- Packaging path emitted one compiled shell manifest and relied on implicit feature component ID population.
- Multi-manifest source inventory in `apps/hb-webparts/src/webparts/` was never surfaced into shell release manifests.

## Authoritative changes applied

- `tools/build-spfx-package.ts`
  - Added domain-aware packaging model (`single` default, `multi` for `hb-webparts`).
  - For `hb-webparts`, collect all source webpart manifests, excluding legacy `HbWebparts` (`535f5a17-fc49-40ea-ac16-5d68895884f7`).
  - Populate `solution.features[0].componentIds` with all target manifest IDs.
  - Clone compiled shell manifest into one manifest per target webpart ID before `gulp package-solution --ship`.
  - Updated `.sppkg` verification to validate all expected component IDs.
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
  - Passes `webPartId` and `webPartProperties` into runtime mount config.
- `apps/hb-webparts/src/mount.tsx`
  - Replaced single `ReferenceHomepageComposition` runtime with webpart-ID registry routing for the intended 10 deployable webparts.
  - Keeps `ReferenceHomepageComposition` as fallback/reference only.
- `apps/hb-webparts/config/package-solution.json`
  - Uses valid four-part version values (`1.0.0.8`) for both `solution.version` and feature `version`.

## Version remediation

- Old invalid value: `001.000.008`
- New valid value: `1.0.0.8`
- Applied to:
  - `solution.version`
  - `solution.features[0].version`

## Rebuild path

- `npx tsx tools/build-spfx-package.ts --domain hb-webparts`

## Verification highlights

- Generated artifact: `dist/sppkg/hb-webparts.sppkg`
- Packaged metadata:
  - `AppManifest.xml` contains `Version="1.0.0.8"`
  - Feature XML contains `Version="1.0.0.8"`
- Packaged content includes multiple webpart registrations (`WebPart_*.xml`) for the intended inventory.
- Legacy `HbWebparts` manifest ID is excluded from packaged toolbox output.

## Remaining risks

- Multi-manifest behavior is intentionally scoped to `hb-webparts`; if another domain adopts multi-webpart packaging, it must be explicitly enabled in domain config.
- `BACKEND_MODE` unset warning remains informational and should be set explicitly in CI/CD for deterministic runtime environment selection.
