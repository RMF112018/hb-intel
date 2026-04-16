# Prompt 01 — Align deployment model with intended SharePoint workflow

## Objective
Close the primary blocker identified in the audit: `hb-publisher` is currently packaged with tenant-scoped deployment semantics while the failing validation workflow is site-level add-app/discovery.

Your job is to make the package and the expected SharePoint validation path match.

## Required target
Use the following as the default closure target unless repo truth contains explicit product-owner instruction that the Publisher must remain a governed host-page-only surface:

- `hb-publisher` must support **site-scoped installation**
- the package must be installable to a target site through the supported SharePoint path for site-scoped SPFx solutions
- after install, the Publisher must be discoverable through the **modern page web part picker** on that site

If repo-truth product doctrine clearly requires the governed host-page / tenant-scoped model instead, do not defer. Implement that model consistently and remove false site-install expectations from the codebase and docs.

## Files to inspect first
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/deployment/README.md`
- `apps/hb-publisher/deployment/Add-ArticlePublisherWebPart.ps1`
- `tools/build-spfx-package.ts`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required work
1. Audit `skipFeatureDeployment` and align it to the intended workflow.
2. If the closure target is site-scoped install/discovery, set the package up for that posture and remove conflicting admin-only deployment assumptions.
3. If the closure target is tenant-scoped governed deployment, keep that posture but remove site-install expectations and make the validation runbook accurate.
4. Bump package version appropriately.
5. Ensure the emitted deployment docs and proof artifacts describe the same model the code actually implements.

## Proof of closure
Provide repo-truth proof showing:
- final `package-solution.json` posture
- the exact expected SharePoint install path after the fix
- the exact expected discovery path after the fix
- the rebuilt `.sppkg` version
- any generated proof artifacts or runbook updates that confirm the intended model

## Constraints
- no unrelated feature work
- no UI redesign
- no speculative future-wave notes
- do not stop at “package builds”
- closure requires the deployment path and discovery path to be unambiguous and internally consistent
