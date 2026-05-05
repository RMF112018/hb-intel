# HBCentral to PCC List Schema Crosswalk

This file maps existing HBCentral list schema families to the PCC list schema package.

| Existing HBCentral Source | PCC Target List(s) | Mapping Posture | Notes |
|---|---|---|---|
| `../../hbcentral/lists/projects.md` | `../../pcc/lists/project-profile.md`, `../../pcc/lists/procore-project-mappings.md`, `../../pcc/lists/team-members.md` | Tenant-backed source seed | Project ID, project number, project name, site URL, PM/PX/estimating/accounting UPNs, and legacy Procore hint map into PCC project profile and mapping records. |
| `../../hbcentral/lists/project-viewer-groups.md` | `../../pcc/lists/access-assignments.md`, `../../pcc/lists/permission-requests.md` | Tenant-backed source seed | Viewer group defaults inform PCC access assignment posture. |
| `../../hbcentral/lists/tool-launcher-contents.md` | `../../pcc/lists/project-external-launch-links.md`, `../../pcc/lists/external-system-definitions.md`, `../../pcc/lists/external-url-policy-registry.md` | Pattern reuse | Existing launcher fields map to PCC External Systems Launch Pad behavior. |
| `../../hbcentral/lists/hb-platform-configuration-registry.md` | `../../pcc/lists/configuration-registry.md`, `../../pcc/lists/feature-flags.md`, `../../pcc/lists/module-flags.md` | Pattern reuse | Configuration scope/key/value patterns map directly. |
| `../../hbcentral/lists/priority-actions-band-config.md` | `../../pcc/lists/priority-action-sources.md` | Pattern reuse | Config/source posture informs PCC priority-action generation. |
| `../../hbcentral/lists/priority-actions-band-items.md` | `../../pcc/lists/priority-action-candidates.md`, `../../pcc/lists/priority-action-suppressions.md` | Pattern reuse | Item, suppression, and display patterns map to PCC priority actions. |
| `../../hbcentral/lists/safety-*` | `../../pcc/lists/readiness-items.md`, `../../pcc/lists/document-references.md`, `../../pcc/lists/business-audit-events.md` | Semantic lineage only | Safety records inform evidence/readiness patterns but are not copied into PCC storage by default. |
| `../../hbcentral/lists/foleon-*` | No direct PCC operational list | Mostly no mapping | Foleon remains content/placement domain; use only content registry and sync-run design patterns if needed. |
