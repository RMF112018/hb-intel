# HB Platform Configuration Registry Provisioning Runbook

## 1. Objective
Provision and validate the HBCentral list `HB Platform Configuration Registry` using the existing registered app ID `08c399eb-a394-4087-b859-659d493f8dc7`.

This runbook is registry-first and provisioning-only. It does not modify Foleon Manager runtime, homepage runtime, or backend registry consumers.

## 2. Target
- Site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- List title: `HB Platform Configuration Registry`
- Reference key: `HB_PlatformConfigurationRegistry`
- App ID: `08c399eb-a394-4087-b859-659d493f8dc7`
- Tenant: `hedrickbrothers.com` per current repo PnP runner configuration
- Default auth mode: `DeviceLogin`

If tenant truth changes, pass `-Tenant` explicitly. Do not introduce a new authentication model without separate approval.

## 3. Execution Gate
1. Create or update scripts and documentation first.
2. Run provisioning in `-DryRun` mode.
3. Review the dry-run proof and JSON summary.
4. Run live provisioning with `-Seed` only if the dry-run is clean.
5. Run the validator independently.
6. If auth, permissions, PnP module availability, or tenant policy blocks execution, stop and capture the blocker. Do not create a new Entra app or change auth strategy in this pass.

## 4. Commands

Dry-run:

```powershell
pwsh tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -Tenant "hedrickbrothers.com" `
  -EnvironmentKey "Production" `
  -DryRun `
  -Seed
```

Live provisioning and seed:

```powershell
pwsh tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -Tenant "hedrickbrothers.com" `
  -EnvironmentKey "Production" `
  -Seed
```

Independent validation:

```powershell
pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -Tenant "hedrickbrothers.com" `
  -EnvironmentKey "Production"
```

Use `-ReadOnly` on validation only when write probing is not allowed. A read-only validation cannot prove expected write capability.

## 5. Seed Policy
- The provisioner seeds only safe, non-secret baseline records and placeholders.
- Existing non-empty values are preserved unless `-ForceUpdateSeedValues` is explicitly passed.
- Secret-backed values are references only. `ConfigValue` and `ConfigValueJson` must remain blank for secret-like keys.
- Placeholder values remain active but `Blocked` until tenant/API validation confirms the correct value.

## 6. Permissions Model
- Platform admins: full control or list manage rights.
- App/admin service account or app principal: read/write as required for provisioning and future admin workflows.
- Foleon marketing users: read registry only unless a scoped admin workflow requires limited write to Foleon-scoped non-secret records.
- General employees: no direct list edit access.
- Secrets: never stored in SharePoint.

Use Entra ID security groups where possible. This pass does not create groups.

## 7. Proof Artifacts
Provisioning and validation scripts write proof markdown plus JSON under:

```text
docs/architecture/plans/MASTER/platform/config-registry/proof/
```

Expected proof contents:
- command run;
- target site;
- app ID used;
- list title and URL;
- field count and index count;
- seed record counts;
- duplicate active key check result;
- secret storage check result;
- validation warnings;
- unresolved manual action items.

## 8. Manual Follow-Up
- Populate blocked placeholders only after tenant/API validation confirms the values:
  - Foleon list GUIDs;
  - Foleon API base/resource;
  - homepage expected package version;
  - backend Function App URL.
- Confirm permissions against the model in this runbook.
- Re-run validation after any manual data or permission change.
