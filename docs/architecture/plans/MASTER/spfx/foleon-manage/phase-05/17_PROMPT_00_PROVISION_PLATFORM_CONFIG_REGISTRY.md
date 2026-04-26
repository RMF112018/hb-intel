# 22_PROMPT_06 — Provision HB Platform Configuration Registry

## Objective

Provision a new centralized SharePoint configuration registry named:

`HB Platform Configuration Registry`

The registry must be created in the HBCentral hub site:

`https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

Use the existing registered app ID:

`08c399eb-a394-4087-b859-659d493f8dc7`

Do **not** create a new Entra app registration. Do **not** introduce a new authentication model unless repo truth proves the existing registered app cannot support this provisioning path.

This task is provisioning-focused. Do not implement Foleon Manager UI changes, backend registry consumers, or homepage runtime changes in this pass unless required only to support provisioning validation.

## Non-Negotiable Instructions

- Use the live repo’s current `main` branch as truth.
- Do not re-read files that are still within your current context or memory unless you need to verify current line-level repo truth, resolve a contradiction, or confirm a command/path.
- Do not hardcode secrets, tenant secrets, client secrets, certificates, or access tokens into source files.
- The registered app ID `08c399eb-a394-4087-b859-659d493f8dc7` may be documented and parameterized because it is not a secret.
- Do not store secrets directly in SharePoint list text fields.
- Secret values must be represented only as references, such as Azure Key Vault secret names, Azure App Configuration keys, or backend-managed setting names.
- Preserve existing Safety, Kudos, Foleon, Homepage, and Function App behavior.
- Do not remove or rewrite existing provisioning infrastructure unless repo truth proves it is defective.
- Prefer the existing repo provisioning patterns, scripts, package structure, PnP runner conventions, and device/app authentication conventions already used in the repo.

## Required Repo-Truth Audit

Audit the existing provisioning patterns before writing new code.

Start with, but do not limit yourself to:

```text
tools/pnp-runner-local/**
packages/provisioning/**
packages/sharepoint-platform/**
docs/reference/sharepoint/list-schemas/hbcentral/**
docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md
apps/hb-intel-foleon/docs/provisioning.md
apps/hb-intel-foleon/scripts/**
apps/hb-intel-foleon/sharepoint/assets/**
backend/functions/src/config/**
docs/architecture/plans/MASTER/spfx/foleon/**
docs/how-to/**
```

Identify the correct existing pattern for:

- connecting to `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`;
- using the registered app ID `08c399eb-a394-4087-b859-659d493f8dc7`;
- creating SharePoint lists;
- adding fields;
- creating indexes;
- creating views;
- applying permissions or documenting required manual permission assignments;
- validating list/schema existence after provisioning;
- capturing proof artifacts.

## Target List

Create the list:

```text
HB Platform Configuration Registry
```

Recommended internal/reference key:

```text
HB_PlatformConfigurationRegistry
```

Purpose:

A centralized, non-secret configuration registry for HB Intel platform applications, including but not limited to:

```text
Safety
Kudos
Foleon
Homepage
Function App
SharePoint list GUIDs
site URLs
backend API URLs
resource/audience IDs
manifest IDs
package versions
accepted origins
feature flags
environment labels
validation state
secret references
```

## Required Fields

Provision the list with fields equivalent to the following model. Use SharePoint-compatible internal names and field types consistent with existing repo conventions.

```text
Title                         Text, required
ApplicationKey                Choice or Text, required, indexed
EnvironmentKey                Choice or Text, required, indexed
ScopeKey                      Text, optional, indexed
ConfigKey                     Text, required, indexed
ConfigValue                   Note or Text, optional
ConfigValueJson               Note, optional
ValueType                     Choice, required
IsRequired                    Boolean, required
IsSecretReference             Boolean, required, indexed
SecretReferenceName           Text, optional
SiteUrl                       URL or Text, optional
ListTitle                     Text, optional
ListGuid                      Text, optional, indexed
WebId                         Text, optional
TenantId                      Text, optional
ManifestId                    Text, optional, indexed
ExpectedPackageVersion        Text, optional
ApiBaseUrl                    URL or Text, optional
ApiResource                   Text, optional
AcceptedOrigins               Note, optional
ValidationRule                Note or Text, optional
ValidationStatus              Choice, required, indexed
LastValidatedAt               DateTime, optional
OwnerGroup                    Text, optional
AdminNotes                    Note, optional
IsActive                      Boolean, required, indexed
EffectiveFrom                 DateTime, optional, indexed
EffectiveThrough              DateTime, optional, indexed
LastUpdatedBy                 Person, optional
LastUpdatedAt                 DateTime, optional, indexed
```

### Required Choice Values

`ValueType` should support at minimum:

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

`ValidationStatus` should support at minimum:

```text
Not Validated
Valid
Warning
Blocked
Expired
```

`EnvironmentKey` should support at minimum:

```text
Production
Staging
Development
Local
```

`ApplicationKey` should support at minimum:

```text
Platform
Foleon
Homepage
Safety
Kudos
FunctionApp
SharePoint
```

You may use text fields instead of choice fields only if repo provisioning conventions show that choice fields create avoidable migration friction. If you choose text fields, document the rationale.

## Index Requirements

Create indexes for fields used in expected lookup/filter paths:

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

If SharePoint index creation limits or field-type limitations prevent any index, document the exception and provide the compensating query strategy.

## Uniqueness / Logical Key

The logical unique key should be:

```text
ApplicationKey + EnvironmentKey + ScopeKey + ConfigKey + IsActive
```

Do not assume SharePoint can enforce this composite key natively.

Implement or document a validation script that checks for duplicate active records using this logical key.

## Initial Seed Records

Seed only safe, non-secret baseline records. Do not guess tenant GUIDs or list GUIDs that are not known.

Create initial records for Foleon only where values are already known and non-secret:

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

Create placeholder records for required values that must be filled after tenant validation. These should be active but clearly marked `Blocked` or `Not Validated`, with `AdminNotes` explaining that values must be populated after list/API validation.

Potential placeholders:

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

For secret-backed values, seed only reference records, never the actual secret:

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

## Required Implementation Deliverables

Create or update the minimal necessary repo files to support provisioning.

Expected deliverables may include:

```text
docs/reference/sharepoint/list-schemas/hbcentral/hb-platform-configuration-registry.md
docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md
tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1
tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1
docs/architecture/plans/MASTER/platform/config-registry/provisioning-runbook.md
docs/architecture/plans/MASTER/platform/config-registry/provisioning-proof-template.md
```

Adjust paths to match repo truth. Do not create duplicate provisioning frameworks if an existing canonical folder already exists.

## Provisioning Script Requirements

The provisioning script must:

1. Accept parameters for:
   - target site URL;
   - registered app ID;
   - environment key;
   - optional dry-run mode;
   - optional seed mode.

2. Default to:
   - site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
   - app ID: `08c399eb-a394-4087-b859-659d493f8dc7`
   - environment key: `Production`

3. Connect using the repo’s established authentication pattern.

4. Create the list if missing.

5. Add missing fields without corrupting existing fields.

6. Add indexes where supported.

7. Seed safe baseline records idempotently.

8. Never overwrite an existing non-empty value unless an explicit `-ForceUpdateSeedValues` or equivalent parameter is provided.

9. Print a clear summary:
   - list created or already existed;
   - fields added;
   - fields already present;
   - indexes created;
   - indexes skipped;
   - records seeded;
   - records skipped;
   - validation warnings;
   - next manual steps.

## Validation Script Requirements

The validation script must prove:

- the list exists;
- the expected fields exist;
- required indexes exist or exceptions are documented;
- seeded records exist;
- no duplicate active logical keys exist;
- no records with `IsSecretReference = false` appear to contain obvious secret values;
- no records with secret-like `ConfigKey` names store actual secret text in `ConfigValue` or `ConfigValueJson`;
- current user/app can read the registry;
- write access is available only where expected.

## Required Proof Artifacts

Generate a local proof output under an appropriate docs path, for example:

```text
docs/architecture/plans/MASTER/platform/config-registry/proof/platform-config-registry-provisioning-YYYY-MM-DD.md
```

The proof must include:

- command run;
- target site;
- app ID used;
- list title;
- list URL;
- field count;
- index count;
- seeded record count;
- duplicate active key check result;
- secret storage check result;
- validation warnings;
- unresolved manual action items.

## Permissions / Governance

Document the recommended permissions model:

- Platform admins: full control or list manage rights.
- App/admin service account or app principal: read/write as required.
- Foleon marketing users: read registry only unless a specific admin workflow requires limited write to Foleon-scoped non-secret records.
- General employees: no direct list edit access.
- Secrets: never stored in SharePoint.

Use Entra ID security groups where possible. Do not create security groups unless repo provisioning patterns already support that safely.

## Acceptance Criteria

This pass is complete only when:

- The provisioning script exists and is idempotent.
- The validation script exists and can be run independently.
- The registry list can be provisioned in HBCentral using app ID `08c399eb-a394-4087-b859-659d493f8dc7`.
- The schema documentation is committed.
- The runbook is committed.
- The proof template or actual proof output is committed, depending on whether provisioning was executed.
- No secrets are stored in SharePoint.
- Existing Foleon/Safety/Kudos/Homepage behavior is not modified.
- The agent provides a concise closure report with changed files, commands run, validation results, and any unresolved manual tenant actions.

## Validation Commands

Use repo-truth commands where available. Candidate commands:

```bash
pnpm install
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

Also run the new provisioning validation script, for example:

```powershell
pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -EnvironmentKey "Production"
```

If actual provisioning is authorized in this execution, run the provisioning script first in dry-run mode, then live mode:

```powershell
pwsh tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -EnvironmentKey "Production" `
  -DryRun
```

```powershell
pwsh tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -EnvironmentKey "Production" `
  -Seed
```

## Final Response Required From Agent

Return:

```text
Summary:
Changed Files:
Provisioning Method:
Commands Run:
Validation Results:
Registry URL:
Seed Records Created:
Warnings / Manual Actions:
Commit Message:
```
