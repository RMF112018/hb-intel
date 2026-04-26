[CmdletBinding()]
param(
  [string]$SiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral",
  [string]$AppId = "08c399eb-a394-4087-b859-659d493f8dc7",
  [string]$Tenant = "hedrickbrothers.com",
  [ValidateSet("DeviceLogin", "Interactive")] [string]$AuthMode = "DeviceLogin",
  [string]$EnvironmentKey = "Production",
  [switch]$DryRun,
  [switch]$Seed,
  [switch]$ForceUpdateSeedValues,
  [string]$OutputDir = "",
  [string]$ProofPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ListTitle = "HB Platform Configuration Registry"
$ListInternalKey = "HB_PlatformConfigurationRegistry"
$DefaultSiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"
$DefaultAppId = "08c399eb-a394-4087-b859-659d493f8dc7"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$RunStartedUtc = (Get-Date).ToUniversalTime()
$RunStamp = $RunStartedUtc.ToString("yyyy-MM-dd-HHmmss")

if ([string]::IsNullOrWhiteSpace($Tenant)) {
  throw "Tenant is required. Repo truth uses 'hedrickbrothers.com'; pass -Tenant explicitly if that changes."
}

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
  $OutputDir = Join-Path $RepoRoot "docs/architecture/plans/MASTER/platform/config-registry/proof"
}
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

if ([string]::IsNullOrWhiteSpace($ProofPath)) {
  $mode = if ($DryRun) { "dry-run" } else { "provisioning" }
  $ProofPath = Join-Path $OutputDir "platform-config-registry-$mode-$RunStamp.md"
}
$SummaryJsonPath = [System.IO.Path]::ChangeExtension($ProofPath, ".json")

$ValueTypeChoices = @(
  "String",
  "Number",
  "Boolean",
  "Json",
  "Url",
  "Guid",
  "OriginList",
  "Version",
  "SecretReference"
)
$ValidationStatusChoices = @("Not Validated", "Valid", "Warning", "Blocked", "Expired")
$EnvironmentKeyChoices = @("Production", "Staging", "Development", "Local")
$ApplicationKeyChoices = @("Platform", "Foleon", "Homepage", "Safety", "Kudos", "FunctionApp", "SharePoint")

$FieldDefs = @(
  @{ InternalName = "ApplicationKey"; DisplayName = "Application Key"; Type = "Choice"; Required = $true; Indexed = $true; Choices = $ApplicationKeyChoices; FillInChoice = $true },
  @{ InternalName = "EnvironmentKey"; DisplayName = "Environment Key"; Type = "Choice"; Required = $true; Indexed = $true; Choices = $EnvironmentKeyChoices; FillInChoice = $true },
  @{ InternalName = "ScopeKey"; DisplayName = "Scope Key"; Type = "Text"; Required = $false; Indexed = $true },
  @{ InternalName = "ConfigKey"; DisplayName = "Config Key"; Type = "Text"; Required = $true; Indexed = $true },
  @{ InternalName = "ConfigValue"; DisplayName = "Config Value"; Type = "Note"; Required = $false },
  @{ InternalName = "ConfigValueJson"; DisplayName = "Config Value JSON"; Type = "Note"; Required = $false },
  @{ InternalName = "ValueType"; DisplayName = "Value Type"; Type = "Choice"; Required = $true; Choices = $ValueTypeChoices; FillInChoice = $true },
  @{ InternalName = "IsRequired"; DisplayName = "Is Required"; Type = "Boolean"; Required = $true; Default = "0" },
  @{ InternalName = "IsSecretReference"; DisplayName = "Is Secret Reference"; Type = "Boolean"; Required = $true; Indexed = $true; Default = "0" },
  @{ InternalName = "SecretReferenceName"; DisplayName = "Secret Reference Name"; Type = "Text"; Required = $false },
  @{ InternalName = "SiteUrl"; DisplayName = "Site URL"; Type = "Text"; Required = $false },
  @{ InternalName = "ListTitle"; DisplayName = "List Title"; Type = "Text"; Required = $false },
  @{ InternalName = "ListGuid"; DisplayName = "List GUID"; Type = "Text"; Required = $false; Indexed = $true },
  @{ InternalName = "WebId"; DisplayName = "Web ID"; Type = "Text"; Required = $false },
  @{ InternalName = "TenantId"; DisplayName = "Tenant ID"; Type = "Text"; Required = $false },
  @{ InternalName = "ManifestId"; DisplayName = "Manifest ID"; Type = "Text"; Required = $false; Indexed = $true },
  @{ InternalName = "ExpectedPackageVersion"; DisplayName = "Expected Package Version"; Type = "Text"; Required = $false },
  @{ InternalName = "ApiBaseUrl"; DisplayName = "API Base URL"; Type = "Text"; Required = $false },
  @{ InternalName = "ApiResource"; DisplayName = "API Resource"; Type = "Text"; Required = $false },
  @{ InternalName = "AcceptedOrigins"; DisplayName = "Accepted Origins"; Type = "Note"; Required = $false },
  @{ InternalName = "ValidationRule"; DisplayName = "Validation Rule"; Type = "Note"; Required = $false },
  @{ InternalName = "ValidationStatus"; DisplayName = "Validation Status"; Type = "Choice"; Required = $true; Indexed = $true; Choices = $ValidationStatusChoices; FillInChoice = $true },
  @{ InternalName = "LastValidatedAt"; DisplayName = "Last Validated At"; Type = "DateTime"; Required = $false },
  @{ InternalName = "OwnerGroup"; DisplayName = "Owner Group"; Type = "Text"; Required = $false },
  @{ InternalName = "AdminNotes"; DisplayName = "Admin Notes"; Type = "Note"; Required = $false },
  @{ InternalName = "IsActive"; DisplayName = "Is Active"; Type = "Boolean"; Required = $true; Indexed = $true; Default = "1" },
  @{ InternalName = "EffectiveFrom"; DisplayName = "Effective From"; Type = "DateTime"; Required = $false; Indexed = $true },
  @{ InternalName = "EffectiveThrough"; DisplayName = "Effective Through"; Type = "DateTime"; Required = $false; Indexed = $true },
  @{ InternalName = "LastUpdatedBy"; DisplayName = "Last Updated By"; Type = "User"; Required = $false },
  @{ InternalName = "LastUpdatedAt"; DisplayName = "Last Updated At"; Type = "DateTime"; Required = $false; Indexed = $true }
)

