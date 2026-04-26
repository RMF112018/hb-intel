[CmdletBinding()]
param(
  [string]$SiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral",
  [string]$AppId = "08c399eb-a394-4087-b859-659d493f8dc7",
  [string]$Tenant = "hedrickbrothers.com",
  [ValidateSet("DeviceLogin", "Interactive")] [string]$AuthMode = "DeviceLogin",
  [string]$EnvironmentKey = "Production",
  [switch]$ReadOnly,
  [string]$OutputDir = "",
  [string]$ProofPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ListTitle = "HB Platform Configuration Registry"
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
  $ProofPath = Join-Path $OutputDir "platform-config-registry-validation-$RunStamp.md"
}
$SummaryJsonPath = [System.IO.Path]::ChangeExtension($ProofPath, ".json")

$ExpectedFields = @(
  @{ InternalName = "Title"; Type = "Text"; Required = $true; Indexed = $false },
  @{ InternalName = "ApplicationKey"; Type = "Choice"; Required = $true; Indexed = $true },
  @{ InternalName = "EnvironmentKey"; Type = "Choice"; Required = $true; Indexed = $true },
  @{ InternalName = "ScopeKey"; Type = "Text"; Required = $false; Indexed = $true },
  @{ InternalName = "ConfigKey"; Type = "Text"; Required = $true; Indexed = $true },
  @{ InternalName = "ConfigValue"; Type = "Note"; Required = $false; Indexed = $false },
  @{ InternalName = "ConfigValueJson"; Type = "Note"; Required = $false; Indexed = $false },
  @{ InternalName = "ValueType"; Type = "Choice"; Required = $true; Indexed = $false },
  @{ InternalName = "IsRequired"; Type = "Boolean"; Required = $true; Indexed = $false },
  @{ InternalName = "IsSecretReference"; Type = "Boolean"; Required = $true; Indexed = $true },
  @{ InternalName = "SecretReferenceName"; Type = "Text"; Required = $false; Indexed = $false },
  @{ InternalName = "SiteUrl"; Type = "Text"; Required = $false; Indexed = $false },
  @{ InternalName = "ListTitle"; Type = "Text"; Required = $false; Indexed = $false },
  @{ InternalName = "ListGuid"; Type = "Text"; Required = $false; Indexed = $true },
  @{ InternalName = "WebId"; Type = "Text"; Required = $false; Indexed = $false },
  @{ InternalName = "TenantId"; Type = "Text"; Required = $false; Indexed = $false },
  @{ InternalName = "ManifestId"; Type = "Text"; Required = $false; Indexed = $true },
  @{ InternalName = "ExpectedPackageVersion"; Type = "Text"; Required = $false; Indexed = $false },
  @{ InternalName = "ApiBaseUrl"; Type = "Text"; Required = $false; Indexed = $false },
  @{ InternalName = "ApiResource"; Type = "Text"; Required = $false; Indexed = $false },
  @{ InternalName = "AcceptedOrigins"; Type = "Note"; Required = $false; Indexed = $false },
  @{ InternalName = "ValidationRule"; Type = "Note"; Required = $false; Indexed = $false },
  @{ InternalName = "ValidationStatus"; Type = "Choice"; Required = $true; Indexed = $true },
  @{ InternalName = "LastValidatedAt"; Type = "DateTime"; Required = $false; Indexed = $false },
  @{ InternalName = "OwnerGroup"; Type = "Text"; Required = $false; Indexed = $false },
  @{ InternalName = "AdminNotes"; Type = "Note"; Required = $false; Indexed = $false },
  @{ InternalName = "IsActive"; Type = "Boolean"; Required = $true; Indexed = $true },
  @{ InternalName = "EffectiveFrom"; Type = "DateTime"; Required = $false; Indexed = $true },
  @{ InternalName = "EffectiveThrough"; Type = "DateTime"; Required = $false; Indexed = $true },
  @{ InternalName = "LastUpdatedBy"; Type = "User"; Required = $false; Indexed = $false },
  @{ InternalName = "LastUpdatedAt"; Type = "DateTime"; Required = $false; Indexed = $true }
)

