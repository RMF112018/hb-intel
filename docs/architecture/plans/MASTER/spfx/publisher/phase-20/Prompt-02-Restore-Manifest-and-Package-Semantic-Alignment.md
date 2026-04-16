# Prompt 02 — Restore Manifest and Package Semantic Alignment

## Objective
Make the emitted `hb-publisher.sppkg` semantically match the chosen deployment model, and make packaging fail when those semantics drift again.

## Scope
Only these seams:
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-publisher/config/package-solution.json`
- `tools/build-spfx-package.ts`
- any directly-generated Publisher package-truth / deployment-plan proof artifact logic inside the orchestrator
- `tools/spfx-shell/` only if needed to carry the corrected manifest semantics through packaging

## Known issue to close
The repo currently expresses hidden/admin-only intent incorrectly and incompletely:
- `hiddenFromToolbox` is authored in the wrong place / not validated as a first-class deployment semantic
- package-truth checks do not fail on toolbox-discovery posture drift
- emitted artifacts have diverged from source truth in prior audits

## Required work
1. Fix `ArticlePublisherWebPart.manifest.json` so toolbox visibility is authored in the correct SPFx-supported manifest location for the chosen model.
2. Ensure the packaging path preserves that semantic into the packaged component manifest.
3. Add explicit package-truth validation for:
   - `hiddenFromToolbox`
   - `skipFeatureDeployment`
   - repo version versus emitted `AppManifest.xml` version
   - deployment-model summary consistency for Publisher
4. Make the packaging run fail if the packaged Publisher manifest contradicts source truth on any of the above.
5. Ensure Publisher-specific proof artifacts clearly state whether the package is:
   - governed hidden/admin-managed, or
   - normal picker-visible/site-installed

## Required decision discipline
Do **not** force normal picker visibility unless Prompt 01 chose that model.
If Prompt 01 kept the governed host-page model, then this prompt must ensure the package truth actually encodes and proves that model.

## Proof of closure
- Clean rebuild produces an `.sppkg` whose packaged component manifest matches source truth.
- Package-truth proof fails if `hiddenFromToolbox`, `skipFeatureDeployment`, or version drift reappears.
- Publisher deployment-plan/proof artifacts describe the same deployment model as the runbook.