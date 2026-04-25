# Tenant Provisioning 2026-04-25

## Objective

Provision the Prompt 01 two-lane Foleon schema fields and choice values into the live HBCentral tenant so `hb-intel-foleon` 1.0.18.0 reader routes can operate without tenant schema drift.

## Tenant

- Site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- App/client ID: `08c399eb-a394-4087-b859-659d493f8dc7`
- Auth command used: `Connect-PnPOnline -Url "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" -ClientId "08c399eb-a394-4087-b859-659d493f8dc7" -Interactive`

## Evidence Files

- `01_PREFLIGHT_TENANT_SCHEMA.md`
- `02_PROVISIONING_ACTIONS.md`
- `03_POST_PROVISIONING_SCHEMA.md`
- `04_QUERY_PROBE_RESULTS.md`
- `05_TENANT_VALIDATION_RUNBOOK.md`
- `06_LOCAL_AGENT_CLOSURE_REPORT.md`
- `exports/preflight-fields.json`
- `exports/post-provision-fields.json`
- `exports/query-probe-results.json`
- `exports/provisioning-run-summary.json`

## Scope Notes

The approved list identities use internal/root-folder names. The live display titles are `Foleon Content Registry`, `Foleon Homepage Placements`, `Foleon Interaction Events`, and `Foleon Sync Runs`, with root folders matching the approved `HB_Foleon*` identities.

No SharePoint lists were recreated, no list rows were modified, no package was deployed, and no package/runtime version files were changed.
