# 01 Preflight Tenant Schema

## Local Validation

- Branch: `main`
- Recent Foleon commits present:
  - `3022358e6 hb-intel-foleon: add project spotlight and company pulse readers`
  - `b2052ff85 hb-intel-foleon: add two-lane reader resolution service`
  - `0c82587f0 hb-intel-foleon: add two-lane reader schema contracts`
- PnP.PowerShell: `3.1.0`
- PowerShell: `7.5.4`

## Repo Truth Confirmed

Checked the schema constants and Feature XML before mutation:

- `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`
- `apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml`
- `apps/hb-intel-foleon/sharepoint/assets/schema-homepage-placements.xml`
- `apps/hb-intel-foleon/sharepoint/assets/schema-interaction-events.xml`

Repo truth contains the Prompt 01 content fields, content type choices, placement choices, and 1.0.18.0 telemetry `PageContext` choices.

## Tenant List Resolution

All approved list identities resolved before mutation:

- `HB_FoleonContentRegistry` -> title `Foleon Content Registry`, root `/sites/HBCentral/Lists/HB_FoleonContentRegistry`
- `HB_FoleonHomepagePlacements` -> title `Foleon Homepage Placements`, root `/sites/HBCentral/Lists/HB_FoleonHomepagePlacements`
- `HB_FoleonInteractionEvents` -> title `Foleon Interaction Events`, root `/sites/HBCentral/Lists/HB_FoleonInteractionEvents`
- `HB_FoleonSyncRuns` -> title `Foleon Sync Runs`, root `/sites/HBCentral/Lists/HB_FoleonSyncRuns` inspect-only

## Preflight Export

The full preflight field snapshot is stored at `exports/preflight-fields.json`.

No tenant mutation was performed until after site reachability, list resolution, and preflight field export completed.
