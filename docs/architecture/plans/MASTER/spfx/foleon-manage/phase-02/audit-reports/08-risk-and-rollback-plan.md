---
generated_utc: 2026-04-25T08:22:25Z
scope: HB Intel Foleon SPFx list provisioning audit
package_under_review: hb-intel-foleon 1.0.11.0
uploaded_sppkg_sha256: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
web_research_status: Not performed; web search was unavailable in this ChatGPT session. Local agent must verify current Microsoft Learn guidance before implementation.
---


# 08 — Risk and Rollback Plan

## Primary Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Existing corrupted lists remain broken after source fix | High | Clean-site repro first; delete/reprovision test lists; backup production data. |
| App reinstall does not repair partial feature state | High | Do not rely on reinstall as repair. Use explicit cleanup/provisioning. |
| Content Registry over-indexing recurs | High | Add schema validation and package proof index-budget checks. |
| Cross-list lookup fails during same feature activation | High | Make optional or post-provision lookup after target list validation. |
| Production data is deleted during cleanup | Critical | Export data and metadata before deleting any production/prod-like list. |
| Package version drift | Medium | Record app catalog version, site app version, package SHA. |
| Stale `.sppkg` deployed | Medium | Package proof must include SHA and repo/package parity. |
| Manager route absent or hidden | Medium | Package proof must validate both toolbox entries. |
| Webpart works but lists are invalid | High | Do not accept app render as provisioning success. Validate lists directly. |

## Rollback Principles

1. Do not delete production lists without backup.
2. Do not assume app removal deletes lists safely.
3. Do not assume reinstall repairs a corrupted list.
4. Keep a copy of the previous `.sppkg`.
5. Track package SHA-256 values.
6. Separate package rollback from tenant data rollback.

## Test-Site Cleanup

For test sites only:

```powershell
Connect-PnPOnline -Url $SiteUrl -Interactive

$Lists = @(
  "Foleon Homepage Placements",
  "Foleon Content Registry",
  "Foleon Interaction Events",
  "Foleon Sync Runs"
)

foreach ($ListTitle in $Lists) {
  $list = Get-PnPList -Identity $ListTitle -ErrorAction SilentlyContinue
  if ($null -ne $list) {
    Remove-PnPList -Identity $ListTitle -Force
  }
}
```

Then check recycle bin:

```powershell
Get-PnPRecycleBinItem | Where-Object { $_.Title -like "*Foleon*" -or $_.DirName -like "*Foleon*" }
```

Empty only if appropriate for the test site:

```powershell
Get-PnPRecycleBinItem | Where-Object { $_.Title -like "*Foleon*" -or $_.DirName -like "*Foleon*" } | Clear-PnPRecycleBinItem -Force
```

## Production/Prod-Like Backup Before Cleanup

Before deleting or modifying any list:

```powershell
foreach ($ListTitle in $Lists) {
  Get-PnPListItem -List $ListTitle -PageSize 500 |
    Select-Object * |
    Export-Clixml ".\backup-$($ListTitle -replace ' ', '-')-items.xml"

  Get-PnPField -List $ListTitle |
    Select-Object InternalName, Title, TypeAsString, Required, Indexed, EnforceUniqueValues, Hidden, ReadOnlyField, Sealed |
    Export-Csv ".\backup-$($ListTitle -replace ' ', '-')-fields.csv" -NoTypeInformation

  Get-PnPView -List $ListTitle |
    Select-Object Title, Id, ServerRelativeUrl, DefaultView, Hidden, RowLimit |
    Export-Csv ".\backup-$($ListTitle -replace ' ', '-')-views.csv" -NoTypeInformation
}
```

## Rollback Package Validation

Before rolling back:

```bash
sha256sum dist/sppkg/hb-intel-foleon.sppkg
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Record:

- package version,
- product ID,
- feature ID,
- package SHA,
- feature version,
- manager toolbox entry visibility,
- schema files included.

## Rollback Decision Tree

| Condition | Action |
|---|---|
| Clean site fails with remediated package | Do not deploy. Fix source. |
| Clean site passes but old site fails | Treat old site as tenant residue. Backup and cleanup. |
| Production has no Foleon data | Delete/reprovision can be considered after approval. |
| Production has Foleon data | Export, assess repair, then controlled migration. |
| Feature Framework remains unstable | Remove list provisioning from SPFx package and use backend/PnP provisioning. |

## Final Closure Rules

Package closure requires:

- build/test/package proof pass,
- package SHA recorded,
- schema parity proven,
- no stale schema files,
- index-budget checks pass.

Tenant closure requires:

- clean-site install pass,
- all four lists open,
- REST metadata/fields/views pass,
- app read/write pass,
- manager configuration pass,
- corrupted-site cleanup plan executed or documented.
