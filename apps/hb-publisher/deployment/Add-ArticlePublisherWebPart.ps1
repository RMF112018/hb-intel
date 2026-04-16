<#
.SYNOPSIS
  Idempotently insert the Article Publisher webpart onto a SharePoint
  modern page using PnP PowerShell.

.DESCRIPTION
  The Article Publisher webpart is packaged with
  `hiddenFromToolbox: true` and must be inserted by stable GUID. This
  script is the supported admin insertion path for the
  admin-managed-host-page deployment model documented in
  ./README.md.

  The script is idempotent: if a webpart instance with the Publisher
  GUID is already present on the page, it does nothing. Otherwise it
  adds one instance using the SharePoint client-side component ID.

.PARAMETER SiteUrl
  Absolute URL of the SharePoint site hosting the target page.

.PARAMETER PageName
  File name of the modern page (e.g. "Article-Publisher.aspx").

.PARAMETER WebPartId
  Override the default Publisher manifest GUID. Normally you should
  leave this as-is; the default matches the GUID compiled into the
  shipped package.

.EXAMPLE
  ./Add-ArticlePublisherWebPart.ps1 `
    -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New" `
    -PageName "Article-Publisher.aspx"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $SiteUrl,

    [Parameter(Mandatory = $true)]
    [string] $PageName,

    [Parameter()]
    [string] $WebPartId = "1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10"
)

$ErrorActionPreference = "Stop"

Write-Host "Connecting to $SiteUrl ..."
Connect-PnPOnline -Url $SiteUrl -Interactive

try {
    $page = Get-PnPClientSidePage -Identity $PageName -ErrorAction Stop
} catch {
    throw "Page '$PageName' not found on $SiteUrl. Create the modern page first (File | New | Site page)."
}

$existing = $page.Controls | Where-Object {
    $_.GetType().Name -eq 'ClientSideWebPart' -and `
    $_.WebPartId -ieq $WebPartId
}

if ($existing) {
    Write-Host "Publisher webpart (id=$WebPartId) already present on $PageName — nothing to do."
    return
}

Write-Host "Adding Publisher webpart (id=$WebPartId) to $PageName ..."
Add-PnPPageWebPart `
    -Page $PageName `
    -Component $WebPartId `
    -ErrorAction Stop | Out-Null

Write-Host "Publishing $PageName ..."
Set-PnPClientSidePage -Identity $PageName -Publish | Out-Null

Write-Host "Done. Navigate to $SiteUrl/SitePages/$PageName to validate."
Write-Host "See apps/hb-publisher/deployment/README.md step 4 for the runtime-load checklist."
