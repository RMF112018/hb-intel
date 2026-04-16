# Plan Summary

## Audit-derived conclusion
The uploaded `.sppkg` is structurally valid. The primary blocker is that `hb-publisher` is currently authored as a **tenant-scoped SPFx solution** while the failing validation path is a **site-level add-app/discovery** workflow.

## Primary closure objective
Make the Publisher actually deployable and discoverable in the intended SharePoint workflow, and eliminate repo/package ambiguity.

## Closure units
1. Align `skipFeatureDeployment` with the intended SharePoint deployment model.
2. Remove repo/package/version/semantic drift so emitted artifacts match `main`.
3. Correct toolbox visibility semantics and make runbook/test expectations match the actual package.

## Non-goals
- no UI redesign
- no feature expansion
- no unrelated data-model work
- no broad platform refactor

## Files that will likely matter
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-publisher/deployment/README.md`
- `apps/hb-publisher/deployment/Add-ArticlePublisherWebPart.ps1`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json`
- any packaging proof or emitted deployment-plan generation seams touched by the above