$ExpectedSeedKeys = @(
  "Foleon|$EnvironmentKey|Marketing-New|MarketingNewHostPageUrl|True",
  "Foleon|$EnvironmentKey|HBCentral|HBCentralHubSiteUrl|True",
  "Foleon|$EnvironmentKey|SPFx|ExpectedManifestId|True",
  "Foleon|$EnvironmentKey|SPFx|AcceptedFoleonOrigins|True",
  "Foleon|$EnvironmentKey|HBCentral|FoleonContentRegistryListGuid|True",
  "Foleon|$EnvironmentKey|HBCentral|FoleonHomepagePlacementsListGuid|True",
  "Foleon|$EnvironmentKey|HBCentral|FoleonInteractionEventsListGuid|True",
  "Foleon|$EnvironmentKey|HBCentral|FoleonSyncRunsListGuid|True",
  "Foleon|$EnvironmentKey|Backend|FoleonApiBaseUrl|True",
  "Foleon|$EnvironmentKey|Backend|FoleonApiResource|True",
  "Homepage|$EnvironmentKey|SPFx|HomepageExpectedPackageVersion|True",
  "Foleon|$EnvironmentKey|SPFx|FoleonExpectedPackageVersion|True",
  "FunctionApp|$EnvironmentKey|Backend|BackendFunctionAppUrl|True",
  "Foleon|$EnvironmentKey|Backend|FoleonClientSecret|True"
)

$ConfirmedBackendBaseUrl = "https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net"
$ConfirmedValueExpectations = @(
  @{ ApplicationKey = "Foleon"; ScopeKey = "HBCentral"; ConfigKey = "FoleonContentRegistryListGuid"; ConfigValue = "2e57615d-457e-49b8-aef3-038e85cbe068"; ListGuid = "2e57615d-457e-49b8-aef3-038e85cbe068"; ValueType = "Guid" },
  @{ ApplicationKey = "Foleon"; ScopeKey = "HBCentral"; ConfigKey = "FoleonHomepagePlacementsListGuid"; ConfigValue = "5b4754b6-9411-453d-8e16-1247ec5b476a"; ListGuid = "5b4754b6-9411-453d-8e16-1247ec5b476a"; ValueType = "Guid" },
  @{ ApplicationKey = "Foleon"; ScopeKey = "HBCentral"; ConfigKey = "FoleonInteractionEventsListGuid"; ConfigValue = "7786b5ac-d1e5-418b-9951-8e797dda3d7a"; ListGuid = "7786b5ac-d1e5-418b-9951-8e797dda3d7a"; ValueType = "Guid" },
  @{ ApplicationKey = "Foleon"; ScopeKey = "HBCentral"; ConfigKey = "FoleonSyncRunsListGuid"; ConfigValue = "f29dabe9-16c8-4c67-ab9e-98e12f771680"; ListGuid = "f29dabe9-16c8-4c67-ab9e-98e12f771680"; ValueType = "Guid" },
  @{ ApplicationKey = "FunctionApp"; ScopeKey = "Backend"; ConfigKey = "BackendFunctionAppUrl"; ConfigValue = $ConfirmedBackendBaseUrl; ApiBaseUrl = $ConfirmedBackendBaseUrl; ValueType = "Url" },
  @{ ApplicationKey = "Foleon"; ScopeKey = "Backend"; ConfigKey = "FoleonApiBaseUrl"; ConfigValue = $ConfirmedBackendBaseUrl; ApiBaseUrl = $ConfirmedBackendBaseUrl; ValueType = "Url" }
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

function Add-Check {
  param(
    [System.Collections.Generic.List[object]]$Checks,
    [string]$Name,
    [bool]$Passed,
    [string]$Detail = "",
    [string]$Severity = "error"
  )
  $Checks.Add([ordered]@{
    name = $Name
    passed = $Passed
    severity = $Severity
    detail = $Detail
  }) | Out-Null
  $prefix = if ($Passed) { "PASS" } elseif ($Severity -eq "warning") { "WARN" } else { "FAIL" }
  Write-Host "[$prefix] $Name $Detail"
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

function Get-ItemTextValue {
  param([object]$Item, [string]$FieldName)
  $value = $Item[$FieldName]
  if ($null -eq $value) { return "" }
  return ([string]$value).Trim()
}

function Read-Bool {
  param([object]$Value)
  if ($null -eq $Value) { return $false }
  if ($Value -is [bool]) { return [bool]$Value }
  $text = ([string]$Value).Trim().ToLowerInvariant()
  return $text -in @("1", "true", "yes")
}

function Get-LogicalKey {
  param([object]$Item)
  return "$(Get-ItemTextValue -Item $Item -FieldName "ApplicationKey")|$(Get-ItemTextValue -Item $Item -FieldName "EnvironmentKey")|$(Get-ItemTextValue -Item $Item -FieldName "ScopeKey")|$(Get-ItemTextValue -Item $Item -FieldName "ConfigKey")|$(Read-Bool $Item["IsActive"])"
}

function Test-SecretLikeValue {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return $false }
  $patterns = @(
    "-----BEGIN [A-Z ]+PRIVATE KEY-----",
    "(?i)\bclient_secret\b\s*[:=]",
    "(?i)\baccess_token\b\s*[:=]",
    "(?i)\brefresh_token\b\s*[:=]",
    "(?i)\bpassword\b\s*[:=]",
    "(?i)\bpasswd\b\s*[:=]",
    "(?i)\bpwd\b\s*[:=]",
    "(?i)\bbearer\s+[a-z0-9._\-]+",
    "(?i)\bsecret\s*[:=]\s*\S+"
  )
  foreach ($pattern in $patterns) {
    if ($Value -match $pattern) { return $true }
  }
  return $false
}

function Test-SecretLikeKey {
  param([string]$Key)
  if ([string]::IsNullOrWhiteSpace($Key)) { return $false }
  return $Key -match "(?i)(secret|password|passwd|token|credential|certificate|privatekey)"
}

function Test-GuidText {
  param([string]$Value)
  $parsed = [guid]::Empty
  return [guid]::TryParse($Value, [ref]$parsed)
}

function Test-BackendUrlText {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return $false }
  if (-not $Value.StartsWith("https://", [System.StringComparison]::OrdinalIgnoreCase)) { return $false }
  if ($Value -match "/api(/|$)") { return $false }
  return $true
}

