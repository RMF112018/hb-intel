# Foleon Runtime-Contract Remediation Validation Checklist

## Source Validation

Run from repo root:

```bash
git status --short
git branch --show-current
git log -3 --oneline
```

Required checks:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
```

Package build/proof:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
shasum -a 256 dist/sppkg/hb-intel-foleon.sppkg
```

## Version Consistency

If package/runtime behavior changed, confirm `1.0.14.0` appears consistently in:

```text
apps/hb-intel-foleon/config/package-solution.json
apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json
apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts
apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts
apps/hb-intel-foleon/scripts/prove-foleon-package.ts
apps/hb-intel-foleon/docs/provisioning.md
```

Search:

```bash
rg "1\.0\.13\.0|1\.0\.14\.0|FOLEON_PACKAGE_VERSION|EXPECTED_VERSION" apps/hb-intel-foleon docs tools -n
```

## Package Inspection

Inspect package contents:

```bash
unzip -Z1 dist/sppkg/hb-intel-foleon.sppkg | sort
```

Confirm the package includes:

```text
AppManifest.xml
feature_ae66c036-8036-4f10-bb63-0d75107e7ce9.xml
WebPart_2160edb3-675e-4451-92bb-8345f9d1c71e.xml
schema-content-registry.xml
schema-homepage-placements.xml
schema-interaction-events.xml
schema-sync-runs.xml
ClientSideAssets/hb-intel-foleon-app-*.js
```

## Tenant List GUID Capture

Open these as admin/site owner:

```text
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonContentRegistry')?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonHomepagePlacements')?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonInteractionEvents')?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonSyncRuns')?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder
```

Record:

```text
HB_FoleonContentRegistry:
HB_FoleonHomepagePlacements:
HB_FoleonInteractionEvents:
HB_FoleonSyncRuns:
```

## Page Instance Configuration

For each Foleon webpart instance, confirm:

```text
webpart title:
component ID:
instance ID:
foleonRoute:
contentRegistryListId:
placementsListId:
eventsListId:
acceptedFoleonOrigins:
allowPreview:
expectedManifestId:
expectedPackageVersion:
foleonApiBaseUrl:
foleonApiResource:
foleonReaderRoutePath:
```

Expected component ID:

```text
2160edb3-675e-4451-92bb-8345f9d1c71e
```

Expected package version after remediation:

```text
1.0.14.0
```

## Runtime Browser Proof

Normal page load:

```js
JSON.stringify(window.__hbIntel_foleonRuntimeBindingProof, null, 2)
```

Expected:

```json
{
  "hostMode": "sharepoint",
  "canInitialize": true,
  "issueCodes": [],
  "presence": {
    "spfxContext": true,
    "siteUrl": true,
    "contentRegistryListId": true,
    "placementsListId": true,
    "eventsListId": true
  }
}
```

Diagnostics page load:

```text
?foleon-diagnostics=1
```

Expected:

- No generic red initialization error.
- No issue codes.
- If issue codes remain, diagnostics must identify exact missing/mismatched fields.

## Failure Interpretation

### If route is wrong

If Manager reports:

```json
"route": "highlights"
```

then `foleonRoute` is not being bridged or the page instance is stale.

### If route is correct but list IDs are missing

If Manager reports:

```json
"route": "manage"
```

but list ID presence is false, then list GUID properties are missing, not bridged, or not saved to the page instance.

### If package version mismatch appears

If issue codes include:

```text
package-version-mismatch
```

then either:

- page instance still expects an older version, or
- runtime constants/package files are inconsistent.

### If remove/re-add fixes it

If deleting and re-adding the webparts resolves the failure, document stale page instance properties and add it to the tenant runbook.
