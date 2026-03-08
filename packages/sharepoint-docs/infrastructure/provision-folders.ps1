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
