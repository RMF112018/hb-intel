# hb-webparts Shell Loader Contract Remediation Summary

## Root cause

`hb-webparts` packaged manifests used `loaderConfig.entryModuleId: "shell-web-part"`, but the compiled shell asset registered an AMD module identity in SPFx format (`<component-id>_<version>`, e.g. `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0`). SharePoint attempted to require `shell-web-part`, which was never defined, causing `Could not load shell-web-part in require` across all deployed hb-webparts webparts.

## Authoritative mismatch source

The mismatch was introduced in authoritative packaging generation inside `tools/build-spfx-package.ts` when multi-manifest hb-webparts manifests were cloned from source and preserved a synthetic `shell-web-part` loader contract instead of the compiled SPFx shell module identity.

## Files changed

- `tools/build-spfx-package.ts`
- `apps/hb-webparts/config/package-solution.json`
- `docs/architecture/plans/MASTER/spfx/webparts/00_Implementation_Summary.md`
- `docs/architecture/plans/MASTER/spfx/webparts/README.md`

## Old vs new loader contract

- Old packaged contract:
  - `entryModuleId`: `shell-web-part`
  - `scriptResources` key: `shell-web-part`
  - compiled shell AMD define: `<compiled-id>_<version>`
  - contract match: **No**
- New packaged contract:
  - `entryModuleId`: `<compiled-id>_<version>`
  - `scriptResources` key: `<compiled-id>_<version>`
  - compiled shell AMD define: same `<compiled-id>_<version>`
  - contract match: **Yes**

## Version metadata

- `solution.version`: `1.0.0.8` -> `1.0.0.9`
- `solution.features[0].version`: `1.0.0.8` -> `1.0.0.9`

## Rebuild path used

- `npx tsx tools/build-spfx-package.ts --domain hb-webparts`

## Packaged verification results

- `dist/sppkg/hb-webparts.sppkg` produced successfully.
- hb-webparts manifests use shared compiled AMD loader identity in both `entryModuleId` and `scriptResources` key.
- No hb-webparts manifest retains `entryModuleId: "shell-web-part"`.
- Shell asset exists (`ClientSideAssets/shell-web-part_*.js`) and defines the same shared module identity referenced by manifests.
- Valid four-part package versions are preserved in `AppManifest.xml` and feature XML (`1.0.0.9`).

## Remaining risks

- Shared module identity remains tied to the compiled shell base manifest id/version; if the base compiled manifest selection changes unexpectedly, loader identity rewriting must continue to derive from the compiled output (as implemented) rather than hardcoded values.
- `BACKEND_MODE` unset warning remains informational and should still be explicitly set in CI/CD.
