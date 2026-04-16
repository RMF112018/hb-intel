# hb-publisher — Tenant-Wide Deployment Runbook

**Audience:** SharePoint tenant administrators uploading the Article
Publisher package to the tenant app catalog, and page authors
inserting the Article Publisher webpart on a modern page.

## Operating model

The Article Publisher ships as a **tenant-wide SPFx solution**. It is
uploaded once to the tenant app catalog and enabled with the "Enable
this app and add it to all sites" option so SharePoint automatically
deploys it to every site in the tenant. Page authors then discover it
through the **standard modern page web part picker**. No per-site
install is required.

- **Tenant-wide enablement**: the `.sppkg` is uploaded to the tenant
  app catalog. On upload, SharePoint presents a two-path enablement
  modal:
  - *Enable this app* — makes it available to enable per-site later.
  - *Enable this app and add it to all sites* — deploys automatically
    to every site in the tenant (recommended).
  This two-path modal is gated on the `SkipFeatureDeployment="true"`
  attribute in the emitted `AppManifest.xml`, which is set from
  `skipFeatureDeployment: true` in `config/package-solution.json` and
  asserted by the package-truth proof (check A7).
- **Page-picker discovery**: once the app is tenant-wide enabled, any
  modern page on any site can insert the Article Publisher via
  *Edit → + → search "Article Publisher"*. The webpart is visible in
  the toolbox (`hiddenFromToolbox: false`).
- **One instance per authoring page**: a page only needs one Article
  Publisher instance — it renders the whole authoring surface.

### Declared toolbox visibility intent

The Article Publisher is **intentionally page-picker discoverable**
(`hiddenFromToolbox: false`). Phase 19 Prompt-01 locked in site-scoped
install + modern page web part picker discovery as the final
deployment model; any flip back to `hiddenFromToolbox: true` requires
re-deciding the deployment model and updating this runbook. The same
intent is emitted into `dist/sppkg/hb-publisher-hosted-deployment-plan.json`
under `deploymentModel.toolboxVisibility` and asserted by the
package-truth proof (check A6).

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
| Deployment model     | `tenant-scoped-webpart`                        |

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

### 1. Upload the package to the tenant app catalog

```powershell
Connect-PnPOnline -Url "https://hedrickbrotherscom.sharepoint.com/sites/apps" -Interactive
Add-PnPApp -Path "./dist/sppkg/hb-publisher.sppkg" -Scope Tenant -Overwrite
```

The `Add-PnPApp` command uploads the package but does not yet trust or
enable it. SharePoint will surface the enablement modal either
immediately or on the next manual review of the app catalog UI.

### 2. Select the tenant-wide enablement option in the modal

SharePoint displays an enablement modal with two options:

- **Enable this app** — the app is trusted but only made available for
  per-site install.
- **Enable this app and add it to all sites** — the app is trusted
  and automatically deployed to every existing site plus any new
  site in the tenant. **Select this option.**

If only a reduced dialog appears without the second option, the
packaged `AppManifest.xml` is missing `SkipFeatureDeployment="true"`.
Stop and inspect — this is the Phase 20 failure mode; see diagnostics
below.

Alternately from PowerShell, after the modal is approved:

```powershell
Publish-PnPApp -Identity "hb-publisher" -Scope Tenant -SkipFeatureDeployment
```

Verify with `Get-PnPApp -Scope Tenant` that `hb-publisher` is listed
with `Deployed = True`.

### 3. Add the Article Publisher to a modern page

On any site in the tenant:

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

### 4. Validate successful runtime load

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

| Symptom                                                              | Diagnosis                                                                                                        | Fix                                                                                                                                     |
|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Upload modal shows only the reduced (single-option) enablement dialog | Emitted `AppManifest.xml` is missing `SkipFeatureDeployment="true"`. Source `skipFeatureDeployment` is not `true`. | Inspect `config/package-solution.json`; confirm `skipFeatureDeployment: true`; rebuild. Package-truth proof A7 must pass.                |
| `Get-PnPApp -Scope Tenant` shows `Deployed = False`                  | Tenant-wide enablement not completed.                                                                            | Re-open the enablement modal; select "Enable this app and add it to all sites"; or `Publish-PnPApp -SkipFeatureDeployment`.             |
| Article Publisher is not listed in the modern page web part picker   | Tenant-wide deployment still propagating, or browser cached a stale picker listing.                              | Wait 15–30 minutes for propagation; hard refresh (Ctrl-Shift-R) the page.                                                               |
| Page renders a `role="alert"` box with "webPartId … is not mapped"   | Shell invoked `mount()` with a webPartId that is not `ARTICLE_PUBLISHER_WEBPART_ID`.                             | Remove the stale webpart from the page and re-insert the Article Publisher via the picker.                                              |
| `window.__hbIntel_hbPublisher` is `undefined` at runtime             | Bundle did not load (service-worker cached a prior release, or sppkg is stale).                                  | Hard refresh (Ctrl-Shift-R). Confirm bundle path in the deployment plan matches App Catalog CDN.                                        |
| Page shows blank / no authoring surface, no alert box                | `mount()` was never called — the page does not have the Article Publisher inserted.                              | Edit the page and add the Article Publisher through the modern page web part picker.                                                    |

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
