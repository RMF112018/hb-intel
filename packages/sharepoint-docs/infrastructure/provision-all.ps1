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
