# 05 Tenant Validation Runbook

## Purpose

Use this runbook after tenant deployment or page configuration changes to confirm the live Foleon reader schema remains aligned with `hb-intel-foleon` 1.0.18.0.

## Preconditions

- Prompt 01 schema fields have been provisioned.
- The app package has not been deployed by this provisioning pass.
- Existing reader web part page instances should use `expectedPackageVersion` `1.0.18.0` after package rollout.

## Validation Steps

1. Open HBCentral site contents and confirm these lists exist:
   - `Foleon Content Registry`
   - `Foleon Homepage Placements`
   - `Foleon Interaction Events`
   - `Foleon Sync Runs`
2. Confirm the root folders remain:
   - `/sites/HBCentral/Lists/HB_FoleonContentRegistry`
   - `/sites/HBCentral/Lists/HB_FoleonHomepagePlacements`
   - `/sites/HBCentral/Lists/HB_FoleonInteractionEvents`
   - `/sites/HBCentral/Lists/HB_FoleonSyncRuns`
3. Confirm `HB_FoleonContentRegistry` has the seven two-lane fields and required indexes.
4. Confirm `ContentTypeKey`, `PlacementKey`, and `PageContext` include the new values.
5. Run the four read-only REST probes recorded in `exports/query-probe-results.json`.
6. After package deployment, validate the Project Spotlight and Company Pulse routes in the browser and confirm no runtime proof/version mismatch.

## Do Not

- Do not recreate lists.
- Do not delete fields or indexes.
- Do not mutate content or placement rows as part of schema validation.
- Do not deploy `.sppkg` from this runbook.
