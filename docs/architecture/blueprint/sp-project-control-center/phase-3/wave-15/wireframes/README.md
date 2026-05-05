# Wave 15 Wireframes — External Systems Launch Pad

## Purpose

Canonical wireframe index for Prompt 05/05R UX-state-workflow documentation.

## Doctrine and Standards Inheritance

These wireframes are developer-ready UX specifications, not final pixel-perfect visual designs. They inherit existing repository SPFx/UI-kit doctrine and standards and do not create a feature-local UX doctrine.

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Surface-Quality-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md`
- `docs/reference/ui-kit/patterns/SPFx-Command-Center-Dashboard-Patterns.md`
- `docs/reference/ui-kit/patterns/SPFx-Widget-and-Bento-Layout-Patterns.md`
- `docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md`

## Boundary Conditions

- UX/wireframe specification only.
- Not runtime implementation guidance.
- Not authorization for SharePoint or external writes.
- Not a manifest/package/lockfile/tenant change vehicle.

## Workflow and State Map

| Wireframe file                       | Workflow stage           | State emphasis                                              |
| ------------------------------------ | ------------------------ | ----------------------------------------------------------- |
| `01_launch_pad_home.md`              | Launch Pad overview      | loading, empty, blocked, stale, degraded                    |
| `02_project_launch_links.md`         | Project link list        | empty, loading, unauthorized, blocked, stale, degraded      |
| `03_add_edit_project_link_drawer.md` | Add/edit workflow drawer | draft, validation error, blocked-by-policy, stale reference |
| `04_custom_link_review_queue.md`     | Review queue             | submitted, stale, blocked, unauthorized, degraded           |
| `05_external_system_registry.md`     | Registry visibility      | available, empty, unavailable, degraded                     |
| `06_mapping_source_health.md`        | Mapping/source health    | healthy, stale, blocked, degraded                           |
| `07_mapping_review_detail.md`        | Mapping review detail    | open, resolved, blocked, stale, degraded                    |
| `08_audit_history.md`                | Audit timeline           | loading, empty, redacted, unavailable, unauthorized         |
| `09_hbi_source_lineage_panel.md`     | Source-lineage panel     | loading, citation-ready, refusal, unavailable               |

## Degraded-State Input

UX degraded-state treatment references `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_system_degraded_state_matrix.json` as a UX-state input and architecture boundary only.
