# SF01-T03: SharePoint Infrastructure

**Package:** `@hbc/sharepoint-docs`
**Wave:** 1 — Foundation
**Estimated effort:** 0.5 sprint-weeks
**Prerequisite tasks:** SF01-T01 (scaffold), SF01-T02 (contracts)
**Unlocks:** SF01-T04 (Upload Service needs the lists to exist in the target environment)
**Governed by:** CLAUDE.md v1.2 §3 (Architecture Enforcement), §8 (Verification Protocol)

---

## 1. Objective

Provision all SharePoint infrastructure required by `@hbc/sharepoint-docs` before any code touches a real environment. This includes:

- The `HBCDocumentRegistry` list with all columns and indexes
- The `HBCMigrationLog` list with all columns
- The root staging folder structure under `/sites/hb-intel/Shared Documents/`
- Azure AD group definitions for the 3-tier permission model
- A repeatable PnP PowerShell provisioning script that can be run in any environment (dev, staging, production)

All infrastructure is defined as code in `packages/sharepoint-docs/infrastructure/` and is idempotent — running the script twice produces the same result as running it once.

---

## 2. Infrastructure Directory Structure

Create this directory alongside `src/`:

```
packages/sharepoint-docs/
└── infrastructure/
    ├── README.md                          # How to run provisioning in each environment
    ├── provision-lists.ps1                # PnP PowerShell: create/update both lists
    ├── provision-folders.ps1              # PnP PowerShell: create staging folder structure
    ├── provision-permissions.ps1          # PnP PowerShell: apply 3-tier permission model
    ├── provision-all.ps1                  # Orchestrator: runs all three in order
    ├── templates/
    │   ├── HBCDocumentRegistry.xml        # PnP site template fragment for the registry list
    │   └── HBCMigrationLog.xml            # PnP site template fragment for the log list
    └── teardown.ps1                       # DEV/TEST ONLY: removes all provisioned infrastructure
```

---

## 3. `HBCDocumentRegistry` List Schema

### List Settings

| Setting | Value |
|---|---|
| List name | `HBCDocumentRegistry` |
| Description | `HB Intel Document Lifecycle Registry — tracks all document events from upload through migration.` |
| Site | `/sites/hb-intel` (root HB Intel site collection) |
| Versioning | Enabled (major versions only, keep last 10) |
| Item-level permissions | No unique permissions per item — list-level permissions only |
| View threshold override | Yes — set via CSOM to allow indexed queries beyond 5,000 items |

### Column Definitions

| Display Name | Internal Name | Type | Required | Indexed | Choices (if Choice type) |
|---|---|---|---|---|---|
| Module Type | `HbcModuleType` | Choice | Yes | Yes | `bd-lead`, `estimating-pursuit`, `project`, `system` |
| Record ID | `HbcRecordId` | Single line (255) | Yes | Yes | — |
| Project ID | `HbcProjectId` | Single line (255) | No | Yes | — |
| Document ID | `HbcDocumentId` | Single line (255) | Yes | Yes | — |
| File Name | `HbcFileName` | Single line (255) | Yes | No | — |
| Folder Name | `HbcFolderName` | Single line (255) | Yes | No | — |
| File Size | `HbcFileSize` | Number (integer) | Yes | No | — |
| MIME Type | `HbcMimeType` | Single line (100) | No | No | — |
| SharePoint URL | `HbcSharePointUrl` | Hyperlink | Yes | No | — |
| Staging URL | `HbcStagingUrl` | Hyperlink | Yes | No | — |
| Migrated URL | `HbcMigratedUrl` | Hyperlink | No | No | — |
| Migration Status | `HbcMigrationStatus` | Choice | Yes | Yes | `pending`, `scheduled`, `in-progress`, `migrated`, `conflict`, `failed`, `not-applicable` |
| Tombstone URL | `HbcTombstoneUrl` | Hyperlink | No | No | — |
| Conflict Resolution | `HbcConflictResolution` | Choice | No | No | `keep-staging`, `keep-project`, `keep-both`, `pending`, `auto-project-site-wins` |
| Conflict Resolved By | `HbcConflictResolvedBy` | Person | No | No | — |
| Uploaded By | `HbcUploadedBy` | Person | Yes | No | — |
| Uploaded At | `HbcUploadedAt` | Date/Time (UTC) | Yes | Yes | — |
| Migrated At | `HbcMigratedAt` | Date/Time (UTC) | No | No | — |
| Display Name | `HbcDisplayName` | Single line (512) | Yes | No | — |

