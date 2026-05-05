# Wave 15 Wireframes — External Systems Launch Pad

## Purpose

Canonical wireframe index for Prompt 05 UX/state/workflow documentation.

## Standards Alignment

These wireframes inherit existing repository SPFx/UI-kit standards and do not define a separate UX doctrine:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Surface-Quality-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md`
- `docs/reference/ui-kit/patterns/SPFx-Command-Center-Dashboard-Patterns.md`
- `docs/reference/ui-kit/patterns/SPFx-Widget-and-Bento-Layout-Patterns.md`
- `docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md`

## Workflow and State Map

| Wireframe                            | Workflow stage                 | Primary states covered                       |
| ------------------------------------ | ------------------------------ | -------------------------------------------- |
| `01_launch_pad_home.md`              | Launch Pad overview            | loading, empty, degraded summary             |
| `02_project_launch_links.md`         | project link listing           | empty, loading, unauthorized, blocked, stale |
| `03_add_edit_project_link_drawer.md` | add/edit link                  | draft, validation error, blocked-by-policy   |
| `04_custom_link_review_queue.md`     | review/approve queue           | submitted, approved, rejected, stale         |
| `05_external_system_registry.md`     | global registry visibility     | available, unavailable, degraded             |
| `06_mapping_source_health.md`        | mapping + source-health        | healthy, stale, degraded, blocked            |
| `07_mapping_review_detail.md`        | mapping correction review      | review-open, review-resolved, blocked        |
| `08_audit_history.md`                | audit/event history            | loading, populated, redacted, unavailable    |
| `09_hbi_source_lineage_panel.md`     | source-lineage assistant panel | citation-ready, refusal, unavailable         |

## Degraded-State Input

UX treatment references `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_system_degraded_state_matrix.json` as an architecture/state input only.

This index does not authorize runtime implementation behavior.
