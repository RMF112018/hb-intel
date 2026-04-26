# HB Platform Configuration Registry Value Update Proof

- Generated UTC: 2026-04-26T09:12:41.1504940Z
- Mode: live
- Command run: pwsh tools/pnp-runner-local/scripts/update-platform-configuration-registry-values.ps1 -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" -AppId "08c399eb-a394-4087-b859-659d493f8dc7" -Tenant "hedrickbrothers.com" -EnvironmentKey "Production" -TargetSet FoleonApiResource
- Target site: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
- App ID used: 08c399eb-a394-4087-b859-659d493f8dc7
- Tenant: hedrickbrothers.com
- Target set: FoleonApiResource
- List title: HB Platform Configuration Registry
- List URL: /sites/HBCentral/Lists/HB Platform Configuration Registry
- Intended updates: 1 / 1
- GUID parse check: pass
- Backend URL check: pass
- Duplicate active key check: pass
- Secret hygiene check: pass
- FoleonClientSecret reference-only check: pass
- Errors: 0
- Warnings: 0

## Updated Records

- FoleonApiResource: updated; logical key Foleon|Production|Backend|FoleonApiResource|True; fields AdminNotes, ApiResource, ConfigValue, LastUpdatedAt, ValidationStatus, ValueType

## Errors

- None.

## Warnings

- None.

## Summary JSON

- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/platform/config-registry/proof/platform-config-registry-values-update-2026-04-26-091226.json
