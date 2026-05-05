# PCC SharePoint List Schema Package

This package contains a complete repo-truth-derived draft of the required SharePoint list schemas for the Project Control Center (PCC).

## Structure

- `pcc/List-Map.md` — authoritative PCC list inventory map.
- `pcc/lists/*.md` — one schema file per required PCC list.
- `pcc/Field-Type-Standards.md` — field typing, indexing, attachment, and permission guidance.
- `pcc/Read-Model-Only-Exclusions.md` — items that should remain derived/read-model-only, not SharePoint lists.
- `List-Map.md` — crosswalk from existing HBCentral schema families into PCC storage.
- `Web-Research-Notes.md` — external Microsoft/PnP research baseline.

## Important Status Note

This is an audit-generated implementation package. It is intentionally explicit about all required lists and fields. Final implementation should still validate internal names, field IDs, content types, and provisioning scripts against the live tenant and repo branch before deployment.


## Reformat Pass

Reformatted 110 PCC list schema files to match the tenant-backed `Projects` schema/reference format:

1. Objective
2. List-Level Metadata
3. Field Schema
4. Content Types / Forms / Behavioral Context
5. Relationship Observations
6. Implementation-Relevant Findings
7. Open Questions / Follow-Up Checks

Tenant-extracted values that are not currently available are intentionally left blank.
