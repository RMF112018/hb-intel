# HB Publisher SPFx Build / Packaging / Deployment Audit

## Phase 1 — Audit framing

### Objective
Determine the exact blocker preventing `hb-publisher.sppkg` from becoming a usable, discoverable SharePoint application, with emphasis on SPFx build, packaging, deployment model, and SharePoint discovery semantics.

### Primary symptom
The package uploads to the tenant app catalog, but the expected Publisher experience is not surfacing through the workflow being used in SharePoint.

### Inputs audited
- Live repo: `RMF112018/hb-intel`, branch `main`
- Attached emitted artifact: `hb-publisher(4).sppkg`

### Core distinction
A successful app-catalog upload is only proof that SharePoint accepted the `.sppkg` container. It is **not** proof that:
- the package matches repo truth,
- the package supports the workflow being attempted,
- the web part is site-installable,
- the web part is visible in the page toolbox,
- or the product’s documented deployment model matches the emitted package.

---

## Phase 2 — Repo-truth implementation map

1. **Source manifest**
   - `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
   - Declares the Article Publisher component GUID, SharePoint host support, and preconfigured entry metadata.

2. **Runtime seam**
   - `apps/hb-publisher/src/mount.tsx`
   - Publishes `__hbIntel_hbPublisher` and maps the stable web part GUID to `ArticlePublisher`.
   - `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts`
   - Holds the single source of truth for the stable web part GUID.

3. **Vite build**
   - `apps/hb-publisher/vite.config.ts`
   - Produces an IIFE bundle named `hb-publisher-app.js` before the packaging orchestrator content-hashes it.

4. **SPFx shell build**
   - `tools/spfx-shell/gulpfile.js`
   - Injects the Vite output into the SPFx shell build via webpack and DefinePlugin.
   - `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
   - Loads the hashed bundle at runtime and calls `mount/unmount`.

5. **Packaging assembly**
   - `tools/build-spfx-package.ts`
   - Builds the Vite app.
   - Copies artifacts into `tools/spfx-shell/assets`.
   - Writes shell manifest + `package-solution.json` into the shell project.
   - Runs `gulp bundle --ship` and `gulp package-solution --ship`.
   - Copies the final `.sppkg` to `dist/sppkg/`.

6. **Repo-declared deployment posture**
   - `apps/hb-publisher/config/package-solution.json` sets `skipFeatureDeployment: true`.
   - `apps/hb-publisher/deployment/README.md` declares an **admin-managed host-page** deployment model, with insertion by GUID using `Add-ArticlePublisherWebPart.ps1`.

---

## Phase 3 — Artifact-truth inspection

### Structural validity
The attached `.sppkg` is structurally valid:
- `[Content_Types].xml` present
- `_rels/.rels` present
- `AppManifest.xml` present
- `ClientSideAssets/` present
- `feature_*.xml` present
- `WebPart_<GUID>.xml` present
- hashed JS/CSS assets present

### Packaged component identity
The package contains:
- App bundle: `ClientSideAssets/hb-publisher-app-8e540b4e.js`
- Shell entry: `ClientSideAssets/shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-3fd81f9c.js`
- CSS: `ClientSideAssets/spfx-hb-publisher-d3f31daa.css`
- Web part XML for component ID `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10`

### Packaged deployment posture
The artifact version is `1.0.0.69`.
The repo `main` `package-solution.json` version is still `1.0.0.67`.
So the uploaded artifact does **not** cleanly match current repo truth.

### Packaged toolbox posture
The packaged `ComponentManifest` inside `WebPart_1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10.xml` resolves to:
- `supportedHosts: ["SharePointWebPart"]`
- `hiddenFromToolbox: false`

That means the emitted package is **page-toolbox discoverable**, not hidden/admin-only, once it is deployed in a way SharePoint recognizes for that site/page context.

### Workflow the package actually supports
Because repo truth sets `skipFeatureDeployment: true`, the package supports a **tenant-scoped** deployment posture, not a site-level “Add an app” discovery posture.

