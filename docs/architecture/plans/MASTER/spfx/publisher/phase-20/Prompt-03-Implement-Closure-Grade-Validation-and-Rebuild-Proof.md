# Prompt 03 — Implement Closure-Grade Validation and Rebuild Proof

## Objective
Rebuild `hb-publisher.sppkg` from clean repo truth, inspect the emitted package directly, and produce closure-grade proof plus a SharePoint validation workflow that matches the chosen model.

## Scope
Only these seams:
- `tools/build-spfx-package.ts`
- `apps/hb-publisher/deployment/README.md`
- Publisher proof artifacts emitted to `dist/sppkg/`
- any Publisher-specific validation or deployment helper that is directly needed to prove the chosen model

## Required work
1. Run a clean Publisher packaging path from the authoritative repo state.
2. Inspect the emitted `.sppkg` directly and verify:
   - `AppManifest.xml`
   - feature XML
   - packaged webpart XML / packaged component manifest
   - packaged `supportedHosts`
   - packaged `hiddenFromToolbox`
   - packaged solution version
3. Ensure emitted proof artifacts capture the chosen model explicitly.
4. Update the README validation steps so they no longer tell operators to use the wrong SharePoint workflow.

## SharePoint validation requirements
### If the chosen model is governed host page
The README must validate with:
- upload to tenant app catalog
- tenant deployment/enablement
- governed page resolution
- `Add-ArticlePublisherWebPart.ps1`
- page render validation

It must **not** use site add-app discoverability as closure criteria.

### If the chosen model is site-scoped / picker-visible
The README must validate with:
- upload to tenant app catalog
- site installation
- modern page edit
- toolbox discovery
- insertion and render validation

It must **not** retain GUID insertion/governed-host-page-only language.

## Final outputs required
- rebuilt `hb-publisher.sppkg`
- updated Publisher proof artifacts
- updated deployment README
- concise closure note summarizing:
  - chosen model
  - packaged truth
  - exact SharePoint validation path

## Proof of closure
A fresh auditor must be able to read the repo, inspect the emitted `.sppkg`, and reach **one** answer about how Publisher is meant to surface in SharePoint.