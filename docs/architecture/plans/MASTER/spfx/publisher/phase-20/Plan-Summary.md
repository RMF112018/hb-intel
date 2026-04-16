# Plan Summary

## Objective
Close the `hb-publisher` post-upload SharePoint availability issue by reconciling deployment doctrine, source manifest semantics, packaging proof, and SharePoint validation workflow.

## Audit-backed decision
Default to the **admin-managed governed host-page** model unless the agent finds a newer authoritative governing file in `main` that explicitly supersedes:
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-publisher/deployment/README.md`
- `apps/hb-publisher/deployment/Add-ArticlePublisherWebPart.ps1`
- `tools/build-spfx-package.ts`

Reason:
- these files are executable/current repo truth
- they are internally aligned around the governed host-page story except for the hidden-toolbox authoring defect
- the contradictory phase-19 narrative is documentation-level drift unless backed by current executable code and runbook updates

## Closure units
1. Lock the authoritative deployment model and reconcile contradictory doctrine.
2. Fix manifest authoring and package semantic proof so the emitted package matches the chosen model.
3. Rebuild and prove closure with package inspection plus SharePoint workflow validation steps that match the chosen model.

## Non-goals
- no authoring-surface redesign
- no blocked-destination cleanup
- no unrelated SPFx hardening
- no broad repo audit