$SeedRecords = @(
  @{
    Title = "Foleon Marketing-New host page URL"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "Marketing-New"; ConfigKey = "MarketingNewHostPageUrl";
    ConfigValue = "https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Foleon-Manager.aspx"; ValueType = "Url"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Not Validated"; IsActive = $true
  },
  @{
    Title = "Foleon HBCentral hub site URL"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "HBCentral"; ConfigKey = "HBCentralHubSiteUrl";
    ConfigValue = "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"; SiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"; ValueType = "Url"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Not Validated"; IsActive = $true
  },
  @{
    Title = "Foleon expected SPFx manifest ID"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "SPFx"; ConfigKey = "ExpectedManifestId";
    ConfigValue = "2160edb3-675e-4451-92bb-8345f9d1c71e"; ManifestId = "2160edb3-675e-4451-92bb-8345f9d1c71e"; ValueType = "Guid"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Not Validated"; IsActive = $true
  },
  @{
    Title = "Foleon accepted origins"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "SPFx"; ConfigKey = "AcceptedFoleonOrigins";
    ConfigValueJson = "[`"https://viewer.us.foleon.com`"]"; AcceptedOrigins = "[`"https://viewer.us.foleon.com`"]"; ValueType = "OriginList"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Not Validated"; IsActive = $true
  },
  @{
    Title = "Foleon content registry list GUID"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "HBCentral"; ConfigKey = "FoleonContentRegistryListGuid";
    ListTitle = "Foleon Content Registry"; ValueType = "Guid"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Blocked"; IsActive = $true; AdminNotes = "Populate after tenant validation confirms the live list GUID."
  },
  @{
    Title = "Foleon homepage placements list GUID"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "HBCentral"; ConfigKey = "FoleonHomepagePlacementsListGuid";
    ListTitle = "Foleon Homepage Placements"; ValueType = "Guid"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Blocked"; IsActive = $true; AdminNotes = "Populate after tenant validation confirms the live list GUID."
  },
  @{
    Title = "Foleon interaction events list GUID"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "HBCentral"; ConfigKey = "FoleonInteractionEventsListGuid";
    ListTitle = "Foleon Interaction Events"; ValueType = "Guid"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Blocked"; IsActive = $true; AdminNotes = "Populate after tenant validation confirms the live list GUID."
  },
  @{
    Title = "Foleon sync runs list GUID"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "HBCentral"; ConfigKey = "FoleonSyncRunsListGuid";
    ListTitle = "Foleon Sync Runs"; ValueType = "Guid"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Blocked"; IsActive = $true; AdminNotes = "Populate after tenant validation confirms the live list GUID."
  },
  @{
    Title = "Foleon API base URL"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "Backend"; ConfigKey = "FoleonApiBaseUrl";
    ValueType = "Url"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Blocked"; IsActive = $true; AdminNotes = "Populate after backend/API validation confirms the production base URL."
  },
  @{
    Title = "Foleon API resource"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "Backend"; ConfigKey = "FoleonApiResource";
    ValueType = "String"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Blocked"; IsActive = $true; AdminNotes = "Populate after Entra/API audience validation confirms the resource URI."
  },
  @{
    Title = "Homepage expected package version"; ApplicationKey = "Homepage"; EnvironmentKey = $EnvironmentKey; ScopeKey = "SPFx"; ConfigKey = "HomepageExpectedPackageVersion";
    ValueType = "Version"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Blocked"; IsActive = $true; AdminNotes = "Populate after package inventory validation."
  },
  @{
    Title = "Foleon expected package version"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "SPFx"; ConfigKey = "FoleonExpectedPackageVersion";
    ConfigValue = "1.0.23.0"; ExpectedPackageVersion = "1.0.23.0"; ValueType = "Version"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Not Validated"; IsActive = $true; AdminNotes = "Repo package config currently identifies Foleon SPFx package version 1.0.23.0."
  },
  @{
    Title = "Backend Function App URL"; ApplicationKey = "FunctionApp"; EnvironmentKey = $EnvironmentKey; ScopeKey = "Backend"; ConfigKey = "BackendFunctionAppUrl";
    ValueType = "Url"; IsRequired = $true; IsSecretReference = $false; ValidationStatus = "Blocked"; IsActive = $true; AdminNotes = "Populate after backend Function App host validation."
  },
  @{
    Title = "Foleon client secret reference"; ApplicationKey = "Foleon"; EnvironmentKey = $EnvironmentKey; ScopeKey = "Backend"; ConfigKey = "FoleonClientSecret";
    ValueType = "SecretReference"; IsRequired = $true; IsSecretReference = $true; SecretReferenceName = "HB_FOLEON_CLIENT_SECRET"; ValidationStatus = "Not Validated"; IsActive = $true; AdminNotes = "Reference only. Do not store the secret value in SharePoint."
  }
)