### Views to Create

**Default view — "All Documents"**: All columns, sorted by `HbcUploadedAt` descending.

**Module views** (one per module type): Filtered by `HbcModuleType`, sorted by `HbcUploadedAt` descending. Names: `BD Lead Documents`, `Estimating Documents`, `Project Documents`.

**Migration view — "Pending Migration"**: Filter `HbcMigrationStatus` = `pending` OR `scheduled`. Used by `MigrationScheduler` for nightly job queries.

**Conflict view — "Conflicts Requiring Resolution"**: Filter `HbcMigrationStatus` = `conflict`. Used by `HbcConflictResolutionPanel`.

---

## 4. `HBCMigrationLog` List Schema

### List Settings

| Setting | Value |
|---|---|
| List name | `HBCMigrationLog` |
| Description | `HB Intel Migration Event Log — append-only log of all migration attempt events.` |
| Site | `/sites/hb-intel` |
| Versioning | Disabled (append-only log — no need for version history) |
| Item-level permissions | No unique permissions |

### Column Definitions

| Display Name | Internal Name | Type | Required | Choices |
|---|---|---|---|---|
| Job ID | `HbcJobId` | Single line (255) | Yes | — |
| Record ID | `HbcRecordId` | Single line (255) | Yes | — |
| Document ID | `HbcDocumentId` | Single line (255) | Yes | — |
| File Checkpoint | `HbcCheckpoint` | Choice | Yes | `pending`, `in-progress`, `completed`, `failed`, `skipped-conflict` |
| Attempt Number | `HbcAttemptNumber` | Number (integer) | Yes | — |
| Attempted At | `HbcAttemptedAt` | Date/Time (UTC) | Yes | — |
| Error Message | `HbcErrorMessage` | Multi-line text | No | — |
| Scheduled Window | `HbcScheduledWindow` | Single line (100) | Yes | — |
| Pre-notification Sent | `HbcNotifiedPM` | Yes/No | Yes | — |
| Escalated to Director | `HbcEscalated` | Yes/No | Yes | — |

---

## 5. Staging Folder Structure

The following folder hierarchy must exist in the root HB Intel site before any BD or Estimating documents can be attached. Individual record folders (the `yyyymmdd_{Name}_{LastName}` folders) are created on-demand by `FolderManager` when a record is first created — they are NOT pre-created here.

```
/sites/hb-intel/Shared Documents/
├── BD Leads/                     ← pre-created by provision-folders.ps1
│   └── (record folders created on demand by FolderManager)
├── Estimating Pursuits/          ← pre-created by provision-folders.ps1
│   └── (record folders created on demand by FolderManager)
└── System/                       ← pre-created for @hbc/data-seeding and internal use
```

### Subfolder Conventions per Context Type

These subfolders are created by `FolderManager` inside each record folder:

**BD Lead record folder:**
```
yyyymmdd_{SanitizedName}_{LastName}/
├── RFP/
├── RFQ/
├── ITB/
└── Supporting/
```

**Estimating Pursuit record folder:**
```
yyyymmdd_{SanitizedName}_{LastName}/
├── Bid Documents/
└── Supporting/
```

---

## 6. Azure AD Group Requirements (3-Tier Permission Model — D-04)

The following Azure AD security groups must be created and maintained by the HB Intel administrators. The provisioning script reads group names from a configuration file rather than hardcoding them to support environment differences (dev/staging/prod groups may differ).

### Group Configuration File

Create `packages/sharepoint-docs/infrastructure/permission-groups.json`:

```json
{
  "comment": "Azure AD group names for the 3-tier staging permission model (D-04). Update per environment.",
  "tier2_bd_managers": "HB Intel BD Managers",
  "tier2_bd_directors": "HB Intel BD Directors",
  "tier2_estimating_managers": "HB Intel Estimating Managers",
  "tier2_estimating_directors": "HB Intel Estimating Directors",
  "tier3_executives": "HB Intel Executives"
}
```

