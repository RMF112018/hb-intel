<#
.SYNOPSIS
  Extracts a reusable PnP page template for the Project Spotlight "In Progress" page.

.DESCRIPTION
  - Verifies the exact source page exists by FileRef.
  - Exports a pages-only PnP template from the site.
  - Keeps only the target ClientSidePage entry.
  - Removes non-page provisioning artifacts.
  - Replaces deterministic absolute site URLs with ${site}.
  - Emits a bindings report for remaining source-specific references.

.USAGE
  Device login:
    pwsh ./packages/sharepoint-docs/infrastructure/extract-project-spotlight-page-template.ps1 `
      -ClientId "<entra-app-id>" `
      -Tenant "0e834bd7-628b-42c8-b9ec-ecebc9719be4" `
      -DeviceLogin

  App secret:
    pwsh ./packages/sharepoint-docs/infrastructure/extract-project-spotlight-page-template.ps1 `
      -ClientId "<entra-app-id>" `
      -Tenant "0e834bd7-628b-42c8-b9ec-ecebc9719be4" `
      -ClientSecret "<secret>"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$SiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight",

  [Parameter(Mandatory = $false)]
  [string]$PageServerRelativePath = "/sites/ProjectSpotlight/SitePages/Templates/Project-Spotlight---In-Progress.aspx",

  [Parameter(Mandatory = $true)]
  [string]$ClientId,

  [Parameter(Mandatory = $true)]
  [string]$Tenant,

  [Parameter(Mandatory = $false)]
  [string]$ClientSecret,

  [Parameter(Mandatory = $false)]
  [switch]$DeviceLogin,

  [Parameter(Mandatory = $false)]
  [string]$OutputDir = "/Users/bobbyfetting/hb-intel/packages/sharepoint-docs/infrastructure/templates/project-spotlight-in-progress"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Connect-TemplateExtractionPnP {
  if (-not [string]::IsNullOrWhiteSpace($ClientSecret)) {
    Write-Host "Connecting with app secret auth..." -ForegroundColor Cyan
    Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -ClientSecret $ClientSecret -Realm $Tenant
    return
  }

  if ($DeviceLogin) {
    Write-Host "Connecting with delegated device login..." -ForegroundColor Cyan
    Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -Tenant $Tenant -DeviceLogin
  }
  else {
    Write-Host "Connecting with delegated interactive login..." -ForegroundColor Cyan
    Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -Tenant $Tenant -Interactive
  }
}

function Find-NodeByLocalName {
  param(
    [Parameter(Mandatory = $true)] [xml]$Document,
    [Parameter(Mandatory = $true)] [string]$LocalName
  )
  return $Document.SelectSingleNode("//*[local-name()='$LocalName']")
}

function Find-ChildNodesByLocalName {
  param(
    [Parameter(Mandatory = $true)] [System.Xml.XmlNode]$Node,
    [Parameter(Mandatory = $true)] [string]$LocalName
  )
  $nodes = $Node.SelectNodes("./*[local-name()='$LocalName']")
  if ($null -eq $nodes) {
    return @()
  }
  return @($nodes | ForEach-Object { $_ })
}

function Get-ClientSidePageIdentityText {
  param(
    [Parameter(Mandatory = $true)] [System.Xml.XmlNode]$PageNode
  )

  $parts = New-Object System.Collections.Generic.List[string]

  foreach ($attrName in @("PageName", "Name", "Title")) {
    $attr = $PageNode.Attributes[$attrName]
    if ($null -ne $attr -and -not [string]::IsNullOrWhiteSpace($attr.Value)) {
      $parts.Add($attr.Value)
    }
  }

  foreach ($childName in @("PageName", "Name", "Title")) {
    $child = $PageNode.SelectSingleNode("./*[local-name()='$childName']")
    if ($null -ne $child -and -not [string]::IsNullOrWhiteSpace($child.InnerText)) {
      $parts.Add($child.InnerText)
    }
  }

  $parts.Add($PageNode.OuterXml)
  return ($parts -join " ")
}

function Remove-NonPageArtifacts {
  param(
    [Parameter(Mandatory = $true)] [System.Xml.XmlNode]$ProvisioningTemplateNode
  )

  $children = @($ProvisioningTemplateNode.SelectNodes("./*"))
  foreach ($child in $children) {
    if ($child.LocalName -ne "ClientSidePages") {
      [void]$ProvisioningTemplateNode.RemoveChild($child)
    }
  }
}

function Replace-SiteTokens {
  param(
    [Parameter(Mandatory = $true)] [string]$Path,
    [Parameter(Mandatory = $true)] [string]$SourceSiteUrl
  )

  $content = [System.IO.File]::ReadAllText($Path)
  $canonicalSite = $SourceSiteUrl.TrimEnd("/")

  $content = $content -replace [regex]::Escape($canonicalSite), '${site}'

  $jsonEscapedSite = $canonicalSite -replace "/", "\\/"
  $content = $content -replace [regex]::Escape($jsonEscapedSite), '${site}'

  [System.IO.File]::WriteAllText($Path, $content)
}

