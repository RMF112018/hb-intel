# hb-publisher — Site-Scoped Deployment Runbook

**Audience:** SharePoint administrators installing the Article Publisher
package at the site level, and page authors inserting the Article
Publisher webpart on a modern page.

## Operating model

The Article Publisher ships as a **site-scoped SPFx solution**. It is
installed into a single SharePoint site's App Catalog, and page authors
discover it through the **standard modern page web part picker**. No
tenant-wide deployment and no GUID-based insertion script is required.

- **Site-scoped install**: the `.sppkg` is added to the target site's
  App Catalog and deployed there. Each site that needs the Article
  Publisher installs its own copy.
- **Page-picker discovery**: once the app is deployed to a site, any
  modern page on that site can insert the Article Publisher via
  *Edit → + → search "Article Publisher"*. The webpart is visible in
  the toolbox (`hiddenFromToolbox: false`).
- **One instance per authoring page**: a page only needs one Article
  Publisher instance — it renders the whole authoring surface.

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
| Deployment model     | `site-scoped-webpart`                          |

The current packaging run's hashed `app`, `shell-entry`, and CSS paths
live in the deployment plan artifact. Do not hand-edit them.

## Prerequisites for building the package

Running `tools/build-spfx-package.ts --domain hb-publisher` requires
both Node 20+ (for the orchestrator) and Node 18.17.x..<19 (for the
SPFx gulp toolchain). The orchestrator resolves Node 18 via a
preflight — see
[`docs/reference/developer/spfx-packaging-toolchain.md`](../../../docs/reference/developer/spfx-packaging-toolchain.md)
for resolution strategies, the `HB_INTEL_NODE18_BIN` override, and
remediation if preflight cannot find a compatible Node 18.

## Deployment steps

### 1. Install the package on the target site

```powershell
Connect-PnPOnline -Url "https://<tenant>.sharepoint.com/sites/<target-site>" -Interactive
Add-PnPApp -Path "./dist/sppkg/hb-publisher.sppkg" -Scope Site -Overwrite -Publish
```

Post-install, verify with `Get-PnPApp -Scope Site` that `hb-publisher`
is listed and `Deployed = True` on the target site.

The package can also be uploaded through the site's **Site Contents →
Apps for SharePoint** UI if PowerShell is not preferred. Either path
produces the same result.

### 2. Add the Article Publisher to a modern page

On the target site:

1. Create or open a modern page where the Article Publisher should
   live.
2. Click **Edit** on the page.
3. Click the **+ (Add a new web part)** affordance in the desired
   section.
4. Search for **Article Publisher** in the web part picker.
5. Select it to insert it into the page, then **Publish** the page.

No GUID-based insertion script is required — the webpart is
`hiddenFromToolbox: false` and is discoverable through the standard
modern page picker.

### 3. Validate successful runtime load

1. Navigate to the page.
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

| Symptom                                                              | Diagnosis                                                                          | Fix                                                                                               |
|----------------------------------------------------------------------|------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `Get-PnPApp -Scope Site` shows `Deployed = False`                    | Site-scoped app install incomplete.                                                | Re-run `Add-PnPApp … -Scope Site -Publish` and wait for provisioning to finish.                   |
| Article Publisher is not listed in the modern page web part picker   | App not deployed to the current site, or browser cached a stale picker listing.    | Confirm `Get-PnPApp -Scope Site` shows `Deployed = True`; hard refresh (Ctrl-Shift-R) the page.   |
| Page renders a `role="alert"` box with "webPartId … is not mapped"   | Shell invoked `mount()` with a webPartId that is not `ARTICLE_PUBLISHER_WEBPART_ID`. | Remove the stale webpart from the page and re-insert the Article Publisher via the picker.        |
| `window.__hbIntel_hbPublisher` is `undefined` at runtime             | Bundle did not load (service-worker cached a prior release, or sppkg is stale).    | Hard refresh (Ctrl-Shift-R). Confirm bundle path in the deployment plan matches App Catalog CDN.  |
| Page shows blank / no authoring surface, no alert box                | `mount()` was never called — the page does not have the Article Publisher inserted. | Edit the page and add the Article Publisher through the modern page web part picker.              |

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

Tenant click-through validation (step 3 above) remains the final
human gate for a real deployment and is not replaced by the synthetic
proof.