### Group Responsibilities

| Group | Tier | Access Level | Scope |
|---|---|---|---|
| HB Intel BD Managers | 2 | Read-only | All folders under `BD Leads/` |
| HB Intel BD Directors | 2 | Read-only | All folders under `BD Leads/` |
| HB Intel Estimating Managers | 2 | Read-only | All folders under `Estimating Pursuits/` |
| HB Intel Estimating Directors | 2 | Read-only | All folders under `Estimating Pursuits/` |
| HB Intel Executives | 3 | Read-only | All folders under `BD Leads/` and `Estimating Pursuits/` |

Tier-1 permissions (owner + collaborators) are applied per-folder by `FolderManager` at record creation time using unique folder permissions on each record folder. Only record folders get unique permissions — the parent `BD Leads/` and `Estimating Pursuits/` folders use inherited permissions from Tier 2 and Tier 3 groups.

---

## 7. `provision-all.ps1`

```powershell
<#
.SYNOPSIS
    Provisions all SharePoint infrastructure for @hbc/sharepoint-docs.
    Idempotent — safe to run multiple times.

.PARAMETER SiteUrl
    URL of the root HB Intel SharePoint site collection.

.PARAMETER Environment
    dev | staging | prod. Controls which permission-groups.json config is loaded.

.EXAMPLE
    .\provision-all.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel" -Environment dev
#>
param(
    [Parameter(Mandatory)][string]$SiteUrl,
    [Parameter(Mandatory)][ValidateSet("dev","staging","prod")][string]$Environment
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$groupConfig = Get-Content "$scriptDir/permission-groups.json" | ConvertFrom-Json

Write-Host "=== @hbc/sharepoint-docs Infrastructure Provisioning ===" -ForegroundColor Cyan
Write-Host "Site:        $SiteUrl"
Write-Host "Environment: $Environment"
Write-Host ""

# Step 1: Lists
Write-Host "Step 1/3: Provisioning SharePoint lists..." -ForegroundColor Yellow
& "$scriptDir/provision-lists.ps1" -SiteUrl $SiteUrl
Write-Host "  ✓ Lists provisioned" -ForegroundColor Green

# Step 2: Staging folders
Write-Host "Step 2/3: Provisioning staging folder structure..." -ForegroundColor Yellow
& "$scriptDir/provision-folders.ps1" -SiteUrl $SiteUrl
Write-Host "  ✓ Staging folders provisioned" -ForegroundColor Green

# Step 3: Permissions
Write-Host "Step 3/3: Applying 3-tier permission model..." -ForegroundColor Yellow
& "$scriptDir/provision-permissions.ps1" -SiteUrl $SiteUrl -GroupConfig $groupConfig
Write-Host "  ✓ Permissions applied" -ForegroundColor Green

Write-Host ""
Write-Host "=== Provisioning Complete ===" -ForegroundColor Cyan
Write-Host "Run verification: pnpm --filter @hbc/sharepoint-docs test:infra"
```

---

## 8. `provision-lists.ps1`

