# HB Platform Configuration Registry Value Update Proof

- Generated UTC: 2026-04-26T08:40:45.4731860Z
- Mode: live
- Command run: pwsh tools/pnp-runner-local/scripts/update-platform-configuration-registry-values.ps1 -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" -AppId "08c399eb-a394-4087-b859-659d493f8dc7" -Tenant "hedrickbrothers.com" -EnvironmentKey "Production"
- Target site: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
- App ID used: 08c399eb-a394-4087-b859-659d493f8dc7
- Tenant: hedrickbrothers.com
- List title: HB Platform Configuration Registry
- List URL: /sites/HBCentral/Lists/HB Platform Configuration Registry
- Intended updates: 6 / 6
- GUID parse check: pass
- Backend URL check: pass
- Duplicate active key check: pass
- Secret hygiene check: pass
- FoleonClientSecret reference-only check: pass
- Errors: 0
- Warnings: 0

## Updated Records

- FoleonContentRegistryListGuid: updated; logical key Foleon|Production|HBCentral|FoleonContentRegistryListGuid|True; fields AdminNotes, ConfigValue, LastUpdatedAt, ListGuid, ValidationStatus
- FoleonHomepagePlacementsListGuid: updated; logical key Foleon|Production|HBCentral|FoleonHomepagePlacementsListGuid|True; fields AdminNotes, ConfigValue, LastUpdatedAt, ListGuid, ValidationStatus
- FoleonInteractionEventsListGuid: updated; logical key Foleon|Production|HBCentral|FoleonInteractionEventsListGuid|True; fields AdminNotes, ConfigValue, LastUpdatedAt, ListGuid, ValidationStatus
- FoleonSyncRunsListGuid: updated; logical key Foleon|Production|HBCentral|FoleonSyncRunsListGuid|True; fields AdminNotes, ConfigValue, LastUpdatedAt, ListGuid, ValidationStatus
- BackendFunctionAppUrl: updated; logical key FunctionApp|Production|Backend|BackendFunctionAppUrl|True; fields AdminNotes, ApiBaseUrl, ConfigValue, LastUpdatedAt, ValidationStatus
- FoleonApiBaseUrl: updated; logical key Foleon|Production|Backend|FoleonApiBaseUrl|True; fields AdminNotes, ApiBaseUrl, ConfigValue, LastUpdatedAt, ValidationStatus

## Errors

- None.

## Warnings

- None.

## Summary JSON

- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/platform/config-registry/proof/platform-config-registry-values-update-2026-04-26-084024.json
