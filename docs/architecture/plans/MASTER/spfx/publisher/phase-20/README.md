# HB Publisher tenant-wide enablement remediation prompt package

## Purpose
Restore SharePoint's recognition of `hb-publisher.sppkg` as tenant-wide enableable so the modern app-catalog upload modal offers the expected two-path choice ("Enable this app" vs. "Enable this app and add it to all sites").

This package is intentionally narrow. It is about:
- the `skipFeatureDeployment` flag in `apps/hb-publisher/config/package-solution.json`
- the `SkipFeatureDeployment` attribute emission in the packaged `AppManifest.xml`
- the downstream runbook / emitted-plan / package-truth artifacts that must match the restored tenant-wide posture

It is not:
- a toolbox-visibility audit (Phase 19 Prompt 03 already locked `page-picker-discoverable`; that axis does not move)
- a general SPFx packaging audit (Phase 19 Prompts 01–03 closed the cross-cutting drift assertions)
- a runtime / authoring-surface audit
- a product-feature change

## Audit authority
Live `main` at `https://github.com/RMF112018/hb-intel.git`, the emitted `dist/sppkg/hb-publisher.sppkg@1.0.0.72`, and the SharePoint upload-modal screenshot provided in-session.

## Root cause (one line)
`apps/hb-publisher/config/package-solution.json` sets `skipFeatureDeployment: false`, which causes gulp to emit `AppManifest.xml` without the `SkipFeatureDeployment="true"` attribute; SharePoint gates the tenant-wide enablement modal on that single attribute.

## Evidence confirmed before this package was written
- `hb-publisher` is the only app in the monorepo with `skipFeatureDeployment: false`. All 15 sibling SPFx apps (including `hb-webparts`, `leadership`, `estimating`, `project-hub`, etc.) have `true`.
- Microsoft's current documentation (https://learn.microsoft.com/en-us/sharepoint/dev/spfx/tenant-scoped-deployment) confirms the attribute-to-modal contract.
- The repo's own deployment runbook `docs/maintenance/spfx-deployment-runbook.md` requires `skipFeatureDeployment: true` and instructs operators to select "Make this solution available to all sites" during upload.
- Inspection of `dist/sppkg/hb-publisher.sppkg@1.0.0.72` `AppManifest.xml` shows no `SkipFeatureDeployment` attribute on `<App>`.

## Package contents
- `Plan-Summary.md`
- `Prompt-01-Restore-tenant-wide-enablement-posture.md`

## Required posture
- Do not broaden scope beyond tenant-wide enablement.
- Do not reopen Phase 19's toolbox-visibility decision (`page-picker-discoverable` remains correct; it is orthogonal).
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Every change must carry proof that `AppManifest.xml` now emits `SkipFeatureDeployment="true"` and that the upload modal renders the expected two-path choice.

## Mandatory closure rule
Closure requires:
1. Source config flipped to `skipFeatureDeployment: true` and version bumped.
2. Emitted `AppManifest.xml` proven to contain `SkipFeatureDeployment="true"`.
3. Downstream runbook, emitted deployment-plan, and package-truth proof all describe the tenant-scoped posture consistently (Phase 19 Prompt-02 assertion A4 will auto-verify the kind flip).
4. SharePoint tenant upload confirmed to render the two-path modal.

No soft deferrals. No partial closure.