```powershell
<#
.SYNOPSIS
    Creates or updates HBCDocumentRegistry and HBCMigrationLog lists.
    Idempotent — existing lists are updated, not recreated.
#>
param([Parameter(Mandatory)][string]$SiteUrl)

Connect-PnPOnline -Url $SiteUrl -UseWebLogin

#region HBCDocumentRegistry
$registryList = Get-PnPList -Identity "HBCDocumentRegistry" -ErrorAction SilentlyContinue
if (-not $registryList) {
    $registryList = New-PnPList -Title "HBCDocumentRegistry" -Template GenericList -OnQuickLaunch:$false
    Write-Host "    Created list: HBCDocumentRegistry"
} else {
    Write-Host "    List exists, updating columns: HBCDocumentRegistry"
}

$regColumns = @(
    @{ InternalName="HbcModuleType";      DisplayName="Module Type";         Type="Choice";          Required=$true;  Choices=@("bd-lead","estimating-pursuit","project","system") },
    @{ InternalName="HbcRecordId";        DisplayName="Record ID";           Type="Text";            Required=$true },
    @{ InternalName="HbcProjectId";       DisplayName="Project ID";          Type="Text";            Required=$false },
    @{ InternalName="HbcDocumentId";      DisplayName="Document ID";         Type="Text";            Required=$true },
    @{ InternalName="HbcFileName";        DisplayName="File Name";           Type="Text";            Required=$true },
    @{ InternalName="HbcFolderName";      DisplayName="Folder Name";         Type="Text";            Required=$true },
    @{ InternalName="HbcFileSize";        DisplayName="File Size";           Type="Number";          Required=$true },
    @{ InternalName="HbcMimeType";        DisplayName="MIME Type";           Type="Text";            Required=$false },
    @{ InternalName="HbcSharePointUrl";   DisplayName="SharePoint URL";      Type="URL";             Required=$true },
    @{ InternalName="HbcStagingUrl";      DisplayName="Staging URL";         Type="URL";             Required=$true },
    @{ InternalName="HbcMigratedUrl";     DisplayName="Migrated URL";        Type="URL";             Required=$false },
    @{ InternalName="HbcMigrationStatus"; DisplayName="Migration Status";    Type="Choice";          Required=$true;  Choices=@("pending","scheduled","in-progress","migrated","conflict","failed","not-applicable") },
    @{ InternalName="HbcTombstoneUrl";    DisplayName="Tombstone URL";       Type="URL";             Required=$false },
    @{ InternalName="HbcConflictResolution"; DisplayName="Conflict Resolution"; Type="Choice";       Required=$false; Choices=@("keep-staging","keep-project","keep-both","pending","auto-project-site-wins") },
    @{ InternalName="HbcConflictResolvedBy"; DisplayName="Conflict Resolved By"; Type="User";       Required=$false },
    @{ InternalName="HbcUploadedBy";      DisplayName="Uploaded By";         Type="User";            Required=$true },
    @{ InternalName="HbcUploadedAt";      DisplayName="Uploaded At";         Type="DateTime";        Required=$true },
    @{ InternalName="HbcMigratedAt";      DisplayName="Migrated At";         Type="DateTime";        Required=$false },
    @{ InternalName="HbcDisplayName";     DisplayName="Display Name";        Type="Text";            Required=$true }
)

foreach ($col in $regColumns) {
    $existing = Get-PnPField -List $registryList -Identity $col.InternalName -ErrorAction SilentlyContinue
    if (-not $existing) {
        $params = @{
            List        = $registryList
            InternalName = $col.InternalName
            DisplayName = $col.DisplayName
            Type        = $col.Type
            Required    = $col.Required
        }
        if ($col.Choices) { $params.Choices = $col.Choices }
        Add-PnPField @params | Out-Null
        Write-Host "      + Column added: $($col.InternalName)"
    }
}

# Add indexes to support queries beyond 5,000 items
$indexedFields = @("HbcModuleType","HbcRecordId","HbcProjectId","HbcDocumentId","HbcMigrationStatus","HbcUploadedAt")
foreach ($fieldName in $indexedFields) {
    $field = Get-PnPField -List $registryList -Identity $fieldName
    if (-not $field.Indexed) {
        Set-PnPField -List $registryList -Identity $fieldName -Values @{ Indexed = $true }
        Write-Host "      + Index added: $fieldName"
    }
}
#endregion

#region HBCMigrationLog
$logList = Get-PnPList -Identity "HBCMigrationLog" -ErrorAction SilentlyContinue
if (-not $logList) {
    $logList = New-PnPList -Title "HBCMigrationLog" -Template GenericList -OnQuickLaunch:$false
    Write-Host "    Created list: HBCMigrationLog"
}

$logColumns = @(
    @{ InternalName="HbcJobId";         DisplayName="Job ID";               Type="Text";    Required=$true },
    @{ InternalName="HbcRecordId";      DisplayName="Record ID";            Type="Text";    Required=$true },
    @{ InternalName="HbcDocumentId";    DisplayName="Document ID";          Type="Text";    Required=$true },
    @{ InternalName="HbcCheckpoint";    DisplayName="File Checkpoint";      Type="Choice";  Required=$true; Choices=@("pending","in-progress","completed","failed","skipped-conflict") },
    @{ InternalName="HbcAttemptNumber"; DisplayName="Attempt Number";       Type="Number";  Required=$true },
    @{ InternalName="HbcAttemptedAt";   DisplayName="Attempted At";         Type="DateTime";Required=$true },
    @{ InternalName="HbcErrorMessage";  DisplayName="Error Message";        Type="Note";    Required=$false },
    @{ InternalName="HbcScheduledWindow"; DisplayName="Scheduled Window";   Type="Text";    Required=$true },
    @{ InternalName="HbcNotifiedPM";    DisplayName="Pre-notification Sent";Type="Boolean"; Required=$true },
    @{ InternalName="HbcEscalated";     DisplayName="Escalated to Director";Type="Boolean"; Required=$true }
)

foreach ($col in $logColumns) {
    $existing = Get-PnPField -List $logList -Identity $col.InternalName -ErrorAction SilentlyContinue
    if (-not $existing) {
        $params = @{ List=$logList; InternalName=$col.InternalName; DisplayName=$col.DisplayName; Type=$col.Type; Required=$col.Required }
        if ($col.Choices) { $params.Choices = $col.Choices }
        Add-PnPField @params | Out-Null
        Write-Host "      + Column added: $($col.InternalName)"
    }
}
#endregion

Disconnect-PnPOnline
```