---

## Phase 4 — Exhaustive findings

### Finding 1 — Primary blocker: deployment-model mismatch
**Severity:** Critical  
**Primary or secondary:** Primary blocker

**Repo-truth evidence**
- `apps/hb-publisher/config/package-solution.json` sets `skipFeatureDeployment: true`.
- Repo deployment docs describe a governed, admin-managed deployment rather than a self-service site install flow.

**Packaged-artifact evidence**
- The package is structurally valid, so the failure is not “SharePoint rejected the package.”
- The artifact remains an SPFx client-side solution package, but nothing in the package changes the fact that the repo is authoring it for tenant-scoped deployment.

**Why it matters**
The workflow being attempted — adding the app at a site and expecting that action itself to reveal the Publisher in site context — is incompatible with the current deployment posture. With `skipFeatureDeployment: true`, SharePoint does not use the normal site-level add-app discovery path for the solution.

**Exact correction direction**
Choose one deployment model and implement it consistently end-to-end:
- **If site-level install is required:** change `skipFeatureDeployment` to `false`, rebuild, redeploy, and validate via site contents + page picker.
- **If tenant-scoped deployment is required:** keep `skipFeatureDeployment: true`, stop using site add-app as the validation path, deploy from tenant app catalog, and validate in the page toolbox / governed host-page flow instead.

---

### Finding 2 — Repo/package drift is real
**Severity:** High  
**Primary or secondary:** Secondary, confidence-destroying contributor

**Repo-truth evidence**
- `apps/hb-publisher/config/package-solution.json` in `main` is version `1.0.0.67`.

**Packaged-artifact evidence**
- Uploaded `AppManifest.xml` is version `1.0.0.69`.

**Why it matters**
The emitted artifact is not provably from the exact repo state under audit. That means any claim that “the package reflects main” is currently untrusted.

**Exact correction direction**
- Make the package version in repo and emitted artifact match.
- Require fresh-build provenance for release artifacts.
- Fail packaging if the emitted `.sppkg` version diverges from repo truth.

---

### Finding 3 — Hidden/admin-only intent is authored incorrectly and propagated inconsistently
**Severity:** High  
**Primary or secondary:** Secondary, but materially important