$checks = [System.Collections.Generic.List[object]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()
$failures = [System.Collections.Generic.List[string]]::new()
$listUrl = ""
$fieldCount = 0
$indexCount = 0
$seedFoundCount = 0
$duplicateCount = 0
$secretIssueCount = 0
$readAccess = $false
$writeAccess = $false

Write-Host "Connecting to $SiteUrl with app ID $AppId ($AuthMode)."
Connect-RegistryTenant

$list = Get-PnPList -Identity $ListTitle -Includes Id,Title,RootFolder,ItemCount -ErrorAction SilentlyContinue
Add-Check -Checks $checks -Name "list exists" -Passed ($null -ne $list) -Detail $ListTitle
if ($null -eq $list) {
  $failures.Add("Registry list '$ListTitle' was not found.") | Out-Null
} else {
  $listUrl = [string]$list.RootFolder.ServerRelativeUrl
}

$fieldsByName = @{}
if ($null -ne $list) {
  $fields = @(Get-PnPField -List $ListTitle)
  foreach ($field in $fields) {
    $fieldsByName[[string]$field.InternalName] = $field
  }
  $fieldCount = @($fields | Where-Object { -not [bool]$_.Hidden }).Count
  $indexCount = @($fields | Where-Object { [bool]$_.Indexed }).Count

  foreach ($expected in $ExpectedFields) {
    $fieldExists = $fieldsByName.ContainsKey($expected.InternalName)
    Add-Check -Checks $checks -Name "field exists: $($expected.InternalName)" -Passed $fieldExists
    if (-not $fieldExists) {
      $failures.Add("Missing expected field: $($expected.InternalName).") | Out-Null
      continue
    }

    $field = $fieldsByName[$expected.InternalName]
    $expectedType = Get-ExpectedTypeAsString -Type $expected.Type
    $typeMatches = [string]$field.TypeAsString -eq $expectedType
    Add-Check -Checks $checks -Name "field type: $($expected.InternalName)" -Passed $typeMatches -Detail "actual=$($field.TypeAsString); expected=$expectedType"
    if (-not $typeMatches) {
      $failures.Add("Type mismatch for $($expected.InternalName): expected $expectedType, actual $($field.TypeAsString).") | Out-Null
    }

    $requiredMatches = [bool]$field.Required -eq [bool]$expected.Required
    Add-Check -Checks $checks -Name "required flag: $($expected.InternalName)" -Passed $requiredMatches -Detail "actual=$($field.Required); expected=$($expected.Required)"
    if (-not $requiredMatches) {
      $failures.Add("Required flag mismatch for $($expected.InternalName).") | Out-Null
    }

    if ([bool]$expected.Indexed) {
      $indexedMatches = [bool]$field.Indexed
      Add-Check -Checks $checks -Name "index exists: $($expected.InternalName)" -Passed $indexedMatches
      if (-not $indexedMatches) {
        $failures.Add("Missing expected index for $($expected.InternalName).") | Out-Null
      }
    }
  }
}

$items = @()
if ($null -ne $list) {
  try {
    $items = @(Get-PnPListItem -List $ListTitle -PageSize 2000 -Fields @(
          "Title", "ApplicationKey", "EnvironmentKey", "ScopeKey", "ConfigKey", "ConfigValue", "ConfigValueJson",
          "ValueType", "IsRequired", "IsSecretReference", "SecretReferenceName", "ListGuid", "ApiBaseUrl",
          "ValidationStatus", "IsActive"
        ))
    $readAccess = $true
    Add-Check -Checks $checks -Name "read capability" -Passed $true -Detail "items=$($items.Count)"
  } catch {
    Add-Check -Checks $checks -Name "read capability" -Passed $false -Detail $_.Exception.Message
    $failures.Add("Unable to read registry items: $($_.Exception.Message)") | Out-Null
  }
}

if ($readAccess) {
  $itemsByLogicalKey = @{}
  foreach ($item in $items) {
    $key = Get-LogicalKey -Item $item
    if (-not $itemsByLogicalKey.ContainsKey($key)) {
      $itemsByLogicalKey[$key] = @()
    }
    $itemsByLogicalKey[$key] += $item
  }

  foreach ($expectedKey in $ExpectedSeedKeys) {
    $found = $itemsByLogicalKey.ContainsKey($expectedKey)
    Add-Check -Checks $checks -Name "seed exists: $expectedKey" -Passed $found
    if ($found) {
      $seedFoundCount += 1
    } else {
      $failures.Add("Missing expected seed record: $expectedKey.") | Out-Null
    }
  }

  foreach ($expectedValue in $ConfirmedValueExpectations) {
    $expectedKey = "$($expectedValue.ApplicationKey)|$EnvironmentKey|$($expectedValue.ScopeKey)|$($expectedValue.ConfigKey)|True"
    $found = $itemsByLogicalKey.ContainsKey($expectedKey)
    Add-Check -Checks $checks -Name "confirmed value record exists: $expectedKey" -Passed $found
    if (-not $found) {
      $failures.Add("Missing confirmed-value record: $expectedKey.") | Out-Null
      continue
    }

    $item = $itemsByLogicalKey[$expectedKey][0]
    $configValue = Get-ItemTextValue -Item $item -FieldName "ConfigValue"
    $valueType = Get-ItemTextValue -Item $item -FieldName "ValueType"
    $apiBaseUrl = Get-ItemTextValue -Item $item -FieldName "ApiBaseUrl"
    $listGuid = Get-ItemTextValue -Item $item -FieldName "ListGuid"

    $configValueMatches = $configValue -eq [string]$expectedValue.ConfigValue
    Add-Check -Checks $checks -Name "confirmed ConfigValue: $($expectedValue.ConfigKey)" -Passed $configValueMatches
    if (-not $configValueMatches) {
      $failures.Add("$($expectedValue.ConfigKey): ConfigValue mismatch.") | Out-Null
    }

    $valueTypeMatches = $valueType -eq [string]$expectedValue.ValueType
    Add-Check -Checks $checks -Name "confirmed ValueType: $($expectedValue.ConfigKey)" -Passed $valueTypeMatches -Detail "actual=$valueType"
    if (-not $valueTypeMatches) {
      $failures.Add("$($expectedValue.ConfigKey): ValueType mismatch.") | Out-Null
    }

    if ($expectedValue.ValueType -eq "Guid") {
      $guidConfigValid = Test-GuidText -Value $configValue
      $listGuidMatches = $listGuid -eq [string]$expectedValue.ListGuid
      $listGuidValid = Test-GuidText -Value $listGuid
      Add-Check -Checks $checks -Name "confirmed GUID ConfigValue parses: $($expectedValue.ConfigKey)" -Passed $guidConfigValid
      Add-Check -Checks $checks -Name "confirmed ListGuid: $($expectedValue.ConfigKey)" -Passed ($listGuidMatches -and $listGuidValid)
      if (-not $guidConfigValid) {
        $failures.Add("$($expectedValue.ConfigKey): ConfigValue is not valid GUID text.") | Out-Null
      }
      if (-not ($listGuidMatches -and $listGuidValid)) {
        $failures.Add("$($expectedValue.ConfigKey): ListGuid mismatch or invalid GUID text.") | Out-Null
      }
    }

    if ($expectedValue.ValueType -eq "Url") {
      $configUrlValid = Test-BackendUrlText -Value $configValue
      $apiUrlMatches = $apiBaseUrl -eq [string]$expectedValue.ApiBaseUrl
      $apiUrlValid = Test-BackendUrlText -Value $apiBaseUrl
      Add-Check -Checks $checks -Name "confirmed backend ConfigValue URL: $($expectedValue.ConfigKey)" -Passed $configUrlValid
      Add-Check -Checks $checks -Name "confirmed ApiBaseUrl URL: $($expectedValue.ConfigKey)" -Passed ($apiUrlMatches -and $apiUrlValid)
      if (-not $configUrlValid) {
        $failures.Add("$($expectedValue.ConfigKey): ConfigValue must include https:// and must not include /api.") | Out-Null
      }
      if (-not ($apiUrlMatches -and $apiUrlValid)) {
        $failures.Add("$($expectedValue.ConfigKey): ApiBaseUrl mismatch or includes invalid URL shape.") | Out-Null
      }
    }
  }

  $activeGroups = $items | Where-Object { Read-Bool $_["IsActive"] } | Group-Object {
    "$(Get-ItemTextValue -Item $_ -FieldName "ApplicationKey")|$(Get-ItemTextValue -Item $_ -FieldName "EnvironmentKey")|$(Get-ItemTextValue -Item $_ -FieldName "ScopeKey")|$(Get-ItemTextValue -Item $_ -FieldName "ConfigKey")|True"
  }
  $duplicates = @($activeGroups | Where-Object { $_.Count -gt 1 })
  $duplicateCount = $duplicates.Count
  Add-Check -Checks $checks -Name "duplicate active logical keys" -Passed ($duplicateCount -eq 0) -Detail "duplicates=$duplicateCount"
  foreach ($duplicate in $duplicates) {
    $failures.Add("Duplicate active logical key: $($duplicate.Name) count=$($duplicate.Count).") | Out-Null
  }

  foreach ($item in $items) {
    $configKey = Get-ItemTextValue -Item $item -FieldName "ConfigKey"
    $configValue = Get-ItemTextValue -Item $item -FieldName "ConfigValue"
    $configValueJson = Get-ItemTextValue -Item $item -FieldName "ConfigValueJson"
    $isSecretReference = Read-Bool $item["IsSecretReference"]
    $secretReferenceName = Get-ItemTextValue -Item $item -FieldName "SecretReferenceName"
    $valueType = Get-ItemTextValue -Item $item -FieldName "ValueType"

    if (-not $isSecretReference -and ((Test-SecretLikeValue -Value $configValue) -or (Test-SecretLikeValue -Value $configValueJson))) {
      $secretIssueCount += 1
      $failures.Add("Secret-like value detected in non-secret record '$configKey'.") | Out-Null
    }

    if ((Test-SecretLikeKey -Key $configKey) -or $valueType -eq "SecretReference") {
      if (-not $isSecretReference) {
        $secretIssueCount += 1
        $failures.Add("Secret-like record '$configKey' must set IsSecretReference=true.") | Out-Null
      }
      if ([string]::IsNullOrWhiteSpace($secretReferenceName)) {
        $secretIssueCount += 1
        $failures.Add("Secret-like record '$configKey' must set SecretReferenceName.") | Out-Null
      }
      if (-not [string]::IsNullOrWhiteSpace($configValue) -or -not [string]::IsNullOrWhiteSpace($configValueJson)) {
        $secretIssueCount += 1
        $failures.Add("Secret-like record '$configKey' must not store ConfigValue or ConfigValueJson.") | Out-Null
      }
    }
  }
  Add-Check -Checks $checks -Name "secret storage hygiene" -Passed ($secretIssueCount -eq 0) -Detail "issues=$secretIssueCount"
}

if ($null -ne $list) {
  if ($ReadOnly) {
    $warnings.Add("Write probe skipped because -ReadOnly was provided.") | Out-Null
    Add-Check -Checks $checks -Name "write capability" -Passed $true -Severity "warning" -Detail "skipped by -ReadOnly"
  } else {
    $probeKey = "ValidatorWriteProbe-$([guid]::NewGuid().ToString())"
    try {
      $probeItem = Add-PnPListItem -List $ListTitle -Values @{
        Title = "Validation write probe"
        ApplicationKey = "Platform"
        EnvironmentKey = $EnvironmentKey
        ScopeKey = "Validation"
        ConfigKey = $probeKey
        ValueType = "String"
        IsRequired = $false
        IsSecretReference = $false
        ValidationStatus = "Not Validated"
        IsActive = $false
        AdminNotes = "Temporary validator write probe; deleted by validation script."
      }
      Remove-PnPListItem -List $ListTitle -Identity $probeItem.Id -Force
      $writeAccess = $true
      Add-Check -Checks $checks -Name "write capability" -Passed $true -Detail "temporary item add/delete succeeded"
    } catch {
      Add-Check -Checks $checks -Name "write capability" -Passed $false -Detail $_.Exception.Message
      $failures.Add("Unable to prove expected write access with temporary probe: $($_.Exception.Message)") | Out-Null
    }
  }
}

$manualActions = @(
  "Populate blocked placeholder values after tenant/API validation: Foleon list GUIDs, API base/resource, homepage package version, backend Function App URL.",
  "Confirm list permissions: platform admins manage, app/admin principal read/write as required, Foleon marketing read unless a scoped admin workflow requires otherwise, general employees no direct edit.",
  "Keep secret values outside SharePoint; SharePoint stores reference names only."
)

$summary = [ordered]@{
  generatedUtc = (Get-Date).ToUniversalTime().ToString("o")
  targetSite = $SiteUrl
  appId = $AppId
  tenant = $Tenant
  authMode = $AuthMode
  listTitle = $ListTitle
  listUrl = $listUrl
  fieldCount = $fieldCount
  indexCount = $indexCount
  itemCount = @($items).Count
  seededRecordCount = $seedFoundCount
  expectedSeedRecordCount = $ExpectedSeedKeys.Count
  duplicateActiveKeyCheck = if ($duplicateCount -eq 0) { "pass" } else { "fail" }
  secretStorageCheck = if ($secretIssueCount -eq 0) { "pass" } else { "fail" }
  readAccess = $readAccess
  writeAccess = $writeAccess
  warningCount = $warnings.Count
  warnings = @($warnings)
  failureCount = $failures.Count
  failures = @($failures)
  checks = @($checks)
  manualActions = $manualActions
}

$summary | ConvertTo-Json -Depth 20 | Set-Content -Path $SummaryJsonPath -Encoding UTF8

$commandText = "pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 -SiteUrl `"$SiteUrl`" -AppId `"$AppId`" -Tenant `"$Tenant`" -EnvironmentKey `"$EnvironmentKey`""

$proofLines = @(
  "# HB Platform Configuration Registry Validation Proof",
  "",
  "- Generated UTC: $($summary.generatedUtc)",
  "- Command run: $commandText",
  "- Target site: $SiteUrl",
  "- App ID used: $AppId",
  "- Tenant: $Tenant",
  "- List title: $ListTitle",
  "- List URL: $listUrl",
  "- Field count: $fieldCount",
  "- Index count: $indexCount",
  "- Seeded record count: $seedFoundCount / $($ExpectedSeedKeys.Count)",
  "- Duplicate active key check result: $($summary.duplicateActiveKeyCheck)",
  "- Secret storage check result: $($summary.secretStorageCheck)",
  "- Read access: $readAccess",
  "- Write access: $writeAccess",
  "- Validation warnings: $($warnings.Count)",
  "- Validation failures: $($failures.Count)",
  "",
  "## Failures",
  ""
)
if ($failures.Count -eq 0) {
  $proofLines += "- None."
} else {
  foreach ($failure in $failures) {
    $proofLines += "- $failure"
  }
}
$proofLines += @("", "## Warnings", "")
if ($warnings.Count -eq 0) {
  $proofLines += "- None."
} else {
  foreach ($warning in $warnings) {
    $proofLines += "- $warning"
  }
}
$proofLines += @("", "## Manual Actions", "")
foreach ($manualAction in $manualActions) {
  $proofLines += "- $manualAction"
}
$proofLines += @("", "## Summary JSON", "", "- $SummaryJsonPath")
$proofLines | Set-Content -Path $ProofPath -Encoding UTF8

Write-Host ""
Write-Host "Summary JSON: $SummaryJsonPath"
Write-Host "Proof: $ProofPath"
Write-Host "Failures: $($failures.Count)"
Write-Host "Warnings: $($warnings.Count)"

if ($failures.Count -gt 0) {
  exit 1
}
