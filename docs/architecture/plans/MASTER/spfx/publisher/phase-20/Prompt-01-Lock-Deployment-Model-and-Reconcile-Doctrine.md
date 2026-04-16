# Prompt 01 — Lock the Deployment Model and Reconcile Doctrine

## Objective
Resolve the contradiction in `main` about what `hb-publisher` is supposed to be at deployment time, then make repo doctrine align to a single supported model.

## Scope
Only these seams:
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-publisher/deployment/README.md`
- `apps/hb-publisher/deployment/Add-ArticlePublisherWebPart.ps1`
- `tools/build-spfx-package.ts`
- publisher deployment/closure docs that directly contradict the chosen deployment posture

## Required audit stance
Do not assume the later narrative doc is authoritative merely because it is newer.
Prefer executable/current repo truth over historical closure prose.
If code, runbook, and packaging pipeline still support the governed host-page model, treat that as the authoritative target and repair the contradictory docs.

## Required work
1. Audit the above files and identify every statement or behavior that implies:
   - governed host-page / GUID insertion / hidden toolbox / tenant-scoped deployment
   - versus site-scoped install / picker visibility / non-hidden toolbox / no insertion script
2. Choose **one** deployment model and make all in-scope docs consistent with it.
3. Remove or rewrite contradictory publisher deployment docs in `main` so a future audit cannot conclude two different operating models at once.
4. Preserve only the model that the repo is actually going to support after this prompt package is complete.

## Default decision rule
Unless newer executable repo truth proves otherwise, standardize on:

- `skipFeatureDeployment: true`
- admin-managed governed host page
- insertion by GUID via `Add-ArticlePublisherWebPart.ps1`
- SharePoint validation path = tenant deployment + governed page insertion, **not** site add-app discovery

## Proof of closure
- One deployment model only.
- No contradictory runbook / closure text remains in `main` for Publisher deployment.
- The surviving README explicitly states the supported SharePoint validation path.