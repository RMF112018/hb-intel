# HB Platform Configuration Registry Validation Proof

- Generated UTC: 2026-04-26T10:06:39.9484670Z
- Command run: pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" -AppId "08c399eb-a394-4087-b859-659d493f8dc7" -Tenant "hedrickbrothers.com" -EnvironmentKey "Production"
- Target site: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
- App ID used: 08c399eb-a394-4087-b859-659d493f8dc7
- Tenant: hedrickbrothers.com
- List title: HB Platform Configuration Registry
- List URL: /sites/HBCentral/Lists/HB Platform Configuration Registry
- Field count: 54
- Index count: 12
- Seeded record count: 14 / 14
- Duplicate active key check result: pass
- Secret storage check result: pass
- Read access: True
- Write access: True
- Validation warnings: 0
- Validation failures: 0

## Failures

- None.

## Warnings

- None.

## Manual Actions

- Validate SPFx token acquisition for FoleonApiResource and backend route authorization before marking writePathReady complete.
- Populate any remaining package/version placeholders only after tenant/package validation.
- Confirm list permissions: platform admins manage, app/admin principal read/write as required, Foleon marketing read unless a scoped admin workflow requires otherwise, general employees no direct edit.
- Keep secret values outside SharePoint; SharePoint stores reference names only.

## Summary JSON

- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/platform/config-registry/proof/platform-config-registry-validation-2026-04-26-100617.json
