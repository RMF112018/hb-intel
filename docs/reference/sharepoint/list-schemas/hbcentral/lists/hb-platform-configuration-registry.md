# HB Platform Configuration Registry

## 1. Objective
- Canonical schema reference for the centralized, non-secret HB Intel platform configuration registry.
- Site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Contract authority: `tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1`.
- Scope: provisioning and validation only. Runtime consumers are intentionally deferred.

## 2. List-Level Metadata
- List title: `HB Platform Configuration Registry`
- Reference key: `HB_PlatformConfigurationRegistry`
- Expected URL: `/sites/HBCentral/Lists/HB Platform Configuration Registry/AllItems.aspx`
- Template: Generic list (`BaseTemplate=100`)
- Attachments: `false`
- Folder creation: `false`
- Versioning: `true`
- Content types enabled: `false`
- Operating posture: one active row per logical key `ApplicationKey + EnvironmentKey + ScopeKey + ConfigKey + IsActive`

## 3. Runtime Ownership and Consumption
- Provisioning owner: `tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1`.
- Validation owner: `tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1`.
- Initial consumer intent: platform registry reader/runtime bridge in a later wave.
- Secrets: never stored in SharePoint. Secret-backed values store only reference names such as Azure Key Vault secret names or backend-managed setting keys.

## 4. Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Default | Choices | Semantic Purpose |
|---|---|---|---:|---:|---|---|---|
| Config Name | `Title` | Single line of text | Yes | No | blank |  | Human-readable config row name. |
| Application Key | `ApplicationKey` | Choice, fill-in enabled where supported | Yes | Yes | blank | `Platform`, `Foleon`, `Homepage`, `Safety`, `Kudos`, `FunctionApp`, `SharePoint` | Owning application/domain. |
| Environment Key | `EnvironmentKey` | Choice, fill-in enabled where supported | Yes | Yes | `Production` seed default | `Production`, `Staging`, `Development`, `Local` | Environment partition. |
| Scope Key | `ScopeKey` | Single line of text | No | Yes | blank |  | Optional scope such as `SPFx`, `Backend`, `HBCentral`, or site key. |
| Config Key | `ConfigKey` | Single line of text | Yes | Yes | blank |  | Stable setting key within application/environment/scope. |
| Config Value | `ConfigValue` | Multiple lines of text (plain) | No | No | blank |  | Non-secret scalar value. Uses Note to avoid URL/value truncation. |
| Config Value JSON | `ConfigValueJson` | Multiple lines of text (plain) | No | No | blank |  | Non-secret structured value. Uses Note to avoid JSON truncation. |
| Value Type | `ValueType` | Choice, fill-in enabled where supported | Yes | No | blank | `String`, `Number`, `Boolean`, `Json`, `Url`, `Guid`, `OriginList`, `Version`, `SecretReference` | Value interpretation contract. |
| Is Required | `IsRequired` | Yes/No | Yes | No | `No` |  | Marks config required for validation readiness. |
| Is Secret Reference | `IsSecretReference` | Yes/No | Yes | Yes | `No` |  | Indicates this row points to a secret stored outside SharePoint. |
| Secret Reference Name | `SecretReferenceName` | Single line of text | No | No | blank |  | External secret reference name only; never the secret value. |
| Site URL | `SiteUrl` | Single line of text | No | No | blank |  | SharePoint site URL reference. |
| List Title | `ListTitle` | Single line of text | No | No | blank |  | SharePoint list display title reference. |
| List GUID | `ListGuid` | Single line of text | No | Yes | blank |  | SharePoint list GUID after tenant validation. |
| Web ID | `WebId` | Single line of text | No | No | blank |  | SharePoint web GUID after tenant validation. |
| Tenant ID | `TenantId` | Single line of text | No | No | blank |  | Tenant GUID after tenant validation. |
| Manifest ID | `ManifestId` | Single line of text | No | Yes | blank |  | SPFx component manifest ID reference. |
| Expected Package Version | `ExpectedPackageVersion` | Single line of text | No | No | blank |  | Expected package version for validation/reporting. |
| API Base URL | `ApiBaseUrl` | Single line of text | No | No | blank |  | Backend API base URL reference. |
| API Resource | `ApiResource` | Single line of text | No | No | blank |  | Token resource/audience ID reference. |
| Accepted Origins | `AcceptedOrigins` | Multiple lines of text (plain) | No | No | blank |  | JSON/list of accepted origins. Uses Note to avoid truncation. |
| Validation Rule | `ValidationRule` | Multiple lines of text (plain) | No | No | blank |  | Optional machine or human validation rule. |
| Validation Status | `ValidationStatus` | Choice, fill-in enabled where supported | Yes | Yes | blank | `Not Validated`, `Valid`, `Warning`, `Blocked`, `Expired` | Current validation state. |
| Last Validated At | `LastValidatedAt` | Date and time | No | No | blank |  | Most recent validation timestamp. |
| Owner Group | `OwnerGroup` | Single line of text | No | No | blank |  | Operational owner/security group reference. |
| Admin Notes | `AdminNotes` | Multiple lines of text (plain) | No | No | blank |  | Maintainer notes. Uses Note to avoid truncation. |
| Is Active | `IsActive` | Yes/No | Yes | Yes | `Yes` |  | Active-row gate. |
| Effective From | `EffectiveFrom` | Date and time | No | Yes | blank |  | Optional start bound for time-windowed config. |
| Effective Through | `EffectiveThrough` | Date and time | No | Yes | blank |  | Optional end bound for time-windowed config. |
| Last Updated By | `LastUpdatedBy` | Person or Group | No | No | blank |  | Optional business-level updater field. |
| Last Updated At | `LastUpdatedAt` | Date and time | No | Yes | blank |  | Optional business-level update timestamp. |

