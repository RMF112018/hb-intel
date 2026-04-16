# Prompt 01 — Restore tenant-wide enablement posture

## Objective
Close the single blocker preventing SharePoint from recognizing `hb-publisher.sppkg` as tenant-wide enableable: `apps/hb-publisher/config/package-solution.json` currently sets `skipFeatureDeployment: false`, which suppresses the `SkipFeatureDeployment="true"` attribute from the emitted `AppManifest.xml`. Restore the flag to `true`, rebuild, and align the downstream runbook + emitted plan with the tenant-scoped posture. Phase 19 Prompt-02 already made the orchestrator dynamic on this axis, so zero orchestrator code change is needed for the core fix.

## Required target
- `apps/hb-publisher/config/package-solution.json` → `solution.skipFeatureDeployment: true`.
- Solution + feature version bumped from `1.0.0.72` → `1.0.0.73`.
- Emitted `hb-publisher.sppkg` `AppManifest.xml` carries `SkipFeatureDeployment="true"` on the `<App>` element.
- Emitted `hb-publisher-hosted-deployment-plan.json` carries `deploymentModel.kind: "tenant-scoped-webpart"`, `install.scope: "Tenant"`, and the tenant-scoped discovery block.
- Emitted `hb-publisher-package-truth-proof.json` `checks.deploymentPostureAlignment.pass: true` with A4 confirming the kind flip.
- `apps/hb-publisher/deployment/README.md` rewritten for `Add-PnPApp -Scope Tenant` upload and the "Enable this app and add it to all sites" modal path. Toolbox-visibility subsection (page-picker-discoverable) retained unchanged.

## Files to inspect first
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/deployment/README.md`
- `tools/build-spfx-package.ts` (only for optional A7 assertion — do not modify the `deriveDeploymentModelKind()` branches; they are already correct)

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required work

### Change 1 — Source flag + version bump
Edit `apps/hb-publisher/config/package-solution.json`:
- `solution.skipFeatureDeployment: false` → `true`
- `solution.version: "1.0.0.72"` → `"1.0.0.73"`
- `solution.features[0].version: "1.0.0.72"` → `"1.0.0.73"`

### Change 2 — Runbook rewrite for tenant-wide upload
Rewrite `apps/hb-publisher/deployment/README.md`:
- Title remains "hb-publisher — … Deployment Runbook". Consider renaming "Site-Scoped Deployment Runbook" → "Tenant-Wide Deployment Runbook" for clarity.
- **Operating model** section: describe tenant-wide enablement + modern page web part picker discovery. Key sentence: "The Article Publisher ships as a tenant-wide SPFx solution. Upload to the tenant app catalog and select 'Enable this app and add it to all sites' to deploy automatically to every site in the tenant."
- **Declared toolbox visibility intent** subsection: keep; remains `page-picker-discoverable` (still correct — that axis is orthogonal to tenant-wide enablement).
- **Stable identifiers** table: update `Deployment model` row to `tenant-scoped-webpart`.
- **Deployment steps**: replace step 1's `-Scope Site` install with `-Scope Tenant` install. Add a step about the modal selection: "After upload, SharePoint displays the enablement modal with two options: 'Enable this app' (makes it available to enable per-site later) and 'Enable this app and add it to all sites' (immediately deploys everywhere). Select the second."
- **Failure diagnostics** table: replace "app deployment stuck at per-site" entries with tenant-equivalents (e.g., "modal shows only reduced dialog → `AppManifest.xml` missing `SkipFeatureDeployment='true'` → source `skipFeatureDeployment` is not `true`; rebuild from current source").
- **Offline runtime proof** table: unchanged — same four artifacts ship.

### Change 3 — Optional assertion A7 (recommended, belt-and-braces)
Extend `tools/build-spfx-package.ts`:
- `PackagedAppManifestAttrs` interface: add `skipFeatureDeployment: boolean` (derived from attribute presence + value).
- `extractPackagedAppManifestAttrs()`: read `SkipFeatureDeployment` attribute with the same word-boundary-anchored regex pattern used for `Version`. When absent, treat as `false`; when present, parse the `"true"` / `"false"` string.
- In `buildHbPackageTruthProof()`'s hb-publisher branch, add **A7**: assert `extracted.skipFeatureDeployment === sourcePackageSolution.solution.skipFeatureDeployment === true`. Fail packaging non-zero on mismatch. Append the result to `checks.deploymentPostureAlignment.details` as a seventh line.
- Do not alter A1–A6 logic.

### Change 4 — Rebuild
Run `npx tsx tools/build-spfx-package.ts --domain hb-publisher`. Expect success, `.sppkg` at `1.0.0.73`, all proof artifacts regenerated.

## Proof of closure
Provide, in-chat and via emitted artifacts:

1. Final `apps/hb-publisher/config/package-solution.json` showing `skipFeatureDeployment: true`, version `1.0.0.73`.
2. `unzip -p dist/sppkg/hb-publisher.sppkg AppManifest.xml` output containing `SkipFeatureDeployment="true"` on the `<App>` element.
3. `dist/sppkg/hb-publisher-package-truth-proof.json`:
   - `deploymentPosture.skipFeatureDeployment: true`
   - `deploymentPosture.kind: "tenant-scoped-webpart"`
   - `checks.deploymentPostureAlignment.pass: true`
   - A4 detail line reads `"A4: emitted deploymentModel.kind (tenant-scoped-webpart) matches source-derived kind from skipFeatureDeployment=true"`.
   - If Change 3 landed, A7 detail line confirms the emitted `SkipFeatureDeployment="true"` attribute.
4. `dist/sppkg/hb-publisher-hosted-deployment-plan.json`:
   - `deploymentModel.kind: "tenant-scoped-webpart"`
   - `deploymentModel.install.scope: "Tenant"`
   - `deploymentModel.install.command` contains `-Scope Tenant`.
   - `deploymentModel.toolboxVisibility.kind: "page-picker-discoverable"` (unchanged).
5. `dist/sppkg/hb-publisher-hosted-load-proof.json` still passing.
6. Rewritten runbook prose confirming tenant-wide upload and two-path modal selection.

## Package validation before re-upload
```bash
unzip -p dist/sppkg/hb-publisher.sppkg AppManifest.xml | grep -c 'SkipFeatureDeployment="true"'
# expected: 1

