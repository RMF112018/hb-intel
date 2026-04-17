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
  [string]$PageFiltersCsv = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$CONFIG_LIST_TITLE = 'Priority Actions Band Config'
$ITEMS_LIST_TITLE = 'Priority Actions Band Items'
$QUICK_LINKS_WEBPART_ID = 'c70391ea-0b10-4ee9-b2b4-006d3fcad0cd'

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
      $jsonPayload = Normalize-Text (Get-PropertyValue -Object $control -Names @('PropertiesJson', 'JsonControlData'))
      if ($webPartId -eq $QUICK_LINKS_WEBPART_ID -or $jsonPayload -match $QUICK_LINKS_WEBPART_ID) {
        $parsed = Read-JsonSafe $jsonPayload
        Collect-LinksRecursive -Node $parsed -SourceLabel "Get-PnPPage:$PageName" -Target $results -Seen $seen
      }
    }
  }

  $items = Get-PnPListItem -List 'Site Pages' -Fields FileLeafRef,CanvasContent1,Title -PageSize 200
  $targetPage = $items | Where-Object { $_['FileLeafRef'] -eq $PageName } | Select-Object -First 1
  if ($null -eq $targetPage -and $PageName -ne 'Home.aspx') {
    $targetPage = $items | Where-Object { $_['FileLeafRef'] -eq 'Home.aspx' } | Select-Object -First 1
  }

  if ($null -eq $targetPage) {
    $warnings.Add("Could not locate Site Pages item for page $PageName.")
  } else {
    $canvas = [string]$targetPage['CanvasContent1']
    if ($canvas -notmatch $QUICK_LINKS_WEBPART_ID) {
      $warnings.Add('Quick Links webpart id was not found in CanvasContent1; extraction used generic link parsing fallback.')
    }

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
    $pageName = if ($pageFilters.Count -gt 0) { $pageFilters[0] } else { 'Home.aspx' }
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

    $pageName = if ($pageFilters.Count -gt 0) { $pageFilters[0] } else { 'Home.aspx' }
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

    $pageName = if ($pageFilters.Count -gt 0) { $pageFilters[0] } else { 'Home.aspx' }
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
