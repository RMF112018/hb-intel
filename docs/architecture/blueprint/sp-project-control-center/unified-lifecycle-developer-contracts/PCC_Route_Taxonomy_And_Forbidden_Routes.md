# PCC Route Taxonomy And Forbidden Routes

## Purpose

Lock the approved route taxonomy so unified lifecycle features do not become disconnected departmental workspaces.

## Approved Shell Routes

- `project-home`
- `team-and-access`
- `documents`
- `project-readiness`
- `approvals`
- `external-systems`
- `control-center-settings`
- `site-health`

## Approved Backend Read-Model Route Families

- `/api/pcc/projects/{projectId}/profile`
- `/api/pcc/projects/{projectId}/modules`
- `/api/pcc/projects/{projectId}/home`
- `/api/pcc/projects/{projectId}/priority-actions`
- `/api/pcc/projects/{projectId}/document-control`
- `/api/pcc/projects/{projectId}/external-links`
- `/api/pcc/projects/{projectId}/site-health`
- `/api/pcc/projects/{projectId}/team-access`
- `/api/pcc/projects/{projectId}/project-readiness`
- `/api/pcc/projects/{projectId}/lifecycle-readiness`
- `/api/pcc/projects/{projectId}/permit-inspection-control-center`
- `/api/pcc/projects/{projectId}/responsibility-matrix`
- `/api/pcc/projects/{projectId}/constraints-log`
- `/api/pcc/projects/{projectId}/unified-lifecycle`
- `/api/pcc/projects/{projectId}/project-memory`
- `/api/pcc/projects/{projectId}/project-lenses`
- `/api/pcc/projects/{projectId}/project-traceability`
- `/api/pcc/projects/{projectId}/warranty-trace`
- `/api/pcc/projects/{projectId}/cross-project-knowledge`
- `/api/pcc/projects/{projectId}/unified-search`

## Forbidden Shell Routes / Workspace IDs

- `estimating-workspace`
- `preconstruction-workspace`
- `operations-workspace`
- `project-controls-workspace`
- `accounting-workspace`
- `closeout-workspace`
- `warranty-workspace`
- `executive-oversight-workspace`
- `it-admin-workspace`
- `ask-hbi`
- `hbi-search`
- `unified-search-workspace`
- `lifecycle-timeline`
- `traceability-graph`
- `closed-project-references`
- `warranty-trace-workspace`
- `cross-project-knowledge-workspace`

## Rules

- Unified lifecycle, memory, traceability, warranty, cross-project knowledge, and unified search are read-model route families, not shell routes.
- Ask-HBI may appear inside Project Home or approved surfaces; it must not become a standalone shell workspace in this package.
- Future route additions require updated route taxonomy, tests, and architecture approval.
- Tests must scan `PccSurfaceRouter.tsx`, surface registries, route constants, and shell markers for forbidden route IDs.

## Reference JSON

Use `reference/route_taxonomy_and_forbidden_routes.json` as machine-readable source.
