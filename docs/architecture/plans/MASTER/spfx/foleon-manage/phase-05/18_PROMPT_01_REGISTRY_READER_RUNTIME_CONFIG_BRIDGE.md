# Prompt 01 — Registry Reader and Runtime Config Bridge

You are working in the `RMF112018/hb-intel` repo on the live `main` branch unless instructed otherwise.

Do not re-read files that are still within your current context or memory unless you need to verify a contradiction, line number, or current repo truth.

## Objective

Implement the first **registry consumer layer** after the `HB Platform Configuration Registry` has been provisioned and populated with confirmed Foleon list/backend values.

The goal is to let the Foleon Manager and homepage Foleon reader lanes resolve safe, non-secret configuration from the central registry while preserving explicit page/webpart property overrides.

This wave is the shared registry reader/runtime bridge only.

Do **not** implement:

- the full Foleon Manager two-tab UI;
- Foleon content workflow changes;
- homepage layout changes;
- backend route changes unless repo truth proves a minimal safe-config route is already intended and required;
- SPFx package version bumps unless source changes require it under repo conventions.

## Current Confirmed State

The `HB Platform Configuration Registry` list has been provisioned in HBCentral.

Registry URL:

```text
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB Platform Configuration Registry
```

Provisioning commit:

```text
9b32ec870 platform: provision HB configuration registry
```

Tenant data update commit:

```text
69aa206f7 platform: update Foleon registry values
```

Existing registered app ID used for provisioning and validation:

```text
08c399eb-a394-4087-b859-659d493f8dc7
```

Confirmed registry values now populated:

```text
FoleonContentRegistryListGuid = 2e57615d-457e-49b8-aef3-038e85cbe068
FoleonHomepagePlacementsListGuid = 5b4754b6-9411-453d-8e16-1247ec5b476a
FoleonInteractionEventsListGuid = 7786b5ac-d1e5-418b-9951-8e797dda3d7a
FoleonSyncRunsListGuid = f29dabe9-16c8-4c67-ab9e-98e12f771680
BackendFunctionAppUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
FoleonApiBaseUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
```

Important URL rule:

```text
Do not append /api to BackendFunctionAppUrl or FoleonApiBaseUrl.
The current Foleon API client composes /api/foleon/... routes itself.
```

Confirmed remaining unresolved values:

```text
FoleonApiResource
HomepageExpectedPackageVersion
```

The Foleon Manager write path must **not** be considered fully ready until `FoleonApiResource` is populated and SPFx token acquisition is validated.

## Required Preconditions

Before coding, verify or document:

```text
HB Platform Configuration Registry exists in HBCentral
Prompt 00 provisioning proof artifact exists
Tenant data update proof artifact exists
Registry validation script exists
No duplicate active logical keys exist
No secrets are stored in SharePoint registry fields
FoleonClientSecret remains a secret reference only
```

Run the existing validator before implementation if practical:

```powershell
pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -Tenant "hedrickbrothers.com" `
  -EnvironmentKey "Production"
