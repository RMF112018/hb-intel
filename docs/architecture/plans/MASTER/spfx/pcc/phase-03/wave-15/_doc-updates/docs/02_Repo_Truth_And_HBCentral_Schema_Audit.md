# 02 — Repo Truth and HB Central Schema Audit

## Required Existing Schema References

- `docs/reference/sharepoint/list-schemas/hbcentral/README.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/List-Extraction-Rules.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projectviewergroups.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/tool-launcher-contents.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-platform-configuration-registry.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/user-information-list.md`

## Findings Incorporated

### Projects

The `Projects` list is the project identity anchor. It contains project ID, project number, site URL, PM/PX role UPNs, estimator fields, Sage access UPNs, Timberscan approver UPN, Procore hint, and location metadata. It does not have indexed custom fields or unique-enforced fields in the current schema snapshot.

Decision: use `Projects` for identity and role seed context only. Do not store project-level external link children in `Projects`.

### Tool Launcher Contents

The existing global launcher list provides useful semantic precedent: platform key, launch URL, audience visibility, support owner, open in new tab, active state, and review requirement. It is global/homepage-oriented and should not be overloaded for project-specific launch records.

Decision: reuse semantic patterns, not the list itself.

### HB Platform Configuration Registry

This existing list is the preferred model for non-secret global config. It already uses indexed application/environment/scope/config keys and enforces no-secret posture.

Decision: use it for platform-wide non-secret values and validation posture, while adding dedicated Wave 15 global lists for system definition and URL policy where more structured rows are required.