**Repo-truth evidence**
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json` puts `hiddenFromToolbox` inside `preconfiguredEntries[0]` instead of as a top-level manifest property.
- `tools/build-spfx-package.ts` writes a shell manifest and composed manifests without copying a top-level `hiddenFromToolbox` field.
- `apps/hb-publisher/deployment/README.md` and `Add-ArticlePublisherWebPart.ps1` explicitly describe the product as hidden/admin-managed.

**Packaged-artifact evidence**
- The emitted `ComponentManifest` inside the `.sppkg` shows `hiddenFromToolbox: false`.

**Why it matters**
The repo’s documentation and insertion script assume the Publisher is hidden and must be added by GUID. The actual uploaded package is not hidden. So repo doctrine, emitted artifact, and validation expectations are misaligned.

**Exact correction direction**
- Move `hiddenFromToolbox` to the correct top-level manifest location if the web part truly must be hidden.
- Update `tools/build-spfx-package.ts` to propagate that property into generated shell/composed manifests.
- Update deployment docs and test workflow so they match the emitted package.

---

### Finding 4 — Package-truth verification currently misses the hidden/discovery semantic that matters here
**Severity:** Medium  
**Primary or secondary:** Secondary

**Repo-truth evidence**
- `tools/build-spfx-package.ts` semantic comparison checks `id`, `alias`, `componentType`, `supportedHosts`, `preconfiguredEntries`, `requiresCustomScript`, `supportsThemeVariants`, and `supportsFullBleed`.
- It does **not** validate a top-level `hiddenFromToolbox` semantic.

**Packaged-artifact evidence**
- The attached package carries different discovery semantics than the repo docs claim, and the existing package-truth guardrail did not prevent that from shipping.

**Why it matters**
The build pipeline can report success while the exact SharePoint discovery behavior the team cares about is still wrong.

**Exact correction direction**
- Add `hiddenFromToolbox` to manifest normalization + semantic comparison.
- Fail packaging when source and packaged discovery posture diverge.
- Emit a deployment-model proof artifact stating whether the package is site-scoped discoverable, tenant-scoped discoverable, or intentionally hidden/admin-only.

---

## Phase 5 — Root cause conclusion

### Exact blocker
The **true blocker is primarily a deployment-model mismatch, not a broken `.sppkg` container**.

The current package is authored as a **tenant-scoped SPFx solution** (`skipFeatureDeployment: true`). The workflow being attempted — **site-level app addition / discovery** — is therefore the wrong validation path for the current package posture.

### Is the current user workflow incompatible with the package configuration?
Yes.
If the expectation is:
1. upload to app catalog,
2. add the app to a site,
3. see the Publisher appear through that site-install path,

then the current package configuration is incompatible with that expectation.

### Is the problem primarily build-pipeline or deployment-semantics?
Primarily **deployment semantics**.

The build pipeline has real secondary issues:
- it is allowing repo/package drift,
- it is not correctly preserving or validating the intended hidden/discoverable semantics,
- and the repo’s deployment docs are out of alignment with the emitted package.

But those are not the main reason the current site-level discovery workflow is failing.

---

## Phase 6 — Recommended remediation plan

### Priority 1 — Decide and lock the intended deployment model
Use **one** of these two closure paths:

#### Path A — Site-scoped install/discovery (recommended if the requirement is “add the app to a site”)
1. In `apps/hb-publisher/config/package-solution.json`, set:
   - `skipFeatureDeployment: false`
2. Bump version.
3. Rebuild a fresh `.sppkg` from current `main`.
4. Upload to tenant app catalog.
5. Add the app to the target site.
6. Edit a modern page and confirm `Article Publisher` appears in the web part picker.
7. Retire or rewrite the admin-only runbook and GUID insertion script if they are no longer the intended model.

#### Path B — Tenant-scoped governed host-page model
1. Keep `skipFeatureDeployment: true`.
2. Stop using site add-app as a validation step.
3. Fix hidden/discovery semantics consistently:
   - correct `hiddenFromToolbox` authoring,
   - propagate it in build output,
   - validate it in package-truth checks.
4. Deploy via tenant app catalog using the tenant-wide enablement workflow.
5. Validate on a page, either:
   - via page toolbox if intentionally discoverable, or
   - via GUID insertion if intentionally hidden.

### Priority 2 — Eliminate repo/package drift
- Update repo `package-solution.json` to match the emitted build version policy.
- Fail builds if emitted `AppManifest.xml` version does not match repo truth.
- Record build provenance in a generated proof artifact.

### Priority 3 — Fix hiddenFromToolbox semantics
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `tools/build-spfx-package.ts`
- Any generated shell/composed manifest path
- Deployment docs/scripts that currently assume hidden/admin-only behavior

### Priority 4 — Expand package-truth validation
Add explicit validation for:
- deployment model (`skipFeatureDeployment`)
- top-level `hiddenFromToolbox`
- repo version vs emitted AppManifest version
- runbook/deployment-plan consistency

### Exact SharePoint validation workflow after fix

#### If Path A (site-scoped) is chosen
1. Upload `.sppkg` to tenant app catalog.
2. Add app to target site.
3. Edit a modern page on that site.
4. Confirm `Article Publisher` appears in the web part picker.
5. Insert it and validate runtime load.

#### If Path B (tenant-scoped) is chosen
1. Upload `.sppkg` to tenant app catalog.
2. Use tenant-wide enablement, not site add-app, as the deployment path.
3. Edit a modern page (or governed host page) on a covered site.
4. Validate discoverability in the page picker, or add by GUID if intentionally hidden.

---

## Phase 7 — Prompt package summary

A remediation prompt package has been generated alongside this report. It is designed to close the specific deployment/discovery issue, not to broaden into unrelated product work.