---

## 9. `provision-folders.ps1`

```powershell
<#
.SYNOPSIS
    Creates the root staging folder structure in the HB Intel Shared Documents library.
    Idempotent — existing folders are skipped.
#>
param([Parameter(Mandatory)][string]$SiteUrl)

Connect-PnPOnline -Url $SiteUrl -UseWebLogin

$rootFolders = @("BD Leads", "Estimating Pursuits", "System")
$library = "Shared Documents"

foreach ($folder in $rootFolders) {
    $existing = Get-PnPFolder -Url "$library/$folder" -ErrorAction SilentlyContinue
    if (-not $existing) {
        Add-PnPFolder -Name $folder -Folder $library | Out-Null
        Write-Host "    + Created folder: $library/$folder"
    } else {
        Write-Host "    ~ Folder exists: $library/$folder"
    }
}

Disconnect-PnPOnline
```

---

## 10. Verification Commands

Run after provisioning completes:

```bash
# Run the infrastructure integration test suite
pnpm --filter @hbc/sharepoint-docs test:infra

# Manual SharePoint verification checklist:
# 1. Browse to https://{tenant}.sharepoint.com/sites/hb-intel
# 2. Confirm HBCDocumentRegistry list exists with all columns
# 3. Confirm HBCMigrationLog list exists with all columns
# 4. Confirm Shared Documents/BD Leads/ folder exists
# 5. Confirm Shared Documents/Estimating Pursuits/ folder exists
# 6. Confirm Shared Documents/System/ folder exists
# 7. Confirm BD Managers group has Read on BD Leads/
# 8. Confirm Executives group has Read on both staging root folders
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF01-T03 completed: 2026-03-08
Files created (9):
  - infrastructure/provision-all.ps1 (orchestrator, §7 exact code block)
  - infrastructure/provision-lists.ps1 (list provisioning, §8 exact code block)
  - infrastructure/provision-folders.ps1 (folder provisioning, §9 exact code block)
  - infrastructure/provision-permissions.ps1 (3-tier D-04 model, derived from §6)
  - infrastructure/teardown.ps1 (dev/test cleanup, derived from §2)
  - infrastructure/permission-groups.json (§6 exact code block)
  - infrastructure/templates/HBCDocumentRegistry.xml (PnP template, 19 columns, 6 views, derived from §3)
  - infrastructure/templates/HBCMigrationLog.xml (PnP template, 10 columns, derived from §4)
  - infrastructure/README.md (prerequisites, quick start, verification checklist, derived from §2/§10)
Verification:
  - pnpm --filter @hbc/sharepoint-docs typecheck → exit 0
  - pnpm --filter @hbc/sharepoint-docs build → exit 0
  - pnpm turbo run build → 25/25 tasks green (24 cached + 1 built)
Next: SF01-T04 Upload Service
-->
