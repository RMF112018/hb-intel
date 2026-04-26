# Prompt 01 — Registry Reader and Runtime Config Bridge

You are working in the `RMF112018/hb-intel` repo on the live `main` branch unless instructed otherwise.

Do not re-read files that are still within your current context or memory unless you need to verify a contradiction, line number, or current repo truth.

## Objective

Implement the first registry consumer layer after `HB Platform Configuration Registry` has been provisioned.

The goal is to let Foleon Manager and homepage Foleon reader lanes resolve safe non-secret configuration from the central registry while preserving page/webpart property overrides.

Do not implement the full Foleon Manager two-tab UI in this pass. This wave is the shared reader/runtime bridge only.

## Required Preconditions

Before coding, verify or document:

```text
HB Platform Configuration Registry exists in HBCentral
Provisioning proof artifact exists or a blocker is documented
Validation script exists
No duplicate active logical keys exist
No secrets are stored in SharePoint registry fields
```

If the registry is not provisioned, stop and return a blocker report. Do not proceed with a fake registry reader.

## Required Repo-Truth Audit

Inspect current files relevant to runtime config and homepage embedding:

```text
apps/hb-intel-foleon/src/runtime/**
apps/hb-intel-foleon/src/types/foleon-runtime.types.ts
apps/hb-intel-foleon/src/mount.tsx
apps/hb-intel-foleon/src/FoleonApp.tsx
tools/spfx-shell/src/webparts/shell/foleonRuntimeConfigBridge.ts
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
apps/hb-webparts/src/webparts/hbHomepage/wiring/foleonHomepageConfig.ts
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
packages/sharepoint-platform/**
packages/provisioning/**
```

## Required Design

Implement or propose the minimal shared registry read pattern that supports:

```text
ApplicationKey
EnvironmentKey
ScopeKey
ConfigKey
IsActive
EffectiveFrom
EffectiveThrough
ValidationStatus
ValueType
ConfigValue
ConfigValueJson
IsSecretReference
SecretReferenceName
```

## Runtime Precedence

The runtime config resolver must follow:

```text
1. explicit page/webpart override
2. active registry value
3. build-time/package default
4. safe blocked state with diagnostics
```

Do not silently fall back to stale or invalid registry values.

## Foleon Required Keys

Support resolution for at least:

```text
FoleonContentRegistryListGuid
FoleonHomepagePlacementsListGuid
FoleonInteractionEventsListGuid
FoleonSyncRunsListGuid
FoleonApiBaseUrl
FoleonApiResource
AcceptedFoleonOrigins
AllowPreview
ExpectedManifestId
FoleonExpectedPackageVersion
HomepageExpectedPackageVersion
MarketingNewHostPageUrl
HBCentralHubSiteUrl
BackendFunctionAppUrl
```

## Source Mapping

Map registry keys to current mount/config fields:

```text
FoleonContentRegistryListGuid -> contentRegistryListId / foleonContentRegistryListId
FoleonHomepagePlacementsListGuid -> placementsListId / foleonPlacementsListId
FoleonInteractionEventsListGuid -> eventsListId / foleonEventsListId
FoleonApiBaseUrl -> foleonApiBaseUrl
FoleonApiResource -> foleonApiResource
AcceptedFoleonOrigins -> acceptedFoleonOrigins / foleonAcceptedOrigins
AllowPreview -> allowPreview / foleonAllowPreview
ExpectedManifestId -> expectedManifestId / foleonExpectedManifestId
FoleonExpectedPackageVersion -> expectedPackageVersion
HomepageExpectedPackageVersion -> foleonExpectedPackageVersion for homepage embedded lanes
```

## Diagnostics Required

Add runtime proof fields that show, without secrets:

```text
registryResolved: true/false
registryListPresent: true/false
registryValuesResolvedCount
registryValuesMissing
registryValuesBlocked
configSourceByKey: override | registry | default | missing
registryDuplicateActiveKeysDetected: true/false
registrySecretHygieneStatus
```

## Security Requirements

- Never return or log secrets.
- Treat `IsSecretReference = true` as metadata only.
- Do not put registry values into global runtime proof if they are sensitive or admin-only; use booleans/fingerprints where needed.
- Do not weaken backend authorization.

## Testing Requirements

Add tests for:

```text
page override wins over registry
registry value used when override missing
default used only when allowed
missing required value blocks readiness
duplicate active key blocks readiness
expired active value is not used
secret-reference record does not expose secret
homepage Foleon shape and standalone Foleon shape both normalize correctly
```

## Validation Commands

Run repo-truth commands relevant to changed packages. Candidate commands:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
```

Run the registry validation script before and after if available.

## Final Response Required From Agent

Return:

```text
Summary:
Changed Files:
Registry Preconditions:
Config Resolution Precedence Implemented:
Tests Added:
Commands Run:
Validation Results:
Unresolved Risks / Manual Actions:
Commit Message:
```
