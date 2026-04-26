[CmdletBinding()]
param(
  [string]$SiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral",
  [string]$AppId = "08c399eb-a394-4087-b859-659d493f8dc7",
  [string]$Tenant = "hedrickbrothers.com",
  [ValidateSet("DeviceLogin", "Interactive")] [string]$AuthMode = "DeviceLogin",
  [string]$EnvironmentKey = "Production",
  [switch]$DryRun,
  [string]$OutputDir = "",
  [string]$ProofPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ListTitle = "HB Platform Configuration Registry"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$RunStartedUtc = (Get-Date).ToUniversalTime()
$RunStamp = $RunStartedUtc.ToString("yyyy-MM-dd-HHmmss")
$BackendBaseUrl = "https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net"

if ([string]::IsNullOrWhiteSpace($Tenant)) {
  throw "Tenant is required. Repo truth uses 'hedrickbrothers.com'; pass -Tenant explicitly if that changes."
}

if (-not $BackendBaseUrl.StartsWith("https://", [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Backend base URL must include https://."
}
if ($BackendBaseUrl -match "/api(/|$)") {
  throw "Backend base URL must not include /api."
}

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
  $OutputDir = Join-Path $RepoRoot "docs/architecture/plans/MASTER/platform/config-registry/proof"
}
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

if ([string]::IsNullOrWhiteSpace($ProofPath)) {
  $mode = if ($DryRun) { "dry-run" } else { "update" }
  $ProofPath = Join-Path $OutputDir "platform-config-registry-values-$mode-$RunStamp.md"
}
$SummaryJsonPath = [System.IO.Path]::ChangeExtension($ProofPath, ".json")

$GuidAdminNotes = "Populated with confirmed tenant list GUID after Prompt 00 provisioning. Pending registry-reader/runtime validation."
$FoleonApiAdminNotes = "Populated with confirmed Azure Function App default domain for Foleon runtime API access. Do not append /api; frontend service composes /api/foleon routes."
$BackendAdminNotes = "Populated with confirmed Azure Function App default domain. Do not append /api; frontend service composes /api/foleon routes."

$Targets = @(
  @{
    ConfigKey = "FoleonContentRegistryListGuid"
    ExpectedApplicationKey = "Foleon"
    ConfigValue = "2e57615d-457e-49b8-aef3-038e85cbe068"
    ListGuid = "2e57615d-457e-49b8-aef3-038e85cbe068"
    ValueType = "Guid"
    ValidationStatus = "Not Validated"
    AdminNotes = $GuidAdminNotes
  },
  @{
    ConfigKey = "FoleonHomepagePlacementsListGuid"
    ExpectedApplicationKey = "Foleon"
    ConfigValue = "5b4754b6-9411-453d-8e16-1247ec5b476a"
    ListGuid = "5b4754b6-9411-453d-8e16-1247ec5b476a"
    ValueType = "Guid"
    ValidationStatus = "Not Validated"
    AdminNotes = $GuidAdminNotes
  },
  @{
    ConfigKey = "FoleonInteractionEventsListGuid"
    ExpectedApplicationKey = "Foleon"
    ConfigValue = "7786b5ac-d1e5-418b-9951-8e797dda3d7a"
    ListGuid = "7786b5ac-d1e5-418b-9951-8e797dda3d7a"
    ValueType = "Guid"
    ValidationStatus = "Not Validated"
    AdminNotes = $GuidAdminNotes
  },
  @{
    ConfigKey = "FoleonSyncRunsListGuid"
    ExpectedApplicationKey = "Foleon"
    ConfigValue = "f29dabe9-16c8-4c67-ab9e-98e12f771680"
    ListGuid = "f29dabe9-16c8-4c67-ab9e-98e12f771680"
    ValueType = "Guid"
    ValidationStatus = "Not Validated"
    AdminNotes = $GuidAdminNotes
  },
  @{
    ConfigKey = "BackendFunctionAppUrl"
    ExpectedApplicationKey = "FunctionApp"
    ConfigValue = $BackendBaseUrl
    ApiBaseUrl = $BackendBaseUrl
    ValueType = "Url"
    ValidationStatus = "Not Validated"
    AdminNotes = $BackendAdminNotes
  },
  @{
    ConfigKey = "FoleonApiBaseUrl"
    ExpectedApplicationKey = "Foleon"
    ConfigValue = $BackendBaseUrl
    ApiBaseUrl = $BackendBaseUrl
    ValueType = "Url"
    ValidationStatus = "Not Validated"
    AdminNotes = $FoleonApiAdminNotes
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
    "(?i)\bbearer\s+[a-z0-9._\-]+",
    "(?i)\bsecret\s*[:=]\s*\S+"
  )
  foreach ($pattern in $patterns) {
    if ($Value -match $pattern) { return $true }
  }
  return $false
}

function Assert-GuidTarget {
  param([hashtable]$Target)
  if ($Target.ValueType -ne "Guid") { return $true }
  $parsed = [guid]::Empty
  return [guid]::TryParse([string]$Target.ConfigValue, [ref]$parsed)
}

function Assert-UrlTarget {
  param([hashtable]$Target)
  if ($Target.ValueType -ne "Url") { return $true }
  $value = [string]$Target.ConfigValue
  if (-not $value.StartsWith("https://", [System.StringComparison]::OrdinalIgnoreCase)) { return $false }
  if ($value -match "/api(/|$)") { return $false }
  return $true
}

function Get-UpdateValues {
  param([hashtable]$Target, [string]$LastUpdatedAt)
  $values = @{
    ConfigValue = $Target.ConfigValue
    ValueType = $Target.ValueType
    ValidationStatus = $Target.ValidationStatus
    AdminNotes = $Target.AdminNotes
    LastUpdatedAt = $LastUpdatedAt
  }
  if ($Target.ContainsKey("ListGuid")) {
    $values.ListGuid = $Target.ListGuid
  }
  if ($Target.ContainsKey("ApiBaseUrl")) {
    $values.ApiBaseUrl = $Target.ApiBaseUrl
  }
  return $values
}

Write-Host "Connecting to $SiteUrl with app ID $AppId ($AuthMode)."
Connect-RegistryTenant

$list = Get-PnPList -Identity $ListTitle -Includes Id,Title,RootFolder,ItemCount -ErrorAction SilentlyContinue
if ($null -eq $list) {
  throw "Registry list '$ListTitle' was not found."
}

$itemFields = @(
  "Title", "ApplicationKey", "EnvironmentKey", "ScopeKey", "ConfigKey", "ConfigValue", "ConfigValueJson", "ValueType",
  "IsSecretReference", "SecretReferenceName", "ListGuid", "ApiBaseUrl", "ValidationStatus", "AdminNotes", "IsActive", "LastUpdatedAt"
)
$items = @(Get-PnPListItem -List $ListTitle -PageSize 2000 -Fields $itemFields)

$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()
$updates = [System.Collections.Generic.List[object]]::new()
$updatedCount = 0
$lastUpdatedAt = (Get-Date).ToUniversalTime().ToString("o")

foreach ($target in $Targets) {
  if (-not (Assert-GuidTarget -Target $target)) {
    $errors.Add("$($target.ConfigKey): target value is not a valid GUID.") | Out-Null
    continue
  }
  if (-not (Assert-UrlTarget -Target $target)) {
    $errors.Add("$($target.ConfigKey): target URL must include https:// and must not include /api.") | Out-Null
    continue
  }

  $matches = @($items | Where-Object {
      (Get-ItemTextValue -Item $_ -FieldName "ApplicationKey") -eq [string]$target.ExpectedApplicationKey -and
      (Get-ItemTextValue -Item $_ -FieldName "EnvironmentKey") -eq $EnvironmentKey -and
      (Get-ItemTextValue -Item $_ -FieldName "ConfigKey") -eq [string]$target.ConfigKey -and
      (Read-Bool $_["IsActive"])
    })

  if ($matches.Count -eq 0) {
    $errors.Add("Missing active logical key: $($target.ExpectedApplicationKey)|$EnvironmentKey|<existing ScopeKey>|$($target.ConfigKey)|True. Stop before creating a new item; creation is recommended only if it matches the original seed pattern and no inactive canonical row exists.") | Out-Null
    continue
  }
  if ($matches.Count -gt 1) {
    $errors.Add("Duplicate active logical key for $($target.ConfigKey): expected 1 item, found $($matches.Count).") | Out-Null
    continue
  }

  $item = $matches[0]
  $scopeKey = Get-ItemTextValue -Item $item -FieldName "ScopeKey"
  $logicalKey = "$(Get-ItemTextValue -Item $item -FieldName "ApplicationKey")|$EnvironmentKey|$scopeKey|$($target.ConfigKey)|True"
  $values = Get-UpdateValues -Target $target -LastUpdatedAt $lastUpdatedAt
  $diffFields = @()
  foreach ($key in $values.Keys) {
    $current = Get-ItemTextValue -Item $item -FieldName $key
    $next = ([string]$values[$key]).Trim()
    if ($current -ne $next) {
      $diffFields += $key
    }
  }

  if ($DryRun) {
    Write-Host "[would-update] $logicalKey :: $($diffFields.Count) field change(s)"
  } else {
    Set-PnPListItem -List $ListTitle -Identity $item.Id -Values $values | Out-Null
    Write-Host "[updated] $logicalKey :: $($diffFields.Count) field change(s)"
  }

  $updatedCount += 1
  $updates.Add([ordered]@{
    configKey = [string]$target.ConfigKey
    logicalKey = $logicalKey
    itemId = $item.Id
    scopeKey = $scopeKey
    result = if ($DryRun) { "would-update" } else { "updated" }
    changedFields = @($diffFields | Sort-Object)
    targetValues = $values
  }) | Out-Null
}

$activeGroups = $items | Where-Object { Read-Bool $_["IsActive"] } | Group-Object { Get-LogicalKey -Item $_ }
$duplicateGroups = @($activeGroups | Where-Object { $_.Count -gt 1 })
foreach ($duplicate in $duplicateGroups) {
  $errors.Add("Duplicate active logical key remains: $($duplicate.Name) count=$($duplicate.Count).") | Out-Null
}

$secretRows = @($items | Where-Object {
    (Get-ItemTextValue -Item $_ -FieldName "ConfigKey") -match "(?i)(secret|password|token|credential|certificate|privatekey)" -or
    (Get-ItemTextValue -Item $_ -FieldName "ValueType") -eq "SecretReference"
  })
$secretIssues = [System.Collections.Generic.List[string]]::new()
foreach ($row in $secretRows) {
  $configKey = Get-ItemTextValue -Item $row -FieldName "ConfigKey"
  $isSecretReference = Read-Bool $row["IsSecretReference"]
  $secretReferenceName = Get-ItemTextValue -Item $row -FieldName "SecretReferenceName"
  $configValue = Get-ItemTextValue -Item $row -FieldName "ConfigValue"
  $configValueJson = Get-ItemTextValue -Item $row -FieldName "ConfigValueJson"
  if (-not $isSecretReference) {
    $secretIssues.Add("${configKey}: IsSecretReference is not true.") | Out-Null
  }
  if ([string]::IsNullOrWhiteSpace($secretReferenceName)) {
    $secretIssues.Add("${configKey}: SecretReferenceName is blank.") | Out-Null
  }
  if (-not [string]::IsNullOrWhiteSpace($configValue) -or -not [string]::IsNullOrWhiteSpace($configValueJson)) {
    $secretIssues.Add("${configKey}: secret reference row stores ConfigValue or ConfigValueJson.") | Out-Null
  }
}

foreach ($item in $items) {
  if ((Test-SecretLikeValue -Value (Get-ItemTextValue -Item $item -FieldName "ConfigValue")) -or
      (Test-SecretLikeValue -Value (Get-ItemTextValue -Item $item -FieldName "ConfigValueJson"))) {
    $secretConfigKey = Get-ItemTextValue -Item $item -FieldName "ConfigKey"
    $secretIssues.Add("Secret-like value detected in ${secretConfigKey}.") | Out-Null
  }
}
foreach ($issue in $secretIssues) {
  $errors.Add($issue) | Out-Null
}

if ($updatedCount -ne 6) {
  $errors.Add("Expected exactly six intended updates; observed $updatedCount.") | Out-Null
}

if ($errors.Count -gt 0 -and -not $DryRun) {
  throw "Unexpected post-update error state after mutation: $($errors -join '; ')"
}

$summary = [ordered]@{
  generatedUtc = (Get-Date).ToUniversalTime().ToString("o")
  mode = if ($DryRun) { "dry-run" } else { "live" }
  targetSite = $SiteUrl
  appId = $AppId
  tenant = $Tenant
  authMode = $AuthMode
  listTitle = $ListTitle
  listUrl = [string]$list.RootFolder.ServerRelativeUrl
  intendedUpdateCount = $updatedCount
  expectedUpdateCount = 6
  updates = @($updates)
  guidParseCheck = if (@($Targets | Where-Object { $_.ValueType -eq "Guid" -and -not (Assert-GuidTarget -Target $_) }).Count -eq 0) { "pass" } else { "fail" }
  backendUrlCheck = if (@($Targets | Where-Object { $_.ValueType -eq "Url" -and -not (Assert-UrlTarget -Target $_) }).Count -eq 0) { "pass" } else { "fail" }
  duplicateActiveKeyCheck = if ($duplicateGroups.Count -eq 0) { "pass" } else { "fail" }
  secretHygieneCheck = if ($secretIssues.Count -eq 0) { "pass" } else { "fail" }
  foleonClientSecretReferenceOnly = if (@($secretIssues | Where-Object { $_ -match "^FoleonClientSecret:" }).Count -eq 0) { "pass" } else { "fail" }
  warningCount = $warnings.Count
  warnings = @($warnings)
  errorCount = $errors.Count
  errors = @($errors)
}

$summary | ConvertTo-Json -Depth 20 | Set-Content -Path $SummaryJsonPath -Encoding UTF8

$dryRunArg = if ($DryRun) { " -DryRun" } else { "" }
$commandText = "pwsh tools/pnp-runner-local/scripts/update-platform-configuration-registry-values.ps1 -SiteUrl `"$SiteUrl`" -AppId `"$AppId`" -Tenant `"$Tenant`" -EnvironmentKey `"$EnvironmentKey`"$dryRunArg"

$proofLines = @(
  "# HB Platform Configuration Registry Value Update Proof",
  "",
  "- Generated UTC: $($summary.generatedUtc)",
  "- Mode: $($summary.mode)",
  "- Command run: $commandText",
  "- Target site: $SiteUrl",
  "- App ID used: $AppId",
  "- Tenant: $Tenant",
  "- List title: $ListTitle",
  "- List URL: $($summary.listUrl)",
  "- Intended updates: $updatedCount / 6",
  "- GUID parse check: $($summary.guidParseCheck)",
  "- Backend URL check: $($summary.backendUrlCheck)",
  "- Duplicate active key check: $($summary.duplicateActiveKeyCheck)",
  "- Secret hygiene check: $($summary.secretHygieneCheck)",
  "- FoleonClientSecret reference-only check: $($summary.foleonClientSecretReferenceOnly)",
  "- Errors: $($errors.Count)",
  "- Warnings: $($warnings.Count)",
  "",
  "## Updated Records",
  ""
)
foreach ($update in $updates) {
  $changedFieldText = [string]::Join(", ", $update.changedFields)
  $proofLines += "- $($update.configKey): $($update.result); logical key $($update.logicalKey); fields $changedFieldText"
}

$proofLines += @("", "## Errors", "")
if ($errors.Count -eq 0) {
  $proofLines += "- None."
} else {
  foreach ($errorItem in $errors) {
    $proofLines += "- $errorItem"
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

$proofLines += @("", "## Summary JSON", "", "- $SummaryJsonPath")
$proofLines | Set-Content -Path $ProofPath -Encoding UTF8

Write-Host ""
Write-Host "Summary JSON: $SummaryJsonPath"
Write-Host "Proof: $ProofPath"
Write-Host "Intended updates: $updatedCount / 6"
Write-Host "Errors: $($errors.Count)"
Write-Host "Warnings: $($warnings.Count)"

if ($errors.Count -gt 0) {
  exit 1
}
