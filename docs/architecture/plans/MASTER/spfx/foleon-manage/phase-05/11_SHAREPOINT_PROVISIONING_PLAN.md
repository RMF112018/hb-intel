# 11 — SharePoint Provisioning Plan

## Registry-First Provisioning Order

Provision SharePoint assets in this order:

1. `HB Platform Configuration Registry`
2. Existing Foleon lists, if not already present and validated:
   - `HB_FoleonContentRegistry`
   - `HB_FoleonHomepagePlacements`
   - `HB_FoleonInteractionEvents`
   - `HB_FoleonSyncRuns`
3. Registry seed/placeholder updates that reference validated Foleon list GUIDs.
4. Hosted page/webpart property cleanup or bridge configuration.

## New Platform Registry

Target site:

```text
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

List title:

```text
HB Platform Configuration Registry
```

Registered app ID:

```text
08c399eb-a394-4087-b859-659d493f8dc7
```

## Required Scripts

Create or update scripts following existing repo conventions:

```text
tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1
tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1
```

Adjust paths if repo truth shows a different canonical provisioning location.

## Provisioning Script Requirements

- Accept `SiteUrl`, `AppId`, `EnvironmentKey`, `DryRun`, `Seed`, and `ForceUpdateSeedValues` parameters.
- Default to HBCentral and app ID `08c399eb-a394-4087-b859-659d493f8dc7`.
- Create the list if missing.
- Add missing fields idempotently.
- Add supported indexes.
- Seed safe baseline values idempotently.
- Never overwrite existing non-empty seed values unless explicitly forced.
- Print a clear summary of actions and skips.

## Validation Script Requirements

Validation must prove:

- list exists;
- expected fields exist;
- required indexes exist or unsupported indexes are documented;
- seeded records exist;
- no duplicate active logical keys exist;
- no non-secret records appear to contain obvious secrets;
- secret-reference records do not store actual secret values;
- current app/user can read the registry;
- write access is only available where expected.

## Existing Foleon Lists

Existing Foleon lists should continue to use the current canonical schemas and validation scripts. Do not corrupt or replace working lists.

After validating each Foleon list, update registry records for:

```text
FoleonContentRegistryListGuid
FoleonHomepagePlacementsListGuid
FoleonInteractionEventsListGuid
FoleonSyncRunsListGuid
```

## Proof Artifact

Create a provisioning proof artifact under:

```text
docs/architecture/plans/MASTER/platform/config-registry/proof/
```

Proof must include:

```text
command run
target site
app ID used
list title
list URL
field count
index count
seeded record count
duplicate active key check result
secret storage check result
validation warnings
manual action items
```

## Acceptance Criteria

- Registry can be provisioned repeatedly without duplication or corruption.
- Registry seed records are safe and non-secret.
- Validation can run independently after provisioning.
- The proof artifact explains any skipped index or field limitation.
