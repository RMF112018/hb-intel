# hb-webparts Version Remediation Summary

## Root cause
`hb-webparts.sppkg` was rejected by SharePoint App Catalog because packaged manifest version fields used the invalid value `001.000.008` (zero-padded 3-part style), which fails SharePoint `VersionDefinition` validation.

## Authoritative source of defect
- Authoritative source: `apps/hb-webparts/config/package-solution.json`
- Derived packaging file: `tools/spfx-shell/config/package-solution.json` (copied by `tools/build-spfx-package.ts` during orchestrated packaging)

The invalid value originated in the authoritative app config and was propagated into both packaged XML version locations.

## Files changed
- `apps/hb-webparts/config/package-solution.json`

## Value remediation
- Old value: `001.000.008`
- New value: `1.0.0.8`

Updated fields:
- `solution.version`
- `solution.features[0].version`

## Rebuild path used
- `npx tsx tools/build-spfx-package.ts --domain hb-webparts`

## Packaging verification results
Artifact:
- `dist/sppkg/hb-webparts.sppkg` (84 KB)

Verified packaged XML:
- `AppManifest.xml` contains `Version="1.0.0.8"`
- `feature_1f447e99-a2c7-43e5-83d8-d2ed78ed1a96.xml` contains `Version="1.0.0.8"`
- No `001.000.008` string remains in the rebuilt package payload

ID stability checks:
- Product ID unchanged: `39b8f2ea-59bd-45b7-b4ec-b590b316833b`
- Feature ID unchanged: `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96`

## Additional notes
Packaging emitted an informational warning that `BACKEND_MODE` is not set for `hb-webparts`; this did not affect package generation or version validity, but CI/CD should set it explicitly to avoid environment ambiguity.
