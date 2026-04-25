---
generated_utc: 2026-04-25T08:22:25Z
scope: HB Intel Foleon SPFx list provisioning audit
package_under_review: hb-intel-foleon 1.0.11.0
uploaded_sppkg_sha256: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
web_research_status: Not performed; web search was unavailable in this ChatGPT session. Local agent must verify current Microsoft Learn guidance before implementation.
---


# 07 — Clean-Site Repro Test Plan

## Objective

Prove whether the current/remediated package can provision usable Foleon lists on a clean SharePoint site without tenant residue.

## Test Environments

Use two sites if possible:

1. **Clean No-Residue Test Site**
   - never had `hb-intel-foleon` installed,
   - no prior Foleon lists,
   - controlled members/owners.

2. **Corrupted Repro Site**
   - site where the failure occurred,
   - used only after evidence is captured.

## Pre-Test Checklist

- Confirm package version.
- Confirm package SHA-256.
- Confirm app catalog has only intended active version.
- Confirm target site has no existing Foleon lists:

```powershell
Get-PnPList | Where-Object { $_.Title -like "*Foleon*" -or $_.RootFolder.ServerRelativeUrl -like "*Foleon*" }
```

- Confirm no recycle-bin collision:

```powershell
Get-PnPRecycleBinItem | Where-Object { $_.Title -like "*Foleon*" -or $_.DirName -like "*Foleon*" }
```

## Test Steps

### Step 1 — Install App

Install the app on the clean site.

Capture:

- exact package filename,
- package version,
- site app version,
- install timestamp,
- installer user,
- site URL.

### Step 2 — Confirm Lists Exist

Expected lists:

```text
Foleon Content Registry
Foleon Homepage Placements
Foleon Interaction Events
Foleon Sync Runs
```

Commands:

```powershell
foreach ($ListTitle in $Lists) {
  Get-PnPList -Identity $ListTitle -Includes Id,Title,RootFolder,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount |
    Select-Object Id,Title,BaseTemplate,Hidden,EnableVersioning,EnableAttachments,ItemCount
}
```

### Step 3 — Open Lists in UI

Open each list from Site Contents.

Record:

| List | Opens? | Error? | Correlation ID | Notes |
|---|---:|---|---|---|
| Foleon Content Registry | TBD | TBD | TBD | TBD |
| Foleon Homepage Placements | TBD | TBD | TBD | TBD |
| Foleon Interaction Events | TBD | TBD | TBD | TBD |
| Foleon Sync Runs | TBD | TBD | TBD | TBD |

### Step 4 — REST Metadata

For each list, call:

```text
/_api/web/lists/getbytitle('<LIST>')
/_api/web/lists/getbytitle('<LIST>')/fields
/_api/web/lists/getbytitle('<LIST>')/views
```

Save JSON output.

### Step 5 — Field Contract Validation

Validate:

- all expected fields exist,
- no unexpected duplicate internal names,
- field types match source,
- required flags match source,
- indexed flags match source,
- unique-value fields are truly unique-enforced if required,
- lookup field is valid if present.

### Step 6 — View Contract Validation

Validate:

- default view exists,
- recommended views exist,
- view fields resolve,
- view queries are valid,
- default view opens in modern UI.

### Step 7 — App Runtime Validation

#### Highlights route

- Add `HB Intel Foleon Highlights` to a page.
- Configure list GUIDs/properties as needed.
- Add one published content item.
- Confirm card renders.

#### Manager route

- Add `HB Intel Foleon Manager` to a page.
- Confirm manager loads.
- Create/update a content registry record through manager UI.
- Create/update a placement through manager UI.
- Confirm no direct SharePoint list editing is required for normal operation.

#### Reader route

- Open a governed content item through the reader.
- Confirm gating behavior:
  - visible + published + allow embed -> reader attempts inline render,
  - not visible/offline/suppressed -> controlled blocked state,
  - external-only -> opens externally.

### Step 8 — Telemetry Write

- Trigger a card click or reader open.
- Confirm an event row writes to `Foleon Interaction Events`.
- Confirm failures are handled as best-effort and do not break user experience.

## Pass/Fail

### Pass

The package/list provisioning path passes only if:

- all four lists are created,
- all four lists open,
- all fields/views validate,
- app read/write paths work,
- manager route can configure content.

### Fail

Any of the following fails the test:

- list appears but cannot open,
- fields REST call fails,
- views REST call fails,
- indexed field count differs from proof,
- lookup field is invalid,
- manager cannot create/update content,
- existing corrupted list residue is required to reproduce the failure but clean site passes.

## Output Artifact

Create:

```text
docs/architecture/plans/MASTER/spfx/foleon/list-provisioning-remediation/clean-site-repro-results-YYYY-MM-DD.md
```

Include:

- package SHA,
- package version,
- site URL,
- list GUIDs,
- screenshots,
- command outputs,
- REST outputs,
- pass/fail table,
- tenant closure status.
