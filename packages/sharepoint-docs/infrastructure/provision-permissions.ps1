<#
.SYNOPSIS
    Applies the 3-tier permission model (D-04) to staging folders.
    Tier 2: Department managers/directors get Read on their department folders.
    Tier 3: Executives get Read on all staging folders.
    Idempotent — permissions are additive and safe to re-apply.

.PARAMETER SiteUrl
    URL of the root HB Intel SharePoint site collection.

.PARAMETER GroupConfig
    PSObject from permission-groups.json with Azure AD group names.

.EXAMPLE
    $config = Get-Content "./permission-groups.json" | ConvertFrom-Json
    .\provision-permissions.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel" -GroupConfig $config
#>
param(
    [Parameter(Mandatory)][string]$SiteUrl,
    [Parameter(Mandatory)][PSObject]$GroupConfig
)

Connect-PnPOnline -Url $SiteUrl -UseWebLogin

$library = "Shared Documents"

# Tier 2: BD managers and directors get Read on BD Leads/
$bdFolder = "$library/BD Leads"
$bdGroups = @($GroupConfig.tier2_bd_managers, $GroupConfig.tier2_bd_directors)

foreach ($group in $bdGroups) {
    try {
        Set-PnPFolderPermission -List $library -Identity $bdFolder -User $group -AddRole "Read" -ErrorAction Stop
        Write-Host "    + Tier 2: Granted Read to '$group' on $bdFolder"
    } catch {
        Write-Host "    ! Warning: Could not grant Read to '$group' on $bdFolder — $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Tier 2: Estimating managers and directors get Read on Estimating Pursuits/
$estFolder = "$library/Estimating Pursuits"
$estGroups = @($GroupConfig.tier2_estimating_managers, $GroupConfig.tier2_estimating_directors)

foreach ($group in $estGroups) {
    try {
        Set-PnPFolderPermission -List $library -Identity $estFolder -User $group -AddRole "Read" -ErrorAction Stop
        Write-Host "    + Tier 2: Granted Read to '$group' on $estFolder"
    } catch {
        Write-Host "    ! Warning: Could not grant Read to '$group' on $estFolder — $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Tier 3: Executives get Read on both BD Leads/ and Estimating Pursuits/
$execGroup = $GroupConfig.tier3_executives
$allFolders = @($bdFolder, $estFolder)

foreach ($folder in $allFolders) {
    try {
        Set-PnPFolderPermission -List $library -Identity $folder -User $execGroup -AddRole "Read" -ErrorAction Stop
        Write-Host "    + Tier 3: Granted Read to '$execGroup' on $folder"
    } catch {
        Write-Host "    ! Warning: Could not grant Read to '$execGroup' on $folder — $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Disconnect-PnPOnline