## 5. Indexed Columns

Provisioned indexes:

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

If SharePoint defers or rejects an index, the provisioner records a warning and the validator reports the missing index. Until resolved, consumers must query by the remaining indexed fields first and filter any unindexed predicate in memory or through a narrower result set.

## 6. Choice Extension Policy
- `ApplicationKey`, `EnvironmentKey`, `ValueType`, and `ValidationStatus` are Choice fields because they are governance dimensions with known starting vocabularies.
- The provisioner enables fill-in choices where PnP/SharePoint supports it and appends missing choices idempotently on rerun.
- Future controlled values should be added by updating the provisioner/schema doc and rerunning provisioning. Direct UI edits are acceptable only for urgent tenant operations and must be backported to this schema.

## 7. Initial Seed Contract
- Safe, non-secret Foleon baseline records:
  - `MarketingNewHostPageUrl`
  - `HBCentralHubSiteUrl`
  - `ExpectedManifestId`
  - `AcceptedFoleonOrigins`
  - `FoleonExpectedPackageVersion`
- Placeholder records are active but `Blocked` until tenant/API validation confirms the value.
- Secret-backed records store `ValueType=SecretReference`, `IsSecretReference=true`, and `SecretReferenceName`; `ConfigValue` and `ConfigValueJson` remain blank.

## 8. Validation Contract
- List and field existence.
- Field type and required-flag match.
- Required indexes exist or are reported as skipped/missing.
- Expected seed records exist.
- No duplicate active logical keys.
- No secret-like values in `ConfigValue` or `ConfigValueJson`.
- Secret-like config keys use `IsSecretReference=true` and `SecretReferenceName`.
- Current user/app can read and, unless run with `-ReadOnly`, add/delete a temporary write probe.

## 9. Permissions and Governance
- Platform admins: full control or list manage rights.
- App/admin service account or app principal: read/write as required by provisioning and future registry-admin workflows.
- Foleon marketing users: read registry only unless a scoped admin workflow explicitly requires limited write to Foleon-scoped non-secret records.
- General employees: no direct list edit access.
- Entra ID security groups are preferred for grants where available. This provisioning pass documents permissions but does not create security groups.
