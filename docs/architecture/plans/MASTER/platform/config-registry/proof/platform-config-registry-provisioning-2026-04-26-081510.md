# HB Platform Configuration Registry Provisioning Proof

- Generated UTC: 2026-04-26T08:17:34.5588860Z
- Mode: live
- Command run: pwsh tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1 -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" -AppId "08c399eb-a394-4087-b859-659d493f8dc7" -Tenant "hedrickbrothers.com" -EnvironmentKey "Production" -Seed
- Target site: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
- App ID used: 08c399eb-a394-4087-b859-659d493f8dc7
- Tenant: hedrickbrothers.com
- List title: HB Platform Configuration Registry
- List URL: /sites/HBCentral/Lists/HB Platform Configuration Registry
- Field count: 54
- Index count: 12
- Seeded record count: inserted=14, updated=0, skipped=0
- Validation warnings: 0

## Warnings

- None.

## Next Manual Steps

- Run alidate-platform-configuration-registry.ps1 after live provisioning.
- Populate blocked placeholder records only after tenant/API validation confirms the correct values.
- Keep secrets outside SharePoint; only store reference names.

## Summary JSON

- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/platform/config-registry/proof/platform-config-registry-provisioning-2026-04-26-081510.json
