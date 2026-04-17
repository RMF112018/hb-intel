# HBCentral List Schema Reference

## 1. Objective
- Canonical SharePoint list-schema reference package for HBCentral.
- Site covered: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Purpose: provide tenant-backed schema truth for developers and local code agents before wiring list integrations.
- Audience: engineers, maintainers, and code agents building features against HBCentral data contracts.

## 2. Scope
- Extracted all resolvable lists/libraries visible at the site (42 resolved, 0 failed in baseline extraction) and added phase-01 command-band list references provisioned on April 17, 2026.
- Inventory separates business/custom lists, system/OOB lists, hidden/system lists, and document libraries.
- Detailed per-list reports include all business/custom lists plus implementation-relevant system lists.
- Libraries are inventoried; detailed reports are focused on list schemas unless a library behaves as app data store.

## 3. Folder Structure
- `README.md`: package entry point and inventory summary.
- `List-Map.md`: cross-list relationships, key matching, and implementation cautions.
- `List-Extraction-Rules.md`: extraction and maintenance discipline.
- `lists/`: one markdown schema report per included list (stable slug filenames).

## 4. Extraction Method Summary
- Reused existing repo extractor: `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1` for site inventory and baseline list schemas.
- Ran supplemental read-only extraction (`Get-PnPList`, `Get-PnPField`, `Get-PnPContentType`) for metadata not emitted by baseline outputs (defaults, formulas, lookup details, forms context, etc.).
- Auth/runtime: delegated device-code login with tenant-approved app registration.
- Repo script modifications: none. Supplemental helper executed from `/private/tmp` only.
- Limitations: custom form binding cannot be conclusively proven from URL patterns alone; app-level consumers still need query-contract validation.

## 5. HBCentral List Inventory Summary

| List Title | Type | Hidden | Item Count | Detailed Report | Notes |
|---|---|---|---:|---|---|
| _catalogs/hubsite | document library | true | 1 | No | Library inventoried only |
| Access Requests | hidden/system | true | 4 | No | Inventory-only |
| appdata | hidden/system | true | 0 | No | Inventory-only |
| appfiles | hidden/system | true | 0 | No | Inventory-only |
| Bids | business/custom | false | 1 | Yes | Implementation-relevant |
| Composed Looks | hidden/system | true | 18 | No | Inventory-only |
| ConnectionsConfiguration-4ce1892f-76d2-4393-b9df-079a66a95c4a | hidden/system | true | 1 | No | Inventory-only |
| Converted Forms | document library | true | 0 | No | Library inventoried only |
| Documents | document library | false | 6 | No | Library inventoried only |
| Events | system/OOB | false | 0 | No | Inventory-only |
| Form Templates | document library | false | 0 | No | Library inventoried only |
| HB Article Destination Pages | business/custom | false | 0 | Yes | Implementation-relevant |
| HB Article Media | business/custom | false | 0 | Yes | Implementation-relevant |
| HB Article Promotion Rules | business/custom | false | 0 | Yes | Implementation-relevant |
| HB Article Publishing Errors | business/custom | false | 0 | Yes | Implementation-relevant |
| HB Article Team Members | business/custom | false | 0 | Yes | Implementation-relevant |
| HB Article Template Registry | business/custom | false | 0 | Yes | Implementation-relevant |
| HB Article Workflow History | business/custom | false | 0 | Yes | Implementation-relevant |
| HB Articles | business/custom | false | 0 | Yes | Implementation-relevant |
| Hero Banner Config | business/custom | false | 0 | Yes | Implementation-relevant |
| Priority Actions Band Config | business/custom | false | 1 | Yes | Phase-01 command-band provisioning |
| Priority Actions Band Items | business/custom | false | 0 | Yes | Phase-01 command-band provisioning |
| Homepage Project Spotlights | business/custom | false | 2 | Yes | Implementation-relevant |
| Kudos Audit Events | business/custom | false | 15 | Yes | Implementation-relevant |
| List Template Gallery | hidden/system | true | 0 | No | Inventory-only |
| Maintenance Log Library | hidden/system | true | 2 | No | Inventory-only |
| Master Page Gallery | hidden/system | true | 175 | No | Inventory-only |
| People Culture Announcements | business/custom | false | 1 | Yes | Implementation-relevant |
| People Culture Celebrations | business/custom | false | 1 | Yes | Implementation-relevant |
| People Culture Kudos | business/custom | false | 5 | Yes | Implementation-relevant |
| Preservation Hold Library | hidden/system | true | 18 | No | Inventory-only |
| Project Media library | document library | false | 30 | No | Library inventoried only |
| Projects | business/custom | false | 4 | Yes | Implementation-relevant |
| projectViewerGroups | business/custom | false | 2 | Yes | Implementation-relevant |
| Site Assets | document library | false | 106 | No | Library inventoried only |
| Site Pages | document library | false | 10 | No | Library inventoried only |
| Solution Gallery | hidden/system | true | 0 | No | Inventory-only |
| Style Library | document library | false | 0 | No | Library inventoried only |
| TaxonomyHiddenList | system/OOB | false | 7 | Yes | Implementation-relevant |
| Theme Gallery | hidden/system | true | 65 | No | Inventory-only |
| Tool Launcher Contents | business/custom | false | 9 | Yes | Implementation-relevant |
| User Information List | hidden/system | true | 55 | Yes | Implementation-relevant |
| Web Part Gallery | hidden/system | true | 7 | No | Inventory-only |
| Web Template Extensions | hidden/system | true | 190 | No | Inventory-only |

## 6. How to Use These Reports
- Developers/agents should start with `List-Map.md` before implementing joins, filters, routing, or provisioning logic.
- Use per-list reports in `lists/` for internal names and field-level behavior; do not rely on display names only.
- Treat these files as cached tenant truth; if drift is suspected, re-extract and refresh this package.
- Tenant runtime truth overrides stale assumptions in docs/code.

## 7. Phase-01 Command-Band Additions
- New list docs:
  - `lists/priority-actions-band-config.md`
  - `lists/priority-actions-band-items.md`
- Provisioning/seeding provenance:
  - local runner package: `tools/pnp-runner-local/`
  - action keys:
    - `sharepoint-control:provisioning:priority-actions-band-lists`
    - `sharepoint-control:provisioning:priority-actions-band-seed-items`
    - `sharepoint-control:provisioning:priority-actions-band-provision-and-seed`
- Source intent for initial seed:
  - homepage Quick Links on `SitePages/HBCentral.aspx` (target seam documented in phase-01 prompt artifacts).

## 8. Maintenance Requirements
- Refresh when new app work depends on HBCentral schema or after provisioning changes.
- Update `README.md`, `List-Map.md`, and affected per-list files together on material drift.
- Material drift events include added/removed fields, changed internal names/types, changed forms/content types, or changed list relationships.
