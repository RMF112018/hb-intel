# Prompt 04 — Validate Tenant Page Instances and Migrate Foleon Configuration

You are working from a local machine with access to the live SharePoint tenant and the live `RMF112018/hb-intel` repository on `main`.

Do not re-read files that are already within your current context or memory unless verifying a specific line, contradiction, or diff.

## Objective

Validate the deployed Foleon package and the affected SharePoint page instances after source remediation. Determine whether the red initialization state is fully closed or whether page instance configuration remains open.

This prompt targets the tenant-side portion of Audit Findings A, C, D, and the stale-instance risk:

- Foleon list provisioning can succeed while webpart runtime config is still missing.
- Existing page instances may not receive new manifest/preconfigured defaults after a package update.
- The runtime proof and page properties must confirm the page is now correctly wired.

## Prerequisites

Before starting:

1. Prompt 01 has been executed.
2. Prompt 02 has been executed.
3. Prompt 03 has been executed.
4. A rebuilt package has been uploaded to the App Catalog.
5. The target site has the updated Foleon app installed.

Expected package version after remediation:

```text
1.0.14.0
```

If version remains `1.0.13.0`, explain why no source/package behavior changed.

## Required Starting Commands

Run and record:

```bash
git status --short
git branch --show-current
git log -3 --oneline
ls -lah dist/sppkg
shasum -a 256 dist/sppkg/hb-intel-foleon.sppkg
```

## Required Tenant Evidence

### 1. Confirm list GUIDs

Open these in the browser while signed in as an admin/site owner, or use PnP/REST equivalent:

```text
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonContentRegistry')?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonHomepagePlacements')?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonInteractionEvents')?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonSyncRuns')?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder
```

Record:

```text
HB_FoleonContentRegistry ID:
HB_FoleonHomepagePlacements ID:
HB_FoleonInteractionEvents ID:
HB_FoleonSyncRuns ID:
```

### 2. Configure the page webpart properties

For each Foleon webpart instance on the target page:

- Open page edit mode.
- Open the Foleon webpart property pane.
- Set:
  - `contentRegistryListId`
  - `placementsListId`
  - `eventsListId`
  - `acceptedFoleonOrigins`
  - `allowPreview`
  - `expectedManifestId`
  - `expectedPackageVersion`
  - `foleonRoute`
  - `foleonReaderRoutePath` if used.
  - `foleonApiBaseUrl` / `foleonApiResource` if backend workflows require them.

Recommended values:

```text
acceptedFoleonOrigins:
https://viewer.us.foleon.com

allowPreview:
false

expectedManifestId:
2160edb3-675e-4451-92bb-8345f9d1c71e

expectedPackageVersion:
1.0.14.0
```

For Highlights:

```text
foleonRoute:
highlights
```

For Manager:

```text
foleonRoute:
manage
```

Save and publish the page.

### 3. Validate runtime binding proof

Open the page normally and run:

```js
JSON.stringify(window.__hbIntel_foleonRuntimeBindingProof, null, 2)
```

Expected:

```json
{
  "packageVersion": "1.0.14.0",
  "manifestId": "2160edb3-675e-4451-92bb-8345f9d1c71e",
  "hostMode": "sharepoint",
  "canInitialize": true,
  "issueCodes": []
}
```

Also confirm:

```json
{
  "presence": {
    "spfxContext": true,
    "siteUrl": true,
    "contentRegistryListId": true,
    "placementsListId": true,
    "eventsListId": true
  }
}
```

If two Foleon webparts are on the page, capture the proof for each instance. If the global proof only stores the last mounted instance, temporarily test each instance on a page by itself or add instance-aware diagnostics in Prompt 03.

### 4. Validate diagnostics mode

Open the page with:

```text
?foleon-diagnostics=1
```

or append:

```text
&foleon-diagnostics=1
```

Expected:

- No red configuration-error state.
- If red state remains, admin diagnostics must identify exact issue code(s).
- Console proof must match the rendered error state.

### 5. Determine stale page instance status

If the page still fails after deployment:

1. Remove both Foleon webpart instances from the page.
2. Save/publish.
3. Re-edit the page.
4. Re-add:
   - `HB Intel Foleon Highlights`
   - `HB Intel Foleon Manager`
5. Reconfigure list GUIDs.
6. Save/publish.
7. Re-run runtime proof.

If remove/re-add fixes the issue, document stale page instance properties as the tenant-side root cause.

## Required Closure Report

Return a tenant closure report with:

1. Package version and SHA deployed.
2. App Catalog version observed.
3. Site app install status.
4. Actual list GUIDs captured.
5. Page webpart instance properties captured.
6. Runtime proof before configuration.
7. Runtime proof after configuration.
8. Diagnostics-mode result.
9. Whether remove/re-add was required.
10. Final statement:
    - Source/package closed.
    - Tenant/page configuration closed.
    - Any remaining open issue.

## Do Not Change

Do not change source code in this prompt unless tenant evidence proves source behavior still contradicts the intended runtime contract.
