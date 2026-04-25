---
generated_utc: 2026-04-25T08:22:25Z
scope: HB Intel Foleon SPFx list provisioning audit
package_under_review: hb-intel-foleon 1.0.11.0
uploaded_sppkg_sha256: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
web_research_status: Not performed; web search was unavailable in this ChatGPT session. Local agent must verify current Microsoft Learn guidance before implementation.
---


# 06 — Tenant Validation Runbook

## Objective

Capture enough tenant evidence to distinguish:

1. source schema defect,
2. package staging defect,
3. same-feature lookup failure,
4. stale/corrupted tenant residue,
5. app read/write configuration failure.

## Required Inputs

Set these variables before running commands:

```powershell
$SiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/<TARGET-SITE>"
$PackageName = "hb-intel-foleon"
$Lists = @(
  "Foleon Content Registry",
  "Foleon Homepage Placements",
  "Foleon Interaction Events",
  "Foleon Sync Runs"
)
```

## Evidence Capture Checklist

Capture:

- target site URL,
- app catalog package version,
- site-installed app version,
- list URLs,
- list GUIDs,
- browser console errors,
- browser network errors,
- SharePoint correlation IDs,
- REST metadata responses,
- REST fields responses,
- REST views responses,
- list UI usability results,
- clean-site repro result.

## Browser Evidence

For each broken list:

1. Open DevTools.
2. Preserve logs.
3. Open the list from Site Contents.
4. Export console log.
5. Export HAR/network log.
6. Capture:
   - failed request URL,
   - HTTP status,
   - response body,
   - SharePoint correlation ID,
   - time of failure.

## PnP PowerShell — Connect

```powershell
Connect-PnPOnline -Url $SiteUrl -Interactive
```

## PnP PowerShell — Installed App Evidence

```powershell
Get-PnPApp | Where-Object { $_.Title -like "*Foleon*" } |
  Select-Object Title, Id, AppCatalogVersion, InstalledVersion, Deployed, Enabled |
  Format-List
```

If `InstalledVersion` is blank, inspect all properties:

```powershell
Get-PnPApp | Where-Object { $_.Title -like "*Foleon*" } | Format-List *
```

## PnP PowerShell — List Existence and GUIDs

```powershell
foreach ($ListTitle in $Lists) {
  Write-Host "==== $ListTitle ===="
  try {
    $list = Get-PnPList -Identity $ListTitle -Includes Id,Title,RootFolder,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount
    $list | Select-Object Id,Title,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount
    $list.RootFolder.ServerRelativeUrl
  } catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
  }
}
```

## PnP PowerShell — Field Inventory

```powershell
foreach ($ListTitle in $Lists) {
  Write-Host "==== FIELDS: $ListTitle ===="
  try {
    Get-PnPField -List $ListTitle |
      Select-Object InternalName, Title, TypeAsString, Required, Indexed, EnforceUniqueValues, Hidden, ReadOnlyField, Sealed |
      Sort-Object InternalName |
      Export-Csv ".\foleon-$($ListTitle -replace ' ', '-')-fields.csv" -NoTypeInformation
  } catch {
    Write-Host "FAILED FIELDS: $($_.Exception.Message)" -ForegroundColor Red
  }
}
```

## PnP PowerShell — Indexed Field Count

```powershell
foreach ($ListTitle in $Lists) {
  Write-Host "==== INDEXED COUNT: $ListTitle ===="
  try {
    $indexed = Get-PnPField -List $ListTitle | Where-Object { $_.Indexed -eq $true }
    $indexed | Select-Object InternalName, Title, TypeAsString
    Write-Host "Indexed field count: $($indexed.Count)"
  } catch {
    Write-Host "FAILED INDEX COUNT: $($_.Exception.Message)" -ForegroundColor Red
  }
}
```

## PnP PowerShell — View Inventory

```powershell
foreach ($ListTitle in $Lists) {
  Write-Host "==== VIEWS: $ListTitle ===="
  try {
    Get-PnPView -List $ListTitle |
      Select-Object Title, Id, ServerRelativeUrl, DefaultView, Hidden, RowLimit |
      Export-Csv ".\foleon-$($ListTitle -replace ' ', '-')-views.csv" -NoTypeInformation
  } catch {
    Write-Host "FAILED VIEWS: $($_.Exception.Message)" -ForegroundColor Red
  }
}
```

## PnP PowerShell — Lookup Validation

```powershell
$lookupField = Get-PnPField -List "Foleon Homepage Placements" -Identity "ContentLookup" -ErrorAction SilentlyContinue
$lookupField | Select-Object InternalName, Title, TypeAsString, Required, Indexed, LookupList, LookupField, RelationshipDeleteBehavior | Format-List
```

Expected:

- field exists only if intentionally provisioned,
- `TypeAsString` is `Lookup`,
- `LookupList` resolves to `HB_FoleonContentRegistry`,
- `LookupField` resolves to `Title`,
- field is optional unless clean-site proof supports required lookup.