```

If the registry is not provisioned, duplicated, or fails secret hygiene, stop and return a blocker report. Do not proceed with a fake registry reader.

## Scope Guardrails

- Use repo `main` as truth.
- Do not touch unrelated dirty files.
- Preserve existing Safety, Kudos, Homepage, and Foleon behavior.
- Preserve existing page/webpart properties as overrides.
- Do not store or expose secrets.
- Do not weaken backend authorization.
- Do not mark Foleon Manager writes as fully ready while `FoleonApiResource` remains missing.
- Do not convert blocked registry placeholders into usable runtime config.
- Do not silently fall back to stale, expired, duplicated, or invalid registry values.
- If runtime implementation requires a broader architectural decision, stop and report instead of expanding scope.

## Required Repo-Truth Audit

Inspect current files relevant to runtime config, registry docs, and homepage embedding:

```text
apps/hb-intel-foleon/src/runtime/**
apps/hb-intel-foleon/src/types/foleon-runtime.types.ts
apps/hb-intel-foleon/src/mount.tsx
apps/hb-intel-foleon/src/FoleonApp.tsx
apps/hb-intel-foleon/src/pages/manage/**
tools/spfx-shell/src/webparts/shell/foleonRuntimeConfigBridge.ts
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
apps/hb-webparts/src/webparts/hbHomepage/wiring/foleonHomepageConfig.ts
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
packages/foleon-reader/**
packages/sharepoint-platform/**
packages/provisioning/**
backend/functions/src/config/**
backend/functions/src/functions/adminApi/foleon-routes.ts
docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-platform-configuration-registry.md
docs/architecture/plans/MASTER/platform/config-registry/**
```

## Required Registry Read Pattern

Implement or document the minimal shared registry read pattern that supports the registry fields below:

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
IsRequired
IsSecretReference
SecretReferenceName
SiteUrl
ListTitle
ListGuid
ManifestId
ExpectedPackageVersion
ApiBaseUrl
ApiResource
AcceptedOrigins
ValidationRule
AdminNotes
LastValidatedAt
LastUpdatedAt
```

The reader must resolve by logical key:

```text
ApplicationKey + EnvironmentKey + ScopeKey + ConfigKey + IsActive
```

It must support exact-key resolution and scoped resolution. Where a config value is expected to be global within an application, support a controlled lookup strategy such as:

```text
1. exact ScopeKey requested
2. known fallback ScopeKey for the application, if explicitly configured
3. missing
```

Do not create broad fuzzy lookup behavior.

## Required Runtime Precedence

The runtime config resolver must follow this precedence:

```text
1. explicit page/webpart property override
2. valid active registry value
3. build-time/package default, only where allowed
4. safe blocked state with diagnostics
```

Rules:

- Explicit page/webpart properties must win over registry values.
- Registry values must win over build-time defaults when valid.
- Defaults may be used only for known safe values such as packaged manifest/package identity or default accepted origin behavior already allowed by repo truth.
- Missing required values must produce readiness diagnostics, not silent fake readiness.
- Blocked, expired, duplicate, invalid, or secret-reference-only records must not be consumed as normal runtime values.

## Required Registry Value Handling

Implement typed normalization for:

```text
String
Number
Boolean
Json
Url
Guid
OriginList
Version
SecretReference
```

Minimum validation behavior:

- `Guid`: must parse as GUID.
- `Url`: must be absolute `https://` unless repo truth explicitly permits another scheme for local development.
- `OriginList`: must parse from JSON array or accepted origins Note field; every origin must be an exact origin, not a wildcard.
- `Boolean`: must parse safely from typed field or approved text values.
- `Version`: must be non-empty and match repo version conventions.
- `Json`: must parse as valid JSON.
- `SecretReference`: must return only safe metadata that a secret reference exists; never return secret material.

## Required Foleon Registry Keys

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

## Required Source Mapping

Map registry keys to current mount/config fields without hardcoding the confirmed values directly in runtime source:

```text
FoleonContentRegistryListGuid -> contentRegistryListId / foleonContentRegistryListId
FoleonHomepagePlacementsListGuid -> placementsListId / foleonPlacementsListId
FoleonInteractionEventsListGuid -> eventsListId / foleonEventsListId
FoleonApiBaseUrl -> foleonApiBaseUrl
FoleonApiResource -> foleonApiResource
AcceptedFoleonOrigins -> acceptedFoleonOrigins / foleonAcceptedOrigins
AllowPreview -> allowPreview / foleonAllowPreview
ExpectedManifestId -> expectedManifestId / foleonExpectedManifestId
FoleonExpectedPackageVersion -> expectedPackageVersion for standalone Foleon app
HomepageExpectedPackageVersion -> foleonExpectedPackageVersion for homepage embedded lanes
BackendFunctionAppUrl -> fallback source for FoleonApiBaseUrl only when FoleonApiBaseUrl is missing and BackendFunctionAppUrl is valid
```

Important:

- `FoleonApiBaseUrl` and `BackendFunctionAppUrl` are currently the same confirmed value, but the mapping should keep them conceptually separate.
- Do not pass `FoleonSyncRunsListGuid` into frontend Foleon mount config unless repo truth adds a safe consumer for it.
- Do not pass `FoleonClientSecret` or any secret reference into frontend runtime config.

## Required Readiness Model

Implement or document a precise readiness model for Foleon registry consumption.

Minimum states:

```text
registry-unavailable
registry-invalid
registry-partial
list-bindings-ready
backend-url-ready
auth-resource-missing
token-provider-unavailable
write-path-ready
```

Current expected state after this wave, before `FoleonApiResource` is populated:

```text
list-bindings-ready
backend-url-ready
auth-resource-missing
write-path not ready
```

The Foleon Manager write path must remain blocked or warning-gated until:

```text
FoleonApiResource is present
SPFx token provider can acquire a token for that resource
backend /api/foleon/config or equivalent safe endpoint confirms authorization/readiness
```

## Required Diagnostics

Add safe runtime proof fields that show, without exposing secrets:

```text
registryResolved: true/false
registryListPresent: true/false
registryValuesResolvedCount
registryValuesMissing
registryValuesBlocked
registryValuesInvalid
registryValuesExpired
configSourceByKey: override | registry | default | missing | blocked | invalid | expired | duplicate
registryDuplicateActiveKeysDetected: true/false
registrySecretHygieneStatus
registryReadinessState
foleonReadiness: {
  listBindingsReady: true/false
  backendUrlPresent: true/false
  apiResourcePresent: true/false
  tokenProviderAvailable: true/false
  writePathReady: true/false
}
```

Do not put raw list GUIDs, API resources, URLs, secrets, or admin-only values into global proof unless the existing repo proof pattern already permits it. Prefer presence booleans, counts, fingerprints, and status labels.

## Security Requirements

- Never return or log secrets.
- Treat `IsSecretReference = true` as metadata only.
- Do not expose `SecretReferenceName` in public runtime proof unless admin diagnostics are explicitly enabled and repo proof conventions allow it.
- Do not put secret-reference records into frontend runtime config.
- Do not weaken backend authorization.
- Do not create direct browser-side calls that require privileged application permissions.
- If browser-side SPFx reads the HBCentral registry, use delegated SharePoint/SPFx context only and handle lack of permissions as a registry-readiness diagnostic.
- If backend reads the registry, use existing managed identity/app-token patterns and keep safe-config routes non-secret.

## Implementation Guidance

Prefer a small reusable package or module under the existing SharePoint/platform area if repo truth supports it, for example:

```text
packages/sharepoint-platform/src/config-registry/**
```

Potential contracts:

```ts
type ConfigSource = 'override' | 'registry' | 'default' | 'missing' | 'blocked' | 'invalid' | 'expired' | 'duplicate';

interface PlatformConfigRegistryRecord {
  applicationKey: string;
  environmentKey: string;
  scopeKey?: string;
  configKey: string;
  valueType: string;
  isActive: boolean;
  validationStatus: string;
  isSecretReference: boolean;
  secretReferenceName?: string;
  configValue?: string;
  configValueJson?: string;
  siteUrl?: string;
  listGuid?: string;
  manifestId?: string;
  expectedPackageVersion?: string;
  apiBaseUrl?: string;
  apiResource?: string;
  acceptedOrigins?: string;
  effectiveFrom?: string;
  effectiveThrough?: string;
}

interface PlatformConfigResolution<T = unknown> {
  key: string;
  source: ConfigSource;
  value?: T;
  diagnostics: string[];
  fingerprint?: string;
}
```

Adjust naming and placement based on repo truth.

## Integration Targets

### Standalone Foleon app

Integrate the resolved registry config into the standalone Foleon mount/runtime contract in a way that preserves page/webpart overrides.

Likely areas:

```text
apps/hb-intel-foleon/src/mount.tsx
apps/hb-intel-foleon/src/runtime/**
apps/hb-intel-foleon/src/types/foleon-runtime.types.ts
tools/spfx-shell/src/webparts/shell/foleonRuntimeConfigBridge.ts
```

### Homepage embedded lanes

Integrate registry-aware mapping for homepage embedded Foleon lanes while preserving existing homepage config properties.

Likely areas:

```text
apps/hb-webparts/src/webparts/hbHomepage/wiring/foleonHomepageConfig.ts
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
```

If homepage runtime cannot safely read the registry in this pass, document the blocker and implement only the pure mapping/test layer needed for the next wave.

## Required Tests

Add tests for:

```text
page override wins over registry
registry value used when override missing
default used only when allowed
missing required value blocks readiness
blocked placeholder is not used
duplicate active key blocks readiness
expired active value is not used
invalid GUID blocks value
invalid URL blocks value
invalid OriginList JSON blocks value
secret-reference record does not expose secret
FoleonApiBaseUrl is normalized without appending /api
BackendFunctionAppUrl can be used only as fallback for FoleonApiBaseUrl
FoleonApiResource missing yields auth-resource-missing and writePathReady=false
homepage Foleon shape and standalone Foleon shape both normalize correctly
safe runtime proof does not expose raw secret references
```

## Validation Commands

Run repo-truth commands relevant to changed packages. Candidate commands:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

If a shared package is modified, run its focused checks as well, for example:

```bash
pnpm --filter @hbc/sharepoint-platform check-types
pnpm --filter @hbc/sharepoint-platform test
```

Run the registry validation script before and after if available:

```powershell
pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -Tenant "hedrickbrothers.com" `
  -EnvironmentKey "Production"
```

## Documentation Requirements

Update or add a concise implementation note under:

```text
docs/architecture/plans/MASTER/platform/config-registry/
```

The note must cover:

```text
registry reader contract
runtime precedence
Foleon mapping
readiness states
remaining unresolved values
manual action needed for FoleonApiResource
manual action needed for HomepageExpectedPackageVersion
security/secret handling
```

## Acceptance Criteria

This wave is complete only when:

- the registry reader has a typed result contract;
- explicit page/webpart overrides still win;
- registry values can populate Foleon list GUIDs and API base URL when no override is provided;
- blocked placeholders are not consumed as valid config;
- `FoleonApiResource` missing is surfaced as a precise auth readiness issue;
- `writePathReady` remains false until auth is configured and token acquisition is proven;
- no secrets or secret references are exposed in frontend runtime config;
- standalone Foleon and homepage Foleon mapping are both covered by tests or a documented blocker;
- runtime proof exposes safe readiness diagnostics;
- validation commands pass or failures are documented as unrelated/pre-existing with evidence;
- closure report identifies which registry values remain unresolved.

## Expected Closure State

The expected post-wave state is **not** “Foleon Manager fully write-ready.”

The expected post-wave state is:

```text
Registry reader implemented.
Foleon list GUIDs and API base URL can be resolved from registry.
Explicit webpart overrides still work.
FoleonApiResource remains unresolved unless populated separately.
Manager write path remains blocked/warning-gated by auth readiness.
Next wave can resolve the Manager load/write-readiness error once FoleonApiResource is confirmed.
```

## Final Response Required From Agent

Return:

```text
Summary:
Changed Files:
Registry Preconditions:
Registry Reader Design:
Config Resolution Precedence Implemented:
Foleon Mapping:
Foleon Readiness State:
Tests Added:
Commands Run:
Validation Results:
Blocked Registry Values Remaining:
Unresolved Risks / Manual Actions:
Commit Message:
```
