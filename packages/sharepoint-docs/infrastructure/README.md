# @hbc/sharepoint-docs — SharePoint Infrastructure

Provisioning scripts for all SharePoint infrastructure required by the `@hbc/sharepoint-docs` package.

## Prerequisites

- **PowerShell 7+** (`pwsh`)
- **PnP.PowerShell** module: `Install-Module PnP.PowerShell -Scope CurrentUser`
- **SharePoint Admin** permissions on the target site collection
- **Azure AD** security groups created (see Permission Model below)

## Quick Start

### Dev Environment

```powershell
.\provision-all.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-dev" -Environment dev
```

### Staging Environment

```powershell
.\provision-all.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-staging" -Environment staging
```

### Production Environment

```powershell
.\provision-all.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel" -Environment prod
```

## What Gets Provisioned

| Resource | Type | Script |
|---|---|---|
| `HBCDocumentRegistry` | SharePoint List (19 columns, 6 indexes, 6 views) | `provision-lists.ps1` |
| `HBCMigrationLog` | SharePoint List (10 columns, append-only) | `provision-lists.ps1` |
| `Shared Documents/BD Leads/` | Document Library Folder | `provision-folders.ps1` |
| `Shared Documents/Estimating Pursuits/` | Document Library Folder | `provision-folders.ps1` |
| `Shared Documents/System/` | Document Library Folder | `provision-folders.ps1` |
| 3-tier folder permissions | Azure AD group → folder Read grants | `provision-permissions.ps1` |

## Permission Model (D-04: 3-Tier)

Group names are configured in `permission-groups.json` and can vary per environment.

| Tier | Groups | Access | Scope |
|---|---|---|---|
| **Tier 1** | Record owner + collaborators | Read/Write | Individual record folder (applied by `FolderManager` at runtime) |
| **Tier 2** | BD Managers, BD Directors | Read | All folders under `BD Leads/` |
| **Tier 2** | Estimating Managers, Estimating Directors | Read | All folders under `Estimating Pursuits/` |
| **Tier 3** | Executives | Read | All folders under `BD Leads/` and `Estimating Pursuits/` |

## Individual Scripts

Run individual provisioning steps if needed:

```powershell
# Lists only
.\provision-lists.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-dev"

# Folders only
.\provision-folders.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-dev"

# Permissions only (requires permission-groups.json)
$config = Get-Content "./permission-groups.json" | ConvertFrom-Json
.\provision-permissions.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-dev" -GroupConfig $config
```

## Teardown (Dev/Test Only)

Remove all provisioned infrastructure. **Never run against production.**

```powershell
# Interactive confirmation required
.\teardown.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-dev"

# Skip confirmation (CI pipelines)
.\teardown.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-dev" -Force
```

## PnP Templates

The `templates/` directory contains PnP Provisioning Template XML files that define list schemas declaratively:

- `HBCDocumentRegistry.xml` — 19 columns, 6 views, versioning enabled (max 10)
- `HBCMigrationLog.xml` — 10 columns, no versioning (append-only)

These templates can be applied directly via `Invoke-PnPSiteTemplate` as an alternative to the PowerShell scripts:

```powershell
Connect-PnPOnline -Url $SiteUrl -UseWebLogin
Invoke-PnPSiteTemplate -Path "./templates/HBCDocumentRegistry.xml"
Invoke-PnPSiteTemplate -Path "./templates/HBCMigrationLog.xml"
```

## Manual Verification Checklist

After provisioning, verify the following in SharePoint:

1. Browse to `https://{tenant}.sharepoint.com/sites/hb-intel`
2. Confirm `HBCDocumentRegistry` list exists with all 19 columns
3. Confirm `HBCMigrationLog` list exists with all 10 columns
4. Confirm `Shared Documents/BD Leads/` folder exists
5. Confirm `Shared Documents/Estimating Pursuits/` folder exists
6. Confirm `Shared Documents/System/` folder exists
7. Confirm BD Managers group has Read on `BD Leads/`
8. Confirm Executives group has Read on both staging root folders
9. Run `pnpm --filter @hbc/sharepoint-docs test:infra` for automated validation
