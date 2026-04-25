---
generated_utc: 2026-04-25T08:26:30Z
package: HB Intel Foleon SPFx list provisioning remediation
repo: RMF112018/hb-intel
target_package_version_observed: 1.0.11.0
uploaded_sppkg_sha256_observed: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
source_audit_basis: Foleon list provisioning audit package generated from current repo/package inspection
---


# 03 — Wave 03 Prompt: Clean-Site Repro Validation

You are working after Waves 01 and 02 have passed locally.

## Objective

Prove that the remediated `hb-intel-foleon` package provisions usable SharePoint lists on a clean site.

This wave separates package/source closure from tenant closure.

## Required Inputs

- Remediated `.sppkg` path.
- Package SHA-256.
- Package version.
- App catalog URL.
- Clean SharePoint test site URL.
- User account with sufficient rights to install app and inspect lists.

## Pre-Test Rules

- The clean test site must not have had any previous Foleon package installed.
- The clean test site must not contain prior Foleon lists.
- Do not test first on the corrupted site.
- Do not treat Site Contents presence as success.

## Required Evidence Capture

Capture:

- clean site URL,
- package filename,
- package SHA-256,
- app catalog version,
- installed site app version,
- install timestamp,
- list URLs,
- list GUIDs,
- REST metadata responses,
- REST field responses,
- REST view responses,
- screenshots proving each list opens in SharePoint UI,
- browser console/network errors if any,
- manager route configuration proof.

## PnP PowerShell Setup

```powershell
$SiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/<CLEAN-TEST-SITE>"
$Lists = @(
  "Foleon Content Registry",
  "Foleon Homepage Placements",
  "Foleon Interaction Events",
  "Foleon Sync Runs"
)

Connect-PnPOnline -Url $SiteUrl -Interactive
```

## Step 1 — Prove No Residue

```powershell
Get-PnPList | Where-Object { $_.Title -like "*Foleon*" -or $_.RootFolder.ServerRelativeUrl -like "*Foleon*" }

Get-PnPRecycleBinItem | Where-Object { $_.Title -like "*Foleon*" -or $_.DirName -like "*Foleon*" }
```

Expected: no Foleon lists or recycle-bin conflicts.

## Step 2 — Install App

Install the remediated package on the clean site using the normal SharePoint app-add flow.

Capture:

- screenshot of app package/version in app catalog,
- screenshot or command output of installed app on the site,
- package version,
- site-installed version.

## Step 3 — Confirm Lists Exist

```powershell
foreach ($ListTitle in $Lists) {
  Write-Host "==== $ListTitle ===="
  $list = Get-PnPList -Identity $ListTitle -Includes Id,Title,RootFolder,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount
  $list | Select-Object Id,Title,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount
  $list.RootFolder.ServerRelativeUrl
}
```

## Step 4 — Open Lists in SharePoint UI

Open each list from Site Contents.

Record:

| List | Opens? | Error? | Correlation ID | Notes |
|---|---:|---|---|---|
| Foleon Content Registry | TBD | TBD | TBD | TBD |
| Foleon Homepage Placements | TBD | TBD | TBD | TBD |
| Foleon Interaction Events | TBD | TBD | TBD | TBD |
| Foleon Sync Runs | TBD | TBD | TBD | TBD |

Any list-load failure fails this wave.

## Step 5 — Validate Fields

```powershell
foreach ($ListTitle in $Lists) {
  Write-Host "==== FIELDS: $ListTitle ===="
  Get-PnPField -List $ListTitle |
    Select-Object InternalName, Title, TypeAsString, Required, Indexed, EnforceUniqueValues, Hidden, ReadOnlyField, Sealed |
    Sort-Object InternalName |
    Export-Csv ".\foleon-$($ListTitle -replace ' ', '-')-fields.csv" -NoTypeInformation
}
```

Validate:

- expected fields exist,
- field types match,
- required flags match,
- indexed flags match package proof,
- unique fields are enforced if that is the chosen posture,
- no invalid hidden/sealed/read-only custom fields.

## Step 6 — Validate Views

```powershell
foreach ($ListTitle in $Lists) {
  Write-Host "==== VIEWS: $ListTitle ===="
  Get-PnPView -List $ListTitle |
    Select-Object Title, Id, ServerRelativeUrl, DefaultView, Hidden, RowLimit |
    Export-Csv ".\foleon-$($ListTitle -replace ' ', '-')-views.csv" -NoTypeInformation
}
```

Validate:

- default views exist,
- all view pages open,
- view field refs resolve,
- view queries do not throw errors.

## Step 7 — Validate REST Metadata

Use browser, Postman, PnP, or PowerShell.

Required endpoints:

```text
<SITE>/_api/web/lists/getbytitle('Foleon%20Content%20Registry')
<SITE>/_api/web/lists/getbytitle('Foleon%20Content%20Registry')/fields
<SITE>/_api/web/lists/getbytitle('Foleon%20Content%20Registry')/views

<SITE>/_api/web/lists/getbytitle('Foleon%20Homepage%20Placements')
<SITE>/_api/web/lists/getbytitle('Foleon%20Homepage%20Placements')/fields
<SITE>/_api/web/lists/getbytitle('Foleon%20Homepage%20Placements')/views

<SITE>/_api/web/lists/getbytitle('Foleon%20Interaction%20Events')
<SITE>/_api/web/lists/getbytitle('Foleon%20Interaction%20Events')/fields
<SITE>/_api/web/lists/getbytitle('Foleon%20Interaction%20Events')/views

<SITE>/_api/web/lists/getbytitle('Foleon%20Sync%20Runs')
<SITE>/_api/web/lists/getbytitle('Foleon%20Sync%20Runs')/fields
<SITE>/_api/web/lists/getbytitle('Foleon%20Sync%20Runs')/views
```

Save all outputs.

## Step 8 — Validate Foleon Runtime

### Highlights route

- Add `HB Intel Foleon Highlights` to a test page.
- Configure required list GUIDs/properties.
- Add one published visible content item.
- Confirm the card renders.

### Manager route

- Add `HB Intel Foleon Manager` to a test page.
- Create/update a content record through the manager surface.
- Create/update a homepage placement through the manager surface.
- Confirm normal content configuration does not require direct SharePoint list editing.

### Reader route

- Open a visible/published/embeddable content item.
- Confirm reader gate behavior.
- Confirm non-visible/offline/suppressed content is blocked with a controlled message.
- Confirm external-only content opens externally.

### Telemetry

- Trigger a click/open.
- Confirm `HB_FoleonInteractionEvents` receives an event row or fails silently as designed without user impact.

## Required Output

Create:

```text
docs/architecture/plans/MASTER/spfx/foleon/list-provisioning-remediation/clean-site-repro-results-YYYY-MM-DD.md
```

Include:

- package version,
- package SHA,
- site URL,
- install evidence,
- list GUIDs,
- UI screenshots,
- REST outputs,
- PnP outputs,
- runtime validation evidence,
- pass/fail status,
- tenant closure status.

## Pass Criteria

Wave 03 passes only when:

- all four lists are created,
- all four lists open,
- metadata/fields/views REST calls succeed,
- field/index/view state matches proof,
- Foleon app can read/write expected lists,
- manager route can configure content.

If clean-site repro fails, return to Wave 01 or Wave 02.