grep -E 'deploymentPosture|deploymentPostureAlignment|skipFeatureDeployment' dist/sppkg/hb-publisher-package-truth-proof.json
# expected: skipFeatureDeployment=true; kind=tenant-scoped-webpart; pass=true

grep -E 'deploymentModel|install|discovery' dist/sppkg/hb-publisher-hosted-deployment-plan.json
# expected: kind=tenant-scoped-webpart; scope=Tenant
```

## SharePoint re-test workflow
1. `Connect-PnPOnline -Url "https://hedrickbrotherscom.sharepoint.com/sites/apps" -Interactive`
2. `Add-PnPApp -Path "./dist/sppkg/hb-publisher.sppkg" -Scope Tenant -Overwrite`
3. **Observe the enablement modal.** Expect two options:
   - "Enable this app"
   - "Enable this app and add it to all sites"
   If only the reduced dialog appears, closure has failed — inspect `AppManifest.xml` again.
4. Select "Enable this app and add it to all sites". Confirm.
5. `Get-PnPApp -Scope Tenant` → expect `hb-publisher` with `Deployed: True`.
6. On any modern page, Edit → + → search "Article Publisher". Expect the webpart in the picker (tests that page-picker-discoverable visibility intent survived the flip).
7. Insert the webpart, publish the page, confirm the authoring surface loads (DevTools: `window.__hbIntel_hbPublisher` exposes `mount` + `unmount`).

## Constraints
- No unrelated feature work.
- No UI redesign.
- No reopening of toolbox-visibility decision (`page-picker-discoverable` remains correct).
- No changes to other domains' package-solution.json.
- No changes to SPFx shell gulp pipeline beyond Phase 19.
- Do not stop at "package builds"; closure requires the SharePoint-side modal behavior to match expectation.
- Do not claim completion without artifact-level + tenant-level proof.
