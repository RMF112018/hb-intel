# Repo vs Tenant Schema Comparison

Generated from Feature Framework XML assets and tenant `SchemaXml` exports.

| List | Tenant title | GUID | Items | Custom fields | Drift |
|---|---|---|---:|---:|---|
| `HB_FoleonContentRegistry` | `Foleon Content Registry` | `2e57615d-457e-49b8-aef3-038e85cbe068` | 0 | 39/39 | none detected for provisioned custom fields |
| `HB_FoleonHomepagePlacements` | `Foleon Homepage Placements` | `5b4754b6-9411-453d-8e16-1247ec5b476a` | 0 | 10/10 | none detected for provisioned custom fields |
| `HB_FoleonInteractionEvents` | `Foleon Interaction Events` | `7786b5ac-d1e5-418b-9951-8e797dda3d7a` | 0 | 13/13 | none detected for provisioned custom fields |
| `HB_FoleonSyncRuns` | `Foleon Sync Runs` | `f29dabe9-16c8-4c67-ab9e-98e12f771680` | 0 | 12/12 | none detected for provisioned custom fields |

## Notes

- Display titles intentionally differ from internal URL segments: Feature Framework provisions titles like `Foleon Content Registry` and roots like `/Lists/HB_FoleonContentRegistry`.
- The tenant content registry has zero items, but schema validation and REST probes can still fail before row materialization when `$select` is invalid.
- The content registry custom field set, required flags, index flags, and uniqueness flag for `FoleonDocId` match the Feature Framework XML export.