## SharePoint REST — List Metadata

Use browser, Postman, or PowerShell.

```powershell
$RestBase = "$SiteUrl/_api/web"
$Headers = @{ Accept = "application/json;odata=nometadata" }

foreach ($ListTitle in $Lists) {
  $encoded = [uri]::EscapeDataString($ListTitle)
  $url = "$RestBase/lists/getbytitle('$encoded')"
  Write-Host "GET $url"
  Invoke-RestMethod -Uri $url -Headers $Headers -UseDefaultCredentials
}
```

If auth does not work in PowerShell, use browser:

```text
<SITE>/_api/web/lists/getbytitle('Foleon%20Content%20Registry')
<SITE>/_api/web/lists/getbytitle('Foleon%20Homepage%20Placements')
<SITE>/_api/web/lists/getbytitle('Foleon%20Interaction%20Events')
<SITE>/_api/web/lists/getbytitle('Foleon%20Sync%20Runs')
```

## SharePoint REST — Fields

```text
<SITE>/_api/web/lists/getbytitle('Foleon%20Content%20Registry')/fields?$select=InternalName,Title,TypeAsString,Required,Indexed,EnforceUniqueValues,Hidden,ReadOnlyField,Sealed
<SITE>/_api/web/lists/getbytitle('Foleon%20Homepage%20Placements')/fields?$select=InternalName,Title,TypeAsString,Required,Indexed,EnforceUniqueValues,Hidden,ReadOnlyField,Sealed
<SITE>/_api/web/lists/getbytitle('Foleon%20Interaction%20Events')/fields?$select=InternalName,Title,TypeAsString,Required,Indexed,EnforceUniqueValues,Hidden,ReadOnlyField,Sealed
<SITE>/_api/web/lists/getbytitle('Foleon%20Sync%20Runs')/fields?$select=InternalName,Title,TypeAsString,Required,Indexed,EnforceUniqueValues,Hidden,ReadOnlyField,Sealed
```

## SharePoint REST — Views

```text
<SITE>/_api/web/lists/getbytitle('Foleon%20Content%20Registry')/views?$select=Title,Id,ServerRelativeUrl,DefaultView,Hidden,ViewQuery
<SITE>/_api/web/lists/getbytitle('Foleon%20Homepage%20Placements')/views?$select=Title,Id,ServerRelativeUrl,DefaultView,Hidden,ViewQuery
<SITE>/_api/web/lists/getbytitle('Foleon%20Interaction%20Events')/views?$select=Title,Id,ServerRelativeUrl,DefaultView,Hidden,ViewQuery
<SITE>/_api/web/lists/getbytitle('Foleon%20Sync%20Runs')/views?$select=Title,Id,ServerRelativeUrl,DefaultView,Hidden,ViewQuery
```

## M365 CLI — Connect

```bash
m365 login --authType deviceCode
```

## M365 CLI — List Evidence

```bash
m365 spo list get --webUrl "$SITE_URL" --title "Foleon Content Registry"
m365 spo list get --webUrl "$SITE_URL" --title "Foleon Homepage Placements"
m365 spo list get --webUrl "$SITE_URL" --title "Foleon Interaction Events"
m365 spo list get --webUrl "$SITE_URL" --title "Foleon Sync Runs"
```

## M365 CLI — Field Evidence

```bash
m365 spo field list --webUrl "$SITE_URL" --listTitle "Foleon Content Registry" --output json > foleon-content-fields.json
m365 spo field list --webUrl "$SITE_URL" --listTitle "Foleon Homepage Placements" --output json > foleon-placements-fields.json
m365 spo field list --webUrl "$SITE_URL" --listTitle "Foleon Interaction Events" --output json > foleon-events-fields.json
m365 spo field list --webUrl "$SITE_URL" --listTitle "Foleon Sync Runs" --output json > foleon-sync-fields.json
```

## Clean-Site Success Criteria

All must pass:

- app installs without error,
- all four lists exist,
- all four lists open in SharePoint UI,
- REST list metadata succeeds,
- REST fields succeeds,
- REST views succeeds,
- indexed field counts match source proof,
- lookup field either absent, optional, or valid,
- unique fields are proven unique if required,
- Foleon highlights route can read content,
- Foleon manager route can create/update content and placements without direct list editing.

## Failure Classification

| Symptom | Likely Cause | Next Action |
|---|---|---|
| List not created | Feature activation/package issue | Inspect app install logs and package feature rels. |
| List created but fields missing | Schema provisioning failure | Capture fields REST output and correlation ID. |
| List created but cannot open | Invalid field/view/index state | Capture browser network/correlation ID; reduce schema complexity. |
| Placements list fails only | Lookup target resolution | Remove/make optional/post-provision lookup. |
| Existing site fails but clean site passes | Tenant residue | Backup/delete/reprovision or repair corrupted site lists. |
| Clean site fails | Source/package defect | Do not roll out. Fix source. |
