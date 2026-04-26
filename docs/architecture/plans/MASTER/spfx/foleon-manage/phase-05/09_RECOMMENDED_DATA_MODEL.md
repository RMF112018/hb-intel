# 09 — Recommended Data Model

## New List

```text
HB Platform Configuration Registry
```

Recommended internal/reference key:

```text
HB_PlatformConfigurationRegistry
```

Target site:

```text
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

## Purpose

Central non-secret configuration index for HB Intel platform applications, including Foleon, Safety, Kudos, Homepage, Function App settings, SharePoint list GUIDs, site URLs, package versions, accepted origins, API resources, feature flags, and validation state.

## Required Fields

| Field | Type | Required | Indexed | Notes |
| --- | --- | --- | --- | --- |
| Title | Text | Yes | No | Human-readable label. |
| ApplicationKey | Choice/Text | Yes | Yes | `Platform`, `Foleon`, `Homepage`, `Safety`, `Kudos`, `FunctionApp`, `SharePoint`. |
| EnvironmentKey | Choice/Text | Yes | Yes | `Production`, `Staging`, `Development`, `Local`. |
| ScopeKey | Text | No | Yes | Example: `Marketing-New`, `HBCentral`, `SPFx`, `Backend`. |
| ConfigKey | Text | Yes | Yes | Stable key, e.g. `FoleonApiResource`. |
| ConfigValue | Note/Text | No | No | Non-secret scalar value. |
| ConfigValueJson | Note | No | No | Non-secret JSON value. |
| ValueType | Choice | Yes | No | `String`, `Number`, `Boolean`, `Json`, `Url`, `Guid`, `OriginList`, `Version`, `SecretReference`. |
| IsRequired | Boolean | Yes | No | Required for runtime readiness. |
| IsSecretReference | Boolean | Yes | Yes | True when value is a reference only. |
| SecretReferenceName | Text | No | No | Key Vault/App Setting/App Config reference name. |
| SiteUrl | URL/Text | No | No | Related SharePoint site. |
| ListTitle | Text | No | No | Related list title. |
| ListGuid | Text | No | Yes | Related list GUID. |
| WebId | Text | No | No | Optional SharePoint web ID. |
| TenantId | Text | No | No | Optional tenant ID. |
| ManifestId | Text | No | Yes | SPFx manifest ID. |
| ExpectedPackageVersion | Text | No | No | Expected deployed package version. |
| ApiBaseUrl | URL/Text | No | No | Safe API base URL. |
| ApiResource | Text | No | No | API audience/resource. |
| AcceptedOrigins | Note | No | No | Origin allowlist serialized as text/JSON. |
| ValidationRule | Note/Text | No | No | Validation rule description or expression. |
| ValidationStatus | Choice | Yes | Yes | `Not Validated`, `Valid`, `Warning`, `Blocked`, `Expired`. |
| LastValidatedAt | DateTime | No | No | Last validation timestamp. |
| OwnerGroup | Text | No | No | Governing group. |
| AdminNotes | Note | No | No | Notes and manual actions. |
| IsActive | Boolean | Yes | Yes | Active value flag. |
| EffectiveFrom | DateTime | No | Yes | Optional start date. |
| EffectiveThrough | DateTime | No | Yes | Optional end date. |
| LastUpdatedBy | Person | No | No | Author/editor proof. |
| LastUpdatedAt | DateTime | No | Yes | Last business update timestamp. |

## Logical Unique Key

SharePoint should not be assumed to enforce this natively as a composite key:

```text
ApplicationKey + EnvironmentKey + ScopeKey + ConfigKey + IsActive
```

A validation script must detect duplicate active records and mark the registry proof as blocked if duplicates exist.

## Required Indexes

```text
ApplicationKey
EnvironmentKey
ScopeKey
ConfigKey
ListGuid
ManifestId
ValidationStatus
IsSecretReference
IsActive
EffectiveFrom
EffectiveThrough
LastUpdatedAt
```

## Initial Safe Seed Records

Seed only non-secret, known values.

### Foleon — Marketing-New Host Page

```text
ApplicationKey: Foleon
EnvironmentKey: Production
ScopeKey: Marketing-New
ConfigKey: MarketingNewHostPageUrl
ConfigValue: https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Foleon-Manager.aspx
ValueType: Url
IsRequired: true
IsSecretReference: false
ValidationStatus: Not Validated
IsActive: true
```

### Foleon — HBCentral Hub Site

```text
ApplicationKey: Foleon
EnvironmentKey: Production
ScopeKey: HBCentral
ConfigKey: HBCentralHubSiteUrl
ConfigValue: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
ValueType: Url
IsRequired: true
IsSecretReference: false
ValidationStatus: Not Validated
IsActive: true
```

### Foleon — Expected Manifest ID

```text
ApplicationKey: Foleon
EnvironmentKey: Production
ScopeKey: SPFx
ConfigKey: ExpectedManifestId
ConfigValue: 2160edb3-675e-4451-92bb-8345f9d1c71e
ValueType: Guid
IsRequired: true
IsSecretReference: false
ValidationStatus: Not Validated
IsActive: true
```

### Foleon — Accepted Origins

```text
ApplicationKey: Foleon
EnvironmentKey: Production
ScopeKey: SPFx
ConfigKey: AcceptedFoleonOrigins
ConfigValueJson: ["https://viewer.us.foleon.com"]
ValueType: OriginList
IsRequired: true
IsSecretReference: false
ValidationStatus: Not Validated
IsActive: true
```

### Foleon — Client Secret Reference

```text
ApplicationKey: Foleon
EnvironmentKey: Production
ScopeKey: Backend
ConfigKey: FoleonClientSecret
ValueType: SecretReference
IsRequired: true
IsSecretReference: true
SecretReferenceName: HB_FOLEON_CLIENT_SECRET
ValidationStatus: Not Validated
IsActive: true
```

## Placeholder Records

Create active placeholder records marked `Not Validated` or `Blocked` for values that must be filled after tenant validation:

```text
FoleonContentRegistryListGuid
FoleonHomepagePlacementsListGuid
FoleonInteractionEventsListGuid
FoleonSyncRunsListGuid
FoleonApiBaseUrl
FoleonApiResource
HomepageExpectedPackageVersion
FoleonExpectedPackageVersion
BackendFunctionAppUrl
```

## Secret Handling Rule

Never place actual secret values in `ConfigValue`, `ConfigValueJson`, `AdminNotes`, or any other SharePoint field.

Secret-backed records must use:

```text
IsSecretReference: true
ValueType: SecretReference
SecretReferenceName: <backend-managed setting/key name>
```
