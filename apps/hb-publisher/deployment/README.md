# hb-publisher — Hosted Deployment Runbook

**Audience:** tenant administrators and HB Central/Marketing page
authors deploying or validating the Article Publisher SharePoint
package.

## Operating model

The Article Publisher is an **admin-managed authoring surface**, not a
self-service webpart. The shipped package is intentionally
`hiddenFromToolbox: true` so end users cannot insert it via the
SharePoint toolbox UI. Insertion is governed by this runbook and the
PnP script in this directory.

- **Single governed host page**: the authoritative host is
  `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Article-Publisher.aspx`.
  Page authoring and access rights are owned by the HB Central /
  Marketing content team.
- **One webpart instance per host page**: the Publisher renders the
  whole authoring surface, so a page only needs one instance.
- **Insertion by GUID**: because the toolbox is hidden, insertion is
  done by stable webpart GUID via PnP PowerShell.

Machine-readable deployment specs for this release are emitted at
packaging time to `dist/sppkg/hb-publisher-hosted-deployment-plan.json`
— use that file as the source of truth for the IDs, paths, and
runtime globals below rather than copy-pasting.

## Stable identifiers (see generated deployment plan for the current release)

| Field                | Value                                          |
|----------------------|------------------------------------------------|
| Solution name        | `hb-publisher`                                 |
| Solution id          | `c7b2a144-9d3e-4a71-8e2a-6f9d3c1b7e42`         |
| Webpart manifest id  | `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10`         |
| Webpart alias        | `ArticlePublisherWebPart`                      |
| Supported hosts      | `SharePointWebPart`                            |
| Runtime global       | `__hbIntel_hbPublisher` on `window`/`globalThis` |
| Deployment model     | `admin-managed-host-page`                      |

The current packaging run's hashed `app`, `shell-entry`, and CSS paths
live in the deployment plan artifact. Do not hand-edit them.

## Deployment steps

### 1. Install the package

```powershell
Connect-PnPOnline -Url "https://hedrickbrotherscom.sharepoint.com/sites/apps" -Interactive
Add-PnPApp -Path "./dist/sppkg/hb-publisher.sppkg" -Scope Tenant -Overwrite -Publish
```

Post-install, verify with `Get-PnPApp -Scope Tenant` that
`hb-publisher` is listed and `Deployed = True`.

### 2. Resolve the host page

Identify the host page that will run the Publisher. For HB Intel's
primary deployment this is
`https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Article-Publisher.aspx`.
For a new tenant, the page author creates an empty modern page with
Full Bleed enabled.

### 3. Add the webpart to the host page

Run `./deployment/Add-ArticlePublisherWebPart.ps1` against the target
page. The script is idempotent: it adds the webpart only if no
instance with the Publisher GUID is already present on the page.

```powershell
./deployment/Add-ArticlePublisherWebPart.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New" `
  -PageName "Article-Publisher.aspx"
```

### 4. Validate successful runtime load

1. Navigate to the host page.
2. Confirm the Publisher authoring surface renders (hero "Article
   Publisher" with the Draft Queue, Story Body, and Shared Chrome).
3. Open DevTools and confirm `window.__hbIntel_hbPublisher` exposes a
   `mount` + `unmount` function.
4. Confirm no red error-alert seam appears (the `role="alert"`
   fallback DOM only renders when the shell passes an unknown
   `webPartId` — that is the failure path).

A repeatable local-synthetic equivalent of step 2 is captured in
`dist/sppkg/hb-publisher-hosted-load-proof.json` on every package run
(see *Offline runtime proof* below).

## Failure diagnostics

| Symptom                                                              | Diagnosis                                                                         | Fix                                                                                          |
|----------------------------------------------------------------------|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `Get-PnPApp` shows `Deployed = False`                                | App catalog install incomplete.                                                   | Re-run `Add-PnPApp … -Publish` and wait for provisioning.                                    |
| Page renders a `role="alert"` box with "webPartId … is not mapped"   | Shell invoked `mount()` with a webPartId that is not `ARTICLE_PUBLISHER_WEBPART_ID`. | Re-run the insertion script — it writes the correct GUID. Do not hand-edit the page JSON.    |
| `window.__hbIntel_hbPublisher` is `undefined` at runtime             | Bundle did not load (service-worker cached a prior release, or sppkg is stale).   | Hard refresh (Ctrl-Shift-R). Confirm bundle path in plan artifact matches App Catalog CDN.   |
| Page shows blank / no authoring surface, no alert box                | `mount()` was never called — host page does not have the webpart inserted.        | Run `Add-ArticlePublisherWebPart.ps1` against the page.                                      |

## Offline runtime proof

Every packaging run emits
`dist/sppkg/hb-publisher-hosted-load-proof.json`, which captures a
Node+jsdom-based invocation of the packaged IIFE's `mount()` and
`unmount()` entry points. It is a synthetic proof (not a real
SharePoint tenant run), but it exercises the same bytes that the CDN
will serve and verifies:

1. The IIFE evaluates without throwing.
2. `globalThis.__hbIntel_hbPublisher.mount(el, null, { webPartId: "<unknown>" })` attaches DOM to `el` (the unsupported-webpart
   fallback path) without throwing.
3. `unmount()` detaches cleanly.
4. `mount(null, ...)` produces the documented failure diagnostic.

A tenant-free deployment can thus be audited end-to-end for
packaging + runtime-load integrity using the emitted JSON artifacts:

| Artifact                                    | Covers                                   |
|---------------------------------------------|------------------------------------------|
| `hb-publisher.sppkg`                        | Deployable binary                        |
| `hb-publisher-shim-proof.json`              | Shim mappings + freshness provenance     |
| `hb-publisher-package-truth-proof.json`     | Structural + semantic + freshness checks |
| `hb-publisher-hosted-deployment-plan.json`  | Machine-readable deployment inputs       |
| `hb-publisher-hosted-load-proof.json`       | Synthetic runtime mount/unmount proof    |

Tenant click-through validation (step 4 above) remains the final
human gate for a real deployment and is not replaced by the synthetic
proof.
