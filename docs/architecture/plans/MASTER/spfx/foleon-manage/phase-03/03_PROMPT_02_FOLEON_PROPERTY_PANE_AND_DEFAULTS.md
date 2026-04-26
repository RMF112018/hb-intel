# Prompt 02 — Add Foleon Property Pane Fields and Safe Defaults

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not re-read files that are already within your current context or memory unless verifying a specific line, contradiction, or diff.

## Objective

Add Foleon-specific property pane fields and safe manifest defaults so HB Central admins can configure the runtime values required by the Foleon contract without editing SharePoint lists directly or relying on hidden page JSON.

This prompt targets Audit Findings C and D:

- The Foleon preconfigured entries only set `foleonRoute`.
- The runtime contract requires list GUIDs and governed config values.
- The current shell property pane has no Foleon-specific fields.
- Even after Prompt 01 fixes the bridge, admins still need a supported way to enter the tenant-specific GUIDs and configuration.

## Required Starting Commands

Run and record:

```bash
git status --short
git branch --show-current
git log -3 --oneline
rg "getPropertyPaneConfiguration|PropertyPaneTextField|PropertyPaneDropdown|PropertyPaneToggle|Foleon|foleonRoute|preconfiguredEntries|acceptedFoleonOrigins|expectedPackageVersion" tools apps/hb-intel-foleon -n
```

## Required Files to Inspect

Inspect at minimum:

```text
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json
apps/hb-intel-foleon/src/types/foleon-runtime.types.ts
apps/hb-intel-foleon/docs/provisioning.md
apps/hb-intel-foleon/scripts/prove-foleon-package.ts
```

## Issue Explanation

The Foleon lists may exist and be accessible, but the runtime does not auto-bind to those lists. The provisioning runbook says admins must capture list GUIDs and set them in the webpart mount config.

The current package does not give admins an obvious property pane path for this configuration. That makes the page appear broken even after list provisioning succeeds.

## Implementation Requirements

### 1. Add `PropertyPaneToggle` import if needed

Current shell imports:

```ts
PropertyPaneDropdown,
PropertyPaneTextField,
PropertyPaneSlider,
```

Add `PropertyPaneToggle` if used for `allowPreview`.

### 2. Add Foleon property pane case

In `ShellWebPart.getPropertyPaneConfiguration()`, add a branch for:

```ts
FOLEON_WEBPART_ID
```

Return a Foleon-specific property pane with clear groups.

Suggested groups:

#### Route

- `foleonRoute`
  - dropdown
  - options: `highlights`, `manage`, `hub`, `reader`
  - description: explains that the toolbox default usually sets this.

- `foleonDocId`
  - text field
  - description: only used when route is `reader`.

#### Required SharePoint Lists

- `contentRegistryListId`
  - text field
  - required for all SharePoint-hosted routes.
- `placementsListId`
  - text field
  - required for Highlights.
- `eventsListId`
  - text field
  - required for telemetry writes; should still be configured for production.

Descriptions must point admins to the list titles:

```text
HB_FoleonContentRegistry
HB_FoleonHomepagePlacements
HB_FoleonInteractionEvents
```

#### Foleon Viewer Policy

- `acceptedFoleonOrigins`
  - multiline text field
  - one origin per line or comma-separated.
  - default/placeholder: `https://viewer.us.foleon.com`.

- `allowPreview`
  - toggle
  - default false.
  - description: preview URLs are admin-review only, not production.

#### Navigation and Backend

- `foleonReaderRoutePath`
  - optional text field.
- `foleonApiBaseUrl`
  - optional text field.
- `foleonApiResource`
  - optional text field.

Make clear that backend config is not currently the blocking condition for the red initialization state unless diagnostics prove otherwise.

#### Governance

- `expectedManifestId`
  - default/placeholder: `2160edb3-675e-4451-92bb-8345f9d1c71e`.
- `expectedPackageVersion`
  - default/placeholder: current package version after your bump, likely `1.0.14.0`.

### 3. Add safe preconfigured-entry defaults

In `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`, add safe defaults to both Foleon entries.

Do include:

```json
"acceptedFoleonOrigins": ["https://viewer.us.foleon.com"],
"allowPreview": false,
"expectedManifestId": "2160edb3-675e-4451-92bb-8345f9d1c71e",
"expectedPackageVersion": "1.0.14.0"
```

Do not include tenant-specific list GUIDs in the manifest.

Retain:

```json
"foleonRoute": "highlights"
```

for Highlights and:

```json
"foleonRoute": "manage"
```

for Manager.

### 4. Handle existing page instances explicitly

Existing SharePoint page instances may not receive updated preconfigured defaults automatically. Update docs to state:

- New toolbox additions use the new defaults.
- Existing page instances must be edited and saved, or updated via PnP/REST.
- If the existing instance still fails, remove/re-add after confirming App Catalog package version.

### 5. Update documentation

Update:

```text
apps/hb-intel-foleon/docs/provisioning.md
```

Add a short section:

```text
Property Pane Configuration
```

Include the exact REST URLs to get GUIDs:

```text
/_api/web/lists/getbytitle('HB_FoleonContentRegistry')?$select=Id
/_api/web/lists/getbytitle('HB_FoleonHomepagePlacements')?$select=Id
/_api/web/lists/getbytitle('HB_FoleonInteractionEvents')?$select=Id
/_api/web/lists/getbytitle('HB_FoleonSyncRuns')?$select=Id
```

Clarify that `HB_FoleonSyncRuns` is not currently part of `IFoleonRuntimeContract.listIds`, but it remains provisioned for backend sync proof.

### 6. Update tests/proof

Add or update tests to confirm:

1. Both Foleon entries contain safe defaults.
2. Both Foleon entries still have correct routes.
3. No tenant-specific GUIDs are hard-coded into the manifest.
4. Property pane exposes Foleon config fields only for the Foleon webpart ID.

## Required Validation

Run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Required Closure Report

Return:

1. Files changed.
2. Property pane fields added.
3. Manifest defaults added.
4. Version bump status.
5. Tests added/updated.
6. Validation results.
7. Remaining tenant steps to update existing page instances.