function Write-BindingsReport {
  param(
    [Parameter(Mandatory = $true)] [string]$TemplatePath,
    [Parameter(Mandatory = $true)] [string]$ReportPath
  )

  $content = [System.IO.File]::ReadAllText($TemplatePath)

  $urls = [regex]::Matches($content, '(https?://[^"''\s<]+)') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
  $guids = [regex]::Matches($content, '\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b') | ForEach-Object { $_.Value } | Sort-Object -Unique
  $listIds = [regex]::Matches($content, '"listId"\s*:\s*"([0-9a-fA-F-]{36})"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
  $webPartIds = [regex]::Matches($content, '"webPartId"\s*:\s*"([0-9a-fA-F-]{36})"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add("# Project Spotlight Page Template Bindings Report")
  $lines.Add("")
  $lines.Add("Generated: $(Get-Date -Format o)")
  $lines.Add("Template: $TemplatePath")
  $lines.Add("")
  $lines.Add("## Remaining Absolute URLs")
  if (@($urls).Count -eq 0) {
    $lines.Add("- None found.")
  }
  else {
    foreach ($item in $urls) { $lines.Add("- $item") }
  }

  $lines.Add("")
  $lines.Add("## Referenced List IDs")
  if (@($listIds).Count -eq 0) {
    $lines.Add("- None found.")
  }
  else {
    foreach ($item in $listIds) { $lines.Add("- $item") }
  }

  $lines.Add("")
  $lines.Add("## Referenced WebPart IDs")
  if (@($webPartIds).Count -eq 0) {
    $lines.Add("- None found.")
  }
  else {
    foreach ($item in $webPartIds) { $lines.Add("- $item") }
  }

  $lines.Add("")
  $lines.Add("## Other GUID-like Identifiers")
  if (@($guids).Count -eq 0) {
    $lines.Add("- None found.")
  }
  else {
    foreach ($item in $guids) { $lines.Add("- $item") }
  }

  $lines.Add("")
  $lines.Add("## Notes")
  $lines.Add("- Presence of GUIDs/webpart IDs is expected for modern page control fidelity.")
  $lines.Add("- Remaining absolute URLs may require environment-specific replacement at apply time.")

  [System.IO.File]::WriteAllLines($ReportPath, $lines)
}

try {
  $null = New-Item -ItemType Directory -Path $OutputDir -Force

  $artifactPath = Join-Path $OutputDir "Project-Spotlight-In-Progress.page-template.xml"
  $reportPath = Join-Path $OutputDir "bindings-report.md"
  $pageLeaf = Split-Path -Leaf $PageServerRelativePath

  Connect-TemplateExtractionPnP

  Write-Host "Verifying source page identity..." -ForegroundColor Cyan
  $pageItem = Get-PnPFile -Url $PageServerRelativePath -AsListItem -ErrorAction Stop
  $resolvedRef = [string]$pageItem["FileRef"]
  if ($resolvedRef -ne $PageServerRelativePath) {
    throw "Resolved page mismatch. Expected '$PageServerRelativePath', got '$resolvedRef'."
  }

  Write-Host "Verified source page: $resolvedRef" -ForegroundColor Green

  $pageIdentity = "Templates/$pageLeaf"
  Write-Host "Exporting single-page PnP template via Export-PnPPage..." -ForegroundColor Cyan
  Export-PnPPage -Identity $pageIdentity -Out $artifactPath -Force | Out-Null

  if (-not (Test-Path $artifactPath)) {
    throw "Export did not produce expected artifact at '$artifactPath'."
  }

  [xml]$exportedXml = Get-Content -Raw -Path $artifactPath
  $provisioningTemplate = Find-NodeByLocalName -Document $exportedXml -LocalName "ProvisioningTemplate"
  if ($null -eq $provisioningTemplate) {
    throw "Extracted artifact is missing ProvisioningTemplate."
  }

  $clientSidePages = Find-NodeByLocalName -Document $exportedXml -LocalName "ClientSidePages"
  if ($null -eq $clientSidePages) {
    throw "Extracted artifact is missing ClientSidePages."
  }

  $pageNodes = @(Find-ChildNodesByLocalName -Node $clientSidePages -LocalName "ClientSidePage")
  if (@($pageNodes).Count -ne 1) {
    throw "Expected exactly one ClientSidePage in exported artifact, found $(@($pageNodes).Count)."
  }

  $identityText = Get-ClientSidePageIdentityText -PageNode $pageNodes[0]
  if ($identityText -notlike "*$pageLeaf*") {
    throw "Exported page identity does not match target '$pageLeaf'."
  }

  Replace-SiteTokens -Path $artifactPath -SourceSiteUrl $SiteUrl
  Write-BindingsReport -TemplatePath $artifactPath -ReportPath $reportPath

  Write-Host ""
  Write-Host "Extraction complete." -ForegroundColor Green
  Write-Host "Source page: $resolvedRef"
  Write-Host "Template artifact: $artifactPath"
  Write-Host "Bindings report: $reportPath"
}
finally {
  $conn = Get-PnPConnection -ErrorAction SilentlyContinue
  if ($null -ne $conn) {
    Disconnect-PnPOnline -ErrorAction SilentlyContinue
  }
}
