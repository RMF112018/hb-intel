# Plan Summary — Phase 20

## Audit-derived conclusion
The emitted `hb-publisher.sppkg@1.0.0.72` does not carry the `SkipFeatureDeployment="true"` attribute on its `AppManifest.xml` `<App>` element because `apps/hb-publisher/config/package-solution.json` sets `skipFeatureDeployment: false`. SharePoint's modern app-catalog upload modal uses that attribute as its sole gate for offering the tenant-wide enablement path. Absent the attribute, only the reduced per-site enablement dialog is rendered.

## How we got here
Phase 19 Prompt-01 (commit `6b644709`) chose site-scoped install + page-picker discovery as the closure target for the deployment-model mismatch identified in the Phase 19 audit. That choice was reasonable from the audit framing but does not match the operator's actual intended workflow (tenant-wide enablement with page-picker discovery). The Phase 19 work landed site-scoped prose in the runbook, site-scoped kind in the emitted plan, and site-scoped-derived assertions in the package-truth proof — all internally consistent with `skipFeatureDeployment: false`, but externally wrong relative to the tenant operational model.

## Primary closure objective
Flip the source flag back to `skipFeatureDeployment: true`, regenerate all downstream artifacts, and confirm the tenant upload modal renders the expected two-path choice. Preserve Phase 19's toolbox-visibility decision (`hiddenFromToolbox: false`, `page-picker-discoverable`) unchanged — that axis is orthogonal to tenant-wide enablement.

## Closure units
1. **Source flag + version bump** (Prompt 01).
   - `apps/hb-publisher/config/package-solution.json` → `skipFeatureDeployment: true`, version `1.0.0.72` → `1.0.0.73`.
2. **Runbook rewrite for tenant-wide upload** (Prompt 01).
   - `apps/hb-publisher/deployment/README.md` → describe `Add-PnPApp -Scope Tenant` upload and "Enable this app and add it to all sites" modal selection. Toolbox-visibility subsection remains accurate (page-picker-discoverable).
3. **Packaging pipeline** (Prompt 01, zero code change expected).
   - `tools/build-spfx-package.ts`'s `deriveDeploymentModelKind()` already returns `tenant-scoped-webpart` when source `skipFeatureDeployment === true`; the install/discovery blocks in the emitted plan branch accordingly. Phase 19 Prompt-02 assertion A4 will auto-flip on rebuild.
4. **Optional A7 assertion** (Prompt 01, recommended).
   - Extend `extractPackagedAppManifestAttrs()` to read the `SkipFeatureDeployment` attribute and add A7 that asserts emitted-attribute-value equals source value. Belt-and-braces; catches future regressions where gulp behavior could drop the attribute silently.

## Non-goals
- No UI redesign.
- No feature expansion.
- No reopening of toolbox-visibility decision.
- No changes to other domains' package-solution.json.
- No changes to the SPFx shell gulp pipeline beyond what Phase 19 already did.

## Files that will matter
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/deployment/README.md`
- `tools/build-spfx-package.ts` (only for the optional A7 assertion)
- emitted: `dist/sppkg/hb-publisher.sppkg`, `dist/sppkg/hb-publisher-package-truth-proof.json`, `dist/sppkg/hb-publisher-hosted-deployment-plan.json`, `dist/sppkg/hb-publisher-hosted-load-proof.json`

## Closure gate
- Source flag at `true`, version at `1.0.0.73`.
- `unzip -p dist/sppkg/hb-publisher.sppkg AppManifest.xml | grep 'SkipFeatureDeployment="true"'` returns a match.
- `hb-publisher-package-truth-proof.json` → `deploymentPosture.skipFeatureDeployment: true`, `deploymentPosture.kind: "tenant-scoped-webpart"`, `checks.deploymentPostureAlignment.pass: true`.
- `hb-publisher-hosted-deployment-plan.json` → `deploymentModel.kind: "tenant-scoped-webpart"`, `install.scope: "Tenant"`.
- Tenant upload renders the two-path modal; operator selects "Enable this app and add it to all sites"; `Get-PnPApp -Scope Tenant` shows `hb-publisher` `Deployed=True`.
