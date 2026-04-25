[CmdletBinding()]
param(
  [string]$SiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral",
  [string]$ClientId = "08c399eb-a394-4087-b859-659d493f8dc7",
  [string]$OutputDir = (Join-Path $PSScriptRoot "exports"),
  [string]$AuthMode = "Interactive",
  [string]$Tenant = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$AllowedSiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"
$AllowedClientId = "08c399eb-a394-4087-b859-659d493f8dc7"
$MutationLists = @("HB_FoleonContentRegistry", "HB_FoleonHomepagePlacements", "HB_FoleonInteractionEvents")
$InspectOnlyLists = @("HB_FoleonSyncRuns")
$AllLists = @($MutationLists + $InspectOnlyLists)
$ResolvedLists = @{}

if ($SiteUrl -ne $AllowedSiteUrl) {
  throw "Refusing to run against unapproved site URL: $SiteUrl"
}
if ($ClientId -ne $AllowedClientId) {
  throw "Refusing to run with unapproved client ID: $ClientId"
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$Actions = [System.Collections.Generic.List[object]]::new()
$ProbeResults = [System.Collections.Generic.List[object]]::new()
$RunStartedUtc = (Get-Date).ToUniversalTime().ToString("o")

function Add-Action {
  param(
    [string]$List,
    [string]$Target,
    [string]$Action,
    [string]$Result,
    [string]$Detail = ""
  )
  $script:Actions.Add([ordered]@{
    list = $List
    target = $Target
    action = $Action
    result = $Result
    detail = $Detail
    timestampUtc = (Get-Date).ToUniversalTime().ToString("o")
  }) | Out-Null
  Write-Host "[$Result] $List :: $Target :: $Action $Detail"
}

function Connect-FoleonTenant {
  $params = @{
    Url = $SiteUrl
    ClientId = $ClientId
  }
  if (-not [string]::IsNullOrWhiteSpace($Tenant)) {
    $params.Tenant = $Tenant
  }
  if ($AuthMode -eq "DeviceLogin") {
    $params.DeviceLogin = $true
  } else {
    $params.Interactive = $true
  }

  Connect-PnPOnline @params
  if ([string]::IsNullOrWhiteSpace($Tenant)) {
    return "Connect-PnPOnline -Url `"$SiteUrl`" -ClientId `"$ClientId`" -$AuthMode"
  }
  return "Connect-PnPOnline -Url `"$SiteUrl`" -ClientId `"$ClientId`" -Tenant `"$Tenant`" -$AuthMode"
}

function Get-ChoiceArray {
  param([object]$Field)
  $choices = @()
  if ($null -ne $Field -and $null -ne $Field.Choices) {
    foreach ($choice in $Field.Choices) {
      $choices += [string]$choice
    }
  }
  return $choices
}

function Resolve-ApprovedList {
  param([string]$ApprovedName)

  $list = Get-PnPList -Identity $ApprovedName -Includes Id,Title,RootFolder,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount -ErrorAction SilentlyContinue
  if ($null -eq $list) {
    $list = Get-PnPList -Includes Id,Title,RootFolder,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount |
      Where-Object { $_.RootFolder.ServerRelativeUrl -eq "/sites/HBCentral/Lists/$ApprovedName" } |
      Select-Object -First 1
  }
  if ($null -eq $list) {
    throw "Approved list '$ApprovedName' was not found by title or root folder."
  }
  $script:ResolvedLists[$ApprovedName] = [ordered]@{
    approvedName = $ApprovedName
    title = [string]$list.Title
    id = [string]$list.Id
    rootFolderServerRelativeUrl = [string]$list.RootFolder.ServerRelativeUrl
  }
  return $list
}

function Get-ResolvedListIdentity {
  param([string]$ApprovedName)
  if (-not $script:ResolvedLists.ContainsKey($ApprovedName)) {
    Resolve-ApprovedList -ApprovedName $ApprovedName | Out-Null
  }
  return [string]$script:ResolvedLists[$ApprovedName].Title
}

function Get-ExpectedType {
  param([string]$Type)
  switch ($Type) {
    "Choice" { return "Choice" }
    "Text" { return "Text" }
    "Boolean" { return "Boolean" }
    "DateTime" { return "DateTime" }
    default { throw "Unsupported field type '$Type'." }
  }
}

function Assert-FieldType {
  param(
    [string]$ListTitle,
    [object]$Field,
    [string]$ExpectedType
  )
  $actual = [string]$Field.TypeAsString
  $expected = Get-ExpectedType -Type $ExpectedType
  if ($actual -ne $expected) {
    throw "Type mismatch on $ListTitle.$($Field.InternalName). Expected '$expected', found '$actual'. Stopping without type conversion."
  }
}

function Ensure-Field {
  param(
    [string]$ListTitle,
    [hashtable]$Def
  )

  $field = Get-PnPField -List $ListTitle -Identity $Def.InternalName -ErrorAction SilentlyContinue
  if ($null -eq $field) {
    if ($Def.Type -eq "Choice") {
      Add-PnPField -List $ListTitle -InternalName $Def.InternalName -DisplayName $Def.DisplayName -Type Choice -Choices $Def.Choices -Required:([bool]$Def.Required) -AddToDefaultView:$false | Out-Null
    } else {
      Add-PnPField -List $ListTitle -InternalName $Def.InternalName -DisplayName $Def.DisplayName -Type $Def.Type -Required:([bool]$Def.Required) -AddToDefaultView:$false | Out-Null
    }
    Add-Action -List $ListTitle -Target $Def.InternalName -Action "create-field" -Result "created" -Detail "type=$($Def.Type)"
    $field = Get-PnPField -List $ListTitle -Identity $Def.InternalName
  } else {
    Assert-FieldType -ListTitle $ListTitle -Field $field -ExpectedType $Def.Type
    Add-Action -List $ListTitle -Target $Def.InternalName -Action "verify-field" -Result "exists" -Detail "type=$($field.TypeAsString)"
  }

  if ($Def.Type -eq "Choice") {
    Ensure-Choices -ListTitle $ListTitle -FieldName $Def.InternalName -RequiredChoices $Def.Choices
  }
}

function Ensure-Choices {
  param(
    [string]$ListTitle,
    [string]$FieldName,
    [string[]]$RequiredChoices
  )

  $field = Get-PnPField -List $ListTitle -Identity $FieldName
  Assert-FieldType -ListTitle $ListTitle -Field $field -ExpectedType "Choice"

  $currentChoices = @(Get-ChoiceArray -Field $field)
  $missing = @()
  foreach ($choice in $RequiredChoices) {
    if ($currentChoices -notcontains $choice) {
      $missing += $choice
    }
  }

  if ($missing.Count -eq 0) {
    Add-Action -List $ListTitle -Target $FieldName -Action "verify-choices" -Result "unchanged" -Detail "all required choices present"
    return
  }

  $updatedChoices = @($currentChoices + $missing)
  $field.Choices = [string[]]$updatedChoices
  $field.Update()
  Invoke-PnPQuery
  Add-Action -List $ListTitle -Target $FieldName -Action "append-choices" -Result "updated" -Detail ($missing -join ", ")
}

function Ensure-Index {
  param(
    [string]$ListTitle,
    [string]$FieldName
  )

  $field = Get-PnPField -List $ListTitle -Identity $FieldName -ErrorAction Stop
  if ([bool]$field.Indexed) {
    Add-Action -List $ListTitle -Target $FieldName -Action "verify-index" -Result "present"
    return
  }

  Set-PnPField -List $ListTitle -Identity $FieldName -Values @{ Indexed = $true } | Out-Null
  $field = Get-PnPField -List $ListTitle -Identity $FieldName
  $result = if ([bool]$field.Indexed) { "created" } else { "queued-or-pending" }
  Add-Action -List $ListTitle -Target $FieldName -Action "create-index" -Result $result
}

function Export-FieldSnapshot {
  param(
    [string]$Path,
    [string]$Phase,
    [string]$AuthCommand
  )

  $lists = [System.Collections.Generic.List[object]]::new()
  foreach ($approvedName in $AllLists) {
    $listTitle = Get-ResolvedListIdentity -ApprovedName $approvedName
    $list = Get-PnPList -Identity $listTitle -Includes Id,Title,RootFolder,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount
    $fields = Get-PnPField -List $listTitle | Sort-Object InternalName | ForEach-Object {
      [ordered]@{
        internalName = [string]$_.InternalName
        title = [string]$_.Title
        typeAsString = [string]$_.TypeAsString
        required = [bool]$_.Required
        indexed = [bool]$_.Indexed
        hidden = [bool]$_.Hidden
        readOnlyField = [bool]$_.ReadOnlyField
        sealed = [bool]$_.Sealed
        enforceUniqueValues = [bool]$_.EnforceUniqueValues
        choices = if ($_.TypeAsString -eq "Choice") { @(Get-ChoiceArray -Field $_) } else { @() }
      }
    }

    $lists.Add([ordered]@{
      approvedName = $approvedName
      title = [string]$list.Title
      id = [string]$list.Id
      rootFolderServerRelativeUrl = [string]$list.RootFolder.ServerRelativeUrl
      baseTemplate = [int]$list.BaseTemplate
      hidden = [bool]$list.Hidden
      enableVersioning = [bool]$list.EnableVersioning
      enableAttachments = [bool]$list.EnableAttachments
      itemCount = [int]$list.ItemCount
      fields = @($fields)
    }) | Out-Null
  }

  $snapshot = [ordered]@{
    generatedUtc = (Get-Date).ToUniversalTime().ToString("o")
    phase = $Phase
    siteUrl = $SiteUrl
    clientId = $ClientId
    authCommand = $AuthCommand
    mutationLists = $MutationLists
    inspectOnlyLists = $InspectOnlyLists
    resolvedLists = $ResolvedLists
    lists = @($lists)
  }
  $snapshot | ConvertTo-Json -Depth 20 | Set-Content -Path $Path -Encoding UTF8
}

function Invoke-Probe {
  param(
    [string]$Name,
    [string]$RelativeUrl
  )

  try {
    $response = Invoke-PnPSPRestMethod -Url $RelativeUrl -Method Get
    $count = 0
    if ($null -ne $response.value) {
      $count = @($response.value).Count
    } elseif ($null -ne $response.d -and $null -ne $response.d.results) {
      $count = @($response.d.results).Count
    }
    $script:ProbeResults.Add([ordered]@{
      name = $Name
      relativeUrl = $RelativeUrl
      httpStatus = 200
      returnedItemCount = $count
      ok = $true
      error = $null
      timestampUtc = (Get-Date).ToUniversalTime().ToString("o")
    }) | Out-Null
    Write-Host "[probe:200] $Name returned $count row(s)"
  } catch {
    $script:ProbeResults.Add([ordered]@{
      name = $Name
      relativeUrl = $RelativeUrl
      httpStatus = $null
      returnedItemCount = $null
      ok = $false
      error = $_.Exception.Message
      timestampUtc = (Get-Date).ToUniversalTime().ToString("o")
    }) | Out-Null
    throw "Probe failed: $Name :: $($_.Exception.Message)"
  }
}

$ContentFields = @(
  @{ InternalName = "ReaderKey"; DisplayName = "Reader Key"; Type = "Choice"; Required = $false; Choices = @("project-spotlight", "company-pulse") },
  @{ InternalName = "Cadence"; DisplayName = "Cadence"; Type = "Choice"; Required = $false; Choices = @("Monthly", "Weekly", "Frequent", "Ad Hoc") },
  @{ InternalName = "HomepageSlot"; DisplayName = "Homepage Slot"; Type = "Choice"; Required = $false; Choices = @("Project Spotlight Reader", "Company Pulse Reader") },
  @{ InternalName = "ArchiveGroup"; DisplayName = "Archive Group"; Type = "Text"; Required = $false },
  @{ InternalName = "ActiveEdition"; DisplayName = "Active Edition"; Type = "Boolean"; Required = $false },
  @{ InternalName = "PrimaryAudience"; DisplayName = "Primary Audience"; Type = "Choice"; Required = $false; Choices = @("Companywide", "Operations", "Field", "Leadership", "Marketing", "Safety", "IT") },
  @{ InternalName = "LastEditorialUpdate"; DisplayName = "Last Editorial Update"; Type = "DateTime"; Required = $false }
)

$ContentIndexes = @(
  "ReaderKey", "HomepageSlot", "ArchiveGroup", "ActiveEdition", "LastEditorialUpdate",
  "FoleonDocId", "PublishStatus", "IsVisible", "IsHomepageEligible", "PublishedOn",
  "DisplayFrom", "DisplayThrough", "SortRank", "AllowEmbed", "SyncSource"
)
$PlacementIndexes = @("PlacementKey", "ContentIdCache", "IsActive", "DisplayFrom", "DisplayThrough", "SortRank", "LayoutVariant")
$InteractionIndexes = @("PageContext")

$AuthCommand = Connect-FoleonTenant

try {
  $web = Get-PnPWeb -Includes Url,Title
  Add-Action -List "site" -Target $SiteUrl -Action "connect" -Result "reachable" -Detail $web.Title

  foreach ($approvedName in $AllLists) {
    $list = Resolve-ApprovedList -ApprovedName $approvedName
    $scope = if ($MutationLists -contains $approvedName) { "mutation-target" } else { "inspect-only" }
    Add-Action -List $approvedName -Target "list" -Action "resolve-list" -Result "resolved" -Detail "$scope title='$($list.Title)' root='$($list.RootFolder.ServerRelativeUrl)'"
  }

  Export-FieldSnapshot -Path (Join-Path $OutputDir "preflight-fields.json") -Phase "preflight" -AuthCommand $AuthCommand

  $ContentRegistryList = Get-ResolvedListIdentity -ApprovedName "HB_FoleonContentRegistry"
  $HomepagePlacementsList = Get-ResolvedListIdentity -ApprovedName "HB_FoleonHomepagePlacements"
  $InteractionEventsList = Get-ResolvedListIdentity -ApprovedName "HB_FoleonInteractionEvents"

  foreach ($fieldDef in $ContentFields) {
    Ensure-Field -ListTitle $ContentRegistryList -Def $fieldDef
  }
  Ensure-Choices -ListTitle $ContentRegistryList -FieldName "ContentTypeKey" -RequiredChoices @("Project Spotlight", "Company Pulse")
  Ensure-Choices -ListTitle $HomepagePlacementsList -FieldName "PlacementKey" -RequiredChoices @("Project Spotlight Active", "Company Pulse Active")
  Ensure-Choices -ListTitle $InteractionEventsList -FieldName "PageContext" -RequiredChoices @("Project Spotlight", "Company Pulse")

  foreach ($fieldName in $ContentIndexes) { Ensure-Index -ListTitle $ContentRegistryList -FieldName $fieldName }
  foreach ($fieldName in $PlacementIndexes) { Ensure-Index -ListTitle $HomepagePlacementsList -FieldName $fieldName }
  foreach ($fieldName in $InteractionIndexes) { Ensure-Index -ListTitle $InteractionEventsList -FieldName $fieldName }

  Export-FieldSnapshot -Path (Join-Path $OutputDir "post-provision-fields.json") -Phase "post-provision" -AuthCommand $AuthCommand

  Invoke-Probe -Name "scalar-safe-content-select" -RelativeUrl "/_api/web/lists/getbytitle('$ContentRegistryList')/items?`$select=Id,Title,ReaderKey,ContentTypeKey,ActiveEdition,IsVisible,PublishStatus,IsHomepageEligible,HomepageSlot,ArchiveGroup,LastEditorialUpdate&`$top=1"
  Invoke-Probe -Name "project-spotlight-active-reader-filter" -RelativeUrl "/_api/web/lists/getbytitle('$ContentRegistryList')/items?`$select=Id,Title,ReaderKey,ContentTypeKey,ActiveEdition,IsVisible,PublishStatus,IsHomepageEligible,PublishedOn,LastEditorialUpdate&`$filter=ReaderKey eq 'project-spotlight' and ActiveEdition eq 1 and IsVisible eq 1 and PublishStatus eq 'Published' and IsHomepageEligible eq 1&`$top=1"
  Invoke-Probe -Name "company-pulse-active-reader-filter" -RelativeUrl "/_api/web/lists/getbytitle('$ContentRegistryList')/items?`$select=Id,Title,ReaderKey,ContentTypeKey,ActiveEdition,IsVisible,PublishStatus,IsHomepageEligible,PublishedOn,LastEditorialUpdate&`$filter=ReaderKey eq 'company-pulse' and ActiveEdition eq 1 and IsVisible eq 1 and PublishStatus eq 'Published' and IsHomepageEligible eq 1&`$top=1"
  Invoke-Probe -Name "active-placements" -RelativeUrl "/_api/web/lists/getbytitle('$HomepagePlacementsList')/items?`$select=Id,Title,PlacementKey,ContentIdCache,IsActive,SortRank&`$filter=IsActive eq 1&`$top=5"

  [ordered]@{
    generatedUtc = (Get-Date).ToUniversalTime().ToString("o")
    startedUtc = $RunStartedUtc
    siteUrl = $SiteUrl
    clientId = $ClientId
    probes = @($ProbeResults)
  } | ConvertTo-Json -Depth 12 | Set-Content -Path (Join-Path $OutputDir "query-probe-results.json") -Encoding UTF8

  [ordered]@{
    generatedUtc = (Get-Date).ToUniversalTime().ToString("o")
    startedUtc = $RunStartedUtc
    siteUrl = $SiteUrl
    clientId = $ClientId
    authCommand = $AuthCommand
    mutationLists = $MutationLists
    inspectOnlyLists = $InspectOnlyLists
    resolvedLists = $ResolvedLists
    actions = @($Actions)
    probes = @($ProbeResults)
  } | ConvertTo-Json -Depth 16 | Set-Content -Path (Join-Path $OutputDir "provisioning-run-summary.json") -Encoding UTF8

  Write-Host "PASS Foleon two-lane tenant schema provisioning"
} finally {
  Disconnect-PnPOnline -ErrorAction SilentlyContinue
}