function Connect-RegistryTenant {
  $params = @{
    Url = $SiteUrl
    ClientId = $AppId
    Tenant = $Tenant
  }
  if ($AuthMode -eq "DeviceLogin") {
    $params.DeviceLogin = $true
  } else {
    $params.Interactive = $true
  }
  Connect-PnPOnline @params
}

function Add-SummaryAction {
  param(
    [System.Collections.Generic.List[object]]$Actions,
    [string]$Target,
    [string]$Action,
    [string]$Result,
    [string]$Detail = ""
  )
  $Actions.Add([ordered]@{
    target = $Target
    action = $Action
    result = $Result
    detail = $Detail
    timestampUtc = (Get-Date).ToUniversalTime().ToString("o")
  }) | Out-Null
  Write-Host "[$Result] $Target :: $Action $Detail"
}

function Get-ExpectedTypeAsString {
  param([string]$Type)
  switch ($Type) {
    "Text" { return "Text" }
    "Note" { return "Note" }
    "Boolean" { return "Boolean" }
    "Choice" { return "Choice" }
    "DateTime" { return "DateTime" }
    "User" { return "User" }
    default { throw "Unsupported field type '$Type'." }
  }
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

function Ensure-ChoiceExtension {
  param(
    [string]$FieldName,
    [hashtable]$Def,
    [System.Collections.Generic.List[object]]$Actions,
    [System.Collections.Generic.List[string]]$Warnings
  )
  $field = Get-PnPField -List $ListTitle -Identity $FieldName
  $currentChoices = @(Get-ChoiceArray -Field $field)
  $missing = @()
  foreach ($choice in $Def.Choices) {
    if ($currentChoices -notcontains $choice) {
      $missing += $choice
    }
  }
  if ($missing.Count -gt 0) {
    if ($DryRun) {
      Add-SummaryAction -Actions $Actions -Target $FieldName -Action "append-choice-values" -Result "would-update" -Detail ($missing -join ", ")
    } else {
      $field.Choices = [string[]]@($currentChoices + $missing)
      $field.Update()
      Invoke-PnPQuery
      Add-SummaryAction -Actions $Actions -Target $FieldName -Action "append-choice-values" -Result "updated" -Detail ($missing -join ", ")
    }
  }

  if ($Def.ContainsKey("FillInChoice") -and [bool]$Def.FillInChoice) {
    try {
      if (-not [bool]$field.FillInChoice) {
        if ($DryRun) {
          Add-SummaryAction -Actions $Actions -Target $FieldName -Action "enable-fill-in-choice" -Result "would-update"
        } else {
          Set-PnPField -List $ListTitle -Identity $FieldName -Values @{ FillInChoice = $true } | Out-Null
          Add-SummaryAction -Actions $Actions -Target $FieldName -Action "enable-fill-in-choice" -Result "updated"
        }
      }
    } catch {
      $Warnings.Add("${FieldName}: unable to enable fill-in choices through PnP; controlled future values must be appended by rerunning this provisioner or by list owner schema governance. $($_.Exception.Message)")
    }
  }
}

function Ensure-RegistryField {
  param(
    [hashtable]$Def,
    [System.Collections.Generic.List[object]]$Actions,
    [System.Collections.Generic.List[string]]$Warnings
  )

  $field = Get-PnPField -List $ListTitle -Identity $Def.InternalName -ErrorAction SilentlyContinue
  if ($null -eq $field) {
    if ($DryRun) {
      Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "create-field" -Result "would-create" -Detail "type=$($Def.Type)"
      return
    }

    $addParams = @{
      List = $ListTitle
      InternalName = $Def.InternalName
      DisplayName = $Def.DisplayName
      AddToDefaultView = $false
    }
    switch ($Def.Type) {
      "Choice" { $addParams.Type = "Choice"; $addParams.Choices = [string[]]$Def.Choices }
      "Text" { $addParams.Type = "Text" }
      "Note" { $addParams.Type = "Note" }
      "Boolean" { $addParams.Type = "Boolean" }
      "DateTime" { $addParams.Type = "DateTime" }
      "User" { $addParams.Type = "User" }
      default { throw "Unsupported field type '$($Def.Type)'." }
    }
    Add-PnPField @addParams | Out-Null
    Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "create-field" -Result "created" -Detail "type=$($Def.Type)"
    $field = Get-PnPField -List $ListTitle -Identity $Def.InternalName
  } else {
    $expectedType = Get-ExpectedTypeAsString -Type $Def.Type
    if ([string]$field.TypeAsString -ne $expectedType) {
      $Warnings.Add("$($Def.InternalName): field exists with type '$($field.TypeAsString)' but expected '$expectedType'. No type conversion attempted.")
      Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "verify-field" -Result "type-mismatch" -Detail "actual=$($field.TypeAsString); expected=$expectedType"
      return
    }
    Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "verify-field" -Result "exists" -Detail "type=$($field.TypeAsString)"
  }

  if ($Def.Type -eq "Choice") {
    Ensure-ChoiceExtension -FieldName $Def.InternalName -Def $Def -Actions $Actions -Warnings $Warnings
  }

  $values = @{}
  if ($Def.ContainsKey("Required") -and [bool]$field.Required -ne [bool]$Def.Required) {
    $values.Required = [bool]$Def.Required
  }
  if ($Def.ContainsKey("Default")) {
    $currentDefault = if ($null -eq $field.DefaultValue) { "" } else { [string]$field.DefaultValue }
    if ($currentDefault -ne [string]$Def.Default) {
      $values.DefaultValue = [string]$Def.Default
    }
  }
  if ($values.Keys.Count -gt 0) {
    if ($DryRun) {
      Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "update-field-settings" -Result "would-update" -Detail (($values.Keys | Sort-Object) -join ", ")
    } else {
      Set-PnPField -List $ListTitle -Identity $Def.InternalName -Values $values | Out-Null
      Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "update-field-settings" -Result "updated" -Detail (($values.Keys | Sort-Object) -join ", ")
    }
  }

  if ($Def.ContainsKey("Indexed") -and [bool]$Def.Indexed) {
    $refreshed = Get-PnPField -List $ListTitle -Identity $Def.InternalName
    if ([bool]$refreshed.Indexed) {
      Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "verify-index" -Result "present"
    } elseif ($DryRun) {
      Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "create-index" -Result "would-create"
    } else {
      try {
        Set-PnPField -List $ListTitle -Identity $Def.InternalName -Values @{ Indexed = $true } | Out-Null
        $afterIndex = Get-PnPField -List $ListTitle -Identity $Def.InternalName
        if ([bool]$afterIndex.Indexed) {
          Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "create-index" -Result "created"
        } else {
          $Warnings.Add("$($Def.InternalName): index creation did not report Indexed=true immediately; SharePoint may still be processing.")
          Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "create-index" -Result "queued-or-pending"
        }
      } catch {
        $Warnings.Add("$($Def.InternalName): index creation skipped/failed: $($_.Exception.Message)")
        Add-SummaryAction -Actions $Actions -Target $Def.InternalName -Action "create-index" -Result "skipped" -Detail $_.Exception.Message
      }
    }
  }
}

function Get-SeedLogicalKey {
  param([hashtable]$Record)
  return "$($Record.ApplicationKey)|$($Record.EnvironmentKey)|$($Record.ScopeKey)|$($Record.ConfigKey)|$($Record.IsActive)"
}

function Get-ItemTextValue {
  param([object]$Item, [string]$FieldName)
  $value = $Item[$FieldName]
  if ($null -eq $value) { return "" }
  return ([string]$value).Trim()
}

function Convert-SeedRecordToValues {
  param([hashtable]$Record)
  $values = @{}
  foreach ($fieldName in @(
      "Title", "ApplicationKey", "EnvironmentKey", "ScopeKey", "ConfigKey", "ConfigValue", "ConfigValueJson", "ValueType",
      "IsRequired", "IsSecretReference", "SecretReferenceName", "SiteUrl", "ListTitle", "ListGuid", "WebId", "TenantId",
      "ManifestId", "ExpectedPackageVersion", "ApiBaseUrl", "ApiResource", "AcceptedOrigins", "ValidationRule",
      "ValidationStatus", "LastValidatedAt", "OwnerGroup", "AdminNotes", "IsActive", "EffectiveFrom", "EffectiveThrough",
      "LastUpdatedAt"
    )) {
    if ($Record.ContainsKey($fieldName)) {
      $values[$fieldName] = $Record[$fieldName]
    }
  }
  return $values
}

function Seed-RegistryRecords {
  param(
    [System.Collections.Generic.List[object]]$Actions,
    [System.Collections.Generic.List[string]]$Warnings
  )
  $fields = @("Title", "ApplicationKey", "EnvironmentKey", "ScopeKey", "ConfigKey", "ConfigValue", "ConfigValueJson", "IsActive")
  $existingItems = @(Get-PnPListItem -List $ListTitle -PageSize 2000 -Fields $fields)
  $inserted = 0
  $updated = 0
  $skipped = 0
  $seeded = @()

  foreach ($record in $SeedRecords) {
    $logicalKey = Get-SeedLogicalKey -Record $record
    $matches = @($existingItems | Where-Object {
        (Get-ItemTextValue -Item $_ -FieldName "ApplicationKey") -eq [string]$record.ApplicationKey -and
        (Get-ItemTextValue -Item $_ -FieldName "EnvironmentKey") -eq [string]$record.EnvironmentKey -and
        (Get-ItemTextValue -Item $_ -FieldName "ScopeKey") -eq [string]$record.ScopeKey -and
        (Get-ItemTextValue -Item $_ -FieldName "ConfigKey") -eq [string]$record.ConfigKey -and
        [bool]$_["IsActive"] -eq [bool]$record.IsActive
      })

    if ($matches.Count -eq 0) {
      if ($DryRun) {
        Add-SummaryAction -Actions $Actions -Target $logicalKey -Action "seed-record" -Result "would-create"
      } else {
        Add-PnPListItem -List $ListTitle -Values (Convert-SeedRecordToValues -Record $record) | Out-Null
        Add-SummaryAction -Actions $Actions -Target $logicalKey -Action "seed-record" -Result "created"
      }
      $inserted += 1
      $seeded += [ordered]@{ logicalKey = $logicalKey; result = if ($DryRun) { "would-create" } else { "created" } }
      continue
    }

    $item = $matches[0]
    $updates = @{}
    $values = Convert-SeedRecordToValues -Record $record
    foreach ($key in $values.Keys) {
      $newValue = $values[$key]
      if ($null -eq $newValue) { continue }
      $currentText = Get-ItemTextValue -Item $item -FieldName $key
      $newText = ([string]$newValue).Trim()
      if ([string]::IsNullOrWhiteSpace($currentText) -and -not [string]::IsNullOrWhiteSpace($newText)) {
        $updates[$key] = $newValue
      } elseif ($ForceUpdateSeedValues -and $currentText -ne $newText) {
        $updates[$key] = $newValue
      }
    }

    if ($updates.Keys.Count -eq 0) {
      Add-SummaryAction -Actions $Actions -Target $logicalKey -Action "seed-record" -Result "skipped" -Detail "existing record preserved"
      $skipped += 1
      $seeded += [ordered]@{ logicalKey = $logicalKey; result = "skipped" }
    } elseif ($DryRun) {
      Add-SummaryAction -Actions $Actions -Target $logicalKey -Action "seed-record" -Result "would-update" -Detail (($updates.Keys | Sort-Object) -join ", ")
      $updated += 1
      $seeded += [ordered]@{ logicalKey = $logicalKey; result = "would-update"; fields = @($updates.Keys | Sort-Object) }
    } else {
      Set-PnPListItem -List $ListTitle -Identity $item.Id -Values $updates | Out-Null
      Add-SummaryAction -Actions $Actions -Target $logicalKey -Action "seed-record" -Result "updated" -Detail (($updates.Keys | Sort-Object) -join ", ")
      $updated += 1
      $seeded += [ordered]@{ logicalKey = $logicalKey; result = "updated"; fields = @($updates.Keys | Sort-Object) }
    }
  }

  return [ordered]@{
    inserted = $inserted
    updated = $updated
    skipped = $skipped
    records = $seeded
  }
}

$actions = [System.Collections.Generic.List[object]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()
$listCreated = $false
$listUrl = ""
$fieldCount = 0
$indexCount = 0
$seedResult = [ordered]@{ inserted = 0; updated = 0; skipped = 0; records = @() }

Write-Host "Connecting to $SiteUrl with app ID $AppId ($AuthMode)."
Connect-RegistryTenant

$list = Get-PnPList -Identity $ListTitle -Includes Id,Title,RootFolder,ItemCount -ErrorAction SilentlyContinue
if ($null -eq $list) {
  if ($DryRun) {
    Add-SummaryAction -Actions $actions -Target $ListTitle -Action "create-list" -Result "would-create" -Detail $ListInternalKey
  } else {
    New-PnPList -Title $ListTitle -Template GenericList -OnQuickLaunch:$false | Out-Null
    $listCreated = $true
    Add-SummaryAction -Actions $actions -Target $ListTitle -Action "create-list" -Result "created" -Detail $ListInternalKey
    $list = Get-PnPList -Identity $ListTitle -Includes Id,Title,RootFolder,ItemCount
  }
} else {
  Add-SummaryAction -Actions $actions -Target $ListTitle -Action "verify-list" -Result "exists"
}

if (-not $DryRun -and $null -ne $list) {
  try {
    Set-PnPList -Identity $ListTitle -EnableVersioning:$true -EnableAttachments:$false -EnableFolderCreation:$false -EnableContentTypes:$false | Out-Null
  } catch {
    Set-PnPList -Identity $ListTitle -Values @{ EnableVersioning = $true; EnableAttachments = $false; EnableFolderCreation = $false; ContentTypesEnabled = $false } | Out-Null
  }
  Set-PnPField -List $ListTitle -Identity "Title" -Values @{ Required = $true; Title = "Config Name" } | Out-Null
  Add-SummaryAction -Actions $actions -Target $ListTitle -Action "normalize-list-settings" -Result "updated"
}

if ($DryRun -and $null -eq $list) {
  foreach ($fieldDef in $FieldDefs) {
    Add-SummaryAction -Actions $actions -Target $fieldDef.InternalName -Action "create-field" -Result "would-create" -Detail "type=$($fieldDef.Type)"
    if ($fieldDef.ContainsKey("Indexed") -and [bool]$fieldDef.Indexed) {
      Add-SummaryAction -Actions $actions -Target $fieldDef.InternalName -Action "create-index" -Result "would-create"
    }
  }
} else {
  foreach ($fieldDef in $FieldDefs) {
    Ensure-RegistryField -Def $fieldDef -Actions $actions -Warnings $warnings
  }
}

if ($Seed) {
  if ($DryRun -and $null -eq $list) {
    foreach ($record in $SeedRecords) {
      Add-SummaryAction -Actions $actions -Target (Get-SeedLogicalKey -Record $record) -Action "seed-record" -Result "would-create"
    }
    $seedResult = [ordered]@{
      inserted = $SeedRecords.Count
      updated = 0
      skipped = 0
      records = @($SeedRecords | ForEach-Object { [ordered]@{ logicalKey = Get-SeedLogicalKey -Record $_; result = "would-create" } })
    }
  } else {
    $seedResult = Seed-RegistryRecords -Actions $actions -Warnings $warnings
  }
}

if (-not $DryRun) {
  $finalList = Get-PnPList -Identity $ListTitle -Includes Id,Title,RootFolder,ItemCount
  $listUrl = [string]$finalList.RootFolder.ServerRelativeUrl
  $fields = @(Get-PnPField -List $ListTitle)
  $fieldCount = @($fields | Where-Object { -not [bool]$_.Hidden }).Count
  $indexCount = @($fields | Where-Object { [bool]$_.Indexed }).Count
} else {
  $listUrl = "/sites/HBCentral/Lists/$ListTitle"
  $fieldCount = $FieldDefs.Count + 1
  $indexCount = @($FieldDefs | Where-Object { $_.ContainsKey("Indexed") -and [bool]$_.Indexed }).Count
}

$summary = [ordered]@{
  generatedUtc = (Get-Date).ToUniversalTime().ToString("o")
  mode = if ($DryRun) { "dry-run" } else { "live" }
  targetSite = $SiteUrl
  appId = $AppId
  tenant = $Tenant
  authMode = $AuthMode
  listTitle = $ListTitle
  listInternalKey = $ListInternalKey
  listCreated = $listCreated
  listUrl = $listUrl
  fieldCount = $fieldCount
  indexCount = $indexCount
  seedRequested = [bool]$Seed
  seedSummary = $seedResult
  warningCount = $warnings.Count
  warnings = @($warnings)
  actions = @($actions)
}

$summary | ConvertTo-Json -Depth 20 | Set-Content -Path $SummaryJsonPath -Encoding UTF8

$dryRunArg = if ($DryRun) { " -DryRun" } else { "" }
$seedArg = if ($Seed) { " -Seed" } else { "" }
$commandText = "pwsh tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1 -SiteUrl `"$SiteUrl`" -AppId `"$AppId`" -Tenant `"$Tenant`" -EnvironmentKey `"$EnvironmentKey`"$dryRunArg$seedArg"

$proofLines = @(
  "# HB Platform Configuration Registry Provisioning Proof",
  "",
  "- Generated UTC: $($summary.generatedUtc)",
  "- Mode: $($summary.mode)",
  "- Command run: $commandText",
  "- Target site: $SiteUrl",
  "- App ID used: $AppId",
  "- Tenant: $Tenant",
  "- List title: $ListTitle",
  "- List URL: $listUrl",
  "- Field count: $fieldCount",
  "- Index count: $indexCount",
  "- Seeded record count: inserted=$($seedResult.inserted), updated=$($seedResult.updated), skipped=$($seedResult.skipped)",
  "- Validation warnings: $($warnings.Count)",
  "",
  "## Warnings",
  ""
)
if ($warnings.Count -eq 0) {
  $proofLines += "- None."
} else {
  foreach ($warning in $warnings) {
    $proofLines += "- $warning"
  }
}
$proofLines += @(
  "",
  "## Next Manual Steps",
  "",
  "- Run `validate-platform-configuration-registry.ps1` after live provisioning.",
  "- Populate blocked placeholder records only after tenant/API validation confirms the correct values.",
  "- Keep secrets outside SharePoint; only store reference names.",
  "",
  "## Summary JSON",
  "",
  "- $SummaryJsonPath"
)
$proofLines | Set-Content -Path $ProofPath -Encoding UTF8

Write-Host ""
Write-Host "Summary JSON: $SummaryJsonPath"
Write-Host "Proof: $ProofPath"
Write-Host "Warnings: $($warnings.Count)"
