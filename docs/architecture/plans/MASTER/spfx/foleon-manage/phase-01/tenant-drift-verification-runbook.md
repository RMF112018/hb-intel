# Tenant Drift Verification Runbook — HB Intel Foleon

## Objective

Prove the SharePoint tenant is serving the remediated Foleon package, not a stale reader-only package or outdated component manifest.

## Expected Local Artifact

- Package: `dist/sppkg/hb-intel-foleon.sppkg`
- SHA-256: `3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc`
- Product ID: `c23635f5-ab4d-44c2-96b5-2a2c90f4afc0`
- Version: `1.0.11.0`
- Feature ID: `ae66c036-8036-4f10-bb63-0d75107e7ce9`
- Feature version: `1.0.11.0`
- Web part component ID: `2160edb3-675e-4451-92bb-8345f9d1c71e`
- Expected toolbox entries:
  - `HB Intel Foleon Highlights`
  - `HB Intel Foleon Manager`

Before tenant work, regenerate and prove the artifact locally:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

The proof must show both entries with `hiddenFromToolbox=false`, `supportedHosts=["SharePointWebPart"]`, and routes `highlights` / `manage`.

## App Catalog Drift Checks

Use the M365 CLI or PnP path already established for the tenant. Confirm:

1. The app catalog package title/name is `hb-intel-foleon`.
2. Product ID is `c23635f5-ab4d-44c2-96b5-2a2c90f4afc0`.
3. App catalog version is `1.0.11.0`.
4. There is no side-by-side stale reader-only Foleon package with a different Product ID or older version.
5. The package was uploaded with overwrite/replace semantics.
6. Tenant-wide deployment is not enabled for this list-provisioning package; it must be installed per target site.

Example PnP flow:

```powershell
Connect-PnPOnline -Url "https://<tenant>-admin.sharepoint.com" -Interactive
Get-PnPApp -Scope Tenant | Where-Object { $_.Title -like "*Foleon*" } |
  Select-Object Title, Id, ProductId, Version, Deployed, AppCatalogVersion
```

If stale app catalog entries exist, remove or clearly retire them before testing the target site.

## Site-Installed App Checks

On the target site, prove the site app instance resolves the new package:

```powershell
Connect-PnPOnline -Url "https://<tenant>.sharepoint.com/sites/HBCentral" -Interactive
Get-PnPApp -Scope Site | Where-Object { $_.Title -like "*Foleon*" } |
  Select-Object Title, Id, ProductId, Version, InstalledVersion, AppCatalogVersion
```

Expected:

- Product ID: `c23635f5-ab4d-44c2-96b5-2a2c90f4afc0`
- Version/InstalledVersion/AppCatalogVersion: `1.0.11.0`

If the target site shows an older version, a different Product ID, or a reader-only stale package:

1. Remove the stale site app instance.
2. Reinstall the intended `hb-intel-foleon` package from the app catalog.
3. If removal is not appropriate, run the tenant-approved app upgrade path and re-check the installed version.
4. Clear page/browser cache as needed and re-open modern page edit mode.

Example reinstall flow:

```powershell
$app = Get-PnPApp -Scope Tenant | Where-Object { $_.ProductId -eq "c23635f5-ab4d-44c2-96b5-2a2c90f4afc0" }
Uninstall-PnPApp -Identity $app.Id -Scope Site
Install-PnPApp -Identity $app.Id -Scope Site
Get-PnPApp -Scope Site | Where-Object { $_.ProductId -eq "c23635f5-ab4d-44c2-96b5-2a2c90f4afc0" }
```

Use the tenant's approved cmdlets if `Uninstall-PnPApp` / `Install-PnPApp` signatures differ.

## Toolbox Verification

Edit a modern SharePoint page on the target site and search the toolbox for:

- `HB Intel Foleon Highlights`
- `HB Intel Foleon Manager`
- `Foleon`
- `HB Intel`

Expected behavior:

- Both entries are visible.
- Adding `HB Intel Foleon Highlights` creates the existing Foleon web part component with route property `foleonRoute="highlights"`.
- Adding `HB Intel Foleon Manager` creates the same component ID with route property `foleonRoute="manage"`.
- Unauthorized users still cannot operate the manager route; backend/runtime authorization must return an error/blocked state rather than management controls.

## Route Verification

Verify these routes on modern pages after the site app resolves version `1.0.11.0`:

- `?foleonRoute=highlights`
- `?foleonRoute=manage`
- `?foleonRoute=hub`
- `?foleonRoute=reader&docId=<known-doc-id>`

Capture screenshots or browser evidence that each route renders the intended surface. For manager validation, test both an authorized manager user and a non-manager user.

## List Usability Validation

The toolbox remediation does not prove or repair list provisioning. Validate all four lists separately:

- `Lists/HB_FoleonContentRegistry`
- `Lists/HB_FoleonHomepagePlacements`
- `Lists/HB_FoleonInteractionEvents`
- `Lists/HB_FoleonSyncRuns`

For each list:

1. Open the list in SharePoint UI.
2. Retrieve list metadata through REST/Graph.
3. Retrieve fields and default view fields.
4. Confirm intended app/admin paths can read and write a safe test item where appropriate.
5. Confirm lookup behavior for Homepage Placements to Content Registry.

If a list exists but fails to load, capture:

- List GUID
- URL
- Fields payload
- Default view fields
- SharePoint correlation ID
- Browser console error
- Network response for list page and REST/Graph list metadata calls

Document list defects as open provisioning/repair items. Do not claim the `1.0.11.0` toolbox fix resolves list load failures unless these checks pass independently.
