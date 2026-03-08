<#
.SYNOPSIS
    Creates or updates HBCDocumentRegistry and HBCMigrationLog lists.
    Idempotent — existing lists are updated, not recreated.
#>
param([Parameter(Mandatory)][string]$SiteUrl)

Connect-PnPOnline -Url $SiteUrl -UseWebLogin

#region HBCDocumentRegistry
$registryList = Get-PnPList -Identity "HBCDocumentRegistry" -ErrorAction SilentlyContinue
if (-not $registryList) {
    $registryList = New-PnPList -Title "HBCDocumentRegistry" -Template GenericList -OnQuickLaunch:$false
    Write-Host "    Created list: HBCDocumentRegistry"
} else {
    Write-Host "    List exists, updating columns: HBCDocumentRegistry"
}

$regColumns = @(
    @{ InternalName="HbcModuleType";      DisplayName="Module Type";         Type="Choice";          Required=$true;  Choices=@("bd-lead","estimating-pursuit","project","system") },
    @{ InternalName="HbcRecordId";        DisplayName="Record ID";           Type="Text";            Required=$true },
    @{ InternalName="HbcProjectId";       DisplayName="Project ID";          Type="Text";            Required=$false },
    @{ InternalName="HbcDocumentId";      DisplayName="Document ID";         Type="Text";            Required=$true },
    @{ InternalName="HbcFileName";        DisplayName="File Name";           Type="Text";            Required=$true },
    @{ InternalName="HbcFolderName";      DisplayName="Folder Name";         Type="Text";            Required=$true },
    @{ InternalName="HbcFileSize";        DisplayName="File Size";           Type="Number";          Required=$true },
    @{ InternalName="HbcMimeType";        DisplayName="MIME Type";           Type="Text";            Required=$false },
    @{ InternalName="HbcSharePointUrl";   DisplayName="SharePoint URL";      Type="URL";             Required=$true },
    @{ InternalName="HbcStagingUrl";      DisplayName="Staging URL";         Type="URL";             Required=$true },
    @{ InternalName="HbcMigratedUrl";     DisplayName="Migrated URL";        Type="URL";             Required=$false },
    @{ InternalName="HbcMigrationStatus"; DisplayName="Migration Status";    Type="Choice";          Required=$true;  Choices=@("pending","scheduled","in-progress","migrated","conflict","failed","not-applicable") },
    @{ InternalName="HbcTombstoneUrl";    DisplayName="Tombstone URL";       Type="URL";             Required=$false },
    @{ InternalName="HbcConflictResolution"; DisplayName="Conflict Resolution"; Type="Choice";       Required=$false; Choices=@("keep-staging","keep-project","keep-both","pending","auto-project-site-wins") },
    @{ InternalName="HbcConflictResolvedBy"; DisplayName="Conflict Resolved By"; Type="User";       Required=$false },
    @{ InternalName="HbcUploadedBy";      DisplayName="Uploaded By";         Type="User";            Required=$true },
    @{ InternalName="HbcUploadedAt";      DisplayName="Uploaded At";         Type="DateTime";        Required=$true },
    @{ InternalName="HbcMigratedAt";      DisplayName="Migrated At";         Type="DateTime";        Required=$false },
    @{ InternalName="HbcDisplayName";     DisplayName="Display Name";        Type="Text";            Required=$true }
)

foreach ($col in $regColumns) {
    $existing = Get-PnPField -List $registryList -Identity $col.InternalName -ErrorAction SilentlyContinue
    if (-not $existing) {
        $params = @{
            List        = $registryList
            InternalName = $col.InternalName
            DisplayName = $col.DisplayName
            Type        = $col.Type
            Required    = $col.Required
        }
        if ($col.Choices) { $params.Choices = $col.Choices }
        Add-PnPField @params | Out-Null
        Write-Host "      + Column added: $($col.InternalName)"
    }
}

# Add indexes to support queries beyond 5,000 items
$indexedFields = @("HbcModuleType","HbcRecordId","HbcProjectId","HbcDocumentId","HbcMigrationStatus","HbcUploadedAt")
foreach ($fieldName in $indexedFields) {
    $field = Get-PnPField -List $registryList -Identity $fieldName
    if (-not $field.Indexed) {
        Set-PnPField -List $registryList -Identity $fieldName -Values @{ Indexed = $true }
        Write-Host "      + Index added: $fieldName"
    }
}
#endregion

#region HBCMigrationLog
$logList = Get-PnPList -Identity "HBCMigrationLog" -ErrorAction SilentlyContinue
if (-not $logList) {
    $logList = New-PnPList -Title "HBCMigrationLog" -Template GenericList -OnQuickLaunch:$false
    Write-Host "    Created list: HBCMigrationLog"
}

$logColumns = @(
    @{ InternalName="HbcJobId";         DisplayName="Job ID";               Type="Text";    Required=$true },
    @{ InternalName="HbcRecordId";      DisplayName="Record ID";            Type="Text";    Required=$true },
    @{ InternalName="HbcDocumentId";    DisplayName="Document ID";          Type="Text";    Required=$true },
    @{ InternalName="HbcCheckpoint";    DisplayName="File Checkpoint";      Type="Choice";  Required=$true; Choices=@("pending","in-progress","completed","failed","skipped-conflict") },
    @{ InternalName="HbcAttemptNumber"; DisplayName="Attempt Number";       Type="Number";  Required=$true },
    @{ InternalName="HbcAttemptedAt";   DisplayName="Attempted At";         Type="DateTime";Required=$true },
    @{ InternalName="HbcErrorMessage";  DisplayName="Error Message";        Type="Note";    Required=$false },
    @{ InternalName="HbcScheduledWindow"; DisplayName="Scheduled Window";   Type="Text";    Required=$true },
    @{ InternalName="HbcNotifiedPM";    DisplayName="Pre-notification Sent";Type="Boolean"; Required=$true },
    @{ InternalName="HbcEscalated";     DisplayName="Escalated to Director";Type="Boolean"; Required=$true }
)

foreach ($col in $logColumns) {
    $existing = Get-PnPField -List $logList -Identity $col.InternalName -ErrorAction SilentlyContinue
    if (-not $existing) {
        $params = @{ List=$logList; InternalName=$col.InternalName; DisplayName=$col.DisplayName; Type=$col.Type; Required=$col.Required }
        if ($col.Choices) { $params.Choices = $col.Choices }
        Add-PnPField @params | Out-Null
        Write-Host "      + Column added: $($col.InternalName)"
    }
}
#endregion

Disconnect-PnPOnline
