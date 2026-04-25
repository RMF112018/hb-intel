---
generated_utc: 2026-04-25T08:26:30Z
package: HB Intel Foleon SPFx list provisioning remediation
repo: RMF112018/hb-intel
target_package_version_observed: 1.0.11.0
uploaded_sppkg_sha256_observed: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
source_audit_basis: Foleon list provisioning audit package generated from current repo/package inspection
---


# 04 — Wave 04 Prompt: Tenant Cleanup and Repair

You are working after clean-site validation has either passed or produced enough evidence to distinguish package defects from tenant residue.

## Objective

Safely address existing corrupted Foleon lists in the tenant without losing data or confusing package closure with corrupted-site closure.

## Important Rule

Do not delete production or production-like lists until data and metadata have been exported and reviewed.

## Required Inputs

- Broken target site URL.
- Whether the site is test, staging, production-like, or production.
- App catalog package version.
- Installed site app version.
- List URLs and list GUIDs.
- Whether any list contains data.
- Clean-site validation result.

## Evidence Capture Before Cleanup

```powershell
$SiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/<BROKEN-SITE>"
$Lists = @(
  "Foleon Content Registry",
  "Foleon Homepage Placements",
  "Foleon Interaction Events",
  "Foleon Sync Runs"
)

Connect-PnPOnline -Url $SiteUrl -Interactive
```

### Capture App Evidence

```powershell
Get-PnPApp | Where-Object { $_.Title -like "*Foleon*" } |
  Select-Object Title, Id, AppCatalogVersion, InstalledVersion, Deployed, Enabled |
  Format-List
```

### Capture List Evidence

```powershell
foreach ($ListTitle in $Lists) {
  Write-Host "==== $ListTitle ===="
  try {
    $list = Get-PnPList -Identity $ListTitle -Includes Id,Title,RootFolder,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount
    $list | Select-Object Id,Title,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount
    $list.RootFolder.ServerRelativeUrl
  } catch {
    Write-Host "FAILED LIST: $($_.Exception.Message)" -ForegroundColor Red
  }
}
```

### Capture Field Metadata

```powershell
foreach ($ListTitle in $Lists) {
  try {
    Get-PnPField -List $ListTitle |
      Select-Object InternalName, Title, TypeAsString, Required, Indexed, EnforceUniqueValues, Hidden, ReadOnlyField, Sealed |
      Sort-Object InternalName |
      Export-Csv ".\before-cleanup-$($ListTitle -replace ' ', '-')-fields.csv" -NoTypeInformation
  } catch {
    Write-Host "FAILED FIELDS: $ListTitle -- $($_.Exception.Message)" -ForegroundColor Red
  }
}
```

### Capture View Metadata

```powershell
foreach ($ListTitle in $Lists) {
  try {
    Get-PnPView -List $ListTitle |
      Select-Object Title, Id, ServerRelativeUrl, DefaultView, Hidden, RowLimit |
      Export-Csv ".\before-cleanup-$($ListTitle -replace ' ', '-')-views.csv" -NoTypeInformation
  } catch {
    Write-Host "FAILED VIEWS: $ListTitle -- $($_.Exception.Message)" -ForegroundColor Red
  }
}
```

### Capture Data

```powershell
foreach ($ListTitle in $Lists) {
  try {
    Get-PnPListItem -List $ListTitle -PageSize 500 |
      Export-Clixml ".\before-cleanup-$($ListTitle -replace ' ', '-')-items.xml"
  } catch {
    Write-Host "FAILED ITEMS: $ListTitle -- $($_.Exception.Message)" -ForegroundColor Red
  }
}
```

## Browser Evidence

For each failing list:

1. Open DevTools.
2. Preserve console and network logs.
3. Open list from Site Contents.
4. Save HAR.
5. Record:
   - failing request,
   - HTTP status,
   - response body,
   - SharePoint correlation ID,
   - timestamp,
   - screenshot.

## Classification

Use this decision table:

| Condition | Classification | Action |
|---|---|---|
| Clean site passes; broken site fails | Tenant residue | Backup, delete/reprovision test lists or repair production lists. |
| Clean site fails; broken site fails | Source/package defect still open | Stop cleanup. Return to Wave 01/02. |
| Only Placements fails | Lookup provisioning or target-list residue | Inspect `ContentLookup`, target list GUID, and lookup metadata. |
| Only Content Registry fails | Source schema/index residue | Backup and reprovision. |
| All lists fail | Feature activation or broader package/site issue | Capture app install logs and package proof. |

## Test Site Cleanup Procedure

For test sites only, after evidence capture:

```powershell
$DeleteOrder = @(
  "Foleon Homepage Placements",
  "Foleon Interaction Events",
  "Foleon Sync Runs",
  "Foleon Content Registry"
)

foreach ($ListTitle in $DeleteOrder) {
  $list = Get-PnPList -Identity $ListTitle -ErrorAction SilentlyContinue
  if ($null -ne $list) {
    Remove-PnPList -Identity $ListTitle -Force
  }
}
```

Check recycle bin:

```powershell
Get-PnPRecycleBinItem | Where-Object { $_.Title -like "*Foleon*" -or $_.DirName -like "*Foleon*" }
```

Only on non-production test sites:

```powershell
Get-PnPRecycleBinItem | Where-Object { $_.Title -like "*Foleon*" -or $_.DirName -like "*Foleon*" } |
  Clear-PnPRecycleBinItem -Force
```

Then reinstall remediated package and re-run Wave 03 validation.

## Production / Production-Like Repair

If data exists:

1. Export list items.
2. Export fields.
3. Export views.
4. Record list GUIDs.
5. Decide whether repair is feasible:
   - add missing fields,
   - remove invalid indexes,
   - recreate views,
   - fix lookup field.
6. If repair is not reliable, create replacement lists and migrate data.
7. Do not delete source lists until replacement lists are validated.

## Required Output

Create:

```text
docs/architecture/plans/MASTER/spfx/foleon/list-provisioning-remediation/tenant-cleanup-results-YYYY-MM-DD.md
```

Include:

- target site URL,
- environment classification,
- app version evidence,
- list GUID evidence,
- failure screenshots,
- correlation IDs,
- field/view/item export paths,
- cleanup actions taken,
- reinstall result,
- whether the corrupted-site issue is closed or remains open.

## Completion Criteria

Wave 04 closes only when:

- broken-site evidence was captured,
- data was backed up if present,
- cleanup/repair action is documented,
- remediated package was revalidated on the cleaned site,
- no production data was lost,
- remaining risks are documented.
