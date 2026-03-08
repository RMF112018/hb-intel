<#
.SYNOPSIS
    DEV/TEST ONLY — Removes all provisioned SharePoint infrastructure.
    Deletes HBCDocumentRegistry, HBCMigrationLog lists and BD Leads/,
    Estimating Pursuits/, System/ staging folders.

    DESTRUCTIVE — requires confirmation unless -Force is specified.

.PARAMETER SiteUrl
    URL of the root HB Intel SharePoint site collection.

.PARAMETER Force
    Skip confirmation prompt. Intended for CI/CD pipelines only.

.EXAMPLE
    .\teardown.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-dev"

.EXAMPLE
    .\teardown.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-dev" -Force
#>
param(
    [Parameter(Mandatory)][string]$SiteUrl,
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $Force) {
    Write-Host "WARNING: This will DELETE all @hbc/sharepoint-docs infrastructure from:" -ForegroundColor Red
    Write-Host "  Site: $SiteUrl" -ForegroundColor Red
    Write-Host ""
    Write-Host "  - HBCDocumentRegistry list (and all items)"
    Write-Host "  - HBCMigrationLog list (and all items)"
    Write-Host "  - Shared Documents/BD Leads/ folder (and all contents)"
    Write-Host "  - Shared Documents/Estimating Pursuits/ folder (and all contents)"
    Write-Host "  - Shared Documents/System/ folder (and all contents)"
    Write-Host ""
    $confirm = Read-Host "Type YES-DELETE to confirm"
    if ($confirm -ne "YES-DELETE") {
        Write-Host "Aborted." -ForegroundColor Yellow
        exit 0
    }
}

Connect-PnPOnline -Url $SiteUrl -UseWebLogin

$library = "Shared Documents"

# Remove lists
$lists = @("HBCDocumentRegistry", "HBCMigrationLog")
foreach ($listName in $lists) {
    $list = Get-PnPList -Identity $listName -ErrorAction SilentlyContinue
    if ($list) {
        Remove-PnPList -Identity $listName -Force
        Write-Host "    - Removed list: $listName" -ForegroundColor Red
    } else {
        Write-Host "    ~ List not found (already removed): $listName"
    }
}

# Remove staging folders
$folders = @("BD Leads", "Estimating Pursuits", "System")
foreach ($folder in $folders) {
    $existing = Get-PnPFolder -Url "$library/$folder" -ErrorAction SilentlyContinue
    if ($existing) {
        Remove-PnPFolder -Name $folder -Folder $library -Force
        Write-Host "    - Removed folder: $library/$folder" -ForegroundColor Red
    } else {
        Write-Host "    ~ Folder not found (already removed): $library/$folder"
    }
}

Disconnect-PnPOnline

Write-Host ""
Write-Host "=== Teardown Complete ===" -ForegroundColor Cyan
