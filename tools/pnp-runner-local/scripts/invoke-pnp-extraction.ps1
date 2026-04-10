param(
  [Parameter(Mandatory = $true)] [string]$ActionKey,
  [Parameter(Mandatory = $true)] [string]$TargetSiteUrl,
  [Parameter(Mandatory = $true)] [string]$RunId,
  [Parameter(Mandatory = $true)] [string]$OutputRawPath,
  [Parameter(Mandatory = $true)] [string]$OutputNormalizedPath,
  [Parameter(Mandatory = $true)] [string]$OutputSummaryPath,
  [Parameter(Mandatory = $true)] [ValidateSet('DeviceLogin', 'Interactive')] [string]$AuthMode,
  [Parameter(Mandatory = $true)] [string]$ClientId,
  [Parameter(Mandatory = $true)] [string]$Tenant,
  [string]$ListFiltersCsv = '',
  [string]$PageFiltersCsv = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Split-Csv([string]$InputValue) {
  if ([string]::IsNullOrWhiteSpace($InputValue)) { return @() }
  return $InputValue.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
}

function Ensure-ParentDirectory([string]$FilePath) {
  $parent = Split-Path -Parent $FilePath
  if (-not (Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
}

function Get-ConnectionMethodText() {
  if ($AuthMode -eq 'DeviceLogin') { return 'Connect-PnPOnline -DeviceLogin' }
  return 'Connect-PnPOnline -Interactive'
}

function Get-PageWebpartIds([string]$CanvasContent) {
  if ([string]::IsNullOrWhiteSpace($CanvasContent)) { return @() }
  $matches = [System.Text.RegularExpressions.Regex]::Matches($CanvasContent, '"webPartId":"([0-9a-fA-F-]{36})"')
  $ids = @()
  foreach ($match in $matches) {
    $ids += $match.Groups[1].Value
  }
  return $ids | Sort-Object -Unique
}

if ($AuthMode -eq 'DeviceLogin') {
  Connect-PnPOnline -Url $TargetSiteUrl -ClientId $ClientId -Tenant $Tenant -DeviceLogin
} else {
  Connect-PnPOnline -Url $TargetSiteUrl -ClientId $ClientId -Tenant $Tenant -Interactive
}

$listFilters = Split-Csv $ListFiltersCsv
$pageFilters = Split-Csv $PageFiltersCsv
$timestamp = (Get-Date).ToString('o')

$raw = [ordered]@{
  runId = $RunId
  actionKey = $ActionKey
  fetchedAt = $timestamp
  targetSiteUrl = $TargetSiteUrl
  authMode = $AuthMode
  connectionMethod = Get-ConnectionMethodText
  listFilters = $listFilters
  pageFilters = $pageFilters
}

$normalized = [ordered]@{
  metadata = [ordered]@{
    runId = $RunId
    actionKey = $ActionKey
    generatedAt = $timestamp
    targetSiteUrl = $TargetSiteUrl
  }
}

$summaryLines = @(
  '# PnP Extraction Summary',
  '',
  "- Run ID: $RunId",
  "- Action: $ActionKey",
  "- Target Site: $TargetSiteUrl",
  "- Generated At: $timestamp",
  "- Auth Mode: $AuthMode",
  ''
)

switch ($ActionKey) {
  'sharepoint-control:extraction:site-template' {
    $web = Get-PnPWeb -Includes Title,Url,WebTemplate,Configuration,Language,Description
    $raw.site = [ordered]@{
      title = $web.Title
      url = $web.Url
      webTemplate = $web.WebTemplate
      configuration = $web.Configuration
      language = $web.Language
      description = $web.Description
    }
    $normalized.template = [ordered]@{
      title = $web.Title
      url = $web.Url
      template = "$($web.WebTemplate)#$($web.Configuration)"
      language = $web.Language
    }
    $summaryLines += '- Captured site template metadata and core web properties.'
  }
  'sharepoint-control:extraction:list-schema' {
    $lists = @()
    foreach ($listName in $listFilters) {
      $list = Get-PnPList -Identity $listName -Includes Id,Title,BaseTemplate,BaseType,Description,Hidden,ItemCount,EnableVersioning,EnableModeration,DefaultViewUrl,EntityTypeName
      $fields = Get-PnPField -List $listName
      $views = Get-PnPView -List $listName
      foreach ($view in $views) {
        $view.Context.Load($view.ViewFields)
        $view.Context.ExecuteQuery()
      }
      $contentTypes = Get-PnPContentType -List $listName
      foreach ($ct in $contentTypes) {
        $ct.Context.Load($ct.FieldLinks)
        $ct.Context.ExecuteQuery()
      }
      $lists += [ordered]@{
        title = $list.Title
        id = $list.Id.ToString()
        itemCount = $list.ItemCount
        baseTemplate = $list.BaseTemplate
        baseType = $list.BaseType
        fields = $fields | Select-Object Title,InternalName,StaticName,TypeAsString,FieldTypeKind,Required,Hidden,ReadOnlyField,Indexed,Sealed
        views = $views | ForEach-Object {
          [ordered]@{
            title = $_.Title
            id = $_.Id.ToString()
            defaultView = $_.DefaultView
            viewFields = @($_.ViewFields)
            rowLimit = $_.RowLimit
          }
        }
        contentTypes = $contentTypes | ForEach-Object {
          [ordered]@{
            name = $_.Name
            id = $_.StringId
            fieldLinks = @($_.FieldLinks | ForEach-Object { $_.Name })
          }
        }
      }
    }
    $raw.lists = $lists
    $normalized.counts = [ordered]@{
      listCount = @($lists).Count
      fieldCount = (@($lists | ForEach-Object { @($_.fields).Count } | Measure-Object -Sum).Sum)
      viewCount = (@($lists | ForEach-Object { @($_.views).Count } | Measure-Object -Sum).Sum)
      contentTypeCount = (@($lists | ForEach-Object { @($_.contentTypes).Count } | Measure-Object -Sum).Sum)
    }
    $normalized.lists = $lists | ForEach-Object {
      [ordered]@{
        title = $_.title
        id = $_.id
        fieldInternalNames = @($_.fields | ForEach-Object { $_.InternalName })
      }
    }
    $summaryLines += "- Extracted schema for $(@($lists).Count) list(s)."
  }
  'sharepoint-control:extraction:page-layout' {
    $sitePages = Get-PnPListItem -List 'Site Pages' -Fields FileLeafRef,FileRef,CanvasContent1,Title -PageSize 200
    $pages = $sitePages | Where-Object { $pageFilters.Count -eq 0 -or $pageFilters -contains $_['FileLeafRef'] } | ForEach-Object {
      [ordered]@{
        fileLeafRef = $_['FileLeafRef']
        fileRef = $_['FileRef']
        title = $_['Title']
        webPartIds = @(Get-PageWebpartIds ([string]$_['CanvasContent1']))
      }
    }
    $raw.pages = $pages
    $normalized.counts = [ordered]@{
      pageCount = @($pages).Count
      webpartInstanceCount = (@($pages | ForEach-Object { @($_.webPartIds).Count } | Measure-Object -Sum).Sum)
    }
    $normalized.pages = $pages
    $summaryLines += "- Extracted layout/webpart metadata for $(@($pages).Count) page(s)."
  }
  'sharepoint-control:extraction:site-inventory' {
    $lists = Get-PnPList
    $raw.inventory = [ordered]@{
      lists = $lists | Select-Object Title,BaseTemplate,BaseType,Hidden,ItemCount
    }
    $normalized.counts = [ordered]@{
      listCount = @($lists).Count
      visibleListCount = @($lists | Where-Object { -not $_.Hidden }).Count
    }
    $normalized.inventory = $raw.inventory
    $summaryLines += '- Extracted site inventory from all lists/libraries.'
  }
  'sharepoint-control:extraction:library-folder-tree' {
    $libraries = @()
    foreach ($libraryName in $listFilters) {
      $rootItems = Get-PnPFolderItem -List $libraryName -FolderSiteRelativeUrl $libraryName -ItemType Folder -ErrorAction SilentlyContinue
      $folders = @()
      foreach ($folder in @($rootItems)) {
        $folders += [ordered]@{
          name = $folder.Name
          serverRelativeUrl = $folder.ServerRelativeUrl
        }
      }
      $libraries += [ordered]@{
        libraryName = $libraryName
        folders = $folders
      }
    }
    $raw.libraries = $libraries
    $normalized.counts = [ordered]@{
      libraryCount = @($libraries).Count
      folderCount = (@($libraries | ForEach-Object { @($_.folders).Count } | Measure-Object -Sum).Sum)
    }
    $normalized.libraries = $libraries
    $summaryLines += "- Extracted folder-tree metadata for $(@($libraries).Count) library(ies)."
  }
  'sharepoint-control:extraction:site-groups-summary' {
    $groups = Get-PnPSiteGroup
    $groupSummaries = @()
    foreach ($group in $groups) {
      $members = Get-PnPGroupMember -Identity $group.Title -ErrorAction SilentlyContinue
      $groupSummaries += [ordered]@{
        title = $group.Title
        id = $group.Id
        memberCount = @($members).Count
        members = @($members | Select-Object Title,Email,LoginName)
      }
    }
    $raw.groups = $groupSummaries
    $normalized.counts = [ordered]@{
      groupCount = @($groupSummaries).Count
      memberCount = (@($groupSummaries | ForEach-Object { $_.memberCount } | Measure-Object -Sum).Sum)
    }
    $normalized.groups = $groupSummaries | ForEach-Object { [ordered]@{ title = $_.title; memberCount = $_.memberCount } }
    $summaryLines += "- Extracted $(@($groupSummaries).Count) site group summaries."
  }
  'sharepoint-control:extraction:page-webpart-inventory' {
    $sitePages = Get-PnPListItem -List 'Site Pages' -Fields FileLeafRef,FileRef,CanvasContent1,Title -PageSize 200
    $pages = $sitePages | Where-Object { $pageFilters.Count -eq 0 -or $pageFilters -contains $_['FileLeafRef'] } | ForEach-Object {
      $ids = @(Get-PageWebpartIds ([string]$_['CanvasContent1']))
      [ordered]@{
        fileLeafRef = $_['FileLeafRef']
        fileRef = $_['FileRef']
        title = $_['Title']
        webPartIds = $ids
        webPartCount = @($ids).Count
      }
    }
    $raw.pages = $pages
    $normalized.counts = [ordered]@{
      pageCount = @($pages).Count
      webpartInstanceCount = (@($pages | ForEach-Object { $_.webPartCount } | Measure-Object -Sum).Sum)
      uniqueWebpartCount = @($pages | ForEach-Object { $_.webPartIds } | Select-Object -Unique).Count
    }
    $normalized.pages = $pages
    $summaryLines += "- Extracted webpart inventory for $(@($pages).Count) page(s)."
  }
  default {
    throw "Unsupported action key: $ActionKey"
  }
}

$summaryLines += ''
$summaryLines += '## Notes'
$summaryLines += '- Extraction ran from local-runner using read-only PnP cmdlets only.'

Ensure-ParentDirectory $OutputRawPath
Ensure-ParentDirectory $OutputNormalizedPath
Ensure-ParentDirectory $OutputSummaryPath

($raw | ConvertTo-Json -Depth 25) | Set-Content -Path $OutputRawPath -Encoding UTF8
($normalized | ConvertTo-Json -Depth 25) | Set-Content -Path $OutputNormalizedPath -Encoding UTF8
($summaryLines -join [Environment]::NewLine) | Set-Content -Path $OutputSummaryPath -Encoding UTF8
