# provision-versioned-record.ps1
# Provisions the HbcVersionSnapshots SharePoint list in the root site collection.
# Run once per environment (dev, staging, prod).
# Prerequisites: PnP PowerShell module, appropriate SP admin permissions.

param(
  [Parameter(Mandatory=$true)]
  [string]$SiteUrl,

  [string]$ListTitle = "HbcVersionSnapshots"
)

Connect-PnPOnline -Url $SiteUrl -UseWebLogin

# Create the list if it does not exist
$list = Get-PnPList -Identity $ListTitle -ErrorAction SilentlyContinue
if (-not $list) {
  New-PnPList -Title $ListTitle -Template GenericList -OnQuickLaunch:$false
  Write-Host "Created list: $ListTitle"
}

# Add columns
$columns = @(
  @{ Name = "SnapshotId";          Type = "Text";     MaxLength = 100;  Description = "GUID primary key" },
  @{ Name = "RecordType";          Type = "Choice";   Choices = @("bd-scorecard","project-pmp","bd-intelligence","pursuit","handoff"); Description = "Record type namespace" },
  @{ Name = "RecordId";            Type = "Text";     MaxLength = 100;  Description = "Parent record identifier" },
  @{ Name = "Version";             Type = "Number";                     Description = "Auto-incremented version per RecordId" },
  @{ Name = "Tag";                 Type = "Choice";   Choices = @("draft","submitted","approved","rejected","archived","handoff","superseded"); Description = "Workflow tag at snapshot time" },
  @{ Name = "ChangeSummary";       Type = "Note";     UnlimitedLength = $true; Description = "Human or auto-generated summary" },
  @{ Name = "CreatedByUserId";     Type = "Text";     MaxLength = 200;  Description = "Author user ID" },
  @{ Name = "CreatedByDisplayName";Type = "Text";     MaxLength = 200;  Description = "Author display name" },
  @{ Name = "CreatedByRole";       Type = "Text";     MaxLength = 200;  Description = "Author role at time of creation" },
  @{ Name = "CreatedAt";           Type = "DateTime";                   Description = "UTC ISO 8601 creation timestamp" },
  @{ Name = "SnapshotJson";        Type = "Note";     UnlimitedLength = $true; Description = "Full JSON snapshot or ref:<fileLibraryPath> for large payloads" }
)

foreach ($col in $columns) {
  $existing = Get-PnPField -List $ListTitle -Identity $col.Name -ErrorAction SilentlyContinue
  if (-not $existing) {
    $params = @{
      List        = $ListTitle
      DisplayName = $col.Name
      InternalName = $col.Name
      Type        = $col.Type
    }
    if ($col.MaxLength)   { $params.MaxLength = $col.MaxLength }
    if ($col.Choices)     { $params.Choices   = $col.Choices   }
    Add-PnPField @params
    Write-Host "Added column: $($col.Name)"
  } else {
    Write-Host "Column already exists: $($col.Name)"
  }
}

# Create index on RecordType + RecordId for fast filtered queries
$indexFields = @("RecordType", "RecordId")
foreach ($f in $indexFields) {
  $field = Get-PnPField -List $ListTitle -Identity $f
  Set-PnPField -List $ListTitle -Identity $field.Id -Values @{ Indexed = $true }
  Write-Host "Indexed field: $f"
}

# Create the Snapshots folder in Shared Documents for large payload storage
$folderPath = "Shared Documents/System/Snapshots"
$folder = Get-PnPFolder -Url $folderPath -ErrorAction SilentlyContinue
if (-not $folder) {
  Add-PnPFolder -Name "Snapshots" -Folder "Shared Documents/System"
  Write-Host "Created file library folder: $folderPath"
}

Write-Host "HbcVersionSnapshots provisioning complete."
Disconnect-PnPOnline
