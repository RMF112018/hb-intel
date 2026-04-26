# 15 — Risk Register and Decisions

## Decisions

### D01 — Registry First

The `HB Platform Configuration Registry` is now a prerequisite implementation step, not a future enhancement.

### D02 — SharePoint Registry for Non-Secrets

Use an HBCentral SharePoint list as the non-secret configuration index.

### D03 — Secrets Stay Out of SharePoint

Secrets must remain in Key Vault, App Configuration references, app settings, or backend-managed configuration. SharePoint registry records may store only references.

### D04 — Property Pane Remains Fallback/Override

SPFx property-pane values remain valid for route selection, bootstrap, emergency override, and page-local overrides, but not as the primary long-term configuration source.

### D05 — Foleon Manager Config Tab Becomes Registry-Aware

The Config tab should manage/display registry-backed values and runtime proof rather than becoming another independent configuration store.

## Risks

| Risk | Exposure | Mitigation |
| --- | --- | --- |
| Registry provisioning fails due to app permission gaps | High | Validate app ID `08c399eb-a394-4087-b859-659d493f8dc7` access before live provisioning; document exact permission gap. |
| SharePoint index limits block some indexes | Medium | Document skipped indexes and adjust query discipline. |
| Duplicate active config records create ambiguous runtime config | High | Validation script must block duplicate active logical keys. |
| Secrets accidentally stored in SharePoint | High | Validation script scans secret-like keys and values; secret values are never seeded. |
| Registry reader creates performance overhead | Medium | Cache non-secret resolved config per page load. |
| Existing page property behavior breaks | Medium | Preserve property-pane override compatibility during migration. |
| Backend safe config and registry disagree | Medium | Config tab must show both source and validation status. |
| Marketing users get too much config control | Medium | Separate marketing content workflow from admin config editing. |

## Open Decisions for Execution

- Whether registry reads should be performed directly by SPFx through SharePoint APIs, through backend safe-config endpoints, or both.
- Whether Azure App Configuration should be introduced immediately or deferred until after SharePoint registry stabilization.
- Exact Entra group names for platform config admins and Foleon marketing editors.
