param(
  [Parameter(Mandatory = $true)] [string]$ActionKey,
  [Parameter(Mandatory = $true)] [string]$TargetSiteUrl,
  [Parameter(Mandatory = $true)] [string]$RunId,
  [Parameter(Mandatory = $true)] [string]$OutputRawPath,
  [Parameter(Mandatory = $true)] [string]$OutputNormalizedPath,
  [Parameter(Mandatory = $true)] [string]$OutputSummaryPath,
  [Parameter(Mandatory = $true)] [string]$OutputProvisionSummaryPath,
  [Parameter(Mandatory = $true)] [string]$OutputSeedSummaryPath,
  [string]$ExecutionIntentMode = '',
  [Parameter(Mandatory = $true)] [ValidateSet('DeviceLogin', 'Interactive')] [string]$AuthMode,
  [Parameter(Mandatory = $true)] [string]$ClientId,
  [Parameter(Mandatory = $true)] [string]$Tenant,
  [string]$ListFiltersCsv = '',
  [string]$PageFiltersCsv = '',
  [switch]$StrictProof
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$CONFIG_LIST_TITLE = 'Priority Actions Band Config'
$ITEMS_LIST_TITLE = 'Priority Actions Band Items'
$CURATED_SEED_RELATIVE_PATH = '..\seeds\hbcentral\priority-actions-research-seed.json'
$QUICK_LINKS_WEBPART_ID = 'c70391ea-0b10-4ee9-b2b4-006d3fcad0cd'
$PRIORITY_ACTIONS_RAIL_WEBPART_ID = 'b3f07190-79cf-437d-a1d6-ecbf3f77e616'
$HB_SIGNATURE_HERO_WEBPART_ID = '28acd6a7-2582-4d8a-86d4-b52bfbeb375c'
$HB_HOMEPAGE_WEBPART_ID = 'e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf'

$CONFIG_DEFAULT_ROW = [ordered]@{
  Title = 'Homepage Priority Actions'
  BandKey = 'homepage-primary'
  Enabled = $true
  IsActive = $true
  OverflowLabel = 'More tools'
  ShowHeading = $false
  StickyAfterHero = $false
  ShowBadges = $true
  DesktopLayoutMode = 'rail'
  TabletLayoutMode = 'grid'
  MobileLayoutMode = 'sheet-trigger'
  MaxVisibleDesktop = 5
  MaxVisibleLaptop = 5
  MaxVisibleTabletLandscape = 4
  MaxVisibleTabletPortrait = 4
  MaxVisiblePhone = 4
  OpenExternalInNewTabByDefault = $true
}

$CONFIG_FIELD_DEFS = @(
  @{ InternalName = 'BandKey'; DisplayName = 'Band Key'; Type = 'Text'; Required = $true; Indexed = $true; Default = 'homepage-primary' },
  @{ InternalName = 'Enabled'; DisplayName = 'Enabled'; Type = 'Boolean'; Required = $true; Indexed = $true; Default = '1' },
  @{ InternalName = 'IsActive'; DisplayName = 'Is Active'; Type = 'Boolean'; Required = $true; Indexed = $true; Default = '1' },
  @{ InternalName = 'HeadingText'; DisplayName = 'Heading Text'; Type = 'Text'; Required = $false },
  @{ InternalName = 'OverflowLabel'; DisplayName = 'Overflow Label'; Type = 'Text'; Required = $true; Default = 'More tools' },
  @{ InternalName = 'ShowHeading'; DisplayName = 'Show Heading'; Type = 'Boolean'; Required = $true; Default = '0' },
  @{ InternalName = 'StickyAfterHero'; DisplayName = 'Sticky After Hero'; Type = 'Boolean'; Required = $true; Default = '0' },
  @{ InternalName = 'ShowBadges'; DisplayName = 'Show Badges'; Type = 'Boolean'; Required = $true; Default = '1' },
  @{ InternalName = 'DesktopLayoutMode'; DisplayName = 'Desktop Layout Mode'; Type = 'Choice'; Required = $true; Default = 'rail'; Choices = @('rail', 'segmented', 'hybrid') },
  @{ InternalName = 'TabletLayoutMode'; DisplayName = 'Tablet Layout Mode'; Type = 'Choice'; Required = $true; Default = 'grid'; Choices = @('grid', 'rail', 'hybrid') },
  @{ InternalName = 'MobileLayoutMode'; DisplayName = 'Mobile Layout Mode'; Type = 'Choice'; Required = $true; Default = 'sheet-trigger'; Choices = @('grid', 'scroll', 'sheet-trigger') },
  @{ InternalName = 'MaxVisibleDesktop'; DisplayName = 'Max Visible Desktop'; Type = 'Number'; Required = $true; Default = '5' },
  @{ InternalName = 'MaxVisibleLaptop'; DisplayName = 'Max Visible Laptop'; Type = 'Number'; Required = $true; Default = '5' },
  @{ InternalName = 'MaxVisibleTabletLandscape'; DisplayName = 'Max Visible Tablet Landscape'; Type = 'Number'; Required = $true; Default = '4' },
  @{ InternalName = 'MaxVisibleTabletPortrait'; DisplayName = 'Max Visible Tablet Portrait'; Type = 'Number'; Required = $true; Default = '4' },
  @{ InternalName = 'MaxVisiblePhone'; DisplayName = 'Max Visible Phone'; Type = 'Number'; Required = $true; Default = '4' },
  @{ InternalName = 'OpenExternalInNewTabByDefault'; DisplayName = 'Open External In New Tab By Default'; Type = 'Boolean'; Required = $true; Default = '1' },
  @{ InternalName = 'AdminNotes'; DisplayName = 'Admin Notes'; Type = 'Note'; Required = $false }
)

$ITEMS_FIELD_DEFS = @(
  @{ InternalName = 'BandKey'; DisplayName = 'Band Key'; Type = 'Text'; Required = $true; Indexed = $true; Default = 'homepage-primary' },
  @{ InternalName = 'ActionKey'; DisplayName = 'Action Key'; Type = 'Text'; Required = $true; Indexed = $true },
  @{ InternalName = 'ItemStatus'; DisplayName = 'Item Status'; Type = 'Choice'; Required = $true; Indexed = $true; Default = 'Enabled'; Choices = @('Enabled', 'Disabled', 'Archived') },
  @{ InternalName = 'ActionDescription'; DisplayName = 'Action Description'; Type = 'Note'; Required = $false },
  @{ InternalName = 'Href'; DisplayName = 'Href'; Type = 'Text'; Required = $true },
  @{ InternalName = 'IconKey'; DisplayName = 'Icon Key'; Type = 'Text'; Required = $false },
  @{ InternalName = 'BadgeLabel'; DisplayName = 'Badge Label'; Type = 'Text'; Required = $false },
  @{ InternalName = 'BadgeVariant'; DisplayName = 'Badge Variant'; Type = 'Choice'; Required = $true; Default = 'neutral'; Choices = @('neutral', 'info', 'warning', 'success', 'critical') },
  @{ InternalName = 'Priority'; DisplayName = 'Priority'; Type = 'Choice'; Required = $true; Default = 'primary'; Choices = @('primary', 'secondary', 'overflow') },
  @{ InternalName = 'GroupKey'; DisplayName = 'Group Key'; Type = 'Text'; Required = $false },
  @{ InternalName = 'GroupTitle'; DisplayName = 'Group Title'; Type = 'Text'; Required = $false },
  @{ InternalName = 'SortOrder'; DisplayName = 'Sort Order'; Type = 'Number'; Required = $true; Indexed = $true; Default = '100' },
  @{ InternalName = 'OverflowOnly'; DisplayName = 'Overflow Only'; Type = 'Boolean'; Required = $true; Default = '0' },
  @{ InternalName = 'MobilePriority'; DisplayName = 'Mobile Priority'; Type = 'Number'; Required = $false; Default = '100' },
  @{ InternalName = 'AudienceMode'; DisplayName = 'Audience Mode'; Type = 'Choice'; Required = $true; Default = 'all'; Choices = @('all', 'include-only', 'exclude', 'role-driven') },
  @{ InternalName = 'AudienceKeys'; DisplayName = 'Audience Keys'; Type = 'Note'; Required = $false },
  @{ InternalName = 'IsExternal'; DisplayName = 'Is External'; Type = 'Boolean'; Required = $true; Default = '0' },
  @{ InternalName = 'OpenInNewTab'; DisplayName = 'Open In New Tab'; Type = 'Boolean'; Required = $true; Default = '0' },
  @{ InternalName = 'VisibleDesktop'; DisplayName = 'Visible Desktop'; Type = 'Boolean'; Required = $true; Default = '1' },
  @{ InternalName = 'VisibleLaptop'; DisplayName = 'Visible Laptop'; Type = 'Boolean'; Required = $true; Default = '1' },
  @{ InternalName = 'VisibleTabletLandscape'; DisplayName = 'Visible Tablet Landscape'; Type = 'Boolean'; Required = $true; Default = '1' },
  @{ InternalName = 'VisibleTabletPortrait'; DisplayName = 'Visible Tablet Portrait'; Type = 'Boolean'; Required = $true; Default = '1' },
  @{ InternalName = 'VisiblePhone'; DisplayName = 'Visible Phone'; Type = 'Boolean'; Required = $true; Default = '1' },
  @{ InternalName = 'StartsAtUtc'; DisplayName = 'Starts At UTC'; Type = 'DateTime'; Required = $false; Indexed = $true },
  @{ InternalName = 'EndsAtUtc'; DisplayName = 'Ends At UTC'; Type = 'DateTime'; Required = $false; Indexed = $true },
  @{ InternalName = 'AdminNotes'; DisplayName = 'Admin Notes'; Type = 'Note'; Required = $false }
)

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

function Get-PropertyValue($Object, [string[]]$Names) {
  if ($null -eq $Object) { return $null }
  foreach ($name in $Names) {
    $prop = $Object.PSObject.Properties | Where-Object { $_.Name -ieq $name } | Select-Object -First 1
    if ($null -ne $prop) {
      return $prop.Value
    }
  }
  return $null
}

function Normalize-Text([object]$Value) {
  if ($null -eq $Value) { return '' }
  $text = [string]$Value
  if ([string]::IsNullOrWhiteSpace($text)) { return '' }
  return $text.Trim()
}

function Read-Bool([object]$Value, [bool]$Fallback = $false) {
  if ($null -eq $Value) { return $Fallback }
  if ($Value -is [bool]) { return [bool]$Value }
  $text = ([string]$Value).Trim().ToLowerInvariant()
  if ($text -in @('1', 'true', 'yes')) { return $true }
  if ($text -in @('0', 'false', 'no')) { return $false }
  return $Fallback
}

function To-Slug([string]$Value) {
  $normalized = $Value.ToLowerInvariant() -replace '[^a-z0-9]+', '-'
  $normalized = $normalized.Trim('-')
  if ([string]::IsNullOrWhiteSpace($normalized)) {
    return 'action'
  }
  return $normalized
}

function Resolve-IsExternal([string]$Href) {
  if ([string]::IsNullOrWhiteSpace($Href)) { return $false }
  if ($Href -match '^https?://') {
    return -not ($Href -match '^https?://([a-z0-9.-]+\.)?sharepoint\.com(/|$)')
  }
  return $false
}

function Resolve-DefaultPageName() {
  $web = Get-PnPWeb -Includes RootFolder
  $ctx = Get-PnPContext
  $ctx.Load($web.RootFolder)
  $ctx.ExecuteQuery()
  $welcome = [string]$web.RootFolder.WelcomePage
  if (-not [string]::IsNullOrWhiteSpace($welcome)) {
    $segments = $welcome -split '/'
    $candidate = $segments[-1]
    if (-not [string]::IsNullOrWhiteSpace($candidate)) {
      return $candidate
    }
  }
  return 'Home.aspx'
}

function Ensure-ListSettings([string]$ListTitle) {
  try {
    Set-PnPList -Identity $ListTitle -EnableVersioning:$true -EnableAttachments:$false -EnableFolderCreation:$false -EnableContentTypes:$false | Out-Null
  } catch {
    Set-PnPList -Identity $ListTitle -Values @{ EnableVersioning = $true; EnableAttachments = $false; EnableFolderCreation = $false; ContentTypesEnabled = $false } | Out-Null
  }
}

function Ensure-Field([string]$ListTitle, [hashtable]$FieldDef, [System.Collections.Generic.List[string]]$DriftWarnings) {
  $field = Get-PnPField -List $ListTitle -Identity $FieldDef.InternalName -ErrorAction SilentlyContinue
  if ($null -eq $field) {
    $addParams = @{
      List = $ListTitle
      DisplayName = $FieldDef.DisplayName
      InternalName = $FieldDef.InternalName
      AddToDefaultView = $false
    }

    switch ($FieldDef.Type) {
      'Text' { $addParams.Type = 'Text' }
      'Boolean' { $addParams.Type = 'Boolean' }
      'Choice' { $addParams.Type = 'Choice'; $addParams.Choices = $FieldDef.Choices }
      'Number' { $addParams.Type = 'Number' }
      'Note' { $addParams.Type = 'Note' }
      'DateTime' { $addParams.Type = 'DateTime' }
      default { throw "Unsupported field type: $($FieldDef.Type)" }
    }

    Add-PnPField @addParams | Out-Null
    $field = Get-PnPField -List $ListTitle -Identity $FieldDef.InternalName
  }

  $values = @{}
  if ($FieldDef.ContainsKey('Required')) { $values.Required = [bool]$FieldDef.Required }
  if ($FieldDef.ContainsKey('Indexed')) { $values.Indexed = [bool]$FieldDef.Indexed }
  if ($FieldDef.ContainsKey('Default')) { $values.DefaultValue = [string]$FieldDef.Default }
  if ($FieldDef.Type -eq 'Choice' -and $FieldDef.ContainsKey('Choices')) {
    $values.Choices = $FieldDef.Choices
  }

  if ($values.Keys.Count -gt 0) {
    Set-PnPField -List $ListTitle -Identity $FieldDef.InternalName -Values $values | Out-Null
  }

  $refreshed = Get-PnPField -List $ListTitle -Identity $FieldDef.InternalName
  if ($FieldDef.ContainsKey('Indexed') -and [bool]$refreshed.Indexed -ne [bool]$FieldDef.Indexed) {
    $DriftWarnings.Add("$ListTitle.$($FieldDef.InternalName): Indexed drift (expected $($FieldDef.Indexed), actual $($refreshed.Indexed)).")
  }
  if ($FieldDef.ContainsKey('Required') -and [bool]$refreshed.Required -ne [bool]$FieldDef.Required) {
    $DriftWarnings.Add("$ListTitle.$($FieldDef.InternalName): Required drift (expected $($FieldDef.Required), actual $($refreshed.Required)).")
  }
}

function Ensure-CommandBandLists() {
  $driftWarnings = [System.Collections.Generic.List[string]]::new()
  $listSummary = @()

  foreach ($listTarget in @(
      @{ Title = $CONFIG_LIST_TITLE; FieldDefs = $CONFIG_FIELD_DEFS; TitleDisplay = 'Config Name' },
      @{ Title = $ITEMS_LIST_TITLE; FieldDefs = $ITEMS_FIELD_DEFS; TitleDisplay = 'Action Title' }
    )) {
    $existing = Get-PnPList -Identity $listTarget.Title -ErrorAction SilentlyContinue
    $created = $false
    if ($null -eq $existing) {
      New-PnPList -Title $listTarget.Title -Template GenericList -OnQuickLaunch:$false | Out-Null
      $created = $true
    }

    Ensure-ListSettings -ListTitle $listTarget.Title

    foreach ($fieldDef in $listTarget.FieldDefs) {
      Ensure-Field -ListTitle $listTarget.Title -FieldDef $fieldDef -DriftWarnings $driftWarnings
    }

    Set-PnPField -List $listTarget.Title -Identity 'Title' -Values @{ Title = $listTarget.TitleDisplay; Required = $true } | Out-Null

    $list = Get-PnPList -Identity $listTarget.Title -Includes ItemCount,EnableVersioning,EnableAttachments,EnableFolderCreation,ContentTypesEnabled
    $listSummary += [ordered]@{
      title = $listTarget.Title
      created = $created
      itemCount = $list.ItemCount
      enableVersioning = $list.EnableVersioning
      enableAttachments = $list.EnableAttachments
      enableFolderCreation = $list.EnableFolderCreation
      contentTypesEnabled = $list.ContentTypesEnabled
      fieldCount = @($listTarget.FieldDefs).Count + 1
    }
  }

  return [ordered]@{
    lists = $listSummary
    driftWarnings = @($driftWarnings)
  }
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

function Read-JsonSafe([string]$Text) {
  if ([string]::IsNullOrWhiteSpace($Text)) { return $null }
  try {
    return $Text | ConvertFrom-Json -Depth 100
  } catch {
    return $null
  }
}

function Decode-HtmlText([string]$Text) {
  if ([string]::IsNullOrWhiteSpace($Text)) { return '' }
  $decoded = [string]$Text
  for ($idx = 0; $idx -lt 3; $idx += 1) {
    $next = [System.Net.WebUtility]::HtmlDecode($decoded)
    if ($next -eq $decoded) { break }
    $decoded = $next
  }
  return $decoded
}

function Parse-QuickLinksWebPartDataFromCanvas([string]$CanvasContent) {
  $results = [System.Collections.Generic.List[object]]::new()
  if ([string]::IsNullOrWhiteSpace($CanvasContent)) { return @($results) }

  $attributePatterns = @(
    'data-sp-webpartdata="([^"]+)"',
    "data-sp-webpartdata='([^']+)'"
  )

  foreach ($pattern in $attributePatterns) {
    $matches = [System.Text.RegularExpressions.Regex]::Matches(
      $CanvasContent,
      $pattern,
      [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    foreach ($match in $matches) {
      $encoded = [string]$match.Groups[1].Value
      $decoded = Decode-HtmlText $encoded
      $parsed = Read-JsonSafe $decoded
      if ($null -eq $parsed) { continue }
      $id = Normalize-Text (Get-PropertyValue -Object $parsed -Names @('id'))
      if ($id -eq $QUICK_LINKS_WEBPART_ID) {
        $results.Add($parsed)
      }
    }
  }

  return @($results)
}

function Parse-QuickLinksWebPartDataFromJsonText([string]$JsonText) {
  $results = [System.Collections.Generic.List[object]]::new()
  if ([string]::IsNullOrWhiteSpace($JsonText)) { return @($results) }

  $decoded = Decode-HtmlText $JsonText
  $parsed = Read-JsonSafe $decoded
  if ($null -eq $parsed) { return @($results) }

  $queue = [System.Collections.Generic.List[object]]::new()
  $queue.Add($parsed)
  while ($queue.Count -gt 0) {
    $node = $queue[0]
    $queue.RemoveAt(0)
    if ($null -eq $node) { continue }

    if ($node -is [System.Collections.IDictionary] -or $node -is [pscustomobject]) {
      $webPartData = Get-PropertyValue -Object $node -Names @('webPartData', 'WebPartData')
      if ($null -ne $webPartData) {
        $id = Normalize-Text (Get-PropertyValue -Object $webPartData -Names @('id', 'Id'))
        if ($id -eq $QUICK_LINKS_WEBPART_ID) {
          $results.Add($webPartData)
        }
      }

      $idNode = Normalize-Text (Get-PropertyValue -Object $node -Names @('id', 'Id'))
      if ($idNode -eq $QUICK_LINKS_WEBPART_ID) {
        $results.Add($node)
      }

      foreach ($prop in $node.PSObject.Properties) {
        if ($null -eq $prop.Value) { continue }
        if ($prop.Value -is [string]) { continue }
        $queue.Add($prop.Value)
      }
      continue
    }

    if ($node -is [System.Collections.IEnumerable] -and -not ($node -is [string])) {
      foreach ($entry in $node) {
        if ($null -ne $entry) {
          $queue.Add($entry)
        }
      }
    }
  }

  return @($results)
}

function Get-NodeEntries([object]$Node) {
  $entries = [System.Collections.Generic.List[object]]::new()
  if ($null -eq $Node) { return @($entries) }

  if ($Node -is [System.Collections.IDictionary]) {
    foreach ($key in $Node.Keys) {
      $entries.Add([ordered]@{
          name = [string]$key
          value = $Node[$key]
        })
    }
    return @($entries)
  }

  foreach ($prop in $Node.PSObject.Properties) {
    $entries.Add([ordered]@{
        name = [string]$prop.Name
        value = $prop.Value
      })
  }
  return @($entries)
}

function Get-SitePagePayload([string]$PageName) {
  if ([string]::IsNullOrWhiteSpace($PageName)) { return $null }
  $relativePath = "SitePages/$PageName"
  $escaped = $relativePath.Replace("'", "''")
  $endpoint = "/_api/sitepages/pages/GetByUrl('$escaped')"
  try {
    $response = Invoke-PnPSPRestMethod -Method Get -Url $endpoint
    if ($null -eq $response) { return $null }
    if ($response -is [string]) {
      return (Read-JsonSafe $response)
    }
    return $response
  } catch {
    return $null
  }
}

function Extract-QuickLinksFromWebPartData([object]$WebPartData, [string]$SourceLabel, [System.Collections.Generic.List[object]]$Target, [hashtable]$Seen) {
  if ($null -eq $WebPartData) { return }

  $serverProcessedContent = Get-PropertyValue -Object $WebPartData -Names @('serverProcessedContent')
  $searchablePlainTexts = Get-PropertyValue -Object $serverProcessedContent -Names @('searchablePlainTexts')
  $linksNode = Get-PropertyValue -Object $serverProcessedContent -Names @('links')
  $propsNode = Get-PropertyValue -Object $WebPartData -Names @('properties')

  $titleByIndex = @{}
  if ($null -ne $searchablePlainTexts) {
    foreach ($entry in (Get-NodeEntries -Node $searchablePlainTexts)) {
      $name = [string]$entry.name
      if ($name -match '^items\[(\d+)\]\.title$') {
        $idx = [int]$Matches[1]
        $titleByIndex[$idx] = Normalize-Text $entry.value
      }
    }
  }

  if ($null -ne $linksNode) {
    foreach ($entry in (Get-NodeEntries -Node $linksNode)) {
      $name = [string]$entry.name
      if ($name -match '^items\[(\d+)\]\.sourceItem\.url$') {
        $idx = [int]$Matches[1]
        $title = if ($titleByIndex.ContainsKey($idx)) { $titleByIndex[$idx] } else { '' }
        Add-LinkCandidate -Candidate ([ordered]@{
            title = $title
            url = (Normalize-Text $entry.value)
            openInNewTab = $false
          }) -SourceLabel "$SourceLabel:serverProcessedContent.links" -DefaultOrder ($idx + 1) -Target $Target -Seen $Seen
      }
    }
  }

  if ($null -ne $propsNode) {
    $items = Get-PropertyValue -Object $propsNode -Names @('items')
    if ($null -ne $items) {
      $idx = 0
      foreach ($entry in @($items)) {
        Add-LinkCandidate -Candidate $entry -SourceLabel "$SourceLabel:properties.items" -DefaultOrder ($idx + 1) -Target $Target -Seen $Seen
        $idx += 1
      }
    }
  }
}

function Add-LinkCandidate([object]$Candidate, [string]$SourceLabel, [int]$DefaultOrder, [System.Collections.Generic.List[object]]$Target, [hashtable]$Seen) {
  if ($null -eq $Candidate) { return }

  $url = Normalize-Text (Get-PropertyValue -Object $Candidate -Names @('url', 'Url', 'href', 'Href', 'linkUrl', 'destinationUrl'))
  $title = Normalize-Text (Get-PropertyValue -Object $Candidate -Names @('title', 'Title', 'text', 'Text', 'label', 'Label', 'caption', 'Caption'))
  $openInNewTab = Read-Bool (Get-PropertyValue -Object $Candidate -Names @('openInNewTab', 'OpenInNewTab', 'targetBlank')) $false

  if ([string]::IsNullOrWhiteSpace($url)) { return }
  if ([string]::IsNullOrWhiteSpace($title)) {
    $title = ($url -split '/|\?')[-1]
    if ([string]::IsNullOrWhiteSpace($title)) { $title = $url }
  }

  $key = ('{0}|{1}' -f $title.ToLowerInvariant(), $url.ToLowerInvariant())
  if ($Seen.ContainsKey($key)) { return }
  $Seen[$key] = $true

  $Target.Add([ordered]@{
    title = $title
    url = $url
    sourceOrder = $DefaultOrder
    source = $SourceLabel
    openInNewTab = $openInNewTab
    isExternal = Resolve-IsExternal $url
  })
}

function Collect-LinksRecursive([object]$Node, [string]$SourceLabel, [System.Collections.Generic.List[object]]$Target, [hashtable]$Seen) {
  if ($null -eq $Node) { return }

  if ($Node -is [System.Collections.IDictionary] -or $Node -is [pscustomobject]) {
    Add-LinkCandidate -Candidate $Node -SourceLabel $SourceLabel -DefaultOrder $script:QuickLinkOrderCounter -Target $Target -Seen $Seen
    $script:QuickLinkOrderCounter = [int]$script:QuickLinkOrderCounter + 1

    foreach ($prop in $Node.PSObject.Properties) {
      Collect-LinksRecursive -Node $prop.Value -SourceLabel $SourceLabel -Target $Target -Seen $Seen
    }
    return
  }

  if ($Node -is [System.Collections.IEnumerable] -and -not ($Node -is [string])) {
    foreach ($entry in $Node) {
      Collect-LinksRecursive -Node $entry -SourceLabel $SourceLabel -Target $Target -Seen $Seen
    }
  }
}

function Extract-QuickLinksFromPage([string]$PageName) {
  $results = [System.Collections.Generic.List[object]]::new()
  $seen = @{}
  $warnings = [System.Collections.Generic.List[string]]::new()
  $script:QuickLinkOrderCounter = 1

  $page = Get-PnPPage -Identity $PageName -ErrorAction SilentlyContinue
  if ($null -ne $page -and $null -ne $page.Controls) {
    foreach ($control in $page.Controls) {
      $webPartId = Normalize-Text (Get-PropertyValue -Object $control -Names @('WebPartId', 'webPartId'))
      $webPartData = Get-PropertyValue -Object $control -Names @('WebPartData', 'webPartData')
      $jsonPayload = Normalize-Text (Get-PropertyValue -Object $control -Names @('PropertiesJson', 'JsonControlData'))
      if ($null -eq $webPartData -and -not [string]::IsNullOrWhiteSpace($jsonPayload)) {
        $parsedPayload = Read-JsonSafe $jsonPayload
        if ($null -ne $parsedPayload) {
          $webPartData = Get-PropertyValue -Object $parsedPayload -Names @('webPartData', 'WebPartData')
          if ([string]::IsNullOrWhiteSpace($webPartId)) {
            $webPartId = Normalize-Text (Get-PropertyValue -Object $parsedPayload -Names @('webPartId', 'WebPartId'))
          }
        }
      }
      if ([string]::IsNullOrWhiteSpace($webPartId) -and $null -ne $webPartData) {
        $webPartId = Normalize-Text (Get-PropertyValue -Object $webPartData -Names @('id', 'Id'))
      }
      if ($webPartId -eq $QUICK_LINKS_WEBPART_ID -or $jsonPayload -match $QUICK_LINKS_WEBPART_ID) {
        if ($null -ne $webPartData) {
          Extract-QuickLinksFromWebPartData -WebPartData $webPartData -SourceLabel "Get-PnPPage:$PageName" -Target $results -Seen $seen
        }
        $parsed = Read-JsonSafe $jsonPayload
        if ($null -ne $parsed) {
          Collect-LinksRecursive -Node $parsed -SourceLabel "Get-PnPPage:$PageName" -Target $results -Seen $seen
        }
      }
    }
  }

  $items = Get-PnPListItem -List 'Site Pages' -Fields FileLeafRef,CanvasContent1,LayoutWebpartsContent,Title -PageSize 200
  $targetPage = $items | Where-Object { $_['FileLeafRef'] -eq $PageName } | Select-Object -First 1
  if ($null -eq $targetPage -and $PageName -ne 'Home.aspx') {
    $targetPage = $items | Where-Object { $_['FileLeafRef'] -eq 'Home.aspx' } | Select-Object -First 1
  }

  if ($null -eq $targetPage) {
    $warnings.Add("Could not locate Site Pages item for page $PageName.")
  } else {
    $canvas = [string]$targetPage['CanvasContent1']
    $layoutWebpartsContent = [string]$targetPage['LayoutWebpartsContent']

    $canvasJsonQuickWebparts = @(Parse-QuickLinksWebPartDataFromJsonText -JsonText $canvas)
    if (@($canvasJsonQuickWebparts).Count -gt 0) {
      foreach ($wp in $canvasJsonQuickWebparts) {
        Extract-QuickLinksFromWebPartData -WebPartData $wp -SourceLabel "CanvasContent1Json:$PageName" -Target $results -Seen $seen
      }
    }

    $jsonQuickWebparts = @(Parse-QuickLinksWebPartDataFromJsonText -JsonText $layoutWebpartsContent)
    if (@($jsonQuickWebparts).Count -gt 0) {
      foreach ($wp in $jsonQuickWebparts) {
        Extract-QuickLinksFromWebPartData -WebPartData $wp -SourceLabel "LayoutWebpartsContent:$PageName" -Target $results -Seen $seen
      }
    }

    $quickWebparts = @(Parse-QuickLinksWebPartDataFromCanvas -CanvasContent $canvas)
    if (@($quickWebparts).Count -eq 0) {
      $warnings.Add('Quick Links webpart id was not found in CanvasContent1 webpartdata attributes; extraction used generic link parsing fallback.')
    } else {
      foreach ($wp in $quickWebparts) {
        Extract-QuickLinksFromWebPartData -WebPartData $wp -SourceLabel "CanvasWebPartData:$PageName" -Target $results -Seen $seen
      }
    }

    if (@($results).Count -eq 0) {
      $pagePayload = Get-SitePagePayload -PageName $PageName
      if ($null -ne $pagePayload) {
        $apiCanvas = Normalize-Text (Get-PropertyValue -Object $pagePayload -Names @('CanvasContent1', 'canvasContent1', 'canvasContentJson'))
        $apiLayout = Normalize-Text (Get-PropertyValue -Object $pagePayload -Names @('LayoutWebpartsContent', 'layoutWebpartsContent'))
        $apiQuickWebparts = @()
        if (-not [string]::IsNullOrWhiteSpace($apiCanvas)) {
          $apiQuickWebparts += @(Parse-QuickLinksWebPartDataFromJsonText -JsonText $apiCanvas)
          $apiQuickWebparts += @(Parse-QuickLinksWebPartDataFromCanvas -CanvasContent $apiCanvas)
        }
        if (-not [string]::IsNullOrWhiteSpace($apiLayout)) {
          $apiQuickWebparts += @(Parse-QuickLinksWebPartDataFromJsonText -JsonText $apiLayout)
          $apiQuickWebparts += @(Parse-QuickLinksWebPartDataFromCanvas -CanvasContent $apiLayout)
        }
        foreach ($wp in @($apiQuickWebparts)) {
          Extract-QuickLinksFromWebPartData -WebPartData $wp -SourceLabel "SitePagesApi:$PageName" -Target $results -Seen $seen
        }
      }
    }

    if (@($results).Count -eq 0) {
      $jsonFragments = [System.Text.RegularExpressions.Regex]::Matches($canvas, '\{[^\{\}]*"(url|href|Url|Href)"[^\{\}]*\}')
      foreach ($fragment in $jsonFragments) {
        $candidate = Read-JsonSafe $fragment.Value
        if ($null -ne $candidate) {
          Add-LinkCandidate -Candidate $candidate -SourceLabel "CanvasContent1:$PageName" -DefaultOrder $script:QuickLinkOrderCounter -Target $results -Seen $seen
          $script:QuickLinkOrderCounter += 1
        }
      }

      $urlMatches = [System.Text.RegularExpressions.Regex]::Matches($canvas, '(https?:\\/\\/[^\"\s,}]+|\/sites\/[^\"\s,}]+)')
      foreach ($match in $urlMatches) {
        $rawUrl = [string]$match.Value
        $url = $rawUrl -replace '\\/', '/'
        if (-not [string]::IsNullOrWhiteSpace($url)) {
          Add-LinkCandidate -Candidate ([ordered]@{ title = $url; url = $url }) -SourceLabel "CanvasUrlFallback:$PageName" -DefaultOrder $script:QuickLinkOrderCounter -Target $results -Seen $seen
          $script:QuickLinkOrderCounter += 1
        }
      }
    }
  }

  $ordered = @($results | Sort-Object sourceOrder, title)
  $normalized = @()
  $index = 0
  foreach ($entry in $ordered) {
    $index += 1
    $normalized += [ordered]@{
      title = $entry.title
      url = $entry.url
      sourceOrder = $entry.sourceOrder
      normalizedOrder = $index
      source = $entry.source
      openInNewTab = [bool]$entry.openInNewTab
      isExternal = [bool]$entry.isExternal
    }
  }

  return [ordered]@{
    pageName = $PageName
    count = @($normalized).Count
    items = $normalized
    warnings = @($warnings)
  }
}

function Get-HomepageCanvasComposition([string]$PageName) {
  # Returns ordered page controls with identity + derived action-layer state.
  # This is the authoritative inspector backing the homepage cutover proof.
  $result = [ordered]@{
    pageName = $PageName
    controls = @()
    hasHero = $false
    hasPriorityActionsRail = $false
    hasQuickLinks = $false
    hasHbHomepage = $false
    heroOrder = $null
    priorityActionsRailOrder = $null
    hbHomepageOrder = $null
    quickLinksOrders = @()
    actionLayerState = 'unknown'
    orderValid = $false
    errors = @()
  }

  $page = Get-PnPPage -Identity $PageName -ErrorAction SilentlyContinue
  if ($null -eq $page) {
    $result.errors += "page-not-found: $PageName"
    $result.actionLayerState = 'page-missing'
    return $result
  }

  $controls = @($page.Controls)
  $ordered = @($controls | Sort-Object -Property @{ Expression = { [int]$_.Order } })

  $controlSummaries = @()
  $index = 0
  foreach ($control in $ordered) {
    $index += 1
    $wpId = $null
    try { $wpId = [string]$control.WebPartId } catch { $wpId = $null }
    $wpIdLower = if ($wpId) { $wpId.Trim().ToLower() } else { '' }
    $instanceId = $null
    try { $instanceId = [string]$control.InstanceId } catch { $instanceId = $null }
    $title = $null
    try { $title = [string]$control.Title } catch { $title = $null }
    $order = $null
    try { $order = [int]$control.Order } catch { $order = $null }
    $sectionOrder = $null
    try { if ($null -ne $control.Section) { $sectionOrder = [int]$control.Section.Order } } catch { $sectionOrder = $null }
    $columnOrder = $null
    try { if ($null -ne $control.Column) { $columnOrder = [int]$control.Column.Order } } catch { $columnOrder = $null }

    $controlSummaries += [ordered]@{
      positionIndex = $index
      webPartId = $wpIdLower
      instanceId = $instanceId
      title = $title
      order = $order
      sectionOrder = $sectionOrder
      columnOrder = $columnOrder
    }

    switch ($wpIdLower) {
      $QUICK_LINKS_WEBPART_ID {
        $result.hasQuickLinks = $true
        $result.quickLinksOrders += $index
      }
      $PRIORITY_ACTIONS_RAIL_WEBPART_ID {
        $result.hasPriorityActionsRail = $true
        if ($null -eq $result.priorityActionsRailOrder) { $result.priorityActionsRailOrder = $index }
      }
      $HB_SIGNATURE_HERO_WEBPART_ID {
        $result.hasHero = $true
        if ($null -eq $result.heroOrder) { $result.heroOrder = $index }
      }
      $HB_HOMEPAGE_WEBPART_ID {
        $result.hasHbHomepage = $true
        if ($null -eq $result.hbHomepageOrder) { $result.hbHomepageOrder = $index }
      }
    }
  }

  $result.controls = $controlSummaries

  $orderValid = $false
  if ($result.hasHero -and $result.hasPriorityActionsRail -and $result.hasHbHomepage) {
    if (($result.heroOrder -lt $result.priorityActionsRailOrder) -and `
        ($result.priorityActionsRailOrder -lt $result.hbHomepageOrder)) {
      $orderValid = $true
    }
  }
  $result.orderValid = $orderValid

  if ($result.hasQuickLinks) {
    $result.actionLayerState = 'requires-cutover'
  } elseif ($result.hasPriorityActionsRail -and $orderValid) {
    $result.actionLayerState = 'already-cutover'
  } elseif ($result.hasPriorityActionsRail -and -not $orderValid) {
    $result.actionLayerState = 'present-wrong-order'
  } else {
    $result.actionLayerState = 'ambiguous'
  }

  # Phase-07 wrapper-embedded target: HbHomepage owns the action layer
  # via an embedded React surface, so the flagship page should contain
  # only the hero + HbHomepage (no OOB Quick Links, no standalone
  # PriorityActionsRail webpart). Derived state is independent of the
  # Phase-06 actionLayerState so tenants in an intermediate state
  # (rail webpart still authored) remain diagnosable.
  $wrapperOrderValid = $false
  if ($result.hasHero -and $result.hasHbHomepage) {
    if ($result.heroOrder -lt $result.hbHomepageOrder) {
      $wrapperOrderValid = $true
    }
  }
  $result.wrapperOrderValid = $wrapperOrderValid

  if ($result.hasQuickLinks) {
    $result.wrapperEmbeddedState = 'requires-cutover-quick-links'
  } elseif ($result.hasPriorityActionsRail) {
    $result.wrapperEmbeddedState = 'requires-cutover-standalone-rail'
  } elseif ($result.hasHero -and $result.hasHbHomepage -and $wrapperOrderValid) {
    $result.wrapperEmbeddedState = 'wrapper-embedded-target'
  } elseif ($result.hasHero -and $result.hasHbHomepage) {
    $result.wrapperEmbeddedState = 'wrapper-present-wrong-order'
  } else {
    $result.wrapperEmbeddedState = 'ambiguous'
  }

  return $result
}

function Invoke-HomepageWrapperEmbeddedProof([string]$PageName, [bool]$Strict) {
  $composition = Get-HomepageCanvasComposition -PageName $PageName
  $issues = @()
  if ($composition.hasQuickLinks) {
    $issues += 'OOB Quick Links webpart is still present on the homepage canvas (expected removed in wrapper-embedded target).'
  }
  if ($composition.hasPriorityActionsRail) {
    $issues += 'Standalone PriorityActionsRail webpart is still present on the homepage canvas (expected absent — rail is embedded inside HbHomepage in the wrapper-embedded target).'
  }
  if (-not $composition.hasHero) {
    $issues += 'HB Signature Hero webpart is absent from the homepage canvas.'
  }
  if (-not $composition.hasHbHomepage) {
    $issues += 'hbHomepage webpart is absent from the homepage canvas.'
  }
  if ($composition.hasHero -and $composition.hasHbHomepage -and -not $composition.wrapperOrderValid) {
    $issues += 'Homepage order is not hero -> hbHomepage.'
  }
  $passed = (@($issues).Count -eq 0) -and ($composition.wrapperEmbeddedState -eq 'wrapper-embedded-target')

  $report = [ordered]@{
    pageName = $composition.pageName
    wrapperEmbeddedState = $composition.wrapperEmbeddedState
    wrapperOrderValid = $composition.wrapperOrderValid
    passed = $passed
    issues = $issues
    composition = $composition
  }

  if ($Strict -and -not $passed) {
    Write-Error ("Homepage wrapper-embedded proof failed: " + [string]::Join('; ', $issues))
  }

  return $report
}

function Invoke-HomepageActionLayerProof([string]$PageName, [bool]$Strict) {
  $composition = Get-HomepageCanvasComposition -PageName $PageName
  $issues = @()
  if ($composition.hasQuickLinks) {
    $issues += 'OOB Quick Links webpart is still present on the homepage canvas.'
  }
  if (-not $composition.hasPriorityActionsRail) {
    $issues += 'PriorityActionsRail webpart is absent from the homepage canvas.'
  }
  if (-not $composition.hasHero) {
    $issues += 'HB Signature Hero webpart is absent from the homepage canvas.'
  }
  if (-not $composition.hasHbHomepage) {
    $issues += 'hbHomepage webpart is absent from the homepage canvas.'
  }
  if ($composition.hasHero -and $composition.hasPriorityActionsRail -and $composition.hasHbHomepage -and -not $composition.orderValid) {
    $issues += 'Homepage order is not hero -> PriorityActionsRail -> hbHomepage.'
  }
  $passed = (@($issues).Count -eq 0) -and ($composition.actionLayerState -eq 'already-cutover')

  $report = [ordered]@{
    pageName = $composition.pageName
    actionLayerState = $composition.actionLayerState
    orderValid = $composition.orderValid
    passed = $passed
    issues = $issues
    composition = $composition
  }

  if ($Strict -and -not $passed) {
    Write-Error ("Homepage action-layer proof failed: " + [string]::Join('; ', $issues))
  }

  return $report
}

function Ensure-ConfigRow() {
  $items = Get-PnPListItem -List $CONFIG_LIST_TITLE -PageSize 500
  $matching = @($items | Where-Object { ([string]$_.FieldValues.BandKey) -eq 'homepage-primary' })

  $selected = $null
  if (@($matching).Count -gt 0) {
    $selected = $matching | Sort-Object -Property @{ Expression = { $_.FieldValues.Modified }; Descending = $true }, @{ Expression = { $_.Id }; Descending = $true } | Select-Object -First 1
    Set-PnPListItem -List $CONFIG_LIST_TITLE -Identity $selected.Id -Values $CONFIG_DEFAULT_ROW | Out-Null
  } else {
    $created = Add-PnPListItem -List $CONFIG_LIST_TITLE -Values $CONFIG_DEFAULT_ROW
    $selected = Get-PnPListItem -List $CONFIG_LIST_TITLE -Id $created.Id
  }

  foreach ($row in $matching) {
    if ($row.Id -ne $selected.Id) {
      Set-PnPListItem -List $CONFIG_LIST_TITLE -Identity $row.Id -Values @{ IsActive = $false; Enabled = $false } | Out-Null
    }
  }

  return [ordered]@{
    selectedId = $selected.Id
    matchingCount = @($matching).Count
    bandKey = 'homepage-primary'
  }
}

function Build-ActionKey([string]$Title, [string]$Href) {
  $base = "$(To-Slug $Title)-$(To-Slug $Href)"
  if ($base.Length -gt 80) {
    return $base.Substring(0, 80)
  }
  return $base
}

function Resolve-CuratedSeedPath() {
  return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot $CURATED_SEED_RELATIVE_PATH))
}

function Read-CuratedSeedDefinition() {
  $seedPath = Resolve-CuratedSeedPath
  if (-not (Test-Path -LiteralPath $seedPath)) {
    throw "Curated seed file was not found: $seedPath"
  }

  $seedRaw = Get-Content -Raw -Path $seedPath
  $seed = $seedRaw | ConvertFrom-Json -Depth 100
  if ($null -eq $seed) {
    throw "Curated seed file could not be parsed as JSON: $seedPath"
  }

  $configs = @($seed.configs)
  $items = @($seed.items)
  if (@($configs).Count -eq 0) {
    throw "Curated seed file must include a non-empty 'configs' array."
  }
  if (@($items).Count -eq 0) {
    throw "Curated seed file must include a non-empty 'items' array."
  }

  $configKeys = @{}
  $itemKeys = @{}
  $validationFailures = [System.Collections.Generic.List[string]]::new()

  foreach ($config in $configs) {
    $title = Normalize-Text (Get-PropertyValue $config @('title', 'Title'))
    $bandKey = Normalize-Text (Get-PropertyValue $config @('bandKey', 'BandKey'))
    if ([string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($bandKey)) {
      $validationFailures.Add("Config rows require non-empty title and bandKey. Offending row: $(($config | ConvertTo-Json -Compress -Depth 10))")
      continue
    }
    $k = "$($bandKey.ToLowerInvariant())|$($title.ToLowerInvariant())"
    if ($configKeys.ContainsKey($k)) {
      $validationFailures.Add("Duplicate config row key detected: BandKey+Title '$bandKey + $title'.")
    } else {
      $configKeys[$k] = $true
    }
  }

  foreach ($item in $items) {
    $actionKey = Normalize-Text (Get-PropertyValue $item @('actionKey', 'ActionKey'))
    $title = Normalize-Text (Get-PropertyValue $item @('title', 'Title'))
    $href = Normalize-Text (Get-PropertyValue $item @('href', 'Href'))
    $groupKey = Normalize-Text (Get-PropertyValue $item @('groupKey', 'GroupKey'))
    $groupTitle = Normalize-Text (Get-PropertyValue $item @('groupTitle', 'GroupTitle'))

    if ([string]::IsNullOrWhiteSpace($actionKey) -or [string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($href)) {
      $validationFailures.Add("Item rows require non-empty actionKey, title, and href. Offending row: $(($item | ConvertTo-Json -Compress -Depth 10))")
      continue
    }

    $itemKeyLower = $actionKey.ToLowerInvariant()
    if ($itemKeys.ContainsKey($itemKeyLower)) {
      $validationFailures.Add("Duplicate item actionKey detected: '$actionKey'.")
    } else {
      $itemKeys[$itemKeyLower] = $true
    }

    $hasGroupKey = -not [string]::IsNullOrWhiteSpace($groupKey)
    $hasGroupTitle = -not [string]::IsNullOrWhiteSpace($groupTitle)
    if ($hasGroupKey -ne $hasGroupTitle) {
      $validationFailures.Add("Item '$actionKey' has inconsistent group metadata. groupKey and groupTitle must both be set or both blank.")
    }
  }

  if (@($validationFailures).Count -gt 0) {
    throw ("Curated seed validation failed: " + [string]::Join('; ', @($validationFailures)))
  }

  return [ordered]@{
    seedPath = $seedPath
    configs = $configs
    items = $items
    managedActionKeys = @($itemKeys.Keys | Sort-Object)
  }
}

function Seed-CuratedConfigRows([object[]]$ConfigRows) {
  $existingRows = Get-PnPListItem -List $CONFIG_LIST_TITLE -PageSize 2000
  $existingByKey = @{}
  foreach ($row in $existingRows) {
    $bandKey = Normalize-Text $row.FieldValues.BandKey
    $title = Normalize-Text $row.FieldValues.Title
    if ([string]::IsNullOrWhiteSpace($bandKey) -or [string]::IsNullOrWhiteSpace($title)) { continue }
    $k = "$($bandKey.ToLowerInvariant())|$($title.ToLowerInvariant())"
    if (-not $existingByKey.ContainsKey($k)) {
      $existingByKey[$k] = $row
    }
  }

  $managedConfigKeys = @{}
  $inserted = 0
  $updated = 0
  $writtenRows = @()
  $validationFailures = [System.Collections.Generic.List[string]]::new()

  foreach ($cfg in $ConfigRows) {
    $title = Normalize-Text (Get-PropertyValue $cfg @('title', 'Title'))
    $bandKey = Normalize-Text (Get-PropertyValue $cfg @('bandKey', 'BandKey'))
    if ([string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($bandKey)) {
      $validationFailures.Add('Config rows must include title and bandKey.')
      continue
    }

    $enabled = Read-Bool (Get-PropertyValue $cfg @('enabled', 'Enabled')) $false
    $isActive = Read-Bool (Get-PropertyValue $cfg @('isActive', 'IsActive')) $false
    if ($bandKey -eq 'homepage-primary') {
      if ($title -eq 'Homepage Priority Actions') {
        $enabled = $true
        $isActive = $true
      } else {
        $enabled = $false
        $isActive = $false
      }
    }

    $values = [ordered]@{
      Title = $title
      BandKey = $bandKey
      Enabled = $enabled
      IsActive = $isActive
      HeadingText = Normalize-Text (Get-PropertyValue $cfg @('headingText', 'HeadingText'))
      OverflowLabel = Normalize-Text (Get-PropertyValue $cfg @('overflowLabel', 'OverflowLabel'))
      ShowHeading = Read-Bool (Get-PropertyValue $cfg @('showHeading', 'ShowHeading')) $false
      StickyAfterHero = Read-Bool (Get-PropertyValue $cfg @('stickyAfterHero', 'StickyAfterHero')) $false
      ShowBadges = Read-Bool (Get-PropertyValue $cfg @('showBadges', 'ShowBadges')) $true
      DesktopLayoutMode = Normalize-Text (Get-PropertyValue $cfg @('desktopLayoutMode', 'DesktopLayoutMode'))
      TabletLayoutMode = Normalize-Text (Get-PropertyValue $cfg @('tabletLayoutMode', 'TabletLayoutMode'))
      MobileLayoutMode = Normalize-Text (Get-PropertyValue $cfg @('mobileLayoutMode', 'MobileLayoutMode'))
      MaxVisibleDesktop = [int](Get-PropertyValue $cfg @('maxVisibleDesktop', 'MaxVisibleDesktop'))
      MaxVisibleLaptop = [int](Get-PropertyValue $cfg @('maxVisibleLaptop', 'MaxVisibleLaptop'))
      MaxVisibleTabletLandscape = [int](Get-PropertyValue $cfg @('maxVisibleTabletLandscape', 'MaxVisibleTabletLandscape'))
      MaxVisibleTabletPortrait = [int](Get-PropertyValue $cfg @('maxVisibleTabletPortrait', 'MaxVisibleTabletPortrait'))
      MaxVisiblePhone = [int](Get-PropertyValue $cfg @('maxVisiblePhone', 'MaxVisiblePhone'))
      OpenExternalInNewTabByDefault = Read-Bool (Get-PropertyValue $cfg @('openExternalInNewTabByDefault', 'OpenExternalInNewTabByDefault')) $true
      AdminNotes = Normalize-Text (Get-PropertyValue $cfg @('adminNotes', 'AdminNotes'))
    }

    if ([string]::IsNullOrWhiteSpace($values.OverflowLabel)) {
      $values.OverflowLabel = 'More tools'
    }

    $k = "$($bandKey.ToLowerInvariant())|$($title.ToLowerInvariant())"
    $managedConfigKeys[$k] = $true

    if ($existingByKey.ContainsKey($k)) {
      Set-PnPListItem -List $CONFIG_LIST_TITLE -Identity $existingByKey[$k].Id -Values $values | Out-Null
      $updated += 1
      $writtenRows += [ordered]@{ id = $existingByKey[$k].Id; bandKey = $bandKey; title = $title; operation = 'updated'; enabled = $values.Enabled; isActive = $values.IsActive }
    } else {
      $created = Add-PnPListItem -List $CONFIG_LIST_TITLE -Values $values
      $inserted += 1
      $writtenRows += [ordered]@{ id = $created.Id; bandKey = $bandKey; title = $title; operation = 'inserted'; enabled = $values.Enabled; isActive = $values.IsActive }
    }
  }

  if (@($validationFailures).Count -gt 0) {
    throw ("Curated config seed validation failed: " + [string]::Join('; ', @($validationFailures)))
  }

  $refreshed = Get-PnPListItem -List $CONFIG_LIST_TITLE -PageSize 2000
  $conflicts = @()
  foreach ($row in $refreshed) {
    $rowBandKey = Normalize-Text $row.FieldValues.BandKey
    if ($rowBandKey -ne 'homepage-primary') { continue }
    $rowTitle = Normalize-Text $row.FieldValues.Title
    $rowEnabled = Read-Bool $row.FieldValues.Enabled $false
    $rowIsActive = Read-Bool $row.FieldValues.IsActive $false
    $rowKey = "$($rowBandKey.ToLowerInvariant())|$($rowTitle.ToLowerInvariant())"
    if ($rowEnabled -and $rowIsActive -and -not $managedConfigKeys.ContainsKey($rowKey)) {
      $conflicts += [ordered]@{
        id = $row.Id
        title = $rowTitle
        bandKey = $rowBandKey
        enabled = $rowEnabled
        isActive = $rowIsActive
      }
    }
  }

  return [ordered]@{
    inserted = $inserted
    updated = $updated
    configRowsWritten = $writtenRows
    managedConfigKeys = @($managedConfigKeys.Keys | Sort-Object)
    conflictingUnknownActiveRows = $conflicts
  }
}

function Seed-CuratedItemRows([object[]]$ItemRows, [string[]]$ManagedActionKeys) {
  $managedSet = @{}
  foreach ($managedKey in $ManagedActionKeys) {
    $k = Normalize-Text $managedKey
    if (-not [string]::IsNullOrWhiteSpace($k)) {
      $managedSet[$k.ToLowerInvariant()] = $true
    }
  }

  $existingItems = Get-PnPListItem -List $ITEMS_LIST_TITLE -PageSize 4000
  $existingByKey = @{}
  foreach ($row in $existingItems) {
    if ((Normalize-Text $row.FieldValues.BandKey) -ne 'homepage-primary') { continue }
    $key = Normalize-Text $row.FieldValues.ActionKey
    if (-not [string]::IsNullOrWhiteSpace($key)) {
      $lk = $key.ToLowerInvariant()
      if (-not $existingByKey.ContainsKey($lk)) {
        $existingByKey[$lk] = $row
      }
    }
  }

  $inserted = 0
  $updated = 0
  $archived = 0
  $processed = @{}
  $validationFailures = [System.Collections.Generic.List[string]]::new()
  $writtenRows = @()
  $archivedRows = @()

  foreach ($item in $ItemRows) {
    $actionKey = Normalize-Text (Get-PropertyValue $item @('actionKey', 'ActionKey'))
    $title = Normalize-Text (Get-PropertyValue $item @('title', 'Title'))
    $href = Normalize-Text (Get-PropertyValue $item @('href', 'Href'))
    if ([string]::IsNullOrWhiteSpace($actionKey) -or [string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($href)) {
      $validationFailures.Add("Curated item row requires actionKey/title/href. Row: $(($item | ConvertTo-Json -Compress -Depth 10))")
      continue
    }
    $groupKey = Normalize-Text (Get-PropertyValue $item @('groupKey', 'GroupKey'))
    $groupTitle = Normalize-Text (Get-PropertyValue $item @('groupTitle', 'GroupTitle'))
    if (([string]::IsNullOrWhiteSpace($groupKey) -and -not [string]::IsNullOrWhiteSpace($groupTitle)) -or
      (-not [string]::IsNullOrWhiteSpace($groupKey) -and [string]::IsNullOrWhiteSpace($groupTitle))) {
      $validationFailures.Add("Curated item '$actionKey' has inconsistent group metadata.")
      continue
    }

    $isExternal = Read-Bool (Get-PropertyValue $item @('isExternal', 'IsExternal')) (Resolve-IsExternal $href)
    $openInNewTab = Read-Bool (Get-PropertyValue $item @('openInNewTab', 'OpenInNewTab')) $isExternal
    $sortOrderValue = Get-PropertyValue $item @('sortOrder', 'SortOrder')
    $sortOrder = if ($null -eq $sortOrderValue) { 100 } else { [int]$sortOrderValue }

    $values = [ordered]@{
      Title = $title
      BandKey = 'homepage-primary'
      ActionKey = $actionKey
      ItemStatus = 'Enabled'
      ActionDescription = Normalize-Text (Get-PropertyValue $item @('actionDescription', 'ActionDescription'))
      Href = $href
      IconKey = $null
      BadgeLabel = $null
      BadgeVariant = 'neutral'
      Priority = 'primary'
      GroupKey = if ([string]::IsNullOrWhiteSpace($groupKey)) { $null } else { $groupKey }
      GroupTitle = if ([string]::IsNullOrWhiteSpace($groupTitle)) { $null } else { $groupTitle }
      SortOrder = $sortOrder
      OverflowOnly = $false
      MobilePriority = 100
      AudienceMode = 'all'
      AudienceKeys = $null
      IsExternal = $isExternal
      OpenInNewTab = $openInNewTab
      VisibleDesktop = $true
      VisibleLaptop = $true
      VisibleTabletLandscape = $true
      VisibleTabletPortrait = $true
      VisiblePhone = $true
      StartsAtUtc = $null
      EndsAtUtc = $null
      AdminNotes = $null
    }

    $lk = $actionKey.ToLowerInvariant()
    if ($existingByKey.ContainsKey($lk)) {
      Set-PnPListItem -List $ITEMS_LIST_TITLE -Identity $existingByKey[$lk].Id -Values $values | Out-Null
      $updated += 1
      $writtenRows += [ordered]@{ id = $existingByKey[$lk].Id; actionKey = $actionKey; title = $title; operation = 'updated'; sortOrder = $sortOrder; isExternal = $isExternal; openInNewTab = $openInNewTab }
    } else {
      $created = Add-PnPListItem -List $ITEMS_LIST_TITLE -Values $values
      $inserted += 1
      $writtenRows += [ordered]@{ id = $created.Id; actionKey = $actionKey; title = $title; operation = 'inserted'; sortOrder = $sortOrder; isExternal = $isExternal; openInNewTab = $openInNewTab }
    }
    $processed[$lk] = $true
  }

  if (@($validationFailures).Count -gt 0) {
    throw ("Curated item seed validation failed: " + [string]::Join('; ', @($validationFailures)))
  }

  foreach ($pair in $existingByKey.GetEnumerator()) {
    if ($managedSet.ContainsKey($pair.Key) -and -not $processed.ContainsKey($pair.Key)) {
      Set-PnPListItem -List $ITEMS_LIST_TITLE -Identity $pair.Value.Id -Values @{ ItemStatus = 'Archived' } | Out-Null
      $archived += 1
      $archivedRows += [ordered]@{ id = $pair.Value.Id; actionKey = Normalize-Text $pair.Value.FieldValues.ActionKey; reason = 'managed-key-absent-from-curated-payload' }
    }
  }

  $skippedUnmanaged = @()
  foreach ($pair in $existingByKey.GetEnumerator()) {
    if (-not $managedSet.ContainsKey($pair.Key)) {
      $skippedUnmanaged += [ordered]@{
        id = $pair.Value.Id
        actionKey = Normalize-Text $pair.Value.FieldValues.ActionKey
        itemStatus = Normalize-Text $pair.Value.FieldValues.ItemStatus
        reason = 'outside-curated-managed-key-set'
      }
    }
  }

  return [ordered]@{
    inserted = $inserted
    updated = $updated
    archived = $archived
    itemRowsWritten = $writtenRows
    archivedRows = $archivedRows
    skippedUnmanagedRows = $skippedUnmanaged
    processedCount = @($writtenRows).Count
  }
}

function Seed-ItemsFromQuickLinks([object[]]$QuickLinks) {
  $configResult = Ensure-ConfigRow

  $existingItems = Get-PnPListItem -List $ITEMS_LIST_TITLE -PageSize 2000
  $existingByKey = @{}
  foreach ($row in $existingItems) {
    if (([string]$row.FieldValues.BandKey) -ne 'homepage-primary') { continue }
    $key = Normalize-Text $row.FieldValues.ActionKey
    if (-not [string]::IsNullOrWhiteSpace($key) -and -not $existingByKey.ContainsKey($key)) {
      $existingByKey[$key] = $row
    }
  }

  $processedKeys = @{}
  $inserted = 0
  $updated = 0
  $normalizedSeed = @()

  $index = 0
  foreach ($entry in $QuickLinks) {
    $index += 1
    $title = Normalize-Text $entry.title
    $href = Normalize-Text $entry.url
    if ([string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($href)) {
      continue
    }

    $actionKey = Build-ActionKey -Title $title -Href $href
    $isExternal = Resolve-IsExternal $href
    $openInNewTab = if ($entry.openInNewTab -eq $true) { $true } elseif ($isExternal) { $true } else { $false }
    $sortOrder = $index * 100

    $values = [ordered]@{
      Title = $title
      BandKey = 'homepage-primary'
      ActionKey = $actionKey
      ItemStatus = 'Enabled'
      ActionDescription = $null
      Href = $href
      IconKey = $null
      BadgeLabel = $null
      BadgeVariant = 'neutral'
      Priority = 'primary'
      GroupKey = $null
      GroupTitle = $null
      SortOrder = $sortOrder
      OverflowOnly = $false
      MobilePriority = 100
      AudienceMode = 'all'
      AudienceKeys = $null
      IsExternal = $isExternal
      OpenInNewTab = $openInNewTab
      VisibleDesktop = $true
      VisibleLaptop = $true
      VisibleTabletLandscape = $true
      VisibleTabletPortrait = $true
      VisiblePhone = $true
      StartsAtUtc = $null
      EndsAtUtc = $null
      AdminNotes = $null
    }

    if ($existingByKey.ContainsKey($actionKey)) {
      Set-PnPListItem -List $ITEMS_LIST_TITLE -Identity $existingByKey[$actionKey].Id -Values $values | Out-Null
      $updated += 1
    } else {
      Add-PnPListItem -List $ITEMS_LIST_TITLE -Values $values | Out-Null
      $inserted += 1
    }

    $processedKeys[$actionKey] = $true

    $normalizedSeed += [ordered]@{
      title = $title
      href = $href
      actionKey = $actionKey
      sortOrder = $sortOrder
      isExternal = $isExternal
      openInNewTab = $openInNewTab
      defaultsApplied = @(
        'ItemStatus=Enabled',
        'BadgeVariant=neutral',
        'Priority=primary',
        'MobilePriority=100',
        'AudienceMode=all',
        'Visibility(All Devices)=Yes'
      )
    }
  }

  $archived = 0
  foreach ($pair in $existingByKey.GetEnumerator()) {
    if (-not $processedKeys.ContainsKey($pair.Key)) {
      Set-PnPListItem -List $ITEMS_LIST_TITLE -Identity $pair.Value.Id -Values @{ ItemStatus = 'Archived' } | Out-Null
      $archived += 1
    }
  }

  return [ordered]@{
    config = $configResult
    extractedCount = @($QuickLinks).Count
    processedCount = @($normalizedSeed).Count
    inserted = $inserted
    updated = $updated
    archived = $archived
    seededItems = $normalizedSeed
  }
}

if ($AuthMode -eq 'DeviceLogin') {
  Connect-PnPOnline -Url $TargetSiteUrl -ClientId $ClientId -Tenant $Tenant -DeviceLogin
} else {
  Connect-PnPOnline -Url $TargetSiteUrl -ClientId $ClientId -Tenant $Tenant -Interactive
}

$listFilters = @(Split-Csv $ListFiltersCsv)
$pageFilters = @(Split-Csv $PageFiltersCsv)
$timestamp = (Get-Date).ToString('o')

$provisionSummary = [ordered]@{
  runId = $RunId
  actionKey = $ActionKey
  siteUrl = $TargetSiteUrl
  executed = $false
  lists = @()
  driftWarnings = @()
}

$seedSummary = [ordered]@{
  runId = $RunId
  actionKey = $ActionKey
  siteUrl = $TargetSiteUrl
  executed = $false
  extractedCount = 0
  processedCount = 0
  inserted = 0
  updated = 0
  archived = 0
  defaults = @(
    'BandKey=homepage-primary',
    'ItemStatus=Enabled',
    'BadgeVariant=neutral',
    'Priority=primary',
    'MobilePriority=100',
    'AudienceMode=all',
    'Visibility(All Devices)=Yes'
  )
  warnings = @()
  seededItems = @()
  seedSource = 'quick-links'
  seedDefinitionPath = $null
  managedActionKeys = @()
  configInserted = 0
  configUpdated = 0
  configRowsWritten = @()
  itemRowsWritten = @()
  archivedRows = @()
  skippedUnmanagedRows = @()
  conflictingUnknownActiveConfigRows = @()
  validationFailures = @()
}

$raw = [ordered]@{
  runId = $RunId
  actionKey = $ActionKey
  fetchedAt = $timestamp
  targetSiteUrl = $TargetSiteUrl
  authMode = $AuthMode
  connectionMethod = Get-ConnectionMethodText
  executionIntentMode = $ExecutionIntentMode
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
  '# PnP Runner Summary',
  '',
  "- Run ID: $RunId",
  "- Action: $ActionKey",
  "- Target Site: $TargetSiteUrl",
  "- Generated At: $timestamp",
  "- Auth Mode: $AuthMode",
  "- Execution Intent: $ExecutionIntentMode",
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
  'sharepoint-control:provisioning:priority-actions-band-lists' {
    $provisionResult = Ensure-CommandBandLists
    $provisionSummary.executed = $true
    $provisionSummary.lists = $provisionResult.lists
    $provisionSummary.driftWarnings = $provisionResult.driftWarnings
    $raw.provision = $provisionSummary
    $normalized.provision = $provisionSummary
    $summaryLines += "- Provisioned/normalized command-band lists: $(@($provisionResult.lists).Count)."
  }
  'sharepoint-control:extraction:homepage-quick-links' {
    $pageName = if ($pageFilters.Count -gt 0) { $pageFilters[0] } else { Resolve-DefaultPageName }
    $quickLinks = Extract-QuickLinksFromPage -PageName $pageName
    $raw.quickLinks = $quickLinks
    $normalized.quickLinks = [ordered]@{
      pageName = $quickLinks.pageName
      count = $quickLinks.count
      warnings = $quickLinks.warnings
      items = $quickLinks.items
    }
    $summaryLines += "- Extracted homepage quick links: $($quickLinks.count)."
    if (@($quickLinks.warnings).Count -gt 0) {
      $summaryLines += "- Extraction warnings: $([string]::Join('; ', $quickLinks.warnings))"
    }
  }
  'sharepoint-control:provisioning:priority-actions-band-seed-items' {
    $null = Ensure-CommandBandLists
    $provisionSummary.executed = $true

    $pageName = if ($pageFilters.Count -gt 0) { $pageFilters[0] } else { Resolve-DefaultPageName }
    $quickLinks = Extract-QuickLinksFromPage -PageName $pageName
    $seedResult = Seed-ItemsFromQuickLinks -QuickLinks $quickLinks.items

    $seedSummary.executed = $true
    $seedSummary.extractedCount = $seedResult.extractedCount
    $seedSummary.processedCount = $seedResult.processedCount
    $seedSummary.inserted = $seedResult.inserted
    $seedSummary.updated = $seedResult.updated
    $seedSummary.archived = $seedResult.archived
    $seedSummary.seededItems = $seedResult.seededItems
    $seedSummary.warnings = $quickLinks.warnings

    $raw.quickLinks = $quickLinks
    $raw.seed = $seedSummary
    $normalized.quickLinks = [ordered]@{ count = $quickLinks.count; items = $quickLinks.items; warnings = $quickLinks.warnings }
    $normalized.seed = $seedSummary

    $summaryLines += "- Seeded command-band items from quick links. Extracted=$($seedResult.extractedCount), Processed=$($seedResult.processedCount), Inserted=$($seedResult.inserted), Updated=$($seedResult.updated), Archived=$($seedResult.archived)."
  }
  'sharepoint-control:provisioning:priority-actions-band-provision-and-seed' {
    $provisionResult = Ensure-CommandBandLists
    $provisionSummary.executed = $true
    $provisionSummary.lists = $provisionResult.lists
    $provisionSummary.driftWarnings = $provisionResult.driftWarnings

    $pageName = if ($pageFilters.Count -gt 0) { $pageFilters[0] } else { Resolve-DefaultPageName }
    $quickLinks = Extract-QuickLinksFromPage -PageName $pageName
    $seedResult = Seed-ItemsFromQuickLinks -QuickLinks $quickLinks.items

    $seedSummary.executed = $true
    $seedSummary.extractedCount = $seedResult.extractedCount
    $seedSummary.processedCount = $seedResult.processedCount
    $seedSummary.inserted = $seedResult.inserted
    $seedSummary.updated = $seedResult.updated
    $seedSummary.archived = $seedResult.archived
    $seedSummary.seededItems = $seedResult.seededItems
    $seedSummary.warnings = $quickLinks.warnings

    $raw.quickLinks = $quickLinks
    $raw.provision = $provisionSummary
    $raw.seed = $seedSummary

    $normalized.provision = $provisionSummary
    $normalized.quickLinks = [ordered]@{ count = $quickLinks.count; items = $quickLinks.items; warnings = $quickLinks.warnings }
    $normalized.seed = $seedSummary

    $summaryLines += "- Provisioned command-band lists and seeded from quick links. Extracted=$($seedResult.extractedCount), Processed=$($seedResult.processedCount), Inserted=$($seedResult.inserted), Updated=$($seedResult.updated), Archived=$($seedResult.archived)."
  }
  'sharepoint-control:provisioning:priority-actions-band-seed-curated' {
    $null = Ensure-CommandBandLists
    $provisionSummary.executed = $true

    $curatedSeed = Read-CuratedSeedDefinition
    $configResult = Seed-CuratedConfigRows -ConfigRows $curatedSeed.configs
    $itemResult = Seed-CuratedItemRows -ItemRows $curatedSeed.items -ManagedActionKeys $curatedSeed.managedActionKeys

    $seedSummary.executed = $true
    $seedSummary.seedSource = 'curated'
    $seedSummary.seedDefinitionPath = $curatedSeed.seedPath
    $seedSummary.extractedCount = @($curatedSeed.items).Count
    $seedSummary.processedCount = $itemResult.processedCount
    $seedSummary.inserted = $itemResult.inserted
    $seedSummary.updated = $itemResult.updated
    $seedSummary.archived = $itemResult.archived
    $seedSummary.seededItems = $itemResult.itemRowsWritten
    $seedSummary.managedActionKeys = $curatedSeed.managedActionKeys
    $seedSummary.configInserted = $configResult.inserted
    $seedSummary.configUpdated = $configResult.updated
    $seedSummary.configRowsWritten = $configResult.configRowsWritten
    $seedSummary.itemRowsWritten = $itemResult.itemRowsWritten
    $seedSummary.archivedRows = $itemResult.archivedRows
    $seedSummary.skippedUnmanagedRows = $itemResult.skippedUnmanagedRows
    $seedSummary.conflictingUnknownActiveConfigRows = $configResult.conflictingUnknownActiveRows

    if (@($configResult.conflictingUnknownActiveRows).Count -gt 0) {
      $seedSummary.validationFailures = @("Conflicting unknown active config rows exist for homepage-primary. Resolve conflicts and rerun curated seed.")
      throw ("Curated seed failed: conflicting unknown active config rows detected for homepage-primary (count=$(@($configResult.conflictingUnknownActiveRows).Count)).")
    }

    $raw.curatedSeed = [ordered]@{
      seedDefinitionPath = $curatedSeed.seedPath
      managedActionKeys = $curatedSeed.managedActionKeys
    }
    $raw.seed = $seedSummary
    $normalized.seed = $seedSummary

    $summaryLines += "- Seeded command-band config/items from curated seed file. Processed=$($seedSummary.processedCount), Inserted=$($seedSummary.inserted), Updated=$($seedSummary.updated), Archived=$($seedSummary.archived)."
    $summaryLines += "- Curated config writes: Inserted=$($seedSummary.configInserted), Updated=$($seedSummary.configUpdated)."
    $summaryLines += "- Curated unmanaged rows skipped: $(@($seedSummary.skippedUnmanagedRows).Count)."
  }
  'sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated' {
    $provisionResult = Ensure-CommandBandLists
    $provisionSummary.executed = $true
    $provisionSummary.lists = $provisionResult.lists
    $provisionSummary.driftWarnings = $provisionResult.driftWarnings

    $curatedSeed = Read-CuratedSeedDefinition
    $configResult = Seed-CuratedConfigRows -ConfigRows $curatedSeed.configs
    $itemResult = Seed-CuratedItemRows -ItemRows $curatedSeed.items -ManagedActionKeys $curatedSeed.managedActionKeys

    $seedSummary.executed = $true
    $seedSummary.seedSource = 'curated'
    $seedSummary.seedDefinitionPath = $curatedSeed.seedPath
    $seedSummary.extractedCount = @($curatedSeed.items).Count
    $seedSummary.processedCount = $itemResult.processedCount
    $seedSummary.inserted = $itemResult.inserted
    $seedSummary.updated = $itemResult.updated
    $seedSummary.archived = $itemResult.archived
    $seedSummary.seededItems = $itemResult.itemRowsWritten
    $seedSummary.managedActionKeys = $curatedSeed.managedActionKeys
    $seedSummary.configInserted = $configResult.inserted
    $seedSummary.configUpdated = $configResult.updated
    $seedSummary.configRowsWritten = $configResult.configRowsWritten
    $seedSummary.itemRowsWritten = $itemResult.itemRowsWritten
    $seedSummary.archivedRows = $itemResult.archivedRows
    $seedSummary.skippedUnmanagedRows = $itemResult.skippedUnmanagedRows
    $seedSummary.conflictingUnknownActiveConfigRows = $configResult.conflictingUnknownActiveRows

    if (@($configResult.conflictingUnknownActiveRows).Count -gt 0) {
      $seedSummary.validationFailures = @("Conflicting unknown active config rows exist for homepage-primary. Resolve conflicts and rerun curated seed.")
      throw ("Curated provision+seed failed: conflicting unknown active config rows detected for homepage-primary (count=$(@($configResult.conflictingUnknownActiveRows).Count)).")
    }

    $raw.curatedSeed = [ordered]@{
      seedDefinitionPath = $curatedSeed.seedPath
      managedActionKeys = $curatedSeed.managedActionKeys
    }
    $raw.provision = $provisionSummary
    $raw.seed = $seedSummary
    $normalized.provision = $provisionSummary
    $normalized.seed = $seedSummary

    $summaryLines += "- Provisioned command-band lists and seeded curated config/items. Processed=$($seedSummary.processedCount), Inserted=$($seedSummary.inserted), Updated=$($seedSummary.updated), Archived=$($seedSummary.archived)."
    $summaryLines += "- Curated config writes: Inserted=$($seedSummary.configInserted), Updated=$($seedSummary.configUpdated)."
    $summaryLines += "- Curated unmanaged rows skipped: $(@($seedSummary.skippedUnmanagedRows).Count)."
  }
  'sharepoint-control:provisioning:flagship-action-layer-cutover' {
    # Flagship page action-layer cutover: remove OOB Quick Links webpart(s)
    # from the target page and place the governed PriorityActionsRail
    # client-side webpart. Idempotent: if PriorityActionsRail is already on
    # the page, no new instance is added; if no Quick Links webpart is
    # present, removal is a no-op.
    $pageName = if ($pageFilters.Count -gt 0) { $pageFilters[0] } else { Resolve-DefaultPageName }
    $priorityActionsRailWebPartId = 'b3f07190-79cf-437d-a1d6-ecbf3f77e616'
    $oobQuickLinksWebPartId = 'c70391ea-0b10-4ee9-b2b4-006d3fcad0cd'

    # Capture the live pre-cutover inventory so the action-layer migration
    # has a reviewable record.
    $quickLinksInventory = Extract-QuickLinksFromPage -PageName $pageName

    $pageComposition = [ordered]@{
      pageName = $pageName
      priorityActionsRailWebPartId = $priorityActionsRailWebPartId
      oobQuickLinksWebPartId = $oobQuickLinksWebPartId
      preCutover = [ordered]@{
        extractedQuickLinksCount = $quickLinksInventory.count
        extractedQuickLinks = $quickLinksInventory.items
        warnings = $quickLinksInventory.warnings
      }
      removedWebPartInstances = @()
      addedWebPartInstance = $null
      alreadyPresent = $false
      errors = @()
    }

    try {
      $page = Get-PnPPage -Identity $pageName -ErrorAction Stop
      $controls = @($page.Controls)

      # Remove every OOB Quick Links control currently on the page.
      foreach ($control in $controls) {
        $controlWebPartId = $null
        try { $controlWebPartId = [string]$control.WebPartId } catch { $controlWebPartId = $null }
        if ($controlWebPartId -and ($controlWebPartId.Trim().ToLower() -eq $oobQuickLinksWebPartId)) {
          try {
            Remove-PnPPageWebPart -Page $pageName -Identity $control.InstanceId -ErrorAction Stop
            $pageComposition.removedWebPartInstances += [ordered]@{
              instanceId = [string]$control.InstanceId
              order = $control.Order
            }
          }
          catch {
            $pageComposition.errors += "remove-quick-links-failed: instanceId=$($control.InstanceId); $($_.Exception.Message)"
          }
        }
      }

      # Refresh the page after removal so we test against current composition.
      $page = Get-PnPPage -Identity $pageName -ErrorAction Stop
      $alreadyPresent = $false
      foreach ($control in @($page.Controls)) {
        $controlWebPartId = $null
        try { $controlWebPartId = [string]$control.WebPartId } catch { $controlWebPartId = $null }
        if ($controlWebPartId -and ($controlWebPartId.Trim().ToLower() -eq $priorityActionsRailWebPartId)) {
          $alreadyPresent = $true
          $pageComposition.addedWebPartInstance = [ordered]@{
            instanceId = [string]$control.InstanceId
            reused = $true
          }
          break
        }
      }
      $pageComposition.alreadyPresent = $alreadyPresent

      if (-not $alreadyPresent) {
        try {
          $added = Add-PnPPageWebPart -Page $pageName -Component $priorityActionsRailWebPartId -ErrorAction Stop
          $pageComposition.addedWebPartInstance = [ordered]@{
            instanceId = if ($added) { [string]$added.InstanceId } else { $null }
            reused = $false
          }
        }
        catch {
          $pageComposition.errors += "add-priority-actions-rail-failed: $($_.Exception.Message)"
        }
      }

      try { Set-PnPPage -Identity $pageName -Publish -ErrorAction SilentlyContinue | Out-Null } catch { }
    }
    catch {
      $pageComposition.errors += "page-load-failed: $($_.Exception.Message)"
    }

    $postComposition = Get-HomepageCanvasComposition -PageName $pageName
    $pageComposition.postCutover = $postComposition

    $raw.quickLinks = $quickLinksInventory
    $raw.pageComposition = $pageComposition
    $normalized.quickLinks = [ordered]@{
      count = $quickLinksInventory.count
      items = $quickLinksInventory.items
      warnings = $quickLinksInventory.warnings
    }
    $normalized.pageComposition = $pageComposition

    $summaryLines += "- Flagship action-layer cutover on page '$pageName'."
    $summaryLines += "- Pre-cutover Quick Links extracted: $($quickLinksInventory.count)."
    $summaryLines += "- OOB Quick Links instances removed: $(@($pageComposition.removedWebPartInstances).Count)."
    if ($pageComposition.alreadyPresent) {
      $summaryLines += "- PriorityActionsRail already present on page; no new instance added."
    }
    elseif ($pageComposition.addedWebPartInstance) {
      $summaryLines += "- PriorityActionsRail placed on page (instanceId=$($pageComposition.addedWebPartInstance.instanceId))."
    }
    if (@($pageComposition.errors).Count -gt 0) {
      $summaryLines += "- Cutover errors: $([string]::Join('; ', $pageComposition.errors))"
    }
    $summaryLines += "- Post-cutover actionLayerState: $($postComposition.actionLayerState); orderValid=$($postComposition.orderValid)."
  }
  'sharepoint-control:proof:homepage-action-layer' {
    # Authoritative read-only proof of the homepage action-layer state.
    # When -StrictProof is supplied, a failing proof emits a PowerShell
    # Write-Error so the local runner surfaces the regression loudly.
    $pageName = if ($pageFilters.Count -gt 0) { $pageFilters[0] } else { Resolve-DefaultPageName }
    $proof = Invoke-HomepageActionLayerProof -PageName $pageName -Strict:$StrictProof.IsPresent

    $raw.homepageActionLayerProof = $proof
    $normalized.homepageActionLayerProof = [ordered]@{
      pageName = $proof.pageName
      actionLayerState = $proof.actionLayerState
      orderValid = $proof.orderValid
      passed = $proof.passed
      issues = $proof.issues
      controls = $proof.composition.controls
    }

    $summaryLines += "- Homepage action-layer proof on page '$pageName'."
    $summaryLines += "- Proof state: $($proof.actionLayerState); passed=$($proof.passed); orderValid=$($proof.orderValid)."
    if (@($proof.issues).Count -gt 0) {
      $summaryLines += "- Proof issues: $([string]::Join('; ', $proof.issues))"
    } else {
      $summaryLines += '- Proof issues: none.'
    }
  }
  'sharepoint-control:provisioning:flagship-homepage-wrapper-cutover' {
    # Phase-07 flagship wrapper cutover. Removes residual OOB Quick Links
    # AND any standalone PriorityActionsRail webparts from the target
    # page so the wrapper-embedded rail inside HbHomepage is the sole
    # action layer. Does NOT add webparts — hbHomepage must already be
    # authored on the page. Idempotent: any absent legacy webpart is a
    # no-op, any already-correct page yields an empty removal set.
    $pageName = if ($pageFilters.Count -gt 0) { $pageFilters[0] } else { Resolve-DefaultPageName }
    $priorityActionsRailWebPartId = 'b3f07190-79cf-437d-a1d6-ecbf3f77e616'
    $oobQuickLinksWebPartId = 'c70391ea-0b10-4ee9-b2b4-006d3fcad0cd'

    # Capture the live pre-cutover composition for a reviewable record.
    $preComposition = Get-HomepageCanvasComposition -PageName $pageName

    $pageComposition = [ordered]@{
      pageName = $pageName
      priorityActionsRailWebPartId = $priorityActionsRailWebPartId
      oobQuickLinksWebPartId = $oobQuickLinksWebPartId
      preCutover = $preComposition
      removedWebPartInstances = @()
      errors = @()
    }

    try {
      $page = Get-PnPPage -Identity $pageName -ErrorAction Stop
      $controls = @($page.Controls)

      foreach ($control in $controls) {
        $controlWebPartId = $null
        try { $controlWebPartId = [string]$control.WebPartId } catch { $controlWebPartId = $null }
        $normalized = if ($controlWebPartId) { $controlWebPartId.Trim().ToLower() } else { '' }

        $shouldRemove = $false
        $reason = $null
        if ($normalized -eq $oobQuickLinksWebPartId) {
          $shouldRemove = $true
          $reason = 'oob-quick-links'
        } elseif ($normalized -eq $priorityActionsRailWebPartId) {
          $shouldRemove = $true
          $reason = 'standalone-priority-actions-rail'
        }

        if ($shouldRemove) {
          try {
            Remove-PnPPageWebPart -Page $pageName -Identity $control.InstanceId -ErrorAction Stop
            $pageComposition.removedWebPartInstances += [ordered]@{
              instanceId = [string]$control.InstanceId
              order = $control.Order
              reason = $reason
            }
          }
          catch {
            $pageComposition.errors += "remove-webpart-failed: reason=$reason; instanceId=$($control.InstanceId); $($_.Exception.Message)"
          }
        }
      }

      try { Set-PnPPage -Identity $pageName -Publish -ErrorAction SilentlyContinue | Out-Null } catch { }
    }
    catch {
      $pageComposition.errors += "page-load-failed: $($_.Exception.Message)"
    }

    $postComposition = Get-HomepageCanvasComposition -PageName $pageName
    $pageComposition.postCutover = $postComposition

    $raw.pageComposition = $pageComposition
    $normalized.pageComposition = $pageComposition

    $summaryLines += "- Flagship homepage wrapper cutover on page '$pageName'."
    $summaryLines += "- Removed webpart instances: $(@($pageComposition.removedWebPartInstances).Count)."
    if (@($pageComposition.errors).Count -gt 0) {
      $summaryLines += "- Cutover errors: $([string]::Join('; ', $pageComposition.errors))"
    }
    $summaryLines += "- Post-cutover wrapperEmbeddedState: $($postComposition.wrapperEmbeddedState); wrapperOrderValid=$($postComposition.wrapperOrderValid)."
  }
  'sharepoint-control:proof:homepage-wrapper-embedded' {
    # Phase-07 authoritative read-only proof that the flagship page
    # matches the wrapper-embedded target (hero + HbHomepage only).
    # When -StrictProof is supplied, a failing proof emits Write-Error
    # so the local runner surfaces the regression loudly.
    $pageName = if ($pageFilters.Count -gt 0) { $pageFilters[0] } else { Resolve-DefaultPageName }
    $proof = Invoke-HomepageWrapperEmbeddedProof -PageName $pageName -Strict:$StrictProof.IsPresent

    $raw.homepageWrapperEmbeddedProof = $proof
    $normalized.homepageWrapperEmbeddedProof = [ordered]@{
      pageName = $proof.pageName
      wrapperEmbeddedState = $proof.wrapperEmbeddedState
      wrapperOrderValid = $proof.wrapperOrderValid
      passed = $proof.passed
      issues = $proof.issues
      controls = $proof.composition.controls
    }

    $summaryLines += "- Homepage wrapper-embedded proof on page '$pageName'."
    $summaryLines += "- Proof state: $($proof.wrapperEmbeddedState); passed=$($proof.passed); wrapperOrderValid=$($proof.wrapperOrderValid)."
    if (@($proof.issues).Count -gt 0) {
      $summaryLines += "- Proof issues: $([string]::Join('; ', $proof.issues))"
    } else {
      $summaryLines += '- Proof issues: none.'
    }
  }
  default {
    throw "Unsupported action key: $ActionKey"
  }
}

$summaryLines += ''
$summaryLines += '## Notes'
$summaryLines += '- Workflow ran via local-runner using PnP.PowerShell.'

Ensure-ParentDirectory $OutputRawPath
Ensure-ParentDirectory $OutputNormalizedPath
Ensure-ParentDirectory $OutputSummaryPath
Ensure-ParentDirectory $OutputProvisionSummaryPath
Ensure-ParentDirectory $OutputSeedSummaryPath

($raw | ConvertTo-Json -Depth 50) | Set-Content -Path $OutputRawPath -Encoding UTF8
($normalized | ConvertTo-Json -Depth 50) | Set-Content -Path $OutputNormalizedPath -Encoding UTF8
($summaryLines -join [Environment]::NewLine) | Set-Content -Path $OutputSummaryPath -Encoding UTF8
($provisionSummary | ConvertTo-Json -Depth 30) | Set-Content -Path $OutputProvisionSummaryPath -Encoding UTF8
($seedSummary | ConvertTo-Json -Depth 30) | Set-Content -Path $OutputSeedSummaryPath -Encoding UTF8
